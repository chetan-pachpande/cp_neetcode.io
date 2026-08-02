/* ============================================================
   CP Visualizations — shared visualizer engine
   ------------------------------------------------------------
   Each problem page calls:

     const viz = Viz.init({
       code: `...java source...`,          // shown in #code-panel, 1-based lines
       buildFrames: () => [ frame, ... ],  // frame: { line, msg, ...state }
       render: (frame) => { ... },         // draw frame into the stage
     });
     viz.run();                            // (re)build frames from inputs

   Required DOM ids on the page:
     #code-panel   — code listing mount
     #viz-controls — playback controls mount (engine renders into it)
     #step-msg     — current-step explanation banner
     #log-panel    — execution log mount
   ============================================================ */

window.Viz = (function () {
  'use strict';

  const SPEEDS = [
    { label: '0.5x', ms: 1300 },
    { label: '1x', ms: 700 },
    { label: '1.5x', ms: 450 },
    { label: '2x', ms: 280 },
  ];

  const ICONS = {
    first: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>',
    prev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
    play: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>',
    pause: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1"/><rect x="14" y="4" width="5" height="16" rx="1"/></svg>',
    next: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
    last: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>',
    restart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
  };

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlightJava(line) {
    let html = escapeHtml(line);

    // comments first - if the line is/contains a comment, wrap the tail
    const comIdx = html.indexOf('//');
    let tail = '';
    if (comIdx !== -1) {
      tail = '<span class="tok-com">' + html.slice(comIdx) + '</span>';
      html = html.slice(0, comIdx);
    }

    // Pull string literals out into placeholders BEFORE keyword/number
    // highlighting runs. Otherwise the keyword regex (which matches the
    // word "class") re-scans our own injected class="tok-str" markup
    // and corrupts it. Placeholder uses letters so the number regex
    // below can't accidentally match the embedded index.
    const strings = [];
    html = html.replace(/(&quot;.*?&quot;|".*?"|'.*?')/g, function (m) {
      strings.push(m);
      return 'STRLITERALPLACEHOLDER' + (strings.length - 1) + 'END';
    });

    html = html
      .replace(/\b(public|private|class|return|if|else|for|while|new|int|boolean|char|void|String|static|null|true|false|continue|break)\b/g, '<span class="tok-kw">$1</span>')
      .replace(/\b(\d+)\b(?![^<]*<\/span>)/g, '<span class="tok-num">$1</span>');

    html = html.replace(/STRLITERALPLACEHOLDER(\d+)END/g, function (_, i) {
      return '<span class="tok-str">' + strings[Number(i)] + '</span>';
    });

    return html + tail;
  }

  function init(cfg) {
    const codeMount = document.getElementById('code-panel');
    const controlsMount = document.getElementById('viz-controls');
    const msgMount = document.getElementById('step-msg');
    const logMount = document.getElementById('log-panel');

    // --- render code listing ---
    const lines = cfg.code.replace(/^\n/, '').replace(/\n\s*$/, '').split('\n');
    codeMount.innerHTML = lines
      .map(
        (l, i) =>
          `<div class="code-line" data-line="${i + 1}"><span class="ln">${i + 1}</span><pre>${highlightJava(l) || ' '}</pre></div>`
      )
      .join('');

    // --- render controls ---
    controlsMount.innerHTML = `
      <div class="ctrl-row">
        <button class="ctrl-btn" data-act="first" title="Restart (R)">${ICONS.first}</button>
        <button class="ctrl-btn" data-act="prev" title="Step back (←)">${ICONS.prev}</button>
        <button class="ctrl-btn play" data-act="play" title="Play / pause (Space)">${ICONS.play}</button>
        <button class="ctrl-btn" data-act="next" title="Step forward (→)">${ICONS.next}</button>
        <button class="ctrl-btn" data-act="last" title="Jump to end">${ICONS.last}</button>
      </div>
      <div class="scrub-row">
        <input type="range" min="0" max="0" value="0" step="1" aria-label="Scrub through steps">
        <span class="frame-counter">0 / 0</span>
        <span class="speed-seg">${SPEEDS.map((s, i) => `<button data-speed="${i}" class="${i === 1 ? 'active' : ''}">${s.label}</button>`).join('')}</span>
      </div>
      <div class="kbd-hint"><kbd>Space</kbd> play &nbsp; <kbd>←</kbd><kbd>→</kbd> step &nbsp; <kbd>R</kbd> restart</div>
    `;

    const scrub = controlsMount.querySelector('input[type="range"]');
    const counter = controlsMount.querySelector('.frame-counter');
    const playBtn = controlsMount.querySelector('[data-act="play"]');

    let frames = [];
    let idx = -1;
    let playing = false;
    let timer = null;
    let speedIdx = 1;

    function setPlayIcon() {
      playBtn.innerHTML = playing ? ICONS.pause : ICONS.play;
    }

    function renderLog() {
      const visible = frames.slice(0, idx + 1);
      const start = Math.max(0, visible.length - 400);
      logMount.innerHTML = visible
        .slice(start)
        .map(
          (f, i) =>
            `<div class="entry ${start + i === idx ? 'latest' : ''}"><span class="n">${start + i + 1}</span><span>${escapeHtml(f.msg || '')}</span></div>`
        )
        .join('');
      logMount.scrollTop = logMount.scrollHeight;
    }

    function goTo(n) {
      if (!frames.length) return;
      idx = Math.max(0, Math.min(frames.length - 1, n));
      const f = frames[idx];

      codeMount.querySelectorAll('.code-line.active').forEach((e) => e.classList.remove('active'));
      const hl = f.line == null ? [] : Array.isArray(f.line) ? f.line : [f.line];
      hl.forEach((l) => {
        const el = codeMount.querySelector(`[data-line="${l}"]`);
        if (el) el.classList.add('active');
      });
      if (hl.length) {
        const first = codeMount.querySelector(`[data-line="${hl[0]}"]`);
        if (first) first.scrollIntoView({ block: 'nearest' });
      }

      if (msgMount) msgMount.textContent = f.msg || '';
      scrub.max = frames.length - 1;
      scrub.value = idx;
      counter.textContent = `${idx + 1} / ${frames.length}`;
      renderLog();
      cfg.render(f, idx);

      if (idx >= frames.length - 1) pause();
    }

    function step(d) {
      goTo(idx + d);
    }

    function play() {
      if (!frames.length) return;
      if (idx >= frames.length - 1) idx = -1; // replay from start
      playing = true;
      setPlayIcon();
      clearInterval(timer);
      timer = setInterval(() => {
        if (idx >= frames.length - 1) {
          pause();
          return;
        }
        step(1);
      }, SPEEDS[speedIdx].ms);
      step(1);
    }

    function pause() {
      playing = false;
      clearInterval(timer);
      timer = null;
      setPlayIcon();
    }

    function run() {
      pause();
      frames = cfg.buildFrames() || [];
      idx = -1;
      goTo(0);
    }

    // --- wire controls ---
    controlsMount.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.speed != null) {
        speedIdx = Number(btn.dataset.speed);
        controlsMount.querySelectorAll('[data-speed]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        if (playing) {
          pause();
          play();
        }
        return;
      }
      switch (btn.dataset.act) {
        case 'first': pause(); goTo(0); break;
        case 'prev': pause(); step(-1); break;
        case 'next': pause(); step(1); break;
        case 'last': pause(); goTo(frames.length - 1); break;
        case 'play': playing ? pause() : play(); break;
      }
    });

    scrub.addEventListener('input', () => {
      pause();
      goTo(Number(scrub.value));
    });

    document.addEventListener('keydown', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
      else if (e.key === 'ArrowRight') { pause(); step(1); }
      else if (e.key === 'ArrowLeft') { pause(); step(-1); }
      else if (e.key === 'r' || e.key === 'R') { pause(); goTo(0); }
    });

    return { run, goTo, play, pause };
  }

  /* ---------- small render helpers shared by pages ---------- */

  function cells(items) {
    // items: [{ v, idx, cls }] → html string of .cell divs
    return items
      .map(
        (it) =>
          `<div class="cell ${it.cls || ''}">${escapeHtml(String(it.v))}${it.idx != null ? `<span class="idx">${it.idx}</span>` : ''}</div>`
      )
      .join('');
  }

  function kvChip(k, v, cls) {
    return `<div class="kv ${cls || ''}"><span class="k">${escapeHtml(String(k))}</span>${
      v !== undefined ? `<span class="arrow">→</span><span class="v">${escapeHtml(String(v))}</span>` : ''
    }</div>`;
  }

  /* ---------- tree helpers ---------- */

  // Parse a LeetCode-style level-order array (nulls for missing children)
  // into a linked node tree. Each node gets a stable numeric id so frames
  // can reference "this exact node" across re-layouts and clones.
  function buildTree(values) {
    let nextId = 0;
    const makeNode = (v) => ({ id: nextId++, val: v, left: null, right: null });

    function parse(arr) {
      if (!arr.length || arr[0] === null || arr[0] === undefined || arr[0] === '') return null;
      const root = makeNode(arr[0]);
      const queue = [root];
      let i = 1;
      while (queue.length && i < arr.length) {
        const node = queue.shift();
        if (i < arr.length) {
          const lv = arr[i++];
          if (lv !== null && lv !== undefined && lv !== '') {
            node.left = makeNode(lv);
            queue.push(node.left);
          }
        }
        if (i < arr.length) {
          const rv = arr[i++];
          if (rv !== null && rv !== undefined && rv !== '') {
            node.right = makeNode(rv);
            queue.push(node.right);
          }
        }
      }
      return root;
    }

    const root = parse(values);
    const nodes = layoutTree(root);
    return { root, nodes };
  }

  // Deep-clone a node tree, preserving ids (so state keyed by id still
  // matches after mutation, e.g. inverting left/right pointers).
  function cloneTree(node) {
    if (!node) return null;
    return { id: node.id, val: node.val, left: cloneTree(node.left), right: cloneTree(node.right) };
  }

  // Assign x (in-order position) / y (depth) to every node in place and
  // return a flat array of nodes. Call again after mutating the tree.
  function layoutTree(root) {
    let counter = 0;
    const nodes = [];
    (function walk(node, depth) {
      if (!node) return;
      walk(node.left, depth + 1);
      node.x = counter++;
      node.y = depth;
      nodes.push(node);
      walk(node.right, depth + 1);
    })(root, 0);
    return nodes;
  }

  // Render a node tree as an SVG diagram into `mount`.
  // tree: { root, nodes } (nodes optional — recomputed from root if omitted)
  // classFn(node) -> extra CSS class string (active / ok / warn / bad / dim)
  function renderTree(mount, tree, classFn, opts) {
    opts = opts || {};
    const spacingX = opts.spacingX || 56;
    const spacingY = opts.spacingY || 64;
    const r = opts.r || 18;

    const root = tree ? tree.root : null;
    const nodes = tree && tree.nodes ? tree.nodes : root ? layoutTree(root) : [];

    if (!root || !nodes.length) {
      mount.innerHTML = '<div style="color:var(--text-3);font-size:.85rem;padding:1.5rem;text-align:center;">empty tree</div>';
      return;
    }

    const maxX = Math.max(...nodes.map((n) => n.x));
    const maxY = Math.max(...nodes.map((n) => n.y));
    const width = (maxX + 2) * spacingX;
    const height = (maxY + 1.6) * spacingY;
    const px = (n) => (n.x + 1) * spacingX;
    const py = (n) => (n.y + 0.8) * spacingY;

    let svg = '';
    nodes.forEach((n) => {
      if (n.left) svg += `<line class="tree-edge" x1="${px(n)}" y1="${py(n)}" x2="${px(n.left)}" y2="${py(n.left)}"/>`;
      if (n.right) svg += `<line class="tree-edge" x1="${px(n)}" y1="${py(n)}" x2="${px(n.right)}" y2="${py(n.right)}"/>`;
    });
    nodes.forEach((n) => {
      const cls = classFn ? classFn(n) || '' : '';
      svg += `<g class="tree-node ${cls}"><circle cx="${px(n)}" cy="${py(n)}" r="${r}"></circle><text x="${px(n)}" y="${py(n)}">${escapeHtml(String(n.val))}</text></g>`;
      if (opts.sub) {
        const label = opts.sub(n);
        if (label != null) svg += `<text class="tree-sub" x="${px(n)}" y="${py(n) + r + 13}">${escapeHtml(String(label))}</text>`;
      }
    });

    mount.innerHTML = `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;max-height:380px;display:block;">${svg}</svg>`;
  }

  // A binary heap stored as an array is already a complete binary tree —
  // child i has children at 2i+1/2i+2. Build { root, nodes } straight from
  // the array (ids = array index) so heap pages can reuse renderTree.
  function heapToTree(arr) {
    if (!arr.length) return { root: null, nodes: [] };
    const heapNodes = arr.map((v, i) => ({ id: i, val: v, left: null, right: null }));
    heapNodes.forEach((n, i) => {
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < heapNodes.length) n.left = heapNodes[l];
      if (r < heapNodes.length) n.right = heapNodes[r];
    });
    const root = heapNodes[0];
    return { root, nodes: layoutTree(root) };
  }

  /* ---------- N-ary tree (trie) helpers ---------- */
  // A trie node has a variable number of labeled children, unlike the
  // binary tree above. Layout centers each parent above its own children
  // (computed bottom-up) rather than using a simple in-order counter.

  function makeTrieNode(id) {
    return { id, children: {}, isEnd: false, x: 0, y: 0 };
  }

  function layoutNaryTree(root) {
    let counter = 0;
    const nodes = [];
    (function walk(node, depth) {
      const keys = Object.keys(node.children).sort();
      if (!keys.length) {
        node.x = counter++;
        node.y = depth;
        nodes.push(node);
        return;
      }
      const childXs = keys.map((k) => {
        walk(node.children[k], depth + 1);
        return node.children[k].x;
      });
      node.x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
      node.y = depth;
      nodes.push(node);
    })(root, 0);
    return nodes;
  }

  // classFn(node) -> extra CSS class; labelFn(node) -> text in the circle
  // (defaults to the node's incoming edge character, root shows "•").
  function renderNaryTree(mount, root, classFn, labelFn, opts) {
    opts = opts || {};
    const spacingX = opts.spacingX || 46;
    const spacingY = opts.spacingY || 64;
    const r = opts.r || 16;

    if (!root) {
      mount.innerHTML = '<div style="color:var(--text-3);font-size:.85rem;padding:1.5rem;text-align:center;">empty trie</div>';
      return;
    }

    const nodes = layoutNaryTree(root);
    const maxX = Math.max(...nodes.map((n) => n.x));
    const maxY = Math.max(...nodes.map((n) => n.y));
    const width = (maxX + 2) * spacingX;
    const height = (maxY + 1.6) * spacingY;
    const px = (n) => (n.x + 1) * spacingX;
    const py = (n) => (n.y + 0.8) * spacingY;

    let svg = '';
    nodes.forEach((n) => {
      Object.entries(n.children).forEach(([ch, child]) => {
        const mx = (px(n) + px(child)) / 2 + 12, my = (py(n) + py(child)) / 2;
        svg += `<line class="tree-edge" x1="${px(n)}" y1="${py(n)}" x2="${px(child)}" y2="${py(child)}"/>`;
        svg += `<text class="tree-sub" x="${mx}" y="${my - 4}">${escapeHtml(ch)}</text>`;
      });
    });
    nodes.forEach((n) => {
      const cls = (classFn ? classFn(n) || '' : '') + (n.isEnd ? ' is-end' : '');
      const label = labelFn ? labelFn(n) : n === root ? '•' : '';
      svg += `<g class="tree-node ${cls}"><circle cx="${px(n)}" cy="${py(n)}" r="${r}"></circle><text x="${px(n)}" y="${py(n)}">${escapeHtml(label)}</text></g>`;
    });

    mount.innerHTML = `<svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;max-height:380px;display:block;">${svg}</svg>`;
  }

  return {
    init, cells, kvChip, escapeHtml, buildTree, cloneTree, layoutTree, renderTree, heapToTree,
    makeTrieNode, layoutNaryTree, renderNaryTree,
  };
})();
