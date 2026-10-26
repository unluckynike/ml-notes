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
        beginNavJump();
        document.getElementById(a.dataset.target).scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      return `<div class="tab-panel" data-panel="deep" ${attrs}><div class="deep-mount" data-src="${esc(t.deep)}">` +
        `<div class="deep-loading">正在加载长文…</div></div></div>`;
    }
    return '';
  }

  // ---------- 深度阅读（按需加载 markdown） ----------
  const deepCache = Object.create(null);

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
    if (deepCache[src]) { mount.innerHTML = deepCache[src]; mount.dataset.state = 'done'; return; }
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
              <h3>${t.name} <span class="topic__num">#${num}</span></h3>
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
      beginNavJump();
      document.getElementById('topics').scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    beginNavJump();
    card.scrollIntoView({ block: 'start' });
    watchJumpSettle();
    if (!m[2]) return;
    const btn = card.querySelector(`.tab-btn[data-tab="${m[2]}"]`);
    if (btn) btn.click();
  }

  // —— 导航跳转的演示挂起控制 ——
  function beginNavJump() {
    navJumping = true;
  }
  // 滚动静止 250ms 视为到位：解除挂起并初始化视口附近的演示
  function watchJumpSettle() {
    let lastY = window.scrollY;
    const check = () => {
      if (Math.abs(window.scrollY - lastY) < 1) {
        if (navJumping) { navJumping = false; kickVisibleDemos(); }
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
    $$('#roadmap, #howto, #topics, #resources').forEach(s => obs.observe(s));
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
