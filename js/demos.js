/* ============================================================
   ML 图谱 · 交互式可视化演示
   每个演示是一个独立的 canvas 小实验，纯浏览器本地计算
   ============================================================ */
(function () {
  'use strict';

  // ---------- 工具函数 ----------
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rng) {
    let u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  const round = (x, d) => { const p = Math.pow(10, d || 2); return Math.round(x * p) / p; };
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  function setup(canvas, W, H) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.aspectRatio = W + '/' + H;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, W: W, H: H };
  }

  // 配色（演示区固定深色画布，保证跨主题一致）
  const C = {
    bg: '#0c1224', grid: 'rgba(120,145,200,0.10)', axis: '#33406b', text: '#93a0c2',
    cyan: '#00d4ff', magenta: '#ff7ac6', green: '#00e6a0', orange: '#ffb85c',
    purple: '#a06bff', red: '#ff6b6b', blue: '#5c9bff', yellow: '#ffe066', white: '#e9eefb'
  };

  function clear(ctx, W, H) { ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); }
  function text(ctx, s, x, y, color, align, size) {
    ctx.fillStyle = color || C.text;
    ctx.font = (size || 12) + 'px "SF Mono", Menlo, Consolas, monospace';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(s, x, y);
  }
  function grid(ctx, W, H, step) {
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    for (let x = 0; x <= W; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }
  function makeButton(label, onclick, primary) {
    const b = document.createElement('button');
    b.className = 'ctrl-btn' + (primary ? ' primary' : '');
    b.textContent = label;
    b.addEventListener('click', onclick);
    return b;
  }
  function makeSelect(options, onChange) {
    const s = document.createElement('select'); s.className = 'ctrl-select';
    options.forEach(o => { const op = document.createElement('option'); op.value = o.value; op.textContent = o.label; s.appendChild(op); });
    s.addEventListener('change', () => onChange(s.value));
    return s;
  }
  function makeRange(min, max, step, value, onChange, label) {
    const wrap = document.createElement('label'); wrap.className = 'ctrl-label';
    const r = document.createElement('input'); r.type = 'range'; r.className = 'ctrl-range';
    r.min = min; r.max = max; r.step = step; r.value = value;
    const s = document.createElement('span'); s.textContent = (label ? label + ' ' : '') + value;
    r.addEventListener('input', () => { s.textContent = (label ? label + ' ' : '') + r.value; onChange(parseFloat(r.value)); });
    wrap.appendChild(r); wrap.appendChild(s);
    return wrap;
  }

  function demoShell(title, note) {
    const d = document.createElement('div'); d.className = 'demo';
    d.innerHTML =
      '<div class="demo__head"><span class="demo__badge">DEMO</span><h5>' + title +
      '</h5><div class="demo__controls"></div></div>' +
      '<div class="demo__canvas-wrap"><canvas></canvas></div>' +
      '<div class="demo__foot">' + note + '</div>';
    return { root: d, controls: d.querySelector('.demo__controls'), canvas: d.querySelector('canvas') };
  }

  // ---------- 线性代数（供多项式拟合 / RNN 使用） ----------
  function solveLinear(A, b) {
    const n = A.length;
    const M = A.map((row, i) => row.concat(b[i]));
    for (let col = 0; col < n; col++) {
      let piv = col;
      for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
      const tmp = M[col]; M[col] = M[piv]; M[piv] = tmp;
      const d = M[col][col];
      if (Math.abs(d) < 1e-12) continue;
      for (let c = col; c <= n; c++) M[col][c] /= d;
      for (let r = 0; r < n; r++) {
        if (r === col) continue;
        const f = M[r][col];
        for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
      }
    }
    return M.map(r => r[n]);
  }
  function polyfit(xs, ys, deg) {
    const A = [], b = [];
    for (let j = 0; j <= deg; j++) { A.push([]); b.push(0); }
    for (let j = 0; j <= deg; j++) {
      for (let k = 0; k <= deg; k++) {
        let s = 0; for (let i = 0; i < xs.length; i++) s += Math.pow(xs[i], j + k);
        A[j][k] = s;
      }
      let s = 0; for (let i = 0; i < xs.length; i++) s += Math.pow(xs[i], j) * ys[i];
      b[j] = s;
    }
    return solveLinear(A, b);
  }
  function evalPoly(c, x) { let s = 0; for (let i = 0; i < c.length; i++) s += c[i] * Math.pow(x, i); return s; }

  const matVec = (M, v) => M.map(row => row.reduce((s, rv, i) => s + rv * v[i], 0));
  const matVecT = (M, v) => M[0].map((_, j) => M.reduce((s, row, i) => s + row[j] * v[i], 0));
  const vecAdd = (a, b) => a.map((x, i) => x + b[i]);
  const vecScale = (a, s) => a.map(x => x * s);
  const outer = (a, b) => a.map(ai => b.map(bj => ai * bj));
  const matAdd = (A, B) => A.map((r, i) => r.map((x, j) => x + B[i][j]));
  const matScale = (A, s) => A.map(r => r.map(x => x * s));
  const zeros = n => Array.from({ length: n }, () => 0);
  const zerosM = (r, c) => Array.from({ length: r }, () => zeros(c));
  const softmax = v => { const m = Math.max.apply(null, v); const e = v.map(x => Math.exp(x - m)); const s = e.reduce((a, b) => a + b, 0); return e.map(x => x / s); };
  function clipGrads(gs, thresh) {
    let norm = 0;
    gs.forEach(g => { if (Array.isArray(g[0])) g.forEach(r => r.forEach(v => { norm += v * v; })); else g.forEach(v => { norm += v * v; }); });
    norm = Math.sqrt(norm);
    if (norm > thresh) {
      const s = thresh / norm;
      gs.forEach(g => { if (Array.isArray(g[0])) g.forEach(r => { for (let i = 0; i < r.length; i++) r[i] *= s; }); else { for (let i = 0; i < g.length; i++) g[i] *= s; } });
    }
  }

  // ============================================================
  // 00 · 正态分布
  // ============================================================
  function dist(container) {
    const d = demoShell('正态分布 · 交互演示', '拖动均值 μ 与标准差 σ，观察分布形状与 68–95–99.7 法则。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 340);
    let mu = 0, sigma = 2;
    function pdf(x) { return Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma)) / (sigma * Math.sqrt(2 * Math.PI)); }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const cx = W / 2, base = H - 60, hgt = H - 110;
      // x 轴
      ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(40, base); ctx.lineTo(W - 40, base); ctx.stroke();
      const x0 = mu - 4 * sigma, x1 = mu + 4 * sigma;
      const toX = x => 40 + (x - x0) / (x1 - x0) * (W - 80);
      // 阴影区域 ±1σ ±2σ ±3σ
      const bands = [[1, 'rgba(0,212,255,0.28)'], [2, 'rgba(0,212,255,0.16)'], [3, 'rgba(0,212,255,0.08)']];
      for (const [k, col] of bands) {
        ctx.fillStyle = col;
        ctx.beginPath();
        const a = toX(mu - k * sigma), b = toX(mu + k * sigma);
        ctx.rect(a, base, b - a, -hgt); ctx.fill();
      }
      // 曲线
      ctx.strokeStyle = C.white; ctx.lineWidth = 2.5; ctx.beginPath();
      for (let px = 40; px <= W - 40; px++) {
        const x = x0 + (px - 40) / (W - 80) * (x1 - x0);
        const y = base - pdf(x) * hgt * (sigma * Math.sqrt(2 * Math.PI));
        if (px === 40) ctx.moveTo(px, y); else ctx.lineTo(px, y);
      }
      ctx.stroke();
      // μ 与 ±σ 标记
      ctx.strokeStyle = C.cyan; ctx.setLineDash([4, 4]);
      [[0, 'μ'], [-1, '−σ'], [1, '+σ']].forEach(([k, lab]) => {
        const x = toX(mu + k * sigma);
        ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x, base - hgt); ctx.stroke();
        text(ctx, lab, x, base + 18, C.cyan, 'center', 12);
      });
      ctx.setLineDash([]);
      text(ctx, '68.3%', (toX(mu - sigma) + toX(mu + sigma)) / 2, base - hgt * 0.55, C.white, 'center', 13);
      text(ctx, '95.4%', (toX(mu - 2 * sigma) + toX(mu + 2 * sigma)) / 2, base - hgt * 0.25, C.text, 'center', 12);
      text(ctx, '99.7%', (toX(mu - 3 * sigma) + toX(mu + 3 * sigma)) / 2, base - hgt * 0.05, C.text, 'center', 11);
      text(ctx, 'μ = ' + round(mu, 1) + '   σ = ' + round(sigma, 2), 50, 24, C.text, 'left', 13);
    }
    d.controls.appendChild(makeRange(-8, 8, 0.5, mu, v => { mu = v; draw(); }, 'μ'));
    d.controls.appendChild(makeRange(0.5, 5, 0.1, sigma, v => { sigma = v; draw(); }, 'σ'));
    draw();
  }

  // ============================================================
  // 01 · 线性回归
  // ============================================================
  function linear(container) {
    const d = demoShell('线性回归 · 3D 平面拟合', '拖拽旋转；用平面 ŷ = w1·x1 + w2·x2 + b 拟合 3D 数据，粉色竖线是残差。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(101);
    const N = 40, X0 = -3, X1 = 3;
    const data = [];
    for (let i = 0; i < N; i++) { const x1 = X0 + rng() * (X1 - X0), x2 = X0 + rng() * (X1 - X0); data.push({ x1, x2, y: 2 * x1 + 1.5 * x2 + 1 + gauss(rng) * 1.6 }); }
    let w1 = 0, w2 = 0, b = 5, mse = 0;
    const state = { yaw: -0.7, pitch: 0.4 };
    const wy = v => (v - 1) * 0.14;
    const wpt = (x1, h, x2) => ({ x: x1 * 0.7, y: wy(h), z: x2 * 0.7 });
    const planeH = (x1, x2) => w1 * x1 + w2 * x2 + b;
    function computeMse() { let s = 0; for (const p of data) { const e = p.y - planeH(p.x1, p.x2); s += e * e; } return s / N; }
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      // 平面网格（半透明）
      const G = 14;
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
        const x1a = X0 + i / G * (X1 - X0), x1b = X0 + (i + 1) / G * (X1 - X0);
        const x2a = X0 + j / G * (X1 - X0), x2b = X0 + (j + 1) / G * (X1 - X0);
        const a = prj(wpt(x1a, planeH(x1a, x2a), x2a));
        const b2 = prj(wpt(x1b, planeH(x1b, x2a), x2a));
        const c2 = prj(wpt(x1b, planeH(x1b, x2b), x2b));
        const d2 = prj(wpt(x1a, planeH(x1a, x2b), x2b));
        ctx.fillStyle = 'rgba(0,212,255,0.16)';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(d2.x, d2.y); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(0,212,255,0.22)'; ctx.lineWidth = 0.5; ctx.stroke();
      }
      // 残差线
      for (const p of data) {
        const a = prj(wpt(p.x1, p.y, p.x2));
        const b2 = prj(wpt(p.x1, planeH(p.x1, p.x2), p.x2));
        ctx.strokeStyle = 'rgba(255,122,198,0.4)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.stroke();
      }
      // 数据点（画家排序）
      const order = data.map((p, i) => ({ i, z: rot(wpt(p.x1, p.y, p.x2)).z })).sort((a, b) => a.z - b.z);
      for (const o of order) {
        const p = data[o.i]; const pp = prj(wpt(p.x1, p.y, p.x2));
        ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.arc(pp.x, pp.y, 3.6 * pp.s / 57, 0, 7); ctx.fill();
      }
      mse = computeMse();
      text(ctx, 'ŷ = ' + round(w1, 2) + 'x1 + ' + round(w2, 2) + 'x2 + ' + round(b, 2), 70, 30, C.cyan, 'left', 14);
      text(ctx, 'MSE = ' + round(mse, 3) + '　拖拽旋转', 70, 52, C.text, 'left', 13);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(-2, 4, 0.1, w1, v => { w1 = v; draw(); }, 'w1'));
    d.controls.appendChild(makeRange(-2, 4, 0.1, w2, v => { w2 = v; draw(); }, 'w2'));
    d.controls.appendChild(makeRange(-4, 8, 0.1, b, v => { b = v; draw(); }, 'b'));
    d.controls.appendChild(makeButton('自动拟合', () => {
      w1 = 0; w2 = 0; b = 5; draw();
      const lr = 0.02; let step = 0;
      const tick = () => {
        let dw1 = 0, dw2 = 0, db = 0;
        for (const p of data) { const e = p.y - planeH(p.x1, p.x2); dw1 += -2 * p.x1 * e / N; dw2 += -2 * p.x2 * e / N; db += -2 * e / N; }
        w1 -= lr * dw1; w2 -= lr * dw2; b -= lr * db;
        draw(); step++;
        if (step < 600) requestAnimationFrame(tick);
      };
      tick();
    }, true));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 02 · 逻辑回归（Sigmoid）
  // ============================================================
  function logistic(container) {
    const d = demoShell('逻辑回归 · 3D Sigmoid 曲面', '拖拽旋转；曲面高度 = P(正类)。拖 w1/w2/b 看 S 形曲面如何倾斜，地面绿线是 0.5 决策边界。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(414);
    const sig = z => 1 / (1 + Math.exp(-z));
    let w1 = 1, w2 = 1, b = 0;
    const state = { yaw: -0.7, pitch: 0.4 };
    // 两团数据（正类在右上、负类在左下），沿 x1+x2=0 大致分开
    const data = [];
    for (let i = 0; i < 55; i++) data.push({ x: 1 + gauss(rng) * 0.9, y: 1 + gauss(rng) * 0.9, label: 1 });
    for (let i = 0; i < 55; i++) data.push({ x: -1 + gauss(rng) * 0.9, y: -1 + gauss(rng) * 0.9, label: 0 });
    // 曲面网格（顶点只存特征坐标，高度每帧按当前权重重算）
    const N = 26, X0 = -3, X1 = 3;
    const gfx = [], gfz = [], quads = [];
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
      gfx.push(X0 + i / N * (X1 - X0));
      gfz.push(X0 + j / N * (X1 - X0));
    }
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const i0 = j * (N + 1) + i, i1 = i0 + 1, i2 = i0 + (N + 1), i3 = i2 + 1;
      quads.push({ idx: [i0, i1, i3, i2], x: X0 + (i + 0.5) / N * (X1 - X0), y: X0 + (j + 0.5) / N * (X1 - X0) });
    }
    function sigColor(p) {
      const l = (a, bb, t) => a + (bb - a) * t;
      if (p < 0.5) { const t = p * 2; return 'rgb(' + Math.round(l(40, 225, t)) + ',' + Math.round(l(110, 236, t)) + ',' + Math.round(l(210, 240, t)) + ')'; }
      const t = (p - 0.5) * 2; return 'rgb(' + Math.round(l(225, 255, t)) + ',' + Math.round(l(236, 122, t)) + ',' + Math.round(l(240, 198, t)) + ')';
    }
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2 + 6, f = 520, dd = 9;
      const rp = gfx.map((x, i) => rotate3({ x: x * 0.8, y: (sig(w1 * x + w2 * gfz[i] + b) - 0.5) * 2.4, z: gfz[i] * 0.8 }, state.yaw, state.pitch));
      const pp = rp.map(v => proj3(v, cx, cy, f, dd));
      const qs = quads.map(q => ({ q, depth: (rp[q.idx[0]].z + rp[q.idx[1]].z + rp[q.idx[2]].z + rp[q.idx[3]].z) / 4 }));
      qs.sort((a, b) => a.depth - b.depth);
      for (const { q } of qs) {
        const a = pp[q.idx[0]], b2 = pp[q.idx[1]], c2 = pp[q.idx[2]], d2 = pp[q.idx[3]];
        ctx.fillStyle = sigColor(sig(w1 * q.x + w2 * q.y + b));
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(d2.x, d2.y); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(10,16,32,0.25)'; ctx.lineWidth = 0.5; ctx.stroke();
      }
      // 地面数据点
      const gy = -1.35;
      const order = data.map((p, i) => ({ i, z: rotate3({ x: p.x * 0.8, y: gy, z: p.y * 0.8 }, state.yaw, state.pitch).z })).sort((a, b) => a.z - b.z);
      for (const o of order) {
        const p = data[o.i];
        const pp = proj3(rotate3({ x: p.x * 0.8, y: gy, z: p.y * 0.8 }, state.yaw, state.pitch), cx, cy, f, dd);
        ctx.fillStyle = p.label === 1 ? C.magenta : C.cyan;
        ctx.beginPath(); ctx.arc(pp.x, pp.y, 3.4 * pp.s / 57, 0, 7); ctx.fill();
      }
      // 决策边界（地面上 P=0.5 的直线）
      if (Math.abs(w1) + Math.abs(w2) > 1e-6) {
        ctx.strokeStyle = C.green; ctx.lineWidth = 2.5;
        const seg = 40;
        for (let k = 0; k < seg; k++) {
          const t0 = X0 + k / seg * (X1 - X0), t1 = X0 + (k + 1) / seg * (X1 - X0);
          const y0 = -(w1 * t0 + b) / w2, y1 = -(w1 * t1 + b) / w2;
          if (Math.abs(y0) > 6 || Math.abs(y1) > 6) continue;
          const a = proj3(rotate3({ x: t0 * 0.8, y: gy, z: y0 * 0.8 }, state.yaw, state.pitch), cx, cy, f, dd);
          const bb = proj3(rotate3({ x: t1 * 0.8, y: gy, z: y1 * 0.8 }, state.yaw, state.pitch), cx, cy, f, dd);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(bb.x, bb.y); ctx.stroke();
        }
      }
      text(ctx, 'P(正类) = σ(w1·x1 + w2·x2 + b)　w1=' + round(w1, 2) + ' w2=' + round(w2, 2) + ' b=' + round(b, 2), 70, 30, C.cyan, 'left', 13);
      text(ctx, '拖动旋转 · 品红=正类 · 青=负类 · 绿线=决策边界', 70, H - 36, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(0, 2.5, 0.1, w1, v => { w1 = v; draw(); }, 'w1'));
    d.controls.appendChild(makeRange(0, 2.5, 0.1, w2, v => { w2 = v; draw(); }, 'w2'));
    d.controls.appendChild(makeRange(-2.5, 2.5, 0.1, b, v => { b = v; draw(); }, 'b'));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 03 · 决策树
  // ============================================================
  function tree(container) {
    const d = demoShell('决策树 · 分裂演示', '点「下一步」看贪心算法如何在 2D 数据上不断切分，让每个区域越来越纯。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const rng = makeRng(303);
    let data = genData();
    let root = null, leaves = [];

    function genData() {
      const pts = [];
      for (let gx = 0; gx < 2; gx++) for (let gy = 0; gy < 2; gy++) {
        const label = (gx + gy) % 2;
        const cx = gx === 0 ? -0.75 : 0.75, cy = gy === 0 ? -0.75 : 0.75;
        for (let i = 0; i < 26; i++) pts.push({ x: cx + gauss(rng) * 0.32, y: cy + gauss(rng) * 0.32, label: label });
      }
      return pts;
    }
    function gini(pts) { if (!pts.length) return 0; let c0 = 0; for (const p of pts) if (p.label === 0) c0++; const p0 = c0 / pts.length; return 1 - p0 * p0 - (1 - p0) * (1 - p0); }
    function makeNode(pts, bounds) { const g = gini(pts); let c0 = 0; for (const p of pts) if (p.label === 0) c0++; return { pts: pts, bounds: bounds, gini: g, label: c0 >= pts.length / 2 ? 0 : 1, leaf: true, left: null, right: null, feat: null, val: 0 }; }
    function bestSplit(node) {
      const pts = node.pts; if (pts.length < 2 || node.gini < 1e-6) return null;
      const base = node.gini; let c0Total = 0; for (const p of pts) if (p.label === 0) c0Total++;
      let best = null;
      for (const feat of ['x', 'y']) {
        const vals = [...new Set(pts.map(p => p[feat]))].sort((a, b) => a - b);
        for (let i = 0; i < vals.length - 1; i++) {
          const val = (vals[i] + vals[i + 1]) / 2;
          let nL = 0, c0L = 0;
          for (const p of pts) { if (p[feat] <= val) { nL++; if (p.label === 0) c0L++; } }
          const nR = pts.length - nL; if (nL === 0 || nR === 0) continue;
          const c0R = c0Total - c0L;
          const gL = 1 - (c0L / nL) ** 2 - ((nL - c0L) / nL) ** 2;
          const gR = 1 - (c0R / nR) ** 2 - ((nR - c0R) / nR) ** 2;
          const wg = (nL / pts.length) * gL + (nR / pts.length) * gR;
          const gain = base - wg;
          if (gain > 1e-9 && (!best || gain > best.gain)) best = { gain: gain, feat: feat, val: val };
        }
      }
      return best;
    }
    function step() {
      // 选加权不纯度最大的叶子
      let target = null, score = -1;
      for (const lf of leaves) { if (lf.leaf) { const s = lf.pts.length * lf.gini; if (s > score) { score = s; target = lf; } } }
      if (!target || target.pts.length < 2 || target.gini < 1e-6) return false;
      const sp = bestSplit(target);
      if (!sp) { target.leaf = true; return false; }
      const lb = { x0: target.bounds.x0, x1: target.bounds.x1, y0: target.bounds.y0, y1: target.bounds.y1 };
      const rb = { x0: target.bounds.x0, x1: target.bounds.x1, y0: target.bounds.y0, y1: target.bounds.y1 };
      if (sp.feat === 'x') { lb.x1 = sp.val; rb.x0 = sp.val; } else { lb.y1 = sp.val; rb.y0 = sp.val; }
      const lp = [], rp = [];
      for (const p of target.pts) { (p[sp.feat] <= sp.val ? lp : rp).push(p); }
      target.leaf = false; target.feat = sp.feat; target.val = sp.val;
      target.left = makeNode(lp, lb); target.right = makeNode(rp, rb);
      leaves = leaves.filter(l => l !== target).concat([target.left, target.right]);
      return true;
    }
    function reset() {
      const bx0 = Math.min.apply(null, data.map(p => p.x)) - 0.4, bx1 = Math.max.apply(null, data.map(p => p.x)) + 0.4;
      const by0 = Math.min.apply(null, data.map(p => p.y)) - 0.4, by1 = Math.max.apply(null, data.map(p => p.y)) + 0.4;
      root = makeNode(data, { x0: bx0, x1: bx1, y0: by0, y1: by1 });
      leaves = [root];
      draw();
    }
    function toX(x) { return 60 + (x - root.bounds.x0) / (root.bounds.x1 - root.bounds.x0) * (W - 120); }
    function toY(y) { return H - 70 - (y - root.bounds.y0) / (root.bounds.y1 - root.bounds.y0) * (H - 120); }
    function collect(node, out) { if (!node) return; out.push(node); collect(node.left, out); collect(node.right, out); }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      if (!root) return;
      // 叶子区域着色
      const all = []; collect(root, all);
      for (const n of all) if (n.leaf) {
        ctx.fillStyle = n.label === 0 ? 'rgba(0,212,255,0.08)' : 'rgba(255,122,198,0.08)';
        ctx.fillRect(toX(n.bounds.x0), toY(n.bounds.y1), toX(n.bounds.x1) - toX(n.bounds.x0), toY(n.bounds.y0) - toY(n.bounds.y1));
      }
      // 分裂线
      for (const n of all) if (!n.leaf) {
        ctx.strokeStyle = C.orange; ctx.lineWidth = 2;
        if (n.feat === 'x') { ctx.beginPath(); ctx.moveTo(toX(n.val), toY(n.bounds.y0)); ctx.lineTo(toX(n.val), toY(n.bounds.y1)); ctx.stroke(); }
        else { ctx.beginPath(); ctx.moveTo(toX(n.bounds.x0), toY(n.val)); ctx.lineTo(toX(n.bounds.x1), toY(n.val)); ctx.stroke(); }
      }
      // 点
      for (const p of data) { ctx.fillStyle = p.label === 0 ? C.cyan : C.magenta; ctx.beginPath(); ctx.arc(toX(p.x), toY(p.y), 3.5, 0, 7); ctx.fill(); }
      // 总不纯度
      let imp = 0, n = 0;
      for (const lf of leaves) { if (lf.leaf) { imp += lf.pts.length * lf.gini; n += lf.pts.length; } }
      text(ctx, '加权 Gini 不纯度 = ' + round(imp / (n || 1), 4) + '　分裂次数 = ' + (all.length - leaves.length), 70, 30, C.orange, 'left', 13);
    }
    d.controls.appendChild(makeButton('重置', reset));
    d.controls.appendChild(makeButton('下一步', () => { step(); draw(); }, true));
    reset();
  }

  // ============================================================
  // 04 · 随机森林（Bagging）
  // ============================================================
  function forest(container) {
    const d = demoShell('随机森林 · Bagging 演示', '多条高方差曲线各自拟合带噪声数据，看「取平均」后如何得到平滑稳健的曲线。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 360);
    const rng = makeRng(404);
    const N = 30, xs = [], ys = [];
    for (let i = 0; i < N; i++) { const x = -1 + (i / (N - 1)) * 2; xs.push(x); ys.push(Math.sin(x * Math.PI * 1.6) + gauss(rng) * 0.45); }
    let M = 15, models = [];
    function toX(x) { return 60 + (x + 1) / 2 * (W - 120); }
    function toY(y) { return H - 70 - (y + 1.6) / 3.4 * (H - 120); }
    function fit() {
      models = [];
      for (let m = 0; m < M; m++) {
        const bx = [], by = [];
        for (let i = 0; i < N; i++) { const k = Math.floor(rng() * N); bx.push(xs[k]); by.push(ys[k]); }
        models.push(polyfit(bx, by, 7));
      }
      draw();
    }
    function meanCurve(x) { let s = 0; for (const c of models) s += evalPoly(c, x); return s / models.length; }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      ctx.strokeStyle = C.axis;
      ctx.beginPath(); ctx.moveTo(60, toY(0)); ctx.lineTo(W - 60, toY(0)); ctx.stroke();
      // 各模型（高方差）
      if (models.length) for (const c of models) {
        ctx.strokeStyle = 'rgba(160,107,255,0.28)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let px = 60; px <= W - 60; px += 3) {
          const x = -1 + (px - 60) / (W - 120) * 2; const y = toY(evalPoly(c, x));
          if (px === 60) ctx.moveTo(px, y); else ctx.lineTo(px, y);
        }
        ctx.stroke();
      }
      // 平均曲线
      if (models.length) {
        ctx.strokeStyle = C.green; ctx.lineWidth = 3; ctx.beginPath();
        for (let px = 60; px <= W - 60; px += 2) {
          const x = -1 + (px - 60) / (W - 120) * 2; const y = toY(meanCurve(x));
          if (px === 60) ctx.moveTo(px, y); else ctx.lineTo(px, y);
        }
        ctx.stroke();
      }
      // 数据点
      for (let i = 0; i < N; i++) { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(toX(xs[i]), toY(ys[i]), 3.5, 0, 7); ctx.fill(); }
      text(ctx, M + ' 个模型 · 绿色为平均结果', 70, 28, C.green, 'left', 13);
      text(ctx, '单条曲线：方差大 · 平均后：方差大幅降低', 70, 48, C.text, 'left', 12);
    }
    d.controls.appendChild(makeRange(5, 40, 1, M, v => { M = v; fit(); }, '模型数'));
    d.controls.appendChild(makeButton('重新采样', fit, true));
    fit();
  }

  // ============================================================
  // 05 · XGBoost（残差拟合 / Boosting）
  // ============================================================
  function xgboost(container) {
    const d = demoShell('XGBoost · 残差拟合演示', '逐步叠加小树拟合残差，观察预测曲线如何从「均值」逼近真实函数。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 360);
    const rng = makeRng(505);
    const N = 40, xs = [], ys = [];
    for (let i = 0; i < N; i++) { const x = -1 + (i / (N - 1)) * 2; xs.push(x); ys.push(x * x * 1.4 - 0.3 + gauss(rng) * 0.12); }
    let pred = [], stepCount = 0, done = false;
    function reset() { pred = xs.map(() => ys.reduce((a, b) => a + b, 0) / N); stepCount = 0; done = false; draw(); }
    function toX(x) { return 60 + (x + 1) / 2 * (W - 120); }
    function toY(y) { return H - 70 - (y + 0.6) / 2.2 * (H - 120); }
    function fitStump(residuals) {
      // 1D 决策树桩：找最佳阈值切两段，各取均值
      const idx = xs.map((_, i) => i).sort((a, b) => xs[a] - xs[b]);
      let best = { loss: Infinity, val: 0, l: 0, r: 0 };
      for (let i = 1; i < idx.length; i++) {
        const val = (xs[idx[i - 1]] + xs[idx[i]]) / 2;
        let sl = 0, sr = 0, nl = 0, nr = 0;
        for (let j = 0; j < N; j++) { if (xs[j] <= val) { sl += residuals[j]; nl++; } else { sr += residuals[j]; nr++; } }
        const ml = nl ? sl / nl : 0, mr = nr ? sr / nr : 0;
        let loss = 0;
        for (let j = 0; j < N; j++) { const r = residuals[j] - (xs[j] <= val ? ml : mr); loss += r * r; }
        if (loss < best.loss) best = { loss: loss, val: val, l: ml, r: mr };
      }
      return best;
    }
    function step() {
      if (done) return;
      const residuals = ys.map((y, i) => y - pred[i]);
      const st = fitStump(residuals);
      const lr = 0.6;
      for (let i = 0; i < N; i++) pred[i] += lr * (xs[i] <= st.val ? st.l : st.r);
      stepCount++;
      if (stepCount >= 60) done = true;
      draw();
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      ctx.strokeStyle = C.axis;
      ctx.beginPath(); ctx.moveTo(60, toY(0)); ctx.lineTo(W - 60, toY(0)); ctx.stroke();
      // 真实函数（虚线）
      ctx.strokeStyle = 'rgba(0,230,160,0.5)'; ctx.setLineDash([5, 5]); ctx.beginPath();
      for (let px = 60; px <= W - 60; px += 3) { const x = -1 + (px - 60) / (W - 120) * 2; const y = toY(x * x * 1.4 - 0.3); if (px === 60) ctx.moveTo(px, y); else ctx.lineTo(px, y); }
      ctx.stroke(); ctx.setLineDash([]);
      // 数据点
      for (let i = 0; i < N; i++) { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(toX(xs[i]), toY(ys[i]), 3.5, 0, 7); ctx.fill(); }
      // 预测阶梯曲线
      if (stepCount > 0) {
        ctx.strokeStyle = C.orange; ctx.lineWidth = 2.5; ctx.beginPath();
        for (let i = 0; i < N; i++) { const x = toX(xs[i]), y = toY(pred[i]); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.stroke();
      }
      // 残差大小
      let res = 0; for (let i = 0; i < N; i++) res += (ys[i] - pred[i]) ** 2;
      text(ctx, '迭代 ' + stepCount + ' 次 · 残差平方和 = ' + round(res, 4), 70, 28, C.orange, 'left', 13);
      text(ctx, '绿色虚线 = 真实函数　橙色 = 当前叠加预测', 70, 48, C.text, 'left', 12);
    }
    d.controls.appendChild(makeButton('重置', reset));
    d.controls.appendChild(makeButton('下一步', step, true));
    d.controls.appendChild(makeButton('自动', () => { const iv = setInterval(() => { if (done) { clearInterval(iv); return; } step(); }, 60); }));
    reset();
  }

  // ============================================================
  // 06 · SVM（核感知机）
  // ============================================================
  function svm(container) {
    const d = demoShell('SVM · 3D 核技巧', '把 2D 里「线性不可分」的圆环数据抬到 3D（z = x²+y²），一个平面就能把内外圈干净分开。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(606);
    const state = { yaw: -0.6, pitch: 0.35 };
    // 内圈（-1）+ 外环（+1），2D 里画不出一条直线分开
    const data = [];
    for (let i = 0; i < 45; i++) { const a = rng() * 2 * Math.PI, r = rng() * 0.9; data.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, label: -1 }); }
    for (let i = 0; i < 45; i++) { const a = rng() * 2 * Math.PI, r = 1.5 + rng() * 0.6; data.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, label: 1 }); }
    let h = 1.3, topDown = false;
    const lift = p => ({ x: p.x * 0.7, y: (p.x * p.x + p.y * p.y) * 0.45, z: p.y * 0.7 });
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      // 分离平面（高度 h 处的半透明圆盘）
      const seg = 44, yPlane = h * 0.45, radius = 1.58;
      ctx.beginPath();
      for (let k = 0; k <= seg; k++) {
        const a = k / seg * 2 * Math.PI;
        const p = proj3(rotate3({ x: Math.cos(a) * radius, y: yPlane, z: Math.sin(a) * radius }, state.yaw, state.pitch), cx, cy, f, dd);
        if (k === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath(); ctx.fillStyle = 'rgba(255,224,102,0.12)'; ctx.fill();
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 2; ctx.stroke();
      // 地面投影：平面与抛物面相交 -> 2D 里是一个圆
      const gr = Math.sqrt(h) * 0.7;
      ctx.beginPath();
      for (let k = 0; k <= seg; k++) {
        const a = k / seg * 2 * Math.PI;
        const p = proj3(rotate3({ x: Math.cos(a) * gr, y: 0, z: Math.sin(a) * gr }, state.yaw, state.pitch), cx, cy, f, dd);
        if (k === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.stroke();
      // 抬升后的数据点（画家排序）
      const rot = data.map(p => rotate3(lift(p), state.yaw, state.pitch));
      const pp = rot.map(v => proj3(v, cx, cy, f, dd));
      const order = rot.map((v, i) => ({ i, z: v.z })).sort((a, b) => a.z - b.z);
      for (const o of order) {
        ctx.fillStyle = data[o.i].label === 1 ? C.cyan : C.magenta;
        ctx.beginPath(); ctx.arc(pp[o.i].x, pp[o.i].y, 4.2 * pp[o.i].s / 57, 0, 7); ctx.fill();
      }
      text(ctx, '抬升 z = x² + y²　分离平面 z = ' + round(h, 2), 70, 30, C.yellow, 'left', 13);
      text(ctx, '拖动旋转 · 青=外圈(+1) · 品红=内圈(-1) · 绿圆=平面切出的 2D 边界', 70, H - 36, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(0.2, 3, 0.05, h, v => { h = v; draw(); }, '平面高度 h'));
    const btnTop = makeButton('俯视 2D', () => { topDown = !topDown; state.pitch = topDown ? 1.3 : 0.35; state.yaw = 0; btnTop.textContent = topDown ? '切回 3D' : '俯视 2D'; draw(); }, true);
    d.controls.appendChild(btnTop);
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 07 · K-Means
  // ============================================================
  function kmeans(container) {
    const d = demoShell('K-Means · 3D 聚类', '拖拽旋转 3D 点云；选 K 点「下一步」看「分配 → 更新质心」交替，直到收敛。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(707);
    const CENTERS = [[-1.2, -1, -0.9], [1.2, -1, 0.7], [-0.4, 1.3, 0.9], [1.3, 1.1, -1.0]];
    let K = 3, data = genData(), centroids = [], assign = [];
    const state = { yaw: -0.6, pitch: 0.35 };
    const COLORS = [C.cyan, C.magenta, C.green, C.orange, C.purple, C.yellow];
    function genData() { const pts = []; for (const c of CENTERS) for (let i = 0; i < 26; i++) pts.push({ x: c[0] + gauss(rng) * 0.4, y: c[1] + gauss(rng) * 0.4, z: c[2] + gauss(rng) * 0.4 }); return pts; }
    function reset() { data = genData(); centroids = []; assign = []; for (let k = 0; k < K; k++) { const p = data[Math.floor(rng() * data.length)]; centroids.push({ x: p.x, y: p.y, z: p.z }); } draw(); }
    function step() {
      if (!centroids.length) return reset();
      assign = data.map(p => { let bi = 0, bd = Infinity; for (let k = 0; k < K; k++) { const d2 = (p.x - centroids[k].x) ** 2 + (p.y - centroids[k].y) ** 2 + (p.z - centroids[k].z) ** 2; if (d2 < bd) { bd = d2; bi = k; } } return bi; });
      draw();
      setTimeout(() => {
        const sums = Array.from({ length: K }, () => ({ x: 0, y: 0, z: 0, n: 0 }));
        for (let i = 0; i < data.length; i++) { sums[assign[i]].x += data[i].x; sums[assign[i]].y += data[i].y; sums[assign[i]].z += data[i].z; sums[assign[i]].n++; }
        centroids = sums.map(s => s.n ? { x: s.x / s.n, y: s.y / s.n, z: s.z / s.n } : { x: 0, y: 0, z: 0 });
        draw();
      }, 260);
    }
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = data.map(p => rotate3({ x: p.x * 0.9, y: p.y * 0.9, z: p.z * 0.9 }, state.yaw, state.pitch));
      const pp = rot.map(v => proj3(v, cx, cy, f, dd));
      const order = rot.map((v, i) => ({ i, z: v.z })).sort((a, b) => a.z - b.z);
      for (const o of order) {
        const k = assign[o.i] !== undefined ? assign[o.i] : -1;
        ctx.fillStyle = k >= 0 ? COLORS[k % COLORS.length] : 'rgba(200,210,235,0.5)';
        ctx.beginPath(); ctx.arc(pp[o.i].x, pp[o.i].y, 3.4 * pp[o.i].s / 57, 0, 7); ctx.fill();
      }
      // 质心
      centroids.forEach((c, k) => {
        const cp = proj3(rotate3({ x: c.x * 0.9, y: c.y * 0.9, z: c.z * 0.9 }, state.yaw, state.pitch), cx, cy, f, dd);
        ctx.fillStyle = COLORS[k % COLORS.length]; ctx.strokeStyle = C.white; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cp.x, cp.y, 7 * cp.s / 57, 0, 7); ctx.fill(); ctx.stroke();
        text(ctx, 'C' + (k + 1), cp.x, cp.y - 12 * cp.s / 57, COLORS[k % COLORS.length], 'center', 11);
      });
      let sse = 0; for (let i = 0; i < data.length; i++) if (assign[i] !== undefined) { const c = centroids[assign[i]]; sse += (data[i].x - c.x) ** 2 + (data[i].y - c.y) ** 2 + (data[i].z - c.z) ** 2; }
      text(ctx, 'K = ' + K + '　簇内平方和 SSE = ' + round(sse, 2) + '　拖拽旋转', 70, 28, C.cyan, 'left', 13);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(2, 6, 1, K, v => { K = v; reset(); }, 'K'));
    d.controls.appendChild(makeButton('重置', reset));
    d.controls.appendChild(makeButton('下一步', step, true));
    reset();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 08 · PCA
  // ============================================================
  function pca(container) {
    const d = demoShell('PCA · 3D 主成分演示', '拖拽旋转 3D 数据云，看三个主成分方向如何依次抓住最大方差；点按钮看投影到 PC1。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(808);
    // 3D「雪茄状」数据：沿主方向伸长，垂直方向噪声
    const u = [1, 0.7, 0.45], un = Math.hypot(u[0], u[1], u[2]);
    const dir = u.map(x => x / un);
    const raw = [];
    for (let i = 0; i < 110; i++) {
      const t = gauss(rng) * 2.1;
      raw.push([dir[0] * t + gauss(rng) * 0.5, dir[1] * t + gauss(rng) * 0.5, dir[2] * t + gauss(rng) * 0.5]);
    }
    // 中心化
    const m = [0, 1, 2].map(j => raw.reduce((s, p) => s + p[j], 0) / raw.length);
    const data = raw.map(p => [p[0] - m[0], p[1] - m[1], p[2] - m[2]]);
    // 3x3 协方差
    const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const p of data) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) cov[a][b] += p[a] * p[b] / data.length;
    // 幂迭代求特征对
    function powerIter(A, v0) {
      let v = v0 || [1, 0, 0];
      for (let it = 0; it < 100; it++) {
        const w = [A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2], A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2], A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2]];
        const nw = Math.hypot(w[0], w[1], w[2]) || 1;
        const wn = [w[0] / nw, w[1] / nw, w[2] / nw];
        if (Math.hypot(wn[0] - v[0], wn[1] - v[1], wn[2] - v[2]) < 1e-8) { v = wn; break; }
        v = wn;
      }
      const Av = [A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2], A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2], A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2]];
      return { val: v[0] * Av[0] + v[1] * Av[1] + v[2] * Av[2], vec: v };
    }
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const e1 = powerIter(cov, [1, 0, 0]);
    const A2 = cov.map((row, i) => row.map((x, j) => x - e1.val * e1.vec[i] * e1.vec[j]));
    const e2 = powerIter(A2, [0, 1, 0]);
    const e3v = cross(e1.vec, e2.vec);
    const e3n = Math.hypot(e3v[0], e3v[1], e3v[2]) || 1;
    const e3 = { vec: e3v.map(x => x / e3n), val: e3v.reduce((s, x, i) => s + x * (cov[i][0] * e3v[0] + cov[i][1] * e3v[1] + cov[i][2] * e3v[2]), 0) / (e3n * e3n) };
    const evals = [e1.val, e2.val, e3.val], evecs = [e1.vec, e2.vec, e3.vec];
    const totalVar = evals[0] + evals[1] + evals[2];
    const pcColors = [C.magenta, C.orange, C.green], pcNames = ['PC1', 'PC2', 'PC3'];
    let showProj = false;
    const state = { yaw: -0.5, pitch: 0.3 };
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = data.map(p => rotate3({ x: p[0] * 0.55, y: p[1] * 0.55, z: p[2] * 0.55 }, state.yaw, state.pitch));
      const pp = rot.map(v => proj3(v, cx, cy, f, dd));
      const order = rot.map((v, i) => ({ i, z: v.z })).sort((a, b) => a.z - b.z);
      for (const o of order) {
        ctx.fillStyle = 'rgba(0,212,255,0.6)';
        ctx.beginPath(); ctx.arc(pp[o.i].x, pp[o.i].y, 2.8 * pp[o.i].s / 57, 0, 7); ctx.fill();
      }
      // 投影到 PC1
      if (showProj) {
        const qs = data.map(p => {
          const proj = p[0] * evecs[0][0] + p[1] * evecs[0][1] + p[2] * evecs[0][2];
          return [evecs[0][0] * proj, evecs[0][1] * proj, evecs[0][2] * proj];
        });
        for (let i = 0; i < data.length; i++) {
          const a = proj3(rotate3({ x: data[i][0] * 0.55, y: data[i][1] * 0.55, z: data[i][2] * 0.55 }, state.yaw, state.pitch), cx, cy, f, dd);
          const b = proj3(rotate3({ x: qs[i][0] * 0.55, y: qs[i][1] * 0.55, z: qs[i][2] * 0.55 }, state.yaw, state.pitch), cx, cy, f, dd);
          ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.arc(b.x, b.y, 2 * b.s / 57, 0, 7); ctx.fill();
        }
      }
      // 主成分轴
      for (let k = 0; k < 3; k++) {
        const len = Math.sqrt(Math.max(0, evals[k])) * 1.1;
        const tip = [evecs[k][0] * len, evecs[k][1] * len, evecs[k][2] * len];
        const a = proj3(rotate3({ x: 0, y: 0, z: 0 }, state.yaw, state.pitch), cx, cy, f, dd);
        const b = proj3(rotate3({ x: tip[0] * 0.55, y: tip[1] * 0.55, z: tip[2] * 0.55 }, state.yaw, state.pitch), cx, cy, f, dd);
        ctx.strokeStyle = pcColors[k]; ctx.lineWidth = k === 0 ? 3 : 2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.fillStyle = pcColors[k]; ctx.beginPath(); ctx.arc(b.x, b.y, (k === 0 ? 6 : 4.5) * b.s / 57, 0, 7); ctx.fill();
        const pct = Math.round(evals[k] / totalVar * 100);
        text(ctx, pcNames[k] + ' ' + pct + '%', b.x + 10, b.y, pcColors[k], 'left', 11);
      }
      text(ctx, '三个主成分按方差占比：PC1 最大、PC3 最小　拖拽旋转', 70, 28, C.yellow, 'left', 13);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    const btnProj = makeButton('投影到 PC1', () => { showProj = !showProj; btnProj.textContent = showProj ? '隐藏投影' : '投影到 PC1'; draw(); }, true);
    d.controls.appendChild(btnProj);
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 09 · 神经网络（XOR）
  // ============================================================
  function mlp(container) {
    const d = demoShell('神经网络 · 3D 结构', '拖拽旋转看 MLP 结构；训练解决 XOR。节点颜色=激活值，连线青=正权重、品红=负权重、粗细=|权重|。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(909);
    const Hn = 8, lr = 0.2;
    let W1, b1, W2, b2, cur;
    let lossHist = [], epoch = 0, anim = false;
    const state = { yaw: -0.5, pitch: 0.32 };
    const data = [];
    const corners = [[-1, -1, -1], [1, -1, 1], [-1, 1, 1], [1, 1, -1]];
    for (const c of corners) for (let i = 0; i < 18; i++) data.push({ x: c[0] + gauss(rng) * 0.18, y: c[1] + gauss(rng) * 0.18, t: c[2] });
    // 三层节点布局（隐藏层排成一圈，形成真正的 3D 结构）
    const posIn = [{ x: -2, y: 0.7, z: 0 }, { x: -2, y: -0.7, z: 0 }];
    const posH = Array.from({ length: Hn }, (_, j) => ({ x: 0, y: 1.4 * Math.cos(j / Hn * 2 * Math.PI), z: 1.4 * Math.sin(j / Hn * 2 * Math.PI) }));
    const posOut = [{ x: 2, y: 0, z: 0 }];

    function init() {
      W1 = Array.from({ length: Hn }, () => Array.from({ length: 2 }, () => (rng() * 2 - 1) * 0.7));
      b1 = zeros(Hn);
      W2 = Array.from({ length: 1 }, () => Array.from({ length: Hn }, () => (rng() * 2 - 1) * 0.7));
      b2 = zeros(1);
      lossHist = []; epoch = 0;
      cur = forward(1, 1);
    }
    function forward(x, y) {
      const h = zeros(Hn);
      for (let j = 0; j < Hn; j++) { let s = b1[j]; s += W1[j][0] * x + W1[j][1] * y; h[j] = Math.tanh(s); }
      let o = b2[0]; for (let j = 0; j < Hn; j++) o += W2[0][j] * h[j]; o = Math.tanh(o);
      return { h: h, o: o };
    }
    function trainEpoch() {
      let loss = 0;
      for (const p of data) {
        const f = forward(p.x, p.y);
        cur = { x: p.x, y: p.y, h: f.h, o: f.o };
        const err = p.t - f.o;
        loss += err * err;
        const do_ = -2 * err * (1 - f.o * f.o);
        for (let j = 0; j < Hn; j++) W2[0][j] -= lr * do_ * f.h[j];
        b2[0] -= lr * do_;
        for (let j = 0; j < Hn; j++) {
          const dh = do_ * W2[0][j] * (1 - f.h[j] * f.h[j]);
          W1[j][0] -= lr * dh * p.x; W1[j][1] -= lr * dh * p.y; b1[j] -= lr * dh;
        }
      }
      lossHist.push(loss / data.length);
      epoch++;
    }
    function actColor(a) {
      const t = Math.min(1, Math.abs(a));
      return a >= 0 ? 'rgba(0,212,255,' + (0.3 + 0.7 * t) + ')' : 'rgba(255,122,198,' + (0.3 + 0.7 * t) + ')';
    }
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = (H - 60) / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      const edge = (a, b, w) => {
        const pa = prj(a), pb = prj(b);
        ctx.strokeStyle = w >= 0 ? 'rgba(0,212,255,0.4)' : 'rgba(255,122,198,0.4)';
        ctx.lineWidth = 0.6 + Math.min(2.6, Math.abs(w) * 1.6);
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
      };
      // 连线
      for (let j = 0; j < Hn; j++) for (let i = 0; i < 2; i++) edge(posIn[i], posH[j], W1[j][i]);
      for (let j = 0; j < Hn; j++) edge(posH[j], posOut[0], W2[0][j]);
      // 节点（画家排序）
      const nodes = posIn.map((p, i) => ({ p, val: i === 0 ? cur.x : cur.y, big: true }));
      for (let j = 0; j < Hn; j++) nodes.push({ p: posH[j], val: cur.h[j], big: false });
      nodes.push({ p: posOut[0], val: cur.o, big: true });
      const pn = nodes.map(n => ({ n, r: rot(n.p), pr: prj(n.p) })).sort((a, b) => a.r.z - b.r.z);
      for (const o of pn) {
        const rr = (o.n.big ? 12 : 9) * o.pr.s / 58;
        ctx.fillStyle = actColor(o.n.val);
        ctx.beginPath(); ctx.arc(o.pr.x, o.pr.y, rr, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.2; ctx.stroke();
      }
      // 损失曲线
      const lx = 70, ly = H - 48, lw = W - 140, lh = 32;
      ctx.strokeStyle = C.axis; ctx.strokeRect(lx, ly, lw, lh);
      if (lossHist.length > 1) {
        const max = Math.max.apply(null, lossHist);
        ctx.strokeStyle = C.green; ctx.lineWidth = 1.5; ctx.beginPath();
        lossHist.forEach((v, i) => { const px = lx + (i / Math.max(1, lossHist.length - 1)) * lw; const py = ly + lh - (v / max) * (lh - 6) - 3; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); });
        ctx.stroke();
      }
      text(ctx, 'epoch ' + epoch + '　loss = ' + (lossHist.length ? round(lossHist[lossHist.length - 1], 4) : '—'), 70, 28, C.green, 'left', 13);
      text(ctx, '青=正权重 · 品红=负权重 · 线粗=|权重| · 节点色=激活值 · 拖拽旋转', 70, 48, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    init(); draw();
    d.controls.appendChild(makeButton('重置', () => { anim = false; init(); draw(); }));
    d.controls.appendChild(makeButton('训练', () => {
      if (anim) { anim = false; return; }
      anim = true;
      const iv = setInterval(() => { if (!anim) { clearInterval(iv); return; } for (let e = 0; e < 5; e++) trainEpoch(); draw(); if (epoch >= 400) { anim = false; clearInterval(iv); } }, 30);
    }, true));
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 10 · RNN（字符级语言模型）
  // ============================================================
  function rnn(container) {
    const d = demoShell('RNN · 序列处理演示', '一个极小的字符级 RNN（本地训练）。观察字符依次流入、隐藏状态更新，以及「下一个字符」概率如何随上下文变化。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(1010);
    const corpus = 'the cat sat on the mat. the dog sat on the log. ';
    const chars = [...new Set(corpus.split(''))];
    const V = chars.length, Hn = 12;
    const c2i = {}; chars.forEach((c, i) => c2i[c] = i);
    const randM = (r, c, s) => Array.from({ length: r }, () => Array.from({ length: c }, () => (rng() * 2 - 1) * s));
    let Wxh = randM(Hn, V, 0.12), Whh = randM(Hn, Hn, 0.08), Why = randM(V, Hn, 0.12);
    let bh = zeros(Hn), by = zeros(V);
    // 训练（350 轮交叉熵≈0.05，再训收益很小但会明显拖慢初始化）
    for (let e = 0; e < 350; e++) {
      const T = corpus.length - 1;
      const hs = [], xs = [], ps = [];
      let h = zeros(Hn);
      for (let t = 0; t < T; t++) {
        const x = zeros(V); x[c2i[corpus[t]]] = 1;
        const a = vecAdd(vecAdd(matVec(Wxh, x), matVec(Whh, h)), bh);
        h = a.map(Math.tanh);
        const y = vecAdd(matVec(Why, h), by);
        const p = softmax(y);
        hs.push(h); xs.push(x); ps.push(p);
      }
      let dWxh = zerosM(Hn, V), dWhh = zerosM(Hn, Hn), dWhy = zerosM(V, Hn), dbh = zeros(Hn), dby = zeros(V);
      let dhnext = zeros(Hn);
      for (let t = T - 1; t >= 0; t--) {
        const dy = ps[t].slice(); dy[c2i[corpus[t + 1]]] -= 1;
        dWhy = matAdd(dWhy, outer(dy, hs[t])); dby = vecAdd(dby, dy);
        const dh = vecAdd(matVecT(Why, dy), dhnext);
        const dtanh = hs[t].map((hv, i) => (1 - hv * hv) * dh[i]);
        dWxh = matAdd(dWxh, outer(dtanh, xs[t]));
        if (t > 0) dWhh = matAdd(dWhh, outer(dtanh, hs[t - 1]));
        dbh = vecAdd(dbh, dtanh);
        dhnext = matVecT(Whh, dtanh);
      }
      clipGrads([dWxh, dWhh, dWhy, dbh, dby], 5);
      const lr = 0.03;
      Wxh = matAdd(Wxh, matScale(dWxh, -lr)); Whh = matAdd(Whh, matScale(dWhh, -lr)); Why = matAdd(Why, matScale(dWhy, -lr));
      bh = vecAdd(bh, vecScale(dbh, -lr)); by = vecAdd(by, vecScale(dby, -lr));
    }
    // 前向收集展示帧
    const frames = [];
    let h = zeros(Hn);
    for (let t = 0; t < corpus.length - 1; t++) {
      const x = zeros(V); x[c2i[corpus[t]]] = 1;
      const a = vecAdd(vecAdd(matVec(Wxh, x), matVec(Whh, h)), bh);
      h = a.map(Math.tanh);
      const p = softmax(vecAdd(matVec(Why, h), by));
      frames.push({ ch: corpus[t], target: corpus[t + 1], h: h, p: p });
    }
    let idx = 0, autoIv = null;
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const f = frames[idx];
      // 输入序列
      const sx = 70, sy = 40, cw = 16;
      frames.forEach((fr, i) => {
        ctx.fillStyle = i === idx ? C.yellow : 'rgba(160,175,210,0.5)';
        ctx.font = '14px Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(fr.ch === ' ' ? '␣' : fr.ch, sx + i * cw, sy + 12);
      });
      text(ctx, '← 当前字符（输入 xₜ）', sx + idx * cw, sy + 40, C.yellow, 'center', 11);
      // 隐藏状态条
      const hx = 70, hy = 90, hw = 300, hh = 150;
      text(ctx, '隐藏状态 hₜ（记忆）', hx, hy - 8, C.cyan, 'left', 12);
      ctx.strokeStyle = C.axis; ctx.strokeRect(hx, hy, hw, hh);
      const bw = (hw - 20) / Hn;
      for (let i = 0; i < Hn; i++) {
        const v = f.h[i];
        ctx.fillStyle = v >= 0 ? C.cyan : C.magenta;
        const bh2 = Math.abs(v) / 1.0 * (hh - 30);
        const y0 = hy + hh - 15 - (v >= 0 ? 0 : 0);
        ctx.fillRect(hx + 10 + i * bw, hy + hh - 15 - Math.abs(bh2), bw - 4, Math.abs(bh2));
        ctx.fillStyle = C.text; text(ctx, String(i + 1), hx + 10 + i * bw + (bw - 4) / 2, hy + hh - 6, C.text, 'center', 8);
      }
      // 下一个字符概率
      const px = 400, py = 90, pw = W - 400 - 60, ph = 150;
      text(ctx, '预测下一个字符 P(xₜ₊₁ | …)', px, py - 8, C.green, 'left', 12);
      ctx.strokeStyle = C.axis; ctx.strokeRect(px, py, pw, ph);
      const ordered = chars.map((c, i) => ({ c: c, i: i, p: f.p[i] })).sort((a, b) => b.p - a.p);
      const rh = (ph - 20) / V;
      ordered.forEach((o, rank) => {
        const isTarget = o.i === c2i[f.target];
        ctx.fillStyle = isTarget ? C.green : C.cyan;
        ctx.fillRect(px + 10, py + 10 + rank * rh, o.p * (pw - 40), rh - 2);
        text(ctx, (o.c === ' ' ? '␣' : o.c) + ' ' + round(o.p * 100, 0) + '%', px + 10 + o.p * (pw - 40) + 6, py + 10 + rank * rh + (rh - 2) / 2, isTarget ? C.green : C.text, 'left', 11);
      });
      text(ctx, '绿色 = 真实下一个字符', px, py + ph + 18, C.green, 'left', 11);
    }
    d.controls.appendChild(makeButton('⏮', () => { idx = 0; draw(); }));
    d.controls.appendChild(makeButton('下一步', () => { idx = (idx + 1) % frames.length; draw(); }, true));
    d.controls.appendChild(makeButton('自动', () => { if (autoIv) { clearInterval(autoIv); autoIv = null; return; } autoIv = setInterval(() => { idx = (idx + 1) % frames.length; draw(); }, 900); }));
    draw();
  }

  // ============================================================
  // 11 · LSTM（门控动画）
  // ============================================================
  function lstm(container) {
    const d = demoShell('LSTM · 3D 门控单元', '拖拽旋转看 LSTM 细胞；细胞状态 c 沿信息高速路流动，三个门（遗忘/输入/输出）控制写入与读取。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const steps = [
      { label: '写入', f: 0.0, i: 1.0, cT: 1.0, o: 0.0 },
      { label: '噪声', f: 1.0, i: 0.0, cT: 0.0, o: 0.0 },
      { label: '噪声', f: 1.0, i: 0.0, cT: 0.0, o: 0.0 },
      { label: '噪声', f: 1.0, i: 0.0, cT: 0.0, o: 0.0 },
      { label: '噪声', f: 1.0, i: 0.0, cT: 0.0, o: 0.0 },
      { label: '读取', f: 1.0, i: 0.0, cT: 0.0, o: 1.0 }
    ];
    let c = 0, h = 0, idx = 0, autoIv = null;
    const state = { yaw: -0.5, pitch: 0.3 };
    function advance() { if (idx >= steps.length) return; const s = steps[idx]; c = s.f * c + s.i * s.cT; h = s.o * Math.tanh(c); idx++; }
    function reset() { c = 0; h = 0; idx = 0; draw(); }
    function draw() {
      clear(ctx, W, H);
      const s = steps[Math.min(idx, steps.length - 1)];
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      // 信息高速路（细胞状态 c 沿 Z 轴流动）
      const a1 = prj({ x: 0, y: 0, z: -2.2 }), a2 = prj({ x: 0, y: 0, z: 2.2 });
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke();
      ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(a2.x, a2.y, 5 * a2.s / 58, 0, 7); ctx.fill();
      text(ctx, '细胞状态 c（信息高速路）', a1.x + 14, a1.y, C.cyan, 'left', 11);
      // 连线
      const P = { cell: { x: 0, y: 0, z: 0 }, forget: { x: -1.15, y: 0.85, z: 0 }, input: { x: -1.15, y: -0.85, z: 0 }, output: { x: 1.15, y: 0.85, z: 0 }, hnode: { x: 1.15, y: -0.85, z: 0 }, cand: { x: -1.9, y: -1.4, z: 0 } };
      const seg = (p, q, color) => { const a = prj(p), b = prj(q); ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]); };
      seg(P.forget, P.cell, 'rgba(255,184,92,0.5)');
      seg(P.input, P.cell, 'rgba(0,230,160,0.5)');
      seg(P.output, P.hnode, 'rgba(255,122,198,0.5)');
      seg(P.cand, P.input, 'rgba(150,160,190,0.4)');
      // 节点（画家排序）
      const nodes = [
        { p: P.cell, color: C.cyan, r: 9 + Math.abs(c) * 9, alpha: 1, label: 'c=' + round(c, 2) },
        { p: P.forget, color: C.orange, r: 7 + s.f * 8, alpha: 0.3 + s.f * 0.7, label: '遗忘门 f=' + round(s.f, 2) },
        { p: P.input, color: C.green, r: 7 + s.i * 8, alpha: 0.3 + s.i * 0.7, label: '输入门 i=' + round(s.i, 2) },
        { p: P.output, color: C.magenta, r: 7 + s.o * 8, alpha: 0.3 + s.o * 0.7, label: '输出门 o=' + round(s.o, 2) },
        { p: P.hnode, color: C.yellow, r: 7 + Math.abs(h) * 8, alpha: 0.5 + Math.abs(h) * 0.5, label: 'h=' + round(h, 2) },
        { p: P.cand, color: C.white, r: 5 + Math.abs(s.cT) * 5, alpha: 0.4 + Math.abs(s.cT) * 0.6, label: 'c̃=' + round(s.cT, 2) }
      ];
      const pn = nodes.map(n => ({ n, r: rot(n.p), pr: prj(n.p) })).sort((a, b) => a.r.z - b.r.z);
      for (const o of pn) {
        ctx.globalAlpha = o.n.alpha;
        ctx.fillStyle = o.n.color;
        ctx.beginPath(); ctx.arc(o.pr.x, o.pr.y, o.n.r * o.pr.s / 58, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.1; ctx.stroke();
        text(ctx, o.n.label, o.pr.x, o.pr.y + (o.n.r + 14) * o.pr.s / 58, o.n.color, 'center', 10);
      }
      text(ctx, '步骤 ' + idx + '/6　' + (s ? s.label : '') + '　c = f·c + i·c̃　h = o·tanh(c)', 70, 30, C.white, 'left', 13);
      text(ctx, '拖拽旋转 · c 通过加法传递，梯度几乎不衰减（LSTM 解决梯度消失）', 70, H - 36, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeButton('重置', reset));
    d.controls.appendChild(makeButton('下一步', () => { if (idx < steps.length) { advance(); draw(); } }, true));
    d.controls.appendChild(makeButton('自动', () => { if (autoIv) { clearInterval(autoIv); autoIv = null; return; } autoIv = setInterval(() => { if (idx >= steps.length) { clearInterval(autoIv); autoIv = null; return; } advance(); draw(); }, 900); }));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 12 · 序列预测（滑动窗口）
  // ============================================================
  function seq(container) {
    const d = demoShell('序列预测 · 窗口演示', '拖动窗口位置，观察「过去 n 个值 → 下一个值」如何构成监督样本，以及预测的走势。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 360);
    const rng = makeRng(1111);
    const N = 56, series = [];
    for (let t = 0; t < N; t++) series.push(18 + t * 0.45 + 6 * Math.sin(t * 0.45) + gauss(rng) * 1.8);
    const WIN = 6;
    let pos = N - WIN - 1, showForecast = true;
    function toX(t) { return 60 + t / (N - 1) * (W - 120); }
    function toY(y) { return H - 70 - (y - 0) / 45 * (H - 120); }
    function naiveForecast(win) { return win.reduce((a, b) => a + b, 0) / win.length; }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      ctx.strokeStyle = C.axis;
      ctx.beginPath(); ctx.moveTo(60, toY(0)); ctx.lineTo(W - 60, toY(0)); ctx.stroke();
      // 时间序列
      ctx.strokeStyle = C.cyan; ctx.lineWidth = 2; ctx.beginPath();
      series.forEach((v, t) => { const x = toX(t), y = toY(v); if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.stroke();
      // 窗口高亮
      const wx = toX(pos), wx2 = toX(pos + WIN - 1);
      ctx.fillStyle = 'rgba(255,184,92,0.12)'; ctx.fillRect(wx, 40, wx2 - wx, H - 110);
      for (let i = pos; i < pos + WIN; i++) { ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(toX(i), toY(series[i]), 4, 0, 7); ctx.fill(); }
      // 目标点
      const target = series[pos + WIN];
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(toX(pos + WIN), toY(target), 5, 0, 7); ctx.fill();
      ctx.strokeStyle = C.green; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(wx2, toY(target)); ctx.lineTo(toX(pos + WIN), toY(target)); ctx.stroke(); ctx.setLineDash([]);
      // 预测值
      const win = series.slice(pos, pos + WIN);
      const pred = naiveForecast(win);
      ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.arc(toX(pos + WIN), toY(pred), 5, 0, 7); ctx.fill();
      ctx.strokeStyle = C.magenta; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(toX(pos + WIN), toY(pred)); ctx.lineTo(toX(pos + WIN) + 6, toY(pred)); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, '窗口（特征）', wx + 10, 54, C.orange, 'left', 11);
      text(ctx, '真实', toX(pos + WIN) + 6, toY(target) - 8, C.green, 'left', 11);
      text(ctx, '预测（窗口均值）', toX(pos + WIN) + 6, toY(pred) + 14, C.magenta, 'left', 11);
      // 递归预测延伸
      if (showForecast) {
        let w = win.slice();
        ctx.strokeStyle = C.magenta; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath();
        ctx.moveTo(toX(pos + WIN - 1), toY(series[pos + WIN - 1]));
        for (let t = pos + WIN; t < N; t++) {
          const p = naiveForecast(w);
          ctx.lineTo(toX(t), toY(p));
          w = w.slice(1).concat(p);
        }
        ctx.stroke(); ctx.setLineDash([]);
      }
      text(ctx, '滑动窗口：用前 ' + WIN + ' 个值预测第 ' + (WIN + 1) + ' 个', 70, 30, C.orange, 'left', 13);
    }
    d.controls.appendChild(makeRange(0, N - WIN - 1, 1, pos, v => { pos = v; draw(); }, '窗口位置'));
    d.controls.appendChild(makeButton(showForecast ? '隐藏延伸' : '显示延伸预测', () => { showForecast = !showForecast; draw(); }));
    draw();
  }

  // ============================================================
  // 3D 渲染工具（手写透视投影 + 轨道旋转，零依赖）
  // ============================================================
  function rotY3(p, a) { const c = Math.cos(a), s = Math.sin(a); return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c }; }
  function rotX3(p, a) { const c = Math.cos(a), s = Math.sin(a); return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c }; }
  function rotate3(p, yaw, pitch) { return rotX3(rotY3(p, yaw), pitch); }
  function proj3(p, cx, cy, f, d) { const s = f / (d - p.z); return { x: cx + p.x * s, y: cy - p.y * s, s: s, z: p.z }; }
  function makeOrbit(canvas, state, redraw) {
    let lx = 0, ly = 0;
    state.dragging = false;
    canvas.style.cursor = 'grab';
    canvas.addEventListener('mousedown', e => { state.dragging = true; lx = e.clientX; ly = e.clientY; canvas.style.cursor = 'grabbing'; });
    window.addEventListener('mousemove', e => {
      if (!state.dragging) return;
      state.yaw += (e.clientX - lx) * 0.012; state.pitch += (e.clientY - ly) * 0.012;
      state.pitch = clamp(state.pitch, -1.35, 1.35);
      lx = e.clientX; ly = e.clientY; redraw();
    });
    window.addEventListener('mouseup', () => { state.dragging = false; canvas.style.cursor = 'grab'; });
    canvas.addEventListener('touchstart', e => { state.dragging = true; lx = e.touches[0].clientX; ly = e.touches[0].clientY; }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!state.dragging) return;
      state.yaw += (e.touches[0].clientX - lx) * 0.012; state.pitch += (e.touches[0].clientY - ly) * 0.012;
      state.pitch = clamp(state.pitch, -1.35, 1.35);
      lx = e.touches[0].clientX; ly = e.touches[0].clientY; redraw();
    }, { passive: true });
    canvas.addEventListener('touchend', () => { state.dragging = false; });
  }
  function colorRamp(t) {
    const stops = [[0, [22, 30, 70]], [0.33, [40, 96, 160]], [0.66, [0, 190, 200]], [1, [255, 150, 96]]];
    t = clamp(t, 0, 1);
    let i = 0; while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
    const c0 = stops[i][1], c1 = stops[i + 1][1], t0 = stops[i][0], t1 = stops[i + 1][0];
    const k = (t - t0) / (t1 - t0 || 1);
    return 'rgb(' + Math.round(c0[0] + (c1[0] - c0[0]) * k) + ',' + Math.round(c0[1] + (c1[1] - c0[1]) * k) + ',' + Math.round(c0[2] + (c1[2] - c0[2]) * k) + ')';
  }

  // ============================================================
  // 梯度下降 · 3D 损失地形
  // ============================================================
  function gd(container) {
    const d = demoShell('梯度下降 · 3D 损失地形', '拖拽旋转地形；调 η 看小球沿最陡方向滚向谷底（太小爬不动、太大会冲出山谷）。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const A = 1, B = 4, wStar = 1.5, bStar = 2.5;
    const L = (w, b) => A * (w - wStar) ** 2 + B * (b - bStar) ** 2;
    let lr = 0.04, anim = false, steps = 0;
    let trail = [], cur = { w: -3.4, b: 5.0 };
    const state = { yaw: -0.7, pitch: 0.42 };
    // 曲面网格（构建一次）
    const Nw = 30, Nb = 24, W0 = -3.5, W1 = 3.5, B0 = -1, B1 = 5;
    const verts = [], quads = [];
    let Lmin = Infinity, Lmax = -Infinity;
    for (let j = 0; j <= Nb; j++) for (let i = 0; i <= Nw; i++) {
      const w = W0 + i / Nw * (W1 - W0), b = B0 + j / Nb * (B1 - B0), Lv = L(w, b);
      Lmin = Math.min(Lmin, Lv); Lmax = Math.max(Lmax, Lv);
      verts.push({ x: w * 0.85, y: Lv * 0.055 - 1.0, z: (b - 2) * 0.72 });
    }
    for (let j = 0; j < Nb; j++) for (let i = 0; i < Nw; i++) {
      const i0 = j * (Nw + 1) + i, i1 = i0 + 1, i2 = i0 + (Nw + 1), i3 = i2 + 1;
      const w = W0 + (i + 0.5) / Nw * (W1 - W0), b = B0 + (j + 0.5) / Nb * (B1 - B0);
      quads.push({ idx: [i0, i1, i3, i2], h: (L(w, b) - Lmin) / (Lmax - Lmin) });
    }
    const wp = (w, b) => ({ x: w * 0.85, y: L(w, b) * 0.055 - 1.0, z: (b - 2) * 0.72 });
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2 + 8, f = 520, dd = 9;
      const rp = verts.map(v => rotate3(v, state.yaw, state.pitch));
      const pp = rp.map(v => proj3(v, cx, cy, f, dd));
      // 曲面（画家算法：按深度从远到近）
      const qs = quads.map(q => ({ q, depth: (rp[q.idx[0]].z + rp[q.idx[1]].z + rp[q.idx[2]].z + rp[q.idx[3]].z) / 4 }));
      qs.sort((a, b) => a.depth - b.depth);
      for (const { q } of qs) {
        const a = pp[q.idx[0]], b2 = pp[q.idx[1]], c2 = pp[q.idx[2]], d2 = pp[q.idx[3]];
        ctx.fillStyle = colorRamp(q.h);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(d2.x, d2.y); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(10,16,32,0.28)'; ctx.lineWidth = 0.5; ctx.stroke();
      }
      // 下降轨迹
      if (trail.length > 1) {
        const tp = trail.map(p => proj3(rotate3(wp(p.w, p.b), state.yaw, state.pitch), cx, cy, f, dd));
        ctx.strokeStyle = C.magenta; ctx.lineWidth = 2.5; ctx.beginPath();
        tp.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
        ctx.stroke();
      }
      // 当前小球
      const cp = proj3(rotate3(wp(cur.w, cur.b), state.yaw, state.pitch), cx, cy, f, dd);
      ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(cp.x, cp.y, 6 * cp.s / 57, 0, 7); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      // 全局最优
      const mp = proj3(rotate3(wp(wStar, bStar), state.yaw, state.pitch), cx, cy, f, dd);
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(mp.x, mp.y, 4.5, 0, 7); ctx.fill();
      text(ctx, '损失 L = ' + round(L(cur.w, cur.b), 3) + '　步数 = ' + steps + '　η = ' + lr, 70, 30, C.yellow, 'left', 13);
      text(ctx, '拖动旋转 · 绿点=全局最优 · 黄球=当前参数 · 品红=下降轨迹', 70, H - 36, C.text, 'left', 12);
    }
    function reset() { anim = false; trail = []; cur = { w: -3.4, b: 5.0 }; steps = 0; draw(); }
    function loop() {
      if (!state.dragging) state.yaw += 0.004;
      if (anim) {
        trail.push({ w: cur.w, b: cur.b });
        cur.w -= lr * 2 * A * (cur.w - wStar); cur.b -= lr * 2 * B * (cur.b - bStar); steps++;
        if (steps >= 900 || L(cur.w, cur.b) <= 0.004) anim = false;
      }
      draw();
      requestAnimationFrame(loop);
    }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(0.01, 0.3, 0.005, lr, v => { lr = v; }, 'η'));
    d.controls.appendChild(makeButton('重置', reset));
    d.controls.appendChild(makeButton('播放', () => { anim = !anim; }, true));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 过拟合 / 欠拟合
  // ============================================================
  function overfit(container) {
    const d = demoShell('过拟合 · 3D 曲面拟合', '拖拽旋转；同一批 3D 数据，用 1 次（欠拟合）/ 3 次（合适）/ 6 次（过拟合）多项式曲面去拟合。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(202);
    const N = 36, data = [];
    const truth = (a, b) => Math.sin(Math.PI * a) * Math.cos(Math.PI * b);
    for (let i = 0; i < N; i++) { const x1 = rng() * 2 - 1, x2 = rng() * 2 - 1; data.push({ x1, x2, y: truth(x1, x2) + gauss(rng) * 0.22 }); }
    let deg = 3, coef = null;
    const state = { yaw: -0.6, pitch: 0.42 };
    const YCLIP = 2.2;
    function feats(x1, x2, dd) { const f = []; for (let i = 0; i <= dd; i++) for (let j = 0; j + i <= dd; j++) f.push(Math.pow(x1, i) * Math.pow(x2, j)); return f; }
    function refit() {
      const P = (deg + 1) * (deg + 2) / 2;
      const A = Array.from({ length: P }, () => new Array(P).fill(0)), b = new Array(P).fill(0);
      for (const p of data) {
        const f = feats(p.x1, p.x2, deg);
        for (let i = 0; i < P; i++) { b[i] += f[i] * p.y; for (let j = 0; j < P; j++) A[i][j] += f[i] * f[j]; }
      }
      for (let i = 0; i < P; i++) A[i][i] += 1e-7;
      coef = solveLinear(A, b);
    }
    const ev = (x1, x2) => { const f = feats(x1, x2, deg); let s = 0; for (let k = 0; k < f.length; k++) s += coef[k] * f[k]; return s; };
    const wp = (x1, y, x2) => ({ x: x1 * 1.05, y: clamp(y, -YCLIP, YCLIP) * 0.8, z: x2 * 1.05 });
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      const G = 14, cells = [];
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
        const a1 = -1 + 2 * i / G, a2 = -1 + 2 * (i + 1) / G, b1 = -1 + 2 * j / G, b2 = -1 + 2 * (j + 1) / G;
        const cs = [[a1, b1], [a2, b1], [a2, b2], [a1, b2]].map(uv => wp(uv[0], ev(uv[0], uv[1]), uv[1]));
        const zc = cs.reduce((s, p) => s + rot(p).z, 0) / 4;
        cells.push({ c: cs.map(prj), z: zc, h: (ev(a1, b1) + ev(a2, b2)) / 2 });
      }
      cells.sort((a, b) => a.z - b.z);
      cells.forEach(cl => {
        ctx.fillStyle = colorRamp(clamp((cl.h + 1.2) / 2.4, 0, 1));
        ctx.beginPath(); ctx.moveTo(cl.c[0].x, cl.c[0].y);
        for (let k = 1; k < 4; k++) ctx.lineTo(cl.c[k].x, cl.c[k].y);
        ctx.closePath(); ctx.fill();
      });
      const pts = data.map(p => ({ p, z: rot(wp(p.x1, p.y, p.x2)).z })).sort((a, b) => a.z - b.z);
      pts.forEach(o => {
        const a = prj(wp(o.p.x1, o.p.y, o.p.x2)), b = prj(wp(o.p.x1, ev(o.p.x1, o.p.x2), o.p.x2));
        ctx.strokeStyle = 'rgba(255,122,198,0.5)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(a.x, a.y, 3.4 * a.s / 57, 0, 7); ctx.fill();
      });
      let mse = 0; for (const p of data) mse += (p.y - ev(p.x1, p.x2)) ** 2; mse /= N;
      text(ctx, deg + ' 次多项式曲面　训练 MSE = ' + round(mse, 4) + '　拖拽旋转', 70, 30, C.yellow, 'left', 13);
      text(ctx, deg === 1 ? '欠拟合：平面太平，抓不住波浪（偏差大）' : deg === 3 ? '合适：平滑贴合整体趋势' : '过拟合：疯狂扭动穿过每个噪声点（方差大，超出 ±' + YCLIP + ' 已裁剪）', 70, H - 34, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeSelect([{ value: '1', label: '1 次（欠拟合）' }, { value: '3', label: '3 次（合适）' }, { value: '6', label: '6 次（过拟合）' }], v => { deg = parseInt(v, 10); refit(); draw(); }));
    refit(); draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 岭回归 / Lasso
  // ============================================================
  function ridge(container) {
    const d = demoShell('正则化 · 3D 系数路径', '拖拽旋转；纵轴是 λ，横平面是 (w1, w2)。看 L2 平滑收缩、L1 把 w2 压到 0 后沿平面滑行。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(4044);
    const n = 40, X = [], y = [];
    for (let i = 0; i < n; i++) { const x1 = gauss(rng), x2 = gauss(rng); X.push([x1, x2]); y.push(3 * x1 + 1.2 * x2 + gauss(rng) * 0.8); }
    const means = [0, 1].map(j => X.reduce((s, r) => s + r[j], 0) / n);
    const stds = [0, 1].map(j => Math.sqrt(X.reduce((s, r) => s + (r[j] - means[j]) ** 2, 0) / n));
    const Xs = X.map(r => [0, 1].map(j => (r[j] - means[j]) / stds[j]));
    const ym = y.reduce((a, b) => a + b, 0) / n, yc = y.map(v => v - ym);
    function ridgeCoef(lam) {
      const A = [[0, 0], [0, 0]], b = [0, 0];
      for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) { let s = 0; for (let i = 0; i < n; i++) s += Xs[i][j] * Xs[i][k]; A[j][k] = s + (j === k ? lam : 0); }
      for (let j = 0; j < 2; j++) { let s = 0; for (let i = 0; i < n; i++) s += Xs[i][j] * yc[i]; b[j] = s; }
      return solveLinear(A, b);
    }
    function lassoCoef(lam) {
      let w = [0, 0];
      for (let it = 0; it < 300; it++) for (let j = 0; j < 2; j++) {
        let rho = 0; for (let i = 0; i < n; i++) rho += Xs[i][j] * (yc[i] - w[1 - j] * Xs[i][1 - j]);
        let z = 0; for (let i = 0; i < n; i++) z += Xs[i][j] * Xs[i][j];
        w[j] = rho < -lam / 2 ? (rho + lam / 2) / z : rho > lam / 2 ? (rho - lam / 2) / z : 0;
      }
      return w;
    }
    const LAMMAX = 60, K = 60;
    let lam = 8;
    const state = { yaw: -0.85, pitch: 0.35 };
    const SC = 0.42, hOf = l => (l / LAMMAX) * 1.9 - 0.95;
    const wp = (w1, l, w2) => ({ x: w1 * SC, y: hOf(l), z: w2 * SC });
    const steps = [];
    for (let k = 0; k <= K; k++) { const l = k / K * LAMMAX; steps.push({ l: l, r: ridgeCoef(l), s: lassoCoef(l) }); }
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      ctx.strokeStyle = 'rgba(120,145,200,0.16)'; ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        const a = prj({ x: i * 0.6, y: hOf(0), z: -1.5 }), b = prj({ x: i * 0.6, y: hOf(0), z: 1.5 });
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      const q = [[-1.5, -1.0], [1.5, -1.0], [1.5, 1.0], [-1.5, 1.0]].map(uv => prj({ x: uv[0] * 0.6, y: uv[1], z: 0 }));
      ctx.fillStyle = 'rgba(0,230,160,0.07)'; ctx.strokeStyle = 'rgba(0,230,160,0.3)';
      ctx.beginPath(); ctx.moveTo(q[0].x, q[0].y);
      for (let k = 1; k < 4; k++) ctx.lineTo(q[k].x, q[k].y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      const A0 = prj({ x: 0, y: hOf(0), z: 0 }), A1 = prj({ x: 0, y: hOf(LAMMAX), z: 0 });
      ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(A0.x, A0.y); ctx.lineTo(A1.x, A1.y); ctx.stroke();
      text(ctx, 'λ 轴', A1.x + 8, A1.y, C.text, 'left', 11);
      const drawPath = (key, col) => {
        ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.beginPath();
        steps.forEach((st, i) => { const pp = prj(wp(st[key][0], st.l, st[key][1])); if (i === 0) ctx.moveTo(pp.x, pp.y); else ctx.lineTo(pp.x, pp.y); });
        ctx.stroke();
      };
      drawPath('r', C.cyan);
      drawPath('s', C.green);
      const cur = { r: ridgeCoef(lam), s: lassoCoef(lam) };
      ['r', 's'].forEach((key, i) => {
        const p = prj(wp(cur[key][0], lam, cur[key][1]));
        ctx.fillStyle = i === 0 ? C.cyan : C.green;
        ctx.beginPath(); ctx.arc(p.x, p.y, 6 * p.s / 57, 0, 7); ctx.fill();
      });
      text(ctx, 'λ = ' + round(lam, 1) + '　L2: (' + round(cur.r[0], 2) + ', ' + round(cur.r[1], 2) + ')　L1: (' + round(cur.s[0], 2) + ', ' + round(cur.s[1], 2) + ')', 70, 30, C.yellow, 'left', 12);
      text(ctx, '青=L2 路径　绿=L1 路径　绿面=w2=0：L1 压到面上滑行，L2 只是渐近趋近　拖拽旋转', 70, H - 34, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(0, LAMMAX, 0.5, lam, v => { lam = v; draw(); }, 'λ'));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // K 近邻
  // ============================================================
  function knn(container) {
    const d = demoShell('KNN · 3D 近邻投票', '拖拽旋转；查询点自动巡航，看最近的 K 个邻居如何投票、预测如何随位置变化。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(6066);
    const data = [];
    for (let i = 0; i < 26; i++) data.push({ x: -1.2 + gauss(rng) * 0.5, y: gauss(rng) * 0.6, z: -0.4 + gauss(rng) * 0.5, label: 0 });
    for (let i = 0; i < 26; i++) data.push({ x: 1.2 + gauss(rng) * 0.5, y: gauss(rng) * 0.6, z: 0.4 + gauss(rng) * 0.5, label: 1 });
    let K = 3, t = 0;
    const state = { yaw: -0.5, pitch: 0.3 };
    const q = { x: 0, y: 0, z: 0 };
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      const wpt = p => ({ x: p.x * 1.1, y: p.y * 1.1, z: p.z * 1.1 });
      // 数据点（画家排序）
      const order = data.map((p, i) => ({ i, z: rot(wpt(p)).z })).sort((a, b) => a.z - b.z);
      for (const o of order) {
        const p = data[o.i]; const pp = prj(wpt(p));
        ctx.fillStyle = p.label === 0 ? C.cyan : C.magenta;
        ctx.beginPath(); ctx.arc(pp.x, pp.y, 4 * pp.s / 57, 0, 7); ctx.fill();
      }
      // 查询点 + K 近邻
      const dists = data.map(p => ({ p, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2 })).sort((a, b) => a.d - b.d);
      const qp = prj(wpt(q));
      for (let k = 0; k < K; k++) {
        const p = dists[k].p; const pp = prj(wpt(p));
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(qp.x, qp.y); ctx.lineTo(pp.x, pp.y); ctx.stroke();
        ctx.strokeStyle = C.yellow; ctx.beginPath(); ctx.arc(pp.x, pp.y, 8 * pp.s / 57, 0, 7); ctx.stroke();
      }
      const votes = [0, 0]; for (let k = 0; k < K; k++) votes[dists[k].p.label]++;
      ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(qp.x, qp.y, 6 * qp.s / 57, 0, 7); ctx.fill();
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(qp.x, qp.y, 6 * qp.s / 57, 0, 7); ctx.stroke();
      text(ctx, 'K = ' + K + '　预测 = ' + (votes[0] >= votes[1] ? '蓝类' : '粉类') + '（票 ' + votes[0] + ':' + votes[1] + '）　拖拽旋转', 70, 28, C.yellow, 'left', 13);
    }
    function loop() {
      if (!state.dragging) state.yaw += 0.004;
      t += 0.012;
      q.x = 1.3 * Math.cos(t); q.y = 0.5 * Math.sin(2 * t); q.z = 1.3 * Math.sin(t);
      draw(); requestAnimationFrame(loop);
    }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(1, 15, 1, K, v => { K = v; draw(); }, 'K'));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 朴素贝叶斯
  // ============================================================
  function naivebayes(container) {
    const d = demoShell('朴素贝叶斯 · 概率边界演示', '两类各服从高斯分布，看朴素贝叶斯如何用「先验 × 似然」画出决策边界。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const rng = makeRng(7077);
    const c0 = { x: 55, y: 50, sx: 1.6, sy: 1.6 }, c1 = { x: 115, y: 95, sx: 1.8, sy: 1.8 };
    let prior1 = 0.5;
    const pts0 = [], pts1 = [];
    for (let i = 0; i < 60; i++) pts0.push([c0.x + gauss(rng) * c0.sx, c0.y + gauss(rng) * c0.sy]);
    for (let i = 0; i < 60; i++) pts1.push([c1.x + gauss(rng) * c1.sx, c1.y + gauss(rng) * c1.sy]);
    const toX = x => 60 + (x - 20) / 140 * (W - 120);
    const toY = y => H - 60 - (y - 20) / 140 * (H - 120);
    const logLik = (x, y, c) => -((x - c.x) ** 2 / (2 * c.sx ** 2)) - ((y - c.y) ** 2 / (2 * c.sy ** 2));
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const gx = 70, gy = 44;
      for (let i = 0; i < gx; i++) for (let j = 0; j < gy; j++) {
        const x = 20 + (i + .5) / gx * 140, y = 20 + (j + .5) / gy * 140;
        const l0 = logLik(x, y, c0) + Math.log(1 - prior1), l1 = logLik(x, y, c1) + Math.log(prior1);
        ctx.fillStyle = l1 > l0 ? 'rgba(255,122,198,0.10)' : 'rgba(0,212,255,0.10)';
        ctx.fillRect(toX(x), toY(y + 140 / gy), (W - 120) / gx + 1, (H - 120) / gy + 1);
      }
      pts0.forEach(p => { ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(toX(p[0]), toY(p[1]), 3, 0, 7); ctx.fill(); });
      pts1.forEach(p => { ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.arc(toX(p[0]), toY(p[1]), 3, 0, 7); ctx.fill(); });
      text(ctx, '先验 P(粉类) = ' + round(prior1, 2) + '　边界随先验移动', 70, 28, C.cyan, 'left', 13);
    }
    d.controls.appendChild(makeRange(0.05, 0.95, 0.05, prior1, v => { prior1 = v; draw(); }, '先验'));
    draw();
  }

  // ============================================================
  // AdaBoost
  // ============================================================
  function adaboost(container) {
    const d = demoShell('AdaBoost · 加权提升演示', '每轮一个决策树桩，点的大小 = 样本权重；看错分点如何被放大、边界如何变准。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const rng = makeRng(8080);
    const data = [];
    for (let i = 0; i < 28; i++) data.push({ x: -1.4 + rng() * 1.0, y: -1.5 + rng() * 3.0, label: -1 });
    for (let i = 0; i < 28; i++) data.push({ x: 0.4 + rng() * 1.0, y: -1.5 + rng() * 3.0, label: 1 });
    const n = data.length;
    let weights = data.map(() => 1 / n), stumps = [], roundIdx = 0;
    const toX = x => 60 + (x + 2.2) / 4.4 * (W - 120);
    const toY = y => H - 60 - (y + 2.2) / 4.4 * (H - 120);
    function findBestStump() {
      let best = null;
      for (const feat of ['x', 'y']) {
        const vals = [...new Set(data.map(p => p[feat]))].sort((a, b) => a - b);
        for (let i = 0; i < vals.length - 1; i++) {
          const val = (vals[i] + vals[i + 1]) / 2;
          let err = 0;
          for (let k = 0; k < n; k++) { const pred = data[k][feat] <= val ? 1 : -1; if (pred !== data[k].label) err += weights[k]; }
          if (!best || err < best.err) best = { feat, val, err };
        }
      }
      return best;
    }
    function step() {
      if (roundIdx >= 20) return;
      const best = findBestStump();
      if (best.err >= 0.5 || best.err === 0) { roundIdx = 20; draw(); return; }
      const alpha = 0.5 * Math.log((1 - best.err) / best.err);
      let z = 0;
      for (let k = 0; k < n; k++) { const pred = data[k][best.feat] <= best.val ? 1 : -1; weights[k] *= Math.exp(-alpha * data[k].label * pred); z += weights[k]; }
      for (let k = 0; k < n; k++) weights[k] /= z;
      stumps.push({ feat: best.feat, val: best.val, alpha });
      roundIdx++; draw();
    }
    function auto() { if (autoOn) return; autoOn = true; const t = setInterval(() => { if (roundIdx >= 20) { clearInterval(t); autoOn = false; } else step(); }, 500); }
    let autoOn = false;
    function ensemble(x, y) { let s = 0; for (const st of stumps) s += st.alpha * (x <= st.val && st.feat === 'x' || y <= st.val && st.feat === 'y' ? 1 : -1); return s; }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const gx = 70, gy = 44;
      if (stumps.length) for (let i = 0; i < gx; i++) for (let j = 0; j < gy; j++) {
        const x = -2.2 + (i + .5) / gx * 4.4, y = -2.2 + (j + .5) / gy * 4.4;
        ctx.fillStyle = ensemble(x, y) >= 0 ? 'rgba(255,122,198,0.10)' : 'rgba(0,212,255,0.10)';
        ctx.fillRect(toX(x), toY(y + 4.4 / gy), (W - 120) / gx + 1, (H - 120) / gy + 1);
      }
      // 当前树桩分割线
      if (stumps.length) {
        const last = stumps[stumps.length - 1];
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath();
        if (last.feat === 'x') { ctx.moveTo(toX(last.val), 60); ctx.lineTo(toX(last.val), H - 60); }
        else { ctx.moveTo(60, toY(last.val)); ctx.lineTo(W - 60, toY(last.val)); }
        ctx.stroke(); ctx.setLineDash([]);
      }
      for (const p of data) {
        const r = 3 + weights[data.indexOf(p)] * n * 0.6;
        ctx.fillStyle = p.label === 1 ? C.magenta : C.cyan;
        ctx.beginPath(); ctx.arc(toX(p.x), toY(p.y), clamp(r, 2, 9), 0, 7); ctx.fill();
      }
      text(ctx, '第 ' + roundIdx + ' / 20 轮　点越大 = 权重越高（越难分）', 70, 28, C.yellow, 'left', 13);
    }
    d.controls.appendChild(makeButton('下一步', step, true));
    d.controls.appendChild(makeButton('自动', auto));
    d.controls.appendChild(makeButton('重置', () => { weights = data.map(() => 1 / n); stumps = []; roundIdx = 0; draw(); }));
    draw();
  }

  // ============================================================
  // DBSCAN
  // ============================================================
  function dbscan(container) {
    const d = demoShell('DBSCAN · 3D 密度聚类', '拖拽旋转；两个分离的 3D 甜甜圈 + 噪声，调 eps/minPts 看簇如何连出、噪声如何被标灰。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(9091);
    const pts = [];
    // 两个分离的 3D 圆环（甜甜圈），一个平躺、一个竖立；K-Means 会切碎圆环，DBSCAN 能按密度连成整环
    for (let i = 0; i < 110; i++) { const a = rng() * Math.PI * 2; pts.push({ x: -1.8 + 1.3 * Math.cos(a) + gauss(rng) * 0.05, y: 1.3 * Math.sin(a) + gauss(rng) * 0.05, z: gauss(rng) * 0.05 }); }
    for (let i = 0; i < 110; i++) { const a = rng() * Math.PI * 2; pts.push({ x: 1.8 + 1.3 * Math.cos(a) + gauss(rng) * 0.05, y: gauss(rng) * 0.05, z: 1.3 * Math.sin(a) + gauss(rng) * 0.05 }); }
    for (let i = 0; i < 15; i++) pts.push({ x: (rng() * 2 - 1) * 4, y: (rng() * 2 - 1) * 4, z: (rng() * 2 - 1) * 4 });
    let eps = 0.45, minPts = 5;
    const state = { yaw: -0.6, pitch: 0.3 };
    function run() {
      const n = pts.length, labels = new Array(n).fill(-1);
      const region = i => { const r = []; for (let j = 0; j < n; j++) if (i !== j) { const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dz = pts[i].z - pts[j].z; if (dx * dx + dy * dy + dz * dz <= eps * eps) r.push(j); } return r; };
      let c = 0;
      for (let i = 0; i < n; i++) {
        if (labels[i] !== -1) continue;
        const nbrs = region(i);
        if (nbrs.length < minPts) { labels[i] = -2; continue; }
        c++; labels[i] = c;
        const seeds = [...nbrs];
        while (seeds.length) {
          const q = seeds.pop();
          if (labels[q] === -2) labels[q] = c;
          if (labels[q] !== -1) continue;
          labels[q] = c;
          const qn = region(q);
          if (qn.length >= minPts) for (const x of qn) seeds.push(x);
        }
      }
      return { labels, c };
    }
    function draw() {
      clear(ctx, W, H);
      const { labels, c } = run();
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = pts.map(p => rotate3({ x: p.x * 0.95, y: p.y * 0.95, z: p.z * 0.95 }, state.yaw, state.pitch));
      const pp = rot.map(v => proj3(v, cx, cy, f, dd));
      const order = rot.map((v, i) => ({ i, z: v.z })).sort((a, b) => a.z - b.z);
      const palette = [C.cyan, C.magenta, C.green, C.orange, C.purple, C.yellow, C.blue];
      for (const o of order) {
        ctx.fillStyle = labels[o.i] === -2 ? '#5a6070' : palette[labels[o.i] % palette.length];
        ctx.beginPath(); ctx.arc(pp[o.i].x, pp[o.i].y, 3.2 * pp[o.i].s / 57, 0, 7); ctx.fill();
      }
      text(ctx, 'eps = ' + eps + '　minPts = ' + minPts + '　簇数 = ' + c + '　拖拽旋转', 70, 28, C.yellow, 'left', 13);
      text(ctx, '灰色=噪声　两个分离的甜甜圈是 K-Means 会切碎的，DBSCAN 按密度连成整环', 70, H - 36, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(0.25, 1.2, 0.05, eps, v => { eps = v; draw(); }, 'eps'));
    d.controls.appendChild(makeRange(2, 12, 1, minPts, v => { minPts = v; draw(); }, 'minPts'));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // t-SNE
  // ============================================================
  function tsne(container) {
    const d = demoShell('t-SNE · 3D 降维', '真实 t-SNE 把 4 个高维簇嵌入到 3D；拖拽旋转，拖动迭代看它们从一团随机逐渐分离。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(8181);
    const D = 15, nPer = 30, nc = 4, n = nPer * nc;
    const centers = [];
    for (let c = 0; c < nc; c++) { const v = Array.from({ length: D }, () => gauss(rng)); const nm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)); centers.push(v.map(x => x / nm * 6)); }
    const X = [];
    for (let c = 0; c < nc; c++) for (let i = 0; i < nPer; i++) X.push(centers[c].map(cc => cc + gauss(rng) * 0.5));
    const dmat = [];
    for (let i = 0; i < n; i++) { dmat.push(new Array(n)); for (let j = 0; j < n; j++) { let s = 0; for (let k = 0; k < D; k++) { const dx = X[i][k] - X[j][k]; s += dx * dx; } dmat[i][j] = s; } }
    const perp = 20, targetH = Math.log(perp);
    let P = []; for (let i = 0; i < n; i++) P.push(new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      let lo = 1e-3, hi = 1e3;
      for (let it = 0; it < 50; it++) {
        const sig = (lo + hi) / 2; let sum = 0, H = 0;
        for (let j = 0; j < n; j++) { if (j === i) continue; sum += Math.exp(-dmat[i][j] / (2 * sig * sig)); }
        if (sum <= 0) { lo = sig; continue; }
        for (let j = 0; j < n; j++) { if (j === i) continue; const p = Math.exp(-dmat[i][j] / (2 * sig * sig)) / sum; if (p > 1e-12) H -= p * Math.log(p); }
        if (H > targetH) hi = sig; else lo = sig;
      }
      const sig = (lo + hi) / 2; let sum = 0; for (let j = 0; j < n; j++) { if (j === i) continue; sum += Math.exp(-dmat[i][j] / (2 * sig * sig)); }
      for (let j = 0; j < n; j++) { if (j === i) continue; P[i][j] = Math.exp(-dmat[i][j] / (2 * sig * sig)) / sum; }
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) P[i][j] = (P[i][j] + P[j][i]) / (2 * n);
    let Y = Array.from({ length: n }, () => [(rng() * 2 - 1) * 1e-4, (rng() * 2 - 1) * 1e-4, (rng() * 2 - 1) * 1e-4]);
    let Yv = Array.from({ length: n }, () => [0, 0, 0]);
    const snapshots = [], total = 600, snapEvery = 12;
    for (let it = 0; it < total; it++) {
      let Z = 0; const q = []; for (let i = 0; i < n; i++) q.push(new Array(n).fill(0));
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { const dx = Y[i][0] - Y[j][0], dy = Y[i][1] - Y[j][1], dz = Y[i][2] - Y[j][2]; const v = 1 / (1 + dx * dx + dy * dy + dz * dz); q[i][j] = v; q[j][i] = v; Z += 2 * v; }
      const grad = Array.from({ length: n }, () => [0, 0, 0]);
      const exag = it < 120 ? 4 : 1;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = Y[i][0] - Y[j][0], dy = Y[i][1] - Y[j][1], dz = Y[i][2] - Y[j][2];
        const w = (exag * P[i][j] - q[i][j] / Z) / (1 + dx * dx + dy * dy + dz * dz);
        grad[i][0] += 4 * w * dx; grad[i][1] += 4 * w * dy; grad[i][2] += 4 * w * dz;
      }
      const mom = it < 250 ? 0.5 : 0.8;
      for (let i = 0; i < n; i++) { Yv[i][0] = mom * Yv[i][0] - 1.0 * grad[i][0]; Yv[i][1] = mom * Yv[i][1] - 1.0 * grad[i][1]; Yv[i][2] = mom * Yv[i][2] - 1.0 * grad[i][2]; Y[i][0] += Yv[i][0]; Y[i][1] += Yv[i][1]; Y[i][2] += Yv[i][2]; }
      if (it % snapEvery === 0 || it === total - 1) snapshots.push(Y.map(p => [p[0], p[1], p[2]]));
    }
    let idx = 0;
    const state = { yaw: -0.5, pitch: 0.3 };
    const palette = [C.cyan, C.magenta, C.green, C.orange];
    function draw() {
      clear(ctx, W, H);
      const Ys = snapshots[Math.min(idx, snapshots.length - 1)];
      let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
      Ys.forEach(p => { for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], p[k]); mx[k] = Math.max(mx[k], p[k]); } });
      const sc = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2], 1e-3);
      const c3 = [0, 1, 2].map(k => (mn[k] + mx[k]) / 2);
      const s = 2.6 / sc;
      const wpt = p => ({ x: (p[0] - c3[0]) * s, y: (p[1] - c3[1]) * s, z: (p[2] - c3[2]) * s });
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      const order = Ys.map((p, i) => ({ i, z: rot(wpt(p)).z })).sort((a, b) => a.z - b.z);
      for (const o of order) {
        const pp = prj(wpt(Ys[o.i]));
        ctx.fillStyle = palette[Math.floor(o.i / nPer) % nc];
        ctx.beginPath(); ctx.arc(pp.x, pp.y, 3.6 * pp.s / 57, 0, 7); ctx.fill();
      }
      text(ctx, '迭代 ' + Math.round(idx / (snapshots.length - 1) * total) + ' / ' + total + '　拖拽旋转', 70, 28, C.yellow, 'left', 13);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(0, snapshots.length - 1, 1, idx, v => { idx = v; draw(); }, '迭代'));
    d.controls.appendChild(makeButton('播放', () => {
      if (d._timer) clearInterval(d._timer); d._timer = setInterval(() => { idx++; if (idx >= snapshots.length) idx = 0; draw(); }, 60);
    }, true));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // CNN 卷积
  // ============================================================
  function cnn(container) {
    const d = demoShell('CNN · 3D 特征体', '拖拽旋转；一个 8×8 图像经 4 个卷积核变成 4 通道的 3D 特征体（6×6×4）。播放看窗口滑动。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const N = 8, outN = 6;
    const img = [];
    for (let i = 0; i < N; i++) { img.push([]); for (let j = 0; j < N; j++) img[i].push(i < 4 ? 0 : 1); }
    const kernels = [
      [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]],
      [[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
      [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
      [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]
    ];
    const kRGB = [[0, 212, 255], [255, 122, 198], [255, 184, 92], [0, 230, 160]];
    const outs = kernels.map(K => { const o = []; for (let i = 0; i < outN; i++) { o.push([]); for (let j = 0; j < outN; j++) { let s = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) s += img[i + a][j + b] * K[a][b]; o[i].push(s); } } return o; });
    let pos = -1;
    const state = { yaw: -0.5, pitch: 0.3 };
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      const quad = (a, b, c, d, style) => {
        ctx.fillStyle = style;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.closePath(); ctx.fill();
      };
      // 输入图像（YZ 平面，8×8）
      const inHalf = 1.5, inCell = 3 / N;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const y0 = -inHalf + i * inCell, z0 = -inHalf + j * inCell;
        const c1 = prj({ x: -2.4, y: y0, z: z0 }), c2 = prj({ x: -2.4, y: y0 + inCell, z: z0 }), c3 = prj({ x: -2.4, y: y0 + inCell, z: z0 + inCell }), c4 = prj({ x: -2.4, y: y0, z: z0 + inCell });
        quad(c1, c2, c3, c4, img[i][j] > 0.5 ? '#ff7ac6' : '#16304a');
      }
      // 4 个卷积核（竖排，3×3）
      const kCell = 0.3, kHalf = 0.45;
      kernels.forEach((K, ki) => {
        const gx = -0.4, yOff = (ki - 1.5) * 1.05;
        for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
          const y0 = yOff - kHalf + a * kCell, z0 = -kHalf + b * kCell;
          const v = K[a][b];
          const style = v < 0 ? 'rgba(255,107,107,0.7)' : v > 0 ? 'rgba(0,230,160,0.7)' : '#16304a';
          const c1 = prj({ x: gx, y: y0, z: z0 }), c2 = prj({ x: gx, y: y0 + kCell, z: z0 }), c3 = prj({ x: gx, y: y0 + kCell, z: z0 + kCell }), c4 = prj({ x: gx, y: y0, z: z0 + kCell });
          quad(c1, c2, c3, c4, style);
        }
      });
      // 输出 3D 特征体（4 通道沿 X 深度堆叠，各 6×6）
      const oHalf = 1.2, oCell = 2.4 / outN;
      outs.forEach((o, ci) => {
        const gx = 2.2 + ci * 0.24, rgb = kRGB[ci];
        for (let i = 0; i < outN; i++) for (let j = 0; j < outN; j++) {
          const y0 = -oHalf + i * oCell, z0 = -oHalf + j * oCell;
          const v = o[i][j];
          const t = clamp(Math.abs(v) / 3, 0, 1);
          const c1 = prj({ x: gx, y: y0, z: z0 }), c2 = prj({ x: gx, y: y0 + oCell, z: z0 }), c3 = prj({ x: gx, y: y0 + oCell, z: z0 + oCell }), c4 = prj({ x: gx, y: y0, z: z0 + oCell });
          quad(c1, c2, c3, c4, v === 0 ? '#16304a' : 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.2 + t * 0.75) + ')');
        }
      });
      // 滑动窗口高亮
      if (pos >= 0 && pos < outN * outN) {
        const ri = Math.floor(pos / outN), rj = pos % outN;
        const y0 = -inHalf + ri * inCell, z0 = -inHalf + rj * inCell;
        const c1 = prj({ x: -2.4, y: y0, z: z0 }), c2 = prj({ x: -2.4, y: y0 + inCell * 3, z: z0 }), c3 = prj({ x: -2.4, y: y0 + inCell * 3, z: z0 + inCell * 3 }), c4 = prj({ x: -2.4, y: y0, z: z0 + inCell * 3 });
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(c3.x, c3.y); ctx.lineTo(c4.x, c4.y); ctx.closePath(); ctx.stroke();
        outs.forEach((o, ci) => {
          const gy0 = -oHalf + ri * oCell, gz0 = -oHalf + rj * oCell;
          const d1 = prj({ x: 2.2 + ci * 0.24, y: gy0, z: gz0 }), d2 = prj({ x: 2.2 + ci * 0.24, y: gy0 + oCell, z: gz0 }), d3 = prj({ x: 2.2 + ci * 0.24, y: gy0 + oCell, z: gz0 + oCell }), d4 = prj({ x: 2.2 + ci * 0.24, y: gy0, z: gz0 + oCell });
          ctx.strokeStyle = C.yellow; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(d1.x, d1.y); ctx.lineTo(d2.x, d2.y); ctx.lineTo(d3.x, d3.y); ctx.lineTo(d4.x, d4.y); ctx.closePath(); ctx.stroke();
        });
      }
      text(ctx, '输入 8×8×1　→　4 个卷积核　→　特征体 6×6×4', 70, 30, C.cyan, 'left', 13);
      text(ctx, '黄框=当前窗口　输出同一位置在 4 个通道都被点亮　拖拽旋转', 70, H - 36, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeButton('上一步', () => { pos = Math.max(-1, pos - 1); draw(); }));
    d.controls.appendChild(makeButton('下一步', () => { pos = Math.min(outN * outN - 1, pos + 1); draw(); }, true));
    d.controls.appendChild(makeButton('播放', () => {
      if (d._t) { clearInterval(d._t); d._t = null; return; }
      d._t = setInterval(() => { pos++; if (pos >= outN * outN) { pos = -1; } draw(); }, 300);
    }));
    d.controls.appendChild(makeButton('重置', () => { pos = -1; draw(); }));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 自编码器
  // ============================================================
  function autoencoder(container) {
    const d = demoShell('自编码器 · 3D 流形重建', '一个 3D→1D→3D 非线性自编码器，把螺旋线压到 1 维再还原。拖拽旋转，点「训练」看误差下降。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(9192);
    const n = 90, D = 3, Hn = 8;
    const data = [];
    for (let i = 0; i < n; i++) { const t = i / n * 2 * Math.PI; data.push([1.2 * Math.cos(t) + gauss(rng) * 0.03, 1.2 * Math.sin(t) + gauss(rng) * 0.03, 0.4 * t - 1.25 + gauss(rng) * 0.03]); }
    const rm = (r, c, s) => Array.from({ length: r }, () => Array.from({ length: c }, () => (rng() * 2 - 1) * s));
    const mvT = (M, v) => M[0].map((_, j) => M.reduce((s, row, i) => s + row[j] * v[i], 0));
    let W1, b1, W2, b2, W3, b3, W4, b4, recs, loss, epoch;
    const state = { yaw: -0.5, pitch: 0.3 };
    function init() { W1 = rm(Hn, D, 0.6); b1 = zeros(Hn); W2 = rm(1, Hn, 0.6); b2 = zeros(1); W3 = rm(Hn, 1, 0.6); b3 = zeros(Hn); W4 = rm(D, Hn, 0.6); b4 = zeros(D); epoch = 0; }
    function forward(x) {
      const h1 = vecAdd(matVec(W1, x), b1).map(Math.tanh);
      const z = W2[0].reduce((s, wi, i) => s + wi * h1[i], 0) + b2[0];
      const h2 = vecAdd(matVec(W3, [z]), b3).map(Math.tanh);
      const r = vecAdd(matVec(W4, h2), b4);
      return { h1, z, h2, r };
    }
    function compute() { let tot = 0; recs = data.map(x => { const f = forward(x); const e = f.r.map((ri, i) => ri - x[i]); tot += e.reduce((s, v) => s + v * v, 0); return f.r; }); loss = tot / n; }
    function trainEpochs(eps) {
      for (let ep = 0; ep < eps; ep++) {
        const lr = 0.03 * (0.6 / (0.6 + epoch / 250));
        for (const x of data) {
          const f = forward(x);
          const e = f.r.map((ri, i) => ri - x[i]);
          const dW4 = outer(e, f.h2), db4 = e;
          const dh2 = mvT(W4, e).map((v, i) => v * (1 - f.h2[i] * f.h2[i]));
          const dW3 = outer(dh2, [f.z]), db3 = dh2;
          const dz = W3.reduce((s, row, i) => s + row[0] * dh2[i], 0);
          const dW2 = outer([dz], f.h1), db2 = [dz];
          const dh1 = mvT(W2, [dz]).map((v, i) => v * (1 - f.h1[i] * f.h1[i]));
          const dW1 = outer(dh1, x), db1 = dh1;
          W1 = matAdd(W1, matScale(dW1, -lr)); b1 = vecAdd(b1, vecScale(db1, -lr));
          W2 = matAdd(W2, matScale(dW2, -lr)); b2 = vecAdd(b2, vecScale(db2, -lr));
          W3 = matAdd(W3, matScale(dW3, -lr)); b3 = vecAdd(b3, vecScale(db3, -lr));
          W4 = matAdd(W4, matScale(dW4, -lr)); b4 = vecAdd(b4, vecScale(db4, -lr));
        }
        epoch++;
      }
      compute(); draw();
    }
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      // 误差连线
      for (let i = 0; i < n; i++) {
        const a = prj({ x: data[i][0] * 1.15, y: data[i][1] * 1.15, z: data[i][2] * 1.15 });
        const b = prj({ x: recs[i][0] * 1.15, y: recs[i][1] * 1.15, z: recs[i][2] * 1.15 });
        ctx.strokeStyle = 'rgba(255,184,92,0.22)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      // 点（画家排序）
      const order = data.map((p, i) => ({ i, z: rot({ x: p[0] * 1.15, y: p[1] * 1.15, z: p[2] * 1.15 }).z })).sort((a, b) => a.z - b.z);
      for (const o of order) {
        const p = data[o.i], r = recs[o.i];
        const pp = prj({ x: p[0] * 1.15, y: p[1] * 1.15, z: p[2] * 1.15 });
        const rp = prj({ x: r[0] * 1.15, y: r[1] * 1.15, z: r[2] * 1.15 });
        ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.arc(pp.x, pp.y, 3.2 * pp.s / 57, 0, 7); ctx.fill();
        ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(rp.x, rp.y, 2.6 * rp.s / 57, 0, 7); ctx.fill();
      }
      text(ctx, '迭代 ' + epoch + '　重建损失 = ' + round(loss, 4), 70, 30, C.yellow, 'left', 13);
      text(ctx, '青=原始螺旋 · 橙=重建（压到 1D 再还原）· 橙线=误差 · 拖拽旋转', 70, H - 36, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    init(); trainEpochs(700); // 预训练到收敛（700 轮 MSE≈0.008，再训收益极小但明显更慢）
    d.controls.appendChild(makeButton('训练 200 步', () => { trainEpochs(200); }, true));
    d.controls.appendChild(makeButton('重置', () => { init(); compute(); draw(); }));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // GRU
  // ============================================================
  function gru(container) {
    const d = demoShell('GRU · 3D 双门单元', '拖拽旋转；更新门 z 与重置门 r 控制隐藏状态 h 的写入与遗忘。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const seq = [
      { x: 1.0, z: 0.1, r: 0.9, label: '写新信息（z 小 → 大量更新）' },
      { x: 0.3, z: 0.9, r: 0.9, label: '保持记忆（z 大 → 几乎不动）' },
      { x: -0.8, z: 0.5, r: 0.2, label: '忽略历史（r 小 → 短期依赖）' },
      { x: 0.6, z: 0.4, r: 0.7, label: '折中更新' }
    ];
    let h = 0, idx = 0;
    const state = { yaw: -0.5, pitch: 0.3 };
    function advance() { if (idx >= seq.length) return; const s = seq[idx]; const cand = Math.tanh(s.x + s.r * h); h = (1 - s.z) * h + s.z * cand; idx++; }
    function reset() { h = 0; idx = 0; draw(); }
    function draw() {
      clear(ctx, W, H);
      const s = seq[Math.min(idx, seq.length - 1)];
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      const P = { h: { x: 0, y: 0, z: 0 }, z: { x: -1.1, y: 0.8, z: 0 }, r: { x: -1.1, y: -0.8, z: 0 }, x: { x: 1.2, y: 0.8, z: 0 }, cand: { x: 0.6, y: -1.1, z: 0 } };
      const seg = (p, q, color) => { const a = prj(p), b = prj(q); ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]); };
      seg(P.x, P.h, 'rgba(150,160,190,0.4)');
      seg(P.z, P.h, 'rgba(0,230,160,0.5)');
      seg(P.r, P.h, 'rgba(255,184,92,0.5)');
      seg(P.cand, P.h, 'rgba(120,130,170,0.4)');
      const nodes = [
        { p: P.h, color: C.yellow, r: 9 + Math.abs(h) * 9, alpha: 0.6 + Math.abs(h) * 0.4, label: 'h=' + round(h, 2) },
        { p: P.z, color: C.green, r: 7 + s.z * 8, alpha: 0.3 + s.z * 0.7, label: '更新门 z=' + round(s.z, 2) },
        { p: P.r, color: C.orange, r: 7 + s.r * 8, alpha: 0.3 + s.r * 0.7, label: '重置门 r=' + round(s.r, 2) },
        { p: P.x, color: C.white, r: 6 + Math.abs(s.x) * 4, alpha: 0.5 + Math.abs(s.x) * 0.3, label: '输入 x=' + round(s.x, 2) },
        { p: P.cand, color: C.cyan, r: 6, alpha: 0.7, label: '候选 h̃' }
      ];
      const pn = nodes.map(n => ({ n, r: rot(n.p), pr: prj(n.p) })).sort((a, b) => a.r.z - b.r.z);
      for (const o of pn) {
        ctx.globalAlpha = o.n.alpha; ctx.fillStyle = o.n.color;
        ctx.beginPath(); ctx.arc(o.pr.x, o.pr.y, o.n.r * o.pr.s / 58, 0, 7); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.1; ctx.stroke();
        text(ctx, o.n.label, o.pr.x, o.pr.y + (o.n.r + 14) * o.pr.s / 58, o.n.color, 'center', 10);
      }
      text(ctx, '步骤 ' + idx + '/4　' + (s ? s.label : '') + '　h = (1−z)·h + z·tanh(x + r·h)', 70, 30, C.white, 'left', 13);
      text(ctx, '拖拽旋转', 70, H - 36, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeButton('下一步', () => { if (idx < seq.length) { advance(); draw(); } }, true));
    d.controls.appendChild(makeButton('重置', reset));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // Transformer 注意力
  // ============================================================
  function transformer(container) {
    const d = demoShell('Transformer · 注意力热力图', '一句话逐词计算自注意力，点击某行看这个词「最关注」句子里的哪些词。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const tokens = ['the', 'animal', 'didn\'t', 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'];
    const n = tokens.length;
    const rng = makeRng(9292);
    const emb = tokens.map(() => Array.from({ length: 8 }, () => (rng() * 2 - 1)));
    const dK = 8;
    // 注意力矩阵
    const A = [];
    for (let i = 0; i < n; i++) {
      const scores = tokens.map((_, j) => { let s = 0; for (let k = 0; k < dK; k++) s += emb[i][k] * emb[j][k]; return s / Math.sqrt(dK); });
      A.push(softmax(scores));
    }
    let sel = 7; // 默认选 "it"
    const cell = 30, gap = 2, x0 = 60, y0 = 70;
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      // 热力图
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const v = A[i][j];
        ctx.fillStyle = 'rgba(255,122,198,' + (v * 0.9) + ')';
        ctx.fillRect(x0 + j * (cell + gap), y0 + i * (cell + gap), cell, cell);
        ctx.fillStyle = v > 0.6 ? '#1a0a14' : 'rgba(255,255,255,0.55)';
        text(ctx, round(v, 2), x0 + j * (cell + gap) + cell / 2, y0 + i * (cell + gap) + cell / 2, v > 0.6 ? '#200' : '#fff', 'center', 8);
      }
      // 行标签（查询词）
      tokens.forEach((t, i) => text(ctx, t, x0 - 6, y0 + i * (cell + gap) + cell / 2, i === sel ? C.yellow : C.text, 'right', 10));
      // 选中行高亮
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 2; ctx.strokeRect(x0 - 2, y0 + sel * (cell + gap) - 2, n * (cell + gap) - gap + 4, cell + 4);
      // 顶部关注目标
      const top = A[sel].map((v, j) => ({ v, j })).sort((a, b) => b.v - a.v).slice(0, 3);
      text(ctx, '「' + tokens[sel] + '」最关注：' + top.map(o => tokens[o.j] + '(' + round(o.v, 2) + ')').join('、'), 70, H - 40, C.yellow, 'left', 12);
    }
    d.canvas.addEventListener('click', e => {
      const r = d.canvas.getBoundingClientRect();
      const py = (e.clientY - r.top) / r.height * H;
      const i = Math.floor((py - y0) / (cell + gap));
      if (i >= 0 && i < n) { sel = i; draw(); }
    });
    draw();
  }

  // ============================================================
  // GAN
  // ============================================================
  function gan(container) {
    const d = demoShell('GAN · 3D 分布对抗', '拖拽旋转；绿色=真实分布，粉色=生成分布，黄色平面=判别器决策边界。看粉色云如何迁移过去。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(9393);
    const RM = [1.4, 0.6, -0.9], RS = 0.55;
    let mu = [0, 0, 0], sg = 1.6, w = [0, 0, 0, 0];
    const lrD = 0.05, lrG = 0.05, B = 64, STEPS = 2000;
    const sigmoid = x => 1 / (1 + Math.exp(-x));
    const snapshots = [];
    for (let step = 0; step < STEPS; step++) {
      const gw = [0, 0, 0, 0];
      for (let k = 0; k < B; k++) {
        const xr0 = RM[0] + gauss(rng) * RS, xr1 = RM[1] + gauss(rng) * RS, xr2 = RM[2] + gauss(rng) * RS;
        const z0 = gauss(rng), z1 = gauss(rng), z2 = gauss(rng);
        const xf0 = mu[0] + sg * z0, xf1 = mu[1] + sg * z1, xf2 = mu[2] + sg * z2;
        const lgR = w[0] + w[1] * xr0 + w[2] * xr1 + w[3] * xr2;
        const lgF = w[0] + w[1] * xf0 + w[2] * xf1 + w[3] * xf2;
        const pr = sigmoid(lgR), pf = sigmoid(lgF);
        gw[0] += (pr - 1) + pf;
        gw[1] += (pr - 1) * xr0 + pf * xf0;
        gw[2] += (pr - 1) * xr1 + pf * xf1;
        gw[3] += (pr - 1) * xr2 + pf * xf2;
      }
      for (let j = 0; j < 4; j++) w[j] -= lrD * gw[j] / B;
      let d0 = 0, d1 = 0, d2 = 0, dsg = 0;
      for (let k = 0; k < B; k++) {
        const z0 = gauss(rng), z1 = gauss(rng), z2 = gauss(rng);
        const xf0 = mu[0] + sg * z0, xf1 = mu[1] + sg * z1, xf2 = mu[2] + sg * z2;
        const q = sigmoid(w[0] + w[1] * xf0 + w[2] * xf1 + w[3] * xf2) - 1;
        d0 += q * w[1]; d1 += q * w[2]; d2 += q * w[3];
        dsg += q * (w[1] * z0 + w[2] * z1 + w[3] * z2);
      }
      mu[0] -= lrG * d0 / B; mu[1] -= lrG * d1 / B; mu[2] -= lrG * d2 / B;
      sg -= lrG * dsg / B; if (sg < 0.08) sg = 0.08;
      if (step % 40 === 0 || step === STEPS - 1) snapshots.push({ mu: mu.slice(), sg: sg, w: w.slice() });
    }
    let idx = snapshots.length - 1;
    const state = { yaw: -0.7, pitch: 0.35 };
    const realPts = [], zPts = [];
    for (let i = 0; i < 140; i++) { realPts.push([0, 1, 2].map(j => RM[j] + gauss(rng) * RS)); zPts.push([0, 1, 2].map(() => gauss(rng))); }
    const CTR = [0.7, 0.3, -0.45], SC = 0.85;
    const wpt = p => ({ x: (p[0] - CTR[0]) * SC, y: (p[1] - CTR[1]) * SC, z: (p[2] - CTR[2]) * SC });
    function planeQuad(wv, R) {
      const n = [wv[1], wv[2], wv[3]];
      const nn = Math.hypot(n[0], n[1], n[2]) || 1;
      const p0 = [-wv[0] * n[0] / (nn * nn), -wv[0] * n[1] / (nn * nn), -wv[0] * n[2] / (nn * nn)];
      let u = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const ud = u[0] * n[0] + u[1] * n[1] + u[2] * n[2];
      u = [u[0] - ud * n[0] / (nn * nn), u[1] - ud * n[1] / (nn * nn), u[2] - ud * n[2] / (nn * nn)];
      const un = Math.hypot(u[0], u[1], u[2]) || 1; u = u.map(x => x / un);
      const vv0 = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
      const vn = Math.hypot(vv0[0], vv0[1], vv0[2]) || 1; const vv = vv0.map(x => x / vn);
      const pt = (a, b) => ({ x: p0[0] + a * u[0] + b * vv[0], y: p0[1] + a * u[1] + b * vv[1], z: p0[2] + a * u[2] + b * vv[2] });
      return [pt(-R, -R), pt(R, -R), pt(R, R), pt(-R, R)];
    }
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      const S = snapshots[Math.min(idx, snapshots.length - 1)];
      const q = planeQuad(S.w, 2.6).map(p => prj(wpt(p)));
      ctx.fillStyle = 'rgba(255,224,102,0.13)'; ctx.strokeStyle = 'rgba(255,224,102,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(q[0].x, q[0].y);
      for (let k = 1; k < 4; k++) ctx.lineTo(q[k].x, q[k].y);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      const items = [];
      realPts.forEach(p => items.push({ p: wpt(p), c: C.green }));
      zPts.forEach(z => items.push({ p: wpt([0, 1, 2].map(j => S.mu[j] + S.sg * z[j])), c: C.magenta }));
      items.forEach(it => it.z = rot(it.p).z);
      items.sort((a, b) => a.z - b.z);
      items.forEach(it => {
        const pp = prj(it.p);
        ctx.fillStyle = it.c;
        ctx.beginPath(); ctx.arc(pp.x, pp.y, 3.2 * pp.s / 57, 0, 7); ctx.fill();
      });
      text(ctx, '训练步 ' + Math.round(idx / (snapshots.length - 1) * STEPS) + '　μ=(' + S.mu.map(v => round(v, 2)).join(',') + ')　σ=' + round(S.sg, 2), 70, 30, C.yellow, 'left', 12);
      text(ctx, '绿=真实分布　粉=生成分布　黄面=判别器 D=0.5 边界　拖拽旋转', 70, H - 34, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(0, snapshots.length - 1, 1, idx, v => { idx = v; draw(); }, '步'));
    d.controls.appendChild(makeButton('播放', () => {
      if (d._t) { clearInterval(d._t); d._t = null; return; }
      d._t = setInterval(() => { idx++; if (idx >= snapshots.length) idx = 0; draw(); }, 80);
    }, true));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 强化学习 Q-learning
  // ============================================================
  function rl(container) {
    const d = demoShell('强化学习 · 3D 价值地形', '拖拽旋转；每根柱子 = 一个状态的价值（max Q），越靠近终点越高。点「训练」看它从平地长成地形。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const G = 5, N = G * G, goal = 24, start = 0;
    let Q = Array.from({ length: N }, () => [0, 0, 0, 0]);
    const rewards = new Array(N).fill(-0.1); rewards[goal] = 1;
    let path = [];
    const state = { yaw: -0.6, pitch: 0.4 };
    function stepEnv(s, a) { const r = s % G, c = Math.floor(s / G); let ns = s; if (a === 0 && r > 0) ns = s - 1; else if (a === 1 && r < G - 1) ns = s + 1; else if (a === 2 && c > 0) ns = s - G; else if (a === 3 && c < G - 1) ns = s + G; return ns; }
    function greedyPath() { let s = start, p = [s], seen = new Set(); for (let i = 0; i < 60; i++) { if (s === goal) break; if (seen.has(s)) break; seen.add(s); s = stepEnv(s, Q[s].indexOf(Math.max.apply(null, Q[s]))); p.push(s); } return p; }
    function train() {
      for (let ep = 0; ep < 600; ep++) {
        let s = start;
        for (let t = 0; t < 100; t++) {
          const eps = Math.max(0.05, 1 - ep / 300);
          let a; if (Math.random() < eps) a = (Math.random() * 4) | 0; else a = Q[s].indexOf(Math.max.apply(null, Q[s]));
          const ns = stepEnv(s, a);
          Q[s][a] += 0.5 * (rewards[ns] + 0.9 * Math.max.apply(null, Q[ns]) - Q[s][a]);
          s = ns; if (s === goal) break;
        }
      }
      path = greedyPath(); draw();
    }
    const cell = 1.15;
    const colX = s => (s % G - (G - 1) / 2) * cell;
    const colZ = s => (Math.floor(s / G) - (G - 1) / 2) * cell;
    const vOf = s => Math.max.apply(null, Q[s]);
    const hOf = s => clamp((vOf(s) + 0.1) / 1.4, 0, 1) * 1.9;
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2 + 40, f = 520, dd = 12;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      ctx.strokeStyle = 'rgba(120,145,200,0.16)'; ctx.lineWidth = 1;
      for (let i = 0; i < G; i++) {
        let a = prj({ x: colX(i * G), y: 0, z: -G * cell / 2 }), b = prj({ x: colX(i * G), y: 0, z: G * cell / 2 });
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        a = prj({ x: -G * cell / 2, y: 0, z: colZ(i * G) }); b = prj({ x: G * cell / 2, y: 0, z: colZ(i * G) });
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      const bars = [];
      for (let s = 0; s < N; s++) bars.push({ s, z: rot({ x: colX(s), y: hOf(s) / 2, z: colZ(s) }).z });
      bars.sort((a, b) => a.z - b.z);
      bars.forEach(b => {
        const s = b.s, x = colX(s), z = colZ(s), r = cell * 0.36, h = hOf(s);
        const t0 = clamp((vOf(s) + 0.1) / 1.4, 0, 1);
        const col = s === goal ? 'rgb(0,230,160)' : colorRamp(0.2 + 0.8 * t0);
        const base = [{ x: x - r, y: 0, z: z - r }, { x: x + r, y: 0, z: z - r }, { x: x + r, y: 0, z: z + r }, { x: x - r, y: 0, z: z + r }];
        const top = base.map(p => ({ x: p.x, y: h, z: p.z }));
        for (let k = 0; k < 4; k++) {
          const k2 = (k + 1) % 4;
          const A = prj(base[k]), B2 = prj(base[k2]), Cc = prj(top[k2]), Dd = prj(top[k]);
          ctx.fillStyle = col; ctx.globalAlpha = 0.5;
          ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B2.x, B2.y); ctx.lineTo(Cc.x, Cc.y); ctx.lineTo(Dd.x, Dd.y); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
        }
        const t = top.map(prj);
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.moveTo(t[0].x, t[0].y);
        for (let k = 1; k < 4; k++) ctx.lineTo(t[k].x, t[k].y);
        ctx.closePath(); ctx.fill();
        if (s === goal || s === start) text(ctx, s === goal ? 'G' : 'S', (t[0].x + t[2].x) / 2, (t[0].y + t[2].y) / 2, '#0c1224', 'center', 13);
      });
      if (path.length > 1) {
        ctx.strokeStyle = C.magenta; ctx.lineWidth = 3;
        ctx.beginPath();
        path.forEach((s, i) => { const p = prj({ x: colX(s), y: hOf(s) + 0.12, z: colZ(s) }); if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
        ctx.stroke();
      }
      text(ctx, '柱高 = 状态价值 max Q　拖拽旋转', 70, 30, C.yellow, 'left', 13);
      text(ctx, path.length > 1 && path[path.length - 1] === goal ? '已学会最短路径（' + (path.length - 1) + ' 步）· 粉线 = 贪婪策略' : '点「训练」开始试错学习（平地 → 价值地形）', 70, H - 34, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeButton('训练', train, true));
    d.controls.appendChild(makeButton('重置', () => { Q = Array.from({ length: N }, () => [0, 0, 0, 0]); path = []; draw(); }));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 迁移学习
  // ============================================================
  function transfer(container) {
    const d = demoShell('迁移学习 · 微调对比演示', '同一分类任务：从零训练 vs 预训练权重微调，看后者的损失曲线起点更低、收敛更快。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 360);
    const rng = makeRng(9494);
    // 2D 二分类数据
    const data = [];
    for (let i = 0; i < 50; i++) data.push({ x: -1 + gauss(rng) * 0.6, y: gauss(rng) * 1.2, label: 0 });
    for (let i = 0; i < 50; i++) data.push({ x: 1 + gauss(rng) * 0.6, y: gauss(rng) * 1.2, label: 1 });
    function loss(w, b) { let L = 0; for (const p of data) { const z = w * p.x + b; const pred = 1 / (1 + Math.exp(-z)); L += -(p.label * Math.log(pred + 1e-9) + (1 - p.label) * Math.log(1 - pred + 1e-9)); } return L / data.length; }
    function trainCurve(w0, b0, lr, iters) { let w = w0, b = b0, curve = []; for (let it = 0; it <= iters; it++) { if (it % 10 === 0) curve.push(loss(w, b)); let gw = 0, gb = 0; for (const p of data) { const pred = 1 / (1 + Math.exp(-(w * p.x + b))); gw += (pred - p.label) * p.x; gb += (pred - p.label); } w -= lr * gw / data.length; b -= lr * gb / data.length; } return curve; }
    // 预训练：在「旋转」过的相似数据上先学，得到接近真相的初始化
    let w = 0.8, b = 0.2;
    const fromScratch = trainCurve(0, 0, 0.4, 300);
    const fineTune = trainCurve(w, b, 0.4, 300);
    const toX = i => 60 + i / fromScratch.length * (W - 120);
    const toY = v => H - 60 - v / 0.8 * (H - 120);
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(60, toY(0)); ctx.lineTo(W - 60, toY(0)); ctx.stroke();
      [['从零训练', fromScratch, C.red], ['预训练+微调', fineTune, C.green]].forEach(([name, curve, col]) => {
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
        curve.forEach((v, i) => { const x = toX(i), y = toY(v); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
        ctx.stroke();
        text(ctx, name + '（终点损失 ' + round(curve[curve.length - 1], 3) + '）', 70 + (name === '从零训练' ? 0 : 260), 30, col, 'left', 12);
      });
      text(ctx, '预训练已在大数据上学到通用特征，微调从更低的损失起步', 70, H - 40, C.text, 'left', 12);
    }
    draw();
  }

  // ============================================================
  // 推荐系统
  // ============================================================
  function recsys(container) {
    const d = demoShell('推荐系统 · 协同过滤演示', '一个小型用户-物品评分矩阵，点缺失格看基于物品的协同过滤如何预测评分。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 340);
    const users = ['小明', '小红', '小刚', '小美', '小李'];
    const items = ['电影A', '电影B', '电影C', '电影D', '电影E'];
    const R = [
      [5, 3, 0, 4, 0],
      [4, 0, 0, 2, 5],
      [0, 4, 3, 0, 4],
      [5, 4, 0, 3, 0],
      [0, 0, 5, 0, 3]
    ];
    let sel = null;
    function cosSim(a, b) {
      const both = a.map((v, i) => i).filter(i => a[i] !== 0 && b[i] !== 0);
      if (both.length < 2) return 0;
      let num = 0, na = 0, nb = 0;
      for (const i of both) { num += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
      return num / (Math.sqrt(na) * Math.sqrt(nb));
    }
    function predict(u, it) {
      let num = 0, den = 0;
      for (let j = 0; j < items.length; j++) {
        if (j === it || R[u][j] === 0) continue;
        const sim = cosSim(R.map(r => r[it]), R.map(r => r[j]));
        num += sim * R[u][j]; den += Math.abs(sim);
      }
      return den === 0 ? 0 : num / den;
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const cell = 44, gap = 4, x0 = 90, y0 = 60;
      items.forEach((t, j) => text(ctx, t, x0 + 20 + j * (cell + gap), y0 - 16, C.cyan, 'center', 11));
      users.forEach((t, i) => text(ctx, t, x0 - 8, y0 + i * (cell + gap) + cell / 2, C.cyan, 'right', 12));
      for (let i = 0; i < users.length; i++) for (let j = 0; j < items.length; j++) {
        const v = R[i][j];
        const x = x0 + j * (cell + gap), y = y0 + i * (cell + gap);
        ctx.fillStyle = v === 0 ? '#142038' : 'rgba(0,212,255,' + (v / 5 * 0.5) + ')';
        ctx.fillRect(x, y, cell, cell);
        ctx.strokeStyle = (sel && sel[0] === i && sel[1] === j) ? C.yellow : C.axis;
        ctx.lineWidth = (sel && sel[0] === i && sel[1] === j) ? 2 : 1;
        ctx.strokeRect(x, y, cell, cell);
        text(ctx, v === 0 ? '·' : String(v), x + cell / 2, y + cell / 2, v === 0 ? C.text : '#e9eefb', 'center', 14);
      }
      if (sel) {
        const p = predict(sel[0], sel[1]);
        text(ctx, '预测 ' + users[sel[0]] + ' 对 ' + items[sel[1]] + ' 的评分 ≈ ' + round(p, 2) + '（相似物品加权平均）', 90, H - 40, C.yellow, 'left', 12);
      } else {
        text(ctx, '点击任意「·」（缺失评分），看如何用相似物品补全', 90, H - 40, C.text, 'left', 12);
      }
    }
    d.canvas.addEventListener('click', e => {
      const r = d.canvas.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H;
      const cell = 44, gap = 4, x0 = 90, y0 = 60;
      const j = Math.floor((px - x0) / (cell + gap)), i = Math.floor((py - y0) / (cell + gap));
      if (i >= 0 && i < users.length && j >= 0 && j < items.length && R[i][j] === 0) { sel = [i, j]; draw(); }
    });
    draw();
  }

  // ============================================================
  // 异常检测
  // ============================================================
  function anomaly(container) {
    const d = demoShell('异常检测 · 3D 密度阈值', '拖拽旋转；用 3D 高斯拟合正常数据，拖 ε 看哪些点被判为异常，绿网是高密度等值面。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(9595);
    const normal = [];
    for (let i = 0; i < 90; i++) normal.push([gauss(rng) * 1.6, gauss(rng) * 1.1, gauss(rng) * 0.8]);
    const outliers = [[4.5, 3.0, 2.0], [-4.0, -3.0, -2.2], [4.2, -3.0, 2.5], [-4.2, 3.2, -2.0], [0.6, 4.0, 2.8]];
    let eps = 0.05;
    const m = [0, 1, 2].map(j => normal.reduce((s, p) => s + p[j], 0) / normal.length);
    const sd = [0, 1, 2].map(j => Math.sqrt(normal.reduce((s, p) => s + (p[j] - m[j]) ** 2, 0) / normal.length));
    const state = { yaw: -0.5, pitch: 0.3 };
    const dens = p => Math.exp(-0.5 * ((p[0] - m[0]) ** 2 / (sd[0] * sd[0]) + (p[1] - m[1]) ** 2 / (sd[1] * sd[1]) + (p[2] - m[2]) ** 2 / (sd[2] * sd[2])));
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      const wpt = p => ({ x: p[0] * 0.5, y: p[1] * 0.5, z: p[2] * 0.5 });
      // 高斯等值椭球（3 层线框）
      for (const r of [1.0, 1.8, 2.6]) {
        ctx.strokeStyle = 'rgba(0,230,160,0.3)'; ctx.lineWidth = 1;
        for (let la = 0; la < 3; la++) {
          const ph = -1 + la, rr = Math.sqrt(Math.max(0, 1 - ph * ph));
          ctx.beginPath();
          for (let k = 0; k <= 36; k++) {
            const a = k / 36 * 2 * Math.PI;
            const pp = prj(wpt([m[0] + r * sd[0] * rr * Math.cos(a), m[1] + r * sd[1] * ph, m[2] + r * sd[2] * rr * Math.sin(a)]));
            if (k === 0) ctx.moveTo(pp.x, pp.y); else ctx.lineTo(pp.x, pp.y);
          }
          ctx.stroke();
        }
        for (let lo = 0; lo < 3; lo++) {
          const a = lo / 3 * Math.PI;
          ctx.beginPath();
          for (let k = 0; k <= 36; k++) {
            const ph = -1 + k / 36 * 2, rr = Math.sqrt(Math.max(0, 1 - ph * ph));
            const pp = prj(wpt([m[0] + r * sd[0] * rr * Math.cos(a), m[1] + r * sd[1] * ph, m[2] + r * sd[2] * rr * Math.sin(a)]));
            if (k === 0) ctx.moveTo(pp.x, pp.y); else ctx.lineTo(pp.x, pp.y);
          }
          ctx.stroke();
        }
      }
      const all = [...normal, ...outliers];
      const order = all.map((p, i) => ({ i, z: rot(wpt(p)).z })).sort((a, b) => a.z - b.z);
      let nAnom = 0;
      for (const o of order) {
        const p = all[o.i]; const dns = dens(p); const isAnom = dns < eps;
        if (isAnom) nAnom++;
        const pp = prj(wpt(p));
        ctx.fillStyle = isAnom ? C.red : C.cyan;
        ctx.beginPath(); ctx.arc(pp.x, pp.y, (isAnom ? 5.5 : 3.6) * pp.s / 57, 0, 7); ctx.fill();
      }
      text(ctx, '密度阈值 ε = ' + round(eps, 3) + '　判为异常 = ' + nAnom + ' 个　拖拽旋转', 70, 30, C.yellow, 'left', 13);
      text(ctx, '红点=异常（密度低于 ε）· 蓝点=正常 · 绿网=高斯等值面', 70, H - 36, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(0.001, 0.4, 0.001, eps, v => { eps = v; draw(); }, 'ε'));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 特征工程
  // ============================================================
  function feature(container) {
    const d = demoShell('特征工程 · 变换演示', '切换原始/对数/标准化，看同一批长尾数据经过变换后分布如何变得更好用。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 340);
    const rng = makeRng(9696);
    const raw = [];
    for (let i = 0; i < 500; i++) raw.push(Math.exp(gauss(rng) * 1.0));
    let mode = 'log';
    function transform() {
      if (mode === 'raw') return raw.slice();
      if (mode === 'log') return raw.map(v => Math.log(v));
      const l = raw.map(v => Math.log(v)); const m = l.reduce((a, b) => a + b, 0) / l.length; const sd = Math.sqrt(l.reduce((s, v) => s + (v - m) ** 2, 0) / l.length); return l.map(v => (v - m) / sd);
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const vals = transform();
      const mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
      const bins = 30, hist = new Array(bins).fill(0);
      vals.forEach(v => { const b = clamp(Math.floor((v - mn) / (mx - mn + 1e-9) * bins), 0, bins - 1); hist[b]++; });
      const maxH = Math.max.apply(null, hist);
      for (let i = 0; i < bins; i++) {
        const x = 60 + i / bins * (W - 120), w = (W - 120) / bins, hh = hist[i] / maxH * (H - 140);
        ctx.fillStyle = 'rgba(0,212,255,0.5)'; ctx.fillRect(x, H - 70 - hh, w - 1, hh);
      }
      const names = { raw: '原始（长尾，右偏）', log: '对数变换（拉近正态）', z: '标准化（零均值单位方差）' };
      text(ctx, names[mode], 70, 30, C.yellow, 'left', 13);
      text(ctx, '模型（尤其线性/距离类）更喜欢接近正态、尺度统一的特征', 70, H - 40, C.text, 'left', 12);
    }
    d.controls.appendChild(makeSelect([{ value: 'raw', label: '原始' }, { value: 'log', label: '对数' }, { value: 'z', label: '标准化' }], v => { mode = v; draw(); }));
    draw();
  }

  // ============================================================
  // 模型评估
  // ============================================================
  function evaluation(container) {
    const d = demoShell('评估 · ROC 与阈值演示', '拖动分类阈值，看混淆矩阵、精确率/召回与 ROC 曲线如何联动变化。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 360);
    const rng = makeRng(9797);
    const neg = [], pos = [];
    for (let i = 0; i < 60; i++) neg.push(-1 + gauss(rng) * 1.0);
    for (let i = 0; i < 60; i++) pos.push(1 + gauss(rng) * 1.0);
    let thr = 0;
    const toX = x => 60 + (x + 4) / 8 * (W - 120);
    const toY = y => H - 60 - y * (H - 140);
    function metrics(t) {
      const TP = pos.filter(v => v >= t).length, FN = pos.length - TP;
      const FP = neg.filter(v => v >= t).length, TN = neg.length - FP;
      const P = TP / (TP + FP || 1), R = TP / (TP + FN || 1);
      return { TP, FP, FN, TN, P, R, FPR: FP / (FP + TN || 1), TPR: R };
    }
    function rocCurve() {
      const pts = [];
      const all = [...neg, ...pos].sort((a, b) => b - a);
      for (const t of all) { const m = metrics(t + 1e-9); pts.push([m.FPR, m.TPR]); }
      pts.unshift([0, 0]); pts.push([1, 1]);
      return pts;
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const m = metrics(thr);
      // 分数直方图
      neg.forEach(v => { ctx.fillStyle = 'rgba(0,212,255,0.4)'; ctx.fillRect(toX(v), H - 70, 4, -8); });
      pos.forEach(v => { ctx.fillStyle = 'rgba(255,122,198,0.4)'; ctx.fillRect(toX(v), H - 60, 4, -8); });
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(toX(thr), 60); ctx.lineTo(toX(thr), H - 70); ctx.stroke();
      text(ctx, '阈值 = ' + round(thr, 2), toX(thr) + 4, 70, C.yellow, 'left', 11);
      // ROC 曲线
      const roc = rocCurve();
      const rx = fpr => 60 + fpr * 160, ry = tpr => H - 60 - tpr * 160;
      ctx.strokeStyle = C.axis; ctx.strokeRect(60, H - 220, 160, 160);
      ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath();
      roc.forEach((p, i) => { if (i === 0) ctx.moveTo(rx(p[0]), ry(p[1])); else ctx.lineTo(rx(p[0]), ry(p[1])); });
      ctx.stroke();
      ctx.fillStyle = C.magenta; ctx.beginPath(); ctx.arc(rx(m.FPR), ry(m.TPR), 5, 0, 7); ctx.fill();
      text(ctx, 'ROC', 140, H - 232, C.text, 'center', 10);
      // 指标
      const lx = 300;
      text(ctx, '混淆矩阵：TP=' + m.TP + ' FP=' + m.FP, lx, 90, C.text, 'left', 12);
      text(ctx, '　　　　　FN=' + m.FN + ' TN=' + m.TN, lx, 108, C.text, 'left', 12);
      text(ctx, '精确率 Precision = ' + round(m.P, 3), lx, 134, C.cyan, 'left', 13);
      text(ctx, '召回率 Recall = ' + round(m.R, 3), lx, 154, C.magenta, 'left', 13);
      text(ctx, 'F1 = ' + round(2 * m.P * m.R / (m.P + m.R || 1), 3), lx, 174, C.green, 'left', 13);
      text(ctx, 'FPR=' + round(m.FPR, 3) + ' TPR=' + round(m.TPR, 3), lx, 194, C.orange, 'left', 12);
    }
    d.controls.appendChild(makeRange(-3, 3, 0.05, thr, v => { thr = v; draw(); }, '阈值'));
    draw();
  }

  // 导出
  // ============================================================
  // CV · ResNet 残差连接
  // ============================================================
  function resnet(container) {
    const d = demoShell('ResNet · 残差连接演示', '切换「普通网络 / 残差网络」，看信号穿过深层时，残差跳连如何保住它不退化为零。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    let N = 16, mode = 'residual';
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const py = 70, bw = 26, gap = 6, x0 = 60;
      for (let l = 0; l < N; l++) {
        const x = x0 + l * (bw + gap);
        const s = mode === 'plain' ? Math.pow(0.68, l) : 1.0;
        ctx.fillStyle = mode === 'plain' ? C.cyan : C.magenta;
        ctx.globalAlpha = 0.2 + 0.8 * s;
        ctx.fillRect(x, py, bw, 38);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = C.axis; ctx.strokeRect(x, py, bw, 38);
        if (mode === 'residual' && l > 0) {
          const prevX = x0 + (l - 1) * (bw + gap) + bw;
          ctx.strokeStyle = 'rgba(255,224,102,0.7)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(prevX, py + 4);
          ctx.quadraticCurveTo((prevX + x) / 2, py - 14, x, py + 4); ctx.stroke();
        }
      }
      text(ctx, mode === 'plain' ? '普通网络：每层压缩信号 ×0.68，越深越弱' : '残差网络：跳连保留信号（F(x)→0 时退化为恒等）', 60, py + 56, C.yellow, 'left', 12);
      const cx = 60, cw = W - 120, cy = 200, ch = 130;
      ctx.strokeStyle = C.axis; ctx.strokeRect(cx, cy, cw, ch);
      const curve = (color, fn) => {
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath();
        for (let l = 0; l <= N; l++) {
          const px = cx + l / N * cw, pyy = cy + ch - fn(l) * (ch - 16) - 8;
          if (l === 0) ctx.moveTo(px, pyy); else ctx.lineTo(px, pyy);
        }
        ctx.stroke();
      };
      curve('rgba(0,212,255,0.9)', l => Math.pow(0.68, l));
      curve('rgba(255,122,198,0.9)', () => 1);
      text(ctx, '—— 普通网络（信号衰减）', cx + 12, cy + 18, C.cyan, 'left', 11);
      text(ctx, '—— 残差网络（信号保留）', cx + 12, cy + 34, C.magenta, 'left', 11);
      text(ctx, '层深 →', cx + cw - 44, cy + ch - 8, C.text, 'left', 10);
    }
    d.controls.appendChild(makeRange(4, 24, 1, N, v => { N = v; draw(); }, '层数'));
    d.controls.appendChild(makeSelect([{ value: 'residual', label: '残差网络' }, { value: 'plain', label: '普通网络' }], v => { mode = v; draw(); }));
    draw();
  }

  // ============================================================
  // CV · YOLO 目标检测
  // ============================================================
  function yolo(container) {
    const d = demoShell('YOLO · 网格检测演示', '一张合成图被分成网格，看每个格子如何预测边界框与置信度，再经 NMS 去重。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const S = 5, cell = 120, ox = 70, oy = 70;
    const objs = [
      { cx: 1.5, cy: 1.5, w: 1.6, h: 1.2, label: 'car', color: '#ff6b6b', conf: 0.93 },
      { cx: 3.5, cy: 1.6, w: 1.0, h: 1.0, label: 'person', color: '#5c9bff', conf: 0.87 },
      { cx: 1.4, cy: 3.6, w: 1.4, h: 1.1, label: 'tree', color: '#00e6a0', conf: 0.71 }
    ];
    let showGrid = true, showNMS = false, thresh = 0.5;
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      if (showGrid) {
        ctx.strokeStyle = 'rgba(120,145,200,0.25)'; ctx.lineWidth = 1;
        for (let i = 0; i <= S; i++) {
          ctx.beginPath(); ctx.moveTo(ox + i * cell, oy); ctx.lineTo(ox + i * cell, oy + S * cell); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ox, oy + i * cell); ctx.lineTo(ox + S * cell, oy + i * cell); ctx.stroke();
        }
      }
      objs.forEach(o => {
        const bx = ox + (o.cx - o.w / 2) * cell, by = oy + (o.cy - o.h / 2) * cell, bw = o.w * cell, bh = o.h * cell;
        const on = o.conf >= thresh;
        ctx.globalAlpha = on ? 0.22 : 0.05; ctx.fillStyle = o.color; ctx.fillRect(bx, by, bw, bh);
        ctx.globalAlpha = on ? 1 : 0.3; ctx.strokeStyle = o.color; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
        ctx.globalAlpha = 1;
        const gx = ox + Math.floor(o.cx) * cell, gy = oy + Math.floor(o.cy) * cell;
        ctx.fillStyle = 'rgba(255,224,102,0.18)'; ctx.fillRect(gx, gy, cell, cell);
        ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(ox + o.cx * cell, oy + o.cy * cell, 4, 0, 7); ctx.fill();
        text(ctx, o.label + ' ' + round(o.conf, 2), bx, by - 8, o.color, 'left', 12);
      });
      if (showNMS) {
        const o = objs[0];
        const bx = ox + (o.cx - o.w / 2 - 0.15) * cell, by = oy + (o.cy - o.h / 2 - 0.15) * cell;
        ctx.strokeStyle = C.red; ctx.setLineDash([4, 4]); ctx.lineWidth = 2; ctx.strokeRect(bx, by, o.w * cell, o.h * cell); ctx.setLineDash([]);
        text(ctx, '重复框（IoU 过高 → 被 NMS 抑制）', bx, by - 22, C.red, 'left', 11);
      }
      text(ctx, '置信度阈值 = ' + round(thresh, 2) + '　黄格=负责该目标的网格', 70, 30, C.yellow, 'left', 13);
    }
    d.controls.appendChild(makeRange(0.1, 1, 0.05, thresh, v => { thresh = v; draw(); }, '阈值'));
    d.controls.appendChild(makeSelect([{ value: 'on', label: '显示网格' }, { value: 'off', label: '隐藏网格' }], v => { showGrid = v === 'on'; draw(); }));
    d.controls.appendChild(makeButton('NMS 去重', () => { showNMS = !showNMS; draw(); }, true));
    draw();
  }

  // ============================================================
  // CV · 图像分割 U-Net
  // ============================================================
  function segment(container) {
    const d = demoShell('分割 · 编码解码演示', '一张合成街景，切换「原图 / 分割掩码 / 叠加」，看逐像素类别如何被 U 形结构还原。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    let mode = 'overlay';
    function scene(mode) {
      const ox = 80, oy = 60, sw = 340, sh = 240;
      const sky = mode === 'mask' ? '#5c9bff' : (mode === 'overlay' ? 'rgba(92,155,255,0.5)' : '#1b2a4a');
      const sun = mode === 'mask' ? '#ffe066' : (mode === 'overlay' ? 'rgba(255,224,102,0.5)' : '#ffd75e');
      const road = mode === 'mask' ? '#a06bff' : (mode === 'overlay' ? 'rgba(160,107,255,0.5)' : '#232b3f');
      const tree = mode === 'mask' ? '#00e6a0' : (mode === 'overlay' ? 'rgba(0,230,160,0.5)' : '#0f4d37');
      const car = mode === 'mask' ? '#ff7ac6' : (mode === 'overlay' ? 'rgba(255,122,198,0.5)' : '#5a2440');
      ctx.fillStyle = sky; ctx.fillRect(ox, oy, sw, sh * 0.6);
      ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(ox + sw * 0.8, oy + sh * 0.22, 24, 0, 7); ctx.fill();
      ctx.fillStyle = road; ctx.fillRect(ox, oy + sh * 0.6, sw, sh * 0.4);
      ctx.fillStyle = tree; ctx.fillRect(ox + 30, oy + sh * 0.32, 50, sh * 0.28);
      ctx.fillStyle = car; ctx.fillRect(ox + sw * 0.42, oy + sh * 0.72, 90, 34);
      ctx.strokeStyle = C.axis; ctx.lineWidth = 1.5; ctx.strokeRect(ox, oy, sw, sh);
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      scene(mode);
      const ux = 480, uy = 60, uw = 240;
      const layers = [['编码', 4, C.cyan], ['编码', 3, C.cyan], ['瓶颈', 1, C.orange], ['解码', 3, C.magenta], ['解码', 4, C.magenta]];
      let y = uy;
      layers.forEach(([t, sz, col]) => {
        const w = 40 + sz * 22, x = ux + (uw - w) / 2;
        ctx.fillStyle = col; ctx.globalAlpha = 0.3; ctx.fillRect(x, y, w, 26); ctx.globalAlpha = 1;
        ctx.strokeStyle = col; ctx.strokeRect(x, y, w, 26);
        text(ctx, t, x + w / 2, y + 13, C.white, 'center', 11);
        y += 38;
      });
      ctx.strokeStyle = 'rgba(255,224,102,0.5)'; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(ux + uw - 10, uy + 39); ctx.lineTo(ux + uw - 10, uy + 4 * 38 + 13); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, '跳连', ux + uw + 6, uy + 2 * 38 + 13, C.yellow, 'left', 11);
      const labels = { original: '原图', mask: '分割掩码（逐像素类别）', overlay: '叠加（半透明）' };
      text(ctx, '模式：' + labels[mode], 80, 320, C.yellow, 'left', 13);
      text(ctx, '左：U-Net 输入/输出　右：编码-解码结构（跳连保留细节）', 80, H - 36, C.text, 'left', 12);
    }
    d.controls.appendChild(makeSelect([
      { value: 'original', label: '原图' }, { value: 'mask', label: '分割掩码' }, { value: 'overlay', label: '叠加' }
    ], v => { mode = v; draw(); }));
    draw();
  }

  // ============================================================
  // CV · 数据增强
  // ============================================================
  function augment(container) {
    const d = demoShell('数据增强 · 变换演示', '一张简单图案，逐个切换翻转/旋转/裁剪/亮度/加噪，看它如何变出多张「新样本」。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 360);
    const st = { flipX: 1, flipY: 1, angle: 0, bright: 0, noise: false, crop: 0 };
    function shape() {
      const cx = W / 2, cy = H / 2 - 10;
      ctx.fillStyle = '#ffd75e';
      ctx.beginPath(); ctx.arc(cx, cy, 70, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - 52, cy - 42); ctx.lineTo(cx - 62, cy - 98); ctx.lineTo(cx - 8, cy - 70); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 52, cy - 42); ctx.lineTo(cx + 62, cy - 98); ctx.lineTo(cx + 8, cy - 70); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#0c1224';
      ctx.beginPath(); ctx.arc(cx - 26, cy - 10, 10, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 26, cy - 10, 10, 0, 7); ctx.fill();
      ctx.strokeStyle = '#0c1224'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx - 12, cy + 30); ctx.quadraticCurveTo(cx, cy + 42, cx + 12, cy + 30); ctx.stroke();
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      ctx.save();
      ctx.translate(W / 2, H / 2 - 10);
      ctx.scale(st.flipX, st.flipY);
      ctx.rotate(st.angle);
      ctx.translate(-W / 2, -(H / 2 - 10));
      ctx.translate(st.crop * 40, 0);
      ctx.scale(1 + st.crop * 0.3, 1 + st.crop * 0.3);
      shape();
      ctx.restore();
      if (st.bright !== 0) { ctx.fillStyle = st.bright > 0 ? 'rgba(255,255,255,' + st.bright * 0.25 + ')' : 'rgba(0,0,0,' + (-st.bright) * 0.25 + ')'; ctx.fillRect(0, 0, W, H); }
      if (st.noise) { for (let i = 0; i < 700; i++) { ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'; ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2); } }
      text(ctx, '翻转X=' + (st.flipX < 0 ? '是' : '否') + '　旋转=' + Math.round(st.angle / Math.PI * 180) + '°　亮度=' + st.bright + '　裁剪=' + st.crop + '　噪声=' + (st.noise ? '开' : '关'), 70, 30, C.yellow, 'left', 12);
    }
    d.controls.appendChild(makeButton('水平翻转', () => { st.flipX *= -1; draw(); }));
    d.controls.appendChild(makeButton('垂直翻转', () => { st.flipY *= -1; draw(); }));
    d.controls.appendChild(makeButton('旋转 30°', () => { st.angle += Math.PI / 6; draw(); }));
    d.controls.appendChild(makeButton('裁剪/缩放', () => { st.crop = (st.crop + 1) % 3; draw(); }));
    d.controls.appendChild(makeButton('亮度', () => { st.bright = (st.bright + 1) % 5 - 2; draw(); }));
    d.controls.appendChild(makeButton('加噪', () => { st.noise = !st.noise; draw(); }));
    d.controls.appendChild(makeButton('重置', () => { st.flipX = 1; st.flipY = 1; st.angle = 0; st.bright = 0; st.noise = false; st.crop = 0; draw(); }, true));
    draw();
  }

  // ============================================================
  // CV · ViT 补丁注意力
  // ============================================================
  function vit(container) {
    const d = demoShell('ViT · 补丁注意力演示', '一张图被切成补丁，点击某个补丁看它「最关注」哪些其他补丁（注意力权重）。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const P = 4, cell = 70, ox = 90, oy = 70;
    const img = [];
    for (let i = 0; i < P; i++) { img.push([]); for (let j = 0; j < P; j++) {
      let c;
      if (i < 2) c = [40, 90, 160]; else c = [30, 120, 70];
      if (i === 1 && j === 3) c = [255, 215, 90];
      img[i].push(c);
    } }
    let qi = 1, qj = 3;
    const emb = (i, j) => img[i][j].map(v => v / 255);
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      for (let i = 0; i < P; i++) for (let j = 0; j < P; j++) {
        const c = img[i][j];
        ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
        ctx.fillRect(ox + j * cell, oy + i * cell, cell - 4, cell - 4);
        if (i === qi && j === qj) { ctx.strokeStyle = C.yellow; ctx.lineWidth = 3; ctx.strokeRect(ox + j * cell, oy + i * cell, cell - 4, cell - 4); }
      }
      const q = emb(qi, qj);
      const ws = [];
      for (let i = 0; i < P; i++) for (let j = 0; j < P; j++) {
        const e = emb(i, j);
        const dot = q[0] * e[0] + q[1] * e[1] + q[2] * e[2];
        ws.push({ i, j, sim: Math.exp(dot * 8) });
      }
      const Z = ws.reduce((s, o) => s + o.sim, 0);
      ws.forEach(o => {
        if (o.i === qi && o.j === qj) return;
        const a = { x: ox + qj * cell + (cell - 4) / 2, y: oy + qi * cell + (cell - 4) / 2 };
        const b = { x: ox + o.j * cell + (cell - 4) / 2, y: oy + o.i * cell + (cell - 4) / 2 };
        const w = o.sim / Z;
        ctx.strokeStyle = 'rgba(255,122,198,' + (0.1 + 0.9 * w) + ')';
        ctx.lineWidth = 0.5 + w * 5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      const top = ws.slice().sort((a, b) => b.sim - a.sim).slice(0, 4);
      let y = 70;
      top.forEach(o => {
        const w = o.sim / Z;
        text(ctx, 'patch(' + o.i + ',' + o.j + ')　α=' + round(w, 3), 430, y, C.magenta, 'left', 11);
        ctx.fillStyle = 'rgba(255,122,198,0.4)'; ctx.fillRect(570, y - 6, w * 150, 10);
        y += 24;
      });
      text(ctx, '点击补丁查看注意力：query = patch(' + qi + ',' + qj + ')', 70, 30, C.yellow, 'left', 12);
    }
    d.canvas.addEventListener('click', e => {
      const r = d.canvas.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width * W, py = (e.clientY - r.top) / r.height * H;
      qj = clamp(Math.floor((px - ox) / cell), 0, P - 1); qi = clamp(Math.floor((py - oy) / cell), 0, P - 1);
      draw();
    });
    draw();
  }

  // ============================================================
  // 生成 · VAE 隐空间
  // ============================================================
  function vae(container) {
    const d = demoShell('VAE · 隐空间插值演示', '隐空间点自动游走，看解码结果在「圆/方/三角」之间平滑渐变——这就是连续隐空间。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 360);
    const S = 6;
    const shapes = {
      circle: [[0,0,1,1,0,0],[0,1,0,0,1,0],[1,0,0,0,0,1],[1,0,0,0,0,1],[0,1,0,0,1,0],[0,0,1,1,0,0]],
      square: [[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1],[1,1,1,1,1,1]],
      triangle: [[0,0,1,1,0,0],[0,0,1,1,0,0],[0,1,1,1,1,0],[0,1,1,1,1,0],[1,1,1,1,1,1],[1,1,1,1,1,1]]
    };
    const centers = { circle: [-0.7, 0.2], square: [0.7, -0.4], triangle: [0, 0.8] };
    const cols = { circle: [0,212,255], square: [255,184,92], triangle: [0,230,160] };
    const keys = Object.keys(shapes);
    let z = { x: 0, y: 0 }, t = 0, sig = 0.15;
    const lw = 280, lh = 220, lx = 70, ly = 60;
    function decode() {
      const sims = keys.map(k => Math.exp(-((z.x - centers[k][0]) ** 2 + (z.y - centers[k][1]) ** 2) / 0.35));
      const Z = sims.reduce((a, b) => a + b, 0);
      return keys.map((k, i) => sims[i] / Z);
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H,40);
      ctx.strokeStyle = C.axis; ctx.strokeRect(lx, ly, lw, lh);
      const w = decode();
      keys.forEach((k, i) => {
        const c = centers[k];
        const p = { x: lx + lw / 2 + c[0] * 100, y: ly + lh / 2 - c[1] * 100 };
        ctx.fillStyle = 'rgb(' + cols[k][0] + ',' + cols[k][1] + ',' + cols[k][2] + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, 7); ctx.fill();
        text(ctx, k === 'circle' ? '圆' : (k === 'square' ? '方' : '三角'), p.x, p.y + 18, C.text, 'center', 10);
      });
      const zp = { x: lx + lw / 2 + z.x * 100, y: ly + lh / 2 - z.y * 100 };
      ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(zp.x, zp.y, 5, 0, 7); ctx.fill();
      ctx.strokeStyle = C.yellow; ctx.beginPath(); ctx.arc(zp.x, zp.y, sig * 100, 0, 7); ctx.stroke();
      text(ctx, '隐空间（2D）· 黄圈=采样噪声 σ', lx, ly - 10, C.text, 'left', 12);
      const gx = 420, gy = 60, cs = 30;
      for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) {
        let r = 0, g = 0, b = 0;
        keys.forEach((k, ki) => { const v = shapes[k][i][j]; r += w[ki] * cols[k][0] * v; g += w[ki] * cols[k][1] * v; b += w[ki] * cols[k][2] * v; });
        ctx.fillStyle = 'rgb(' + Math.round(r) + ',' + Math.round(g) + ',' + Math.round(b) + ')';
        ctx.fillRect(gx + j * cs, gy + i * cs, cs - 2, cs - 2);
      }
      text(ctx, '解码 p(x|z)', gx, gy - 10, C.text, 'left', 12);
      text(ctx, '权重：圆 ' + round(w[0], 2) + '　方 ' + round(w[1], 2) + '　三角 ' + round(w[2], 2), gx, gy + S * cs + 18, C.yellow, 'left', 12);
      text(ctx, 'z = μ + σ·ε（σ=' + round(sig, 2) + '）· 采样点自动游走', 70, H - 36, C.text, 'left', 12);
    }
    function loop() { t += 0.008; z.x = 0.85 * Math.cos(t); z.y = 0.65 * Math.sin(2 * t); draw(); requestAnimationFrame(loop); }
    d.controls.appendChild(makeRange(0, 0.5, 0.01, sig, v => { sig = v; draw(); }, 'σ'));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 生成 · 扩散模型 DDPM
  // ============================================================
  function diffusion(container) {
    const d = demoShell('扩散 · 3D 点云加噪去噪', '拖拽旋转；拖动 t 看一个 3D 甜甜圈如何被打散成噪声云、再重新聚拢成形。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 400);
    const rng = makeRng(4242);
    const NUM = 320, R = 1.0, r0 = 0.36;
    const p0 = [], eps = [], hues = [];
    for (let i = 0; i < NUM; i++) {
      const th = rng() * 2 * Math.PI, ph = rng() * 2 * Math.PI;
      p0.push([(R + r0 * Math.cos(ph)) * Math.cos(th), r0 * Math.sin(ph), (R + r0 * Math.cos(ph)) * Math.sin(th)]);
      eps.push([gauss(rng) * 0.85, gauss(rng) * 0.85, gauss(rng) * 0.85]);
      hues.push(th / (2 * Math.PI));
    }
    let t = 0, anim = null;
    const state = { yaw: -0.6, pitch: 0.45 };
    function ptAt(i) {
      const abar = Math.max(0, 1 - t);
      const a = Math.sqrt(abar), b = Math.sqrt(1 - abar);
      return { x: a * p0[i][0] + b * eps[i][0], y: a * p0[i][1] + b * eps[i][1], z: a * p0[i][2] + b * eps[i][2] };
    }
    function draw() {
      clear(ctx, W, H);
      const cx = W / 2, cy = H / 2, f = 520, dd = 9;
      const rot = p => rotate3(p, state.yaw, state.pitch);
      const prj = p => proj3(rot(p), cx, cy, f, dd);
      const items = [];
      for (let i = 0; i < NUM; i++) { const p = ptAt(i); items.push({ p: p, z: rot(p).z, h: hues[i] }); }
      items.sort((a, b) => a.z - b.z);
      items.forEach(it => {
        const pp = prj(it.p);
        ctx.fillStyle = 'rgb(' + Math.round(255 * it.h) + ',' + Math.round(120 + 80 * (1 - it.h)) + ',' + Math.round(255 - 200 * it.h) + ')';
        ctx.beginPath(); ctx.arc(pp.x, pp.y, 3.0 * pp.s / 57, 0, 7); ctx.fill();
      });
      const bx = 70, by = H - 64, bw = 400;
      ctx.fillStyle = C.axis; ctx.fillRect(bx, by, bw, 12);
      ctx.fillStyle = C.magenta; ctx.fillRect(bx, by, bw * t, 12);
      text(ctx, '噪声占比 √(1−ᾱ_t)', bx, by - 12, C.text, 'left', 11);
      text(ctx, 't = ' + round(t, 2) + (t < 0.15 ? '　≈ 清晰数据 x₀' : t > 0.85 ? '　≈ 纯噪声 x_T' : '　中间态 x_t'), 70, 30, C.yellow, 'left', 13);
      text(ctx, 'x_t = √ᾱ_t·x₀ + √(1−ᾱ_t)·ε　颜色=原始环向角度　拖拽旋转', 70, H - 34, C.text, 'left', 12);
    }
    function loop() { if (!state.dragging) state.yaw += 0.004; draw(); requestAnimationFrame(loop); }
    makeOrbit(d.canvas, state, draw);
    d.controls.appendChild(makeRange(0, 1, 0.01, t, v => { t = v; draw(); }, 't'));
    d.controls.appendChild(makeButton('正向加噪', () => {
      if (anim) clearInterval(anim); let tt = t;
      anim = setInterval(() => { tt += 0.02; if (tt >= 1) { tt = 1; clearInterval(anim); anim = null; } t = tt; draw(); }, 30);
    }, true));
    d.controls.appendChild(makeButton('逆向去噪', () => {
      if (anim) clearInterval(anim); let tt = t;
      anim = setInterval(() => { tt -= 0.02; if (tt <= 0) { tt = 0; clearInterval(anim); anim = null; } t = tt; draw(); }, 30);
    }));
    draw();
    if (!(typeof navigator !== 'undefined' && navigator.webdriver)) requestAnimationFrame(loop);
  }

  // ============================================================
  // 生成 · 文生图 Stable Diffusion
  // ============================================================
  function sd(container) {
    const d = demoShell('文生图 · 流水线演示', '切换 prompt，看潜空间从噪声逐步去噪，最后 VAE 解码出对应像素图。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const rng = makeRng(5151);
    const N = 12;
    const mk = fn => { const g = []; for (let i = 0; i < N; i++) { g.push([]); for (let j = 0; j < N; j++) g[i].push(fn(i, j) ? 1 : 0); } return g; };
    const targets = {
      cat: mk((i, j) => (Math.abs(i - 3) < 1.5 && (j > 2 && j < 5 || j > 7 && j < 10)) || (i > 4 && i < 9 && Math.abs(j - 6) < 3)),
      mountain: mk((i, j) => (i > 3 && Math.abs(j - 6) < (i - 3) * 1.3) || i > 8),
      boat: mk((i, j) => (i > 5 && i < 9 && Math.abs(j - 6) < (i - 4)) || (i > 2 && i < 7 && j < 6 && j > 3))
    };
    const noise = [];
    for (let i = 0; i < N; i++) { noise.push([]); for (let j = 0; j < N; j++) noise[i].push(gauss(rng)); }
    let prompt = 'cat', t = 0.5;
    const labels = { cat: 'a cat', mountain: 'a mountain', boat: 'a boat' };
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const stages = ['文本 prompt', 'CLIP 编码', 'UNet 去噪(潜空间)', 'VAE 解码', '图像'];
      let sx = 60;
      stages.forEach((s, i) => {
        const col = i === 2 ? C.magenta : C.axis;
        ctx.fillStyle = col; ctx.strokeStyle = col;
        ctx.fillRect(sx, 40, 120, 30); ctx.strokeRect(sx, 40, 120, 30);
        text(ctx, s, sx + 60, 55, C.white, 'center', 11);
        if (i < 4) { ctx.strokeStyle = C.text; ctx.beginPath(); ctx.moveTo(sx + 120, 55); ctx.lineTo(sx + 140, 55); ctx.stroke(); }
        sx += 140;
      });
      const target = targets[prompt];
      const abar = 1 - t, gx = 90, gy = 120, cs = 16;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const v = clamp(Math.sqrt(abar) * target[i][j] + Math.sqrt(1 - abar) * noise[i][j], 0, 1);
        const g = Math.round(v * 255);
        ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')';
        ctx.fillRect(gx + j * cs, gy + i * cs, cs - 2, cs - 2);
      }
      text(ctx, '潜空间 z_t（去噪步 t=' + round(t, 2) + '）', gx, gy - 10, C.magenta, 'left', 12);
      const ox = 360, oy = 120;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        ctx.fillStyle = target[i][j] ? '#00d4ff' : '#16304a';
        ctx.fillRect(ox + j * cs, oy + i * cs, cs - 2, cs - 2);
      }
      text(ctx, 'VAE 解码图像（prompt: ' + labels[prompt] + '）', ox, oy - 10, C.cyan, 'left', 12);
      text(ctx, '真实 SD 在更小的潜空间（64×64）用 UNet 逐步预测噪声，这里用 12×12 示意', 60, H - 36, C.text, 'left', 11);
    }
    d.controls.appendChild(makeSelect([
      { value: 'cat', label: 'a cat' }, { value: 'mountain', label: 'a mountain' }, { value: 'boat', label: 'a boat' }
    ], v => { prompt = v; draw(); }));
    d.controls.appendChild(makeRange(0, 1, 0.02, t, v => { t = v; draw(); }, 't'));
    draw();
  }

  // ============================================================
  // 生成 · CLIP 图文对齐
  // ============================================================
  function clip(container) {
    const d = demoShell('CLIP · 图文对齐演示', '三张图与三个词映射到同一空间，点击切换，看匹配对的相似度远高于不匹配对。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const images = [
      { name: 'cat', color: '#00d4ff', p: { x: 120, y: 120 } },
      { name: 'dog', color: '#ff7ac6', p: { x: 280, y: 70 } },
      { name: 'car', color: '#00e6a0', p: { x: 250, y: 200 } }
    ];
    const texts = [
      { name: '一只猫', color: '#00d4ff', p: { x: 110, y: 112 } },
      { name: '一只狗', color: '#ff7ac6', p: { x: 290, y: 80 } },
      { name: '一辆车', color: '#00e6a0', p: { x: 240, y: 210 } }
    ];
    let sel = 0;
    const sim = (a, b) => Math.exp(-Math.hypot(a.p.x - b.p.x, a.p.y - b.p.y) / 60);
    function drawIcon(name, x, y, color) {
      ctx.save(); ctx.translate(x, y);
      if (name === 'cat') {
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, 14, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(-14, -16); ctx.lineTo(-2, -12); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(10, -6); ctx.lineTo(14, -16); ctx.lineTo(2, -12); ctx.closePath(); ctx.fill();
      } else if (name === 'dog') {
        ctx.fillStyle = color; ctx.beginPath(); ctx.arc(0, 0, 14, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(16, -2); ctx.lineTo(14, 4); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(-18, 8); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fill();
      } else {
        ctx.fillStyle = color; ctx.fillRect(-16, -8, 32, 16);
        ctx.fillStyle = '#0c1224'; ctx.beginPath(); ctx.arc(-8, 8, 5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(8, 8, 5, 0, 7); ctx.fill();
      }
      ctx.restore();
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const mx = 60, my = 60, cs = 60;
      texts.forEach((t, ri) => images.forEach((im, ci) => {
        const s = sim(im, t), v = Math.round(s * 255);
        ctx.fillStyle = 'rgb(' + v + ',' + Math.round(v * 0.5) + ',' + Math.round(v * 0.9) + ')';
        ctx.fillRect(mx + ci * cs, my + ri * cs, cs - 4, cs - 4);
        text(ctx, round(s, 2), mx + ci * cs + (cs - 4) / 2, my + ri * cs + (cs - 4) / 2, C.white, 'center', 10);
      }));
      text(ctx, '图×文 相似度矩阵', mx, my - 12, C.text, 'left', 11);
      const ox = 360, oy = 50;
      images.forEach(im => drawIcon(im.name, ox + im.p.x - 90, oy + im.p.y, im.color));
      texts.forEach(t => text(ctx, t.name, ox + t.p.x - 90, oy + t.p.y + 20, t.color, 'center', 11));
      const st = texts[sel];
      let best = 0, bs = -1;
      images.forEach((im, i) => { const s = sim(im, st); if (s > bs) { bs = s; best = i; } });
      const a = { x: ox + st.p.x - 90, y: oy + st.p.y };
      const b = { x: ox + images[best].p.x - 90, y: oy + images[best].p.y };
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 2; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, '选中「' + st.name + '」→ 最相似图：' + images[best].name, ox, oy + 250, C.yellow, 'left', 12);
      text(ctx, '对比学习：匹配对靠近（对角线亮），不匹配对远离', 60, H - 40, C.text, 'left', 12);
    }
    d.controls.appendChild(makeSelect(texts.map((t, i) => ({ value: String(i), label: t.name })), v => { sel = parseInt(v, 10); draw(); }));
    draw();
  }

  // ============================================================
  // LLM · Word2Vec 词向量
  // ============================================================
  function word2vec(container) {
    const d = demoShell('Word2Vec · 词向量空间演示', '在 2D 词向量空间里做「国王 − 男人 + 女人」，看结果落点如何接近「女王」。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 360);
    const words = {
      king: [0.05, 0.50], queen: [0.05, -0.50], man: [0.55, 0.50], woman: [0.55, -0.50],
      boy: [0.72, 0.55], girl: [0.72, -0.55], prince: [0.05, 0.60], princess: [0.05, -0.60]
    };
    const zh = { king: '国王', queen: '女王', man: '男人', woman: '女人', boy: '男孩', girl: '女孩', prince: '王子', princess: '公主' };
    let show = false;
    const ox = 120, oy = 50, sw = 340, sh = 260;
    function px(v) { return { x: ox + (v[0] + 0.6) / 1.5 * sw, y: oy + (0.8 - v[1]) / 1.6 * sh }; }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      ctx.strokeStyle = C.axis; ctx.strokeRect(ox, oy, sw, sh);
      text(ctx, '语义：水平≈「性别」　垂直≈「皇族 vs 平民」', ox, oy - 10, C.text, 'left', 11);
      for (const k in words) {
        const p = px(words[k]);
        ctx.fillStyle = (k === 'king' || k === 'queen' || k === 'prince' || k === 'princess') ? C.magenta : C.cyan;
        ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, 7); ctx.fill();
        text(ctx, zh[k], p.x, p.y + 20, C.text, 'center', 11);
      }
      if (show) {
        const k = px(words.king), m = px(words.man), w = px(words.woman), q = px(words.queen);
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(k.x, k.y); ctx.stroke(); // man→king（国王−男人）
        ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.lineTo(w.x + (k.x - m.x), w.y + (k.y - m.y)); ctx.stroke(); // woman + (king-man)
        ctx.strokeStyle = C.green; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(q.x, q.y, 14, 0, 7); ctx.stroke();
        text(ctx, '国王 − 男人 + 女人 ≈ 女王', 500, 90, C.green, 'left', 13);
        text(ctx, '① 黄箭头 = 「国王−男人」的位移', 500, 130, C.yellow, 'left', 12);
        text(ctx, '② 把该位移加在「女人」上', 500, 152, C.yellow, 'left', 12);
        text(ctx, '③ 落点恰好在「女王」附近（绿圈）', 500, 174, C.green, 'left', 12);
      } else {
        text(ctx, '点「国王 − 男人 + 女人」看语义运算', 500, 120, C.text, 'left', 12);
      }
    }
    d.controls.appendChild(makeButton('国王 − 男人 + 女人', () => { show = !show; draw(); }, true));
    draw();
  }

  // ============================================================
  // LLM · GPT 自回归
  // ============================================================
  function gpt(container) {
    const d = demoShell('GPT · 下一个词预测演示', '给一小段上文，看模型对下一个字符的概率分布，用温度采样生成——这就是自回归。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const corpus = 'the cat sat on the mat. the dog sat on the log. ';
    const chars = [...new Set(corpus.split(''))];
    const c2i = {}; chars.forEach((c, i) => c2i[c] = i);
    const counts = chars.map(() => new Array(chars.length).fill(0));
    for (let t = 0; t < corpus.length - 1; t++) counts[c2i[corpus[t]]][c2i[corpus[t + 1]]]++;
    let ctx0 = 'the ', T = 1.0;
    function probs() {
      const last = ctx0[ctx0.length - 1];
      const li = c2i[last];
      const row = counts[li] || counts[c2i[' ']];
      const tot = row.reduce((a, b) => a + b, 0) || 1;
      return chars.map((c, i) => ({ c: c === ' ' ? '␣' : c, p: row[i] / tot }));
    }
    function sample() {
      const p = probs();
      const logits = p.map(o => Math.log(o.p + 1e-9) / T);
      const m = Math.max.apply(null, logits);
      const ex = logits.map(l => Math.exp(l - m));
      const Z = ex.reduce((a, b) => a + b, 0);
      let r = Math.random() * Z, i = 0;
      for (; i < ex.length; i++) { r -= ex[i]; if (r <= 0) break; }
      const ch = chars[Math.min(i, chars.length - 1)];
      ctx0 += ch; draw();
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      text(ctx, '上文（生成中）:', 70, 40, C.text, 'left', 12);
      const wrap = ctx0.replace(/ /g, '␣');
      text(ctx, wrap.length > 60 ? wrap.slice(-60) : wrap, 70, 66, C.white, 'left', 16);
      const p = probs().sort((a, b) => b.p - a.p);
      const bx = 70, by = 110, bw = 620;
      ctx.strokeStyle = C.axis; ctx.strokeRect(bx, by, bw, 210);
      const maxp = p[0].p || 1;
      p.slice(0, 12).forEach((o, i) => {
        const y = by + 20 + i * 16;
        const w = o.p / maxp * (bw - 120);
        ctx.fillStyle = i === 0 ? C.green : C.cyan;
        ctx.fillRect(bx + 90, y - 8, w, 12);
        text(ctx, o.c, bx + 80, y, C.text, 'right', 12);
        text(ctx, round(o.p, 3), bx + 90 + w + 6, y, C.text, 'left', 11);
      });
      text(ctx, '下一个 token 概率分布 P(x_{t+1} | 上文)　温度 T = ' + round(T, 2), bx, by - 8, C.text, 'left', 11);
      text(ctx, '温度低→更确定（趋近贪婪）　温度高→更随机多样', 70, H - 36, C.text, 'left', 12);
    }
    d.controls.appendChild(makeRange(0.1, 2, 0.05, T, v => { T = v; draw(); }, 'T'));
    d.controls.appendChild(makeButton('采样下一个', sample, true));
    d.controls.appendChild(makeButton('重置', () => { ctx0 = 'the '; draw(); }));
    draw();
  }

  // ============================================================
  // LLM · LoRA 低秩分解
  // ============================================================
  function lora(container) {
    const d = demoShell('LoRA · 低秩分解演示', '看一个大权重矩阵如何被 A×B 低秩近似，拖动秩 r 对比参数量。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 360);
    const rng = makeRng(6363);
    const n = 12;
    const Wmat = Array.from({ length: n }, () => Array.from({ length: n }, () => rng() * 2 - 1));
    let r = 2;
    function heatmap(M, x, y, cs) {
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
        const v = clamp((M[i][j] + 1) / 2, 0, 1);
        const g = Math.round(v * 255);
        ctx.fillStyle = 'rgb(' + g + ',' + Math.round(g * 0.3) + ',' + Math.round(g * 0.8) + ')';
        ctx.fillRect(x + j * cs, y + i * cs, cs - 1, cs - 1);
      }
    }
    function lowRank() {
      const A = Array.from({ length: n }, () => Array.from({ length: r }, () => rng() * 0.4 - 0.2));
      const B = Array.from({ length: r }, () => Array.from({ length: n }, () => rng() * 0.4 - 0.2));
      const dW = Array.from({ length: n }, () => new Array(n).fill(0));
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { let s = 0; for (let k = 0; k < r; k++) s += A[i][k] * B[k][j]; dW[i][j] = s; }
      return dW;
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const dW = lowRank();
      const cs = 20, y = 80;
      heatmap(Wmat, 70, y, cs);
      text(ctx, '预训练权重 W（冻结）', 70, y - 10, C.cyan, 'left', 12);
      heatmap(dW, 360, y, cs);
      text(ctx, 'LoRA 更新 ΔW = A·B（低秩）', 360, y - 10, C.magenta, 'left', 12);
      const full = n * n, loraParams = (n + n) * r;
      const bx = 70, by = y + n * cs + 30, bw = 400;
      ctx.fillStyle = C.axis; ctx.fillRect(bx, by, bw, 18);
      ctx.fillStyle = C.cyan; ctx.fillRect(bx, by, bw, 18);
      text(ctx, '全量微调：' + full + ' 参数', bx + 8, by + 9, '#0c1224', 'left', 11);
      ctx.fillStyle = C.axis; ctx.fillRect(bx, by + 26, bw, 18);
      ctx.fillStyle = C.magenta; ctx.fillRect(bx, by + 26, bw * (loraParams / full), 18);
      text(ctx, 'LoRA(r=' + r + ')：' + loraParams + ' 参数（约 ' + round(loraParams / full * 100, 1) + '%）', bx + 8, by + 35, C.white, 'left', 11);
      text(ctx, 'ΔW 的秩 = r，r 越小越省参数，但容量越低', 70, H - 36, C.text, 'left', 12);
    }
    d.controls.appendChild(makeRange(1, 6, 1, r, v => { r = v; draw(); }, '秩 r'));
    draw();
  }

  // ============================================================
  // LLM · RLHF 偏好
  // ============================================================
  function rlhf(container) {
    const d = demoShell('RLHF · 偏好打分演示', '同一问题两个回答，点选你更喜欢的，看奖励模型如何累积人类偏好。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const prompt = '问题：请解释什么是「过拟合」。';
    const A = 'A：模型把训练数据背得太死，连噪声都记住了，到了新数据上表现就变差。';
    const B = 'B：过拟合嘛，就是训练集分数特别高、测试集分数特别低，总之就是模型学过头了，可能跟数据有关吧，具体我也不太确定。';
    let rA = 0, rB = 0, clicks = 0;
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const stages = ['SFT 监督微调', '奖励模型', 'PPO 优化'];
      let sx = 70;
      stages.forEach((s, i) => {
        const col = i === 1 ? C.magenta : C.axis;
        ctx.fillStyle = col; ctx.strokeStyle = col; ctx.fillRect(sx, 36, 130, 28); ctx.strokeRect(sx, 36, 130, 28);
        text(ctx, s, sx + 65, 50, C.white, 'center', 11);
        if (i < 2) { ctx.strokeStyle = C.text; ctx.beginPath(); ctx.moveTo(sx + 130, 50); ctx.lineTo(sx + 148, 50); ctx.stroke(); }
        sx += 148;
      });
      text(ctx, '（你现在扮演「奖励模型」：点选更喜欢的回答）', 530, 50, C.magenta, 'left', 11);
      // prompt
      text(ctx, prompt, 70, 110, C.yellow, 'left', 13);
      // 回答 A
      ctx.strokeStyle = C.axis; ctx.strokeRect(70, 130, 640, 60);
      ctx.fillStyle = 'rgba(0,230,160,0.08)'; ctx.fillRect(70, 130, 640, 60);
      text(ctx, A, 80, 148, C.green, 'left', 12);
      text(ctx, '奖励分 ' + round(rA, 1), 80, 176, C.green, 'left', 12);
      // 回答 B
      ctx.strokeStyle = C.axis; ctx.strokeRect(70, 200, 640, 60);
      ctx.fillStyle = 'rgba(255,107,107,0.08)'; ctx.fillRect(70, 200, 640, 60);
      text(ctx, B, 80, 218, C.red, 'left', 12);
      text(ctx, '奖励分 ' + round(rB, 1), 80, 246, C.red, 'left', 12);
      // 奖励条
      const bx = 70, by = 285, bw = 640;
      ctx.fillStyle = C.axis; ctx.fillRect(bx, by, bw, 14);
      ctx.fillStyle = C.green; ctx.fillRect(bx, by, bw * (rA / (rA + rB + 1e-6)), 14);
      text(ctx, '累计偏好：A ' + clicks + ' 次点击', bx, by + 30, C.text, 'left', 11);
      if (clicks > 0) text(ctx, '当前更偏好：' + (rA >= rB ? 'A（有帮助、简洁）' : 'B'), bx + 320, by + 30, C.yellow, 'left', 12);
      text(ctx, 'KL 惩罚防止模型只为刷分而过度偏离', 70, H - 36, C.text, 'left', 12);
    }
    d.controls.appendChild(makeButton('A 更好', () => { rA += 1; rB += 0.1; clicks++; draw(); }, true));
    d.controls.appendChild(makeButton('B 更好', () => { rB += 1; rA += 0.1; clicks++; draw(); }));
    d.controls.appendChild(makeButton('重置', () => { rA = 0; rB = 0; clicks = 0; draw(); }));
    draw();
  }

  // ============================================================
  // LLM · 提示工程
  // ============================================================
  function prompt(container) {
    const d = demoShell('提示工程 · 策略对比演示', '同一道题，切换「直接问 / 给例子 / 思维链」，看模型答案如何从错到对。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 360);
    const task = 'Roger 有 5 个网球，又买了 2 罐网球，每罐有 3 个。他现在一共有几个网球？';
    const strategies = {
      zero: { name: '直接问（零样本）', prompt: task, output: '7 个', verdict: '错：把「2 罐」误当「2 个」', color: C.red },
      few: { name: '给例子（少样本）', prompt: '示例：小明有 3 个苹果，买 2 盒、每盒 4 个，共 3+2×4=11 个。\n' + task, output: '11 个', verdict: '对：照示例学会了「先乘后加」', color: C.green },
      cot: { name: '思维链（CoT）', prompt: task + ' 请一步一步思考。', output: '2 罐 × 3 个 = 6 个；5 + 6 = 11 个。答案 11 个。', verdict: '对：显式推理步骤，还给出过程', color: C.green }
    };
    let mode = 'zero';
    function wrap(s, x, y, maxw) {
      const perLine = Math.max(10, Math.floor(maxw / 13));
      s.split('\n').forEach(seg => {
        let line = '';
        for (const ch of seg) {
          line += ch;
          if (line.length >= perLine) { text(ctx, line, x, y, C.text, 'left', 12); line = ''; y += 18; }
        }
        if (line) { text(ctx, line, x, y, C.text, 'left', 12); y += 18; }
      });
    }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const st = strategies[mode];
      text(ctx, '题目：' + task, 70, 40, C.yellow, 'left', 13);
      text(ctx, '策略：' + st.name, 70, 78, C.white, 'left', 12);
      ctx.strokeStyle = C.axis; ctx.strokeRect(70, 92, 640, 96);
      ctx.fillStyle = 'rgba(92,155,255,0.06)'; ctx.fillRect(70, 92, 640, 96);
      wrap(st.prompt, 80, 108, 610);
      text(ctx, '↑ 提示（prompt）', 70, 196, C.blue, 'left', 11);
      ctx.strokeStyle = C.axis; ctx.strokeRect(70, 210, 640, 72);
      ctx.fillStyle = 'rgba(0,230,160,0.06)'; ctx.fillRect(70, 210, 640, 72);
      text(ctx, st.output, 80, 232, st.color, 'left', 13);
      text(ctx, '↓ 模型输出　' + st.verdict, 80, 268, st.color, 'left', 11);
      text(ctx, '同一个模型，换一种问法，结果天差地别', 70, H - 36, C.text, 'left', 12);
    }
    d.controls.appendChild(makeSelect([
      { value: 'zero', label: '直接问' }, { value: 'few', label: '给例子' }, { value: 'cot', label: '思维链' }
    ], v => { mode = v; draw(); }));
    draw();
  }

  // ============================================================
  // Agent · RAG 检索增强生成
  // ============================================================
  function rag(container) {
    const d = demoShell('RAG · 检索生成演示', '选一个问题，看系统如何从文档库检索相关片段，再据此生成带出处的回答。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const docs = [
      { id: 'D1', text: '报销：差旅费需在 30 天内提交发票，超期不予受理。' },
      { id: 'D2', text: '年假：入职满一年享 5 天带薪年假，可结转至次年。' },
      { id: 'D3', text: '报销：住宿费上限每晚 500 元，需提供正式发票。' },
      { id: 'D4', text: '培训：每年提供 2000 元培训津贴，用于在线课程。' }
    ];
    const queries = {
      q1: { q: '出差住宿费能报多少？', answer: '住宿费上限每晚 500 元，需提供正式发票（出处 D3）。', keys: ['住宿', '报销', '发票'] },
      q2: { q: '我有多少天年假？', answer: '入职满一年享 5 天带薪年假，可结转至次年（出处 D2）。', keys: ['年假', '带薪', '入职'] },
      q3: { q: '公司给培训补贴吗？', answer: '每年提供 2000 元培训津贴，可用于在线课程（出处 D4）。', keys: ['培训', '津贴', '课程'] }
    };
    let sel = 'q1';
    function sim(q, d) { let s = 0; for (const k of q.keys) if (d.text.includes(k)) s++; return s; }
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      const q = queries[sel];
      text(ctx, '问题：' + q.q, 70, 44, C.yellow, 'left', 13);
      text(ctx, '① 向量检索（知识库）· 按相关度打分', 70, 80, C.cyan, 'left', 12);
      const scores = docs.map(dd => sim(q, dd));
      docs.forEach((dd, i) => {
        const sc = scores[i], y = 100 + i * 44;
        ctx.fillStyle = sc > 0 ? 'rgba(0,230,160,' + (0.08 + 0.4 * sc) + ')' : 'rgba(120,145,200,0.08)';
        ctx.fillRect(70, y - 12, 620, 34);
        ctx.strokeStyle = sc > 0 ? C.green : C.axis; ctx.strokeRect(70, y - 12, 620, 34);
        text(ctx, dd.id + '　' + dd.text, 80, y - 1, sc > 0 ? C.white : C.text, 'left', 11);
        text(ctx, '相关度 ' + sc, 620, y - 1, sc > 0 ? C.green : C.text, 'right', 11);
      });
      text(ctx, '② 拼接 top-k 片段 + 问题 → LLM 生成', 70, 292, C.magenta, 'left', 12);
      ctx.strokeStyle = C.axis; ctx.strokeRect(70, 306, 640, 40);
      ctx.fillStyle = 'rgba(255,122,198,0.08)'; ctx.fillRect(70, 306, 640, 40);
      text(ctx, '答：' + q.answer, 80, 326, C.white, 'left', 12);
      text(ctx, '检索到相关片段越多，回答越有据可依、越少幻觉', 70, H - 30, C.text, 'left', 11);
    }
    d.controls.appendChild(makeSelect(Object.keys(queries).map(k => ({ value: k, label: queries[k].q })), v => { sel = v; draw(); }));
    draw();
  }

  // ============================================================
  // Agent · ReAct 循环
  // ============================================================
  function agent(container) {
    const d = demoShell('Agent · ReAct 循环演示', '逐步推进「思考→调工具→观察」，看 Agent 如何查天气、算数字并给出最终答案。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const steps = [
      { type: 'Thought', color: C.yellow, text: '用户想知道北京今天多热，我需要调用天气工具。' },
      { type: 'Action', color: C.cyan, text: '调用 天气查询(城市="北京")' },
      { type: 'Observation', color: C.green, text: '返回：北京 今天 晴，25°C' },
      { type: 'Thought', color: C.yellow, text: '已拿到气温 25°C，还需要换算成华氏度。' },
      { type: 'Action', color: C.cyan, text: '调用 计算器(25×1.8+32)' },
      { type: 'Observation', color: C.green, text: '返回：77°F' },
      { type: 'Final', color: C.magenta, text: '北京今天 25°C（约 77°F），晴天。' }
    ];
    let idx = 0;
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      text(ctx, '任务：北京今天多少度？（换算成华氏度）', 70, 44, C.white, 'left', 13);
      let y = 84;
      for (let i = 0; i <= idx && i < steps.length; i++) {
        const s = steps[i];
        ctx.fillStyle = s.color; ctx.globalAlpha = 0.15; ctx.fillRect(70, y - 14, 640, 30); ctx.globalAlpha = 1;
        ctx.strokeStyle = s.color; ctx.strokeRect(70, y - 14, 640, 30);
        text(ctx, s.type + '：', 80, y, s.color, 'left', 12);
        text(ctx, s.text, 170, y, C.white, 'left', 12);
        y += 38;
      }
      if (idx >= steps.length) text(ctx, '✓ 完成（ReAct 循环结束）', 70, y + 6, C.green, 'left', 12);
      else text(ctx, '点「下一步」继续循环…', 70, y + 6, C.text, 'left', 12);
    }
    d.controls.appendChild(makeButton('下一步', () => { if (idx < steps.length) { idx++; draw(); } }, true));
    d.controls.appendChild(makeButton('重置', () => { idx = 0; draw(); }));
    draw();
  }

  // ============================================================
  // Agent · 多智能体协作
  // ============================================================
  function multiagent(container) {
    const d = demoShell('多智能体 · 协作演示', '三个角色 Agent 依次交接，看一段内容如何经「研究→写作→审校」逐步打磨成型。');
    container.appendChild(d.root);
    const { ctx, W, H } = setup(d.canvas, 780, 380);
    const roles = [
      { name: '研究员', color: C.cyan, icon: '🔍', text: '查资料：LSTM 用门控机制（遗忘/输入/输出门）解决长序列记忆问题。' },
      { name: '写手', color: C.magenta, icon: '✍️', text: '成稿：LSTM 是能记住长期信息的循环网络，靠三个门控制信息的保留与遗忘。' },
      { name: '审校', color: C.orange, icon: '🔎', text: '审校：补充「门用 sigmoid 控制在 0~1」，并确认术语准确。' },
      { name: '写手', color: C.magenta, icon: '✍️', text: '终稿：LSTM 通过遗忘/输入/输出门（sigmoid 控制 0~1）决定信息遗忘与保留，擅长长序列。' }
    ];
    let idx = 0;
    function draw() {
      clear(ctx, W, H); grid(ctx, W, H, 40);
      text(ctx, '任务：写一段「LSTM」的科普简介', 70, 44, C.white, 'left', 13);
      let y = 82;
      for (let i = 0; i < roles.length; i++) {
        const r = roles[i], vis = (i < idx || i === idx) ? 1 : 0.25;
        ctx.globalAlpha = vis;
        ctx.fillStyle = r.color; ctx.beginPath(); ctx.arc(90, y, 16, 0, 7); ctx.fill();
        text(ctx, r.icon, 90, y, C.white, 'center', 14);
        text(ctx, r.name, 90, y + 26, r.color, 'center', 10);
        ctx.fillStyle = r.color; ctx.globalAlpha = vis * 0.12; ctx.fillRect(120, y - 22, 560, 44);
        ctx.globalAlpha = vis; ctx.strokeStyle = r.color; ctx.strokeRect(120, y - 22, 560, 44);
        text(ctx, r.text, 132, y, C.white, 'left', 11);
        ctx.globalAlpha = 1;
        if (i < roles.length - 1) { ctx.strokeStyle = C.axis; ctx.beginPath(); ctx.moveTo(400, y + 24); ctx.lineTo(400, y + 40); ctx.stroke(); }
        y += 58;
      }
      text(ctx, idx >= roles.length ? '✓ 协作完成' : '点「下一步」让 ' + roles[idx].name + ' 接手…', 70, y + 2, idx >= roles.length ? C.green : C.text, 'left', 12);
    }
    d.controls.appendChild(makeButton('下一步', () => { if (idx < roles.length) { idx++; draw(); } }, true));
    d.controls.appendChild(makeButton('重置', () => { idx = 0; draw(); }));
    draw();
  }

  window.MLDemos = {
    dist: dist, linear: linear, logistic: logistic, tree: tree, forest: forest,
    xgboost: xgboost, svm: svm, kmeans: kmeans, pca: pca, mlp: mlp, rnn: rnn, lstm: lstm, seq: seq,
    gd: gd, overfit: overfit, ridge: ridge, knn: knn, naivebayes: naivebayes,
    adaboost: adaboost, dbscan: dbscan, tsne: tsne, cnn: cnn, autoencoder: autoencoder,
    gru: gru, transformer: transformer, gan: gan, rl: rl, transfer: transfer,
    recsys: recsys, anomaly: anomaly, feature: feature, evaluation: evaluation,
    resnet: resnet, yolo: yolo, segment: segment, augment: augment, vit: vit,
    vae: vae, diffusion: diffusion, sd: sd, clip: clip,
    word2vec: word2vec, gpt: gpt, lora: lora, rlhf: rlhf, prompt: prompt,
    rag: rag, agent: agent, multiagent: multiagent
  };
})();
