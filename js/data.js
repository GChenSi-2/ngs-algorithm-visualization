/* ============================================================
   NGS Mock 数据
   参考基因组: 39bp 模拟序列
   测序读段:   9条 15bp reads，覆盖整个参考
   SNP位点:    第25位（1-based），G→A 变异
   ============================================================ */

// 碱基颜色
const BASE_COLOR = {
  'A': '#3fb950',
  'T': '#f85149',
  'C': '#388bfd',
  'G': '#d29922'
};

// 互补碱基
const COMPLEMENT = { 'A':'T', 'T':'A', 'C':'G', 'G':'C' };

// 参考序列（39bp）
const REF = 'ATCGAACGTTACGGATCGATCGATGAATCGATCGATCGA';
//           0         1         2         3
//           0123456789012345678901234567890123456789

// SNP位置信息（0-based索引）
const SNP_POS = 24;   // REF[24] = 'G'
const SNP_REF = 'G';
const SNP_ALT = 'A';

// 生成伪随机质量分数（确定性，便于演示）
function genQual(readId, pos) {
  const v = (readId * 17 + pos * 31 + 7) % 23;
  return 18 + v; // Q18~Q40
}

// 根据参考序列生成一条read（可附加突变）
function makeRead(id, start, len, muts = []) {
  const bases = REF.slice(start, start + len).split('');
  muts.forEach(([relPos, alt]) => { bases[relPos] = alt; });
  const seq = bases.join('');
  const qual = bases.map((_, i) => genQual(id, i));
  return { id, start, seq, qual, len: seq.length, muts };
}

// 9条测序读段
const READS = [
  makeRead(1,  0, 15),                       // 覆盖位置  0-14，完美比对
  makeRead(2,  4, 15),                       // 覆盖位置  4-18，完美比对
  makeRead(3,  8, 15, [[2, 'C']]),           // 覆盖位置  8-22，位置10处测序错误
  makeRead(4, 13, 15),                       // 覆盖位置 13-27，完美比对
  makeRead(5, 17, 15),                       // 覆盖位置 17-31，包含SNP(pos24)，参考等位G
  makeRead(6, 19, 15, [[SNP_POS-19, SNP_ALT]]), // 覆盖位置 19-33，SNP G→A
  makeRead(7, 21, 15, [[SNP_POS-21, SNP_ALT]]), // 覆盖位置 21-35，SNP G→A
  makeRead(8, 23, 15, [[SNP_POS-23, SNP_ALT]]), // 覆盖位置 23-37，SNP G→A
  makeRead(9, 24, 15),                       // 覆盖位置 24-38，完美比对（参考G）
];

// 步骤3：SBS测序演示用模板（取参考序列前12bp）
const SBS_TEMPLATE = REF.slice(0, 12); // "ATCGAACGTTAC"
// 合成链（互补）：T A G C T T G C A A T G
const SBS_GROWING = SBS_TEMPLATE.split('').map(b => COMPLEMENT[b]);

// 步骤4：模拟荧光强度数据（用于base calling演示）
// 每个位置4种荧光通道的强度：[A, T, C, G]
const SIGNAL_DATA = SBS_GROWING.slice(0, 8).map((base, pos) => {
  const noise = (pos * 7 + 3) % 15;
  const s = { A: 5 + noise % 8, T: 5 + (noise+3) % 8, C: 5 + (noise+5) % 8, G: 5 + (noise+2) % 8 };
  s[base] = 85 + (pos * 3) % 12; // 正确碱基的信号远高于背景
  return { base, signals: s };
});
