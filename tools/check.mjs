#!/usr/bin/env node
/**
 * 内容自检脚本 —— 发布前跑一遍，防止「主题引用了不存在的演示」这类问题。
 *
 *   node tools/check.mjs
 *
 * 检查项：
 *   1. content.js / demos.js 能否正常解析
 *   2. 每个主题的 demo.id 都能在 window.MLDemos 里找到（否则页面会显示「演示加载失败」）
 *   3. 主题 id 不重复；分类 cat 都在 CATEGORIES 里；diff 在 1~5
 *   4. 每个主题的必填字段齐全、类型正确
 *   5. 反向检查：有没有注册了但没被任何主题引用的演示（警告）
 *   6. 在 DOM 桩环境里逐个初始化演示，捕获运行时错误与过慢的初始化（警告）
 *
 * 注意：演示代码用「主上下文 + new Function」执行，而不是 node:vm 的新 context，
 *       否则 Math.* 的跨 context 访问会让耗时虚高十几倍，测不出真实性能。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

const errors = [];
const warns = [];
const err = m => errors.push(m);
const warn = m => warns.push(m);

// ---------- DOM 桩 ----------
const noop = () => {};
const ctxProxy = new Proxy({}, {
  get(t, p) { if (p === Symbol.toPrimitive) return () => 0; return noop; },
  set(t, p, v) { t[p] = v; return true; }
});
function makeEl() {
  return {
    className: '', innerHTML: '', textContent: '', style: {}, value: '', type: '', min: 0, max: 0, step: 0, children: [],
    appendChild(c) { this.children.push(c); return c; },
    querySelector: () => makeEl(),
    querySelectorAll: () => [{ value: 0, nextElementSibling: { textContent: '' } }],
    addEventListener: noop, setAttribute: noop, removeAttribute: noop,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 300, height: 200 }),
    getContext: () => ctxProxy
  };
}
function installStubs() {
  globalThis.window = { devicePixelRatio: 1, MLDemos: null, addEventListener: noop, requestAnimationFrame: noop, cancelAnimationFrame: noop };
  globalThis.document = { createElement: makeEl, querySelector: makeEl, querySelectorAll: () => [], addEventListener: noop, body: makeEl() };
  globalThis.requestAnimationFrame = noop;
  globalThis.cancelAnimationFrame = noop;
  globalThis.setInterval = noop;
  globalThis.clearInterval = noop;
  globalThis.setTimeout = noop;
  globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
}

// ---------- 1. content.js ----------
let CATEGORIES, ROADMAP, METHODS, RESOURCES, TOPICS;
try {
  const code = read('js/content.js') + '\n;return { CATEGORIES, ROADMAP, METHODS, RESOURCES, TOPICS };';
  ({ CATEGORIES, ROADMAP, METHODS, RESOURCES, TOPICS } = new Function(code)());
} catch (e) {
  err('js/content.js 解析失败：' + e.message);
}

// ---------- 2. demos.js ----------
const demos = {};
installStubs();
try {
  new Function(read('js/demos.js'))();
  Object.assign(demos, globalThis.window.MLDemos || {});
} catch (e) {
  err('js/demos.js 执行失败：' + e.message);
}

// ---------- 3. 主题字段校验 ----------
const REQUIRED = ['id', 'name', 'en', 'cat', 'diff', 'accent', 'tagline', 'intro', 'principle', 'example', 'pros', 'cons', 'history', 'use', 'avoid', 'learn', 'demo'];
const seenIds = new Set();
const usedDemos = new Set();
const hasDemos = Object.keys(demos).length > 0;

if (Array.isArray(TOPICS)) {
  TOPICS.forEach((t, i) => {
    const at = `TOPICS[${i}] (${t && t.id ? t.id : '无 id'})`;
    for (const f of REQUIRED) if (t[f] === undefined) err(`${at} 缺少字段 ${f}`);
    if (seenIds.has(t.id)) err(`${at} 主题 id 重复：${t.id}`);
    seenIds.add(t.id);
    if (t.cat && !CATEGORIES[t.cat]) err(`${at} 分类 cat="${t.cat}" 不在 CATEGORIES 中`);
    if (typeof t.diff !== 'number' || t.diff < 1 || t.diff > 5) err(`${at} diff 应为 1~5，实际 ${t.diff}`);
    for (const k of ['what', 'problem', 'idea']) if (t.intro && !t.intro[k]) err(`${at} intro.${k} 缺失`);
    if (t.principle && !Array.isArray(t.principle.text)) err(`${at} principle.text 应为数组`);
    if (t.principle && (!t.principle.formula || !t.principle.formula.html)) err(`${at} principle.formula.html 缺失`);
    if (t.example && (!t.example.analogy || !t.example.mini)) err(`${at} example 需含 analogy 与 mini`);
    for (const k of ['pros', 'cons', 'history', 'use', 'avoid', 'learn']) {
      if (!Array.isArray(t[k]) || t[k].length === 0) err(`${at} ${k} 应为非空数组`);
    }
    const did = t.demo && t.demo.id;
    if (!did) { err(`${at} demo.id 缺失`); return; }
    usedDemos.add(did);
    if (hasDemos && !demos[did]) {
      err(`${at} 引用了不存在的演示 demo.id="${did}"（页面会显示「演示加载失败」）`);
    }
  });
}

// ---------- 4. 深度阅读（deep 字段）校验 ----------
const deepRefs = new Map();      // md 相对路径 -> [引用它的主题 id]
if (Array.isArray(TOPICS)) {
  TOPICS.forEach(t => {
    if (!t.deep) return;
    const rel = String(t.deep);
    if (!deepRefs.has(rel)) deepRefs.set(rel, []);
    deepRefs.get(rel).push(t.id);
  });
}

let mdRenderer = null;
try {
  new Function(read('js/markdown.js'))();
  mdRenderer = globalThis.window.MLMarkdown || null;
  if (!mdRenderer) err('js/markdown.js 没有导出 window.MLMarkdown');
} catch (e) {
  err('js/markdown.js 执行失败：' + e.message);
}

const CONTENT_DIR = 'content';
deepRefs.forEach((ids, rel) => {
  const who = '主题 ' + ids.join(', ');
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    err(`${who} 的 deep 指向不存在的文件：${rel}（页面会显示「长文加载失败」）`);
    return;
  }
  let md;
  try { md = fs.readFileSync(abs, 'utf8'); }
  catch (e) { err(`读取 ${rel} 失败：${e.message}`); return; }

  if (!md.trim()) { err(`${rel} 是空文件`); return; }
  if (!/^#\s+\S/m.test(md)) warn(`${rel} 没有一级标题（建议以 "# 标题" 开头）`);

  // 渲染一遍，确保渲染器能吃下这篇长文
  if (mdRenderer) {
    try {
      const html = mdRenderer.renderWithToc(md);
      if (!html || html.length < 100) err(`${rel} 渲染结果异常（内容过短）`);
      if (/<script/i.test(html)) err(`${rel} 渲染后出现未转义的 <script>`);
      const open = (html.match(/<(ul|ol|li|p|blockquote|table|pre|div)[ >]/g) || []).length;
      const close = (html.match(/<\/(ul|ol|li|p|blockquote|table|pre|div)>/g) || []).length;
      if (open !== close) warn(`${rel} 渲染后块级标签数量不配对（开 ${open} / 闭 ${close}）`);
    } catch (e) {
      err(`${rel} 渲染失败：${e.message}`);
    }
  }

  // 文内的本地图片/链接是否存在
  const links = [];
  md.replace(/!?\[[^\]]*\]\(([^)\s]+)\)/g, (m, href) => { links.push(href); return m; });
  links.forEach(href => {
    if (/^(https?:|mailto:|tel:|data:|#)/i.test(href)) return;
    const target = path.resolve(path.dirname(abs), href.split('#')[0]);
    if (!fs.existsSync(target)) warn(`${rel} 引用了不存在的本地资源：${href}`);
  });
});

// 反向检查：content/ 下有没有没被引用的孤儿 md
const cdir = path.join(ROOT, CONTENT_DIR);
if (fs.existsSync(cdir)) {
  fs.readdirSync(cdir).filter(f => f.endsWith('.md')).forEach(f => {
    const rel = CONTENT_DIR + '/' + f;
    if (!deepRefs.has(rel)) warn(`${rel} 没有被任何主题的 deep 字段引用（孤儿文件）`);
  });
}

// ---------- 5. 反向检查：注册但未被引用 ----------
for (const k of Object.keys(demos)) {
  if (!usedDemos.has(k)) warn(`演示 "${k}" 已注册，但没有主题引用它`);
}

// ---------- 6. 逐个初始化演示 ----------
if (hasDemos) {
  for (const [k, fn] of Object.entries(demos)) {
    const t0 = Date.now();
    try {
      fn(makeEl());
      const dt = Date.now() - t0;
      if (dt > 400) warn(`演示 "${k}" 初始化较慢：${dt}ms（滚到该主题时会卡一下）`);
    } catch (e) {
      err(`演示 "${k}" 初始化报错：${e.message}`);
    }
  }
}

// ---------- 输出 ----------
const nTopics = Array.isArray(TOPICS) ? TOPICS.length : 0;
const nCats = CATEGORIES ? Object.keys(CATEGORIES).length : 0;
const nStage = Array.isArray(ROADMAP) ? ROADMAP.length : 0;

console.log('');
console.log('  内容统计');
console.log('  ────────────────────────────');
console.log(`  主题 TOPICS        ${nTopics}`);
console.log(`  演示 MLDemos       ${Object.keys(demos).length}`);
console.log(`  分类 CATEGORIES    ${nCats}`);
console.log(`  路线图阶段         ${nStage}`);
console.log(`  方法论 METHODS     ${Array.isArray(METHODS) ? METHODS.length : 0}`);
console.log(`  延伸阅读           ${Array.isArray(RESOURCES) ? RESOURCES.length : 0}`);
console.log(`  深度长文           ${deepRefs.size}`);
console.log('');

if (warns.length) {
  console.log('  ⚠ 警告');
  warns.forEach(w => console.log('    - ' + w));
  console.log('');
}
if (errors.length) {
  console.log('  ✗ 发现 ' + errors.length + ' 个问题');
  errors.forEach(e => console.log('    - ' + e));
  console.log('');
  process.exit(1);
}
console.log('  ✓ 全部检查通过，可以发布');
console.log('');
