# 🧬 NGS Algorithm Visualization

**中文** | [English](#english)

二代基因组测序（Next-Generation Sequencing）完整生信流程的交互式可视化教学工具。

🔗 **在线演示**: [ngs-algorithm-visualization.vercel.app](https://ngs-algorithm-visualization.vercel.app)

📄 **技术文档**: [docs.html](https://ngs-algorithm-visualization.vercel.app/docs.html)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?logo=javascript&logoColor=black)
![Zero Dependencies](https://img.shields.io/badge/依赖-0-brightgreen)

---

## 功能特性

- **6 步可视化流程** — 从 DNA 样本到变异报告，完整覆盖 Illumina NGS 流程
- **交互式动画** — 支持自动播放、手动逐帧浏览、暂停与回退
- **参数可配置** — 实时调节参考序列长度、读段长度、测序深度、K-mer 大小
- **中英双语** — 一键切换中文 / English 界面
- **零依赖** — 纯 HTML + CSS + JavaScript，无需任何框架或库
- **教学友好** — 每个步骤配有详细的原理讲解面板

## 可视化流程

| 步骤 | 名称 | 说明 |
|:---:|------|------|
| 1 | DNA 片段化 | 基因组 DNA 通过超声或酶切打断为短片段 |
| 2 | 文库构建 | 为片段两端添加接头序列 |
| 3 | SBS 边合成边测序 | 荧光核苷酸逐循环合成，实时读取碱基信号 |
| 4 | 碱基识别 | 分析荧光信号，识别碱基并计算 Phred 质量分 |
| 5 | 序列比对 | K-mer 种子索引 + 投票策略 + Smith-Waterman 打分比对 |
| 6 | 变异识别 | 贝叶斯统计分析识别 SNP/Indel，输出 VCF 格式 |

## 快速开始

```bash
# 克隆项目
git clone https://github.com/GChenSi-2/ngs-algorithm-visualization.git
cd ngs-algorithm-visualization

# 启动本地服务器（任选一种）
python -m http.server 8080
# 或
npx serve .
```

浏览器打开 `http://localhost:8080` 即可使用。

## 键盘快捷键

| 按键 | 功能 |
|:---:|------|
| `→` | 下一帧 |
| `←` | 上一帧 |
| `Space` | 播放 / 暂停 |

## 项目结构

```
├── index.html        # 主页面
├── docs.html         # 技术说明文档
├── css/
│   └── style.css     # 样式（GitHub Dark 主题）
└── js/
    ├── i18n.js       # 国际化模块
    ├── data.js       # 数据引擎（确定性随机生成 + 比对算法）
    └── app.js        # 应用主逻辑（SVG 渲染 + 动画控制）
```

## 可配置参数

| 参数 | 范围 | 默认值 |
|------|:---:|:---:|
| 参考序列长度 | 30–70 bp | 40 bp |
| 读段长度 | 8–20 bp | 15 bp |
| 测序深度 | 3–12× | 5× |
| K-mer 大小 | 3–7 | 5 |

---

<a name="english"></a>

## English

# 🧬 NGS Algorithm Visualization

An interactive visualization tool for the complete Illumina Next-Generation Sequencing (NGS) bioinformatics pipeline.

🔗 **Live Demo**: [ngs-algorithm-visualization.vercel.app](https://ngs-algorithm-visualization.vercel.app)

📄 **Technical Docs**: [docs.html](https://ngs-algorithm-visualization.vercel.app/docs.html)

## Features

- **6-Step Pipeline** — Full coverage from DNA sample to variant report
- **Interactive Animation** — Auto-play, frame-by-frame navigation, pause & rewind
- **Configurable Parameters** — Adjust reference length, read length, coverage depth, K-mer size in real time
- **Bilingual UI** — Toggle between 中文 / English with one click
- **Zero Dependencies** — Pure HTML + CSS + JavaScript, no frameworks required
- **Educational** — Detailed theory panel for each step

## Pipeline Steps

| Step | Name | Description |
|:---:|------|-------------|
| 1 | DNA Fragmentation | Break genomic DNA into short fragments via sonication or enzymatic digestion |
| 2 | Library Preparation | Attach adapter sequences to fragment ends |
| 3 | Sequencing by Synthesis | Cycle-by-cycle base incorporation with fluorescent nucleotides |
| 4 | Base Calling | Analyze fluorescence signals, identify bases, calculate Phred quality scores |
| 5 | Read Alignment | K-mer seed indexing + voting strategy + Smith-Waterman scoring |
| 6 | Variant Calling | Bayesian statistical analysis to identify SNPs/Indels, output in VCF format |

## Quick Start

```bash
# Clone the repository
git clone https://github.com/GChenSi-2/ngs-algorithm-visualization.git
cd ngs-algorithm-visualization

# Start a local server (pick one)
python -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080` in your browser.

## Keyboard Shortcuts

| Key | Action |
|:---:|--------|
| `→` | Next frame |
| `←` | Previous frame |
| `Space` | Play / Pause |

## Project Structure

```
├── index.html        # Main page
├── docs.html         # Technical documentation
├── css/
│   └── style.css     # Styles (GitHub Dark theme)
└── js/
    ├── i18n.js       # Internationalization module
    ├── data.js       # Data engine (deterministic RNG + alignment algorithms)
    └── app.js        # Main app logic (SVG rendering + animation control)
```

## Configurable Parameters

| Parameter | Range | Default |
|-----------|:---:|:---:|
| Reference Sequence Length | 30–70 bp | 40 bp |
| Read Length | 8–20 bp | 15 bp |
| Sequencing Depth | 3–12× | 5× |
| K-mer Size | 3–7 | 5 |

## License

MIT
