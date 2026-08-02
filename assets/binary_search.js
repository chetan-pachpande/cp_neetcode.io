window.BinarySearchPage = (function () {
  'use strict';

  const esc = s => Viz.escapeHtml(String(s));
  const nums = id => document.getElementById(id).value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
  const arr = a => `[${a.join(', ')}]`;
  const items = xs => xs && xs.length ? xs.map(x => `<span class="solution-chip">${esc(x)}</span>`).join('') : '<span style="color:var(--text-3);font-size:.8rem;">empty</span>';

  function parseMatrix(id) {
    return document.getElementById(id).value.split('|').map(row => row.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n))).filter(r => r.length);
  }
  function renderArraySvg(values, f) {
    const gap = 50, y = 64, w = Math.max(330, values.length * gap + 58), h = 142;
    const x = i => 32 + i * gap;
    let svg = '';
    if (f.l != null && f.r != null && f.l <= f.r) {
      const left = x(f.l) - 22, right = x(f.r) + 22;
      svg += `<rect class="bs-range ${f.badRange ? 'bad' : ''}" x="${left}" y="25" width="${right - left}" height="64" rx="11"/>`;
      svg += `<text class="tree-sub" x="${(left + right) / 2}" y="116">lo ${f.l} · hi ${f.r}</text>`;
    }
    values.forEach((v, i) => {
      const cls = i === f.mid ? 'active' : i === f.answer ? 'ok' : (f.discard || []).includes(i) ? 'dim' : '';
      svg += `<g class="bs-cell ${cls}"><rect x="${x(i) - 19}" y="${y - 19}" width="38" height="38" rx="8"></rect><text x="${x(i)}" y="${y}">${esc(v)}</text></g>`;
      svg += `<text class="tree-sub" x="${x(i)}" y="${y + 35}">${i}</text>`;
    });
    return `<svg class="bs-svg" viewBox="0 0 ${w} ${h}">${svg}</svg>`;
  }
  function render(f) {
    document.getElementById('stage-main').innerHTML = f.matrix ? renderMatrix(f) : renderArraySvg(f.values || [], f);
    document.getElementById('stage-list').innerHTML = items(f.items || []);
    document.getElementById('state-a').textContent = f.metricA ?? '-';
    document.getElementById('state-b').textContent = f.metricB ?? '-';
    const res = document.getElementById('result');
    res.className = 'result-banner' + (f.done ? ` show ${f.done}` : '');
    res.textContent = f.result || '';
  }
  function renderMatrix(f) {
    const flat = f.matrix.flat(), cols = f.matrix[0]?.length || 1;
    return `<div class="matrix-grid" style="grid-template-columns:repeat(${cols},44px);">${flat.map((v, i) => {
      const cls = i === f.mid ? 'active' : i === f.answer ? 'ok' : (f.discard || []).includes(i) ? 'dim' : '';
      return `<div class="matrix-cell ${cls}" title="flat index ${i}">${esc(v)}</div>`;
    }).join('')}</div>`;
  }
  function base(key, title, lc, difficulty, chips, problem, intuition, inputs, presets, code, build) {
    return { key, title, lc, difficulty, chips, problem, intuition, inputs, presets, code, build, render };
  }

  const CONFIGS = {};

  CONFIGS.binary_search = base('binary_search', 'Binary Search', '704', 'Easy',
    ['Classic Bounds', 'O(log n) time', 'O(1) space'],
    'Find target in a sorted array, or return -1.',
    'Keep a searchable range. The middle element tells us which half cannot contain the target.',
    [{ id: 'in-arr', label: 'nums', value: '-1,0,3,5,9,12' }, { id: 'in-target', label: 'target', value: '9' }],
    [
      { label: 'found', values: { 'in-arr': '-1,0,3,5,9,12', 'in-target': '9' } },
      { label: 'missing', values: { 'in-arr': '-1,0,3,5,9,12', 'in-target': '2' } },
      { label: 'first item', values: { 'in-arr': '1,3,5,7,9', 'in-target': '1' } },
      { label: 'last item', values: { 'in-arr': '1,3,5,7,9', 'in-target': '9' } },
      { label: 'negative', values: { 'in-arr': '-10,-3,0,4,8', 'in-target': '-3' } }
    ],
    `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`,
    function () {
      const a = nums('in-arr'), target = parseInt(document.getElementById('in-target').value, 10), F = [];
      let l = 0, r = a.length - 1, discard = [];
      const snap = (line, msg, mid, extra) => F.push(Object.assign({ line, msg, values: a, l, r, mid, discard: discard.slice(), metricA: target, metricB: 'target' }, extra || {}));
      while (l <= r) {
        const m = Math.floor((l + r) / 2); snap(5, `Check middle index ${m}, value ${a[m]}.`, m);
        if (a[m] === target) { snap(6, `${target} found at index ${m}.`, m, { answer: m, done: 'ok', result: `✓ index ${m}` }); return F; }
        if (a[m] < target) { discard.push(...range(l, m)); l = m + 1; snap(7, `${a[m]} is too small; discard the left half.`, m); }
        else { discard.push(...range(m, r)); r = m - 1; snap(8, `${a[m]} is too large; discard the right half.`, m); }
      }
      snap(10, 'Range is empty; target is absent.', null, { done: 'bad', result: '✗ -1' });
      return F;
    });

  CONFIGS.search_2d_matrix = base('search_2d_matrix', 'Search a 2D Matrix', '74', 'Medium',
    ['Flattened Binary Search', 'O(log mn) time', 'O(1) space'],
    'Search a row-sorted matrix where each row starts after the previous row ends.',
    'Treat the matrix as one sorted array. Convert flat mid into row and column only when reading.',
    [{ id: 'in-matrix', label: 'matrix rows separated by |', value: '1,3,5,7|10,11,16,20|23,30,34,60' }, { id: 'in-target', label: 'target', value: '3' }],
    [
      { label: 'found', values: { 'in-matrix': '1,3,5,7|10,11,16,20|23,30,34,60', 'in-target': '3' } },
      { label: 'missing', values: { 'in-matrix': '1,3,5,7|10,11,16,20|23,30,34,60', 'in-target': '13' } },
      { label: 'last cell', values: { 'in-matrix': '1,2,3|4,5,6', 'in-target': '6' } },
      { label: 'first cell', values: { 'in-matrix': '1,2,3|4,5,6', 'in-target': '1' } },
      { label: 'single row', values: { 'in-matrix': '1,4,7,10', 'in-target': '7' } }
    ],
    `class Solution {
    public boolean searchMatrix(int[][] matrix, int target) {
        int rows = matrix.length, cols = matrix[0].length;
        int left = 0, right = rows * cols - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            int val = matrix[mid / cols][mid % cols];
            if (val == target) return true;
            if (val < target) left = mid + 1;
            else right = mid - 1;
        }
        return false;
    }
}`,
    function () {
      const matrix = parseMatrix('in-matrix'), flat = matrix.flat(), target = parseInt(document.getElementById('in-target').value, 10), F = [];
      let l = 0, r = flat.length - 1, discard = [];
      const snap = (line, msg, mid, extra) => F.push(Object.assign({ line, msg, matrix, l, r, mid, discard: discard.slice(), metricA: target, metricB: 'target' }, extra || {}));
      while (l <= r) {
        const m = Math.floor((l + r) / 2); snap(6, `Flat mid ${m} maps to value ${flat[m]}.`, m);
        if (flat[m] === target) { snap(8, `Found ${target}.`, m, { answer: m, done: 'ok', result: '✓ true' }); return F; }
        if (flat[m] < target) { discard.push(...range(l, m)); l = m + 1; snap(9, 'Discard smaller flat prefix.', m); }
        else { discard.push(...range(m, r)); r = m - 1; snap(10, 'Discard larger flat suffix.', m); }
      }
      snap(12, 'No matrix cell matched target.', null, { done: 'bad', result: '✗ false' });
      return F;
    });

  CONFIGS.koko_eating_bananas = base('koko_eating_bananas', 'Koko Eating Bananas', '875', 'Medium',
    ['Binary Search Answer', 'O(n log m) time', 'O(1) space'],
    'Find the minimum eating speed k so Koko can finish all piles within h hours.',
    'The answer space is sorted: if speed k works, every faster speed also works.',
    [{ id: 'in-arr', label: 'piles', value: '3,6,7,11' }, { id: 'in-h', label: 'h', value: '8' }],
    [
      { label: 'classic', values: { 'in-arr': '3,6,7,11', 'in-h': '8' } },
      { label: 'large', values: { 'in-arr': '30,11,23,4,20', 'in-h': '5' } },
      { label: 'more time', values: { 'in-arr': '30,11,23,4,20', 'in-h': '6' } },
      { label: 'one pile', values: { 'in-arr': '9', 'in-h': '3' } },
      { label: 'tight', values: { 'in-arr': '5,5,5,5', 'in-h': '4' } }
    ],
    `class Solution {
    public int minEatingSpeed(int[] piles, int h) {
        int left = 1, right = max(piles);
        while (left < right) {
            int mid = left + (right - left) / 2;
            int hours = hoursNeeded(piles, mid);
            if (hours <= h) right = mid;
            else left = mid + 1;
        }
        return left;
    }
}`,
    function () {
      const piles = nums('in-arr'), h = parseInt(document.getElementById('in-h').value, 10), speeds = range(1, Math.max(...piles)), F = [];
      let l = 1, r = Math.max(...piles), ans = r, discard = [];
      const hours = k => piles.reduce((s, p) => s + Math.ceil(p / k), 0);
      const snap = (line, msg, mid, extra) => F.push(Object.assign({ line, msg, values: speeds, l: l - 1, r: r - 1, mid: mid - 1, discard: discard.map(x => x - 1), metricA: ans, metricB: 'best speed', items: [`hours ${mid ? hours(mid) : '-'}`, `limit ${h}`] }, extra || {}));
      while (l < r) {
        const m = Math.floor((l + r) / 2), need = hours(m); snap(6, `Try speed ${m}; total hours ${need}.`, m);
        if (need <= h) { ans = m; discard.push(...range(m + 1, r)); r = m; snap(7, `${m} works, so search for a slower valid speed.`, m); }
        else { discard.push(...range(l, m)); l = m + 1; snap(8, `${m} is too slow, so raise the lower bound.`, m); }
      }
      snap(10, `Minimum working speed is ${l}.`, l, { answer: l - 1, done: 'ok', result: `✓ k = ${l}` });
      return F;
    });

  CONFIGS.find_minimum_rotated_sorted_array = base('find_minimum_rotated_sorted_array', 'Find Minimum in Rotated Sorted Array', '153', 'Medium',
    ['Pivot Search', 'O(log n) time', 'O(1) space'],
    'Find the minimum element in a rotated sorted array.',
    'Compare mid with the right edge. If mid is greater, the pivot is right; otherwise it is at mid or left.',
    [{ id: 'in-arr', label: 'nums', value: '3,4,5,1,2' }],
    [
      { label: 'rotated', values: { 'in-arr': '3,4,5,1,2' } },
      { label: 'more', values: { 'in-arr': '4,5,6,7,0,1,2' } },
      { label: 'sorted', values: { 'in-arr': '1,2,3,4' } },
      { label: 'two items', values: { 'in-arr': '2,1' } },
      { label: 'pivot end', values: { 'in-arr': '2,3,4,5,1' } }
    ],
    `class Solution {
    public int findMin(int[] nums) {
        int left = 0, right = nums.length - 1;
        while (left < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) left = mid + 1;
            else right = mid;
        }
        return nums[left];
    }
}`,
    function () {
      const a = nums('in-arr'), F = []; let l = 0, r = a.length - 1, discard = [];
      const snap = (line, msg, mid, extra) => F.push(Object.assign({ line, msg, values: a, l, r, mid, discard: discard.slice(), metricA: a[r], metricB: 'right value' }, extra || {}));
      while (l < r) {
        const m = Math.floor((l + r) / 2); snap(5, `Compare mid ${a[m]} with right ${a[r]}.`, m);
        if (a[m] > a[r]) { discard.push(...range(l, m)); l = m + 1; snap(6, 'Mid is in the left sorted part; minimum is to the right.', m); }
        else { discard.push(...range(m + 1, r)); r = m; snap(7, 'Mid may be the minimum; keep left side including mid.', m); }
      }
      snap(9, `Minimum is ${a[l]}.`, l, { answer: l, done: 'ok', result: `✓ min = ${a[l]}` });
      return F;
    });

  CONFIGS.search_in_rotated_sorted_array = base('search_in_rotated_sorted_array', 'Search in Rotated Sorted Array', '33', 'Medium',
    ['Sorted Half Choice', 'O(log n) time', 'O(1) space'],
    'Search target in a rotated sorted array.',
    'At every midpoint, at least one half is sorted. Use that half to decide which side can still hold target.',
    [{ id: 'in-arr', label: 'nums', value: '4,5,6,7,0,1,2' }, { id: 'in-target', label: 'target', value: '0' }],
    [
      { label: 'found', values: { 'in-arr': '4,5,6,7,0,1,2', 'in-target': '0' } },
      { label: 'missing', values: { 'in-arr': '4,5,6,7,0,1,2', 'in-target': '3' } },
      { label: 'left half', values: { 'in-arr': '4,5,6,7,0,1,2', 'in-target': '6' } },
      { label: 'right edge', values: { 'in-arr': '5,1,2,3,4', 'in-target': '4' } },
      { label: 'single', values: { 'in-arr': '1', 'in-target': '1' } }
    ],
    `class Solution {
    public int search(int[] nums, int target) {
        int left = 0, right = nums.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[left] <= nums[mid]) {
                if (nums[left] <= target && target < nums[mid]) right = mid - 1;
                else left = mid + 1;
            } else {
                if (nums[mid] < target && target <= nums[right]) left = mid + 1;
                else right = mid - 1;
            }
        }
        return -1;
    }
}`,
    function () {
      const a = nums('in-arr'), target = parseInt(document.getElementById('in-target').value, 10), F = []; let l = 0, r = a.length - 1, discard = [];
      const snap = (line, msg, mid, extra) => F.push(Object.assign({ line, msg, values: a, l, r, mid, discard: discard.slice(), metricA: target, metricB: 'target' }, extra || {}));
      while (l <= r) {
        const m = Math.floor((l + r) / 2); snap(5, `Check ${a[m]} at mid ${m}.`, m);
        if (a[m] === target) { snap(6, `Found target at ${m}.`, m, { answer: m, done: 'ok', result: `✓ index ${m}` }); return F; }
        if (a[l] <= a[m]) {
          if (a[l] <= target && target < a[m]) { discard.push(...range(m, r)); r = m - 1; snap(8, 'Left half is sorted and target lies inside it.', m); }
          else { discard.push(...range(l, m)); l = m + 1; snap(9, 'Target is not in the sorted left half.', m); }
        } else if (a[m] < target && target <= a[r]) { discard.push(...range(l, m)); l = m + 1; snap(11, 'Right half is sorted and target lies inside it.', m); }
        else { discard.push(...range(m, r)); r = m - 1; snap(12, 'Target is not in the sorted right half.', m); }
      }
      snap(15, 'Target is absent.', null, { done: 'bad', result: '✗ -1' });
      return F;
    });

  CONFIGS.time_based_key_value_store = base('time_based_key_value_store', 'Time Based Key-Value Store', '981', 'Medium',
    ['Append History', 'Binary Search Timestamp', 'O(log n) get'],
    'Store values by key and timestamp, then retrieve the latest value at or before a timestamp.',
    'Each key owns a timestamp-sorted history. A get operation binary-searches the last timestamp not greater than the query.',
    [{ id: 'in-history', label: 'history as timestamp:value', value: '1:bar,4:bar2,7:bar3' }, { id: 'in-query', label: 'query timestamp', value: '5' }],
    [
      { label: 'between', values: { 'in-history': '1:bar,4:bar2,7:bar3', 'in-query': '5' } },
      { label: 'exact', values: { 'in-history': '1:foo,3:baz', 'in-query': '3' } },
      { label: 'too early', values: { 'in-history': '5:x,9:y', 'in-query': '2' } },
      { label: 'latest', values: { 'in-history': '1:a,2:b,10:c', 'in-query': '12' } },
      { label: 'middle', values: { 'in-history': '2:low,6:mid,9:high', 'in-query': '7' } }
    ],
    `class TimeMap {
    Map<String, List<Pair<Integer,String>>> map = new HashMap<>();
    public String get(String key, int timestamp) {
        List<Pair<Integer,String>> list = map.get(key);
        int left = 0, right = list.size() - 1;
        String ans = "";
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (list.get(mid).time <= timestamp) { ans = list.get(mid).value; left = mid + 1; }
            else right = mid - 1;
        }
        return ans;
    }
}`,
    function () {
      const hist = document.getElementById('in-history').value.split(',').map(s => { const [t, v] = s.trim().split(':'); return { t: parseInt(t, 10), v }; }).filter(x => !Number.isNaN(x.t));
      const q = parseInt(document.getElementById('in-query').value, 10), values = hist.map(x => `${x.t}:${x.v}`), F = [];
      let l = 0, r = hist.length - 1, ans = '', ansIdx = null, discard = [];
      const snap = (line, msg, mid, extra) => F.push(Object.assign({ line, msg, values, l, r, mid, answer: ansIdx, discard: discard.slice(), metricA: q, metricB: 'query time', items: [`answer "${ans}"`] }, extra || {}));
      while (l <= r) {
        const m = Math.floor((l + r) / 2); snap(8, `Check timestamp ${hist[m].t}.`, m);
        if (hist[m].t <= q) { ans = hist[m].v; ansIdx = m; discard.push(...range(l, m - 1)); l = m + 1; snap(9, `${hist[m].t} is allowed; save "${ans}" and search later.`, m); }
        else { discard.push(...range(m, r)); r = m - 1; snap(10, `${hist[m].t} is too late; search earlier.`, m); }
      }
      snap(12, ans ? `Return "${ans}".` : 'No timestamp at or before query.', ansIdx, { done: ans ? 'ok' : 'bad', result: ans ? `✓ "${ans}"` : '✗ ""' });
      return F;
    });

  CONFIGS.median_of_two_sorted_arrays = base('median_of_two_sorted_arrays', 'Median of Two Sorted Arrays', '4', 'Hard',
    ['Partition Search', 'O(log min(m,n))', 'O(1) space'],
    'Return the median of two sorted arrays.',
    'Binary-search the cut in the smaller array. The correct cut has every left-side value <= every right-side value.',
    [{ id: 'in-a', label: 'nums1', value: '1,3' }, { id: 'in-b', label: 'nums2', value: '2' }],
    [
      { label: 'odd', values: { 'in-a': '1,3', 'in-b': '2' } },
      { label: 'even', values: { 'in-a': '1,2', 'in-b': '3,4' } },
      { label: 'empty A', values: { 'in-a': '', 'in-b': '1,2,3,4,5' } },
      { label: 'uneven', values: { 'in-a': '1,2,9', 'in-b': '3,4,5,6,7,8' } },
      { label: 'duplicates', values: { 'in-a': '1,2,2', 'in-b': '2,2,3' } }
    ],
    `class Solution {
    public double findMedianSortedArrays(int[] A, int[] B) {
        if (A.length > B.length) return findMedianSortedArrays(B, A);
        int total = A.length + B.length, half = (total + 1) / 2;
        int left = 0, right = A.length;
        while (left <= right) {
            int i = left + (right - left) / 2;
            int j = half - i;
            if (Aleft <= Bright && Bleft <= Aright) return median;
            else if (Aleft > Bright) right = i - 1;
            else left = i + 1;
        }
        return 0;
    }
}`,
    function () {
      let A = nums('in-a'), B = nums('in-b'); if (A.length > B.length) [A, B] = [B, A];
      const total = A.length + B.length, half = Math.floor((total + 1) / 2), cuts = range(0, A.length), F = [];
      let l = 0, r = A.length, discard = [];
      const val = (x, d) => x == null ? d : x;
      const snap = (line, msg, mid, extra) => F.push(Object.assign({ line, msg, values: cuts.map(c => `cut${c}`), l, r, mid, discard: discard.slice(), metricA: half, metricB: 'left size', items: [`A ${arr(A)}`, `B ${arr(B)}`] }, extra || {}));
      while (l <= r) {
        const i = Math.floor((l + r) / 2), j = half - i;
        const Al = val(A[i - 1], -Infinity), Ar = val(A[i], Infinity), Bl = val(B[j - 1], -Infinity), Br = val(B[j], Infinity);
        snap(7, `Try cut A=${i}, B=${j}. Left max candidates ${Al}, ${Bl}; right min candidates ${Ar}, ${Br}.`, i);
        if (Al <= Br && Bl <= Ar) {
          const med = total % 2 ? Math.max(Al, Bl) : (Math.max(Al, Bl) + Math.min(Ar, Br)) / 2;
          snap(9, `Partition is valid. Median is ${med}.`, i, { answer: i, done: 'ok', result: `✓ median = ${med}` }); return F;
        } else if (Al > Br) { discard.push(...range(i, r)); r = i - 1; snap(10, 'A cut is too far right; move left.', i); }
        else { discard.push(...range(l, i)); l = i + 1; snap(11, 'A cut is too far left; move right.', i); }
      }
      return F;
    });

  function range(a, b) { const out = []; for (let i = a; i <= b; i++) out.push(i); return out; }

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
    if (!cfg) throw new Error(`Unknown binary-search problem: ${key}`);
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
