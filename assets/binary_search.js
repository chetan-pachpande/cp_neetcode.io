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
        const m = Math.floor((l + r) / 2); snap(5, `Inspect the middle index ${m} in the current search range [${l}, ${r}]. The middle element is ${a[m]} — compare it against the target ${target} to decide which half to discard.`, m);
        if (a[m] === target) { snap(6, `The target ${target} matches the middle element at index ${m}. Immediately return the index.`, m, { answer: m, done: 'ok', result: `✓ index ${m}` }); return F; }
        if (a[m] < target) { discard.push(...range(l, m)); l = m + 1; snap(7, `The middle value ${a[m]} is smaller than the target ${target}, so the target must be to the right. Discard everything from the left boundary up to and including the middle, then continue searching the right half.`, m); }
        else { discard.push(...range(m, r)); r = m - 1; snap(8, `The middle value ${a[m]} is larger than the target ${target}, so the target must be to the left. Discard everything from the middle to the right boundary, then continue searching the left half.`, m); }
      }
      snap(10, 'The search range is now empty (left > right) — the target was never found in the array. Return -1.', null, { done: 'bad', result: '✗ -1' });
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
        const m = Math.floor((l + r) / 2); snap(6, `Treat the matrix as one sorted flat array. The middle flat index ${m} maps to matrix value ${flat[m]} — compare it against the target ${target}. This is valid because each row starts where the previous row ended, so the flat array is fully sorted.`, m);
        if (flat[m] === target) { snap(8, `The matrix cell at flat index ${m} holds the target ${target}. The target is present in the matrix.`, m, { answer: m, done: 'ok', result: '✓ true' }); return F; }
        if (flat[m] < target) { discard.push(...range(l, m)); l = m + 1; snap(9, `The value ${flat[m]} is smaller than ${target}, so the target must be to the right (higher indices). Discard the left half including the middle.`, m); }
        else { discard.push(...range(m, r)); r = m - 1; snap(10, `The value ${flat[m]} is larger than ${target}, so the target must be to the left (lower indices). Discard the right half including the middle.`, m); }
      }
      snap(12, `No flat index yielded the target — the matrix does not contain ${target}.`, null, { done: 'bad', result: '✗ false' });
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
        const m = Math.floor((l + r) / 2), need = hours(m); snap(6, `Try eating speed ${m} bananas per hour. The total time required for all piles at this speed is ${need} hours. Compare this against the deadline of ${h} hours.`, m);
        if (need <= h) { ans = m; discard.push(...range(m + 1, r)); r = m; snap(7, `At speed ${m}, Koko finishes within the deadline (${need} ≤ ${h}). This speed works, but there might be a slower (smaller) speed that still works. Eliminate faster speeds and search the lower half.`, m); }
        else { discard.push(...range(l, m)); l = m + 1; snap(8, `At speed ${m}, Koko takes too long (${need} > ${h}). This speed is too slow — eating faster is the only way to meet the deadline. Eliminate slower speeds and search the upper half.`, m); }
      }
      snap(10, `The search converged to speed ${l}. This is the minimum eating speed that allows Koko to finish all piles within ${h} hours.`, l, { answer: l - 1, done: 'ok', result: `✓ k = ${l}` });
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
        const m = Math.floor((l + r) / 2); snap(5, `Compare the middle element ${a[m]} with the right edge element ${a[r]}. In a rotated sorted array, if mid > right, then the rotation pivot (where the array "breaks") must be to the right of mid. If mid ≤ right, the pivot is at mid or to its left.`, m);
        if (a[m] > a[r]) { discard.push(...range(l, m)); l = m + 1; snap(6, `Since ${a[m]} > ${a[r]}, the minimum value must be in the right half — the rotation point is somewhere between mid and right. Discard the left half including mid itself.`, m); }
        else { discard.push(...range(m + 1, r)); r = m; snap(7, `Since ${a[m]} ≤ ${a[r]}, either mid is the minimum or the minimum is to the left. Keep the left half including mid in the search range, and continue narrowing.`, m); }
      }
      snap(9, `The search converged to index ${l}, where the minimum element of the rotated array is ${a[l]}.`, l, { answer: l, done: 'ok', result: `✓ min = ${a[l]}` });
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
        const m = Math.floor((l + r) / 2); snap(5, `Inspect the middle element ${a[m]} at index ${m}. In a rotated sorted array, at least one half (left or right of mid) must be properly sorted without a rotation. Use that sorted half to determine where the target must be.`, m);
        if (a[m] === target) { snap(6, `The target ${target} is at index ${m} — search complete.`, m, { answer: m, done: 'ok', result: `✓ index ${m}` }); return F; }
        if (a[l] <= a[m]) {
          if (a[l] <= target && target < a[m]) { discard.push(...range(m, r)); r = m - 1; snap(8, `The left half is sorted (ascending from ${a[l]} to ${a[m]}), and the target ${target} falls within this range. Discard the right half and continue searching left.`, m); }
          else { discard.push(...range(l, m)); l = m + 1; snap(9, `The left half is sorted, but the target ${target} is not in the range [${a[l]}, ${a[m]}) — it must be in the right half. Discard the left half and continue searching right.`, m); }
        } else if (a[m] < target && target <= a[r]) { discard.push(...range(l, m)); l = m + 1; snap(11, `The right half is sorted (ascending from ${a[m]} to ${a[r]}), and the target ${target} falls within this range. Discard the left half and continue searching right.`, m); }
        else { discard.push(...range(m, r)); r = m - 1; snap(12, `The right half is sorted, but the target ${target} is not in the range (${a[m]}, ${a[r]}] — it must be in the left half. Discard the right half and continue searching left.`, m); }
      }
      snap(15, `The search range is empty — the target ${target} was never found in the rotated array. Return -1.`, null, { done: 'bad', result: '✗ -1' });
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
        const m = Math.floor((l + r) / 2); snap(8, `Inspect the timestamp at history index ${m}: ${hist[m].t}. We want the LATEST timestamp that is ≤ the query time ${q}.`, m);
        if (hist[m].t <= q) { ans = hist[m].v; ansIdx = m; discard.push(...range(l, m - 1)); l = m + 1; snap(9, `Timestamp ${hist[m].t} is at or before the query time (≤ ${q}), so this entry is valid. Save its value "${ans}" as a candidate, then continue searching for an even later timestamp that still meets the deadline.`, m); }
        else { discard.push(...range(m, r)); r = m - 1; snap(10, `Timestamp ${hist[m].t} is after the query time (> ${q}), so this entry is too recent. The correct answer must use a timestamp before this one — discard this and all later timestamps, then continue searching earlier.`, m); }
      }
      snap(12, ans ? `The latest valid timestamp at or before ${q} is ${hist[ansIdx].t}, whose value is "${ans}".` : `No timestamp exists at or before ${q} in the history — return empty string.`, ansIdx, { done: ans ? 'ok' : 'bad', result: ans ? `✓ "${ans}"` : '✗ ""' });
      return F;
    });

  CONFIGS.median_of_two_sorted_arrays = base('median_of_two_sorted_arrays', 'Median of Two Sorted Arrays', '4', 'Hard',
    ['Partition Search', 'O(log min(m,n))', 'O(1) space'],
    'Given two sorted arrays nums1 and nums2 of size m and n, return the median of the combined sorted array — without actually merging them. The overall run time must be O(log(m+n)).',
    "Merging both arrays and reading off the middle would work, but that takes O(m+n) time — too slow for the required logarithmic bound. Instead, binary search for a PARTITION: a cut point i in one array and a matching cut point j in the other, chosen so the combined left side of both cuts holds exactly half of all elements (rounding up if the total is odd), and every element on the left of both cuts is ≤ every element on the right of both cuts. Once that partition is found, the median reads directly off the four values touching the cuts — no merge required. Fixing j = half − i (half being the required left-side size) means only i ever needs to be searched, and searching it over the SMALLER of the two arrays bounds the work to O(log(min(m,n))). At each candidate i: if the left side of the first cut is bigger than the right side of the second cut, that cut let in a value too large for the other side to accept, so it must move left; if the left side of the second cut is bigger than the right side of the first, the first cut isn't taking enough elements yet, so it must move right. Treating a cut at the very start or end of an array as bordering -infinity / +infinity, instead of a real neighbor, makes these comparisons work uniformly even at the edges.",
    [{ id: 'in-a', label: 'nums1', value: '1,3' }, { id: 'in-b', label: 'nums2', value: '2' }],
    [
      { label: 'odd', values: { 'in-a': '1,3', 'in-b': '2' } },
      { label: 'even', values: { 'in-a': '1,2', 'in-b': '3,4' } },
      { label: 'empty A', values: { 'in-a': '', 'in-b': '1,2,3,4,5' } },
      { label: 'uneven', values: { 'in-a': '1,2,9', 'in-b': '3,4,5,6,7,8' } },
      { label: 'duplicates', values: { 'in-a': '1,2,2', 'in-b': '2,2,3' } }
    ],
    `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] A = nums1, B = nums2;
        if (A.length > B.length) { A = nums2; B = nums1; }
        int m = A.length, n = B.length;
        int total = m + n, half = (total + 1) / 2;
        int lo = 0, hi = m;
        while (lo <= hi) {
            int i = lo + (hi - lo) / 2;
            int j = half - i;
            int leftA  = (i == 0) ? Integer.MIN_VALUE : A[i - 1];
            int rightA = (i == m) ? Integer.MAX_VALUE : A[i];
            int leftB  = (j == 0) ? Integer.MIN_VALUE : B[j - 1];
            int rightB = (j == n) ? Integer.MAX_VALUE : B[j];
            if (leftA <= rightB && leftB <= rightA) {
                if (total % 2 == 0) {
                    return (Math.max(leftA, leftB) + Math.min(rightA, rightB)) / 2.0;
                }
                return Math.max(leftA, leftB);
            } else if (leftA > rightB) {
                hi = i - 1;
            } else {
                lo = i + 1;
            }
        }
        return -1.0; // unreachable for valid input
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
        snap([9, 10, 11, 12, 13, 14], `Try cutting the smaller array after index ${i - 1} (${i} element${i === 1 ? '' : 's'} on its left). Since the left side of the combined partition must hold exactly ${half} element${half === 1 ? '' : 's'} total, the other array's cut is forced to j = ${half} − ${i} = ${j}. Left-side boundary candidates: ${Al === -Infinity ? '−∞' : Al} (A) and ${Bl === -Infinity ? '−∞' : Bl} (B). Right-side boundary candidates: ${Ar === Infinity ? '∞' : Ar} (A) and ${Br === Infinity ? '∞' : Br} (B).`, i);
        if (Al <= Br && Bl <= Ar) {
          const med = total % 2 ? Math.max(Al, Bl) : (Math.max(Al, Bl) + Math.min(Ar, Br)) / 2;
          snap([15, 16, 17, 18, 19], `Every left-side value is ≤ every right-side value (${Al === -Infinity ? '−∞' : Al} ≤ ${Br === Infinity ? '∞' : Br} and ${Bl === -Infinity ? '−∞' : Bl} ≤ ${Ar === Infinity ? '∞' : Ar}) — this is the correct partition. ${total % 2 ? `With an odd total of ${total} elements, the median is simply the larger of the two left-side values: max(${Al === -Infinity ? '−∞' : Al}, ${Bl === -Infinity ? '−∞' : Bl}) = ${med}.` : `With an even total of ${total} elements, the median is the average of the largest left value and the smallest right value: (max(${Al === -Infinity ? '−∞' : Al}, ${Bl === -Infinity ? '−∞' : Bl}) + min(${Ar === Infinity ? '∞' : Ar}, ${Br === Infinity ? '∞' : Br})) / 2 = ${med}.`}`, i, { answer: i, done: 'ok', result: `✓ median = ${med}` }); return F;
        } else if (Al > Br) { discard.push(...range(i, r)); r = i - 1; snap([20, 21], `Left-of-A value ${Al === -Infinity ? '−∞' : Al} is bigger than right-of-B value ${Br === Infinity ? '∞' : Br} — A's cut let in a value too large for B's side to accept, so A's cut sits too far to the right. Narrow the search to smaller i.`, i); }
        else { discard.push(...range(l, i)); l = i + 1; snap([22, 23], `Left-of-B value ${Bl === -Infinity ? '−∞' : Bl} is bigger than right-of-A value ${Ar === Infinity ? '∞' : Ar} — B's cut let in a value too large for A's side to accept, meaning A's cut hasn't taken enough elements yet. Widen the search to larger i.`, i); }
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
