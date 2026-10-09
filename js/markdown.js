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

  // ---------- 行内元素 ----------
  function inline(s) {
    const codes = [];
    // 行内代码先摘出来，避免其中的符号被当成语法
    s = s.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0001'; });
    s = esc(s);
    // 图片
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (m, alt, src) => '<img class="md-img" src="' + src + '" alt="' + alt + '" loading="lazy" />');
    // 链接（外链新窗口打开）
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, href) => {
      const ext = /^https?:\/\//i.test(href);
      return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + text + '</a>';
    });
    // 公式（不做 LaTeX 解析，只做样式化显示）
    s = s.replace(/\$([^$\n]+)\$/g, (m, tex) => '<span class="md-math">' + tex.trim() + '</span>');
    // 强调
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
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
        if (oneLine) { html.push('<div class="md-formula">' + esc(oneLine[1].trim()) + '</div>'); i++; continue; }
        const buf = []; i++;
        while (i < lines.length && !/^\s*\$\$\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        html.push('<div class="md-formula">' + esc(buf.join('\n').trim()) + '</div>');
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
