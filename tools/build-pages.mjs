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

const { TOPICS } = new Function(read('js/content.js') + '\n;return { TOPICS };')();

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
.art-main { max-width: 880px; margin: 0 auto; padding: 30px 22px 48px; }
.art-foot { margin-top: 60px; padding-top: 18px; border-top: 1px dashed var(--border-strong);
  color: var(--muted); font-size: 13.5px; line-height: 1.9; }
.art-foot a { color: var(--accent-2); text-decoration: none; }
.art-foot a:hover { text-decoration: underline; }
@media (max-width: 560px) { .art-top { flex-direction: column; text-align: center; } }
`;

const page = ({ id, h1, desc, content, topicName }) => `<!DOCTYPE html>
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
<link rel="stylesheet" href="../../css/article.css" />
<style>${CHROME_CSS}</style>
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
<article>
${content}
</article>
<footer class="art-foot">
  <p>本文是 <a href="../../index.html#topic-${id}">「${topicName}」主题</a>的深度长文。全部 125 个主题、交互式演示与知识图谱见 <a href="../../index.html">AI 笔记主页</a>。</p>
  <p>内容采用 CC BY-NC-SA 4.0 授权 · 站点代码 MIT 授权</p>
</footer>
</main>
</body>
</html>
`;

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
  let html;
  try {
    html = mdRenderer.renderBody(article);
  } catch (e) {
    errors.push(`${id}: 渲染失败 — ${e.message}`);
    continue;
  }
  const desc = extractDescription(article, topic);
  const outPath = path.join('article', id, 'index.html');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, page({ id, h1, desc, content: html, topicName: topic.name || id }));
  built.push({ id, h1, desc });
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

console.log(`✓ css/article.css（${(articleCss.length / 1024).toFixed(1)} KB）`);
console.log(`✓ article/ ${built.length} 篇静态文章页`);
console.log(`✓ sitemap.xml（${built.length + 1} 个 URL）`);
