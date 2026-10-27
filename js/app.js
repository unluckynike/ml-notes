/* ============================================================
   ML 图谱 · 应用逻辑
   渲染导航、路线图、方法卡片、主题卡片、资源；交互与动画
   ============================================================ */
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // ---------- 工具 ----------
  function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- 统计 ----------
  $('#statTopics').textContent = TOPICS.length;
  $('#statDemos').textContent = Object.keys(window.MLDemos || {}).length;
  const statCats = $('#statCats');
  if (statCats) statCats.textContent = Object.keys(CATEGORIES).length;

  // ---------- 主题 ----------
  const themeToggle = $('#themeToggle');
  const themeFixed = document.getElementById('themeToggleFixed');
  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    try { localStorage.setItem('mlhub-theme', mode); } catch (e) {}
    window.dispatchEvent(new Event('mltheme'));
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    applyTheme(cur === 'light' ? 'dark' : 'light');
  }
  let savedTheme = 'dark';
  try { savedTheme = localStorage.getItem('mlhub-theme') || 'dark'; } catch (e) {}
  applyTheme(savedTheme);
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (themeFixed) themeFixed.addEventListener('click', toggleTheme);

  // ---------- 导航 ----------
  function buildNav() {
    const nav = $('#navList');
    const secs = [
      { id: 'roadmap', label: '路线图', icon: '🧭' },
      { id: 'graph', label: '知识图谱', icon: '🕸️' },
      { id: 'howto', label: '方法论', icon: '📖' },
      { id: 'topics', label: '全部主题', icon: '🧠' },
      { id: 'resources', label: '延伸阅读', icon: '📚' }
    ];
    let html = '<div class="nav-section">导览</div>';
    secs.forEach(s => {
      html += `<a class="nav-link" data-target="${s.id}"><span class="dot" style="background:var(--accent-2);color:var(--accent-2)"></span>${s.label}</a>`;
    });
    // 主题按分类分组，可折叠；附展开/收起全部
    html += '<div class="nav-section nav-section--groups">全部主题' +
      '<button class="nav-act" data-navact="expand">展开</button>' +
      '<button class="nav-act" data-navact="collapse">收起</button></div>';
    const byCat = {};
    TOPICS.forEach((t, i) => { (byCat[t.cat] = byCat[t.cat] || []).push({ t: t, i: i }); });
    Object.keys(CATEGORIES).forEach(key => {
      const list = byCat[key];
      if (!list || !list.length) return;
      const cat = CATEGORIES[key];
      const links = list.map(({ t, i }) =>
        `<a class="nav-link" data-target="topic-${t.id}" data-cat="${key}"><span class="dot" style="background:${t.accent};color:${t.accent}"></span>${t.name}<span class="num">${String(i).padStart(2, '0')}</span></a>`
      ).join('');
      html += `<div class="nav-group open" data-cat="${key}">` +
        `<button class="nav-group__head" aria-expanded="true"><span class="dot" style="background:${cat.color};color:${cat.color}"></span>${cat.label}<span class="num">${list.length}</span></button>` +
        `<div class="nav-group__body">${links}</div></div>`;
    });
    nav.innerHTML = html;
    nav.querySelectorAll('.nav-link').forEach(a => {
      a.addEventListener('click', () => {
        const el = document.getElementById(a.dataset.target);
        beginNavJump(el);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        watchJumpSettle();
        history.replaceState(null, '', '#' + a.dataset.target);
        document.body.classList.remove('menu-open');
      });
    });
    nav.querySelectorAll('.nav-group__head').forEach(head => {
      head.addEventListener('click', () => {
        const group = head.closest('.nav-group');
        const open = group.classList.toggle('open');
        head.setAttribute('aria-expanded', String(open));
      });
    });
    nav.querySelectorAll('.nav-act').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const expand = btn.dataset.navact === 'expand';
        nav.querySelectorAll('.nav-group').forEach(g => {
          g.classList.toggle('open', expand);
          const head2 = g.querySelector('.nav-group__head');
          if (head2) head2.setAttribute('aria-expanded', String(expand));
        });
      });
    });
  }

  // ---------- 侧栏整体收起（桌面） ----------
  function initSidebarCollapse() {
    const body = document.body;
    const collapse = document.getElementById('sidebarCollapse');
    const show = document.getElementById('sidebarShow');
    let saved = null;
    try { saved = localStorage.getItem('mlhub-sidebar'); } catch (e) {}
    if (saved === 'hidden') body.classList.add('sidebar-hidden');
    const toggle = hide => {
      body.classList.toggle('sidebar-hidden', hide);
      try { localStorage.setItem('mlhub-sidebar', hide ? 'hidden' : 'open'); } catch (e) {}
      window.dispatchEvent(new Event('resize'));
    };
    if (collapse) collapse.addEventListener('click', () => toggle(true));
    if (show) show.addEventListener('click', () => toggle(false));
  }

  // ---------- 路线图 ----------
  function buildRoadmap() {
    const g = $('#roadmapGraph');
    g.innerHTML = ROADMAP.map(st => `
      <div class="roadmap-stage reveal" style="--stage-color:${st.color}">
        <div class="stage__no">STEP ${ROADMAP.indexOf(st) + 1}</div>
        <h4>${st.title}</h4>
        <ul>${st.items.map(i => `<li>${i}</li>`).join('')}</ul>
      </div>`).join('');
  }

  // ---------- 方法论 ----------
  function buildMethods() {
    const m = $('#methodCards');
    m.innerHTML = METHODS.map(x => `
      <div class="method-card reveal">
        <div class="m-no">${x.no}</div>
        <h4>${x.title}</h4>
        <p>${x.desc}</p>
      </div>`).join('');
  }

  // ---------- 主题卡片 ----------
  const TABS = [
    ['intro', '简介'], ['principle', '核心思想'], ['example', '直观例子'],
    ['proscons', '优缺点'], ['history', '发展历程'], ['scenario', '适用场景'],
    ['learn', '怎么上手'], ['deep', '深度阅读'], ['demo', '演示']
  ];
  const TAB_LABEL = Object.fromEntries(TABS);

  // 只保留该主题真正有内容的标签页（「深度阅读」仅当主题声明了 deep 字段才出现）
  const tabsFor = t => TABS.filter(([k]) => k !== 'deep' || !!t.deep);

  function diffStars(d) { return '●'.repeat(d) + '○'.repeat(5 - d); }

  function tabPanel(key, t) {
    const attrs = `role="tabpanel" data-label="${TAB_LABEL[key]}" id="panel-${t.id}-${key}" aria-labelledby="tab-${t.id}-${key}"`;
    if (key === 'intro') {
      return `<div class="tab-panel active" data-panel="intro" ${attrs}>
        <dl class="kv"><dt>这是什么</dt><dd>${t.intro.what}</dd></dl>
        <dl class="kv"><dt>解决了什么问题</dt><dd>${t.intro.problem}</dd></dl>
        <dl class="kv"><dt>一句话核心</dt><dd>${t.intro.idea}</dd></dl>
      </div>`;
    }
    if (key === 'principle') {
      return `<div class="tab-panel" data-panel="principle" ${attrs}>
        ${t.principle.text.map(p => `<p style="margin-bottom:10px;color:var(--text-soft);font-size:14.5px">${p}</p>`).join('')}
        <div class="formula-box"><div class="formula">${t.principle.formula.html}</div><div class="formula-text">${t.principle.formula.note}</div></div>
      </div>`;
    }
    if (key === 'example') {
      return `<div class="tab-panel" data-panel="example" ${attrs}>
        <dl class="kv"><dt>生活化比喻</dt><dd>${t.example.analogy}</dd></dl>
        <dl class="kv"><dt>具体小例子</dt><dd>${t.example.mini}</dd></dl>
      </div>`;
    }
    if (key === 'proscons') {
      return `<div class="tab-panel" data-panel="proscons" ${attrs}><div class="pros-cons">
        <div class="pc-box pc-box--pros"><h5>✔ 优点</h5><ul>${t.pros.map(p => `<li>${p}</li>`).join('')}</ul></div>
        <div class="pc-box pc-box--cons"><h5>✘ 缺点</h5><ul>${t.cons.map(p => `<li>${p}</li>`).join('')}</ul></div>
      </div></div>`;
    }
    if (key === 'history') {
      return `<div class="tab-panel" data-panel="history" ${attrs}><div class="timeline">
        ${t.history.map(h => `<div class="tl-item"><span class="year">${h.year}</span><p>${h.text}</p></div>`).join('')}
      </div></div>`;
    }
    if (key === 'scenario') {
      return `<div class="tab-panel" data-panel="scenario" ${attrs}><div class="pros-cons">
        <div class="pc-box pc-box--pros"><h5>✓ 适用场景</h5><ul>${t.use.map(p => `<li>${p}</li>`).join('')}</ul></div>
        <div class="pc-box pc-box--cons"><h5>✘ 不适用 / 慎用</h5><ul>${t.avoid.map(p => `<li>${p}</li>`).join('')}</ul></div>
      </div></div>`;
    }
    if (key === 'learn') {
      return `<div class="tab-panel" data-panel="learn" ${attrs}><div class="learn-steps">
        ${t.learn.map((s, i) => `<div class="learn-step"><div class="ls-no">${i + 1}</div><p>${s}</p></div>`).join('')}
      </div></div>`;
    }
    if (key === 'demo') {
      return `<div class="tab-panel" data-panel="demo" ${attrs}><div class="demo-mount" data-demo="${t.demo.id}"></div></div>`;
    }
    if (key === 'deep') {
      if (!t.deep) return '';
      return `<div class="tab-panel" data-panel="deep" ${attrs}><div class="deep-mount" data-src="${esc(t.deep)}" data-topic="${t.id}">` +
        `<div class="deep-loading">正在加载长文…</div></div></div>`;
    }
    return '';
  }

  // ---------- 深度阅读（按需加载 markdown） ----------
  const deepCache = Object.create(null);

  // ---------- 长文交叉引用自动链接 ----------
  // 长文里大量「见 XX 深读」的交叉引用：加载后自动把其他主题的名称变成
  // 可点击链接（每个目标只链第一次、跳过代码块、跳过自身）——Wikipedia 式知识网络。
  const TOPIC_ALIASES = (function () {
    const map = new Map();
    const add = function (alias, id) {
      const a = String(alias).trim();
      if (a.length < 2) return;
      const cur = map.get(a.toLowerCase());
      if (!cur || cur.alias.length < a.length) map.set(a.toLowerCase(), { id: id, alias: a });
    };
    TOPICS.forEach(function (t) {
      add(t.name, t.id);
      const head = t.name.trim().split(/\s+/)[0];
      if (/[\u4e00-\u9fa5]/.test(head) && head.length >= 3) add(head, t.id);
      t.name.split(/[\s\/·]+/).forEach(function (tok) {
        if (/[A-Za-z]/.test(tok) && tok.length >= 3) add(tok, t.id);
      });
    });
    [['AI 安全', 'safety'], ['知识蒸馏', 'distill'], ['扩散模型/DDIM', 'diffusion'],
     ['VAE/扩散', 'diffusion'], ['EM', 'em'], ['Mamba', 'ssm'], ['NeRF', 'nerf'],
     ['LoRA', 'lora'], ['RLHF', 'rlhf'], ['CLIP', 'clip'], ['SVM', 'svm'],
     ['HMM', 'hmmkalman'], ['卡尔曼', 'hmmkalman'], ['反向传播', 'mlp'],
     ['RNN', 'rnn'], ['LSTM', 'lstm'], ['GRU', 'gru'], ['GAN', 'gan'],
     ['VAE', 'vae'], ['ROC', 'evaluation'], ['AUC', 'evaluation'],
     ['NumPy', 'numpy'], ['RoPE', 'posenc'], ['MAE', 'ssl'], ['CFG', 'sd'],
     ['贝叶斯网络', 'pgm'], ['高斯混合', 'em'], ['梯度下降', 'gd'],
     ['交叉熵', 'loss'], ['注意力', 'transformer']
    ].forEach(function (pair) { add(pair[0], pair[1]); });
    return Array.from(map.entries())
      .map(function (e) { return { low: e[0], id: e[1].id, alias: e[1].alias }; })
      .sort(function (a, b) { return b.alias.length - a.alias.length; });
  })();

  function autoLinkTopics(mount) {
    const selfId = mount.dataset.topic || '';
    const walker = document.createTreeWalker(mount, NodeFilter.SHOW_TEXT, null);
    const nodes = [];
    while (walker.nextNode()) {
      const p = walker.currentNode.parentElement;
      if (!p || /^(PRE|CODE|A|SCRIPT|STYLE)$/.test(p.tagName)) continue;
      if (walker.currentNode.nodeValue && walker.currentNode.nodeValue.length >= 4) nodes.push(walker.currentNode);
    }
    const linkedIds = new Set([selfId]);
    nodes.forEach(function (node) {
      let cur = node, guard = 0;
      while (cur && guard < 20) {
        guard++;
        let match = null;
        const low = cur.nodeValue.toLowerCase();
        for (let i = 0; i < TOPIC_ALIASES.length; i++) {
          const a = TOPIC_ALIASES[i];
          if (linkedIds.has(a.id)) continue;
          const pos = low.indexOf(a.low);
          if (pos < 0) continue;
          if (/[a-z0-9]/.test(a.low[0]) && pos > 0 && /[a-z0-9]/.test(low[pos - 1])) continue;
          const afterCh = low[pos + a.low.length] || '';
          if (/[a-z0-9]/.test(a.low[a.low.length - 1]) && /[a-z0-9]/.test(afterCh)) continue;
          match = { a: a, pos: pos };
          break;
        }
        if (!match) break;
        const a = match.a, pos = match.pos;
        linkedIds.add(a.id);
        const rest = cur.splitText(pos);
        const tail = rest.splitText(a.alias.length);
        const link = document.createElement('a');
        link.href = '#topic-' + a.id;
        link.className = 'topic-xref';
        const tp = TOPICS.find(function (x) { return x.id === a.id; });
        link.title = '跳转到「' + (tp ? tp.name : a.id) + '」';
        link.textContent = rest.nodeValue;
        link.addEventListener('click', function (e) {
          e.preventDefault();                                  // 拦下原生锚点跳转
          const targetEl = document.getElementById('topic-' + a.id);
          if (!targetEl) { location.hash = link.href.slice(1); return; }
          beginNavJump(targetEl);
          history.pushState(null, '', link.href);              // 保留可分享的 hash
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          watchJumpSettle();
        });
        rest.parentNode.insertBefore(link, rest);
        rest.parentNode.removeChild(rest);
        cur = tail;
      }
    });
  }

  function deepFallback(src, err) {
    const isFile = location.protocol === 'file:';
    if (isFile) {
      return `<div class="deep-error">
        <div class="deep-error__title">📄 长文加载失败</div>
        <p>你现在是用 <code>file://</code> 直接双击打开页面的，浏览器出于安全策略<strong>禁止网页读取本地文件</strong>（CORS 限制，不是文件不存在）。</p>
        <p>两个解决办法，任选其一：</p>
        <ul>
          <li>在项目根目录执行 <code>python3 -m http.server 8000</code>，再访问 <code>http://127.0.0.1:8000/</code></li>
          <li>或者直接看线上版：<code>https://unluckynike.github.io/ml-notes/</code></li>
        </ul>
        <p class="deep-error__note">其余 8 个标签页和所有交互演示都不受影响，可以正常使用。</p>
      </div>`;
    }
    return `<div class="deep-error">
      <div class="deep-error__title">📄 长文加载失败</div>
      <p>无法读取 <code>${esc(src)}</code>${err && err.message ? '（' + esc(err.message) + '）' : ''}。</p>
      <p>请检查该文件是否存在于仓库中，或运行 <code>node tools/check.mjs</code> 自检。</p>
    </div>`;
  }

  function loadDeep(mount) {
    if (mount.dataset.state === 'loading' || mount.dataset.state === 'done') return;
    const src = mount.dataset.src;
    if (!src) return;
    if (deepCache[src]) { mount.innerHTML = deepCache[src]; autoLinkTopics(mount); mount.dataset.state = 'done'; return; }
    if (!window.MLMarkdown) {
      mount.innerHTML = deepFallback(src, { message: 'js/markdown.js 未加载' });
      return;
    }
    mount.dataset.state = 'loading';
    fetch(src)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(text => {
        const html = window.MLMarkdown.renderWithToc(text);
        deepCache[src] = html;
        mount.innerHTML = html;
        autoLinkTopics(mount);
        mount.dataset.state = 'done';
      })
      .catch(e => {
        mount.innerHTML = deepFallback(src, e);
        mount.dataset.state = 'error';
      });
  }

  function buildTopics() {
    const list = $('#topicList');
    list.innerHTML = TOPICS.map((t, i) => {
      const cat = CATEGORIES[t.cat];
      const num = String(i).padStart(2, '0');
      // 搜索索引：不止标题，还覆盖原理/例子/历史/场景/上手正文（去掉内联标签，避免搜到 <strong>）
      const searchText = [
        t.name, t.en, t.tagline, cat.label,
        (t.principle && t.principle.text || []).join(' '),
        t.example ? t.example.analogy + ' ' + t.example.mini : '',
        [].concat(t.pros || [], t.cons || [], t.use || [], t.avoid || [], t.learn || [],
          (t.history || []).map(h => h.year + ' ' + h.text)).join(' '),
        t.demo ? t.demo.title + ' ' + t.demo.note : ''
      ].join(' ').replace(/<[^>]+>/g, '');
      return `
      <article class="topic reveal" id="topic-${t.id}" data-id="${t.id}" data-cat="${t.cat}" data-diff="${t.diff}" data-search="${esc(searchText)}" style="--topic-accent:${t.accent}">
        <div class="topic__header">
          <div class="topic__top">
            <div class="topic__icon">${t.emoji}</div>
            <div class="topic__title-group">
              <h3><span class="topic__name">${t.name}</span> <span class="topic__num">#${num}</span></h3>
              <div class="en">${t.en}</div>
            </div>
          </div>
          <div class="topic__tags">
            <span class="tag tag--cat" style="--tag-color:${cat.color}">${cat.label}</span>
            <span class="tag tag--diff">难度 ${diffStars(t.diff)}</span>
          </div>
          <p class="topic__tagline">${t.tagline}</p>
        </div>
        <div class="topic__tabs" role="tablist" aria-label="${esc(t.name)}的内容">${tabsFor(t).map(([k, lab]) => `<button class="tab-btn ${k === 'intro' ? 'active' : ''}" role="tab" aria-selected="${k === 'intro'}" id="tab-${t.id}-${k}" aria-controls="panel-${t.id}-${k}" data-tab="${k}">${lab}</button>`).join('')}</div>
        <div class="topic__body">${tabsFor(t).map(([k]) => tabPanel(k, t)).join('')}</div>
      </article>`;
    }).join('');

    // 标签页交互（含键盘左右切换 + hash 同步，便于分享直达某个标签页）
    list.querySelectorAll('.topic').forEach(card => {
      const id = card.dataset.id;
      const activate = btn => {
        card.querySelectorAll('.tab-btn').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        card.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const panel = card.querySelector(`[data-panel="${btn.dataset.tab}"]`);
        if (panel) panel.classList.add('active');
        if (btn.dataset.tab === 'deep') {
          const mount = card.querySelector('.deep-mount');
          if (mount) loadDeep(mount);
        }
        history.replaceState(null, '', '#topic-' + id + '/' + btn.dataset.tab);
      };
      card.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => activate(btn));
        btn.addEventListener('keydown', e => {
          if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
          e.preventDefault();
          const btns = Array.from(card.querySelectorAll('.tab-btn'));
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          const next = btns[(btns.indexOf(btn) + dir + btns.length) % btns.length];
          next.focus();
          activate(next);
        });
      });
    });

    // 懒加载演示
    initDemos(list);
  }

  // ---------- 知识图谱（力导向大图） ----------
  function buildGraph() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const EDGE_DATA = (typeof GRAPH_EDGES !== 'undefined') ? GRAPH_EDGES : [];
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = wrap.clientWidth, H = Math.max(480, Math.min(700, Math.round(W * 0.58)));

    // 节点与边
    const nodes = TOPICS.map(function (t) {
      return { id: t.id, name: t.name, cat: t.cat, deg: 0, x: 0, y: 0, vx: 0, vy: 0, r: 6 };
    });
    const byId = new Map(nodes.map(function (n) { return [n.id, n]; }));
    const edges = EDGE_DATA.map(function (e) {
      return { a: byId.get(e[0]), b: byId.get(e[1]), pre: e[2] === 'pre' };
    }).filter(function (e) { return e.a && e.b; });
    edges.forEach(function (e) { e.a.deg++; e.b.deg++; });
    nodes.forEach(function (n) { n.r = 5 + Math.min(n.deg * 0.9, 10); });

    // 分类锚点（初始聚类中心）
    const catList = Object.keys(CATEGORIES);
    const catAnchor = {};
    catList.forEach(function (c, i) {
      const ang = (i / catList.length) * Math.PI * 2 - Math.PI / 2;
      catAnchor[c] = [Math.cos(ang), Math.sin(ang) * 0.75];
    });

    // 相机（平移/缩放）
    let cam = { x: 0, y: 0, k: 1 };
    const hidden = new Set();

    // 初始位置：分类锚点 + 抖动
    function scatter() {
      nodes.forEach(function (n) {
        const a = catAnchor[n.cat];
        n.x = W / 2 + a[0] * W * 0.32 + (Math.random() - 0.5) * 90;
        n.y = H / 2 + a[1] * H * 0.34 + (Math.random() - 0.5) * 90;
        n.vx = n.vy = 0;
      });
      cam = { x: 0, y: 0, k: 1 };
    }
    scatter();

    // 物理一步
    function tick() {
      const vis = nodes.filter(function (n) { return !hidden.has(n.cat); });
      // 斥力
      for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
        const a = vis[i], b = vis[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 1; }
        const f = 2400 / d2, d = Math.sqrt(d2);
        const fx = dx / d * f, fy = dy / d * f;
        a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
      }
      // 弹簧
      edges.forEach(function (e) {
        if (hidden.has(e.a.cat) || hidden.has(e.b.cat)) return;
        const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y;
        const d = Math.hypot(dx, dy) || 1;
        const f = (d - (e.pre ? 80 : 110)) * (e.pre ? 0.02 : 0.008);
        const fx = dx / d * f, fy = dy / d * f;
        e.a.vx += fx; e.a.vy += fy; e.b.vx -= fx; e.b.vy -= fy;
      });
      // 类别聚拢 + 中心引力 + 阻尼
      vis.forEach(function (n) {
        const a = catAnchor[n.cat];
        n.vx += (W / 2 + a[0] * W * 0.3 - n.x) * 0.012;
        n.vy += (H / 2 + a[1] * H * 0.3 - n.y) * 0.012;
        n.vx *= 0.82; n.vy *= 0.82;
        n.x += Math.max(-14, Math.min(14, n.vx));
        n.y += Math.max(-14, Math.min(14, n.vy));
      });
    }

    // 渲染
    const catColor = function (c) { return CATEGORIES[c] ? CATEGORIES[c].color : '#8b93b8'; };
    let hovered = null;
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg') || '#0a0e1a';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(W / 2 + cam.x, H / 2 + cam.y);
      ctx.scale(cam.k, cam.k);
      ctx.translate(-W / 2, -H / 2);
      drawCount++;
      const dim = function (n) { return hovered && n !== hovered && !n._adj; };
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      const edgePre = light ? 'rgba(30,58,138,0.40)' : 'rgba(140,160,210,0.30)';
      const edgeRel = light ? 'rgba(71,85,105,0.26)' : 'rgba(140,160,210,0.12)';
      const edgeHot = light ? 'rgba(2,132,199,0.95)' : 'rgba(0,212,255,0.85)';
      const labelCol = light ? 'rgba(30,41,59,0.92)' : 'rgba(210,220,245,0.9)';
      const labelHot = light ? '#0c4a6e' : '#ffffff';
      // 边
      edges.forEach(function (e) {
        if (hidden.has(e.a.cat) || hidden.has(e.b.cat)) return;
        const hot = hovered && (e.a === hovered || e.b === hovered);
        ctx.strokeStyle = hot ? edgeHot : (e.pre ? edgePre : edgeRel);
        ctx.lineWidth = hot ? 2 : e.pre ? 1.2 : 0.8;
        if (!e.pre) ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.lineTo(e.b.x, e.b.y); ctx.stroke();
        ctx.setLineDash([]);
      });
      // 点
      nodes.forEach(function (n) {
        if (hidden.has(n.cat)) return;
        const c = catColor(n.cat);
        const isHot = hovered === n, isAdj = hovered && n._adj;
        ctx.globalAlpha = dim(n) ? 0.18 : 1;
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(n.x, n.y, isHot ? n.r + 2 : n.r, 0, 7); ctx.fill();
        if (isHot) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(n.x, n.y, n.r + 4, 0, 7); ctx.stroke(); }
        // 标签：悬浮/邻接/大节点/高缩放时显示
        if (isHot || isAdj || n.deg >= 5 || cam.k > 1.35) {
          ctx.fillStyle = isHot ? labelHot : labelCol;
          ctx.font = (isHot ? 'bold ' : '') + '10px "PingFang SC", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(n.name, n.x, n.y + n.r + 11);
        }
        ctx.globalAlpha = 1;
      });
      ctx.restore();
      // 状态角标（自诊断：W/H/缩放/帧数随时可见）
      ctx.fillStyle = light ? 'rgba(30,41,59,0.5)' : 'rgba(139,147,184,0.6)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('W' + W + ' × H' + H + ' · k' + cam.k.toFixed(2) + ' · 节点' + nodes.length + ' · 边' + edges.length + ' · 帧' + drawCount, 10, H - 8);
    }

    // 主循环：交互后跑 120 帧（省电），静止即停
    let running = false, runFrames = 0, drawCount = 0;
    function loop() {
      if (!running) return;
      try {
        tick();
        if (runFrames-- > 0 || dragged) draw();
      } catch (err) {
        running = false;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#b91c1c';
        ctx.font = '13px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('图谱渲染出错（请截图反馈）：', 20, 40);
        String(err && err.stack || err).split('\n').slice(0, 8).forEach(function (line, i) {
          ctx.fillText(line.slice(0, 160), 20, 66 + i * 20);
        });
        return;
      }
      if (runFrames > 0) requestAnimationFrame(loop);
      else running = false;
    }
    function wake(frames) {
      runFrames = Math.max(runFrames, frames);
      if (!running) { running = true; requestAnimationFrame(loop); }
    }

    // 交互：命中测试
    function hitTest(px, py) {
      const wx = (px - W / 2 - cam.x) / cam.k + W / 2;
      const wy = (py - H / 2 - cam.y) / cam.k + H / 2;
      let best = null, bd = 1e9;
      nodes.forEach(function (n) {
        if (hidden.has(n.cat)) return;
        const d2 = (n.x - wx) * (n.x - wx) + (n.y - wy) * (n.y - wy);
        if (d2 < (n.r + 6) * (n.r + 6) && d2 < bd) { bd = d2; best = n; }
      });
      return best;
    }
    function markAdj(n) {
      nodes.forEach(function (x) { x._adj = false; });
      if (!n) return;
      edges.forEach(function (e) {
        if (e.a === n) e.b._adj = true;
        if (e.b === n) e.a._adj = true;
      });
    }

    let dragged = null, dragMoved = 0, panning = false, panStart = null;
    canvas.addEventListener('pointerdown', function (e) {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      dragMoved = 0;
      const n = hitTest(px, py);
      if (n) { dragged = n; wake(600); }
      else { panning = true; panStart = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y }; }
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      if (dragged) {
        dragMoved += Math.abs(e.movementX) + Math.abs(e.movementY);
        dragged.x = (px - W / 2 - cam.x) / cam.k + W / 2;
        dragged.y = (py - H / 2 - cam.y) / cam.k + H / 2;
        dragged.vx = dragged.vy = 0;
        wake(10);
      } else if (panning) {
        cam.x = panStart.cx + (e.clientX - panStart.x);
        cam.y = panStart.cy + (e.clientY - panStart.y);
        wake(5);
      } else {
        const h = hitTest(px, py);
        if (h !== hovered) {
          hovered = h;
          if (h) markAdj(h);
          wake(20);
        }
      }
    });
    canvas.addEventListener('pointerup', function (e) {
      if (dragged && dragMoved < 4) {
        // 视为点击 → 跳到主题卡
        const el = document.getElementById('topic-' + dragged.id);
        if (el) {
          const targetEl = el;
          beginNavJump(targetEl);
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          watchJumpSettle();
          history.replaceState(null, '', '#topic-' + dragged.id);
        }
      }
      dragged = null; panning = false;
    });
    // 缩放：Ctrl/⌘ + 滚轮（普通滚轮放行给页面滚动——避免「想往下滚页面却被劫持成放大」）
    canvas.addEventListener('wheel', function (e) {
      if (!(e.ctrlKey || e.metaKey)) return;   // 普通滚轮 → 页面自然滚动
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      const k0 = cam.k;
      cam.k = clamp(cam.k * (e.deltaY < 0 ? 1.12 : 0.89), 0.3, 4);
      // 指针锚定：缩放后指针下的世界坐标保持不变
      const wx = (px - W / 2 - cam.x) / k0 + W / 2;
      const wy = (py - H / 2 - cam.y) / k0 + H / 2;
      cam.x = px - W / 2 - (wx - W / 2) * cam.k;
      cam.y = py - H / 2 - (wy - H / 2) * cam.k;
      wake(20);
    }, { passive: false });

    // 视角：自适应装下全部可见节点
    function fitView() {
      const vis = nodes.filter(function (n) { return !hidden.has(n.cat); });
      if (!vis.length) { cam = { x: 0, y: 0, k: 1 }; wake(30); return; }
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      vis.forEach(function (n) { x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x); y1 = Math.max(y1, n.y); });
      const pad = 70, bw = Math.max(x1 - x0, 200), bh = Math.max(y1 - y0, 200);
      cam.k = clamp(Math.min(W / (bw + pad * 2), H / (bh + pad * 2)), 0.3, 1.8);
      cam.x = W / 2 - cam.k * ((x0 + x1) / 2 - W / 2);
      cam.y = H / 2 - cam.k * ((y0 + y1) / 2 - H / 2);
      draw();                                    // 同步首帧：不依赖动画帧
      wake(30);
    }
    // 预热后自适应一次，保证初始状态正好装下全部节点
    const _warm = function () { for (let i = 0; i < 240; i++) tick(); fitView(); };
    const _wake = wake;

    // 工具条：分类筛选 + 重置
    const bar = document.getElementById('graphToolbar');
    if (bar) {
      bar.innerHTML = catList.map(function (c) {
        return '<button class="chip active" data-gcat="' + c + '" style="--chip-color:' + CATEGORIES[c].color + '">' + CATEGORIES[c].label + '</button>';
      }).join('') +
      '<span class="graph-zoom">' +
      '<button class="graph-reset" data-zoom="in" title="放大（也可 Ctrl/⌘+滚轮）">＋</button>' +
      '<button class="graph-reset" data-zoom="out" title="缩小">－</button>' +
      '<button class="graph-reset" data-zoom="fit" title="自适应视角">⌂ 视角</button>' +
      '<button class="graph-reset">重置布局</button></span>';
      const zoomBy = function (f) {
        cam.k = clamp(cam.k * f, 0.3, 4);
        draw();                                    // 同步绘制：不依赖动画帧
        wake(30);
      };
      bar.addEventListener('click', function (e) {
        const chip = e.target.closest('.chip');
        if (chip) {
          const c = chip.dataset.gcat;
          if (hidden.has(c)) { hidden.delete(c); chip.classList.add('active'); }
          else { hidden.add(c); chip.classList.remove('active'); }
          fitView();                               // 内部已同步绘制
          wake(60);
          return;
        }
        const z = e.target.dataset.zoom;
        if (z === 'in') zoomBy(1.3);
        else if (z === 'out') zoomBy(0.77);
        else if (z === 'fit') fitView();
        if (e.target.classList.contains('graph-reset') && !z) { scatter(); for (let i = 0; i < 240; i++) tick(); fitView(); wake(200); }
      });
    }
    window.addEventListener('resize', function () {
      W = wrap.clientWidth;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.height = H + 'px';
      wake(30);
    });
    window.addEventListener('mltheme', function () { wake(30); });
    if ('ResizeObserver' in window) {
      const gro = new ResizeObserver(function () {
        const w2 = wrap.clientWidth;
        if (w2 && Math.abs(w2 - W) > 2) {
          W = w2;
          canvas.width = W * dpr; canvas.height = H * dpr;
          fitView();
        }
        wake(20);
      });
      gro.observe(wrap);
    }
    // 进入视口时复核尺寸并重绘（初始化时区块可能在折叠/不可见状态）
    if ('IntersectionObserver' in window) {
      const gio = new IntersectionObserver(function (entries) {
        if (!entries.some(function (en) { return en.isIntersecting; })) return;
        const w2 = wrap.clientWidth;
        if (w2 && Math.abs(w2 - W) > 2) {
          W = w2;
          canvas.width = W * dpr; canvas.height = H * dpr;
        }
        wake(120);
      }, { rootMargin: '100px' });
      gio.observe(wrap);
    }

    // 预热 240 帧 + 自适应视角 + 同步首帧（不依赖 rAF——部分环境动画帧不触发）
    try {
      _warm();
    } catch (err) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#b91c1c';
      ctx.font = '13px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('图谱初始化出错（请截图反馈）：', 20, 40);
      ctx.fillText(String(err && err.message || err).slice(0, 120), 20, 66);
      return;
    }
    draw();
    _wake(400);
  }

  // ---------- 资源 ----------
  function buildResources() {
    const g = $('#resourceGrid');
    g.innerHTML = RESOURCES.map(r => `
      <div class="resource-card reveal">
        <div class="rc-tag">${r.tag}</div>
        <h4>${r.title}</h4>
        <p>${r.desc}</p>
        <a href="${r.url}" target="_blank" rel="noopener">前往查看 →</a>
      </div>`).join('');
  }

  // ---------- 演示懒加载 ----------
  // demos.js 是异步加载的（约 1MB），所以这里必须处理「脚本还没到」的情况：
  // 先轮询等待 window.MLDemos 出现，到了再初始化；只有真正初始化成功才断开 observer。
  //
  // 导航跳转挂起（navJump）：平滑滚动跨越长页时，途经的每个懒加载演示都会被
  // IntersectionObserver 触发初始化（各 ~450px），页面在滚动过程中不断「长高」，
  // 落点停在过期位置——侧栏点击与实际内容对不上。因此跳转期间挂起初始化
  // （observer 保持待命），滚动停止后只初始化当前视口附近的演示，其余保持懒加载。
  let navJumping = false;
  function kickVisibleDemos() {
    document.querySelectorAll('.demo-mount').forEach(m => {
      const r = m.getBoundingClientRect();
      if (r.top < window.innerHeight + 300 && r.bottom > -300 && m._kick) m._kick();
    });
  }

  function initDemos(scope) {
    const mounts = scope.querySelectorAll('.demo-mount');
    mounts.forEach(mount => {
      const card = mount.closest('.topic');
      const id = mount.dataset.demo;
      let started = false, timer = null;

      const start = () => {
        if (started) return;
        if (navJumping) return;                 // 跳转中挂起：observer 保持待命，滚动停止后再初始化
        if (!window.MLDemos) {                  // 脚本尚未加载完成 → 稍后重试
          timer = setTimeout(start, 300);
          return;
        }
        if (!window.MLDemos[id]) {              // 脚本已到但这支演示缺失 → 真的是 bug
          console.error('demo not registered:', id);
          mount.innerHTML = '<p style="color:var(--muted);padding:16px">演示加载失败</p>';
          started = true;
          return;
        }
        started = true;
        if (timer) { clearTimeout(timer); timer = null; }
        const t = TOPICS.find(x => x.demo.id === id);
        try { window.MLDemos[id](mount, t && t.demo); }
        catch (e) { console.error('demo init failed', id, e); mount.innerHTML = '<p style="color:var(--muted);padding:16px">演示加载失败</p>'; }
      };
      mount._kick = start;

      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          if (!entries.some(e => e.isIntersecting)) return;
          start();
          if (started) obs.disconnect();         // 没初始化成功就不断开，等重试
        }, { rootMargin: '200px' });
        obs.observe(card);
      } else { start(); }
    });
  }

  // ---------- 筛选与搜索（关键词 / 分类 / 难度 三者叠加） ----------
  let activeCat = '', activeDiff = 0;

  function buildFilter() {
    const bar = $('#topicFilter');
    if (!bar) return;
    bar.innerHTML =
      `<button class="chip active" data-cat="">全部</button>` +
      Object.keys(CATEGORIES).map(k =>
        `<button class="chip" data-cat="${k}" style="--chip-color:${CATEGORIES[k].color}">${CATEGORIES[k].label}</button>`).join('') +
      `<select class="diff-select" id="diffSelect" aria-label="按难度筛选">` +
      `<option value="0">全部难度</option>` +
      [1, 2, 3, 4, 5].map(d => `<option value="${d}">${'★'.repeat(d)}</option>`).join('') +
      `</select>`;
    bar.addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      activeCat = chip.dataset.cat;
      bar.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c === chip));
      applyFilters();
      const topicsSec = document.getElementById('topics');
      beginNavJump(topicsSec);
      topicsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      watchJumpSettle();
    });
    $('#diffSelect').addEventListener('change', e => {
      activeDiff = parseInt(e.target.value, 10) || 0;
      applyFilters();
    });
  }

  function applyFilters() {
    const q = ($('#searchInput').value || '').trim().toLowerCase();
    let shown = 0;
    $$('.topic').forEach(card => {
      const hit = (!q || card.dataset.search.toLowerCase().includes(q))
        && (!activeCat || card.dataset.cat === activeCat)
        && (!activeDiff || card.dataset.diff === String(activeDiff));
      card.style.display = hit ? '' : 'none';
      if (hit) shown++;
      // 搜索命中高亮：在主题名里标出命中片段
      const nameEl = card.querySelector('.topic__name');
      if (nameEl) {
        if (!nameEl.dataset.orig) nameEl.dataset.orig = nameEl.textContent;
        const orig = nameEl.dataset.orig;
        if (hit && q) {
          const idx = orig.toLowerCase().indexOf(q);
          nameEl.innerHTML = idx >= 0
            ? esc(orig.slice(0, idx)) + '<mark>' + esc(orig.slice(idx, idx + q.length)) + '</mark>' + esc(orig.slice(idx + q.length))
            : esc(orig);
        } else nameEl.textContent = orig;
      }
    });
    // 侧栏链接同步过滤（难度不参与，保持导航完整）
    $$('#navList .nav-link').forEach(a => {
      const hit = (!q || a.textContent.toLowerCase().includes(q))
        && (!activeCat || a.dataset.cat === activeCat);
      a.style.display = hit ? '' : 'none';
    });
    $$('#navList .nav-group').forEach(g => {
      const any = Array.from(g.querySelectorAll('.nav-link')).some(a => a.style.display !== 'none');
      g.style.display = any ? '' : 'none';
    });
    const empty = $('#topicEmpty');
    if (empty) empty.style.display = shown === 0 ? '' : 'none';
    const cnt = $('#topicCount');
    if (cnt) cnt.textContent = shown === TOPICS.length
      ? '共 ' + TOPICS.length + ' 个主题'
      : '显示 ' + shown + ' / ' + TOPICS.length + ' 个主题';
  }

  function initSearch() {
    $('#searchInput').addEventListener('input', applyFilters);
  }

  // ---------- hash 路由：#topic-<id> 或 #topic-<id>/<tab> ----------
  function activateFromHash() {
    const m = /^#topic-([\w-]+)(?:\/(\w+))?/.exec(location.hash);
    if (!m) return;
    const card = document.getElementById('topic-' + m[1]);
    if (!card) return;
    beginNavJump(card);
    card.scrollIntoView({ block: 'start' });
    watchJumpSettle();
    if (!m[2]) return;
    const btn = card.querySelector(`.tab-btn[data-tab="${m[2]}"]`);
    if (btn) btn.click();
  }

  // —— 导航跳转的演示挂起控制 ——
  let navJumpTarget = null;
  function beginNavJump(targetEl) {
    navJumping = true;
    navJumpTarget = targetEl || null;
  }
  // 滚动静止 250ms 视为到位：解除挂起、初始化视口附近的演示，
  // 并对目标卡片做一次「重新对齐」——消除途中演示撑开页面造成的残余漂移
  function watchJumpSettle() {
    let lastY = window.scrollY;
    const check = () => {
      if (Math.abs(window.scrollY - lastY) < 1) {
        if (navJumping) {
          navJumping = false;
          kickVisibleDemos();
          if (navJumpTarget) {
            const t = navJumpTarget; navJumpTarget = null;
            requestAnimationFrame(() => t.scrollIntoView({ block: 'start' }));
          }
        }
        return;
      }
      lastY = window.scrollY;
      setTimeout(check, 120);
    };
    setTimeout(check, 150);
  }

  // ---------- 滚动：进度条 + 回顶 + 高亮 + 动画 ----------
  function initScroll() {
    const progress = $('#readProgress');
    const backTop = $('#backTop');
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      backTop.classList.toggle('show', h.scrollTop > 600);
    }, { passive: true });
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // 高亮当前导航
    const links = $$('#navList .nav-link');
    const map = {};
    links.forEach(a => { const t = a.dataset.target; if (t) map[t] = a; });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(l => l.classList.remove('active'));
          map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    $$('#roadmap, #graph, #howto, #topics, #resources').forEach(s => obs.observe(s));
    $$('.topic').forEach(t => obs.observe(t));

    // 进入视口动画
    const revObs = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in-view'); revObs.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(el => revObs.observe(el));
  }

  // ---------- 移动端菜单 ----------
  function initMenu() {
    const toggle = $('#menuToggle');
    const overlay = $('#overlay');
    const closeMenu = window.__closeMenu = () => document.body.classList.remove('menu-open');
    toggle.addEventListener('click', () => document.body.classList.toggle('menu-open'));
    overlay.addEventListener('click', closeMenu);
  }

  // ---------- Hero 背景动画 ----------
  function initHero() {
    const canvas = $('#heroCanvas');
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W, H;
    const resize = () => {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    const ctx = canvas.getContext('2d');
    const N = 46, pts = [];
    for (let i = 0; i < N; i++) pts.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .0012, vy: (Math.random() - .5) * .0012, r: Math.random() * 1.8 + .8 });
    const colors = ['#6c5ce7', '#00d4ff', '#ff7ac6'];
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      }
      for (let i = 0; i < N; i++) {
        const a = pts[i];
        ctx.beginPath();
        ctx.fillStyle = colors[i % 3];
        ctx.globalAlpha = .7;
        ctx.arc(a.x * W, a.y * H, a.r, 0, 7);
        ctx.fill();
        for (let j = i + 1; j < N; j++) {
          const b = pts[j];
          const dx = (a.x - b.x) * W, dy = (a.y - b.y) * H;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            ctx.globalAlpha = (1 - dist / 130) * .22;
            ctx.strokeStyle = colors[i % 3];
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x * W, a.y * H); ctx.lineTo(b.x * W, b.y * H); ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      if (!navigator.webdriver) requestAnimationFrame(tick);
    }
    tick();
  }

  // ---------- 启动 ----------
  buildNav();
  buildRoadmap();
  buildGraph();
  buildMethods();
  buildTopics();
  buildFilter();
  buildResources();
  initSearch();
  applyFilters();
  initScroll();
  initMenu();
  initSidebarCollapse();
  initHero();
  activateFromHash();
  window.addEventListener('hashchange', activateFromHash);
})();
