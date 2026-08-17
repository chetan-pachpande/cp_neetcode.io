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
        const c = a[i]; snap(4, `Read '${c}' — check whether it opens a new bracket or closes one that's already waiting.`, i);
        if ('([{'.includes(c)) { stack.push(c); snap(5, `'${c}' is an opening bracket, so push it onto the stack — it now sits there waiting for its matching closer to show up later.`, i); }
        else {
          if (!stack.length || stack.pop() !== pairs[c]) { snap(6, `'${c}' is a closing bracket, but the stack is empty or its top isn't the matching opener — there's nothing valid for '${c}' to close. The string can't be valid, so return false immediately.`, i, { done: 'bad', result: '✗ false', badIds: [i] }); return F; }
          snap(6, `'${c}' correctly closes the most recent unmatched opener — pop it off, since that pair is now fully resolved and out of the way.`, i, { okIds: [i] });
        }
      }
      const ok = stack.length === 0;
      snap(8, ok ? 'Every character has been read and the stack is empty — each opener found its matching closer in the correct order, so the string is valid.' : `Every character has been read, but ${stack.length} opener(s) are still sitting on the stack with no closer — the string is missing brackets, so it's invalid.`, null, { done: ok ? 'ok' : 'bad', result: ok ? '✓ true' : '✗ false' });
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
        if (name === 'push') { const v = parseInt(raw, 10); st.push(v); mins.push(mins.length ? Math.min(v, mins[mins.length - 1]) : v); snap(4, `push(${v}): store it on the main stack, and also push min(${v}, previous min) = ${mins[mins.length - 1]} onto a second "mirror" stack — this remembers the minimum as it stood at this exact depth, not just the overall minimum.`, i); }
        else if (name === 'pop') { st.pop(); mins.pop(); snap(7, "pop(): remove the top of both stacks together. Since they were pushed in lockstep, popping both keeps the mirror stack's top equal to the minimum of whatever remains on the main stack — no rescanning needed.", i); }
        else if (name === 'top') snap(8, `top(): just peek — the main stack's top element is ${st[st.length - 1]}, nothing is removed or changed.`, i);
        else if (name === 'getMin') snap(9, `getMin(): peek the mirror stack instead of scanning the main one — its top, ${mins[mins.length - 1]}, was already computed as the running minimum back when it was pushed, so this is O(1).`, i);
      });
      snap(9, 'All operations replayed. Because every push recorded its own running minimum alongside it, getMin never has to scan the stack — it stays O(1) no matter how deep the stack gets.', null, { done: 'ok', result: `✓ min = ${mins.length ? mins[mins.length - 1] : '-'}` });
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
        if ('+-*/'.includes(t) && t.length === 1) { const b = st.pop(), a0 = st.pop(), v = calc(a0, b, t); snap(6, `'${t}' is an operator — pop the two most recent operands. They come off in reverse order (${b} first, then ${a0}), so the expression being evaluated is ${a0} ${t} ${b}.`, i); st.push(v); snap(7, `Compute ${a0} ${t} ${b} = ${v} and push it back onto the stack — it now stands in for both operands it just consumed, ready for whatever operator needs it next.`, i); }
        else { st.push(parseInt(t, 10)); snap(8, `'${t}' is a plain number, not an operator — push it onto the stack to wait until some later operator needs it as an operand.`, i); }
      });
      snap(10, `Every token has been consumed and exactly one value remains on the stack — that's the fully-reduced result of the expression. Return ${st[0]}.`, null, { done: 'ok', result: `✓ ${st[0]}` });
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
        snap(7, `At path "${path.join('') || '∅'}" with ${open} opener(s) and ${close} closer(s) placed so far — decide what can legally come next.`);
        if (path.length === 2 * n) { out.push(path.join('')); snap(8, `Path "${path.join('')}" has used all ${2 * n} characters and every opener has been closed — this is a complete, well-formed combination. Record it, then backtrack to explore other branches.`); return; }
        if (open < n) { path.push('('); snap(9, `Only ${open} of ${n} openers have been used — there's still room, so try adding '(' and recurse deeper before undoing it.`); dfs(open + 1, close); path.pop(); }
        if (close < open) { path.push(')'); snap(10, `${close} closer(s) are placed against ${open} opener(s), so close < open — adding ')' here still leaves a prefix that could legally continue, so try it and recurse.`); dfs(open, close + 1); path.pop(); }
      }
      dfs(0, 0);
      snap(5, `Every legal placement of openers and closers has been explored — found ${out.length} distinct well-formed combinations using ${n} pair(s).`, { done: 'ok', result: `✓ ${out.length} combinations`, items: out });
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
        snap(5, `Day ${i} is ${a[i]}° — compare it against whichever colder day is currently waiting on top of the stack.`, i);
        while (st.length && a[i] > a[st[st.length - 1]]) { const p = st.pop(); ans[p] = i - p; snap(7, `${a[i]}° is warmer than day ${p}'s temperature, so day ${p} finally has its answer: wait ${ans[p]} day(s). Pop it and keep checking — this same warm day might resolve several colder days waiting beneath it.`, i); }
        st.push(i); snap(10, `No day left on the stack is colder than day ${i} (or the stack is now empty) — push day ${i}; it becomes the new "waiting for warmth" day for whatever colder day comes next.`, i);
      }
      snap(12, `Every day has been processed. Days that never found a warmer day ahead were never popped, so they keep their default wait of 0. Return ${arr(ans)}.`, null, { done: 'ok', result: `✓ ${arr(ans)}` });
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
        const prevLast = last;
        snap(7, `Car starting at position ${c.pos} (speed ${c.speed}) would take ${c.time.toFixed(2)} hours to reach the target on its own — compare that against the slowest fleet already ahead of it (closer to the target) to see if it can catch up.`, i);
        if (c.time > prevLast) { fleets++; last = c.time; snap(8, `${c.time.toFixed(2)}h is slower than the fleet ahead of it (${i === 0 ? 'no fleet yet — it is the first car' : prevLast.toFixed(2) + 'h'}) — this car can never catch up before the target, so it arrives on its own schedule and becomes a brand-new fleet.`, i, { okIds: [i] }); }
        else snap(8, `${c.time.toFixed(2)}h is not slower than the fleet ahead of it (${prevLast.toFixed(2)}h) — this car would reach that point at or before the fleet ahead, so it's forced to slow down and bunch up behind it instead of passing. It merges into that fleet rather than forming its own.`, i, { stackIds: [i] });
      });
      snap(10, `Every car has been processed from closest to the target to farthest — each one either started a new fleet or merged into the one immediately ahead. ${fleets} distinct fleet(s) arrive. Return ${fleets}.`, null, { done: 'ok', result: `✓ fleets = ${fleets}` });
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
        snap(5, i === a.length ? 'Add an imaginary sentinel bar of height 0 past the end — this forces every bar still on the stack to finally be resolved, since nothing is left that could extend their rectangles further.' : `Bar ${i} has height ${cur} — while it's shorter than the bar on top of the stack, that taller bar can't extend any further right, so its rectangle's width is now fully determined.`, i);
        while (st.length && cur < a[st[st.length - 1]]) {
          const top = st.pop(), h = a[top], w = st.length ? i - st[st.length - 1] - 1 : i, area = h * w;
          best = Math.max(best, area);
          snap(9, `Pop bar ${top} (height ${h}): its rectangle's right edge stops just before ${i}, and its left edge is bounded by whatever bar is now exposed on the stack (or the very start, if the stack is empty) — width = ${w}. Area = ${h} × ${w} = ${area}. Best so far: ${best}.`, i, { okIds: [top] });
        }
        st.push(i); snap(12, `Bar ${i} is not shorter than the stack's current top — push it. Keeping the stack in increasing height order means every bar's eventual left boundary is exactly the nearest bar to its left that's shorter than it.`, i);
      }
      snap(14, `The sentinel forced every remaining bar to be resolved — the largest rectangle found has area ${best}. Return ${best}.`, null, { done: 'ok', result: `✓ area = ${best}` });
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
