/* ============================================================
   NGS 可视化主程序
   ============================================================ */

// ── SVG 工具函数 ────────────────────────────────────────────

function R(x,y,w,h,fill,rx=0,extra=''){
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}" ${extra}/>`;
}
function T(x,y,s,fill='#c9d1d9',size=13,anchor='middle',weight='normal',family='monospace',extra=''){
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" text-anchor="${anchor}" font-weight="${weight}" font-family="${family}" ${extra}>${s}</text>`;
}
function L(x1,y1,x2,y2,stroke='#30363d',w=1,extra=''){
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;
}
function C(cx,cy,r,fill,extra=''){
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`;
}
function P(d,fill='none',stroke='#888',w=1,extra=''){
  return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" ${extra}/>`;
}
function G(id,content,transform=''){
  return `<g id="${id}" transform="${transform}">${content}</g>`;
}
function anim(id,attr,from,to,dur,repeat='indefinite',extra=''){
  return `<animate attributeName="${attr}" values="${from};${to};${from}" dur="${dur}s" repeatCount="${repeat}" ${extra}/>`;
}

// 绘制单个碱基方块
function drawBase(x,y,base,bw=17,bh=22,showLabel=true){
  const c = BASE_COLOR[base] || '#555';
  let out = R(x,y,bw-1,bh,c,2);
  if(showLabel){
    const fs = bh < 18 ? 8 : (bh < 24 ? 10 : 12);
    out += T(x+bw/2-0.5, y+bh/2+fs/2-1, base,'#fff',fs,'middle','bold');
  }
  return out;
}

// 绘制一段序列
function drawSeq(x,y,seq,bw=17,bh=22,showLabels=true){
  return seq.split('').map((b,i)=>drawBase(x+i*bw,y,b,bw,bh,showLabels)).join('');
}

// Phred Q值转字符
function qChar(q){ return String.fromCharCode(q+33); }

// ── 步骤定义 ─────────────────────────────────────────────────

const STEPS = [
  {
    title:'步骤 1：DNA 提取与片段化（Fragmentation）',
    desc:'用超声波或酶将基因组DNA随机打断成200-500 bp的短小片段，以适配测序仪的读长限制',
    substepLabels:[
      '初始状态：提取到的基因组DNA（双链）',
      '超声波破碎：高频声波产生机械剪切力',
      'DNA链在随机位点断裂',
      '片段化完成！共4个片段，准备建库'
    ],
    theory:`
      <div class="tsec">
        <h4>🔬 为什么要片段化？</h4>
        <p>Illumina测序仪的最大读长为 <strong>150~300 bp</strong>，而人类基因组约30亿bp。必须先将DNA打碎成可测序的小片段。</p>
      </div>
      <div class="tsec">
        <h4>⚙️ 主要方法</h4>
        <p><strong>超声波剪切（Sonication）：</strong>使用Covaris仪器产生高频超声波，通过流体力学剪切力随机断裂DNA，片段大小可控。</p>
        <p><strong>酶切法：</strong>使用限制性内切酶（如EcoRI）在特定识别序列处切割，重复性好但有位置偏好。</p>
      </div>
      <div class="hbox">
        <strong>目标片段大小：200–500 bp</strong><br>
        过短（&lt;100bp）→ 信息量少，测序效率低<br>
        过长（&gt;800bp）→ 建库效率下降
      </div>
      <div class="tsec">
        <h4>📊 本演示数据</h4>
        <p>使用 <strong>39 bp</strong> 模拟基因组，打断为 <strong>4个片段</strong>（约10 bp每段），简化展示核心逻辑。</p>
      </div>`,
    render: renderStep1
  },
  {
    title:'步骤 2：文库构建（Library Construction）',
    desc:'在每个DNA片段两端连接标准化接头序列（Adapter），使片段能在测序仪流动池上锚定和扩增',
    substepLabels:[
      '取出一个DNA片段（双链）',
      '末端修复：将参差不齐的末端补平',
      '3\'末端加A尾（A-Tailing），便于接头连接',
      '接头连接完成！文库构建成功'
    ],
    theory:`
      <div class="tsec">
        <h4>🔗 接头的作用</h4>
        <p>接头（Adapter）是人工合成的短DNA序列，每个片段两端各连一个，包含：</p>
        <ul>
          <li>P5 / P7 流动池锚定序列</li>
          <li>测序引物结合位点</li>
          <li>样本Index（多样品混合时用）</li>
        </ul>
      </div>
      <div class="hbox">
        接头就像给每个快递包裹贴上统一格式的运单：无论内容物是什么，自动化系统都能识别和处理。
      </div>
      <div class="tsec">
        <h4>📋 建库关键步骤</h4>
        <p>1. <strong>末端修复</strong>：用T4聚合酶+Klenow将5'凸出或3'凹陷补平，得到平末端</p>
        <p>2. <strong>A尾添加</strong>：Taq聚合酶在3'末端各添加一个腺嘌呤（A）</p>
        <p>3. <strong>接头连接</strong>：带T尾的接头与片段A尾互补配对，T4连接酶封闭切口</p>
      </div>`,
    render: renderStep2
  },
  {
    title:'步骤 3：边合成边测序（Sequencing by Synthesis, SBS）',
    desc:'Illumina核心技术：DNA聚合酶合成互补链，每掺入一个荧光标记的核苷酸就拍照记录，逐碱基读取序列',
    substepLabels:[
      '文库片段固定在流动池，测序引物就位',
      '第1~2循环：掺入互补碱基（T、A）',
      '第3~4循环：继续合成（G、C）',
      '第5~6循环：继续合成（T、T）',
      '第7~8循环：继续合成（G、C）',
      '8个循环完成！获得第一条 Read 序列'
    ],
    theory:`
      <div class="tsec">
        <h4>💡 SBS核心原理</h4>
        <p>每次只掺入 <strong>一个</strong> 可逆终止型荧光核苷酸（3'端有保护基），成像后切除保护基，再进行下一循环。</p>
      </div>
      <div class="tsec">
        <h4>🔄 单个循环流程</h4>
        <p>① 泵入4种荧光dNTP（A/T/C/G各一种颜色）</p>
        <p>② 聚合酶催化互补碱基掺入（每次只掺1个）</p>
        <p>③ 冲洗去除多余核苷酸</p>
        <p>④ 激光激发荧光 → 相机拍照记录颜色</p>
        <p>⑤ 化学切除3'保护基 → 准备下一循环</p>
      </div>
      <div class="hbox">
        颜色 → 碱基对应：<br>
        <span class="btag bA">A</span>绿色 &nbsp;
        <span class="btag bT">T</span>红色 &nbsp;
        <span class="btag bC">C</span>蓝色 &nbsp;
        <span class="btag bG">G</span>黄色
      </div>
      <div class="tsec">
        <h4>📐 模板与合成链</h4>
        <p>模板：<code>5'-ATCGAACGTT...-3'</code><br>
        合成：<code>3'-TAGCTTGCAA...-5'</code></p>
      </div>`,
    render: renderStep3
  },
  {
    title:'步骤 4：碱基识别与质量控制（Base Calling & QC）',
    desc:'分析每个位置的荧光强度信号，识别碱基类型，并用Phred质量分数评估可信度，输出FASTQ文件',
    substepLabels:[
      '原始荧光强度信号（4通道）',
      '碱基识别：选取最高强度通道',
      '计算Phred质量分数（Q值）',
      '输出FASTQ格式文件'
    ],
    theory:`
      <div class="tsec">
        <h4>📊 Phred质量分数</h4>
        <p>Q值量化碱基识别错误的概率：</p>
        <div class="code-box">Q = -10 × log₁₀(P_error)</div>
        <table style="width:100%;font-size:11px;margin-top:6px;border-collapse:collapse">
          <tr style="color:var(--text2)"><td>Q值</td><td>错误率</td><td>准确率</td></tr>
          <tr><td>Q10</td><td>10%</td><td>90%（较差）</td></tr>
          <tr><td>Q20</td><td>1%</td><td>99%（合格）</td></tr>
          <tr><td>Q30</td><td>0.1%</td><td>99.9%（优良）✓</td></tr>
          <tr><td>Q40</td><td>0.01%</td><td>99.99%（极优）</td></tr>
        </table>
      </div>
      <div class="tsec">
        <h4>📄 FASTQ格式</h4>
        <p>每条Read占4行：</p>
        <div class="code-box">@Read_001
TAGCTTGCAA
+
IIHFIIGIIH</div>
        <p style="font-size:11px;margin-top:4px">第4行：ASCII(字符) - 33 = Q值<br>例如 'I'=73, 73-33=<strong>Q40</strong></p>
      </div>
      <div class="hbox-g">
        通常过滤掉平均Q值 &lt; 20 的低质量reads，并切除末端低质量碱基（Trimming）。
      </div>`,
    render: renderStep4
  },
  {
    title:'步骤 5：序列比对（Read Alignment）',
    desc:'将所有测序reads比对到参考基因组上，利用BWT索引快速定位每条read的来源位置，输出BAM文件',
    substepLabels:[
      '参考基因组（Reference）就绪',
      'Read 1~3 比对到参考序列上',
      'Read 4~6 比对（注意红色错配位置）',
      'Read 7~9 全部比对完成',
      '堆积图（Pileup）：发现疑似变异位点'
    ],
    theory:`
      <div class="tsec">
        <h4>⚡ BWT索引</h4>
        <p>BWA / Bowtie2使用 <strong>Burrows-Wheeler变换（BWT）</strong> 对参考基因组建立索引，将数十亿bp压缩为高效可检索的数据结构。</p>
      </div>
      <div class="tsec">
        <h4>🎯 种子延伸策略</h4>
        <p>① <strong>取种子</strong>：从read提取19bp短片段（k-mer）</p>
        <p>② <strong>精确匹配</strong>：用BWT索引瞬间定位候选位置</p>
        <p>③ <strong>延伸比对</strong>：Smith-Waterman动态规划精确比对全长</p>
        <p>④ <strong>评分过滤</strong>：记录比对分数（MAPQ），去除多重比对</p>
      </div>
      <div class="tsec">
        <h4>🎨 颜色说明</h4>
        <p>• 正常碱基：彩色正常显示</p>
        <p>• <span style="color:#f85149">红色边框</span>：与参考不一致的碱基（可能是SNP或测序错误）</p>
      </div>
      <div class="hbox">
        输出格式：<strong>SAM/BAM</strong><br>
        每行记录：Read名、位置、CIGAR串（比对方式）、序列、质量分等
      </div>`,
    render: renderStep5
  },
  {
    title:'步骤 6：变异识别（Variant Calling）',
    desc:'分析比对堆积图中所有位置的碱基组成，用贝叶斯统计模型识别真实遗传变异（SNP/Indel），输出VCF文件',
    substepLabels:[
      '聚焦SNP候选位点（位置25）',
      '统计各碱基支持的read数量',
      '贝叶斯模型计算基因型概率',
      '✓ 变异识别完成！输出VCF报告'
    ],
    theory:`
      <div class="tsec">
        <h4>🧮 为何不直接看频率？</h4>
        <p>测序存在错误，需区分<strong>真实变异</strong>和<strong>测序噪音</strong>。贝叶斯框架综合考虑碱基质量、比对质量和先验概率。</p>
      </div>
      <div class="tsec">
        <h4>📐 贝叶斯基因型分型</h4>
        <div class="code-box">P(GT|Data) ∝ P(Data|GT) × P(GT)</div>
        <p>对每个位置，计算三种基因型的后验概率：</p>
        <p>• <strong>0/0</strong>（纯合参考）：所有reads都是G</p>
        <p>• <strong>0/1</strong>（杂合变异）：~50% G，~50% A</p>
        <p>• <strong>1/1</strong>（纯合变异）：所有reads都是A</p>
      </div>
      <div class="tsec">
        <h4>📊 本例结果</h4>
        <p>位置25：覆盖深度 5x</p>
        <p><span class="btag bG">G</span> 参考等位：2条reads支持</p>
        <p><span class="btag bA">A</span> 变异等位：3条reads支持</p>
        <p>VAF = 3/5 = 60% → <strong>杂合变异 (0/1)</strong></p>
      </div>
      <div class="hbox-g">
        VCF输出：<br>
        <span style="font-family:monospace;font-size:11px">chr1 25 . G A 60 PASS GT:GQ 0/1:60</span>
      </div>`,
    render: renderStep6
  }
];

// ── 各步骤渲染函数 ────────────────────────────────────────────

/* ----------------------------------------------------------
   Step 1: DNA片段化
   ---------------------------------------------------------- */
function renderStep1(substep){
  const W=800, H=380;
  const bpW=15, bpH=20, sGap=6;
  const totalW = REF.length * bpW;
  const sx = (W-totalW)/2;
  const topY = H/2 - bpH - sGap;
  const botY = H/2 + sGap;
  let c = R(0,0,W,H,'#0d1117');

  // 片段分组（0-based终点含）
  const frags = [[0,9],[10,19],[20,28],[29,38]];

  if(substep === 0){
    // 完整双链DNA
    c += T(W/2, topY-22,'基因组 DNA（双链，39 bp）','#8b949e',13,'middle','normal','sans-serif');
    c += T(sx-12, topY+bpH/2+4,"5'→",'#388bfd',11,'end','normal','monospace');
    c += T(sx-12, botY+bpH/2+4,"3'←",'#388bfd',11,'end','normal','monospace');
    for(let i=0;i<REF.length;i++){
      const x=sx+i*bpW, base=REF[i], comp=COMPLEMENT[base];
      c += drawBase(x,topY,base,bpW,bpH);
      c += L(x+bpW/2,topY+bpH,x+bpW/2,botY,'#3a4050',1.5);
      c += drawBase(x,botY,comp,bpW,bpH);
    }
    c += T(sx+totalW+12, topY+bpH/2+4,"→3'",'#388bfd',11,'start','normal','monospace');
    c += T(sx+totalW+12, botY+bpH/2+4,"←5'",'#388bfd',11,'start','normal','monospace');

  } else if(substep === 1){
    // 超声波破碎
    c += T(W/2,32,'⚡  超声波剪切（Sonication）  ⚡','#d29922',14,'middle','bold','sans-serif');
    // 波纹
    for(let w=0;w<4;w++){
      const wy=topY-50+w*12;
      let d=`M ${sx} ${wy}`;
      for(let i=0;i<totalW;i+=24) d+=` q 12,${w%2===0?'-':''}7 24,0`;
      c += P(d,'none','#d29922',0.7+w*0.05,'opacity="0.35"');
    }
    // 完整双链（正常显示）
    for(let i=0;i<REF.length;i++){
      const x=sx+i*bpW, base=REF[i], comp=COMPLEMENT[base];
      c += drawBase(x,topY,base,bpW,bpH);
      c += L(x+bpW/2,topY+bpH,x+bpW/2,botY,'#3a4050',1.5);
      c += drawBase(x,botY,comp,bpW,bpH);
    }
    // 切割标记
    [9,19,28].forEach(pos=>{
      const cx=sx+pos*bpW+bpW;
      c += L(cx,topY-14,cx,botY+bpH+14,'#f85149',2,'stroke-dasharray="5,3"');
      c += `<polygon points="${cx},${topY} ${cx-5},${topY-10} ${cx+5},${topY-10}" fill="#f85149"/>`;
      c += `<polygon points="${cx},${botY+bpH} ${cx-5},${botY+bpH+10} ${cx+5},${botY+bpH+10}" fill="#f85149"/>`;
    });

  } else if(substep === 2){
    // DNA正在断裂
    c += T(W/2,32,'DNA链在随机位点断裂…','#f85149',13,'middle','bold','sans-serif');
    const fragDy=[-8,-3,3,8];
    frags.forEach(([s,e],fi)=>{
      const dy=fragDy[fi];
      for(let i=s;i<=e;i++){
        const x=sx+i*bpW, base=REF[i], comp=COMPLEMENT[base];
        c += drawBase(x,topY+dy,base,bpW,bpH);
        c += L(x+bpW/2,topY+dy+bpH,x+bpW/2,botY+dy,'#3a4050',1.5);
        c += drawBase(x,botY+dy,comp,bpW,bpH);
      }
    });
    // 断裂缝隙
    [9,19,28].forEach(pos=>{
      const cx=sx+pos*bpW+bpW;
      c += L(cx,50,cx,H-50,'#f85149',1.5,'stroke-dasharray="4,3" opacity="0.7"');
      c += T(cx,44,'✂','#f85149',14,'middle','normal','sans-serif');
    });

  } else if(substep === 3){
    // 4个分离的片段
    c += T(W/2,28,'片段化完成！共 4 个片段，准备进行文库构建','#3fb950',14,'middle','bold','sans-serif');
    const fragColors=['rgba(56,139,253,0.12)','rgba(63,185,80,0.12)','rgba(210,153,34,0.12)','rgba(248,81,73,0.12)'];
    const fragY=[70,140,210,280];
    const lbls=['片段1（Frag 1）','片段2（Frag 2）','片段3（Frag 3）','片段4（Frag 4）'];
    const dbpW=17, dbpH=22;

    frags.forEach(([s,e],fi)=>{
      const len=e-s+1;
      const fy=fragY[fi];
      const fw=len*dbpW;
      const fx=120;
      c += R(16,fy-4,768,dbpH+8,fragColors[fi],4);
      c += T(80,fy+dbpH/2+4,lbls[fi],'#c9d1d9',11,'middle','normal','sans-serif');
      for(let i=s;i<=e;i++){
        c += drawBase(fx+(i-s)*dbpW, fy, REF[i], dbpW, dbpH);
      }
      c += T(fx+fw+18, fy+dbpH/2+4, `${len} bp`,'#8b949e',11,'start','normal','monospace');
      c += T(fx+fw+55, fy+dbpH/2+4, `位置 ${s+1}–${e+1}`,'#555',11,'start','normal','monospace');
    });
  }
  return c;
}

/* ----------------------------------------------------------
   Step 2: 文库构建（接头连接）
   ---------------------------------------------------------- */
function renderStep2(substep){
  const W=800, H=380;
  let c = R(0,0,W,H,'#0d1117');

  // 使用第一个片段（位置0-9，10bp）
  const frag = REF.slice(0,10);
  const comp = frag.split('').map(b=>COMPLEMENT[b]).join('');
  const bpW=22, bpH=26;
  const fragW=frag.length*bpW;
  const centerX=(W-fragW)/2;
  const topY=140, botY=topY+bpH+8;
  const adW=60; // 接头宽度
  const adH=26;

  if(substep===0){
    c += T(W/2,50,'取出第一个片段（片段1，10 bp）进行文库构建','#8b949e',13,'middle','normal','sans-serif');
    c += T(W/2,72,'我们对每个片段重复相同的建库流程','#555',11,'middle','normal','sans-serif');
    for(let i=0;i<frag.length;i++){
      c += drawBase(centerX+i*bpW, topY, frag[i], bpW, bpH);
      c += L(centerX+i*bpW+bpW/2, topY+bpH, centerX+i*bpW+bpW/2, botY,'#3a4050',1.5);
      c += drawBase(centerX+i*bpW, botY, comp[i], bpW, bpH);
    }
    // 末端标注（超声剪切的粗糙末端）
    c += T(centerX-6,topY+bpH/2+4,"5'",'#388bfd',11,'end','normal','monospace');
    c += T(centerX-6,botY+bpH/2+4,"3'",'#388bfd',11,'end','normal','monospace');
    c += T(centerX+fragW+6,topY+bpH/2+4,"3'",'#388bfd',11,'start','normal','monospace');
    c += T(centerX+fragW+6,botY+bpH/2+4,"5'",'#388bfd',11,'start','normal','monospace');
    // 不规则末端示意
    c += T(centerX-20,topY+bpH+4,'⚠ 粗糙末端','#d29922',10,'end','normal','sans-serif');
    c += T(centerX+fragW+22,topY+bpH+4,'粗糙末端 ⚠','#d29922',10,'start','normal','sans-serif');

  } else if(substep===1){
    // 末端修复
    c += T(W/2,40,'末端修复（End Repair）','#388bfd',14,'middle','bold','sans-serif');
    c += T(W/2,60,'T4聚合酶 + Klenow 将末端补成平末端（Blunt End）','#8b949e',12,'middle','normal','sans-serif');
    for(let i=0;i<frag.length;i++){
      c += drawBase(centerX+i*bpW, topY, frag[i], bpW, bpH);
      c += L(centerX+i*bpW+bpW/2, topY+bpH, centerX+i*bpW+bpW/2, botY,'#3a4050',1.5);
      c += drawBase(centerX+i*bpW, botY, comp[i], bpW, bpH);
    }
    // 酶示意
    const enzymeColor='rgba(56,139,253,0.2)';
    c += R(centerX-40,topY-10,32,bpH*2+18,enzymeColor,6);
    c += T(centerX-24,topY+bpH+4,'T4','#388bfd',10,'middle','bold','sans-serif');
    c += R(centerX+fragW+8,topY-10,32,bpH*2+18,enzymeColor,6);
    c += T(centerX+fragW+24,topY+bpH+4,'T4','#388bfd',10,'middle','bold','sans-serif');
    // 平末端标注
    c += T(W/2,topY+bpH*2+30,'✓ 平末端','#3fb950',12,'middle','bold','sans-serif');

  } else if(substep===2){
    // A-尾添加
    c += T(W/2,40,'A尾添加（A-Tailing）','#d29922',14,'middle','bold','sans-serif');
    c += T(W/2,60,"Taq聚合酶在每条链的 3' 末端添加一个腺嘌呤（A）",'#8b949e',12,'middle','normal','sans-serif');
    // 主体序列
    for(let i=0;i<frag.length;i++){
      c += drawBase(centerX+i*bpW, topY, frag[i], bpW, bpH);
      c += L(centerX+i*bpW+bpW/2, topY+bpH, centerX+i*bpW+bpW/2, botY,'#3a4050',1.5);
      c += drawBase(centerX+i*bpW, botY, comp[i], bpW, bpH);
    }
    // A尾（右端外突）
    const ax=centerX+fragW+2;
    c += drawBase(ax, topY, 'A', bpW, bpH);
    // 左端A尾（底链外突，左侧）
    const lax=centerX-bpW-2;
    c += drawBase(lax, botY, 'A', bpW, bpH);
    c += T(ax+bpW/2, topY-8,"3'A 尾",'#d29922',10,'middle','normal','sans-serif');
    c += T(lax+bpW/2, botY+bpH+10,"3'A 尾",'#d29922',10,'middle','normal','sans-serif');

  } else if(substep===3){
    // 接头连接完成
    c += T(W/2,36,'接头连接完成！文库片段结构','#3fb950',14,'middle','bold','sans-serif');
    c += T(W/2,56,'每个片段两端各连有 P5 和 P7 接头，文库构建成功！','#8b949e',12,'middle','normal','sans-serif');
    // 接头
    const p5color='#6e40c9', p7color='#1f6feb';
    const drawAdapter=(x,y,label,color,dir)=>{
      c += R(x,y,adW,adH,color+'33',4,'stroke="'+color+'" stroke-width="1.5"');
      c += T(x+adW/2,y+adH/2+5,label,color,11,'middle','bold','sans-serif');
      // 箭头方向
      if(dir==='right') c+=L(x+adW-2,y+adH/2,x+adW+10,y+adH/2,color,1.5,'marker-end="url(#arr)"');
    };
    const fragStart=centerX, fragEnd=centerX+fragW;
    // P5接头（左）
    c += R(fragStart-adW-2,topY,adW,adH,p5color+'33',4,'stroke="'+p5color+'" stroke-width="1.5"');
    c += T(fragStart-adW/2-2,topY+adH/2+5,'P5',p5color,11,'middle','bold','sans-serif');
    c += R(fragStart-adW-2,botY,adW,adH,p5color+'22',4,'stroke="'+p5color+'" stroke-width="1"');
    c += T(fragStart-adW/2-2,botY+adH/2+5,'P5*',p5color+'aa',10,'middle','normal','sans-serif');
    // DNA主体
    for(let i=0;i<frag.length;i++){
      c += drawBase(centerX+i*bpW, topY, frag[i], bpW, bpH);
      c += L(centerX+i*bpW+bpW/2, topY+bpH, centerX+i*bpW+bpW/2, botY,'#3a4050',1.5);
      c += drawBase(centerX+i*bpW, botY, comp[i], bpW, bpH);
    }
    // P7接头（右）
    c += R(fragEnd+2,topY,adW,adH,p7color+'33',4,'stroke="'+p7color+'" stroke-width="1.5"');
    c += T(fragEnd+adW/2+2,topY+adH/2+5,'P7',p7color,11,'middle','bold','sans-serif');
    c += R(fragEnd+2,botY,adW,adH,p7color+'22',4,'stroke="'+p7color+'" stroke-width="1"');
    c += T(fragEnd+adW/2+2,botY+adH/2+5,'P7*',p7color+'aa',10,'middle','normal','sans-serif');
    // 标注文字
    c += T(fragStart-adW/2-2,topY-10,'接头（Adapter）',p5color,10,'middle','normal','sans-serif');
    c += T(fragEnd+adW/2+2,topY-10,'接头（Adapter）',p7color,10,'middle','normal','sans-serif');
    c += T(W/2,topY-10,'插入序列（Insert）','#8b949e',10,'middle','normal','sans-serif');
    // 底部文字
    c += T(W/2,H-50,'✓ 文库片段（Library Fragment）构建完成','#3fb950',13,'middle','bold','sans-serif');
    c += T(W/2,H-30,'所有4个片段都完成接头连接，合并为一个"文库"（Library）','#8b949e',11,'middle','normal','sans-serif');
  }
  return c;
}

/* ----------------------------------------------------------
   Step 3: 边合成边测序（SBS）
   ---------------------------------------------------------- */
function renderStep3(substep){
  const W=800, H=380;
  let c = R(0,0,W,H,'#0d1117');

  const template = SBS_TEMPLATE; // "ATCGAACGTTAC"
  const growing  = SBS_GROWING;  // ['T','A','G','C','T','T','G','C','A','A','T','G']
  const numCycles = substep===0 ? 0 : Math.min(substep*2, 8);

  const bpW=36, bpH=30;
  const startX=100;
  const templateY=100, growY=templateY+bpH+12, primerY=growY+bpH+8;

  // 流动池背景
  c += R(60,75,680,280,'#161b22',10,'stroke="#30363d" stroke-width="1"');
  c += T(W/2,66,'Illumina 流动池（Flow Cell）','#555',11,'middle','normal','sans-serif');

  if(substep===0){
    c += T(W/2,50,'模板链固定在流动池上，测序引物（Primer）就位','#8b949e',12,'middle','normal','sans-serif');
    // 模板链
    c += T(startX-20,templateY+bpH/2+4,'模板 5\'→','#388bfd',11,'end','normal','monospace');
    for(let i=0;i<template.length;i++){
      c += drawBase(startX+i*bpW, templateY, template[i], bpW, bpH);
    }
    c += T(startX+template.length*bpW+8,templateY+bpH/2+4,"→ 3'",'#388bfd',11,'start','normal','monospace');
    // 引物标注
    c += R(startX-4,primerY,60,22,'#6e40c922',4,'stroke="#6e40c9" stroke-width="1.5"');
    c += T(startX+26,primerY+15,'引物','#6e40c9',11,'middle','normal','sans-serif');
    // 聚合酶
    c += R(startX-10,growY-10,30,bpH+20,'#d2992222',6,'stroke="#d29922" stroke-width="1"');
    c += T(startX+5,growY+bpH/2+4,'🧬','#d29922',14,'middle');
    c += T(startX+5,H-60,'聚合酶','#d29922',10,'middle','normal','sans-serif');
    c += T(W/2,H-40,'等待第一个荧光核苷酸进入…','#555',11,'middle','normal','sans-serif');

  } else {
    c += T(W/2,50,`已完成 ${numCycles} 个循环，合成链逐步延伸`,'#3fb950',12,'middle','bold','sans-serif');
    // 模板链
    c += T(startX-20,templateY+bpH/2+4,"5'→",'#388bfd',11,'end','normal','monospace');
    for(let i=0;i<template.length;i++){
      c += drawBase(startX+i*bpW, templateY, template[i], bpW, bpH);
    }
    c += T(startX+template.length*bpW+8,templateY+bpH/2+4,"→3'",'#388bfd',11,'start','normal','monospace');
    // 碱基对连接线
    for(let i=0;i<numCycles;i++){
      c += L(startX+i*bpW+bpW/2,templateY+bpH,startX+i*bpW+bpW/2,growY,'#3a4050',1.5);
    }
    // 已合成链
    c += T(startX-20,growY+bpH/2+4,"3'←",'#3fb950',11,'end','normal','monospace');
    for(let i=0;i<numCycles;i++){
      c += drawBase(startX+i*bpW, growY, growing[i], bpW, bpH);
    }
    // 聚合酶位置
    if(numCycles<8){
      const px=startX+numCycles*bpW;
      c += R(px-6,growY-10,bpW+10,bpH+20,'#d2992222',6,'stroke="#d29922" stroke-width="1.5"');
      c += T(px+bpW/2,growY+bpH/2+4,'🧬','#d29922',16,'middle');
    }
    // 信号检测示意
    const sigY=growY+bpH+35;
    c += L(startX-10,sigY,startX+template.length*bpW,sigY,'#30363d',1);
    c += T(startX-20,sigY,'信号','#555',10,'end','normal','sans-serif');
    for(let i=0;i<numCycles;i++){
      const base=growing[i];
      const bx=startX+i*bpW+bpW/2;
      const barH=24;
      c += R(bx-8,sigY-barH,16,barH,BASE_COLOR[base],2);
      c += T(bx,sigY+12,base,BASE_COLOR[base],9,'middle','bold','monospace');
    }
    if(substep===5){
      // 最终结果展示
      const readStr = growing.slice(0,8).join('');
      c += T(W/2,H-65,'✓ Read 序列读取完成！（显示前8个碱基）','#3fb950',13,'middle','bold','sans-serif');
      c += R(180,H-52,440,28,'#161b22',4,'stroke="#30363d"');
      c += T(W/2,H-33,readStr,'#3fb950',15,'middle','bold','monospace');
      c += T(W/2,H-15,'5\'- '+readStr+' -3\'（合成链读取方向）','#8b949e',10,'middle','normal','monospace');
    }
  }
  return c;
}

/* ----------------------------------------------------------
   Step 4: 碱基识别与质控
   ---------------------------------------------------------- */
function renderStep4(substep){
  const W=800, H=380;
  let c = R(0,0,W,H,'#0d1117');

  const nPos=8;
  const barMaxH=90;
  const barW=10;
  const chartX=60, chartY=80, chartW=500, chartH=barMaxH+20;
  const posW=chartW/nPos;
  const bases=['A','T','C','G'];

  if(substep===0){
    // 荧光强度信号
    c += T(W/2,38,'原始荧光强度信号（4通道）','#c9d1d9',14,'middle','bold','sans-serif');
    c += T(W/2,56,'每个位置同时检测4种颜色的荧光强度','#8b949e',12,'middle','normal','sans-serif');
    // Y轴
    c += L(chartX,chartY,chartX,chartY+chartH,'#30363d',1);
    c += T(chartX-5,chartY,'100','#555',9,'end');
    c += T(chartX-5,chartY+barMaxH/2,'50','#555',9,'end');
    c += T(chartX-5,chartY+barMaxH,'0','#555',9,'end');
    c += T(chartX-20,chartY+chartH/2,'强度','#555',10,'middle','normal','sans-serif',`transform="rotate(-90,${chartX-20},${chartY+chartH/2})"`);
    // X轴
    c += L(chartX,chartY+chartH,chartX+chartW,chartY+chartH,'#30363d',1);
    // 图例
    let legX=chartX+chartW+30;
    bases.forEach((b,i)=>{
      c += R(legX,chartY+i*22,12,12,BASE_COLOR[b],2);
      c += T(legX+16,chartY+i*22+10,b,'#c9d1d9',11,'start','normal','monospace');
    });
    // 信号柱状图
    SIGNAL_DATA.forEach((sd,pos)=>{
      const px=chartX+pos*posW+10;
      bases.forEach((b,bi)=>{
        const sig=sd.signals[b];
        const bh=sig/100*barMaxH;
        const bx=px+bi*(barW+1);
        c += R(bx,chartY+barMaxH-bh,barW,bh,BASE_COLOR[b]+'cc',1);
      });
      c += T(chartX+pos*posW+posW/2+10,chartY+chartH+14,`${pos+1}`,'#8b949e',10,'middle','normal','monospace');
    });
    c += T(chartX+chartW/2,chartY+chartH+30,'循环编号（Cycle）','#8b949e',11,'middle','normal','sans-serif');
    c += T(W/2,H-30,'每个位置的主导颜色即为该碱基对应的荧光标记','#555',11,'middle','normal','sans-serif');

  } else if(substep===1){
    // 碱基识别
    c += T(W/2,38,'碱基识别（Base Calling）','#c9d1d9',14,'middle','bold','sans-serif');
    c += T(W/2,56,'选取每个位置信号最强的通道，对应碱基即为识别结果','#8b949e',12,'middle','normal','sans-serif');
    const seqY=280, seqX=chartX+10;
    const bpW2=52;
    SIGNAL_DATA.forEach((sd,pos)=>{
      const px=chartX+pos*posW+10;
      bases.forEach((b,bi)=>{
        const sig=sd.signals[b];
        const bh=sig/100*barMaxH;
        const bx=px+bi*(barW+1);
        const isMax=(b===sd.base);
        c += R(bx,chartY+barMaxH-bh,barW,bh,BASE_COLOR[b]+(isMax?'':'55'),1,isMax?'stroke="#fff" stroke-width="0.8"':'');
      });
      // 箭头
      c += L(chartX+pos*posW+posW/2+10,chartY+barMaxH+18,seqX+pos*bpW2+bpW2/2,seqY-4,'#30363d',1,'stroke-dasharray="3,2"');
      c += `<polygon points="${seqX+pos*bpW2+bpW2/2},${seqY} ${seqX+pos*bpW2+bpW2/2-4},${seqY-8} ${seqX+pos*bpW2+bpW2/2+4},${seqY-8}" fill="#30363d"/>`;
      c += T(chartX+pos*posW+posW/2+10,chartY+chartH+14,`${pos+1}`,'#8b949e',10,'middle');
      c += drawBase(seqX+pos*bpW2, seqY, sd.base, bpW2, 30);
    });
    c += T(seqX-12, seqY+15,"5'",'#388bfd',11,'end','normal','monospace');
    c += T(seqX+8*bpW2+12, seqY+15,"→3'",'#388bfd',11,'start','normal','monospace');

  } else if(substep===2){
    // 质量分数
    c += T(W/2,38,'Phred 质量分数（Q值）计算','#c9d1d9',14,'middle','bold','sans-serif');
    c += T(W/2,56,'Q = -10×log₁₀(错误率)，Q30表示错误率0.1%','#8b949e',12,'middle','normal','sans-serif');
    const seqX=60, seqY=100, bpW2=52, bpH2=30;
    const qbarY=170, qbarMaxH=70;
    SIGNAL_DATA.forEach((sd,pos)=>{
      const x=seqX+pos*bpW2;
      c += drawBase(x, seqY, sd.base, bpW2, bpH2);
      // Q值
      const q=SBS_GROWING.slice(0,8).map((_,i)=>genQual(1,i))[pos]||28;
      const qBarH=q/40*qbarMaxH;
      const qColor=q>=30?'#3fb950':q>=20?'#d29922':'#f85149';
      c += R(x+4,qbarY+qbarMaxH-qBarH,bpW2-10,qBarH,qColor+'88',2);
      c += T(x+bpW2/2,qbarY+qbarMaxH-qBarH-4,`Q${q}`,qColor,10,'middle','bold','monospace');
      // 连接
      c += L(x+bpW2/2,seqY+bpH2,x+bpW2/2,qbarY,'#30363d',1,'stroke-dasharray="3,2"');
    });
    c += L(seqX-4,qbarY,seqX+8*bpW2,qbarY,'#30363d',1);
    c += T(seqX-6,qbarY,'Q40','#555',9,'end','normal','monospace');
    c += L(seqX-4,qbarY+qbarMaxH*0.25,seqX+8*bpW2,qbarY+qbarMaxH*0.25,'#30363d',0.5,'stroke-dasharray="4,3"');
    c += T(seqX-6,qbarY+qbarMaxH*0.25,'Q30','#3fb950',9,'end','normal','monospace');
    c += L(seqX-4,qbarY+qbarMaxH*0.5,seqX+8*bpW2,qbarY+qbarMaxH*0.5,'#30363d',0.5,'stroke-dasharray="4,3"');
    c += T(seqX-6,qbarY+qbarMaxH*0.5,'Q20','#d29922',9,'end','normal','monospace');
    c += T(W/2,H-30,'绿色≥Q30（优良），黄色Q20~30（合格），红色&lt;Q20（过滤掉）','#555',11,'middle','normal','sans-serif');

  } else if(substep===3){
    // FASTQ格式
    c += T(W/2,38,'输出 FASTQ 格式文件','#c9d1d9',14,'middle','bold','sans-serif');
    c += T(W/2,56,'标准测序数据格式：4行一条记录','#8b949e',12,'middle','normal','sans-serif');
    const seq8=SBS_GROWING.slice(0,8).join('');
    const qual8=seq8.split('').map((_,i)=>qChar(genQual(1,i))).join('');
    const lines=[
      {text:`@Lib_Frag1_Read_001`, color:'#388bfd', label:'① 序列ID行（@开头）'},
      {text:seq8+'ACGT', color:'#3fb950', label:'② 碱基序列（ACGT...）'},
      {text:'+', color:'#8b949e', label:'③ 分隔符（+）'},
      {text:qual8+'IIHH', color:'#d29922', label:'④ 质量分数（ASCII编码）'},
    ];
    lines.forEach((l,i)=>{
      const ly=100+i*60;
      c += R(80,ly,500,40,'#161b22',4,'stroke="#30363d"');
      c += T(90,ly+26,l.text,l.color,13,'start','normal','monospace');
      c += T(600,ly+26,l.label,'#8b949e',11,'start','normal','sans-serif');
    });
    c += T(80,340,'质量字符对应关系：字符ASCII码 − 33 = Q值','#555',11,'start','normal','sans-serif');
    c += T(80,358,"例：'I' (ASCII=73) → Q = 73−33 = 40",'#8b949e',11,'start','normal','monospace');
    c += T(580,340,'通常过滤平均Q<20的reads','#555',11,'start','normal','sans-serif');
  }
  return c;
}

/* ----------------------------------------------------------
   Step 5: 序列比对（Read Alignment）
   ---------------------------------------------------------- */
function renderStep5(substep){
  const W=800, H=380;
  let c = R(0,0,W,H,'#0d1117');

  const bpW=14, bpH=16;
  const refX=60, refY=50;
  const refLen=REF.length; // 39

  const visibleReads = substep===0 ? 0 : substep===1 ? 3 : substep===2 ? 6 : 9;

  // 参考序列
  c += T(refX-6,refY+bpH/2+4,'参考','#8b949e',10,'end','normal','sans-serif');
  for(let i=0;i<refLen;i++){
    const x=refX+i*bpW;
    const isSnp=(i===SNP_POS);
    c += R(x,refY,bpW-1,bpH,BASE_COLOR[REF[i]]+(isSnp?'':'88'),2,isSnp?'stroke="#fff" stroke-width="1"':'');
    if(bpW>=14){
      c += T(x+bpW/2,refY+bpH/2+4,REF[i],'#fff'+(isSnp?'':'cc'),8,'middle','bold');
    }
  }
  // 位置刻度
  for(let i=0;i<refLen;i+=5){
    c += T(refX+i*bpW+bpW/2,refY-6,`${i+1}`,'#444',8,'middle','normal','monospace');
  }
  // SNP标注
  if(substep>=2){
    const snpX=refX+SNP_POS*bpW+bpW/2;
    c += L(snpX,refY-2,snpX,refY-18,'#f85149',1,'stroke-dasharray="3,2"');
    c += T(snpX,refY-22,'SNP','#f85149',9,'middle','bold','sans-serif');
  }

  // reads显示
  const readH=bpH+3;
  const readsAreaY=refY+bpH+18;
  c += L(refX-2,readsAreaY-4,refX+refLen*bpW,readsAreaY-4,'#30363d',0.5);

  for(let ri=0;ri<visibleReads;ri++){
    const read=READS[ri];
    const ry=readsAreaY+ri*readH;
    const ry2=ry+(readH-bpH)/2;
    c += T(refX-6,ry2+bpH/2+4,`R${read.id}`,'#8b949e',8,'end','normal','monospace');
    for(let j=0;j<read.len;j++){
      const globalPos=read.start+j;
      const base=read.seq[j];
      const refBase=REF[globalPos];
      const isMismatch=(base!==refBase);
      const x=refX+globalPos*bpW;
      c += R(x,ry2,bpW-1,bpH,BASE_COLOR[base]+(isMismatch?'':'77'),2,
             isMismatch?'stroke="#f85149" stroke-width="1.2"':'');
      if(bpW>=14){
        c += T(x+bpW/2,ry2+bpH/2+4,base,'#fff'+(isMismatch?'':''+(bpW<16?'88':'')),7,'middle','bold');
      }
    }
  }

  // 图例
  if(substep>=1){
    const legY=H-50;
    c += R(refX,legY,12,12,'#d29922',2);
    c += T(refX+16,legY+10,'碱基（正常比对）','#8b949e',10,'start','normal','sans-serif');
    c += R(200,legY,12,12,'#f85149',2,'stroke="#f85149" stroke-width="1"');
    c += T(216,legY+10,'碱基（错配 — SNP或测序错误）','#8b949e',10,'start','normal','sans-serif');
  }

  if(substep===4){
    // 最后一帧：突出显示SNP列
    const snpX=refX+SNP_POS*bpW;
    c += R(snpX-1,refY-2,bpW+1,H-refY-30,'rgba(248,81,73,0.08)',0,'stroke="#f85149" stroke-width="1" stroke-dasharray="4,3"');
    c += T(snpX+bpW/2,H-28,'候选变异位点','#f85149',10,'middle','bold','sans-serif');
    // 统计
    let gCount=0,aCount=0;
    READS.forEach(r=>{
      if(r.start<=SNP_POS && SNP_POS<r.start+r.len){
        const b=r.seq[SNP_POS-r.start];
        if(b==='G') gCount++;
        else if(b==='A') aCount++;
      }
    });
    c += T(W-130,H-50,`覆盖深度：${gCount+aCount}x`,'#c9d1d9',11,'middle','normal','sans-serif');
    c += T(W-130,H-32,`G:${gCount} / A:${aCount}`,'#c9d1d9',11,'middle','normal','monospace');
  }

  if(substep===0){
    c += T(W/2,H-40,'参考基因组已加载，BWT索引构建完毕，等待reads输入…','#555',11,'middle','normal','sans-serif');
  }
  return c;
}

/* ----------------------------------------------------------
   Step 6: 变异识别（Variant Calling）
   ---------------------------------------------------------- */
function renderStep6(substep){
  const W=800, H=380;
  let c = R(0,0,W,H,'#0d1117');

  // 收集SNP位点的碱基
  const snpBases=[];
  READS.forEach(r=>{
    if(r.start<=SNP_POS && SNP_POS<r.start+r.len){
      snpBases.push({readId:r.id, base:r.seq[SNP_POS-r.start]});
    }
  });
  const gCount=snpBases.filter(x=>x.base==='G').length;
  const aCount=snpBases.filter(x=>x.base==='A').length;
  const total=snpBases.length;

  if(substep===0){
    // 聚焦视图
    c += T(W/2,36,'聚焦 SNP 候选位点：参考基因组第 25 位（G）','#c9d1d9',14,'middle','bold','sans-serif');
    c += T(W/2,56,'显示覆盖该位点的所有reads（Pileup视图）','#8b949e',12,'middle','normal','sans-serif');

    const bpW=38, bpH=30, colX=380;
    const refY=90;
    // 参考位置上下文
    const context=5;
    const ctxStart=SNP_POS-context, ctxEnd=SNP_POS+context;
    for(let i=ctxStart;i<=ctxEnd;i++){
      const x=colX+(i-SNP_POS)*bpW - bpW/2;
      const isSnp=(i===SNP_POS);
      c += R(x,refY,bpW-2,bpH,BASE_COLOR[REF[i]]+(isSnp?'':'55'),2,
             isSnp?'stroke="#fff" stroke-width="2"':'');
      c += T(x+bpW/2-1,refY+bpH/2+5,REF[i],'#fff'+(isSnp?'':'88'),isSnp?14:10,'middle','bold');
      c += T(x+bpW/2-1,refY-6,`${i+1}`,'#555',8,'middle');
    }
    c += T(colX,refY-16,'参考','#8b949e',10,'middle','normal','sans-serif');
    c += L(colX-bpW/2-2,refY+bpH,colX-bpW/2-2,H-50,'#f85149',1,'stroke-dasharray="4,3" opacity="0.5"');
    c += L(colX+bpW/2-2,refY+bpH,colX+bpW/2-2,H-50,'#f85149',1,'stroke-dasharray="4,3" opacity="0.5"');

    const rowH=28;
    snpBases.forEach((sb,ri)=>{
      const ry=refY+bpH+14+ri*rowH;
      c += T(colX-context*bpW-20,ry+rowH/2+4,`R${sb.readId}`,'#8b949e',10,'end','normal','monospace');
      const isMis=(sb.base!==REF[SNP_POS]);
      c += R(colX-bpW/2,ry,bpW-2,rowH-2,BASE_COLOR[sb.base]+(isMis?'':'88'),2,
             isMis?'stroke="#f85149" stroke-width="1.5"':'');
      c += T(colX,ry+rowH/2+4,sb.base,'#fff',12,'middle','bold');
    });

  } else if(substep===1){
    // 碱基计数
    c += T(W/2,36,'统计各等位基因的支持reads数量','#c9d1d9',14,'middle','bold','sans-serif');
    // 堆积图（紧凑）
    const bpS=28, colX=120;
    snpBases.forEach((sb,ri)=>{
      const ry=80+ri*32;
      const isMis=(sb.base!==REF[SNP_POS]);
      c += R(colX,ry,bpS-2,bpS-2,BASE_COLOR[sb.base]+(isMis?'':'88'),2,
             isMis?'stroke="#f85149" stroke-width="1.5"':'');
      c += T(colX+bpS/2-1,ry+bpS/2+4,sb.base,'#fff',11,'middle','bold');
      c += T(colX+bpS+8,ry+bpS/2+4,`Read ${sb.readId} → ${sb.base}`,isMis?'#f85149':'#c9d1d9',11,'start','normal','monospace');
    });
    // 计数显示
    const cx=500, cy=100;
    c += T(cx,cy-16,'位置25 碱基统计','#c9d1d9',13,'middle','bold','sans-serif');
    // G bar
    const barH=(g=>g/total*120)(gCount);
    const aBarH=(a=>a/total*120)(aCount);
    c += R(cx-70,cy,50,gCount/total*120,BASE_COLOR['G'],4);
    c += T(cx-45,cy+gCount/total*120+14,`G: ${gCount}条`,BASE_COLOR['G'],11,'middle','bold','sans-serif');
    // A bar
    c += R(cx+20,cy,50,aCount/total*120,BASE_COLOR['A'],4);
    c += T(cx+45,cy+aCount/total*120+14,`A: ${aCount}条`,BASE_COLOR['A'],11,'middle','bold','sans-serif');
    c += L(cx-80,cy,cx+80,cy,'#30363d',1);
    c += T(cx,cy+150,`总深度：${total}×`,'#8b949e',11,'middle','normal','sans-serif');
    c += T(cx,cy+168,`变异频率（VAF）：${aCount}/${total} = ${(aCount/total*100).toFixed(0)}%`,'#c9d1d9',12,'middle','bold','monospace');

  } else if(substep===2){
    // 贝叶斯模型
    c += T(W/2,36,'贝叶斯模型：计算各基因型的后验概率','#c9d1d9',14,'middle','bold','sans-serif');
    c += T(W/2,56,'P(基因型 | 数据) ∝ P(数据 | 基因型) × P(基因型)','#8b949e',12,'middle','normal','monospace');
    const gts=[
      {name:'0/0（纯合参考 GG）',prob:0.05,color:'#8b949e',desc:'假设样本纯合G：观测到3条A的概率极低'},
      {name:'0/1（杂合 GA）',     prob:0.92,color:'#3fb950',desc:'假设杂合：期望~50% A，与观测吻合最好'},
      {name:'1/1（纯合变异 AA）', prob:0.03,color:'#f85149',desc:'假设纯合A：观测到2条G的概率极低'},
    ];
    const barBase=220;
    gts.forEach((gt,i)=>{
      const gy=100+i*80;
      const bw=gt.prob*400;
      c += T(80,gy+12,gt.name,gt.color,12,'start','bold','monospace');
      c += R(80,gy+20,bw,22,gt.color+'55',4,'stroke="'+gt.color+'" stroke-width="1"');
      c += T(80+bw+8,gy+35,`P = ${(gt.prob*100).toFixed(0)}%`,gt.color,11,'start','bold','monospace');
      c += T(80,gy+55,gt.desc,'#8b949e',10,'start','normal','sans-serif');
    });
    c += T(W/2,H-40,'后验概率最高的基因型为 0/1（杂合变异），置信度 92%','#3fb950',12,'middle','bold','sans-serif');

  } else if(substep===3){
    // 最终结果
    c += T(W/2,40,'✓  变异识别完成！SNP 已报告','#3fb950',15,'middle','bold','sans-serif');
    // VCF预览
    c += T(W/2,70,'VCF 格式输出（变异呼叫格式 Variant Call Format）','#8b949e',12,'middle','normal','sans-serif');
    const vcfLines=[
      '##fileformat=VCFv4.2',
      '##reference=mock_genome.fa',
      '#CHROM  POS  ID  REF  ALT  QUAL  FILTER  INFO            FORMAT  SAMPLE',
      'chr1    25   .   G    A    60    PASS    DP=5;AF=0.600   GT:GQ   0/1:60',
    ];
    vcfLines.forEach((l,i)=>{
      const ly=100+i*36;
      const isData=i===3;
      c += R(40,ly,720,30,'#161b22',3,'stroke="#30363d"');
      c += T(52,ly+20,l,isData?'#3fb950':'#555',11,'start','normal','monospace');
    });
    // 字段说明
    const fields=[
      {x:40, label:'染色体'},
      {x:95, label:'位置25'},
      {x:150,label:'ID'},
      {x:175,label:'参考G'},
      {x:220,label:'变异A'},
      {x:260,label:'质量60'},
      {x:312,label:'通过过滤'},
      {x:378,label:'深度5,频率60%'},
      {x:498,label:'格式'},
      {x:567,label:'杂合,GQ=60'},
    ];
    fields.forEach(f=>{
      c += T(f.x,240,f.label,'#555',8,'start','normal','sans-serif');
    });
    // 总结
    c += R(40,260,720,90,'rgba(63,185,80,0.08)',6,'stroke="#3fb950" stroke-width="1"');
    c += T(W/2,282,'📋  分析总结','#3fb950',13,'middle','bold','sans-serif');
    c += T(W/2,302,`参考基因组第25位发生 G→A 替换（SNP）`,'#c9d1d9',12,'middle','normal','sans-serif');
    c += T(W/2,320,`基因型：杂合（0/1）  |  变异频率：60%  |  覆盖深度：5×  |  质量：Q60`,'#8b949e',11,'middle','normal','sans-serif');
    c += T(W/2,340,`生物学意义：该样本在此位点携带一个杂合单核苷酸多态性（SNP）`,'#c9d1d9',11,'middle','normal','sans-serif');
  }
  return c;
}

// ── 应用状态 ──────────────────────────────────────────────────

let curStep    = 0;
let curSub     = 0;
let isPlaying  = false;
let playTimer  = null;
const PLAY_INTERVAL = 2200; // ms

// ── UI 更新 ───────────────────────────────────────────────────

function updateStepNav(){
  const inner=document.getElementById('step-bar-inner');
  inner.innerHTML='';
  STEPS.forEach((s,i)=>{
    const div=document.createElement('div');
    div.className='step-item'+(i===curStep?' active':i<curStep?' done':'');
    div.innerHTML=`<div class="step-num">${i+1}</div><div class="step-name">${s.title.replace(/步骤 \d+：/,'')}</div>`;
    div.addEventListener('click',()=>goToStep(i));
    inner.appendChild(div);
    if(i<STEPS.length-1){
      const conn=document.createElement('div');
      conn.className='step-connector';
      inner.appendChild(conn);
    }
  });
}

function updateSubstepDots(){
  const step=STEPS[curStep];
  const n=step.substepLabels.length;
  const dots=document.getElementById('substep-dots');
  dots.innerHTML='';
  for(let i=0;i<n;i++){
    const d=document.createElement('div');
    d.className='sdot'+(i===curSub?' active':i<curSub?' done':'');
    d.title=step.substepLabels[i];
    d.addEventListener('click',()=>{ curSub=i; render(); });
    dots.appendChild(d);
  }
  document.getElementById('substep-label').textContent=step.substepLabels[curSub]||'';
}

function render(){
  const step=STEPS[curStep];
  document.getElementById('step-title').textContent=step.title;
  document.getElementById('step-desc').textContent=step.desc;
  document.getElementById('theory-content').innerHTML=step.theory;

  const svg=document.getElementById('main-svg');
  svg.innerHTML=step.render(curSub);

  updateStepNav();
  updateSubstepDots();
  updateButtons();
}

function updateButtons(){
  const maxSub=STEPS[curStep].substepLabels.length-1;
  document.getElementById('btn-prev').disabled=(curStep===0);
  document.getElementById('btn-next').disabled=(curStep===STEPS.length-1);
  document.getElementById('btn-sub-prev').disabled=(curSub===0 && curStep===0);
  document.getElementById('btn-sub-next').disabled=(curSub===maxSub && curStep===STEPS.length-1);
  const playBtn=document.getElementById('btn-play');
  if(isPlaying){ playBtn.textContent='⏸ 暂停'; playBtn.classList.add('playing'); }
  else         { playBtn.textContent='▶ 播放'; playBtn.classList.remove('playing'); }
}

// ── 导航逻辑 ─────────────────────────────────────────────────

function goToStep(i){
  pausePlay();
  curStep=i; curSub=0;
  render();
}

function prevStep(){
  if(curStep>0){ pausePlay(); curStep--; curSub=0; render(); }
}

function nextStep(){
  if(curStep<STEPS.length-1){ pausePlay(); curStep++; curSub=0; render(); }
}

function subPrev(){
  pausePlay();
  if(curSub>0){ curSub--; render(); }
  else if(curStep>0){ curStep--; curSub=STEPS[curStep].substepLabels.length-1; render(); }
}

function subNext(){
  pausePlay();
  const maxSub=STEPS[curStep].substepLabels.length-1;
  if(curSub<maxSub){ curSub++; render(); }
  else if(curStep<STEPS.length-1){ curStep++; curSub=0; render(); }
}

function startPlay(){
  isPlaying=true;
  updateButtons();
  advanceFrame();
}

function pausePlay(){
  isPlaying=false;
  clearTimeout(playTimer);
  updateButtons();
}

function togglePlay(){
  if(isPlaying) pausePlay();
  else          startPlay();
}

function advanceFrame(){
  if(!isPlaying) return;
  const maxSub=STEPS[curStep].substepLabels.length-1;
  if(curSub<maxSub){
    curSub++;
    render();
    playTimer=setTimeout(advanceFrame, PLAY_INTERVAL);
  } else if(curStep<STEPS.length-1){
    curStep++; curSub=0;
    render();
    playTimer=setTimeout(advanceFrame, PLAY_INTERVAL);
  } else {
    // 播放完毕
    pausePlay();
  }
}

// ── 初始化 ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('btn-prev').addEventListener('click', prevStep);
  document.getElementById('btn-next').addEventListener('click', nextStep);
  document.getElementById('btn-play').addEventListener('click', togglePlay);
  document.getElementById('btn-sub-prev').addEventListener('click', subPrev);
  document.getElementById('btn-sub-next').addEventListener('click', subNext);

  // 键盘快捷键
  document.addEventListener('keydown', e=>{
    if(e.key==='ArrowRight') subNext();
    else if(e.key==='ArrowLeft') subPrev();
    else if(e.key===' '){ e.preventDefault(); togglePlay(); }
  });

  render();
});
