/* ============================================================
   NGS 可视化 — 动态数据生成引擎 v2
   支持：参考序列长度 / 读段长度 / 测序深度 / K-mer大小 实时调节
   ============================================================ */

const BASE_COLOR = { 'A':'#3fb950','T':'#f85149','C':'#388bfd','G':'#d29922' };
const COMPLEMENT  = { 'A':'T','T':'A','C':'G','G':'C' };
const BASES       = ['A','T','C','G'];

// ─── 用户可调参数 ────────────────────────────────────────────
let CFG = {
  dnaLen:   40,   // 参考序列长度（30–70 bp）
  readLen:  15,   // 读段长度（8–20 bp）
  coverage:  5,   // 目标测序深度（3–12 ×）
  kmerK:     5,   // K-mer 种子大小（3–7）
  errRate: 0.04,  // 每个碱基的测序错误率
};

// ─── 全局动态数据（generateData() 后有效）──────────────────
let REF          = '';
let SNP_POS      = -1;
let SNP_REF_BASE = '';
let SNP_ALT_BASE = '';
let READS        = [];
let KMER_INDEX   = {};      // { kmer: [pos0, pos1, ...] }
let SBS_TEMPLATE = '';
let SBS_GROWING  = [];
let SIGNAL_DATA  = [];

// ─── 确定性伪随机数（基于参数，保证同参数同结果）──────────
let _rng = 0;
function rngStep() {
  // xorshift32
  _rng ^= _rng << 13;
  _rng ^= _rng >> 17;
  _rng ^= _rng << 5;
  return (_rng >>> 0);
}
function randF()      { return rngStep() / 0x100000000; }
function randInt(a,b) { return a + (rngStep() % Math.max(1, b-a)); }
function randBase()   { return BASES[rngStep() % 4]; }
function altBase(b)   { const o = BASES.filter(x=>x!==b); return o[rngStep()%3]; }

// ─── DNA 随机生成 ────────────────────────────────────────────
function generateRandomDNA(len) {
  let s = '';
  for (let i = 0; i < len; i++) s += randBase();
  return s;
}

// ─── Phred 质量分数（确定性） ─────────────────────────────────
function genQual(readId, pos) {
  return 18 + ((readId * 17 + pos * 31 + 7) % 23);
}

// ─── K-mer 正向索引 ─────────────────────────────────────────
function buildKmerIndex(ref, k) {
  const idx = {};
  for (let i = 0; i <= ref.length - k; i++) {
    const km = ref.slice(i, i + k);
    if (!idx[km]) idx[km] = [];
    idx[km].push(i);
  }
  return idx;
}

// ─── 种子命中查找 ────────────────────────────────────────────
//   从 readSeq 中按步长 (k-2) 提取 K-mer，在全局 KMER_INDEX 中查询
//   返回每次命中的 { readOffset, refPos, km, impliedStart }
function findSeedHits(readSeq, k) {
  const stride = Math.max(1, k - 2);
  const hits   = [];
  for (let i = 0; i + k <= readSeq.length; i += stride) {
    const km  = readSeq.slice(i, i + k);
    const pos = KMER_INDEX[km] || [];
    pos.forEach(refPos => {
      const s = refPos - i;
      if (s >= 0 && s + readSeq.length <= REF.length) {
        hits.push({ readOffset: i, refPos, km, impliedStart: s });
      }
    });
  }
  return hits;
}

// ─── 位置投票 ────────────────────────────────────────────────
//   汇总每个 impliedStart 获得的票数
function voteAlignment(hits) {
  const votes = {};
  hits.forEach(h => {
    votes[h.impliedStart] = (votes[h.impliedStart] || 0) + 1;
  });
  return votes;      // { startPos: count }
}

// ─── 比对评分（简化 Smith-Waterman）────────────────────────
//   match: +1    mismatch: -2
function scoreAlignment(readSeq, startPos) {
  let matches = 0, mismatches = 0;
  for (let i = 0; i < readSeq.length; i++) {
    if (startPos + i >= REF.length) break;
    REF[startPos + i] === readSeq[i] ? matches++ : mismatches++;
  }
  return { matches, mismatches, score: matches - mismatches * 2 };
}

// ─── 单条 Read 完整比对流程 ──────────────────────────────────
function alignOneRead(read) {
  const hits  = findSeedHits(read.seq, CFG.kmerK);
  const votes = voteAlignment(hits);
  let bestStart = read.start, bestVotes = 0;
  Object.entries(votes).forEach(([s, v]) => {
    if (+v > bestVotes) { bestVotes = +v; bestStart = +s; }
  });
  return { alignedStart: bestStart, hits, votes, ...scoreAlignment(read.seq, bestStart) };
}

// ─── 读段生成 ────────────────────────────────────────────────
function makeReadDyn(id, start) {
  const bases = REF.slice(start, start + CFG.readLen).split('');
  // SNP 注入：覆盖 SNP 位置的 read 有 60% 概率携带变异等位基因
  if (SNP_POS >= start && SNP_POS < start + CFG.readLen) {
    if (randF() < 0.60) bases[SNP_POS - start] = SNP_ALT_BASE;
  }
  // 随机测序错误
  bases.forEach((_, i) => {
    if (randF() < CFG.errRate) bases[i] = altBase(bases[i]);
  });
  const seq  = bases.join('');
  const qual = bases.map((_, i) => genQual(id, i));
  return { id, start, seq, qual, len: seq.length };
}

// ─── 主生成函数（唯一入口）──────────────────────────────────
function generateData(newCfg) {
  if (newCfg) Object.assign(CFG, newCfg);

  // 基于参数的可重现种子（确保同参数同结果）
  _rng = ((CFG.dnaLen * 6271) ^ (CFG.readLen * 3911) ^ (CFG.coverage * 1597) ^ (CFG.kmerK * 797)) | 0;
  if (_rng === 0) _rng = 0xdeadbeef;

  // 1. 生成参考序列
  REF          = generateRandomDNA(CFG.dnaLen);
  SNP_POS      = Math.floor(CFG.dnaLen * 0.58);
  SNP_REF_BASE = REF[SNP_POS];
  SNP_ALT_BASE = altBase(SNP_REF_BASE);

  // 2. 构建 K-mer 索引（步骤5需要）
  KMER_INDEX = buildKmerIndex(REF, CFG.kmerK);

  // 3. 生成测序读段
  const numReads = Math.max(4, Math.round(CFG.dnaLen * CFG.coverage / CFG.readLen));
  READS = [];
  for (let i = 0; i < numReads; i++) {
    const maxStart = Math.max(0, CFG.dnaLen - CFG.readLen);
    READS.push(makeReadDyn(i + 1, randInt(0, maxStart + 1)));
  }
  READS.sort((a, b) => a.start - b.start);
  READS.forEach((r, i) => r.id = i + 1);

  // 4. SBS 演示数据（步骤3）
  SBS_TEMPLATE = REF.slice(0, Math.min(12, CFG.dnaLen));
  SBS_GROWING  = SBS_TEMPLATE.split('').map(b => COMPLEMENT[b]);

  // 5. 荧光信号数据（步骤4）
  SIGNAL_DATA = SBS_GROWING.slice(0, 8).map((base, pos) => {
    const noise = (pos * 7 + 3) % 15;
    const s = {
      A: 5 + noise % 8,
      T: 5 + (noise + 3) % 8,
      C: 5 + (noise + 5) % 8,
      G: 5 + (noise + 2) % 8,
    };
    s[base] = 85 + (pos * 3) % 12;
    return { base, signals: s };
  });
}

// 初次生成（使用默认参数）
generateData();
