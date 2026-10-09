# ML 笔记

一份**可交互的机器学习 / 深度学习知识笔记**。纯静态、零依赖、离线可用 —— 每个主题都有「用途 · 原理 · 优缺点 · 发展历程 · 适用场景 · 上手路径」，并配一个浏览器内实时计算的交互演示。

> 覆盖 49 个主题：从统计学基础、经典机器学习，到深度学习、计算机视觉、生成模型、大语言模型与 Agent。

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
| 主题 | 49 |
| 交互演示 | 49 |
| 知识分类 | 13 |
| 路线图阶段 | 13 |
| 方法论 | 6 |
| 延伸阅读 | 8 |

**13 个分类**：统计基础 · 基础与优化 · 监督学习 · 集成学习 · 无监督学习 · 深度学习 · 计算机视觉 · 生成模型 · 大语言模型 · 智能体 · 强化学习 · 应用主题 · 方法论

每个主题包含 8 个标签页：**简介 / 核心思想 / 直观例子 / 优缺点 / 发展历程 / 适用场景 / 怎么上手 / 演示**。

---

## 目录结构

```
.
├── index.html              # 页面骨架（唯一入口）
├── css/
│   └── style.css           # 设计系统：配色变量、卡片、标签页、响应式
├── js/
│   ├── content.js          # ★ 内容数据：CATEGORIES / ROADMAP / METHODS / RESOURCES / TOPICS
│   ├── demos.js            # ★ 交互演示：49 个 canvas 小实验 + 手写 3D 投影引擎
│   └── app.js              # 渲染与交互：导航、标签页、搜索、主题切换、掌握勾选
├── tools/
│   └── check.mjs           # 内容自检脚本（发布前跑）
└── .github/workflows/
    └── pages.yml           # 自动部署到 GitHub Pages
```

**内容与代码是分离的**：改内容基本只需要动 `js/content.js`，改演示动 `js/demos.js`，页面逻辑不用碰。

---

## 怎么维护

### 发布前自检（强烈建议）

```bash
node tools/check.mjs
```

它会检查：主题引用的演示是否存在、id 是否重复、分类是否有效、必填字段是否齐全、有没有演示初始化报错或过慢，并打印内容统计。**有错会以非 0 退出码结束**，所以也能直接放进 CI。

### 新增一个主题

**第 1 步：写演示**（`js/demos.js`）

在文件末尾的 `window.MLDemos = { ... }` **之前**加一个函数，名字就是演示 id：

```js
function mydemo(container) {
  const d = demoShell('标题', '一句话说明怎么玩');
  container.appendChild(d.root);
  const { ctx, W, H } = setup(d.canvas, 780, 400);   // 逻辑尺寸，DPR 自动适配
  // …… 用 ctx 画东西，用 d.controls.appendChild(makeButton/makeRange/makeSelect(...)) 加控件
  draw();
}
```

然后在 `window.MLDemos = { ... }` 里登记：

```js
window.MLDemos = { /* 已有的…… */, mydemo: mydemo };
```

**第 2 步：写内容**（`js/content.js`）

往 `TOPICS` 数组里加一项，字段照抄邻居即可：

```js
{
  id: 'mydemo',            // 与演示 id 一致（不必需，但便于对照）
  emoji: '🧪', name: '中文名', en: 'English Name',
  cat: 'dl',               // 必须是 CATEGORIES 里已有的 key
  diff: 3,                 // 难度 1~5
  accent: '#ff7ac6',
  tagline: '一句话定位',
  intro:     { what: '…', problem: '…', idea: '…' },
  principle: { text: ['…'], formula: { html: '…', note: '…' } },
  example:   { analogy: '…', mini: '…' },
  pros: ['…'], cons: ['…'],
  history: [{ year: '2015', text: '…' }],
  use: ['…'], avoid: ['…'], learn: ['…'],       // learn = 「怎么上手」
  demo: { id: 'mydemo', title: '…', note: '…' }  // id 必须能在 MLDemos 里找到
}
```

**第 3 步：自检**

```bash
node tools/check.mjs
```

### 新增一个分类

在 `js/content.js` 顶部的 `CATEGORIES` 里加一行 `key: { label: '中文名', color: '#rrggbb' }`，然后在 `css/style.css` 的 `:root` 里补一个同名 CSS 变量（可选，只影响标签配色）。

### 加一个 3D 演示

`js/demos.js` 里已有一层手写的 3D 基础设施，直接用：

```js
const state = { yaw: -0.6, pitch: 0.4 };
const rot = p => rotate3(p, state.yaw, state.pitch);       // 旋转
const prj = p => proj3(rot(p), W / 2, H / 2, 520, 9);      // 透视投影
makeOrbit(d.canvas, state, draw);                          // 鼠标/触摸拖拽旋转
const loop = () => { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); };
if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
```

约定：`y` 轴向上，`colorRamp(t)` 取渐变色，按 `z` 从远到近排序绘制（画家算法）即可得到正确的遮挡关系。

---

## 技术特点

- **纯静态**：没有构建步骤、没有包管理、没有 CDN、没有任何外部依赖，断网也能跑。
- **手写 3D**：20 个演示的 3D 效果是用 Canvas 2D 自己写的透视投影 + 轨道旋转 + 画家算法，不依赖 Three.js。
- **真实计算**：演示里的算法大多是**真跑**的（t-SNE、PCA、DBSCAN、Q-learning、GAN 对抗训练、扩散加噪、VAE、Word2Vec 词向量运算等），不是预录动画。
- **懒加载**：演示用 `IntersectionObserver` 在滚动到附近时才初始化，首屏很快。
- **响应式**：支持深浅主题、移动端抽屉导航，进度勾选存在 `localStorage`。

---

## 部署到 GitHub Pages

仓库已带好 `.github/workflows/pages.yml`，推上去就能自动部署：

1. 新建仓库并推送：
   ```bash
   git init
   git add .
   git commit -m "init: ML 笔记"
   git branch -M main
   git remote add origin git@github.com:<你的用户名>/<仓库名>.git
   git push -u origin main
   ```
2. 打开仓库 **Settings → Pages**，把 **Source** 设为 **GitHub Actions**。
3. 之后每次 `git push` 到 `main`，都会先跑一遍 `node tools/check.mjs`，通过后自动发布。

> 因为页面里所有资源都是**相对路径**（`css/style.css`、`js/*.js`），所以放在 `用户名.github.io/仓库名/` 这种子路径下也能正常工作，不需要额外配置。

---

## 许可

内容与代码可自由使用、修改、分发。若用于二次发布，建议注明来源。
