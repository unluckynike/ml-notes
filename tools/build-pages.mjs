#!/usr/bin/env node
/**
 * build-pages.mjs — SEO 静态文章页生成器（部署期运行，产物不入库）
 *
 * 做三件事：
 *   1. 从 css/style.css 抽取内容样式（:root 变量 + .md-* / .m-* / .topic-xref）
 *      → 生成 css/article.css（与主站样式永远同步，无需手工维护副本）
 *   2. 用主站自带的 markdown.js 渲染器把 content/*.md 渲染成
 *      article/<id>/index.html（每页含 meta description / OG / canonical）
 *   3. 重新生成 sitemap.xml（主页 + 125 篇文章页）
 *
 * 所有产物都被 .gitignore 排除，只进入 GitHub Pages 部署 artifact。
 * 本地预览：node tools/build-pages.mjs && python3 -m http.server 8000
 */
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://unluckynike.github.io/ml-notes';

const read = p => fs.readFileSync(p, 'utf8');

// ---------- 1. CSS 抽取 ----------
function extractCss(src, prefixes) {
  const want = sel =>
    sel === ':root' ||
    sel.startsWith('html[data-theme') ||
    sel.split(',').some(s => prefixes.some(p => s.trim().startsWith(p)));
  const out = [];
  let i = 0;
  while (i < src.length) {
    const brace = src.indexOf('{', i);
    if (brace < 0) break;
    let sel = src.slice(i, brace).replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (sel.startsWith('@media') || sel.startsWith('@supports') || sel.startsWith('@keyframes')) {
      let depth = 1, j = brace + 1;                 // 跳过整个嵌套块
      while (j < src.length && depth > 0) {
        if (src[j] === '{') depth++;
        else if (src[j] === '}') depth--;
        j++;
      }
      i = j;
      continue;
    }
    const end = src.indexOf('}', brace);
    if (end < 0) break;
    if (want(sel)) out.push(sel + ' {' + src.slice(brace + 1, end) + '}');
    i = end + 1;
  }
  return out.join('\n\n');
}

// ---------- 2. 加载渲染器与内容数据 ----------
globalThis.window = globalThis.window || {};
new Function(read('js/markdown.js'))();
const mdRenderer = globalThis.window.MLMarkdown;
if (!mdRenderer) { console.error('js/markdown.js 没有导出 MLMarkdown'); process.exit(1); }

const { TOPICS, GRAPH_EDGES } = new Function(read('js/content.js') + '\n;return { TOPICS, GRAPH_EDGES };')();

// ---------- 3. 文章元信息提取 ----------
const stripInline = s =>
  s.replace(/\$\$?([^$]*)\$\$?/g, '$1')        // 行内/块公式取文字
    .replace(/\*\*([^*]*)\*\*/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/「|」|——/g, m => m)
    .replace(/\s+/g, ' ')
    .trim();

function extractDescription(article, topic) {
  const lines = article.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/^>\s*\[!KEY\]/.test(lines[i])) {
      const buf = [lines[i].replace(/^>\s*\[!KEY\]\s*/, '')];
      for (let j = i + 1; j < lines.length && lines[j].startsWith('>'); j++)
        buf.push(lines[j].replace(/^>\s?/, ''));
      return finishDesc(stripInline(buf.join(' ')));
    }
  }
  return finishDesc(topic && topic.tagline ? topic.tagline : '');
}

function finishDesc(s) {
  if (s.length <= 158) return s;
  const cut = s.slice(0, 158);
  const stop = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('！'), cut.lastIndexOf('？'), cut.lastIndexOf('；'));
  return stop > 60 ? cut.slice(0, stop + 1) : cut.trimEnd() + '…';
}

// ---------- 4. 页面模板 ----------
const CHROME_CSS = `
body { margin: 0; background: var(--bg); color: var(--text); font-family: var(--font-sans); }
.art-top { display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 22px; border-bottom: 1px solid var(--border); background: var(--bg-soft); }
.art-brand { color: var(--text); text-decoration: none; font-weight: 700; font-size: 16px; }
.art-brand span { color: var(--accent-2); }
.art-top__right { display: flex; align-items: center; gap: 10px; }
.art-cta { color: #06121f; background: var(--grad-main); text-decoration: none; font-size: 13.5px;
  font-weight: 600; padding: 8px 16px; border-radius: 999px; white-space: nowrap; }
.art-cta:hover { filter: brightness(1.12); }
.art-gh { display: flex; align-items: center; justify-content: center; flex: none;
  width: 36px; height: 36px; border-radius: 10px;
  color: var(--text); background: var(--surface); border: 1px solid var(--border-strong); }
.art-gh svg { width: 20px; height: 20px; fill: currentColor; }
.art-gh:hover { background: var(--grad-main); color: #fff; border-color: transparent; }
.art-diagram {
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  margin: 0 0 22px; padding: 14px 18px;
  background: var(--grad-soft); border: 1px solid var(--border-strong); border-radius: 12px;
  color: var(--text); text-decoration: none; font-size: 14px;
  transition: border .2s, transform .2s;
}
.art-diagram:hover { border-color: var(--accent-2); transform: translateY(-1px); }
.art-diagram strong { color: var(--accent-2); }
.art-diagram span { color: var(--muted); font-size: 12.5px; margin-left: auto; }
.art-rel { margin-top: 44px; padding: 16px 18px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
.art-rel__row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 7px 0; font-size: 13.5px; }
.art-rel__row > span { flex: none; color: var(--muted); margin-right: 2px; min-width: 34px; }
.art-rel__row a { color: var(--accent-2); text-decoration: none; padding: 3px 12px; border: 1px solid var(--border); border-radius: 999px; transition: all .15s; }
.art-rel__row a:hover { border-color: var(--accent-2); background: rgba(0,212,255,.08); }
.art-main { max-width: 880px; margin: 0 auto; padding: 30px 22px 48px; }
.art-foot { margin-top: 60px; padding-top: 18px; border-top: 1px dashed var(--border-strong);
  color: var(--muted); font-size: 13.5px; line-height: 1.9; }
.art-foot a { color: var(--accent-2); text-decoration: none; }
.art-foot a:hover { text-decoration: underline; }
@media (max-width: 560px) { .art-top { flex-direction: column; text-align: center; } }
`;

const DIAGRAMS = {
  rlhf: { file: 'rlhf-pipeline.html', title: 'RLHF 三阶段流水线' },
  rag: { file: 'rag-pipeline.html', title: 'RAG 检索管线' },
  transformer: { file: 'transformer-forward.html', title: 'Transformer 前向数据流' },
  inference: { file: 'inference-pipeline.html', title: 'LLM 推理数据流' },
  parallel: { file: 'parallel-3d.html', title: '3D 并行张量与梯度流' },
  diffusion: { file: 'diffusion-sampling.html', title: '扩散采样数据流' },
  history: { file: 'ai-history-timeline.html', title: 'AI 三次浪潮时间线' }
};
const AUTHOR = { name: 'Halensea', url: 'https://github.com/unluckynike' };

// 从 markdown 源提取各 h2 小节的纯文本（搜索索引用），并用 toc 把标题映射到渲染后的锚点 id
function extractSections(article, toc) {
  const norm = s => s.replace(/[\s「」（）()·、，。：:——\-]/g, '').toLowerCase();
  const idByText = {};
  (toc || []).forEach(h => { idByText[norm(h.text)] = h.id; });
  const sections = [];
  let cur = null, buf = [];
  const flush = () => {
    if (!cur) return;
    let text = buf.join(' ')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      .replace(/`[^`]*`/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[#>*|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length > 400) text = text.slice(0, 400);
    if (text) sections.push([idByText[norm(cur)] || '', cur, text]);
  };
  for (const l of article.split('\n')) {
    const m = /^## (.+)$/.exec(l);
    if (m) { flush(); cur = m[1].trim(); buf = []; }
    else if (cur) buf.push(l);
  }
  flush();
  return sections;
}

// 相关主题区块：GRAPH_EDGES 的前置（谁是我地基）/后续（读完读什么）/相关
function relatedBlock(id) {
  const name = tid => { const t = TOPICS.find(x => x.id === tid); return t ? t.name : null; };
  const group = (label, ids) => {
    const ls = [...new Set(ids)].map(tid => {
      const n = name(tid);
      return n ? `<a href="../../index.html#topic-${tid}/deep" title="${n}">${n}</a>` : null;
    }).filter(Boolean);
    return ls.length ? `<div class="art-rel__row"><span>${label}</span>${ls.join('')}</div>` : '';
  };
  const pre = GRAPH_EDGES.filter(e => e[2] === 'pre' && e[1] === id).map(e => e[0]);
  const next = GRAPH_EDGES.filter(e => e[2] === 'pre' && e[0] === id).map(e => e[1]);
  const rel = GRAPH_EDGES.filter(e => e[2] === 'rel' && (e[0] === id || e[1] === id))
                         .map(e => e[0] === id ? e[1] : e[0]);
  const html = group('前置', pre) + group('后续', next) + group('相关', rel);
  return html ? `<div class="art-rel">${html}</div>` : '';
}
const BUILD_DATE = new Date().toISOString().slice(0, 10);

const page = ({ id, h1, desc, content, topicName, relHtml, diagHtml }) => {
  // Google 结构化数据：机器可读的作者归属（E-E-A-T 信号）
  const ld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: h1,
    description: desc,
    url: `${BASE}/article/${id}/`,
    inLanguage: 'zh-CN',
    author: { '@type': 'Person', name: AUTHOR.name, url: AUTHOR.url },
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
  });
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="dark light" />
<title>${h1} · AI 笔记</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${BASE}/article/${id}/" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="AI 笔记" />
<meta property="og:title" content="${h1} · AI 笔记" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${BASE}/article/${id}/" />
<meta property="og:image" content="${BASE}/og-image.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${h1} · AI 笔记" />
<meta name="twitter:description" content="${desc}" />
<link rel="icon" type="image/svg+xml" href="../../favicon.svg" />
<link rel="stylesheet" href="../../css/article.css?v=${BUILD_DATE}" />
<style>${CHROME_CSS}</style>
<script type="application/ld+json">${ld}</script>
</head>
<body>
<header class="art-top">
  <a class="art-brand" href="../../index.html"><span>●</span> AI 笔记</a>
  <div class="art-top__right">
    <a class="art-cta" href="../../index.html#topic-${id}/deep">查看交互版 · 有可动手的演示 →</a>
    <a class="art-gh" href="https://github.com/unluckynike/ml-notes" target="_blank" rel="noopener" aria-label="GitHub 仓库" title="GitHub 仓库">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
    </a>
  </div>
</header>
<main class="art-main">
${diagHtml}
<article>
${content}
</article>
${relHtml}
<footer class="art-foot">
  <p>作者 <a href="${AUTHOR.url}" target="_blank" rel="noopener">${AUTHOR.name} ↗</a> · 本文是 <a href="../../index.html#topic-${id}">「${topicName}」主题</a>的深度长文，全部 125 个主题、交互式演示与知识图谱见 <a href="../../index.html">AI 笔记主页</a>。</p>
  <p>内容采用 CC BY-NC-SA 4.0 授权 · 站点代码 MIT 授权</p>
</footer>
</main>
</body>
</html>
`;
};

// ---------- 5. 主流程 ----------
const outDirs = ['article', 'css'];
for (const d of outDirs) fs.mkdirSync(d, { recursive: true });

// 5a. 生成 css/article.css
const styleSrc = read('css/style.css');
const articleCss =
  '/* 由 tools/build-pages.mjs 从 style.css 自动生成 —— 不要手改，改 style.css 后重跑脚本 */\n' +
  extractCss(styleSrc, ['.md-', '.m-', '.topic-xref', '.code-block']);
fs.writeFileSync('css/article.css', articleCss);

// 5b. 渲染 125 篇
const files = fs.readdirSync('content').filter(f => f.endsWith('.md')).sort();
const errors = [];
const built = [];
for (const f of files) {
  const id = f.replace(/\.md$/, '');
  const article = read('content/' + f);
  const topic = TOPICS.find(t => t.id === id) || {};
  const h1Match = /^#\s+(.+)$/m.exec(article);
  const h1 = h1Match ? h1Match[1].trim() : (topic.name || id);
  let html, toc;
  try {
    ({ html, toc } = mdRenderer.render(article));
  } catch (e) {
    errors.push(`${id}: 渲染失败 — ${e.message}`);
    continue;
  }
  const desc = extractDescription(article, topic);
  const sections = extractSections(article, toc);
  const dg = DIAGRAMS[id];
  const diagHtml = dg ? `<a class="art-diagram" href="../../diagrams/${dg.file}" target="_blank" rel="noopener">📐 可探索架构图：<strong>${dg.title}</strong><span>路径动画 · 透镜聚焦 · 可导出——新标签打开 →</span></a>` : '';
  const outPath = path.join('article', id, 'index.html');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, page({ id, h1, desc, content: html, topicName: topic.name || id, relHtml: relatedBlock(id), diagHtml }));
  built.push({ id, h1, desc, sections });
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

// 5c. 生成 sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const urls = [
  `  <url>\n    <loc>${BASE}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ...built.map(b => `  <url>\n    <loc>${BASE}/article/${b.id}/</loc>\n    <lastmod>${today}</lastmod>\n    <priority>0.8</priority>\n  </url>`)
];
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);

// 站内全文检索索引（构建产物，SPA 搜索框懒加载）
const index = built.map(b => ({ i: b.id, t: b.h1, s: b.sections }));
fs.writeFileSync('search-index.json', JSON.stringify(index));

console.log(`✓ css/article.css（${(articleCss.length / 1024).toFixed(1)} KB）`);
console.log(`✓ search-index.json（${(JSON.stringify(index).length / 1024).toFixed(0)} KB，${built.length} 篇）`);
console.log(`✓ article/ ${built.length} 篇静态文章页`);
console.log(`✓ sitemap.xml（${built.length + 1} 个 URL）`);
