/* ============================================================
   NGS 可视化 — 国际化 (i18n) 模块
   支持中文 (zh) / 英文 (en) 切换
   ============================================================ */

let LANG = localStorage.getItem('ngs-lang') || 'zh';

const I18N = {
  // ── 页面标题 & Header ──────────────────────────────────────
  'page.title': {
    zh: '二代基因组测序算法可视化',
    en: 'NGS Algorithm Visualization'
  },
  'header.title': {
    zh: '二代基因组测序（NGS）算法可视化',
    en: 'Next-Generation Sequencing (NGS) Algorithm Visualization'
  },
  'header.subtitle': {
    zh: '从样本DNA到基因变异报告——Illumina测序全流程交互式学习',
    en: 'From DNA sample to variant report — Interactive Illumina sequencing workflow'
  },
  'header.badge': {
    zh: 'mock数据演示',
    en: 'Mock Data Demo'
  },
  'header.doc': {
    zh: '📄 技术文档',
    en: '📄 Docs'
  },

  // ── 配置面板 ──────────────────────────────────────────────
  'cfg.refLen': {
    zh: '参考序列长度',
    en: 'Ref. Length'
  },
  'cfg.readLen': {
    zh: '读段长度',
    en: 'Read Length'
  },
  'cfg.depth': {
    zh: '测序深度',
    en: 'Coverage'
  },
  'cfg.kmer': {
    zh: 'K-mer 大小',
    en: 'K-mer Size'
  },
  'cfg.generate': {
    zh: '🎲 重新生成',
    en: '🎲 Regenerate'
  },

  // ── 控制按钮 ──────────────────────────────────────────────
  'ctrl.prev': {
    zh: '◀ 上一步',
    en: '◀ Prev'
  },
  'ctrl.next': {
    zh: '下一步 ▶',
    en: 'Next ▶'
  },
  'ctrl.rewind': {
    zh: '⏮ 回退',
    en: '⏮ Back'
  },
  'ctrl.play': {
    zh: '▶ 播放',
    en: '▶ Play'
  },
  'ctrl.pause': {
    zh: '⏸ 暂停',
    en: '⏸ Pause'
  },
  'ctrl.forward': {
    zh: '前进 ⏭',
    en: 'Fwd ⏭'
  },

  // ── 理论面板 ──────────────────────────────────────────────
  'theory.title': {
    zh: '原理讲解',
    en: 'Theory'
  },

  // ── 步骤标题 & 描述 ───────────────────────────────────────
  'step1.title': {
    zh: '步骤 1：DNA 提取与片段化（Fragmentation）',
    en: 'Step 1: DNA Extraction & Fragmentation'
  },
  'step1.desc': {
    zh: '用超声波或酶将基因组DNA随机打断成短小片段',
    en: 'Randomly shear genomic DNA into short fragments using sonication or enzymes'
  },
  'step1.nav': {
    zh: 'DNA 提取与片段化（Fragmentation）',
    en: 'DNA Extraction & Fragmentation'
  },
  'step2.title': {
    zh: '步骤 2：文库构建（Library Construction）',
    en: 'Step 2: Library Construction'
  },
  'step2.desc': {
    zh: '在DNA片段两端连接标准化接头序列（Adapter），使其能在测序仪上锚定和扩增',
    en: 'Ligate standardized adapter sequences to both ends of DNA fragments for anchoring and amplification'
  },
  'step2.nav': {
    zh: '文库构建（Library Construction）',
    en: 'Library Construction'
  },
  'step3.title': {
    zh: '步骤 3：边合成边测序（Sequencing by Synthesis, SBS）',
    en: 'Step 3: Sequencing by Synthesis (SBS)'
  },
  'step3.desc': {
    zh: '每次掺入一个荧光标记核苷酸并拍照记录，逐碱基读取序列',
    en: 'Incorporate one fluorescently-labeled nucleotide per cycle and image to read the sequence base by base'
  },
  'step3.nav': {
    zh: '边合成边测序（SBS）',
    en: 'Sequencing by Synthesis (SBS)'
  },
  'step4.title': {
    zh: '步骤 4：碱基识别与质量控制（Base Calling & QC）',
    en: 'Step 4: Base Calling & Quality Control'
  },
  'step4.desc': {
    zh: '分析荧光信号强度，识别碱基，用Phred质量分数评估可信度，输出FASTQ文件',
    en: 'Analyze fluorescence intensity, identify bases, assess confidence with Phred quality scores, output FASTQ'
  },
  'step4.nav': {
    zh: '碱基识别与质量控制（Base Calling & QC）',
    en: 'Base Calling & QC'
  },
  'step5.title': {
    zh: '步骤 5：序列比对（Read Alignment）',
    en: 'Step 5: Read Alignment'
  },
  'step5.desc': {
    zh: '用K-mer种子投票 + Smith-Waterman评分将每条Read定位到参考基因组，构建Pileup图',
    en: 'Map each read to the reference genome using K-mer seed voting + Smith-Waterman scoring, build Pileup'
  },
  'step5.nav': {
    zh: '序列比对（Read Alignment）',
    en: 'Read Alignment'
  },
  'step6.title': {
    zh: '步骤 6：变异识别（Variant Calling）',
    en: 'Step 6: Variant Calling'
  },
  'step6.desc': {
    zh: '分析Pileup中各位置碱基组成，用贝叶斯统计识别真实遗传变异（SNP/Indel），输出VCF',
    en: 'Analyze base composition at each Pileup position, identify true variants (SNP/Indel) via Bayesian statistics, output VCF'
  },
  'step6.nav': {
    zh: '变异识别（Variant Calling）',
    en: 'Variant Calling'
  },

  // ── Step 1 substep labels ─────────────────────────────────
  'step1.sub0': {
    zh: '初始状态：基因组DNA（双链）',
    en: 'Initial: Genomic DNA (double-stranded)'
  },
  'step1.sub1': {
    zh: '超声波破碎施加机械剪切力',
    en: 'Sonication applies mechanical shearing force'
  },
  'step1.sub2': {
    zh: 'DNA链在随机位点断裂',
    en: 'DNA strands break at random sites'
  },
  'step1.sub3': {
    zh: '片段化完成！共4个片段',
    en: 'Fragmentation complete! 4 fragments'
  },

  // ── Step 2 substep labels ─────────────────────────────────
  'step2.sub0': {
    zh: '取出一个DNA片段',
    en: 'Select a DNA fragment'
  },
  'step2.sub1': {
    zh: '末端修复：将末端补成平末端',
    en: 'End Repair: blunt-end the fragment'
  },
  'step2.sub2': {
    zh: '3\'末端加A尾（A-Tailing）',
    en: '3\' A-Tailing'
  },
  'step2.sub3': {
    zh: '接头连接完成！文库构建成功',
    en: 'Adapter ligation complete! Library ready'
  },

  // ── Step 3 substep labels ─────────────────────────────────
  'step3.sub0': {
    zh: '文库片段固定，测序引物就位',
    en: 'Library fragment immobilized, primer in place'
  },
  'step3.sub1': {
    zh: '第1~2循环：掺入互补碱基',
    en: 'Cycles 1-2: incorporate complementary bases'
  },
  'step3.sub2': {
    zh: '第3~4循环：继续合成',
    en: 'Cycles 3-4: continue synthesis'
  },
  'step3.sub3': {
    zh: '第5~6循环：继续合成',
    en: 'Cycles 5-6: continue synthesis'
  },
  'step3.sub4': {
    zh: '第7~8循环：继续合成',
    en: 'Cycles 7-8: continue synthesis'
  },
  'step3.sub5': {
    zh: '8个循环完成！获得Read序列',
    en: '8 cycles done! Read sequence obtained'
  },

  // ── Step 4 substep labels ─────────────────────────────────
  'step4.sub0': {
    zh: '原始荧光强度信号（4通道）',
    en: 'Raw fluorescence intensity (4 channels)'
  },
  'step4.sub1': {
    zh: '碱基识别：选取最高强度通道',
    en: 'Base calling: select highest intensity channel'
  },
  'step4.sub2': {
    zh: '计算Phred质量分数（Q值）',
    en: 'Calculate Phred quality scores (Q-value)'
  },
  'step4.sub3': {
    zh: '输出FASTQ格式文件',
    en: 'Output FASTQ file'
  },

  // ── Step 5 substep labels ─────────────────────────────────
  'step5.sub0': {
    zh: '① 构建K-mer索引：扫描参考序列，建立位置哈希表',
    en: '① Build K-mer index: scan reference, create position hash table'
  },
  'step5.sub1': {
    zh: '② 种子提取：从Read 1抽取K-mer，查询索引中的命中位置',
    en: '② Seed extraction: extract K-mers from Read 1, query index hits'
  },
  'step5.sub2': {
    zh: '③ 位置投票：每个种子命中为候选起始位置投票',
    en: '③ Position voting: each seed hit votes for a candidate start position'
  },
  'step5.sub3': {
    zh: '④ 比对验证：对最优候选位置计算Smith-Waterman得分',
    en: '④ Alignment verification: compute Smith-Waterman score at best candidate'
  },
  'step5.sub4': {
    zh: '⑤ 逐步比对：前半条Reads依次定位到参考序列',
    en: '⑤ Progressive alignment: first half of reads mapped to reference'
  },
  'step5.sub5': {
    zh: '⑥ 完整Pileup：全部Reads比对完成，显示覆盖深度',
    en: '⑥ Full Pileup: all reads aligned, showing coverage depth'
  },

  // ── Step 6 substep labels ─────────────────────────────────
  'step6.sub0': {
    zh: '聚焦SNP候选位点（Pileup视图）',
    en: 'Focus on SNP candidate site (Pileup view)'
  },
  'step6.sub1': {
    zh: '统计各等位基因支持read数',
    en: 'Count supporting reads per allele'
  },
  'step6.sub2': {
    zh: '贝叶斯模型计算基因型概率',
    en: 'Bayesian model: genotype probability'
  },
  'step6.sub3': {
    zh: '✓ 变异识别完成！输出VCF报告',
    en: '✓ Variant calling complete! Output VCF report'
  },

  // ── Step 1 theory ─────────────────────────────────────────
  'step1.theory': {
    zh: `<div class="tsec"><h4>🔬 为什么要片段化？</h4><p>Illumina测序仪读长仅150~300 bp，基因组长达数十亿bp，必须先打碎。</p></div>
<div class="tsec"><h4>⚙️ 主要方法</h4><p><strong>超声波剪切：</strong>Covaris仪器产生高频声波，通过流体力学剪切随机断裂DNA。</p><p><strong>酶切法：</strong>限制性内切酶在识别序列处切割，重复性好但有位置偏好。</p></div>
<div class="hbox"><strong>目标片段大小：200–500 bp</strong><br>过短→信息量不足；过长→建库效率下降</div>
<div class="tsec"><h4>📊 本演示</h4><p>使用随机生成参考序列，演示4片段打断逻辑。</p></div>`,
    en: `<div class="tsec"><h4>🔬 Why Fragment?</h4><p>Illumina sequencers read only 150–300 bp, but genomes are billions of bp long — fragmentation is essential.</p></div>
<div class="tsec"><h4>⚙️ Main Methods</h4><p><strong>Sonication:</strong> Covaris instruments produce high-frequency sound waves that mechanically shear DNA randomly.</p><p><strong>Enzymatic:</strong> Restriction enzymes cut at recognition sites — reproducible but position-biased.</p></div>
<div class="hbox"><strong>Target fragment size: 200–500 bp</strong><br>Too short → insufficient information; Too long → reduced library efficiency</div>
<div class="tsec"><h4>📊 This Demo</h4><p>Uses a randomly generated reference sequence to demonstrate 4-fragment shearing logic.</p></div>`
  },
  'step2.theory': {
    zh: `<div class="tsec"><h4>🔗 接头的作用</h4><p>接头（Adapter）是人工合成的短DNA序列，包含：P5/P7流动池锚定序列、测序引物位点、样本Index。</p></div>
<div class="hbox">接头就像快递运单：无论内容物是什么，自动化系统都能识别处理。</div>
<div class="tsec"><h4>📋 建库步骤</h4><p>1. <strong>末端修复</strong>：T4聚合酶补平末端</p><p>2. <strong>A尾添加</strong>：Taq聚合酶在3'末端各加一个A</p><p>3. <strong>接头连接</strong>：T4连接酶封闭切口</p></div>`,
    en: `<div class="tsec"><h4>🔗 Role of Adapters</h4><p>Adapters are synthetic short DNA sequences containing: P5/P7 flow cell anchoring sequences, sequencing primer sites, and sample Index.</p></div>
<div class="hbox">Adapters are like shipping labels: regardless of the content, the automated system can identify and process them.</div>
<div class="tsec"><h4>📋 Library Prep Steps</h4><p>1. <strong>End Repair</strong>: T4 polymerase blunts the ends</p><p>2. <strong>A-Tailing</strong>: Taq polymerase adds an A to each 3' end</p><p>3. <strong>Adapter Ligation</strong>: T4 ligase seals the nicks</p></div>`
  },
  'step3.theory': {
    zh: `<div class="tsec"><h4>💡 SBS核心原理</h4><p>每次只掺入<strong>一个</strong>可逆终止型荧光核苷酸，成像后切除保护基，再进行下一循环。</p></div>
<div class="tsec"><h4>🔄 单个循环</h4><p>① 泵入4种荧光dNTP → ② 聚合酶掺入1个碱基 → ③ 冲洗 → ④ 激光激发荧光拍照 → ⑤ 切除3'保护基</p></div>
<div class="hbox"><span class="btag bA">A</span>绿 &nbsp;<span class="btag bT">T</span>红 &nbsp;<span class="btag bC">C</span>蓝 &nbsp;<span class="btag bG">G</span>黄</div>`,
    en: `<div class="tsec"><h4>💡 SBS Core Principle</h4><p>Only <strong>one</strong> reversible-terminator fluorescent nucleotide is incorporated per cycle, imaged, then the blocking group is cleaved for the next cycle.</p></div>
<div class="tsec"><h4>🔄 Single Cycle</h4><p>① Pump in 4 fluorescent dNTPs → ② Polymerase incorporates 1 base → ③ Wash → ④ Laser excites fluorescence, image → ⑤ Cleave 3' blocking group</p></div>
<div class="hbox"><span class="btag bA">A</span>Green &nbsp;<span class="btag bT">T</span>Red &nbsp;<span class="btag bC">C</span>Blue &nbsp;<span class="btag bG">G</span>Yellow</div>`
  },
  'step4.theory': {
    zh: `<div class="tsec"><h4>📊 Phred质量分数</h4><p>Q值量化碱基识别错误概率：</p><div class="code-box">Q = -10 × log₁₀(P_error)</div></div>
<div class="tsec"><h4>质量分级</h4><p>Q10→错误率10%（较差）&nbsp;|&nbsp; Q20→1%（合格）&nbsp;|&nbsp; Q30→0.1%（优良）✓</p></div>
<div class="tsec"><h4>📄 FASTQ格式</h4><div class="code-box">@Read_001
TAGCTTGCAA
+
IIHFIIGIIH</div><p style="font-size:11px">第4行ASCII字符减33即为Q值</p></div>`,
    en: `<div class="tsec"><h4>📊 Phred Quality Score</h4><p>Q-value quantifies base-calling error probability:</p><div class="code-box">Q = -10 × log₁₀(P_error)</div></div>
<div class="tsec"><h4>Quality Tiers</h4><p>Q10→10% error (poor)&nbsp;|&nbsp; Q20→1% (acceptable)&nbsp;|&nbsp; Q30→0.1% (good)✓</p></div>
<div class="tsec"><h4>📄 FASTQ Format</h4><div class="code-box">@Read_001
TAGCTTGCAA
+
IIHFIIGIIH</div><p style="font-size:11px">Line 4 ASCII characters minus 33 = Q-value</p></div>`
  },
  'step5.theory': {
    zh: `<div class="tsec"><h4>🎯 种子投票策略（Seed-and-Vote）</h4><p>这是BWA/Bowtie2的核心思路的简化版，分4个阶段：</p>
<p>① <strong>索引构建</strong>：扫描参考序列，所有k-mer及其位置存入哈希表 O(|REF|)</p>
<p>② <strong>种子提取</strong>：从Read按步长取k-mer，在索引中瞬间查到候选位置</p>
<p>③ <strong>位置投票</strong>：每个命中的种子为其"隐含起始位置"（refPos-readOffset）投票</p>
<p>④ <strong>精确验证</strong>：对票数最高的候选，用简化Smith-Waterman逐碱基打分确认</p></div>
<div class="hbox"><strong>K-mer大小</strong><br>k越大→特异性高，漏比对多<br>k越小→命中多，假阳性多</div>
<div class="tsec"><h4>🔴 错配高亮</h4><p>红色边框=碱基与参考不一致（SNP或测序错误）</p></div>
<div class="tsec"><h4>📁 输出格式</h4><p><strong>SAM/BAM</strong>：比对位置、CIGAR串、比对质量（MAPQ）</p></div>`,
    en: `<div class="tsec"><h4>🎯 Seed-and-Vote Strategy</h4><p>A simplified version of BWA/Bowtie2's core approach, in 4 stages:</p>
<p>① <strong>Index Building</strong>: Scan reference, store all k-mers and their positions in a hash table O(|REF|)</p>
<p>② <strong>Seed Extraction</strong>: Extract k-mers from reads at stride, instantly find candidate positions in the index</p>
<p>③ <strong>Position Voting</strong>: Each seed hit votes for its "implied start position" (refPos - readOffset)</p>
<p>④ <strong>Exact Verification</strong>: Score the top-voted candidate with simplified Smith-Waterman base-by-base</p></div>
<div class="hbox"><strong>K-mer Size</strong><br>Larger k → higher specificity, more missed alignments<br>Smaller k → more hits, more false positives</div>
<div class="tsec"><h4>🔴 Mismatch Highlighting</h4><p>Red border = base differs from reference (SNP or sequencing error)</p></div>
<div class="tsec"><h4>📁 Output Format</h4><p><strong>SAM/BAM</strong>: alignment position, CIGAR string, mapping quality (MAPQ)</p></div>`
  },
  'step6.theory': {
    zh: `<div class="tsec"><h4>🧮 为何不直接看频率？</h4><p>测序错误干扰，需贝叶斯框架区分真实变异和噪音，综合考虑碱基质量、比对质量和先验概率。</p></div>
<div class="tsec"><h4>📐 贝叶斯基因型分型</h4><div class="code-box">P(GT|Data) ∝ P(Data|GT) × P(GT)</div><p>对每个位置计算三种基因型（0/0, 0/1, 1/1）的后验概率。</p></div>`,
    en: `<div class="tsec"><h4>🧮 Why Not Just Look at Frequency?</h4><p>Sequencing errors interfere — a Bayesian framework is needed to distinguish true variants from noise, considering base quality, alignment quality, and priors.</p></div>
<div class="tsec"><h4>📐 Bayesian Genotyping</h4><div class="code-box">P(GT|Data) ∝ P(Data|GT) × P(GT)</div><p>For each position, compute posterior probability of three genotypes (0/0, 0/1, 1/1).</p></div>`
  },

  // ── SVG 内部文本 (render functions) ────────────────────────
  // Step 1
  'svg.genome_dna': { zh: '基因组 DNA（双链，{0} bp）', en: 'Genomic DNA (double-stranded, {0} bp)' },
  'svg.sonication': { zh: '⚡  超声波剪切（Sonication）  ⚡', en: '⚡  Sonication  ⚡' },
  'svg.breaking': { zh: 'DNA链在随机位点断裂…', en: 'DNA strands breaking at random sites…' },
  'svg.frag_done': { zh: '片段化完成！共 4 个片段，准备进行文库构建', en: 'Fragmentation complete! 4 fragments, ready for library prep' },
  'svg.frag': { zh: '片段', en: 'Frag' },

  // Step 2
  'svg.take_frag': { zh: '取出第一个片段（片段1，10 bp）进行文库构建', en: 'Select fragment 1 (10 bp) for library construction' },
  'svg.rough_end': { zh: '⚠ 粗糙末端', en: '⚠ Rough ends' },
  'svg.end_repair': { zh: '末端修复（End Repair）', en: 'End Repair' },
  'svg.end_repair_desc': { zh: 'T4聚合酶+Klenow将末端补成平末端（Blunt End）', en: 'T4 polymerase + Klenow creates blunt ends' },
  'svg.blunt_end': { zh: '✓ 平末端', en: '✓ Blunt End' },
  'svg.a_tailing': { zh: 'A尾添加（A-Tailing）', en: 'A-Tailing' },
  'svg.a_tailing_desc': { zh: "Taq聚合酶在每条链3'末端添加腺嘌呤（A）", en: "Taq polymerase adds adenine (A) to each 3' end" },
  'svg.a_tail_label': { zh: "3'A尾", en: "3' A-tail" },
  'svg.adapter_done': { zh: '接头连接完成！文库片段结构', en: 'Adapter ligation complete! Library fragment structure' },
  'svg.adapter': { zh: '接头', en: 'Adapter' },
  'svg.lib_done': { zh: '✓ 文库片段构建完成，所有片段合并为"文库"（Library）', en: '✓ Library fragment complete — all fragments form the "Library"' },

  // Step 3
  'svg.template_fixed': { zh: '模板链固定在流动池上，测序引物（Primer）就位', en: 'Template strand fixed on flow cell, sequencing primer in place' },
  'svg.flow_cell': { zh: 'Illumina 流动池（Flow Cell）', en: 'Illumina Flow Cell' },
  'svg.primer': { zh: '引物', en: 'Primer' },
  'svg.cycles_done': { zh: '已完成 {0} 个循环，合成链逐步延伸', en: '{0} cycles completed, growing strand extending' },
  'svg.read_done': { zh: '✓ Read 序列读取完成！（前8个碱基）', en: '✓ Read sequence complete! (first 8 bases)' },

  // Step 4
  'svg.raw_signal': { zh: '原始荧光强度信号（4通道）', en: 'Raw Fluorescence Intensity (4 channels)' },
  'svg.signal_desc': { zh: '每个位置同时检测4种颜色的荧光强度', en: 'Detect fluorescence intensity of 4 colors at each position' },
  'svg.base_calling': { zh: '碱基识别（Base Calling）', en: 'Base Calling' },
  'svg.phred': { zh: 'Phred 质量分数（Q值）计算', en: 'Phred Quality Score (Q-value) Calculation' },
  'svg.fastq_output': { zh: '输出 FASTQ 格式文件', en: 'Output FASTQ File' },
  'svg.fastq_id': { zh: '① 序列ID行（@开头）', en: '① Sequence ID line (starts with @)' },
  'svg.fastq_seq': { zh: '② 碱基序列', en: '② Base sequence' },
  'svg.fastq_sep': { zh: '③ 分隔符', en: '③ Separator' },
  'svg.fastq_qual': { zh: '④ 质量分数（ASCII编码）', en: '④ Quality scores (ASCII encoding)' },
  'svg.ascii_example': { zh: "例：'I' (ASCII=73) → Q = 73−33 = 40", en: "e.g.: 'I' (ASCII=73) → Q = 73−33 = 40" },

  // Step 5
  'svg.ref': { zh: '参考', en: 'Ref' },
  'svg.kmer_index_title': { zh: '① 构建K-mer索引（k={0}）— 扫描参考序列所有{0}-mer，存入哈希表', en: '① Build K-mer Index (k={0}) — scan all {0}-mers in reference, store in hash table' },
  'svg.kmer_table': { zh: 'K-mer 索引表（共 {0} 个唯一K-mer）', en: 'K-mer Index Table ({0} unique K-mers)' },
  'svg.seed_extract': { zh: '② 种子提取 — 从 Read 1 中按步长抽取{0}-mer，在索引中查询命中位置', en: '② Seed Extraction — extract {0}-mers from Read 1, query index for hit positions' },
  'svg.seed_result': { zh: 'Read 1 共命中 {0} 次，涉及 {1} 个候选起始位置 → 进入位置投票', en: 'Read 1: {0} hits, {1} candidate start positions → proceed to voting' },
  'svg.voting': { zh: '③ 位置投票 — 每次种子命中为对应起始位置投一票，票数最多即为最优', en: '③ Position Voting — each seed hit casts one vote for its start position; most votes wins' },
  'svg.candidate_pos': { zh: '候选起始位置（1-based）vs 种子投票数', en: 'Candidate Start Position (1-based) vs Seed Votes' },
  'svg.best_pos': { zh: '✓ 最优起始位置：第 {0} 位（{1} 票）→ 进入精确比对验证', en: '✓ Best start position: #{0} ({1} votes) → proceed to alignment verification' },
  'svg.no_candidate': { zh: '当前参数下无有效候选位置，请降低K-mer大小', en: 'No valid candidates with current parameters — try reducing K-mer size' },
  'svg.align_verify': { zh: '④ 比对验证 — 在位置 {0} 逐碱基比对，计算简化Smith-Waterman得分', en: '④ Alignment Verification — base-by-base alignment at position {0}, simplified Smith-Waterman score' },
  'svg.match_stat': { zh: '匹配(+1) × {0}  +  错配(−2) × {1}', en: 'Match(+1) × {0}  +  Mismatch(−2) × {1}' },
  'svg.sw_score': { zh: 'Smith-Waterman 简化得分 = {0}', en: 'Simplified Smith-Waterman Score = {0}' },
  'svg.accept': { zh: '✓ 接受比对（得分 {0} > 阈值 0）', en: '✓ Accepted (score {0} > threshold 0)' },
  'svg.reject': { zh: '✗ 拒绝（得分 {0} ≤ 0）', en: '✗ Rejected (score {0} ≤ 0)' },
  'svg.full_pileup': { zh: '⑥ 完整Pileup — 全部 {0} 条Reads比对完成，SNP候选位点（位置 {1}）', en: '⑥ Full Pileup — all {0} reads aligned, SNP candidate site (pos {1})' },
  'svg.partial_pileup': { zh: '⑤ 逐步比对 — 前 {0}/{1} 条Reads已定位到参考序列', en: '⑤ Progressive Alignment — {0}/{1} reads mapped to reference' },
  'svg.more_reads': { zh: '…还有 {0} 条reads未显示', en: '…{0} more reads not shown' },
  'svg.depth': { zh: '深度', en: 'Depth' },
  'svg.avg_cov': { zh: '平均覆盖深度：{0}×  |  SNP位点（位置{1}）深度：{2}×', en: 'Avg coverage: {0}×  |  SNP site (pos {1}) depth: {2}×' },

  // Step 6
  'svg.snp_focus': { zh: '聚焦 SNP 候选位点：参考基因组第 {0} 位（参考碱基：{1}）', en: 'Focus on SNP Candidate: reference position {0} (ref base: {1})' },
  'svg.pileup_view': { zh: '显示覆盖该位点的所有Reads（Pileup视图）', en: 'Showing all reads covering this site (Pileup view)' },
  'svg.allele_stats': { zh: '统计各等位基因的支持reads数量', en: 'Count supporting reads per allele' },
  'svg.pos_stats': { zh: '位置{0} 碱基统计', en: 'Position {0} base statistics' },
  'svg.total_depth': { zh: '总深度：{0}×', en: 'Total depth: {0}×' },
  'svg.bayesian': { zh: '贝叶斯模型：计算各基因型后验概率', en: 'Bayesian Model: compute genotype posterior probabilities' },
  'svg.bayesian_formula': { zh: 'P(基因型 | 数据) ∝ P(数据 | 基因型) × P(基因型)', en: 'P(Genotype | Data) ∝ P(Data | Genotype) × P(Genotype)' },
  'svg.gt_homo_ref': { zh: '0/0（纯合参考 {0}{0}）', en: '0/0 (Homozygous Ref {0}{0})' },
  'svg.gt_het': { zh: '0/1（杂合 {0}{1}）', en: '0/1 (Heterozygous {0}{1})' },
  'svg.gt_homo_alt': { zh: '1/1（纯合变异 {0}{0}）', en: '1/1 (Homozygous Alt {0}{0})' },
  'svg.gt_homo_ref_desc': { zh: '假设样本纯合参考：观测到变异reads概率低', en: 'Assume homozygous ref: observing variant reads is unlikely' },
  'svg.gt_het_desc': { zh: '假设杂合：期望约50%变异，与观测最吻合', en: 'Assume heterozygous: ~50% variant expected, best fit with data' },
  'svg.gt_homo_alt_desc': { zh: '假设纯合变异：观测到参考reads概率低', en: 'Assume homozygous alt: observing ref reads is unlikely' },
  'svg.best_gt': { zh: '后验概率最高的基因型为 {0}，置信度 {1}%', en: 'Most probable genotype: {0}, confidence {1}%' },
  'svg.variant_done': { zh: '✓  变异识别完成！SNP 已报告', en: '✓  Variant Calling Complete! SNP Reported' },
  'svg.vcf_output': { zh: 'VCF 格式输出（Variant Call Format）', en: 'VCF Output (Variant Call Format)' },
  'svg.summary': { zh: '📋  分析总结', en: '📋  Analysis Summary' },
  'svg.snp_result': { zh: '参考基因组第{0}位发生 {1}→{2} 替换（SNP）', en: 'SNP at reference position {0}: {1}→{2} substitution' },
  'svg.snp_detail': { zh: '基因型：0/1（杂合）  |  VAF：{0}%  |  深度：{1}×  |  质量：Q60', en: 'Genotype: 0/1 (Het)  |  VAF: {0}%  |  Depth: {1}×  |  Quality: Q60' },

  // Step 6 theory dynamic parts
  'step6.theory.snp_info': {
    zh: 'SNP位置 {0}：参考碱基 {1}，变异等位 {2}<br>杂合变异 (0/1) 后验概率最高',
    en: 'SNP position {0}: ref base {1}, alt allele {2}<br>Heterozygous (0/1) has highest posterior probability'
  },

  // Language toggle
  'lang.toggle': { zh: 'EN', en: '中文' },
};

function t(key, ...args) {
  const entry = I18N[key];
  if (!entry) return key;
  let text = entry[LANG] || entry['zh'] || key;
  args.forEach((arg, i) => {
    text = text.replace(new RegExp('\\{' + i + '\\}', 'g'), arg);
  });
  return text;
}

function setLang(lang) {
  LANG = lang;
  localStorage.setItem('ngs-lang', lang);
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('page.title');
  updateStaticUI();
  if (typeof render === 'function') render();
}

function toggleLang() {
  setLang(LANG === 'zh' ? 'en' : 'zh');
}

function updateStaticUI() {
  // Header
  const h1 = document.querySelector('#header h1');
  if (h1) h1.textContent = t('header.title');
  const sub = document.querySelector('.subtitle');
  if (sub) sub.textContent = t('header.subtitle');
  const badge = document.querySelector('.header-badge');
  if (badge) badge.textContent = t('header.badge');
  const docLink = document.querySelector('.doc-link');
  if (docLink) docLink.textContent = t('header.doc');

  // Config panel labels
  const cfgLabels = document.querySelectorAll('.cfg-lbl');
  const cfgKeys = ['cfg.refLen', 'cfg.readLen', 'cfg.depth', 'cfg.kmer'];
  cfgLabels.forEach((el, i) => { if (cfgKeys[i]) el.textContent = t(cfgKeys[i]); });
  const genBtn = document.getElementById('btn-generate');
  if (genBtn) genBtn.textContent = t('cfg.generate');

  // Controls
  const prevBtn = document.getElementById('btn-prev');
  if (prevBtn) prevBtn.textContent = t('ctrl.prev');
  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) nextBtn.textContent = t('ctrl.next');
  const rewBtn = document.getElementById('btn-sub-prev');
  if (rewBtn) rewBtn.textContent = t('ctrl.rewind');
  const fwdBtn = document.getElementById('btn-sub-next');
  if (fwdBtn) fwdBtn.textContent = t('ctrl.forward');

  // Play button handled in updateButtons()

  // Theory panel title
  const theoryH3 = document.querySelector('.theory-hdr h3');
  if (theoryH3) theoryH3.textContent = t('theory.title');

  // Language toggle button
  const langBtn = document.getElementById('btn-lang');
  if (langBtn) langBtn.textContent = t('lang.toggle');
}
