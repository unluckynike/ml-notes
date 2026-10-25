# ML 笔记

一份**可交互的机器学习 / 深度学习知识笔记**。纯静态、零依赖、离线可用 —— 每个主题都有「用途 · 原理 · 优缺点 · 发展历程 · 适用场景 · 上手路径」，并配一个浏览器内实时计算的交互演示。

> 覆盖 112 个主题，**每个主题都配有深度长文**：从统计学基础、经典机器学习，到深度学习、计算机视觉、生成模型、大语言模型、智能体、具身智能、可解释性与 AI 治理。

---

## 在线浏览

发布到 GitHub Pages 后访问：

```
https://<你的用户名>.github.io/<仓库名>/
```

## 本地预览

无需构建、无需安装任何依赖，任选一种：

```bash
# 方式一：直接打开（最简单）
open index.html

# 方式二：起一个本地服务（推荐，避免个别浏览器的 file:// 限制）
python3 -m http.server 8000
# 然后访问 http://127.0.0.1:8000/
```

---

## 内容结构

| 项 | 数量 |
|---|---|
| 主题 | 112 |
| 交互演示 | 112 |
| 知识分类 | 13 |
| 路线图阶段 | 13 |
| 方法论 | 6 |
| 延伸阅读 | 8 |
| 深度长文 | 112 |

**13 个分类**：统计基础 · 基础与优化 · 监督学习 · 集成学习 · 无监督学习 · 深度学习 · 计算机视觉 · 生成模型 · 大语言模型 · 智能体 · 强化学习 · 应用主题 · 方法论

每个主题包含 8 个标签页：**简介 / 核心思想 / 直观例子 / 优缺点 / 发展历程 / 适用场景 / 怎么上手 / 演示**；声明了 `deep` 字段的 13 个主题还会多一个**深度阅读**标签页（长文含公式推导、代码与面试要点）。

---

## 目录结构

```
.
├── index.html              # 页面骨架（唯一入口）
├── favicon.svg             # 站点图标（品牌三节点图形）
├── css/
│   └── style.css           # 设计系统：配色变量、卡片、标签页、深度阅读排版、响应式
├── js/
│   ├── content.js          # ★ 内容数据：CATEGORIES / ROADMAP / METHODS / RESOURCES / TOPICS
│   ├── demos.js            # ★ 交互演示：112 个 canvas 小实验 + 手写 3D 投影引擎
│   ├── markdown.js         #   迷你 Markdown 渲染器（深度阅读用，零依赖）
│   └── app.js              # 渲染与交互：导航、标签页、搜索、主题切换
├── content/                # ★ 深度长文（Markdown 源文件，112 篇，每主题一篇）
│   ├── transformer.md backprop.md cnn.md rnn.md lstm.md resnet.md
│   ├── kmeans.md pca.md tsne.md em.md svm.md xgboost.md
│   ├── gan.md vae.md word2vec.md evaluation.md
│   └── gpt.md bert.md rlhf.md lora.md rag.md diffusion.md
├── tools/
│   └── check.mjs           # 内容自检脚本（发布前跑）
└── .github/workflows/
    └── pages.yml           # 自动部署到 GitHub Pages
```

**内容与代码是分离的**：
- 卡片式内容（112 个主题）→ `js/content.js`
- 交互演示 → `js/demos.js`
- 深度长文 → `content/*.md`（纯 Markdown，不用碰 JS）

### 深度长文（112 篇 · 全覆盖）

每个主题的「深度阅读」标签页都配有一篇长文（`content/<主题id>.md`），结构统一：**直觉 → 公式推导 → 代码 → 常见误区 → 面试要点速答 → 延伸阅读**。代表性篇目：

| 长文 | 亮点 |
|---|---|
| transformer.md | QKV/√dₖ 缩放推导、KV cache 与 MQA |
| backprop.md | 手推两层网络全梯度、梯度检查 |
| svm.md | 间隔/对偶/核技巧、KKT 与支持向量 |
| xgboost.md | 二阶泰勒与叶子权重闭式解 |
| vae.md / gan.md | ELBO 双推导 / 最优判别器与 JS 散度 |
| gpt.md | Scaling Laws 与 Chinchilla 修正 |
| rlhf.md | Bradley-Terry、PPO、DPO 闭式推导 |
| lora.md | 低秩假设、QLoRA、多适配器部署 |
| rag.md | 混合检索/重排/评估分层 |
| quant.md | RTN→GPTQ→AWQ 思想对比 |
| conformal.md | 覆盖保证的名次论证（有限样本） |
| cot.md | 测试时算力与 RLVR 涌现 |
| mlops.md | 数据/概念漂移、两级监控、影子发布 |
| parallel.md | ZeRO 三级显存账、3D 并行组合逻辑 |
| mamba/ssm.md | 递归/卷积双形式与选择性机制 |
| nerf.md | 位置编码、体渲染方程、3DGS 接棒 |
| embodied.md | VLA 动作 token 化、数据三板斧 |
| history.md | 三次浪潮的驱动力解剖 |
| chip.md | Roofline 与算力经济学 |
| kg.md | 构建管线与 GraphRAG |
| ir.md | BM25 逐项解剖 |
| world.md | model-based RL 与 JEPA 之争 |
| interp.md | 叠加、SAE 与因果验证 |
| flowmatch.md | 直线路径与整流迭代 |
| context.md | 位置偏置与压缩纪律 |
| fairness.md | 不可能定理与治理清单 |
