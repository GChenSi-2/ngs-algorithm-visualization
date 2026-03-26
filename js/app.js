/* ============================================================
   NGS 可视化主程序 v2 — 支持动态数据 + 完整比对算法可视化
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
function qChar(q){ return String.fromCharCode(q+33); }

function drawBase(x,y,base,bw=17,bh=22,showLabel=true){
  const col = BASE_COLOR[base] || '#555';
  let out = R(x,y,bw-1,bh,col,2);
  if(showLabel){
    const fs = bh<18?8:(bh<24?10:12);
    out += T(x+bw/2-0.5, y+bh/2+fs/2-1, base,'#fff',fs,'middle','bold');
  }
  return out;
}

function drawSeq(x,y,seq,bw=17,bh=22,showLabels=true){
  return seq.split('').map((b,i)=>drawBase(x+i*bw,y,b,bw,bh,showLabels)).join('');
}

// ── 步骤定义 STEPS ──────────────────────────────────────────

function getSteps() {
  return [
    {
      title: t('step1.title'),
      desc: t('step1.desc'),
      nav: t('step1.nav'),
      substepLabels: [t('step1.sub0'), t('step1.sub1'), t('step1.sub2'), t('step1.sub3')],
      theory: t('step1.theory'),
      render: renderStep1
    },
    {
      title: t('step2.title'),
      desc: t('step2.desc'),
      nav: t('step2.nav'),
      substepLabels: [t('step2.sub0'), t('step2.sub1'), t('step2.sub2'), t('step2.sub3')],
      theory: t('step2.theory'),
      render: renderStep2
    },
    {
      title: t('step3.title'),
      desc: t('step3.desc'),
      nav: t('step3.nav'),
      substepLabels: [t('step3.sub0'), t('step3.sub1'), t('step3.sub2'), t('step3.sub3'), t('step3.sub4'), t('step3.sub5')],
      theory: t('step3.theory'),
      render: renderStep3
    },
    {
      title: t('step4.title'),
      desc: t('step4.desc'),
      nav: t('step4.nav'),
      substepLabels: [t('step4.sub0'), t('step4.sub1'), t('step4.sub2'), t('step4.sub3')],
      theory: t('step4.theory'),
      render: renderStep4
    },
    {
      title: t('step5.title'),
      desc: t('step5.desc'),
      nav: t('step5.nav'),
      substepLabels: [t('step5.sub0'), t('step5.sub1'), t('step5.sub2'), t('step5.sub3'), t('step5.sub4'), t('step5.sub5')],
      theory: t('step5.theory'),
      render: renderStep5
    },
    {
      title: t('step6.title'),
      desc: t('step6.desc'),
      nav: t('step6.nav'),
      substepLabels: [t('step6.sub0'), t('step6.sub1'), t('step6.sub2'), t('step6.sub3')],
      theory: t('step6.theory') + `<div class="hbox-g">${t('step6.theory.snp_info', SNP_POS+1, SNP_REF_BASE, SNP_ALT_BASE)}</div>`,
      render: renderStep6
    }
  ];
}

let STEPS = getSteps();

// ── Step 1: DNA 片段化 ────────────────────────────────────────

function renderStep1(substep){
  const W=800,H=380;
  const bpW=15,bpH=20,sGap=6;
  const totalW=REF.length*bpW;
  const sx=Math.max(10,(W-totalW)/2);
  const topY=H/2-bpH-sGap, botY=H/2+sGap;
  let c=R(0,0,W,H,'#0d1117');
  const frags=[[0,9],[10,19],[20,28],[29,REF.length-1]];

  if(substep===0){
    c+=T(W/2,topY-22,t('svg.genome_dna',REF.length),'#8b949e',13,'middle','normal','sans-serif');
    c+=T(sx-12,topY+bpH/2+4,"5'→",'#388bfd',11,'end','normal','monospace');
    c+=T(sx-12,botY+bpH/2+4,"3'←",'#388bfd',11,'end','normal','monospace');
    for(let i=0;i<Math.min(REF.length,46);i++){
      const x=sx+i*bpW,base=REF[i],comp=COMPLEMENT[base];
      c+=drawBase(x,topY,base,bpW,bpH);
      c+=L(x+bpW/2,topY+bpH,x+bpW/2,botY,'#3a4050',1.5);
      c+=drawBase(x,botY,comp,bpW,bpH);
    }
  } else if(substep===1){
    c+=T(W/2,32,t('svg.sonication'),'#d29922',14,'middle','bold','sans-serif');
    for(let w=0;w<4;w++){
      const wy=topY-50+w*12;
      let d=`M ${sx} ${wy}`;
      for(let i=0;i<totalW;i+=24) d+=` q 12,${w%2===0?'-':''}7 24,0`;
      c+=P(d,'none','#d29922',0.7,'opacity="0.35"');
    }
    for(let i=0;i<Math.min(REF.length,46);i++){
      const x=sx+i*bpW,base=REF[i],comp=COMPLEMENT[base];
      c+=drawBase(x,topY,base,bpW,bpH);
      c+=L(x+bpW/2,topY+bpH,x+bpW/2,botY,'#3a4050',1.5);
      c+=drawBase(x,botY,comp,bpW,bpH);
    }
    [9,19,28].forEach(pos=>{
      const cx=sx+pos*bpW+bpW;
      c+=L(cx,topY-14,cx,botY+bpH+14,'#f85149',2,'stroke-dasharray="5,3"');
      c+=`<polygon points="${cx},${topY} ${cx-5},${topY-10} ${cx+5},${topY-10}" fill="#f85149"/>`;
    });
  } else if(substep===2){
    c+=T(W/2,32,t('svg.breaking'),'#f85149',13,'middle','bold','sans-serif');
    const dy=[-8,-3,3,8];
    frags.forEach(([s,e],fi)=>{
      for(let i=s;i<=Math.min(e,45);i++){
        const x=sx+i*bpW,base=REF[i],comp=COMPLEMENT[base];
        c+=drawBase(x,topY+dy[fi],base,bpW,bpH);
        c+=L(x+bpW/2,topY+dy[fi]+bpH,x+bpW/2,botY+dy[fi],'#3a4050',1.5);
        c+=drawBase(x,botY+dy[fi],comp,bpW,bpH);
      }
    });
    [9,19,28].forEach(pos=>{
      const cx=sx+pos*bpW+bpW;
      c+=L(cx,50,cx,H-50,'#f85149',1.5,'stroke-dasharray="4,3" opacity="0.7"');
      c+=T(cx,44,'✂','#f85149',14,'middle','normal','sans-serif');
    });
  } else {
    c+=T(W/2,28,t('svg.frag_done'),'#3fb950',14,'middle','bold','sans-serif');
    const fragColors=['rgba(56,139,253,0.12)','rgba(63,185,80,0.12)','rgba(210,153,34,0.12)','rgba(248,81,73,0.12)'];
    const fragY=[70,140,210,280];
    const dispW=17,dispH=22,lbx=120;
    frags.forEach(([s,e],fi)=>{
      const len=e-s+1;
      c+=R(16,fragY[fi]-4,768,dispH+8,fragColors[fi],4);
      c+=T(80,fragY[fi]+dispH/2+4,`${t('svg.frag')}${fi+1}`,'#c9d1d9',11,'middle','normal','sans-serif');
      c+=T(30,fragY[fi]+dispH/2+4,`${s+1}–${e+1}`,'#8b949e',10,'start','normal','monospace');
      for(let i=s;i<=e&&i<REF.length;i++) c+=drawBase(lbx+(i-s)*dispW,fragY[fi],REF[i],dispW,dispH);
      c+=T(lbx+len*dispW+18,fragY[fi]+dispH/2+4,`${len} bp`,'#8b949e',11,'start','normal','monospace');
    });
  }
  return c;
}

// ── Step 2: 文库构建 ─────────────────────────────────────────

function renderStep2(substep){
  const W=800,H=380;
  let c=R(0,0,W,H,'#0d1117');
  const frag=REF.slice(0,10), comp=frag.split('').map(b=>COMPLEMENT[b]).join('');
  const bpW=22,bpH=26,fragW=frag.length*bpW;
  const centerX=(W-fragW)/2,topY=140,botY=topY+bpH+8,adW=60;

  if(substep===0){
    c+=T(W/2,50,t('svg.take_frag'),'#8b949e',13,'middle','normal','sans-serif');
    for(let i=0;i<frag.length;i++){
      c+=drawBase(centerX+i*bpW,topY,frag[i],bpW,bpH);
      c+=L(centerX+i*bpW+bpW/2,topY+bpH,centerX+i*bpW+bpW/2,botY,'#3a4050',1.5);
      c+=drawBase(centerX+i*bpW,botY,comp[i],bpW,bpH);
    }
    c+=T(centerX-6,topY+bpH/2+4,"5'",'#388bfd',11,'end','normal','monospace');
    c+=T(centerX-6,botY+bpH/2+4,"3'",'#388bfd',11,'end','normal','monospace');
    c+=T(centerX+fragW+6,topY+bpH/2+4,"3'",'#388bfd',11,'start','normal','monospace');
    c+=T(centerX+fragW+6,botY+bpH/2+4,"5'",'#388bfd',11,'start','normal','monospace');
    c+=T(centerX-20,topY+bpH+4,t('svg.rough_end'),'#d29922',10,'end','normal','sans-serif');
  } else if(substep===1){
    c+=T(W/2,40,t('svg.end_repair'),'#388bfd',14,'middle','bold','sans-serif');
    c+=T(W/2,60,t('svg.end_repair_desc'),'#8b949e',12,'middle','normal','sans-serif');
    for(let i=0;i<frag.length;i++){
      c+=drawBase(centerX+i*bpW,topY,frag[i],bpW,bpH);
      c+=L(centerX+i*bpW+bpW/2,topY+bpH,centerX+i*bpW+bpW/2,botY,'#3a4050',1.5);
      c+=drawBase(centerX+i*bpW,botY,comp[i],bpW,bpH);
    }
    const ec='rgba(56,139,253,0.2)';
    c+=R(centerX-40,topY-10,32,bpH*2+18,ec,6);
    c+=T(centerX-24,topY+bpH+4,'T4','#388bfd',10,'middle','bold','sans-serif');
    c+=R(centerX+fragW+8,topY-10,32,bpH*2+18,ec,6);
    c+=T(centerX+fragW+24,topY+bpH+4,'T4','#388bfd',10,'middle','bold','sans-serif');
    c+=T(W/2,topY+bpH*2+30,t('svg.blunt_end'),'#3fb950',12,'middle','bold','sans-serif');
  } else if(substep===2){
    c+=T(W/2,40,t('svg.a_tailing'),'#d29922',14,'middle','bold','sans-serif');
    c+=T(W/2,60,t('svg.a_tailing_desc'),'#8b949e',12,'middle','normal','sans-serif');
    for(let i=0;i<frag.length;i++){
      c+=drawBase(centerX+i*bpW,topY,frag[i],bpW,bpH);
      c+=L(centerX+i*bpW+bpW/2,topY+bpH,centerX+i*bpW+bpW/2,botY,'#3a4050',1.5);
      c+=drawBase(centerX+i*bpW,botY,comp[i],bpW,bpH);
    }
    c+=drawBase(centerX+fragW+2,topY,'A',bpW,bpH);
    c+=drawBase(centerX-bpW-2,botY,'A',bpW,bpH);
    c+=T(centerX+fragW+bpW/2+2,topY-8,t('svg.a_tail_label'),'#d29922',10,'middle','normal','sans-serif');
  } else {
    c+=T(W/2,36,t('svg.adapter_done'),'#3fb950',14,'middle','bold','sans-serif');
    const p5='#6e40c9',p7='#1f6feb';
    c+=R(centerX-adW-2,topY,adW,bpH,p5+'33',4,'stroke="'+p5+'" stroke-width="1.5"');
    c+=T(centerX-adW/2-2,topY+bpH/2+5,'P5',p5,11,'middle','bold','sans-serif');
    c+=R(centerX-adW-2,botY,adW,bpH,p5+'22',4,'stroke="'+p5+'" stroke-width="1"');
    for(let i=0;i<frag.length;i++){
      c+=drawBase(centerX+i*bpW,topY,frag[i],bpW,bpH);
      c+=L(centerX+i*bpW+bpW/2,topY+bpH,centerX+i*bpW+bpW/2,botY,'#3a4050',1.5);
      c+=drawBase(centerX+i*bpW,botY,comp[i],bpW,bpH);
    }
    c+=R(centerX+fragW+2,topY,adW,bpH,p7+'33',4,'stroke="'+p7+'" stroke-width="1.5"');
    c+=T(centerX+fragW+adW/2+2,topY+bpH/2+5,'P7',p7,11,'middle','bold','sans-serif');
    c+=R(centerX+fragW+2,botY,adW,bpH,p7+'22',4,'stroke="'+p7+'" stroke-width="1"');
    c+=T(centerX-adW/2-2,topY-10,t('svg.adapter'),p5,10,'middle','normal','sans-serif');
    c+=T(centerX+fragW+adW/2+2,topY-10,t('svg.adapter'),p7,10,'middle','normal','sans-serif');
    c+=T(W/2,H-40,t('svg.lib_done'),'#3fb950',13,'middle','bold','sans-serif');
  }
  return c;
}

// ── Step 3: SBS 测序 ─────────────────────────────────────────

function renderStep3(substep){
  const W=800,H=380;
  let c=R(0,0,W,H,'#0d1117');
  const template=SBS_TEMPLATE, growing=SBS_GROWING;
  const numCycles=substep===0?0:Math.min(substep*2,8);
  const bpW=36,bpH=30,startX=100;
  const templateY=100,growY=templateY+bpH+12;

  c+=R(60,75,680,280,'#161b22',10,'stroke="#30363d" stroke-width="1"');
  c+=T(W/2,66,t('svg.flow_cell'),'#555',11,'middle','normal','sans-serif');

  if(substep===0){
    c+=T(W/2,50,t('svg.template_fixed'),'#8b949e',12,'middle','normal','sans-serif');
    c+=T(startX-20,templateY+bpH/2+4,"5'→",'#388bfd',11,'end','normal','monospace');
    for(let i=0;i<template.length;i++) c+=drawBase(startX+i*bpW,templateY,template[i],bpW,bpH);
    c+=T(startX+template.length*bpW+8,templateY+bpH/2+4,"→3'",'#388bfd',11,'start','normal','monospace');
    c+=R(startX-4,growY+2,60,22,'#6e40c922',4,'stroke="#6e40c9" stroke-width="1.5"');
    c+=T(startX+26,growY+16,t('svg.primer'),'#6e40c9',11,'middle','normal','sans-serif');
  } else {
    c+=T(W/2,50,t('svg.cycles_done',numCycles),'#3fb950',12,'middle','bold','sans-serif');
    c+=T(startX-20,templateY+bpH/2+4,"5'→",'#388bfd',11,'end','normal','monospace');
    for(let i=0;i<template.length;i++) c+=drawBase(startX+i*bpW,templateY,template[i],bpW,bpH);
    for(let i=0;i<numCycles;i++){
      c+=L(startX+i*bpW+bpW/2,templateY+bpH,startX+i*bpW+bpW/2,growY,'#3a4050',1.5);
      c+=drawBase(startX+i*bpW,growY,growing[i],bpW,bpH);
    }
    c+=T(startX-20,growY+bpH/2+4,"3'←",'#3fb950',11,'end','normal','monospace');
    if(numCycles<8){
      const px=startX+numCycles*bpW;
      c+=R(px-6,growY-10,bpW+10,bpH+20,'#d2992222',6,'stroke="#d29922" stroke-width="1.5"');
      c+=T(px+bpW/2,growY+bpH/2+4,'🧬','#d29922',16,'middle');
    }
    const sigY=growY+bpH+35;
    c+=L(startX-10,sigY,startX+template.length*bpW,sigY,'#30363d',1);
    for(let i=0;i<numCycles;i++){
      const base=growing[i],bx=startX+i*bpW+bpW/2;
      c+=R(bx-8,sigY-24,16,24,BASE_COLOR[base],2);
      c+=T(bx,sigY+12,base,BASE_COLOR[base],9,'middle','bold','monospace');
    }
    if(substep===5){
      const rs=growing.slice(0,8).join('');
      c+=T(W/2,H-65,t('svg.read_done'),'#3fb950',13,'middle','bold','sans-serif');
      c+=R(180,H-52,440,28,'#161b22',4,'stroke="#30363d"');
      c+=T(W/2,H-33,rs,'#3fb950',15,'middle','bold','monospace');
    }
  }
  return c;
}

// ── Step 4: 碱基识别 ─────────────────────────────────────────

function renderStep4(substep){
  const W=800,H=380;
  let c=R(0,0,W,H,'#0d1117');
  const nPos=8,barMaxH=90,barW=10,chartX=60,chartY=80,chartW=500,chartH=barMaxH+20,posW=chartW/nPos;
  const bases=['A','T','C','G'];

  if(substep===0){
    c+=T(W/2,38,t('svg.raw_signal'),'#c9d1d9',14,'middle','bold','sans-serif');
    c+=T(W/2,56,t('svg.signal_desc'),'#8b949e',12,'middle','normal','sans-serif');
    c+=L(chartX,chartY,chartX,chartY+chartH,'#30363d',1);
    c+=T(chartX-5,chartY,'100','#555',9,'end');
    c+=T(chartX-5,chartY+barMaxH,'0','#555',9,'end');
    c+=L(chartX,chartY+chartH,chartX+chartW,chartY+chartH,'#30363d',1);
    let legX=chartX+chartW+30;
    bases.forEach((b,i)=>{ c+=R(legX,chartY+i*22,12,12,BASE_COLOR[b],2); c+=T(legX+16,chartY+i*22+10,b,'#c9d1d9',11,'start','normal','monospace'); });
    SIGNAL_DATA.forEach((sd,pos)=>{
      const px=chartX+pos*posW+10;
      bases.forEach((b,bi)=>{ const sig=sd.signals[b],bh=sig/100*barMaxH,bx=px+bi*(barW+1); c+=R(bx,chartY+barMaxH-bh,barW,bh,BASE_COLOR[b]+'cc',1); });
      c+=T(chartX+pos*posW+posW/2+10,chartY+chartH+14,`${pos+1}`,'#8b949e',10,'middle','normal','monospace');
    });
  } else if(substep===1){
    c+=T(W/2,38,t('svg.base_calling'),'#c9d1d9',14,'middle','bold','sans-serif');
    const seqY=280,seqX=chartX+10,bpW2=52;
    SIGNAL_DATA.forEach((sd,pos)=>{
      const px=chartX+pos*posW+10;
      bases.forEach((b,bi)=>{ const sig=sd.signals[b],bh=sig/100*barMaxH,bx=px+bi*(barW+1),isMax=(b===sd.base); c+=R(bx,chartY+barMaxH-bh,barW,bh,BASE_COLOR[b]+(isMax?'':'55'),1,isMax?'stroke="#fff" stroke-width="0.8"':''); });
      c+=T(chartX+pos*posW+posW/2+10,chartY+chartH+14,`${pos+1}`,'#8b949e',10,'middle');
      c+=L(chartX+pos*posW+posW/2+10,chartY+barMaxH+18,seqX+pos*bpW2+bpW2/2,seqY-4,'#30363d',1,'stroke-dasharray="3,2"');
      c+=`<polygon points="${seqX+pos*bpW2+bpW2/2},${seqY} ${seqX+pos*bpW2+bpW2/2-4},${seqY-8} ${seqX+pos*bpW2+bpW2/2+4},${seqY-8}" fill="#30363d"/>`;
      c+=drawBase(seqX+pos*bpW2,seqY,sd.base,bpW2,30);
    });
  } else if(substep===2){
    c+=T(W/2,38,t('svg.phred'),'#c9d1d9',14,'middle','bold','sans-serif');
    const seqX=60,seqY=100,bpW2=52,bpH2=30,qbarY=170,qbarMaxH=70;
    SIGNAL_DATA.forEach((sd,pos)=>{
      const x=seqX+pos*bpW2;
      c+=drawBase(x,seqY,sd.base,bpW2,bpH2);
      const q=SBS_GROWING.slice(0,8).map((_,i)=>genQual(1,i))[pos]||28;
      const qBarH=q/40*qbarMaxH,qColor=q>=30?'#3fb950':q>=20?'#d29922':'#f85149';
      c+=R(x+4,qbarY+qbarMaxH-qBarH,bpW2-10,qBarH,qColor+'88',2);
      c+=T(x+bpW2/2,qbarY+qbarMaxH-qBarH-4,`Q${q}`,qColor,10,'middle','bold','monospace');
      c+=L(x+bpW2/2,seqY+bpH2,x+bpW2/2,qbarY,'#30363d',1,'stroke-dasharray="3,2"');
    });
    c+=L(seqX-4,qbarY,seqX+8*52,qbarY,'#30363d',1);
    c+=T(seqX-6,qbarY+qbarMaxH*0.25,'Q30','#3fb950',9,'end','normal','monospace');
    c+=L(seqX-4,qbarY+qbarMaxH*0.25,seqX+8*52,qbarY+qbarMaxH*0.25,'#30363d',0.5,'stroke-dasharray="4,3"');
    c+=T(seqX-6,qbarY+qbarMaxH*0.5,'Q20','#d29922',9,'end','normal','monospace');
    c+=L(seqX-4,qbarY+qbarMaxH*0.5,seqX+8*52,qbarY+qbarMaxH*0.5,'#30363d',0.5,'stroke-dasharray="4,3"');
  } else {
    c+=T(W/2,38,t('svg.fastq_output'),'#c9d1d9',14,'middle','bold','sans-serif');
    const seq8=SBS_GROWING.slice(0,8).join(''),qual8=seq8.split('').map((_,i)=>qChar(genQual(1,i))).join('');
    const lines=[
      {text:`@Lib_Frag1_Read_001`,color:'#388bfd',label:t('svg.fastq_id')},
      {text:seq8+'ACGT',color:'#3fb950',label:t('svg.fastq_seq')},
      {text:'+',color:'#8b949e',label:t('svg.fastq_sep')},
      {text:qual8+'IIHH',color:'#d29922',label:t('svg.fastq_qual')},
    ];
    lines.forEach((l,i)=>{ c+=R(80,100+i*60,500,40,'#161b22',4,'stroke="#30363d"'); c+=T(90,100+i*60+26,l.text,l.color,13,'start','normal','monospace'); c+=T(600,100+i*60+26,l.label,'#8b949e',11,'start','normal','sans-serif'); });
    c+=T(80,358,t('svg.ascii_example'),'#8b949e',11,'start','normal','monospace');
  }
  return c;
}

// ── Step 5: 序列比对（完整算法可视化）──────────────────────

function renderStep5(substep){
  const W=800, H=380;
  let c = R(0,0,W,H,'#0d1117');
  const k = CFG.kmerK;

  // ── 参考序列通用显示参数 ──────────────────────────────────
  const bpW    = Math.max(7, Math.min(15, Math.floor(680/REF.length)));
  const bpH    = Math.min(20, Math.max(12, bpW));
  const refTW  = REF.length * bpW;
  const refX   = Math.floor((W - refTW) / 2);
  const refY   = 42;
  const showLb = bpW >= 11;

  // 绘制参考序列（可选高亮集合）
  function drawRef(hlSet) {
    hlSet = hlSet || new Set();
    c += T(refX-6, refY+bpH/2+4, t('svg.ref'), '#8b949e', 9, 'end', 'normal', 'sans-serif');
    for (let i = 0; i < REF.length; i++) {
      const base=REF[i], isSnp=(i===SNP_POS), isHl=hlSet.has(i);
      c += R(refX+i*bpW, refY, bpW-1, bpH,
             BASE_COLOR[base]+(isSnp||isHl?'':'88'), 2,
             isSnp ? 'stroke="#fff" stroke-width="1.5"' :
             isHl  ? 'stroke="#d29922" stroke-width="1.2"' : '');
      if (showLb) c += T(refX+i*bpW+bpW/2, refY+bpH/2+4, base, '#fff'+(isSnp||isHl?'':'cc'), 8, 'middle', 'bold');
    }
    for (let i=0; i<REF.length; i+=5) {
      c += T(refX+i*bpW+bpW/2, refY-6, `${i+1}`, '#555', 8, 'middle', 'normal', 'monospace');
    }
  }

  // ──────────────────────────────────────────────────────────
  if (substep === 0) {
  // ① K-mer 索引构建
    c += T(W/2, 20, t('svg.kmer_index_title',k), '#c9d1d9', 11, 'middle', 'bold', 'sans-serif');
    drawRef();

    // 3个滑窗示例
    const winPos = [0, Math.floor(REF.length/3), Math.floor(REF.length*2/3)];
    const winCol = ['#388bfd','#3fb950','#d29922'];
    winPos.forEach((wp, wi) => {
      if (wp+k > REF.length) return;
      c += R(refX+wp*bpW-1, refY-2, k*bpW, bpH+4, 'none', 3, `stroke="${winCol[wi]}" stroke-width="2"`);
      const km=REF.slice(wp,wp+k), posStr=(KMER_INDEX[km]||[]).map(p=>p+1).join(',');
      c += T(refX+wp*bpW+k*bpW/2, refY+bpH+15, `${km}→[${posStr}]`, winCol[wi], 8, 'middle', 'normal', 'monospace');
    });

    // K-mer索引表（最多14行，2列）
    const entries = Object.entries(KMER_INDEX).slice(0, 14);
    const tY=refY+bpH+36, rowH=22, kbw=10;
    c += T(W/2, tY-8, t('svg.kmer_table',Object.keys(KMER_INDEX).length), '#8b949e', 10, 'middle', 'bold', 'sans-serif');
    entries.forEach(([km, positions], idx) => {
      const col = idx>=7?1:0, row = idx>=7?idx-7:idx;
      const tx  = col===0?28:W/2+8;
      const ty  = tY+8+row*rowH;
      c += R(tx, ty, 376, rowH-2, idx%2===0?'#161b22':'#1c2333', 3);
      for (let ki=0; ki<km.length; ki++) {
        c += R(tx+4+ki*kbw, ty+3, kbw-1, rowH-8, BASE_COLOR[km[ki]], 1);
        if (kbw>=9) c += T(tx+4+ki*kbw+kbw/2, ty+rowH/2+3, km[ki], '#fff', 7, 'middle', 'bold');
      }
      c += T(tx+4+km.length*kbw+6, ty+rowH/2+3, '→', '#555', 9, 'start');
      const psStr = positions.length<=4
        ? `[${positions.map(p=>p+1).join(', ')}]`
        : `[${positions.slice(0,4).map(p=>p+1).join(', ')}…]`;
      c += T(tx+4+km.length*kbw+18, ty+rowH/2+3, psStr, '#3fb950', 9, 'start', 'normal', 'monospace');
    });

  } else if (substep === 1) {
  // ② 种子提取
    const read1 = READS[0];
    const hits  = findSeedHits(read1.seq, k);
    c += T(W/2, 20, t('svg.seed_extract',k), '#c9d1d9', 11, 'middle', 'bold', 'sans-serif');

    const hlSet = new Set();
    hits.forEach(h => { for (let i=0;i<k;i++) hlSet.add(h.refPos+i); });
    drawRef(hlSet);

    // 绘制 Read 1
    const r1Y = refY+bpH+26;
    c += T(refX-6, r1Y+bpH/2+4, 'Read 1', '#8b949e', 8, 'end', 'normal', 'sans-serif');
    for (let j=0; j<read1.len; j++) {
      const gp=read1.start+j;
      if (gp>=REF.length) break;
      c += drawBase(refX+gp*bpW, r1Y, read1.seq[j], bpW, bpH, showLb);
    }

    // 展示前3个种子窗口
    const stride = Math.max(1, k-2);
    const seedColors = ['#388bfd','#3fb950','#d29922'];
    let shown = 0;
    for (let i=0; i+k<=read1.seq.length && shown<3; i+=stride) {
      const km=read1.seq.slice(i,i+k);
      const refHits=(KMER_INDEX[km]||[]).filter(rp=>rp-i>=0&&rp-i+read1.len<=REF.length);
      const sc=seedColors[shown];
      const winX=refX+(read1.start+i)*bpW;
      c += R(winX-1, r1Y-2, k*bpW, bpH+4, 'none', 3, `stroke="${sc}" stroke-width="2"`);
      c += T(winX+k*bpW/2, r1Y-10, km, sc, 8, 'middle', 'bold', 'monospace');
      // 曲线箭头→参考
      refHits.slice(0,1).forEach(rp => {
        const sx2=winX+k*bpW/2, dx=refX+rp*bpW+k*bpW/2;
        c += P(`M ${sx2} ${r1Y} C ${sx2} ${r1Y-18} ${dx} ${refY+bpH+14} ${dx} ${refY+bpH}`, 'none', sc, 1.3, 'stroke-dasharray="4,2" opacity="0.75"');
        c += R(refX+rp*bpW-1, refY-2, k*bpW, bpH+4, 'none', 2, `stroke="${sc}" stroke-width="1.5" opacity="0.9"`);
      });
      shown++;
    }

    const uniq=Object.keys(voteAlignment(hits)).length;
    c += T(W/2, H-22, t('svg.seed_result',hits.length,uniq), '#8b949e', 11, 'middle', 'normal', 'sans-serif');

  } else if (substep === 2) {
  // ③ 位置投票
    c += T(W/2, 20, t('svg.voting'), '#c9d1d9', 11, 'middle', 'bold', 'sans-serif');
    drawRef();

    const read1 = READS[0];
    const hits  = findSeedHits(read1.seq, k);
    const votes = voteAlignment(hits);
    const vArr  = Object.entries(votes)
      .map(([s,v]) => ({start:+s, votes:v}))
      .filter(e => e.start>=0 && e.start+read1.len<=REF.length)
      .sort((a,b) => a.start-b.start);

    if (!vArr.length) {
      c += T(W/2, H/2, t('svg.no_candidate'), '#f85149', 13, 'middle', 'bold', 'sans-serif');
      return c;
    }
    const maxV  = Math.max(...vArr.map(e=>e.votes));
    const bestE = vArr.reduce((b,e)=>e.votes>b.votes?e:b, vArr[0]);
    const chX=56, chY=refY+bpH+20, chW=688, chH=140, bMaxH=chH-24;
    const bW = Math.max(5, Math.min(40, Math.floor(chW/vArr.length)-3));

    c += R(chX-6, chY-8, chW+12, chH+30, '#161b22', 4, 'stroke="#30363d" stroke-width="1"');
    c += L(chX, chY+bMaxH, chX+chW, chY+bMaxH, '#30363d', 1);
    c += T(chX-8, chY, `${maxV}`, '#555', 8, 'end', 'normal', 'monospace');
    c += T(chX-8, chY+bMaxH, '0', '#555', 8, 'end', 'normal', 'monospace');
    c += T(W/2, chY-16, t('svg.candidate_pos'), '#8b949e', 10, 'middle', 'normal', 'sans-serif');

    vArr.forEach((e, idx) => {
      const bx=chX+idx*(bW+3), bh=(e.votes/maxV)*bMaxH, isBest=e.start===bestE.start;
      c += R(bx, chY+bMaxH-bh, bW, bh, isBest?'#3fb950':'#388bfd55', 2, isBest?'stroke="#3fb950" stroke-width="1"':'');
      c += T(bx+bW/2, chY+bMaxH+11, `${e.start+1}`, isBest?'#3fb950':'#555', 7, 'middle', 'normal', 'monospace');
      if (isBest) c += T(bx+bW/2, chY+bMaxH-bh-9, `★${e.votes}`, '#3fb950', 8, 'middle', 'bold', 'sans-serif');
    });
    c += T(W/2, H-22, t('svg.best_pos',bestE.start+1,bestE.votes), '#3fb950', 11, 'middle', 'bold', 'sans-serif');

  } else if (substep === 3) {
  // ④ 比对验证（简化 Smith-Waterman）
    const read1 = READS[0];
    const hits  = findSeedHits(read1.seq, k);
    const votes = voteAlignment(hits);
    const vArr  = Object.entries(votes)
      .map(([s,v])=>({start:+s,votes:v}))
      .filter(e=>e.start>=0&&e.start+read1.len<=REF.length);
    const bestStart = vArr.length
      ? vArr.reduce((b,e)=>e.votes>b.votes?e:b, vArr[0]).start
      : read1.start;
    const aln = scoreAlignment(read1.seq, bestStart);

    c += T(W/2, 20, t('svg.align_verify',bestStart+1), '#c9d1d9', 11, 'middle', 'bold', 'sans-serif');
    drawRef();

    const alnY=refY+bpH+10, symY=refY+bpH+1;
    c += T(refX-6, alnY+bpH/2+4, 'Read 1', '#8b949e', 8, 'end', 'normal', 'sans-serif');

    for (let j=0; j<read1.len; j++) {
      const gp=bestStart+j;
      if (gp>=REF.length) break;
      const rBase=read1.seq[j], refBase=REF[gp], isM=(rBase===refBase);
      c += drawBase(refX+gp*bpW, alnY, rBase, bpW, bpH, showLb);
      if (!isM) c += R(refX+gp*bpW-1, alnY-1, bpW, bpH+2, 'none', 2, 'stroke="#f85149" stroke-width="2"');
      c += T(refX+gp*bpW+bpW/2, symY+5, isM?'|':'✗', isM?'#3fb95066':'#f85149', isM?10:9, 'middle');
    }

    const sx2=160, sy2=alnY+bpH+18;
    c += R(sx2, sy2, W-2*sx2, 80, '#161b22', 6, 'stroke="#30363d" stroke-width="1"');
    c += T(W/2, sy2+18, t('svg.match_stat',aln.matches,aln.mismatches), '#8b949e', 11, 'middle', 'normal', 'monospace');
    c += T(W/2, sy2+38, t('svg.sw_score',aln.score), '#c9d1d9', 13, 'middle', 'bold', 'monospace');
    const accepted = aln.score > 0;
    c += T(W/2, sy2+60, accepted?t('svg.accept',aln.score):t('svg.reject',aln.score), accepted?'#3fb950':'#f85149', 11, 'middle', 'bold', 'sans-serif');

  } else {
  // ⑤⑥ Pileup（前半 / 全部 + 覆盖深度）
    const isFull  = substep === 5;
    const visCount= isFull ? READS.length : Math.ceil(READS.length/2);
    const visReads= READS.slice(0, visCount);

    c += T(W/2, 20, isFull
      ? t('svg.full_pileup',READS.length,SNP_POS+1)
      : t('svg.partial_pileup',visCount,READS.length),
      isFull?'#3fb950':'#c9d1d9', 11, 'middle', 'bold', 'sans-serif');

    // SNP列高亮（仅全Pileup）
    if (isFull) {
      const snpColX=refX+SNP_POS*bpW;
      c += R(snpColX-1, refY-4, bpW, H-62, 'rgba(248,81,73,0.07)', 0, 'stroke="#f85149" stroke-width="1" stroke-dasharray="4,3"');
    }
    drawRef();

    // Pileup rows
    const availH   = H - refY - bpH - (isFull?50:20);
    const maxRows   = Math.max(1, Math.min(visReads.length, Math.floor(availH/(Math.max(9,bpH-4)))));
    const pRowH     = Math.floor(availH/Math.max(1,Math.min(visReads.length,maxRows)));
    const pileupY   = refY+bpH+4;

    visReads.slice(0, maxRows).forEach((rd, ri) => {
      const ry=pileupY+ri*pRowH;
      for (let j=0; j<rd.len; j++) {
        const gp=rd.start+j;
        if (gp>=REF.length) break;
        const base=rd.seq[j], isMis=(base!==REF[gp]);
        c += R(refX+gp*bpW, ry, bpW-1, pRowH-1, BASE_COLOR[base]+(isMis?'':'66'), 1,
               isMis?'stroke="#f85149" stroke-width="1"':'');
        if (pRowH>=13 && showLb)
          c += T(refX+gp*bpW+bpW/2, ry+pRowH/2+3, base, '#fff', 7, 'middle', 'bold');
      }
    });
    if (visReads.length>maxRows) {
      c += T(refX, pileupY+maxRows*pRowH+8, t('svg.more_reads',visReads.length-maxRows), '#555', 9, 'start', 'normal', 'sans-serif');
    }

    // 覆盖深度图（仅全Pileup）
    if (isFull) {
      const depth=new Array(REF.length).fill(0);
      READS.forEach(r => { for(let j=0;j<r.len;j++) if(r.start+j<REF.length) depth[r.start+j]++; });
      const maxD=Math.max(...depth,1), covY=H-42, covH=28;
      c += L(refX-2,covY,refX+REF.length*bpW,covY,'#30363d',1);
      depth.forEach((d,i)=>{
        const bh=(d/maxD)*covH;
        c += R(refX+i*bpW, covY-bh, bpW-1, bh, i===SNP_POS?'#f8514988':'#388bfd66', 1);
      });
      c += T(refX-6, covY-covH/2, t('svg.depth'), '#555', 7, 'end', 'normal', 'sans-serif');
      c += T(refX-6, covY, '0', '#555', 7, 'end', 'normal', 'monospace');
      c += T(refX-6, covY-covH, `${maxD}`, '#555', 7, 'end', 'normal', 'monospace');
      const avgCov=(depth.reduce((a,b)=>a+b,0)/REF.length).toFixed(1);
      c += T(W/2, H-10, t('svg.avg_cov',avgCov,SNP_POS+1,depth[SNP_POS]), '#555', 9, 'middle', 'normal', 'sans-serif');
    }
  }
  return c;
}

// ── Step 6: 变异识别（使用动态SNP数据）────────────────────

function renderStep6(substep){
  const W=800,H=380;
  let c=R(0,0,W,H,'#0d1117');

  const snpBases=[];
  READS.forEach(r=>{
    if(r.start<=SNP_POS && SNP_POS<r.start+r.len){
      snpBases.push({readId:r.id, base:r.seq[SNP_POS-r.start]});
    }
  });
  const refCount = snpBases.filter(x=>x.base===SNP_REF_BASE).length;
  const altCount = snpBases.filter(x=>x.base===SNP_ALT_BASE).length;
  const total    = snpBases.length;

  if(substep===0){
    c+=T(W/2,36,t('svg.snp_focus',SNP_POS+1,SNP_REF_BASE),'#c9d1d9',13,'middle','bold','sans-serif');
    c+=T(W/2,56,t('svg.pileup_view'),'#8b949e',12,'middle','normal','sans-serif');
    const bpW2=36,bpH2=28,colX=380,context=5;
    const ctxStart=Math.max(0,SNP_POS-context),ctxEnd=Math.min(REF.length-1,SNP_POS+context);
    const refY2=88;
    for(let i=ctxStart;i<=ctxEnd;i++){
      const x=colX+(i-SNP_POS)*bpW2-bpW2/2,isSnp=(i===SNP_POS);
      c+=R(x,refY2,bpW2-2,bpH2,BASE_COLOR[REF[i]]+(isSnp?'':'55'),2,isSnp?'stroke="#fff" stroke-width="2"':'');
      c+=T(x+bpW2/2-1,refY2+bpH2/2+5,REF[i],'#fff'+(isSnp?'':'88'),isSnp?13:10,'middle','bold');
      c+=T(x+bpW2/2-1,refY2-7,`${i+1}`,'#555',8,'middle');
    }
    c+=T(colX,refY2-18,t('svg.ref'),'#8b949e',10,'middle','normal','sans-serif');
    const rowH2=28;
    snpBases.forEach((sb,ri)=>{
      const ry=refY2+bpH2+14+ri*rowH2,isMis=(sb.base!==SNP_REF_BASE);
      c+=T(colX-context*bpW2-22,ry+rowH2/2+4,`R${sb.readId}`,'#8b949e',10,'end','normal','monospace');
      c+=R(colX-bpW2/2,ry,bpW2-2,rowH2-2,BASE_COLOR[sb.base]+(isMis?'':'88'),2,isMis?'stroke="#f85149" stroke-width="1.5"':'');
      c+=T(colX,ry+rowH2/2+4,sb.base,'#fff',12,'middle','bold');
    });
  } else if(substep===1){
    c+=T(W/2,36,t('svg.allele_stats'),'#c9d1d9',14,'middle','bold','sans-serif');
    const bpS=26,colX=120;
    snpBases.slice(0,10).forEach((sb,ri)=>{
      const ry=76+ri*30,isMis=(sb.base!==SNP_REF_BASE);
      c+=R(colX,ry,bpS-2,bpS-2,BASE_COLOR[sb.base]+(isMis?'':'88'),2,isMis?'stroke="#f85149" stroke-width="1.5"':'');
      c+=T(colX+bpS/2-1,ry+bpS/2+4,sb.base,'#fff',11,'middle','bold');
      c+=T(colX+bpS+8,ry+bpS/2+4,`Read ${sb.readId} → ${sb.base}`,isMis?'#f85149':'#c9d1d9',10,'start','normal','monospace');
    });
    const cx=500,cy=88;
    c+=T(cx,cy-16,t('svg.pos_stats',SNP_POS+1),'#c9d1d9',13,'middle','bold','sans-serif');
    if(total>0){
      c+=R(cx-70,cy,50,refCount/total*120,BASE_COLOR[SNP_REF_BASE],4);
      c+=T(cx-45,cy+refCount/total*120+14,`${SNP_REF_BASE}: ${refCount}条`,BASE_COLOR[SNP_REF_BASE],11,'middle','bold','sans-serif');
      c+=R(cx+20,cy,50,altCount/total*120,BASE_COLOR[SNP_ALT_BASE],4);
      c+=T(cx+45,cy+altCount/total*120+14,`${SNP_ALT_BASE}: ${altCount}条`,BASE_COLOR[SNP_ALT_BASE],11,'middle','bold','sans-serif');
      c+=L(cx-80,cy,cx+80,cy,'#30363d',1);
      c+=T(cx,cy+148,t('svg.total_depth',total),'#8b949e',11,'middle','normal','sans-serif');
      c+=T(cx,cy+166,`VAF：${altCount}/${total} = ${(altCount/total*100).toFixed(0)}%`,'#c9d1d9',12,'middle','bold','monospace');
    }
  } else if(substep===2){
    c+=T(W/2,36,t('svg.bayesian'),'#c9d1d9',14,'middle','bold','sans-serif');
    c+=T(W/2,56,t('svg.bayesian_formula'),'#8b949e',12,'middle','normal','monospace');
    const vaf=total>0?altCount/total:0;
    const probs=[Math.max(0.01,1-vaf*2), Math.min(0.97,vaf*(1-vaf)*4), Math.max(0.01,vaf*2-1)];
    const sum=probs.reduce((a,b)=>a+b,0);
    const gts=[
      {name:t('svg.gt_homo_ref',SNP_REF_BASE),prob:probs[0]/sum,color:'#8b949e',desc:t('svg.gt_homo_ref_desc')},
      {name:t('svg.gt_het',SNP_REF_BASE,SNP_ALT_BASE),prob:probs[1]/sum,color:'#3fb950',desc:t('svg.gt_het_desc')},
      {name:t('svg.gt_homo_alt',SNP_ALT_BASE),prob:probs[2]/sum,color:'#f85149',desc:t('svg.gt_homo_alt_desc')},
    ];
    gts.forEach((gt,i)=>{
      const gy=100+i*78,bw=gt.prob*420;
      c+=T(80,gy+12,gt.name,gt.color,12,'start','bold','monospace');
      c+=R(80,gy+18,bw,22,gt.color+'55',4,'stroke="'+gt.color+'" stroke-width="1"');
      c+=T(80+bw+8,gy+33,`P = ${(gt.prob*100).toFixed(0)}%`,gt.color,11,'start','bold','monospace');
      c+=T(80,gy+52,gt.desc,'#8b949e',10,'start','normal','sans-serif');
    });
    const bestGT=gts.reduce((b,g)=>g.prob>b.prob?g:b,gts[0]);
    c+=T(W/2,H-38,t('svg.best_gt',bestGT.name,(bestGT.prob*100).toFixed(0)),'#3fb950',11,'middle','bold','sans-serif');
  } else {
    c+=T(W/2,40,t('svg.variant_done'),'#3fb950',15,'middle','bold','sans-serif');
    c+=T(W/2,68,t('svg.vcf_output'),'#8b949e',12,'middle','normal','sans-serif');
    const vaf=total>0?altCount/total:0;
    const vcfLines=[
      '##fileformat=VCFv4.2',
      '##reference=mock_genome.fa',
      '#CHROM  POS  ID  REF  ALT  QUAL  FILTER  INFO              FORMAT  SAMPLE',
      `chr1    ${SNP_POS+1}   .   ${SNP_REF_BASE}    ${SNP_ALT_BASE}    60    PASS    DP=${total};AF=${vaf.toFixed(3)}   GT:GQ   0/1:60`,
    ];
    vcfLines.forEach((l,i)=>{ const ly=100+i*36,isData=i===3; c+=R(40,ly,720,30,'#161b22',3,'stroke="#30363d"'); c+=T(52,ly+20,l,isData?'#3fb950':'#555',11,'start','normal','monospace'); });
    c+=R(40,258,720,90,'rgba(63,185,80,0.08)',6,'stroke="#3fb950" stroke-width="1"');
    c+=T(W/2,278,t('svg.summary'),'#3fb950',13,'middle','bold','sans-serif');
    c+=T(W/2,298,t('svg.snp_result',SNP_POS+1,SNP_REF_BASE,SNP_ALT_BASE),'#c9d1d9',12,'middle','normal','sans-serif');
    c+=T(W/2,316,t('svg.snp_detail',(vaf*100).toFixed(0),total),'#8b949e',11,'middle','normal','sans-serif');
  }
  return c;
}

// ── 应用状态 ──────────────────────────────────────────────────

let curStep   = 0;
let curSub    = 0;
let isPlaying = false;
let playTimer = null;
const PLAY_INTERVAL = 2200;

// ── UI 更新 ───────────────────────────────────────────────────

function updateStepNav(){
  const inner=document.getElementById('step-bar-inner');
  inner.innerHTML='';
  STEPS.forEach((s,i)=>{
    const div=document.createElement('div');
    div.className='step-item'+(i===curStep?' active':i<curStep?' done':'');
    div.innerHTML=`<div class="step-num">${i+1}</div><div class="step-name">${s.nav || s.title}</div>`;
    div.addEventListener('click',()=>goToStep(i));
    inner.appendChild(div);
    if(i<STEPS.length-1){ const conn=document.createElement('div'); conn.className='step-connector'; inner.appendChild(conn); }
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
  STEPS = getSteps();
  const step=STEPS[curStep];
  document.getElementById('step-title').textContent=step.title;
  document.getElementById('step-desc').textContent=step.desc;
  document.getElementById('theory-content').innerHTML=step.theory;
  document.getElementById('main-svg').innerHTML=step.render(curSub);
  updateStepNav();
  updateSubstepDots();
  updateButtons();
}

function updateButtons(){
  const maxSub=STEPS[curStep].substepLabels.length-1;
  document.getElementById('btn-prev').disabled=(curStep===0);
  document.getElementById('btn-next').disabled=(curStep===STEPS.length-1);
  document.getElementById('btn-sub-prev').disabled=(curSub===0&&curStep===0);
  document.getElementById('btn-sub-next').disabled=(curSub===maxSub&&curStep===STEPS.length-1);
  const pb=document.getElementById('btn-play');
  if(isPlaying){ pb.textContent=t('ctrl.pause'); pb.classList.add('playing'); }
  else         { pb.textContent=t('ctrl.play'); pb.classList.remove('playing'); }
}

// ── 导航逻辑 ─────────────────────────────────────────────────

function goToStep(i){ pausePlay(); curStep=i; curSub=0; render(); }
function prevStep(){ if(curStep>0){ pausePlay(); curStep--; curSub=0; render(); } }
function nextStep(){ if(curStep<STEPS.length-1){ pausePlay(); curStep++; curSub=0; render(); } }

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

function startPlay(){ isPlaying=true; updateButtons(); advanceFrame(); }
function pausePlay(){ isPlaying=false; clearTimeout(playTimer); updateButtons(); }
function togglePlay(){ if(isPlaying) pausePlay(); else startPlay(); }

function advanceFrame(){
  if(!isPlaying) return;
  const maxSub=STEPS[curStep].substepLabels.length-1;
  if(curSub<maxSub){ curSub++; render(); playTimer=setTimeout(advanceFrame,PLAY_INTERVAL); }
  else if(curStep<STEPS.length-1){ curStep++; curSub=0; render(); playTimer=setTimeout(advanceFrame,PLAY_INTERVAL); }
  else pausePlay();
}

// ── 配置面板 ─────────────────────────────────────────────────

function initConfigPanel(){
  const sliders=[
    {id:'sl-dna',  valId:'val-dna',  suffix:' bp', key:'dnaLen'},
    {id:'sl-read', valId:'val-read', suffix:' bp', key:'readLen'},
    {id:'sl-cov',  valId:'val-cov',  suffix:' ×',  key:'coverage'},
    {id:'sl-kmer', valId:'val-kmer', suffix:'',    key:'kmerK'},
  ];
  sliders.forEach(({id,valId,suffix,key})=>{
    const el=document.getElementById(id);
    const vl=document.getElementById(valId);
    if(!el||!vl) return;
    el.value = CFG[key];
    vl.textContent = CFG[key]+suffix;
    el.addEventListener('input',()=>{ vl.textContent=el.value+suffix; });
  });

  const btn=document.getElementById('btn-generate');
  if(btn) btn.addEventListener('click',()=>{
    const newCfg={};
    sliders.forEach(({id,key})=>{
      const el=document.getElementById(id);
      if(el) newCfg[key]=parseInt(el.value);
    });
    // 验证 readLen <= dnaLen
    if(newCfg.readLen>newCfg.dnaLen-2) newCfg.readLen=newCfg.dnaLen-2;
    if(newCfg.kmerK>=newCfg.readLen)   newCfg.kmerK=newCfg.readLen-1;
    generateData(newCfg);
    // 同步滑块显示（可能被修正）
    sliders.forEach(({id,valId,suffix,key})=>{
      const el=document.getElementById(id); const vl=document.getElementById(valId);
      if(el){ el.value=CFG[key]; } if(vl){ vl.textContent=CFG[key]+suffix; }
    });
    pausePlay(); curStep=0; curSub=0; render();
  });
}

// ── 初始化 ────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('btn-prev').addEventListener('click', prevStep);
  document.getElementById('btn-next').addEventListener('click', nextStep);
  document.getElementById('btn-play').addEventListener('click', togglePlay);
  document.getElementById('btn-sub-prev').addEventListener('click', subPrev);
  document.getElementById('btn-sub-next').addEventListener('click', subNext);

  document.addEventListener('keydown', e=>{
    if(e.key==='ArrowRight') subNext();
    else if(e.key==='ArrowLeft') subPrev();
    else if(e.key===' '){ e.preventDefault(); togglePlay(); }
  });

  initConfigPanel();
  render();
});
