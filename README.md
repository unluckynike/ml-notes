# AI 笔记

> **像搭积木一样理解 AI：从统计学到大模型与智能体的交互式知识笔记**

[![在线访问](https://img.shields.io/badge/在线访问-GitHub_Pages-00d4ff)](https://unluckynike.github.io/ml-notes/)
[![主题](https://img.shields.io/badge/主题-125-6c5ce7)](#内容结构)
[![交互演示](https://img.shields.io/badge/交互演示-125-ff7ac6)](#内容结构)
[![深度长文](https://img.shields.io/badge/深度长文-125-00e6a0)](#深度长文)
[![CI](https://img.shields.io/github/actions/workflow/status/unluckynike/ml-notes/pages.yml?branch=main&label=CI)](https://github.com/unluckynike/ml-notes/actions)
[![License](https://img.shields.io/badge/代码-MIT-green)](#license)

**125 个主题 × 125 个交互演示 × 125 篇深度长文**。纯静态、零依赖、离线可用。

---

## 这不是什么

市面上大部分 AI 学习材料是这三类：

- 面试八股的堆砌 —— 背得住结论，说不清来龙去脉
- 某个框架的教程 —— 框架明年就换，底层模式才是资产
- 新闻式的概念罗列 —— 只有名词，没有机理

这份笔记想回答的是另一类问题：**注意力为什么要除以 √dₖ？XGBoost 的增益公式长什么样、γ 卡在哪？RLHF 的 KL 罚项在惩罚什么？** 每个概念都从「它解决什么问题」推起，而不是从「它是什么」背起。

## 目标读者

| 读者类型 | 你会获得什么 |
|---|---|
| **转行 / 自学的工程师** | 从统计学到智能体的完整路径，不需要科班背景 |
| **科班学生** | 125 篇含公式推导的深度长文，补上「课本 ↔ 工业界」的断层 |
| **算法工程师** | 量化、推理优化、路由、评测等工程主题的决策框架 |
| **产品 / 管理者** | 每个主题的「优缺点 / 适用场景 / 常见误区」，建立判断力 |

### 前置要求

- **必需**：会用浏览器（所有演示都在浏览器里实时计算，不装任何东西）
- **有帮助**：会一点 Python（长文里的代码片段都是可直接运行的 NumPy）
- **不需要**：任何框架经验、数学竞赛背景

### 可能不适合你，如果：

- 你只想知道「该用哪个模型」（看各家的模型卡更直接）
- 你需要某框架的 API 文档（官方文档更权威）
- 你要准备选择/填空题（这份笔记按「理解 + 会算」写，不按考点写）

## 阅读路径

### 系统学习（8~12 周）

```
路线图 1→8：统计与数学地基 → 优化与泛化 → 回归模型 → 经典分类器
          → 集成学习 → 无监督学习 → 深度学习 → 进阶与应用
```

每个主题的节奏：卡片（10 分钟）→ 交互演示（动手 5 分钟）→ 深度长文（30~60 分钟）。

### 快速入门（2~3 天）

```
线性回归 → 梯度下降 → 神经网络 MLP → 反向传播 → CNN → Transformer → GPT → RAG → 智能体
```

一条从「函数拟合」到「Agent」的最短主线，每步只取一个概念。

### 工程实战（1 周）

```
大模型主题区：quant(量化) → lora(微调) → inference(推理优化) → rag(检索增强)
            → router(模型路由) → llmeval(评测)
方法论主题区：mlops → experiment(A/B) → evaluation → conformal(不确定性)
```

## 内容结构

**13 个分类 × 125 个主题**：

| 分类 | 主题数 | 覆盖内容 |
|---|---:|---|
| 统计基础 | 8 | 概率分布、假设检验、贝叶斯 |
| 基础与优化 | 7 | NumPy、梯度下降、损失函数、正则化 |
| 监督学习 | 9 | 线性/逻辑回归、SVM、决策树、KNN |
| 集成学习 | 4 | 随机森林、AdaBoost、XGBoost、LightGBM |
| 无监督学习 | 7 | K-Means、EM、DBSCAN、PCA、t-SNE |
| 深度学习 | 14 | MLP、CNN、RNN/LSTM、Transformer、注意力 |
| 计算机视觉 | 9 | ResNet、YOLO、分割、ViT、CLIP |
| 生成模型 | 9 | VAE、GAN、扩散、流匹配、NeRF |
| 强化学习 | 6 | MDP、策略梯度、DQN、多臂老虎机、离线 RL |
| 大语言模型 | 22 | GPT、BERT、RLHF、RAG、量化、推理、评测 |
| 智能体 | 7 | ReAct、多智能体、MCP、Computer Use |
| 应用主题 | 9 | 语音、OCR、视频、世界模型、具身智能 |
| 方法论 | 14 | 实验设计、MLOps、公平性、AI 法规、可解释性 |

**每个主题都是三件套**：

1. **九标签卡片** —— 简介 / 核心思想（含公式）/ 直观例子 / 优缺点 / 发展历程 / 适用场景 / 怎么上手 / 演示 / 深度阅读
2. **交互演示** —— 每个主题一个浏览器内实时计算的 Canvas 实验：注意力热图、K-Means 迭代、扩散去噪、门控机制对比、井字棋 MCTS……
3. **深度长文** —— `content/<主题id>.md`，统一结构：直觉 → 公式推导 → 可运行代码 → 常见误区 → 要点总结 → 延伸阅读

站点还内置**力导向知识图谱**（125 节点 / 171 条前置-相关关系，可拖拽缩放）、全文搜索、13 阶段学习路线图、明暗主题与打印样式。

## 关于时效性

AI 领域变化极快（最后更新：2026-10）。

**核心原理相对稳定**（反向传播、注意力机制、正则化的数学不会变）；**具体数字、模型名、框架 API 会过时**。遇到与最新文档冲突的内容，以官方文档为准，并欢迎提 Issue。

## 在线浏览与本地运行

**在线**：<https://unluckynike.github.io/ml-notes/>

**本地**：无需构建、无需安装依赖：

```bash
git clone https://github.com/unluckynike/ml-notes.git
cd ml-notes
python3 -m http.server 8000     # 或直接双击 index.html
```

## 目录结构

```
.
├── index.html              # 页面骨架（唯一入口）
├── css/style.css           # 设计系统：主题变量、卡片、知识图谱、响应式
├── js/
│   ├── content.js          # ★ 内容数据：CATEGORIES / ROADMAP / TOPICS / GRAPH_EDGES
│   ├── demos.js            # ★ 交互演示：125 个 canvas 实时计算实验
│   ├── markdown.js         #   迷你 Markdown/LaTeX 渲染器（零依赖）
│   └── app.js              # 渲染与交互：标签页、搜索、图谱、导航
├── content/                # ★ 125 篇深度长文（纯 Markdown，含可运行代码片段）
├── tools/check.mjs         # 自检：id 一致性、公式渲染、演示引用、长度门禁
└── .github/workflows/pages.yml   # CI 自检 + 自动部署 GitHub Pages
```

**内容与代码分离**：改内容只碰 `content/*.md` 和 `js/content.js`，不碰渲染逻辑。

## 深度长文（125 篇 · 全覆盖）

统一结构：**直觉 → 公式推导 → 可运行代码 → 常见误区 → 要点总结 → 延伸阅读**。所有代码片段均经 NumPy 实测可运行。代表性篇目：

| 长文 | 亮点 |
|---|---|
| transformer.md | QKV/√dₖ 缩放推导、KV cache 与 MQA |
| backprop.md | 手推两层网络全梯度、数值梯度检查 |
| svm.md | 间隔/对偶/核技巧、KKT 与支持向量 |
| xgboost.md | 二阶泰勒、叶子权重与增益闭式解 |
| vae.md / gan.md | ELBO 双推导 / 最优判别器与 JS 散度 |
| rlhf.md | Bradley-Terry、PPO、DPO 闭式推导 |
| conformal.md | 覆盖保证的名次论证（有限样本） |
| parallel.md | ZeRO 三级显存账、3D 并行组合逻辑 |
| mcts.md | 四步循环与 AlphaZero 跃迁 |
| interp.md | 叠加、SAE 与因果验证 |
| bandit.md | 遗憾、UCB 与 Thompson 采样 |
| watermark.md | 绿名单数学与攻防 |

完整清单在站内「延伸阅读」与各主题的深度阅读标签页。

## Citation

如果你在研究、写作或工作中用到了这份笔记，欢迎引用：

```bibtex
@misc{halensea2026ainotes,
  author = {Halensea},
  title  = {AI 笔记：交互式人工智能全景知识笔记},
  year   = {2026},
  url    = {https://unluckynike.github.io/ml-notes/},
  note   = {125 个主题 × 125 个交互演示 × 125 篇深度长文}
}
```

APA 格式：

> Halensea. (2026). *AI 笔记：交互式人工智能全景知识笔记*. <https://unluckynike.github.io/ml-notes/>

## License

- **站点源代码**（HTML/CSS/JS/工具脚本）：[MIT](LICENSE)
- **笔记内容**（125 篇长文与主题卡）：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) —— 可分享与改编，需署名、非商业、同方式共享

> *"Learning is not watching someone else's demo — it's turning the knobs yourself."*
