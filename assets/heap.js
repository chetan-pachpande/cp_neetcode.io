window.HeapPage = (function () {
  'use strict';

  const esc = s => Viz.escapeHtml(String(s));
  const arr = a => `[${a.join(', ')}]`;
  const nums = id => document.getElementById(id).value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
  const text = id => document.getElementById(id).value;
  const chips = xs => xs && xs.length ? xs.map(x => `<span class="solution-chip">${esc(x)}</span>`).join('') : '<span style="color:var(--text-3);font-size:.8rem;">empty</span>';

  function pointList(id) {
    return text(id).split('|').map(p => p.split(',').map(s => parseInt(s.trim(), 10))).filter(p => p.length === 2 && p.every(Number.isFinite));
  }
  function render(f) {
    const heap = f.heap || [];
    const tree = Viz.heapToTree(heap.map(x => typeof x === 'object' ? x.label : x));
    Viz.renderTree(document.getElementById('stage-tree'), tree, n => n.id === f.active ? 'active' : n.id === f.compare ? 'warn' : n.id === 0 && f.done ? 'ok' : '', { r: 20 });
    document.getElementById('stage-array').innerHTML = heap.length ? Viz.cells(heap.map((v, i) => ({ v: typeof v === 'object' ? v.label : v, idx: i, cls: i === f.active ? 'active' : i === f.compare ? 'warn' : i === 0 && f.done ? 'ok' : '' }))) : '<span style="color:var(--text-3);font-size:.85rem;">empty heap</span>';
    document.getElementById('stage-list').innerHTML = chips(f.items || []);
    document.getElementById('state-a').textContent = f.metricA ?? '-';
    document.getElementById('state-b').textContent = f.metricB ?? '-';
    const res = document.getElementById('result');
    res.className = 'result-banner' + (f.done ? ` show ${f.done}` : '');
    res.textContent = f.result || '';
  }
  function base(key, title, lc, difficulty, headerChips, problem, intuition, inputs, presets, code, build) {
    return { key, title, lc, difficulty, headerChips, problem, intuition, inputs, presets, code, build, render };
  }
  function minPush(h, v) { h.push(v); h.sort((a, b) => val(a) - val(b)); }
  function maxPush(h, v) { h.push(v); h.sort((a, b) => val(b) - val(a)); }
  function val(x) { return typeof x === 'object' ? x.key : x; }
  function pop(h) { return h.shift(); }

  const CONFIGS = {};

  CONFIGS.kth_largest_stream = base('kth_largest_stream', 'Kth Largest Element in a Stream', '703', 'Easy',
    ['Min-Heap of Size k', 'O(log k) add', 'O(k) space'],
    'Design a stream that returns the kth largest value after each add.',
    'Keep only the k largest values in a min-heap. The root is the smallest among those winners, so it is the kth largest.',
    [{ id: 'in-k', label: 'k', value: '3' }, { id: 'in-init', label: 'initial nums', value: '4,5,8,2' }, { id: 'in-adds', label: 'add calls', value: '3,5,10,9,4' }],
    [
      { label: 'classic', values: { 'in-k': '3', 'in-init': '4,5,8,2', 'in-adds': '3,5,10,9,4' } },
      { label: 'k=1', values: { 'in-k': '1', 'in-init': '-1', 'in-adds': '-2,-4,-3' } },
      { label: 'duplicates', values: { 'in-k': '2', 'in-init': '5,5,5', 'in-adds': '4,6,6' } },
      { label: 'growing', values: { 'in-k': '4', 'in-init': '1,2', 'in-adds': '3,4,5,6' } }
    ],
    `class KthLargest {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    int k;
    public KthLargest(int k, int[] nums) {
        this.k = k;
        for (int n : nums) add(n);
    }
    public int add(int val) {
        heap.offer(val);
        if (heap.size() > k) heap.poll();
        return heap.peek();
    }
}`,
    function () {
      const k = parseInt(text('in-k'), 10), h = [], F = [];
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, heap: h.slice(), metricA: h[0] ?? '-', metricB: `size ${h.length}/${k}`, items: [`k=${k}`] }, extra || {}));
      nums('in-init').forEach(n => { minPush(h, n); snap(5, `Initialize by adding ${n}.`); if (h.length > k) { const r = pop(h); snap(9, `Heap exceeded k, discard smallest ${r}.`); } });
      nums('in-adds').forEach(n => { minPush(h, n); snap(8, `add(${n}) enters the heap.`); if (h.length > k) { const r = pop(h); snap(9, `Remove ${r}; only k largest survive.`); } snap(10, `Return kth largest ${h[0]}.`, { result: `add(${n}) → ${h[0]}` }); });
      snap(10, `Current kth largest is ${h[0]}.`, { done: 'ok', result: `✓ kth = ${h[0]}` });
      return F;
    });

  CONFIGS.last_stone_weight = base('last_stone_weight', 'Last Stone Weight', '1046', 'Easy',
    ['Max-Heap Smash', 'O(n log n) time', 'O(n) space'],
    'Repeatedly smash the two heaviest stones and return the remaining weight.',
    'A max-heap keeps the two heaviest stones at the front of the story.',
    [{ id: 'in-arr', label: 'stones', value: '2,7,4,1,8,1' }],
    [
      { label: 'classic', values: { 'in-arr': '2,7,4,1,8,1' } },
      { label: 'tie smash', values: { 'in-arr': '10,10,3' } },
      { label: 'one left', values: { 'in-arr': '9,3,2,10' } },
      { label: 'single', values: { 'in-arr': '5' } }
    ],
    `class Solution {
    public int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder());
        for (int s : stones) pq.offer(s);
        while (pq.size() > 1) {
            int y = pq.poll(), x = pq.poll();
            if (y != x) pq.offer(y - x);
        }
        return pq.isEmpty() ? 0 : pq.peek();
    }
}`,
    function () {
      const h = [], F = [];
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, heap: h.slice(), metricA: h[0] ?? 0, metricB: 'heaviest', items: [] }, extra || {}));
      nums('in-arr').forEach(n => { maxPush(h, n); snap(4, `Push stone ${n}.`); });
      while (h.length > 1) { const y = pop(h), x = pop(h); snap(6, `Smash ${y} and ${x}.`); if (y !== x) { maxPush(h, y - x); snap(7, `Remainder ${y - x} goes back into the heap.`); } }
      snap(9, `Return ${h[0] ?? 0}.`, { done: 'ok', result: `✓ ${h[0] ?? 0}` });
      return F;
    });

  CONFIGS.k_closest_points = base('k_closest_points', 'K Closest Points to Origin', '973', 'Medium',
    ['Max-Heap of Size k', 'O(n log k) time', 'O(k) space'],
    'Return the k points closest to the origin.',
    'Keep a max-heap capped at k. The farthest current candidate sits at the root and gets evicted first.',
    [{ id: 'in-points', label: 'points as x,y separated by |', value: '1,3|-2,2|2,-2|5,8' }, { id: 'in-k', label: 'k', value: '2' }],
    [
      { label: 'classic', values: { 'in-points': '1,3|-2,2|2,-2|5,8', 'in-k': '2' } },
      { label: 'one', values: { 'in-points': '3,3|5,-1|-2,4', 'in-k': '1' } },
      { label: 'ties', values: { 'in-points': '1,1|-1,-1|2,0|0,2', 'in-k': '2' } },
      { label: 'all', values: { 'in-points': '0,1|2,2', 'in-k': '2' } }
    ],
    `class Solution {
    public int[][] kClosest(int[][] points, int k) {
        PriorityQueue<int[]> heap = new PriorityQueue<>((a,b) -> dist(b) - dist(a));
        for (int[] p : points) {
            heap.offer(p);
            if (heap.size() > k) heap.poll();
        }
        return heap.toArray(new int[k][]);
    }
}`,
    function () {
      const k = parseInt(text('in-k'), 10), h = [], F = [], dist = p => p[0] * p[0] + p[1] * p[1], label = p => `(${p[0]},${p[1]})`;
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, heap: h.map(p => ({ key: dist(p), label: label(p) })), metricA: h.length, metricB: `size/${k}`, items: h.map(p => `${label(p)} d²=${dist(p)}`) }, extra || {}));
      pointList('in-points').forEach(p => { h.push(p); h.sort((a, b) => dist(b) - dist(a)); snap(4, `Push ${label(p)} with distance² ${dist(p)}.`); if (h.length > k) { const r = h.shift(); snap(5, `Evict farthest ${label(r)}.`); } });
      snap(7, `Return ${h.map(label).join(', ')}.`, { done: 'ok', result: `✓ ${h.map(label).join(', ')}` });
      return F;
    });

  CONFIGS.kth_largest_array = base('kth_largest_array', 'Kth Largest Element in an Array', '215', 'Medium',
    ['Min-Heap of Size k', 'O(n log k) time', 'O(k) space'],
    'Return the kth largest element in an unsorted array.',
    'The heap keeps the k largest numbers seen so far; the root is the kth largest.',
    [{ id: 'in-arr', label: 'nums', value: '3,2,1,5,6,4' }, { id: 'in-k', label: 'k', value: '2' }],
    [
      { label: 'classic', values: { 'in-arr': '3,2,1,5,6,4', 'in-k': '2' } },
      { label: 'with dupes', values: { 'in-arr': '3,2,3,1,2,4,5,5,6', 'in-k': '4' } },
      { label: 'k=1', values: { 'in-arr': '7,4,6,3', 'in-k': '1' } },
      { label: 'negative', values: { 'in-arr': '-1,-5,0,4', 'in-k': '3' } }
    ],
    `class Solution {
    public int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int n : nums) {
            heap.offer(n);
            if (heap.size() > k) heap.poll();
        }
        return heap.peek();
    }
}`,
    function () {
      const k = parseInt(text('in-k'), 10), h = [], F = [];
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, heap: h.slice(), metricA: h[0] ?? '-', metricB: `size ${h.length}/${k}`, items: [] }, extra || {}));
      nums('in-arr').forEach(n => { minPush(h, n); snap(4, `Push ${n}.`); if (h.length > k) { const r = pop(h); snap(5, `Pop ${r}; it cannot be in the top ${k}.`); } });
      snap(8, `Root ${h[0]} is the kth largest.`, { done: 'ok', result: `✓ ${h[0]}` });
      return F;
    });

  CONFIGS.task_scheduler = base('task_scheduler', 'Task Scheduler', '621', 'Medium',
    ['Max-Heap + Cooldown', 'O(n log 26) time', 'O(1) alphabet'],
    'Schedule tasks with cooldown n using the fewest time intervals.',
    'Always run the task with the highest remaining count, then park it in cooldown until it can return.',
    [{ id: 'in-tasks', label: 'tasks', value: 'A,A,A,B,B,B' }, { id: 'in-n', label: 'cooldown n', value: '2' }],
    [
      { label: 'classic', values: { 'in-tasks': 'A,A,A,B,B,B', 'in-n': '2' } },
      { label: 'no idle', values: { 'in-tasks': 'A,A,A,B,B,B', 'in-n': '0' } },
      { label: 'long idle', values: { 'in-tasks': 'A,A,A,A,B,C', 'in-n': '2' } },
      { label: 'balanced', values: { 'in-tasks': 'A,A,B,B,C,C', 'in-n': '2' } }
    ],
    `class Solution {
    public int leastInterval(char[] tasks, int n) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Collections.reverseOrder());
        Queue<int[]> cooldown = new ArrayDeque<>();
        int time = 0;
        while (!heap.isEmpty() || !cooldown.isEmpty()) {
            time++;
            if (!heap.isEmpty()) runTaskAndCoolDown();
            if (!cooldown.isEmpty() && cooldown.peek()[1] == time) heap.offer(cooldown.poll()[0]);
        }
        return time;
    }
}`,
    function () {
      const freq = {}; text('in-tasks').split(',').map(s => s.trim()).filter(Boolean).forEach(c => freq[c] = (freq[c] || 0) + 1);
      const n = parseInt(text('in-n'), 10), h = Object.entries(freq).map(([ch, count]) => ({ ch, count })), cool = [], F = []; h.sort((a, b) => b.count - a.count);
      let time = 0;
      const heapView = () => h.map(x => ({ key: x.count, label: `${x.ch}:${x.count}` }));
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, heap: heapView(), metricA: time, metricB: 'time', items: [`cooldown ${cool.map(c => `${c.ch}@${c.ready}`).join(' ') || '-'}`] }, extra || {}));
      snap(3, 'Build a max-heap from task counts.');
      while (h.length || cool.length) {
        time++;
        for (let i = 0; i < cool.length;) { if (cool[i].ready <= time) { const r = cool.splice(i, 1)[0]; h.push({ ch: r.ch, count: r.count }); h.sort((a, b) => b.count - a.count); snap(8, `${r.ch} returns from cooldown.`); } else i++; }
        if (h.length) { const t = h.shift(); t.count--; snap(7, `Time ${time}: run ${t.ch}.`); if (t.count) cool.push({ ch: t.ch, count: t.count, ready: time + n + 1 }); }
        else snap(7, `Time ${time}: idle while tasks cool down.`);
      }
      snap(11, `Return total intervals ${time}.`, { done: 'ok', result: `✓ ${time}` });
      return F;
    });

  CONFIGS.design_twitter = base('design_twitter', 'Design Twitter', '355', 'Medium',
    ['K-Way Merge Feed', 'O(F log F)', 'Heap of latest tweets'],
    'Design posting, following, and a 10-item news feed.',
    'Each user’s tweets are already newest-first. A max-heap merges one current tweet per followed user.',
    [{ id: 'in-script', label: 'script', multiline: true, value: 'post 1 5\npost 2 6\nfollow 1 2\nfeed 1\npost 2 7\nfeed 1' }],
    [
      { label: 'follow feed', values: { 'in-script': 'post 1 5\npost 2 6\nfollow 1 2\nfeed 1\npost 2 7\nfeed 1' } },
      { label: 'self only', values: { 'in-script': 'post 1 10\npost 1 11\nfeed 1' } },
      { label: 'unfollow', values: { 'in-script': 'post 1 5\npost 2 6\nfollow 1 2\nunfollow 1 2\nfeed 1' } }
    ],
    `class Twitter {
    Map<Integer, Set<Integer>> follows = new HashMap<>();
    Map<Integer, List<Tweet>> tweets = new HashMap<>();
    public List<Integer> getNewsFeed(int userId) {
        PriorityQueue<Tweet> heap = new PriorityQueue<>((a,b) -> b.time - a.time);
        seedLatestTweetFromUserAndFollowees(heap, userId);
        while (!heap.isEmpty() && feed.size() < 10) popNewestThenPushOlderFromSameUser();
        return feed;
    }
}`,
    function () {
      const tweets = {}, follows = {}, F = []; let time = 0, h = [], feed = [];
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, heap: h.map(t => ({ key: t.time, label: `u${t.u}:#${t.id}` })), metricA: feed.length, metricB: 'feed size', items: [`feed ${arr(feed)}`] }, extra || {}));
      text('in-script').split(/\n+/).map(s => s.trim()).filter(Boolean).forEach(line => {
        const [op, a, b] = line.split(/\s+/); const u = parseInt(a, 10), v = parseInt(b, 10);
        if (op === 'post') { (tweets[u] ||= []).unshift({ u, id: v, time: ++time, idx: 0 }); snap(2, `User ${u} posts tweet ${v}.`); }
        else if (op === 'follow') { (follows[u] ||= new Set()).add(v); snap(2, `User ${u} follows ${v}.`); }
        else if (op === 'unfollow') { follows[u]?.delete(v); snap(2, `User ${u} unfollows ${v}.`); }
        else if (op === 'feed') {
          feed = []; h = []; const users = new Set([u, ...(follows[u] || [])]);
          users.forEach(x => { if (tweets[x]?.length) h.push(Object.assign({}, tweets[x][0], { source: x, idx: 0 })); });
          h.sort((x, y) => y.time - x.time); snap(5, `Seed heap with latest tweets for user ${u}'s feed.`);
          while (h.length && feed.length < 10) { const t = h.shift(); feed.push(t.id); snap(6, `Pop newest tweet ${t.id}.`); const next = tweets[t.source][t.idx + 1]; if (next) { h.push(Object.assign({}, next, { source: t.source, idx: t.idx + 1 })); h.sort((x, y) => y.time - x.time); snap(6, `Push older tweet from user ${t.source}.`); } }
        }
      });
      snap(7, 'Script complete.', { done: 'ok', result: `✓ feed ${arr(feed)}` });
      return F;
    });

  CONFIGS.find_median_data_stream = base('find_median_data_stream', 'Find Median from Data Stream', '295', 'Hard',
    ['Two Heaps', 'O(log n) add', 'O(1) median'],
    'Continuously add numbers and return the current median.',
    'A max-heap stores the lower half and a min-heap stores the upper half. The median lives at their roots.',
    [{ id: 'in-arr', label: 'stream', value: '1,2,3,4,5' }],
    [
      { label: 'ascending', values: { 'in-arr': '1,2,3,4,5' } },
      { label: 'mixed', values: { 'in-arr': '5,15,1,3' } },
      { label: 'duplicates', values: { 'in-arr': '2,2,2,2' } },
      { label: 'negative', values: { 'in-arr': '-1,-2,-3,4' } }
    ],
    `class MedianFinder {
    PriorityQueue<Integer> small = new PriorityQueue<>(Collections.reverseOrder());
    PriorityQueue<Integer> large = new PriorityQueue<>();
    public void addNum(int num) {
        small.offer(num);
        large.offer(small.poll());
        if (large.size() > small.size()) small.offer(large.poll());
    }
    public double findMedian() {
        if (small.size() > large.size()) return small.peek();
        return (small.peek() + large.peek()) / 2.0;
    }
}`,
    function () {
      const small = [], large = [], F = [];
      const median = () => small.length > large.length ? small[0] : (small[0] + large[0]) / 2;
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, heap: small.map(x => ({ key: x, label: `S:${x}` })).concat(large.map(x => ({ key: -x, label: `L:${x}` }))), metricA: small.length && large.length ? median() : small[0] ?? '-', metricB: 'median', items: [`small ${arr(small)}`, `large ${arr(large)}`] }, extra || {}));
      nums('in-arr').forEach(n => { maxPush(small, n); snap(4, `Add ${n} into small.`); minPush(large, pop(small)); snap(5, 'Move small root to large to preserve ordering.'); if (large.length > small.length) { maxPush(small, pop(large)); snap(6, 'Rebalance so small has at least as many values.'); } snap(10, `Median is ${median()}.`, { result: `median ${median()}` }); });
      snap(10, `Final median is ${median()}.`, { done: 'ok', result: `✓ median = ${median()}` });
      return F;
    });

  function mountShell(cfg) {
    document.title = `${cfg.title} — Interactive Visualization`;
    document.getElementById('problem-title').textContent = cfg.title;
    document.getElementById('lc-chip').textContent = `LC ${cfg.lc}`;
    document.getElementById('difficulty-chip').textContent = cfg.difficulty;
    document.getElementById('difficulty-chip').className = `chip ${cfg.difficulty.toLowerCase()}`;
    document.getElementById('hero-chips').innerHTML = cfg.headerChips.map((c, i) => `<span class="chip ${i === 0 ? 'accent' : ''}">${esc(c)}</span>`).join('');
    document.getElementById('problem-copy').innerHTML = `<p>${cfg.problem}</p>`;
    document.getElementById('intuition-copy').innerHTML = `<p>${cfg.intuition}</p>`;
    document.getElementById('input-fields').innerHTML = cfg.inputs.map(inp => `<div class="field"><label for="${inp.id}">${inp.label}</label>${inp.multiline ? `<textarea id="${inp.id}" class="op-script">${esc(inp.value)}</textarea>` : `<input id="${inp.id}" value="${esc(inp.value)}">`}</div>`).join('');
    document.getElementById('preset-row').innerHTML = cfg.presets.map((p, i) => `<button class="preset-btn" data-preset="${i}">${p.label}</button>`).join('');
    document.getElementById('narration').innerHTML = `<p>${cfg.intuition}</p>`;
  }

  function init(key) {
    const cfg = CONFIGS[key];
    if (!cfg) throw new Error(`Unknown heap problem: ${key}`);
    mountShell(cfg);
    const viz = Viz.init({ code: cfg.code, buildFrames: cfg.build, render: cfg.render });
    document.getElementById('run-btn').addEventListener('click', () => viz.run());
    document.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
      Object.entries(cfg.presets[Number(btn.dataset.preset)].values).forEach(([id, value]) => { document.getElementById(id).value = value; });
      viz.run();
    }));
    document.getElementById('narrate-btn').addEventListener('click', function () {
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); this.textContent = '🔊 Narrate'; return; }
      const u = new SpeechSynthesisUtterance(document.getElementById('narration').innerText);
      u.onend = () => (this.textContent = '🔊 Narrate');
      this.textContent = '⏹ Stop';
      speechSynthesis.speak(u);
    });
    viz.run();
  }

  return { init };
})();
