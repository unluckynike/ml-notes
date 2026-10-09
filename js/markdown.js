/* ============================================================
   ML 笔记 · 迷你 Markdown 渲染器（零依赖，离线可用）
   ------------------------------------------------------------
   支持的语法：
     # ~ ######   标题（自动生成锚点，h2/h3 进目录）
     段落          单个换行 = 换行（<br />，符合笔记书写直觉）
     **粗** *斜* ~~删~~ `行内代码`
     ```lang       围栏代码块（带语言标签）
     - / * / +     无序列表，支持 2 空格缩进嵌套
     1.            有序列表
     - [ ] / - [x] 任务列表
     > 引用        > [!NOTE] / [!TIP] / [!WARN] / [!KEY] 提示块
     | a | b |     GFM 表格（第二行 |---| 控制对齐）
     ---           分隔线
     [文字](链接)   站内链接 / 外链自动新窗口
     ![alt](图片)
     $行内公式$  $$独立公式$$
   不支持的语法会原样当文本显示（不报错）。

   注意：出于安全与可预测性，**不解析原始 HTML**，所有标签都会被转义。
   ============================================================ */
(function () {
  'use strict';

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ESC[c]);

  // 提示块类型 -> [CSS 类, 默认标题]
  const CALLOUT = {
    NOTE: ['md-quote--note', '说明'],
    TIP: ['md-quote--tip', '提示'],
    WARN: ['md-quote--warn', '注意'],
    DANGER: ['md-quote--warn', '警告'],
    KEY: ['md-quote--key', '要点']
  };

  let usedIds = Object.create(null);

  // 生成稳定锚点 id（中文保留，重复的自动加序号）
  function slug(raw) {
    let t = String(raw).replace(/<[^>]*>/g, '').replace(/[*`]/g, '').trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
      .toLowerCase();
    if (!t) t = 'sec';
    let id = 'h-' + t, n = 1;
    while (usedIds[id]) id = 'h-' + t + '-' + (++n);
    usedIds[id] = 1;
    return id;
  }

  // ============================================================
  // LaTeX 子集渲染器
  // 覆盖机器学习笔记里常见的公式语法，渲染成 HTML + CSS，不依赖 KaTeX
  // 不认识的命令会原样显示（而不是静默丢失）
  // ============================================================

  // 希腊字母 / 运算符 / 关系符 -> Unicode
  const SYM = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', varepsilon: 'ε', epsilon: 'ϵ',
    zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ', lambda: 'λ',
    mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ',
    phi: 'φ', varphi: 'ϕ', chi: 'χ', psi: 'ψ', omega: 'ω',
    Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π', Sigma: 'Σ',
    Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
    varnothing: '∅', emptyset: '∅', infty: '∞', partial: '∂', nabla: '∇', ell: 'ℓ',
    hbar: 'ℏ', Re: 'ℜ', Im: 'ℑ',
    cdot: '·', cdots: '⋯', ldots: '…', dots: '…', vdots: '⋮', ddots: '⋱',
    times: '×', div: '÷', pm: '±', mp: '∓', ast: '∗', star: '⋆', circ: '∘', bullet: '•',
    le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', equiv: '≡',
    sim: '∼', simeq: '≃', propto: '∝', ll: '≪', gg: '≫',
    to: '→', rightarrow: '→', leftarrow: '←', leftrightarrow: '↔',
    Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', mapsto: '↦', implies: '⟹',
    in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇',
    cup: '∪', cap: '∩', setminus: '∖',
    forall: '∀', exists: '∃', nexists: '∄', neg: '¬', lnot: '¬', land: '∧', lor: '∨',
    sum: '∑', prod: '∏', coprod: '∐', int: '∫', oint: '∮',
    mid: '∣', '|': '‖', vert: '|', Vert: '‖', lVert: '‖', rVert: '‖', lvert: '|', rvert: '|',
    langle: '⟨', rangle: '⟩', lceil: '⌈', rceil: '⌉', lfloor: '⌊', rfloor: '⌋',
    degree: '°', angle: '∠', perp: '⊥', parallel: '∥',
    limits: '', nolimits: '', displaystyle: '', textstyle: '', scriptstyle: '',
    mathstrut: '', phantom: ''
    // 注意：quad/qquad/enspace/thinspace 交给 SPACE 处理，
    //       left/right/middle/big/Big/bigg/Bigg 交给尺寸修饰分支处理，
    //       都不要写进这张表，否则会被这里的空映射提前拦截。
  };

  // 需要正体显示的算子名
  const OPS = ['log', 'ln', 'lg', 'exp', 'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
    'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh', 'max', 'min', 'sup', 'inf',
    'argmax', 'argmin', 'det', 'dim', 'deg', 'gcd', 'lim', 'mod', 'bmod'];

  // 间距命令 -> em
  const SPACE = { ',': 0.167, ':': 0.222, ';': 0.278, '!': -0.167, ' ': 0.333, quad: 1, qquad: 2, enspace: 0.5 };

  // 重音命令
  const ACCENT = { bar: 'bar', hat: 'hat', widehat: 'hat', tilde: 'tilde', widetilde: 'tilde', dot: 'dot', ddot: 'dot', vec: 'vec', overrightarrow: 'vec' };

  // 自动间距用：二元关系符 / 二元运算符 / 大运算符
  const REL = '=≈∼≤≥≠→←↔⇒⇔∈∉⊂⊆⊃⊇∣∝≡≃≪≫⟹';
  const BINOP = '+−×÷·±∓∪∩∧∨∗∘⊂';
  const BIGOP = '∑∏∐∫∮';

  const MATH_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  const mEsc = s => String(s).replace(/[&<>"]/g, c => MATH_ESC[c]);

  function texTokens(src) {
    // 先把 \text{...} 的内容摘成不可拆分的 token，保留其中的空格
    const texts = [];
    let s = String(src).replace(/\\(?:text|textrm|mathrm|operatorname|mbox)\s*\{([^{}]*)\}/g,
      (m, t) => { texts.push(t); return '\u0007' + (texts.length - 1) + '\u0007'; });

    const toks = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '\u0007') {                       // 文本占位
        const end = s.indexOf('\u0007', i + 1);
        toks.push({ t: 'text', v: texts[+s.slice(i + 1, end)] });
        i = end + 1;
      } else if (c === '\\') {
        const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i));
        toks.push({ t: 'cmd', v: m[1] });
        i += m[0].length;
      } else if (c === '{' || c === '}') { toks.push({ t: c }); i++; }
      else if (c === '^' || c === '_') { toks.push({ t: c }); i++; }
      else if (c === ' ' || c === '\n' || c === '\t') { i++; }   // LaTeX 忽略空白
      else { toks.push({ t: 'ch', v: c }); i++; }
    }
    return toks;
  }

  function texParse(toks) {
    const st = { i: 0 };

    function seq() {
      const nodes = [];
      while (st.i < toks.length && toks[st.i].t !== '}') {
        const n = atom();
        if (n) nodes.push(n);
      }
      return nodes;
    }
    function arg() {                              // 一个参数：{...} 或单个 token
      const tk = toks[st.i];
      if (!tk) return { k: 'sym', v: '' };
      if (tk.t === '{') { st.i++; const c = seq(); if (toks[st.i] && toks[st.i].t === '}') st.i++; return { k: 'grp', c: c }; }
      if (tk.t === 'cmd') { st.i++; return cmd(tk.v); }
      if (tk.t === 'text') { st.i++; return { k: 'text', v: tk.v }; }
      st.i++;
      return { k: 'sym', v: tk.v };
    }
    function cmd(name) {
      if (name in SYM) return { k: 'sym', v: SYM[name] };
      if (OPS.indexOf(name) >= 0) return { k: 'op', v: name };
      if (name in SPACE) return { k: 'sp', w: SPACE[name] };
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
        const a = arg(), b = arg();
        return { k: 'frac', a: a, b: b };
      }
      if (name === 'sqrt' || name === 'cbrt') {
        if (toks[st.i] && toks[st.i].t === 'ch' && toks[st.i].v === '[') {   // \sqrt[n]{x}
          st.i++;
          while (st.i < toks.length && !(toks[st.i].t === 'ch' && toks[st.i].v === ']')) st.i++;
          st.i++;
        }
        const a = arg();
        return { k: 'sqrt', a: a, cube: name === 'cbrt' };
      }
      if (name in ACCENT) return { k: 'acc', a: name, b: arg() };
      if (name === 'binom') { const a = arg(), b = arg(); return { k: 'binom', a: a, b: b }; }
      if (name === 'left' || name === 'right' || name === 'middle' ||
          name === 'big' || name === 'Big' || name === 'bigg' || name === 'Bigg') {
        // 尺寸修饰符：把紧跟的括号类定界符放大（\left( … \right)）
        const tk = toks[st.i];
        const auto = name === 'left' || name === 'right' || name === 'middle';
        if (tk && tk.t === 'ch' && '()[]{}|'.indexOf(tk.v) >= 0) {
          st.i++;
          return { k: 'delim', v: tk.v, lv: auto ? 'auto' : (/^(bigg|Bigg)$/.test(name) ? 'lg' : 'md') };
        }
        return { k: 'sym', v: '' };               // 后面不是括号就忽略尺寸修饰
      }
      return { k: 'raw', v: '\\' + name };        // 未知命令：原样显示
    }
    function atom() {
      const tk = toks[st.i];
      let base;
      if (tk.t === '{') { st.i++; base = { k: 'grp', c: seq() }; if (toks[st.i] && toks[st.i].t === '}') st.i++; }
      else if (tk.t === 'cmd') { st.i++; base = cmd(tk.v); }
      else if (tk.t === 'text') { st.i++; base = { k: 'text', v: tk.v }; }
      else if (tk.t === '^' || tk.t === '_') { st.i++; return null; }
      else { st.i++; base = { k: 'sym', v: tk.v }; }

      const sub = [], sup = [];
      while (st.i < toks.length && (toks[st.i].t === '^' || toks[st.i].t === '_')) {
        const kind = toks[st.i].t; st.i++;
        const a = arg();
        (kind === '^' ? sup : sub).push(a);
      }
      if (sub.length || sup.length) return { k: 'scr', base: base, sub: sub, sup: sup };
      return base;
    }
    return seq();
  }

  function texHtml(nodes, opt) {
    opt = opt || {};
    const push = [];
    nodes.forEach(function (n, idx) {
      switch (n.k) {
        case 'sym':
          if (n.v === '') break;
          // 二元关系符 / 运算符：按 LaTeX 习惯自动加间距（上下标内不加）
          if (!opt.compact && n.v.length === 1) {
            if (REL.indexOf(n.v) >= 0) { push.push('<span class="m-rel">' + mEsc(n.v) + '</span>'); break; }
            if (BINOP.indexOf(n.v) >= 0) {
              const pv = nodes[idx - 1];
              const prevv = pv && pv.k === 'sym' ? pv.v : '';
              const unary = !pv || (prevv && (REL.indexOf(prevv) >= 0 || BINOP.indexOf(prevv) >= 0 || '(,['.indexOf(prevv) >= 0));
              push.push(unary ? mEsc(n.v) : '<span class="m-bin">' + mEsc(n.v) + '</span>');
              break;
            }
          }
          push.push(n.v === '-' ? '−' : mEsc(n.v));
          break;
        case 'op': push.push('<span class="m-op">' + mEsc(n.v) + '</span>'); break;
        case 'delim': push.push('<span class="m-delim m-delim--' + n.lv + '">' + mEsc(n.v) + '</span>'); break;
        case 'text': push.push('<span class="m-text">' + mEsc(n.v) + '</span>'); break;
        case 'raw': push.push('<span class="m-raw">' + mEsc(n.v) + '</span>'); break;
        case 'sp': push.push('<span class="m-sp" style="width:' + n.w + 'em"></span>'); break;
        case 'grp': push.push(texHtml(n.c, opt)); break;
        case 'scr': {
          const base = texHtml([n.base], opt);
          // 大运算符在独立公式里把上下限叠起来（\sum_{t=2}^{T}）
          const big = n.base.k === 'sym' && BIGOP.indexOf(n.base.v) >= 0;
          if (big && opt.display && n.sub.length && n.sup.length) {
            push.push('<span class="m-limits"><span class="m-lim-sup">' + texHtml(n.sup, { compact: true }) + '</span>' +
              '<span class="m-lim-base">' + base + '</span>' +
              '<span class="m-lim-sub">' + texHtml(n.sub, { compact: true }) + '</span></span>');
            break;
          }
          push.push('<span class="m-scr">' + base +
            (n.sub.length ? '<sub>' + texHtml(n.sub, { compact: true }) + '</sub>' : '') +
            (n.sup.length ? '<sup>' + texHtml(n.sup, { compact: true }) + '</sup>' : '') + '</span>');
          break;
        }
        case 'frac':
          push.push('<span class="m-frac"><span class="m-num">' + texHtml([n.a], opt) +
            '</span><span class="m-den">' + texHtml([n.b], opt) + '</span></span>');
          break;
        case 'sqrt':
          push.push('<span class="m-sqrt"><span class="m-radic">' + (n.cube ? '∛' : '√') +
            '</span><span class="m-rad">' + texHtml([n.a], opt) + '</span></span>');
          break;
        case 'acc':
          push.push('<span class="m-acc m-acc--' + n.a + '">' + texHtml([n.b], { compact: true }) + '</span>');
          break;
        case 'binom':
          push.push('<span class="m-bin-coef"><span class="m-bin-in">' + texHtml([n.a], opt) +
            '</span><span class="m-bin-in">' + texHtml([n.b], opt) + '</span></span>');
          break;
        default: break;
      }
    });
    return push.join('');
  }

  // 对外：把一段 LaTeX 渲染成 HTML
  function renderMath(tex, display) {
    try {
      return texHtml(texParse(texTokens(tex)), { display: !!display });
    } catch (e) {
      return '<span class="m-raw">' + mEsc(tex) + '</span>';   // 解析失败就原样显示
    }
  }

  // ---------- 行内元素 ----------
  function inline(s) {
    const codes = [], maths = [];
    // 行内代码先摘出来，避免其中的符号被当成语法
    s = s.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0001'; });
    // 行内公式也要在 HTML 转义之前摘出来（转义交给公式渲染器自己做）
    s = s.replace(/\$\$([^$\n]+)\$\$/g, (m, t) => { maths.push(t); return '\u0002' + (maths.length - 1) + '\u0003'; });
    s = s.replace(/\$([^$\n]+)\$/g, (m, t) => { maths.push(t); return '\u0002' + (maths.length - 1) + '\u0003'; });
    s = esc(s);
    // 图片
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (m, alt, src) => '<img class="md-img" src="' + src + '" alt="' + alt + '" loading="lazy" />');
    // 链接（外链新窗口打开）
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, href) => {
      const ext = /^https?:\/\//i.test(href);
      return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + text + '</a>';
    });
    // 强调
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
    // 还原公式
    s = s.replace(/\u0002(\d+)\u0003/g, (m, i) => '<span class="md-math">' + renderMath(maths[+i]) + '</span>');
    // 还原行内代码
    s = s.replace(/\u0000(\d+)\u0001/g, (m, i) => '<code class="md-code-inline">' + esc(codes[+i]) + '</code>');
    return s;
  }

  // ---------- 列表 ----------
  function parseList(lines, start) {
    const items = [];
    let i = start;
    while (i < lines.length) {
      const m = /^(\s*)([-*+]|\d+\.)\s+(.*)$/.exec(lines[i]);
      if (m) {
        items.push({ indent: m[1].replace(/\t/g, '    ').length, ordered: /\d/.test(m[2]), text: [m[3]] });
        i++;
      } else if (items.length && /^\s+\S/.test(lines[i]) &&
                 !/^(#{1,6})\s|^```|^>|^\s*([-*+]|\d+\.)\s/.test(lines[i])) {
        // 惰性续行：缩进的普通行接到上一项
        items[items.length - 1].text.push(lines[i].trim());
        i++;
      } else break;
    }

    let html = '';
    const stack = [];
    const openList = it => {
      html += it.ordered ? '<ol class="md-list">' : '<ul class="md-list">';
      stack.push({ indent: it.indent, ordered: it.ordered, liOpen: false });
    };
    const closeList = () => {
      const s = stack.pop();
      if (s.liOpen) html += '</li>';
      html += s.ordered ? '</ol>' : '</ul>';
    };

    items.forEach(it => {
      while (stack.length && it.indent < stack[stack.length - 1].indent) closeList();
      if (!stack.length || it.indent > stack[stack.length - 1].indent) {
        openList(it);
      } else {
        const top = stack[stack.length - 1];
        if (it.ordered !== top.ordered) { closeList(); openList(it); }
        else if (top.liOpen) html += '</li>';
      }
      const top = stack[stack.length - 1];
      const first = it.text[0];
      let cls = '', box = '';
      const t = /^\[([ xX])\]\s*(.*)$/.exec(first);
      if (t) {
        const done = t[1] !== ' ';
        cls = ' class="md-task' + (done ? ' is-done' : '') + '"';
        box = '<span class="md-check">' + (done ? '✓' : '') + '</span>';
        it.text[0] = t[2];
      }
      html += '<li' + cls + '>' + box + it.text.map(inline).join('<br />');
      top.liOpen = true;
    });
    while (stack.length) closeList();
    return { html: html, next: i };
  }

  // ---------- 主渲染 ----------
  function render(md) {
    const lines = String(md == null ? '' : md).replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
    const html = [];
    const toc = [];
    const blank = s => /^\s*$/.test(s);
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (blank(line)) { i++; continue; }

      // 围栏代码块
      let m = /^```(\S*)\s*$/.exec(line);
      if (m) {
        const lang = m[1], buf = [];
        i++;
        while (i < lines.length && !/^```\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        html.push('<div class="md-code">' +
          (lang ? '<span class="md-code__lang">' + esc(lang) + '</span>' : '') +
          '<pre><code>' + esc(buf.join('\n')) + '</code></pre></div>');
        continue;
      }

      // 独立公式 $$ ... $$
      if (/^\s*\$\$/.test(line)) {
        const oneLine = /^\s*\$\$(.+?)\$\$\s*$/.exec(line);
        if (oneLine) { html.push('<div class="md-formula">' + renderMath(oneLine[1].trim(), true) + '</div>'); i++; continue; }
        const buf = []; i++;
        while (i < lines.length && !/^\s*\$\$\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        html.push('<div class="md-formula">' + renderMath(buf.join('\n').trim(), true) + '</div>');
        continue;
      }

      // 标题
      m = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
      if (m) {
        const lvl = m[1].length, raw = m[2], id = slug(raw);
        if (lvl === 2 || lvl === 3) toc.push({ lvl: lvl, text: raw.replace(/[*`]/g, ''), id: id });
        html.push('<h' + lvl + ' id="' + id + '" class="md-h md-h' + lvl + '">' + inline(raw) + '</h' + lvl + '>');
        i++; continue;
      }

      // 分隔线
      if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { html.push('<hr class="md-hr" />'); i++; continue; }

      // GFM 表格
      if (line.indexOf('|') >= 0 && i + 1 < lines.length &&
          lines[i + 1].indexOf('|') >= 0 && /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(lines[i + 1])) {
        const cells = r => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());
        const head = cells(line);
        const align = cells(lines[i + 1]).map(c => {
          const l = c.charAt(0) === ':', r = c.charAt(c.length - 1) === ':';
          return l && r ? 'center' : r ? 'right' : l ? 'left' : '';
        });
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].indexOf('|') >= 0 && !blank(lines[i])) { rows.push(cells(lines[i])); i++; }
        const st = k => align[k] ? ' style="text-align:' + align[k] + '"' : '';
        html.push('<div class="md-table-wrap"><table class="md-table"><thead><tr>' +
          head.map((c, k) => '<th' + st(k) + '>' + inline(c) + '</th>').join('') +
          '</tr></thead><tbody>' +
          rows.map(r => '<tr>' + head.map((_, k) => '<td' + st(k) + '>' + inline(r[k] || '') + '</td>').join('') + '</tr>').join('') +
          '</tbody></table></div>');
        continue;
      }

      // 引用 / 提示块
      if (/^>\s?/.test(line)) {
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
        let cls = 'md-quote', label = '';
        const cm = /^\[!(\w+)\]\s*(.*)$/.exec(buf[0] || '');
        if (cm && CALLOUT[cm[1].toUpperCase()]) {
          cls = 'md-quote ' + CALLOUT[cm[1].toUpperCase()][0];
          label = cm[2] || CALLOUT[cm[1].toUpperCase()][1];
          buf.shift();
        }
        html.push('<blockquote class="' + cls + '">' +
          (label ? '<div class="md-quote__label">' + inline(label) + '</div>' : '') +
          render(buf.join('\n')).html + '</blockquote>');
        continue;
      }

      // 列表
      if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
        const res = parseList(lines, i);
        html.push(res.html);
        i = res.next;
        continue;
      }

      // 段落
      const buf = [];
      while (i < lines.length && !blank(lines[i]) &&
             !/^(#{1,6})\s+/.test(lines[i]) && !/^```/.test(lines[i]) &&
             !/^\s*\$\$/.test(lines[i]) && !/^>\s?/.test(lines[i]) &&
             !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) &&
             !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])) {
        buf.push(lines[i]); i++;
      }
      if (buf.length) html.push('<p class="md-p">' + buf.map(inline).join('<br />') + '</p>');
      else i++;
    }

    return { html: html.join('\n'), toc: toc };
  }

  // 把目录渲染成一个盒子
  function tocHtml(toc) {
    if (!toc || toc.length < 2) return '';
    return '<nav class="md-toc"><div class="md-toc__title">本文目录</div><ul>' +
      toc.map(h => '<li class="md-toc__l' + h.lvl + '"><a href="#' + h.id + '">' + inline(h.text) + '</a></li>').join('') +
      '</ul></nav>';
  }

  window.MLMarkdown = {
    render: function (md) { return render(md); },
    renderWithToc: function (md) {
      usedIds = Object.create(null);
      const r = render(md);
      return tocHtml(r.toc) + r.html;
    },
    renderBody: function (md) {
      usedIds = Object.create(null);
      return render(md).html;
    }
  };
})();
