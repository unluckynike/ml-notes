# AI Notes

> **Understanding AI like building blocks: an interactive knowledge base from statistics to LLMs and agents**

[![Live Site](https://img.shields.io/badge/Live_Site-GitHub_Pages-00d4ff)](https://unluckynike.github.io/ml-notes/)
[![Topics](https://img.shields.io/badge/Topics-125-6c5ce7)](#content-structure)
[![Interactive Demos](https://img.shields.io/badge/Interactive_Demos-125-ff7ac6)](#content-structure)
[![Deep-Dive Articles](https://img.shields.io/badge/Deep--Dive_Articles-125-00e6a0)](#deep-dive-articles)
[![CI](https://img.shields.io/github/actions/workflow/status/unluckynike/ml-notes/pages.yml?branch=main&label=CI)](https://github.com/unluckynike/ml-notes/actions)
[![License: MIT](https://img.shields.io/badge/Code-MIT-green)](#license)

**125 topics × 125 in-browser interactive demos × 125 deep-dive articles.** Pure static, zero dependencies, works offline.

Languages / 语言: **English** | [中文](README.zh-CN.md)

---

## What this is not

Most AI learning material falls into three buckets:

- Interview cheat-sheet piles — memorizable conclusions without the reasoning
- Framework tutorials — the framework dies next year; the underlying patterns are the asset
- News-style concept roundups — all nouns, no mechanics

These notes answer a different kind of question: **Why does attention divide by √dₖ? What does XGBoost's gain formula look like, and where does γ bite? What is the KL penalty in RLHF actually punishing?** Every concept is derived from "what problem does it solve", not memorized from "what it is".

## Who this is for

| Reader | What you get |
|---|---|
| **Self-taught / career-switching engineers** | A complete path from statistics to agents, no CS degree required |
| **CS students** | 125 formula-heavy deep dives bridging the "textbook ↔ industry" gap |
| **ML engineers** | Decision frameworks for quantization, inference, routing, evaluation |
| **PMs / managers** | Pros/cons, when-to-use and pitfalls for every topic — judgment, not jargon |

### Prerequisites

- **Required**: a browser (every demo computes live in the page — nothing to install)
- **Helpful**: a bit of Python (all code snippets in the articles are runnable NumPy)
- **Not required**: any framework experience or math-competition background

### This might not be for you if:

- You just want "which model should I use" — model cards are more direct
- You need a specific framework's API docs — official docs are more authoritative
- You're cramming for a multiple-choice exam — these notes are written for *understanding + calculating*, not test points

## Reading paths

### Systematic study (8–12 weeks)

```
Roadmap 1→8: Statistics & Math → Optimization & Generalization → Regression
            → Classic Classifiers → Ensembles → Unsupervised → Deep Learning → Advanced
```

Per-topic rhythm: card (10 min) → interactive demo (5 min hands-on) → deep-dive article (30–60 min).

### Quick start (2–3 days)

```
Linear Regression → Gradient Descent → MLP → Backprop → CNN → Transformer → GPT → RAG → Agents
```

The shortest path from "function fitting" to "agents" — one concept per step.

### Engineering track (1 week)

```
LLM block: quant → lora → inference → rag → router → llmeval
Methodology block: mlops → experiment (A/B) → evaluation → conformal (uncertainty)
```

## Content structure

**13 categories × 125 topics**:

| Category | Topics | Covers |
|---|---:|---|
| Statistics | 8 | Probability, hypothesis testing, Bayesian thinking |
| Foundations & Optimization | 7 | NumPy, gradient descent, losses, regularization |
| Supervised Learning | 9 | Linear/logistic regression, SVM, trees, KNN |
| Ensemble Learning | 4 | Random forests, AdaBoost, XGBoost, LightGBM |
| Unsupervised Learning | 7 | K-Means, EM, DBSCAN, PCA, t-SNE |
| Deep Learning | 14 | MLP, CNN, RNN/LSTM, Transformer, attention |
| Computer Vision | 9 | ResNet, YOLO, segmentation, ViT, CLIP |
| Generative Models | 9 | VAE, GAN, diffusion, flow matching, NeRF |
| Reinforcement Learning | 6 | MDP, policy gradient, DQN, bandits, offline RL |
| Large Language Models | 22 | GPT, BERT, RLHF, RAG, quantization, inference, eval |
| Agents | 7 | ReAct, multi-agent, MCP, computer use |
| Applied Topics | 9 | Speech, OCR, video, world models, embodied AI |
| Methodology & Governance | 14 | Experiments, MLOps, fairness, AI regulation, interpretability |

**Every topic ships as a trio:**

1. **Nine-tab card** — intro / core idea (with formula) / intuition / pros & cons / history / when to use / how to start / demo / deep dive
2. **Interactive demo** — one Canvas experiment per topic, computed live in the browser: attention heatmaps, K-Means iterations, diffusion denoising, gating mechanics, tic-tac-toe MCTS…
3. **Deep-dive article** — `content/<topic>.md`, uniform structure: intuition → derivation → runnable code → common pitfalls → key takeaways → further reading

The site also includes a **force-directed knowledge graph** (125 nodes / 171 prerequisite-relation edges, draggable & zoomable), full-text search, a 13-stage roadmap, dark/light themes, and print styles.

## On timeliness

AI moves fast (last updated: 2026-10).

**Core principles are stable** — the math of backprop, attention and regularization won't change. **Specific numbers, model names and framework APIs will age.** When something conflicts with the latest docs, trust the docs — and please open an Issue.

## Online & local

**Online**: <https://unluckynike.github.io/ml-notes/>

**Locally** — no build, no install:

```bash
git clone https://github.com/unluckynike/ml-notes.git
cd ml-notes
python3 -m http.server 8000     # or just open index.html
```

## Repository layout

```
.
├── index.html              # Single entry page
├── css/style.css           # Design system: theme variables, cards, graph, responsive
├── js/
│   ├── content.js          # ★ Content data: CATEGORIES / ROADMAP / TOPICS / GRAPH_EDGES
│   ├── demos.js            # ★ 125 live-computed Canvas demos
│   ├── markdown.js         #   Mini Markdown/LaTeX renderer (zero-dependency)
│   └── app.js              # Rendering & interaction: tabs, search, graph, navigation
├── content/                # ★ 125 deep-dive articles (plain Markdown, runnable code)
├── tools/check.mjs         # CI self-check: id consistency, formula rendering, demo refs, length gate
└── .github/workflows/pages.yml   # CI check + auto-deploy to GitHub Pages
```

**Content and code are separated**: editing content only touches `content/*.md` and `js/content.js`, never the rendering logic.

## Deep-dive articles (125 · full coverage)

Uniform structure: **intuition → derivation → runnable code → common pitfalls → key takeaways → further reading**. Every code snippet is verified to run with NumPy. Representative pieces:

| Article | Highlights |
|---|---|
| transformer.md | QKV / √dₖ scaling derivation, KV cache & MQA |
| backprop.md | Full two-layer gradient by hand, numerical grad check |
| svm.md | Margins, duality, kernel trick, KKT & support vectors |
| xgboost.md | Second-order Taylor, closed-form leaf weights & gain |
| vae.md / gan.md | ELBO two ways / optimal discriminator & JS divergence |
| rlhf.md | Bradley–Terry, PPO, closed-form DPO |
| conformal.md | Rank argument for finite-sample coverage |
| parallel.md | ZeRO-1/2/3 memory math, 3D-parallelism logic |
| mcts.md | The four-step loop and the AlphaZero leap |
| interp.md | Superposition, SAEs, causal validation |
| bandit.md | Regret, UCB, Thompson sampling |
| watermark.md | Green-list math and the attack surface |

The full list lives on the site, in the Further Reading block and every topic's Deep Dive tab.

## Citation

If these notes help your research, writing or work, feel free to cite:

```bibtex
@misc{halensea2026ainotes,
  author = {Halensea},
  title  = {AI Notes: An Interactive Panorama of Artificial Intelligence},
  year   = {2026},
  url    = {https://unluckynike.github.io/ml-notes/},
  note   = {125 topics × 125 interactive demos × 125 deep-dive articles}
}
```

APA format:

> Halensea. (2026). *AI Notes: An Interactive Panorama of Artificial Intelligence*. <https://unluckynike.github.io/ml-notes/>

## License

- **Site source code** (HTML/CSS/JS/tools): [MIT](LICENSE)
- **Note content** (125 articles & topic cards): [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — share and adapt freely with attribution, non-commercial, same-license

> *"Learning is not watching someone else's demo — it's turning the knobs yourself."*
