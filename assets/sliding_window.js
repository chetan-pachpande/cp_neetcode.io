window.SlidingWindowPage = (function () {
  'use strict';

  const esc = (s) => Viz.escapeHtml(String(s));
  const arr = (a) => `[${a.join(', ')}]`;

  function nums(id) {
    return document.getElementById(id).value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
  }
  function str(id) { return document.getElementById(id).value; }
  function htmlList(items) {
    return items.length ? items.map(x => `<span class="solution-chip">${esc(x)}</span>`).join('') : '<span style="color:var(--text-3);font-size:.8rem;">empty</span>';
  }
  function cellsFrom(values, clsFn) {
    return Viz.cells(values.map((v, i) => ({ v, idx: i, cls: clsFn ? clsFn(v, i) : '' })));
  }
  function renderWindowSvg(values, f) {
    const gap = 48, y = 62, w = Math.max(300, values.length * gap + 52), h = 128;
    const x = i => 28 + i * gap;
    let svg = '';
    if (f.l != null && f.r != null) {
      const left = x(f.l) - 20, right = x(f.r) + 20;
      svg += `<rect class="sw-window ${f.windowBad ? 'bad' : ''}" x="${left}" y="25" width="${right - left}" height="58" rx="10"/>`;
      svg += `<text class="tree-sub" x="${(left + right) / 2}" y="104">window ${f.l}..${f.r}</text>`;
    }
    values.forEach((v, i) => {
      const cls = i === f.active ? 'active' : f.doneIds && f.doneIds.includes(i) ? 'ok' : f.l != null && f.r != null && i >= f.l && i <= f.r ? (f.windowBad ? 'warn' : 'ok') : '';
      svg += `<g class="sw-cell ${cls}"><rect x="${x(i) - 18}" y="${y - 18}" width="36" height="36" rx="8"></rect><text x="${x(i)}" y="${y}">${esc(v)}</text></g>`;
      svg += `<text class="tree-sub" x="${x(i)}" y="${y + 34}">${i}</text>`;
    });
    return `<svg class="sw-svg" viewBox="0 0 ${w} ${h}">${svg}</svg>`;
  }
  function renderCells(f) {
    document.getElementById('stage-main').innerHTML = renderWindowSvg(f.values, f);
    document.getElementById('stage-list').innerHTML = htmlList(f.items || []);
    document.getElementById('state-a').textContent = f.metricA ?? '-';
    document.getElementById('state-b').textContent = f.metricB ?? '-';
    const res = document.getElementById('result');
    res.className = 'result-banner' + (f.done ? ` show ${f.done}` : '');
    res.textContent = f.result || '';
  }

  function base(key, title, lc, difficulty, chips, problem, intuition, inputs, presets, code, build) {
    return { key, title, lc, difficulty, chips, problem, intuition, inputs, presets, code, build, render: renderCells };
  }

  const CONFIGS = {};

  CONFIGS.best_time_buy_sell_stock = base(
    'best_time_buy_sell_stock', 'Best Time to Buy and Sell Stock', '121', 'Easy',
    ['One Pass Window', '⏱ O(n) time', '💾 O(1) space'],
    'Choose one day to buy and a later day to sell. Return the maximum profit.',
    'The left pointer is the cheapest buying day seen so far. Each new price auditions as the sell day.',
    [{ id: 'in-arr', label: 'prices', value: '7,1,5,3,6,4' }],
    [
      { label: 'profit', values: { 'in-arr': '7,1,5,3,6,4' } },
      { label: 'falling', values: { 'in-arr': '7,6,4,3,1' } },
      { label: 'late dip', values: { 'in-arr': '2,4,1,7' } }
    ],
    `class Solution {
    public int maxProfit(int[] prices) {
        int buy = 0, best = 0;
        for (int sell = 1; sell < prices.length; sell++) {
            if (prices[sell] < prices[buy]) buy = sell;
            best = Math.max(best, prices[sell] - prices[buy]);
        }
        return best;
    }
}`,
    function () {
      const a = nums('in-arr'), F = [];
      let buy = 0, best = 0, bestPair = [];
      const snap = (line, msg, sell, extra) => F.push(Object.assign({ line, msg, values: a, l: buy, r: sell, active: sell, metricA: best, metricB: `buy ${buy}`, items: bestPair.length ? [`buy ${bestPair[0]}`, `sell ${bestPair[1]}`] : [] }, extra || {}));
      snap(3, 'Track the minimum price seen so far as the cheapest buying opportunity. Each subsequent price is a potential sell day.', 0);
      for (let sell = 1; sell < a.length; sell++) {
        snap(4, `Inspect day ${sell} with price ${a[sell]} as a potential selling day. Calculate profit if we sold here.`, sell);
        if (a[sell] < a[buy]) { buy = sell; snap(5, `The price ${a[sell]} is lower than the current min of ${a[buy]}, so this is now the new cheapest buying day we've encountered.`, sell); }
        const profit = a[sell] - a[buy];
        if (profit > best) { best = profit; bestPair = [buy, sell]; }
        snap(6, `If we buy at day ${buy} (price ${a[buy]}) and sell at day ${sell} (price ${a[sell]}), profit = ${profit}. The best profit so far is ${best}.`, sell);
      }
      snap(8, `Every price has been checked as a potential sell day against the cheapest buy day seen before it. The maximum profit possible is ${best}.`, null, { done: 'ok', result: `✓ profit = ${best}` });
      return F;
    }
  );

  CONFIGS.longest_substring_without_repeating_characters = base(
    'longest_substring_without_repeating_characters', 'Longest Substring Without Repeating Characters', '3', 'Medium',
    ['Set Window', '⏱ O(n) time', '💾 O(k) space'],
    'Return the length of the longest substring with no repeated characters.',
    'Expand right while characters are fresh. When a duplicate appears, shrink left until the window is clean again.',
    [{ id: 'in-s', label: 's', value: 'abcabcbb' }],
    [
      { label: 'abcabcbb', values: { 'in-s': 'abcabcbb' } },
      { label: 'bbbbb', values: { 'in-s': 'bbbbb' } },
      { label: 'pwwkew', values: { 'in-s': 'pwwkew' } }
    ],
    `class Solution {
    public int lengthOfLongestSubstring(String s) {
        Set<Character> seen = new HashSet<>();
        int left = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            while (seen.contains(s.charAt(right))) seen.remove(s.charAt(left++));
            seen.add(s.charAt(right));
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
    function () {
      const a = [...str('in-s')], seen = new Set(), F = [];
      let l = 0, best = 0;
      const snap = (line, msg, r, extra) => F.push(Object.assign({ line, msg, values: a, l, r, active: r, windowBad: extra && extra.bad, metricA: best, metricB: `left ${l}`, items: [...seen] }, extra || {}));
      for (let r = 0; r < a.length; r++) {
        snap(5, `Advance right to index ${r} and try to include character "${a[r]}" in the window.`, r);
        while (seen.has(a[r])) { snap(6, `Character "${a[r]}" is already in the current window, creating a duplicate. Contract from the left by removing characters one at a time until "${a[r]}" is no longer in the window.`, r, { bad: true }); seen.delete(a[l++]); }
        seen.add(a[r]); best = Math.max(best, r - l + 1);
        snap(8, `The window [${l}, ${r}] contains "${a.slice(l, r + 1).join('')}" with all unique characters. The length is ${r - l + 1}, and the best length so far is ${best}.`, r);
      }
      snap(10, `Every character has been processed. The longest substring without repeating characters has length ${best}.`, null, { done: 'ok', result: `✓ length = ${best}` });
      return F;
    }
  );

  CONFIGS.longest_repeating_character_replacement = base(
    'longest_repeating_character_replacement', 'Longest Repeating Character Replacement', '424', 'Medium',
    ['Frequency Window', '⏱ O(n) time', '💾 O(26) space'],
    'Return the longest substring that can become one repeated character after at most k replacements.',
    'A window is valid when window length minus its most frequent character count is at most k.',
    [{ id: 'in-s', label: 's', value: 'AABABBA' }, { id: 'in-k', label: 'k', value: '1' }],
    [
      { label: 'AABABBA, k=1', values: { 'in-s': 'AABABBA', 'in-k': '1' } },
      { label: 'ABAB, k=2', values: { 'in-s': 'ABAB', 'in-k': '2' } },
      { label: 'AAAA, k=0', values: { 'in-s': 'AAAA', 'in-k': '0' } }
    ],
    `class Solution {
    public int characterReplacement(String s, int k) {
        int[] count = new int[26];
        int left = 0, maxFreq = 0, best = 0;
        for (int right = 0; right < s.length(); right++) {
            maxFreq = Math.max(maxFreq, ++count[s.charAt(right) - 'A']);
            while (right - left + 1 - maxFreq > k) count[s.charAt(left++) - 'A']--;
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}`,
    function () {
      const a = [...str('in-s')], k = parseInt(document.getElementById('in-k').value, 10), cnt = {}, F = [];
      let l = 0, maxFreq = 0, best = 0;
      const top = () => Object.entries(cnt).filter(([, v]) => v > 0).map(([c, v]) => `${c}:${v}`);
      const snap = (line, msg, r, extra) => F.push(Object.assign({ line, msg, values: a, l, r, active: r, windowBad: extra && extra.bad, metricA: best, metricB: `max ${maxFreq}`, items: top() }, extra || {}));
      for (let r = 0; r < a.length; r++) {
        cnt[a[r]] = (cnt[a[r]] || 0) + 1; maxFreq = Math.max(maxFreq, cnt[a[r]]);
        snap(6, `Include character "${a[r]}" — it now appears ${cnt[a[r]]} times in the window. The most frequent character appears ${maxFreq} times, so we need ${(r - l + 1) - maxFreq} replacement(s) to make the window all one character.`, r);
        while (r - l + 1 - maxFreq > k) { snap(7, `The window needs ${(r - l + 1) - maxFreq} replacements to make all characters the same, but we only have k=${k}. Shrink from the left by removing "${a[l]}".`, r, { bad: true }); cnt[a[l++]]--; }
        best = Math.max(best, r - l + 1); snap(8, `The window [${l}, ${r}] (length ${r - l + 1}) is valid — we can make all characters the same with at most k replacements. Best length so far is ${best}.`, r);
      }
      snap(10, `Every character has been processed. The longest substring that can become a single repeated character with at most ${k} replacement(s) has length ${best}.`, null, { done: 'ok', result: `✓ length = ${best}` });
      return F;
    }
  );

  CONFIGS.permutation_in_string = base(
    'permutation_in_string', 'Permutation in String', '567', 'Medium',
    ['Fixed Window Counts', '⏱ O(n) time', '💾 O(1) space'],
    'Return true if s2 contains a permutation of s1.',
    'Keep a fixed-size window over s2. When its character counts match s1, the window is an anagram.',
    [{ id: 'in-s1', label: 's1', value: 'ab' }, { id: 'in-s2', label: 's2', value: 'eidbaooo' }],
    [
      { label: 'true', values: { 'in-s1': 'ab', 'in-s2': 'eidbaooo' } },
      { label: 'false', values: { 'in-s1': 'ab', 'in-s2': 'eidboaoo' } },
      { label: 'early', values: { 'in-s1': 'adc', 'in-s2': 'dcda' } }
    ],
    `class Solution {
    public boolean checkInclusion(String s1, String s2) {
        int[] need = new int[26], win = new int[26];
        for (char c : s1.toCharArray()) need[c - 'a']++;
        for (int r = 0; r < s2.length(); r++) {
            win[s2.charAt(r) - 'a']++;
            if (r >= s1.length()) win[s2.charAt(r - s1.length()) - 'a']--;
            if (Arrays.equals(need, win)) return true;
        }
        return false;
    }
}`,
    function () {
      const s1 = str('in-s1'), a = [...str('in-s2')], need = {}, win = {}, F = [];
      for (const c of s1) need[c] = (need[c] || 0) + 1;
      const same = () => Object.keys(Object.assign({}, need, win)).every(c => (need[c] || 0) === (win[c] || 0));
      const show = () => Object.keys(Object.assign({}, need, win)).sort().map(c => `${c}:${win[c] || 0}/${need[c] || 0}`);
      for (let r = 0; r < a.length; r++) {
        win[a[r]] = (win[a[r]] || 0) + 1;
        if (r >= s1.length) win[a[r - s1.length]]--;
        const l = Math.max(0, r - s1.length + 1);
        F.push({ line: 5, msg: `Slide the fixed window of size ${s1.length} to positions [${l}, ${r}], containing the substring "${a.slice(l, r + 1).join('')}". Count each character in this window and compare against the character counts required by s1.`, values: a, l, r, active: r, metricA: `${r - l + 1}/${s1.length}`, metricB: 'size', items: show() });
        if (same()) { F.push({ line: 7, msg: `The character counts in this window exactly match the counts in s1 — this window is a permutation (anagram) of s1.`, values: a, l, r, active: r, metricA: 'true', metricB: 'match', items: show(), done: 'ok', result: '✓ true' }); return F; }
      }
      F.push({ line: 9, msg: `Every fixed-size window of s2 has been checked, but none have character counts matching s1. Therefore, s2 contains no permutation of s1.`, values: a, l: null, r: null, metricA: 'false', metricB: 'match', items: show(), done: 'bad', result: '✗ false' });
      return F;
    }
  );

  CONFIGS.minimum_window_substring = base(
    'minimum_window_substring', 'Minimum Window Substring', '76', 'Hard',
    ['Expand then Contract', '⏱ O(n) time', '💾 O(k) space'],
    'Return the smallest substring of s that contains every character in t.',
    'Expand until all requirements are met, then contract from the left while the window still covers t.',
    [{ id: 'in-s', label: 's', value: 'ADOBECODEBANC' }, { id: 'in-t', label: 't', value: 'ABC' }],
    [
      { label: 'BANC', values: { 'in-s': 'ADOBECODEBANC', 'in-t': 'ABC' } },
      { label: 'single', values: { 'in-s': 'a', 'in-t': 'a' } },
      { label: 'none', values: { 'in-s': 'a', 'in-t': 'aa' } }
    ],
    `class Solution {
    public String minWindow(String s, String t) {
        Map<Character,Integer> need = new HashMap<>(), win = new HashMap<>();
        for (char c : t.toCharArray()) need.put(c, need.getOrDefault(c, 0) + 1);
        int have = 0, left = 0, bestLen = Integer.MAX_VALUE, bestL = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            win.put(c, win.getOrDefault(c, 0) + 1);
            if (need.containsKey(c) && win.get(c).equals(need.get(c))) have++;
            while (have == need.size()) {
                if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestL = left; }
                char drop = s.charAt(left++);
                win.put(drop, win.get(drop) - 1);
                if (need.containsKey(drop) && win.get(drop) < need.get(drop)) have--;
            }
        }
        return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestL, bestL + bestLen);
    }
}`,
    function () {
      const a = [...str('in-s')], t = str('in-t'), need = {}, win = {}, F = [];
      for (const c of t) need[c] = (need[c] || 0) + 1;
      let have = 0, l = 0, best = [Infinity, 0, 0];
      const req = Object.keys(need).length;
      const show = () => Object.keys(need).sort().map(c => `${c}:${win[c] || 0}/${need[c]}`);
      const snap = (line, msg, r, extra) => F.push(Object.assign({ line, msg, values: a, l, r, active: r, metricA: best[0] === Infinity ? '-' : best[0], metricB: `${have}/${req}`, items: show() }, extra || {}));
      for (let r = 0; r < a.length; r++) {
        win[a[r]] = (win[a[r]] || 0) + 1;
        if (need[a[r]] && win[a[r]] === need[a[r]]) have++;
        snap(8, `Add ${a[r]}; satisfied groups ${have}/${req}.`, r);
        while (have === req) {
          if (r - l + 1 < best[0]) best = [r - l + 1, l, r];
          snap(10, `Covered t. Best window is "${a.slice(best[1], best[2] + 1).join('')}". Try shrinking.`, r);
          const d = a[l++]; win[d]--;
          if (need[d] && win[d] < need[d]) have--;
          snap(13, `Drop ${d}; coverage is now ${have}/${req}.`, r, { bad: have < req });
        }
      }
      const out = best[0] === Infinity ? '' : a.slice(best[1], best[2] + 1).join('');
      snap(17, out ? `Return "${out}".` : 'No valid window exists.', null, { done: out ? 'ok' : 'bad', result: out ? `✓ "${out}"` : '✗ empty' });
      return F;
    }
  );

  CONFIGS.sliding_window_maximum = Object.assign(
    base(
      'sliding_window_maximum', 'Sliding Window Maximum', '239', 'Hard',
      ['Monotonic Deque', '⏱ O(n) time', '💾 O(k) deque'],
      'Return the maximum value in every contiguous window of size k.',
      'The deque stores useful indices in decreasing value order. Its front is always the current window maximum.',
      [{ id: 'in-arr', label: 'nums', value: '1,3,-1,-3,5,3,6,7' }, { id: 'in-k', label: 'k', value: '3' }],
      [
        { label: 'classic', values: { 'in-arr': '1,3,-1,-3,5,3,6,7', 'in-k': '3' } },
        { label: 'k=2', values: { 'in-arr': '9,11,8,5,7,10', 'in-k': '2' } },
        { label: 'single', values: { 'in-arr': '4,3,2,1', 'in-k': '1' } }
      ],
      `class Solution {
    public int[] maxSlidingWindow(int[] nums, int k) {
        Deque<Integer> dq = new ArrayDeque<>();
        List<Integer> out = new ArrayList<>();
        for (int r = 0; r < nums.length; r++) {
            while (!dq.isEmpty() && dq.peekFirst() <= r - k) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[r]) dq.pollLast();
            dq.offerLast(r);
            if (r >= k - 1) out.add(nums[dq.peekFirst()]);
        }
        return out.stream().mapToInt(i -> i).toArray();
    }
}`,
      function () {
        const a = nums('in-arr'), k = parseInt(document.getElementById('in-k').value, 10), dq = [], out = [], F = [];
        const snap = (line, msg, r, extra) => F.push(Object.assign({ line, msg, values: a, l: Math.max(0, r - k + 1), r, active: r, metricA: dq.length ? a[dq[0]] : '-', metricB: 'front max', items: [`deque ${arr(dq)}`, `out ${arr(out)}`] }, extra || {}));
        for (let r = 0; r < a.length; r++) {
          snap(5, `Move right to index ${r}.`, r);
          while (dq.length && dq[0] <= r - k) { snap(6, `Index ${dq[0]} fell out of the window.`, r, { windowBad: true }); dq.shift(); }
          while (dq.length && a[dq[dq.length - 1]] < a[r]) { snap(7, `${a[r]} dominates ${a[dq[dq.length - 1]]}; pop from deque back.`, r); dq.pop(); }
          dq.push(r); snap(8, `Push ${r}. Deque front is max index ${dq[0]}.`, r);
          if (r >= k - 1) { out.push(a[dq[0]]); snap(9, `Window complete. Record max ${a[dq[0]]}.`, r); }
        }
        snap(11, `Return ${arr(out)}.`, null, { done: 'ok', result: `✓ ${arr(out)}` });
        return F;
      }
    ),
    { render: (f) => {
      renderCells(f);
      const dq = (f.items || [])[0] || '';
      document.getElementById('state-b').textContent = dq.replace('deque ', '');
    } }
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
    if (!cfg) throw new Error(`Unknown sliding-window problem: ${key}`);
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
