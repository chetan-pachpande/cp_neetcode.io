window.StackPage = (function () {
  'use strict';

  const esc = (s) => Viz.escapeHtml(String(s));
  const arr = (a) => `[${a.join(', ')}]`;
  const nums = (id) => document.getElementById(id).value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
  const toks = (id) => document.getElementById(id).value.split(',').map(s => s.trim()).filter(Boolean);
  const str = (id) => document.getElementById(id).value;

  function htmlList(items) {
    return items.length ? items.map(x => `<span class="solution-chip">${esc(x)}</span>`).join('') : '<span style="color:var(--text-3);font-size:.8rem;">empty</span>';
  }
  function renderStackSvg(f) {
    const values = f.values || [];
    const gap = 48, y = 58, w = Math.max(300, values.length * gap + 56), h = 130;
    const x = i => 30 + i * gap;
    let svg = '';
    values.forEach((v, i) => {
      const cls = i === f.active ? 'active' : (f.okIds || []).includes(i) ? 'ok' : (f.badIds || []).includes(i) ? 'bad' : (f.stackIds || []).includes(i) ? 'warn' : '';
      svg += `<g class="stack-cell ${cls}"><rect x="${x(i) - 19}" y="${y - 19}" width="38" height="38" rx="7"></rect><text x="${x(i)}" y="${y}">${esc(v)}</text></g>`;
      svg += `<text class="tree-sub" x="${x(i)}" y="${y + 34}">${i}</text>`;
    });
    if ((f.stackIds || []).length) {
      const ids = f.stackIds.filter(i => i < values.length);
      if (ids.length) {
        const left = x(Math.min(...ids)) - 24, right = x(Math.max(...ids)) + 24;
        svg += `<path class="stack-brace" d="M${left} 106 H${right}"/><text class="tree-sub" x="${(left + right) / 2}" y="122">stack memory</text>`;
      }
    }
    return `<svg class="stack-svg" viewBox="0 0 ${w} ${h}">${svg}</svg>`;
  }
  function render(f) {
    document.getElementById('stage-main').innerHTML = f.values ? renderStackSvg(f) : '';
    document.getElementById('stage-list').innerHTML = htmlList(f.items || []);
    document.getElementById('state-a').textContent = f.metricA ?? '-';
    document.getElementById('state-b').textContent = f.metricB ?? '-';
    const res = document.getElementById('result');
    res.className = 'result-banner' + (f.done ? ` show ${f.done}` : '');
    res.textContent = f.result || '';
  }
  function base(key, title, lc, difficulty, chips, problem, intuition, inputs, presets, code, build) {
    return { key, title, lc, difficulty, chips, problem, intuition, inputs, presets, code, build, render };
  }

  const CONFIGS = {};

  CONFIGS.valid_parentheses = base(
    'valid_parentheses', 'Valid Parentheses', '20', 'Easy',
    ['Matching Stack', '⏱ O(n) time', '💾 O(n) stack'],
    'Return true if every opening bracket is closed by the same type in the correct order.',
    'Opening brackets wait on the stack. A closing bracket must match the most recent opener.',
    [{ id: 'in-s', label: 's', value: '({[]})' }],
    [
      { label: 'nested', values: { 'in-s': '({[]})' } },
      { label: 'bad order', values: { 'in-s': '([)]' } },
      { label: 'simple', values: { 'in-s': '()[]{}' } }
    ],
    `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') stack.push(c);
            else if (stack.isEmpty() || !matches(stack.pop(), c)) return false;
        }
        return stack.isEmpty();
    }
}`,
    function () {
      const a = [...str('in-s')], stack = [], F = [], pairs = { ')': '(', ']': '[', '}': '{' };
      const snap = (line, msg, i, extra) => F.push(Object.assign({ line, msg, values: a, active: i, items: stack.slice(), metricA: stack.length, metricB: 'stack' }, extra || {}));
      for (let i = 0; i < a.length; i++) {
        const c = a[i]; snap(4, `Read ${c}.`, i);
        if ('([{'.includes(c)) { stack.push(c); snap(5, `Push opener ${c}.`, i); }
        else {
          if (!stack.length || stack.pop() !== pairs[c]) { snap(6, `${c} does not match the stack top.`, i, { done: 'bad', result: '✗ false', badIds: [i] }); return F; }
          snap(6, `${c} matches the most recent opener.`, i, { okIds: [i] });
        }
      }
      const ok = stack.length === 0;
      snap(8, ok ? 'Stack is empty, all brackets matched.' : 'Openers remain unmatched.', null, { done: ok ? 'ok' : 'bad', result: ok ? '✓ true' : '✗ false' });
      return F;
    }
  );

  CONFIGS.min_stack = base(
    'min_stack', 'Min Stack', '155', 'Medium',
    ['Two Stacks', '⏱ O(1) ops', '💾 O(n) space'],
    'Design a stack that supports push, pop, top, and getMin in constant time.',
    'A second stack stores the minimum at each depth, so the current min is always on top.',
    [{ id: 'in-ops', label: 'operations', value: 'push 5,push 2,push 7,getMin,pop,top,getMin' }],
    [
      { label: 'mixed', values: { 'in-ops': 'push 5,push 2,push 7,getMin,pop,top,getMin' } },
      { label: 'descending', values: { 'in-ops': 'push 3,push 2,push 1,getMin,pop,getMin' } },
      { label: 'single', values: { 'in-ops': 'push 9,top,getMin' } }
    ],
    `class MinStack {
    Stack<Integer> stack = new Stack<>();
    Stack<Integer> mins = new Stack<>();
    public void push(int val) {
        stack.push(val);
        mins.push(mins.isEmpty() ? val : Math.min(val, mins.peek()));
    }
    public void pop() { stack.pop(); mins.pop(); }
    public int top() { return stack.peek(); }
    public int getMin() { return mins.peek(); }
}`,
    function () {
      const ops = toks('in-ops'), st = [], mins = [], F = [];
      const snap = (line, msg, i, extra) => F.push(Object.assign({ line, msg, values: ops, active: i, items: [`stack ${arr(st)}`, `mins ${arr(mins)}`], metricA: st.length ? st[st.length - 1] : '-', metricB: mins.length ? mins[mins.length - 1] : '-' }, extra || {}));
      ops.forEach((op, i) => {
        const [name, raw] = op.split(/\s+/);
        if (name === 'push') { const v = parseInt(raw, 10); st.push(v); mins.push(mins.length ? Math.min(v, mins[mins.length - 1]) : v); snap(4, `Push ${v}; mirror min is ${mins[mins.length - 1]}.`, i); }
        else if (name === 'pop') { st.pop(); mins.pop(); snap(7, 'Pop both stacks to keep depths aligned.', i); }
        else if (name === 'top') snap(8, `Top is ${st[st.length - 1]}.`, i);
        else if (name === 'getMin') snap(9, `Current minimum is ${mins[mins.length - 1]}.`, i);
      });
      snap(9, 'Operations complete.', null, { done: 'ok', result: `✓ min = ${mins.length ? mins[mins.length - 1] : '-'}` });
      return F;
    }
  );

  CONFIGS.evaluate_reverse_polish_notation = base(
    'evaluate_reverse_polish_notation', 'Evaluate Reverse Polish Notation', '150', 'Medium',
    ['Operand Stack', '⏱ O(n) time', '💾 O(n) stack'],
    'Evaluate an arithmetic expression written in Reverse Polish Notation.',
    'Numbers wait on the stack. An operator consumes the last two numbers and pushes the result.',
    [{ id: 'in-tokens', label: 'tokens', value: '2,1,+,3,*' }],
    [
      { label: '(2+1)*3', values: { 'in-tokens': '2,1,+,3,*' } },
      { label: 'division', values: { 'in-tokens': '4,13,5,/,+' } },
      { label: 'mixed', values: { 'in-tokens': '10,6,9,3,+,-11,*,/,*,17,+,5,+' } }
    ],
    `class Solution {
    public int evalRPN(String[] tokens) {
        Stack<Integer> stack = new Stack<>();
        for (String t : tokens) {
            if ("+-*/".contains(t)) {
                int b = stack.pop(), a = stack.pop();
                stack.push(apply(a, b, t));
            } else stack.push(Integer.parseInt(t));
        }
        return stack.pop();
    }
}`,
    function () {
      const a = toks('in-tokens'), st = [], F = [];
      const calc = (x, y, op) => op === '+' ? x + y : op === '-' ? x - y : op === '*' ? x * y : Math.trunc(x / y);
      const snap = (line, msg, i, extra) => F.push(Object.assign({ line, msg, values: a, active: i, items: st.slice(), metricA: st.length, metricB: 'stack' }, extra || {}));
      a.forEach((t, i) => {
        if ('+-*/'.includes(t) && t.length === 1) { const b = st.pop(), a0 = st.pop(), v = calc(a0, b, t); snap(6, `${t} consumes ${a0} and ${b}.`, i); st.push(v); snap(7, `Push result ${v}.`, i); }
        else { st.push(parseInt(t, 10)); snap(8, `Push number ${t}.`, i); }
      });
      snap(10, `Return ${st[0]}.`, null, { done: 'ok', result: `✓ ${st[0]}` });
      return F;
    }
  );

  CONFIGS.generate_parentheses = base(
    'generate_parentheses', 'Generate Parentheses', '22', 'Medium',
    ['Backtracking Stack', '⏱ Catalan', '💾 O(n) path'],
    'Generate all well-formed parentheses strings using n pairs.',
    'The path can add "(" while openers remain, and ")" only when it would close an existing opener.',
    [{ id: 'in-n', label: 'n', value: '3' }],
    [
      { label: 'n=3', values: { 'in-n': '3' } },
      { label: 'n=2', values: { 'in-n': '2' } },
      { label: 'n=1', values: { 'in-n': '1' } }
    ],
    `class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> res = new ArrayList<>();
        backtrack(res, new StringBuilder(), 0, 0, n);
        return res;
    }
    private void backtrack(List<String> res, StringBuilder path, int open, int close, int n) {
        if (path.length() == 2 * n) { res.add(path.toString()); return; }
        if (open < n) { path.append('('); backtrack(res, path, open + 1, close, n); path.deleteCharAt(path.length() - 1); }
        if (close < open) { path.append(')'); backtrack(res, path, open, close + 1, n); path.deleteCharAt(path.length() - 1); }
    }
}`,
    function () {
      const n = parseInt(document.getElementById('in-n').value, 10), F = [], path = [], out = [];
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, values: path.length ? path : ['∅'], active: path.length - 1, items: out.slice(-8), metricA: `${out.length}`, metricB: `${path.length}/${2 * n}` }, extra || {}));
      function dfs(open, close) {
        snap(7, `Path "${path.join('')}". open=${open}, close=${close}.`);
        if (path.length === 2 * n) { out.push(path.join('')); snap(8, `Complete string ${path.join('')}.`); return; }
        if (open < n) { path.push('('); snap(9, 'Add an opener.'); dfs(open + 1, close); path.pop(); }
        if (close < open) { path.push(')'); snap(10, 'Add a closer that keeps balance.'); dfs(open, close + 1); path.pop(); }
      }
      dfs(0, 0);
      snap(5, `Return ${out.length} strings.`, { done: 'ok', result: `✓ ${out.length} combinations`, items: out });
      return F;
    }
  );

  CONFIGS.daily_temperatures = base(
    'daily_temperatures', 'Daily Temperatures', '739', 'Medium',
    ['Monotonic Stack', '⏱ O(n) time', '💾 O(n) stack'],
    'For each day, return how many days must pass until a warmer temperature.',
    'The stack stores unresolved colder days. A warmer day resolves everything colder on top.',
    [{ id: 'in-arr', label: 'temperatures', value: '73,74,75,71,69,72,76,73' }],
    [
      { label: 'classic', values: { 'in-arr': '73,74,75,71,69,72,76,73' } },
      { label: 'rising', values: { 'in-arr': '30,40,50,60' } },
      { label: 'falling', values: { 'in-arr': '60,50,40' } }
    ],
    `class Solution {
    public int[] dailyTemperatures(int[] temperatures) {
        int[] ans = new int[temperatures.length];
        Stack<Integer> stack = new Stack<>();
        for (int i = 0; i < temperatures.length; i++) {
            while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
                int prev = stack.pop();
                ans[prev] = i - prev;
            }
            stack.push(i);
        }
        return ans;
    }
}`,
    function () {
      const a = nums('in-arr'), st = [], ans = Array(a.length).fill(0), F = [];
      const snap = (line, msg, i, extra) => F.push(Object.assign({ line, msg, values: a, active: i, stackIds: st.slice(), okIds: ans.map((v, idx) => v ? idx : -1).filter(i => i >= 0), items: [`stack ${arr(st)}`, `ans ${arr(ans)}`], metricA: st.length, metricB: 'waiting' }, extra || {}));
      for (let i = 0; i < a.length; i++) {
        snap(5, `Day ${i} is ${a[i]} degrees.`, i);
        while (st.length && a[i] > a[st[st.length - 1]]) { const p = st.pop(); ans[p] = i - p; snap(7, `${a[i]} warms day ${p}; wait ${ans[p]} day(s).`, i); }
        st.push(i); snap(10, `Push day ${i} as unresolved.`, i);
      }
      snap(12, `Return ${arr(ans)}.`, null, { done: 'ok', result: `✓ ${arr(ans)}` });
      return F;
    }
  );

  CONFIGS.car_fleet = base(
    'car_fleet', 'Car Fleet', '853', 'Medium',
    ['Arrival-Time Stack', '⏱ O(n log n)', '💾 O(n) sort'],
    'Count how many car fleets arrive at the target.',
    'Sort cars by position from nearest to farthest. A slower fleet ahead absorbs faster cars behind it.',
    [{ id: 'in-target', label: 'target', value: '12' }, { id: 'in-pos', label: 'position', value: '10,8,0,5,3' }, { id: 'in-speed', label: 'speed', value: '2,4,1,1,3' }],
    [
      { label: 'classic', values: { 'in-target': '12', 'in-pos': '10,8,0,5,3', 'in-speed': '2,4,1,1,3' } },
      { label: 'one fleet', values: { 'in-target': '10', 'in-pos': '3', 'in-speed': '3' } },
      { label: 'three', values: { 'in-target': '100', 'in-pos': '0,2,4', 'in-speed': '4,2,1' } }
    ],
    `class Solution {
    public int carFleet(int target, int[] position, int[] speed) {
        double last = 0;
        int fleets = 0;
        int[][] cars = sortByPositionDescending(position, speed);
        for (int[] car : cars) {
            double time = (double)(target - car[0]) / car[1];
            if (time > last) { fleets++; last = time; }
        }
        return fleets;
    }
}`,
    function () {
      const target = parseInt(document.getElementById('in-target').value, 10);
      const p = nums('in-pos'), s = nums('in-speed');
      const cars = p.map((pos, i) => ({ pos, speed: s[i], time: (target - pos) / s[i] })).sort((a, b) => b.pos - a.pos);
      const labels = cars.map(c => `${c.pos}@${c.speed}`), F = [];
      let fleets = 0, last = 0;
      const snap = (line, msg, i, extra) => F.push(Object.assign({ line, msg, values: labels, active: i, items: [`last ${last.toFixed(2)}`, `fleets ${fleets}`], metricA: fleets, metricB: 'fleets' }, extra || {}));
      cars.forEach((c, i) => {
        snap(7, `Car at ${c.pos} reaches in ${c.time.toFixed(2)} hours.`, i);
        if (c.time > last) { fleets++; last = c.time; snap(8, 'It cannot catch the fleet ahead, so it forms a new fleet.', i, { okIds: [i] }); }
        else snap(8, 'It catches the slower fleet ahead and merges.', i, { stackIds: [i] });
      });
      snap(10, `Return ${fleets}.`, null, { done: 'ok', result: `✓ fleets = ${fleets}` });
      return F;
    }
  );

  CONFIGS.largest_rectangle_in_histogram = base(
    'largest_rectangle_in_histogram', 'Largest Rectangle in Histogram', '84', 'Hard',
    ['Monotonic Bar Stack', '⏱ O(n) time', '💾 O(n) stack'],
    'Return the area of the largest rectangle that can be formed in the histogram.',
    'A lower bar reveals the right boundary for taller bars waiting on the stack. Pop, measure width, update best.',
    [{ id: 'in-arr', label: 'heights', value: '2,1,5,6,2,3' }],
    [
      { label: 'classic', values: { 'in-arr': '2,1,5,6,2,3' } },
      { label: 'pair', values: { 'in-arr': '2,4' } },
      { label: 'ramp', values: { 'in-arr': '1,2,3,4,5' } }
    ],
    `class Solution {
    public int largestRectangleArea(int[] heights) {
        Stack<Integer> stack = new Stack<>();
        int best = 0;
        for (int i = 0; i <= heights.length; i++) {
            int cur = i == heights.length ? 0 : heights[i];
            while (!stack.isEmpty() && cur < heights[stack.peek()]) {
                int h = heights[stack.pop()];
                int w = stack.isEmpty() ? i : i - stack.peek() - 1;
                best = Math.max(best, h * w);
            }
            stack.push(i);
        }
        return best;
    }
}`,
    function () {
      const a = nums('in-arr'), st = [], F = [];
      let best = 0;
      const snap = (line, msg, i, extra) => F.push(Object.assign({ line, msg, values: a, active: i < a.length ? i : null, stackIds: st.filter(x => x < a.length), items: [`stack ${arr(st)}`, `best ${best}`], metricA: best, metricB: 'area' }, extra || {}));
      for (let i = 0; i <= a.length; i++) {
        const cur = i === a.length ? 0 : a[i];
        snap(5, i === a.length ? 'Sentinel bar clears the stack.' : `Process bar ${i} height ${cur}.`, i);
        while (st.length && cur < a[st[st.length - 1]]) {
          const top = st.pop(), h = a[top], w = st.length ? i - st[st.length - 1] - 1 : i, area = h * w;
          best = Math.max(best, area);
          snap(9, `Pop ${top}: height ${h}, width ${w}, area ${area}. Best ${best}.`, i, { okIds: [top] });
        }
        st.push(i); snap(12, `Push index ${i}.`, i);
      }
      snap(14, `Return ${best}.`, null, { done: 'ok', result: `✓ area = ${best}` });
      return F;
    }
  );

  function mountShell(cfg) {
    document.title = `${cfg.title} — Interactive Visualization`;
    document.getElementById('problem-title').textContent = cfg.title;
    document.getElementById('lc-chip').textContent = `LC ${cfg.lc}`;
    document.getElementById('difficulty-chip').textContent = cfg.difficulty;
    document.getElementById('difficulty-chip').className = `chip ${cfg.difficulty.toLowerCase()}`;
    document.getElementById('hero-chips').innerHTML = cfg.chips.map((c, i) => `<span class="chip ${i === 0 ? 'accent' : ''}">${esc(c)}</span>`).join('');
    document.getElementById('problem-copy').innerHTML = `<p>${cfg.problem}</p>`;
    document.getElementById('intuition-copy').innerHTML = `<p>${cfg.intuition}</p>`;
    document.getElementById('input-fields').innerHTML = cfg.inputs.map(inp => `<div class="field"><label for="${inp.id}">${inp.label}</label><input id="${inp.id}" value="${esc(inp.value)}"></div>`).join('');
    document.getElementById('preset-row').innerHTML = cfg.presets.map((p, i) => `<button class="preset-btn" data-preset="${i}">${p.label}</button>`).join('');
    document.getElementById('narration').innerHTML = `<p>${cfg.intuition}</p>`;
  }

  function init(key) {
    const cfg = CONFIGS[key];
    if (!cfg) throw new Error(`Unknown stack problem: ${key}`);
    mountShell(cfg);
    const viz = Viz.init({ code: cfg.code, buildFrames: cfg.build, render: cfg.render });
    document.getElementById('run-btn').addEventListener('click', () => viz.run());
    document.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
      const preset = cfg.presets[Number(btn.dataset.preset)];
      Object.entries(preset.values).forEach(([id, value]) => { document.getElementById(id).value = value; });
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
