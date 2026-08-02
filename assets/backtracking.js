window.BacktrackingPage = (function () {
  'use strict';

  const esc = (s) => Viz.escapeHtml(String(s));
  const arr = (a) => `[${a.join(', ')}]`;
  const card = (v, cls) => `<span class="choice-card ${cls || ''}">${esc(v)}</span>`;
  const chip = (v) => `<span class="solution-chip">${esc(v)}</span>`;

  function nums(id) {
    return document.getElementById(id).value.split(',').map(s => parseInt(s.trim(), 10)).filter(Number.isFinite);
  }

  function words(id) {
    return document.getElementById(id).value.split(',').map(s => s.trim()).filter(Boolean);
  }

  function setHtml(id, html) {
    document.getElementById(id).innerHTML = html;
  }

  function renderCards(values, active, used) {
    return values.map((v, i) => card(v, i === active ? 'active' : used && used.has(i) ? 'ok' : '')).join('');
  }

  function renderPath(path) {
    return path.length ? path.map(x => card(x, 'ok')).join('<span class="story-arrow">→</span>') : '<span style="color:var(--text-3);font-size:.8rem;">empty path</span>';
  }

  function renderSolutions(solutions) {
    return solutions.length ? solutions.slice(-12).map(s => chip(Array.isArray(s) ? arr(s) : s)).join('') : '<span style="color:var(--text-3);font-size:.8rem;">none yet</span>';
  }

  const CONFIGS = {
    subsets: {
      title: 'Subsets', lc: '78', difficulty: 'Medium',
      chips: ['Decision Tree', '⏱ O(n · 2ⁿ) time', '💾 O(n) recursion path'],
      problem: `Given an integer array <code>nums</code> with unique elements, return all possible subsets, including the empty set.`,
      intuition: `At every number, the story branches into two scenes: skip it, or include it. Walking the whole decision tree visits every subset exactly once.`,
      inputs: [{ id: 'in-nums', label: 'nums', value: '1,2,3' }],
      presets: [{ label: '[1,2,3]', values: { 'in-nums': '1,2,3' } }, { label: '[0,1]', values: { 'in-nums': '0,1' } }],
      code: `class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] nums, int i, List<Integer> path, List<List<Integer>> res) {
        if (i == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }

        backtrack(nums, i + 1, path, res);
        path.add(nums[i]);
        backtrack(nums, i + 1, path, res);
        path.remove(path.size() - 1);
    }
}`,
      build() {
        const a = nums('in-nums'), F = [], sol = [];
        const snap = (line, msg, i, path, extra) => F.push(Object.assign({ line, msg, values: a, i, path: path.slice(), sol: sol.map(x => x.slice()) }, extra || {}));
        function dfs(i, path) {
          snap(8, i === a.length ? 'Reached the leaf of the decision tree.' : `Stand at index ${i}: decide what to do with ${a[i]}.`, i, path);
          if (i === a.length) { sol.push(path.slice()); snap(9, `Record subset ${arr(path)}.`, i, path, { found: true }); return; }
          snap(13, `Skip ${a[i]} and move deeper.`, i, path, { choice: 'skip' });
          dfs(i + 1, path);
          path.push(a[i]); snap(14, `Include ${a[i]} in the path.`, i, path, { active: i });
          dfs(i + 1, path);
          path.pop(); snap(16, `Backtrack: remove ${a[i]}.`, i, path, { active: i });
        }
        dfs(0, []);
        snap(5, `All ${sol.length} subsets are collected.`, a.length, [], { done: 'ok' });
        return F;
      },
      render(f) { renderGeneric(f); }
    },

    subsets_ii: {
      title: 'Subsets II', lc: '90', difficulty: 'Medium',
      chips: ['Sort + Skip Duplicates', '⏱ O(n · 2ⁿ) time', '💾 O(n) recursion path'],
      problem: `Given an integer array that may contain duplicates, return all possible unique subsets.`,
      intuition: `Sort first so equal values stand together. At each recursion level, skip a duplicate choice if its twin was already offered in the same scene.`,
      inputs: [{ id: 'in-nums', label: 'nums', value: '1,2,2' }],
      presets: [{ label: '[1,2,2]', values: { 'in-nums': '1,2,2' } }, { label: '[2,2,2]', values: { 'in-nums': '2,2,2' } }],
      code: `class Solution {
    public List<List<Integer>> subsetsWithDup(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> res = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] nums, int start, List<Integer> path, List<List<Integer>> res) {
        res.add(new ArrayList<>(path));
        for (int i = start; i < nums.length; i++) {
            if (i > start && nums[i] == nums[i - 1]) continue;
            path.add(nums[i]);
            backtrack(nums, i + 1, path, res);
            path.remove(path.size() - 1);
        }
    }
}`,
      build() {
        const a = nums('in-nums').sort((x, y) => x - y), F = [], sol = [];
        const snap = (line, msg, start, i, path, extra) => F.push(Object.assign({ line, msg, values: a, i, start, path: path.slice(), sol: sol.map(x => x.slice()) }, extra || {}));
        function dfs(start, path) {
          sol.push(path.slice()); snap(9, `Record ${arr(path)} before choosing more numbers.`, start, null, path, { found: true });
          for (let i = start; i < a.length; i++) {
            snap(10, `Consider nums[${i}] = ${a[i]} at this level.`, start, i, path);
            if (i > start && a[i] === a[i - 1]) { snap(11, `Skip duplicate ${a[i]} so this level does not replay the same branch.`, start, i, path, { duplicate: true }); continue; }
            path.push(a[i]); snap(12, `Choose ${a[i]}.`, start, i, path, { active: i });
            dfs(i + 1, path);
            path.pop(); snap(14, `Backtrack: remove ${a[i]}.`, start, i, path, { active: i });
          }
        }
        dfs(0, []);
        snap(5, `Collected ${sol.length} unique subsets.`, 0, null, [], { done: 'ok' });
        return F;
      },
      render(f) { renderGeneric(f); }
    },

    permutations: {
      title: 'Permutations', lc: '46', difficulty: 'Medium',
      chips: ['Use Each Once', '⏱ O(n · n!) time', '💾 O(n) recursion path'],
      problem: `Given distinct integers, return all possible orderings.`,
      intuition: `Build the order one position at a time. Used numbers glow as locked-in actors; unused numbers audition for the next slot.`,
      inputs: [{ id: 'in-nums', label: 'nums', value: '1,2,3' }],
      presets: [{ label: '[1,2,3]', values: { 'in-nums': '1,2,3' } }, { label: '[0,1]', values: { 'in-nums': '0,1' } }],
      code: `class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        backtrack(nums, used, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] nums, boolean[] used, List<Integer> path, List<List<Integer>> res) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            backtrack(nums, used, path, res);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}`,
      build() {
        const a = nums('in-nums'), used = Array(a.length).fill(false), F = [], sol = [];
        const snap = (line, msg, i, path, extra) => F.push(Object.assign({ line, msg, values: a, i, path: path.slice(), used: new Set(used.map((u, idx) => u ? idx : -1).filter(x => x >= 0)), sol: sol.map(x => x.slice()) }, extra || {}));
        function dfs(path) {
          if (path.length === a.length) { sol.push(path.slice()); snap(9, `Permutation complete: ${arr(path)}.`, null, path, { found: true }); return; }
          for (let i = 0; i < a.length; i++) {
            snap(13, `Try ${a[i]} for slot ${path.length}.`, i, path);
            if (used[i]) { snap(14, `${a[i]} is already used in this order.`, i, path, { duplicate: true }); continue; }
            used[i] = true; path.push(a[i]); snap([15, 16], `Place ${a[i]} into the next slot.`, i, path, { active: i });
            dfs(path);
            path.pop(); used[i] = false; snap([18, 19], `Backtrack: free ${a[i]} for another order.`, i, path, { active: i });
          }
        }
        dfs([]);
        snap(4, `Collected ${sol.length} permutations.`, null, [], { done: 'ok' });
        return F;
      },
      render(f) { renderGeneric(f); }
    },

    combination_sum: makeCombo(false),
    combination_sum_ii: makeCombo(true),
    palindrome_partitioning: makePalindrome(),
    letter_combinations_phone_number: makePhone(),
    n_queens: makeQueens(),
    word_search: makeWordSearch()
  };

  function makeCombo(noReuse) {
    return {
      title: noReuse ? 'Combination Sum II' : 'Combination Sum',
      lc: noReuse ? '40' : '39', difficulty: 'Medium',
      chips: [noReuse ? 'Use Once + Skip Duplicates' : 'Reuse Candidates', '⏱ Exponential search', '💾 O(target) path'],
      problem: noReuse ? `Find unique combinations where candidates may contain duplicates and each number can be used once.` : `Find combinations where candidates sum to target. The same candidate may be chosen multiple times.`,
      intuition: noReuse ? `Sort candidates. Choose forward only, and skip duplicate choices at the same depth.` : `Each recursive scene chooses a candidate and reduces the remaining target. Reusing is allowed by staying at the same index.`,
      inputs: [{ id: 'in-candidates', label: 'candidates', value: noReuse ? '10,1,2,7,6,1,5' : '2,3,6,7' }, { id: 'in-target', label: 'target', value: noReuse ? '8' : '7' }],
      presets: noReuse
        ? [{ label: 'classic', values: { 'in-candidates': '10,1,2,7,6,1,5', 'in-target': '8' } }, { label: 'small', values: { 'in-candidates': '2,5,2,1,2', 'in-target': '5' } }]
        : [{ label: 'classic', values: { 'in-candidates': '2,3,6,7', 'in-target': '7' } }, { label: 'target 8', values: { 'in-candidates': '2,3,5', 'in-target': '8' } }],
      code: noReuse ? `class Solution {
    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> res = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] a, int remain, int start, List<Integer> path, List<List<Integer>> res) {
        if (remain == 0) { res.add(new ArrayList<>(path)); return; }
        for (int i = start; i < a.length; i++) {
            if (i > start && a[i] == a[i - 1]) continue;
            if (a[i] > remain) break;
            path.add(a[i]);
            backtrack(a, remain - a[i], i + 1, path, res);
            path.remove(path.size() - 1);
        }
    }
}` : `class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(candidates, target, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] a, int remain, int start, List<Integer> path, List<List<Integer>> res) {
        if (remain == 0) { res.add(new ArrayList<>(path)); return; }
        if (remain < 0) return;
        for (int i = start; i < a.length; i++) {
            path.add(a[i]);
            backtrack(a, remain - a[i], i, path, res);
            path.remove(path.size() - 1);
        }
    }
}`,
      build() {
        const a = nums('in-candidates').sort((x, y) => x - y), target = parseInt(document.getElementById('in-target').value, 10) || 0, F = [], sol = [];
        const snap = (line, msg, start, i, path, remain, extra) => F.push(Object.assign({ line, msg, values: a, i, start, path: path.slice(), remain, target, sol: sol.map(x => x.slice()) }, extra || {}));
        function dfs(start, remain, path) {
          snap(8, `Need ${remain} more to reach ${target}.`, start, null, path, remain);
          if (remain === 0) { sol.push(path.slice()); snap(9, `Combination found: ${arr(path)}.`, start, null, path, remain, { found: true }); return; }
          if (!noReuse && remain < 0) { snap(10, 'Overshot the target, backtrack.', start, null, path, remain, { dead: true }); return; }
          for (let i = start; i < a.length; i++) {
            snap(11, `Try candidate ${a[i]}.`, start, i, path, remain);
            if (noReuse && i > start && a[i] === a[i - 1]) { snap(12, `Skip duplicate ${a[i]} at this depth.`, start, i, path, remain, { duplicate: true }); continue; }
            if (noReuse && a[i] > remain) { snap(13, `${a[i]} is bigger than remaining ${remain}; stop this loop.`, start, i, path, remain, { dead: true }); break; }
            path.push(a[i]); snap(14, `Choose ${a[i]}; remaining becomes ${remain - a[i]}.`, start, i, path, remain - a[i], { active: i });
            dfs(noReuse ? i + 1 : i, remain - a[i], path);
            path.pop(); snap(16, `Backtrack: remove ${a[i]}.`, start, i, path, remain, { active: i });
          }
        }
        dfs(0, target, []);
        snap(5, `Collected ${sol.length} combination${sol.length === 1 ? '' : 's'}.`, 0, null, [], target, { done: 'ok' });
        return F;
      },
      render(f) { renderGeneric(f, `remaining ${f.remain}`); }
    };
  }

  function makePalindrome() {
    return {
      title: 'Palindrome Partitioning', lc: '131', difficulty: 'Medium',
      chips: ['Cut String into Palindromes', '⏱ O(n · 2ⁿ) time', '💾 O(n) path'],
      problem: `Partition a string so every substring in the partition is a palindrome.`,
      intuition: `Move a spotlight across the string. Every valid palindrome cut becomes a doorway to the next suffix.`,
      inputs: [{ id: 'in-s', label: 's', value: 'aab' }],
      presets: [{ label: 'aab', values: { 'in-s': 'aab' } }, { label: 'racecar', values: { 'in-s': 'racecar' } }],
      code: `class Solution {
    public List<List<String>> partition(String s) {
        List<List<String>> res = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(String s, int start, List<String> path, List<List<String>> res) {
        if (start == s.length()) { res.add(new ArrayList<>(path)); return; }
        for (int end = start; end < s.length(); end++) {
            if (!isPalindrome(s, start, end)) continue;
            path.add(s.substring(start, end + 1));
            backtrack(s, end + 1, path, res);
            path.remove(path.size() - 1);
        }
    }
}`,
      build() {
        const s = document.getElementById('in-s').value.trim(), F = [], sol = [];
        const isPal = (x) => x === x.split('').reverse().join('');
        const snap = (line, msg, start, end, path, extra) => F.push(Object.assign({ line, msg, values: s.split(''), i: end, start, path: path.slice(), sol: sol.map(x => x.slice()) }, extra || {}));
        function dfs(start, path) {
          if (start === s.length) { sol.push(path.slice()); snap(8, `Partition complete: ${path.join(' | ')}.`, start, null, path, { found: true }); return; }
          for (let end = start; end < s.length; end++) {
            const sub = s.slice(start, end + 1);
            snap(10, `Try cut "${sub}".`, start, end, path);
            if (!isPal(sub)) { snap(11, `"${sub}" is not a palindrome.`, start, end, path, { dead: true }); continue; }
            path.push(sub); snap(12, `"${sub}" is a palindrome, keep this cut.`, start, end, path, { active: end });
            dfs(end + 1, path);
            path.pop(); snap(14, `Backtrack: remove cut "${sub}".`, start, end, path);
          }
        }
        dfs(0, []);
        snap(4, `Collected ${sol.length} palindrome partitions.`, 0, null, [], { done: 'ok' });
        return F;
      },
      render(f) { renderGeneric(f); }
    };
  }

  function makePhone() {
    const map = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
    return {
      title: 'Letter Combinations of a Phone Number', lc: '17', difficulty: 'Medium',
      chips: ['Phone Keypad Tree', '⏱ O(4ⁿ) time', '💾 O(n) path'],
      problem: `Given digits from 2-9, return all letter combinations they could represent.`,
      intuition: `Each digit opens a row of letters. Backtracking picks one letter per digit until a full message appears.`,
      inputs: [{ id: 'in-digits', label: 'digits', value: '23' }],
      presets: [{ label: '23', values: { 'in-digits': '23' } }, { label: '279', values: { 'in-digits': '279' } }],
      code: `class Solution {
    public List<String> letterCombinations(String digits) {
        List<String> res = new ArrayList<>();
        if (digits.length() == 0) return res;
        backtrack(digits, 0, new StringBuilder(), res);
        return res;
    }

    private void backtrack(String digits, int i, StringBuilder path, List<String> res) {
        if (i == digits.length()) { res.add(path.toString()); return; }
        for (char ch : letters[digits.charAt(i) - '0'].toCharArray()) {
            path.append(ch);
            backtrack(digits, i + 1, path, res);
            path.deleteCharAt(path.length() - 1);
        }
    }
}`,
      build() {
        const digits = document.getElementById('in-digits').value.replace(/[^2-9]/g, ''), F = [], sol = [];
        const snap = (line, msg, i, path, extra) => F.push(Object.assign({ line, msg, values: digits.split(''), i, path: path.slice(), sol: sol.slice(), letters: map[digits[i]] || '' }, extra || {}));
        if (!digits) { snap(3, 'No digits, return empty list.', 0, [], { done: 'ok' }); return F; }
        function dfs(i, path) {
          if (i === digits.length) { sol.push(path.join('')); snap(9, `Message complete: ${path.join('')}.`, i, path, { found: true }); return; }
          for (const ch of map[digits[i]]) {
            path.push(ch); snap(11, `Digit ${digits[i]} can say "${ch}".`, i, path, { active: i });
            dfs(i + 1, path);
            path.pop(); snap(13, `Backtrack from "${ch}".`, i, path);
          }
        }
        dfs(0, []);
        snap(5, `Collected ${sol.length} combinations.`, digits.length, [], { done: 'ok' });
        return F;
      },
      render(f) { renderGeneric(f, f.letters ? `letters ${f.letters}` : ''); }
    };
  }

  function makeQueens() {
    return {
      title: 'N-Queens', lc: '51', difficulty: 'Hard',
      chips: ['Place Queens Safely', '⏱ O(n!) time', '💾 O(n) path'],
      problem: `Place <code>n</code> queens on an <code>n x n</code> chessboard so no two queens attack each other.`,
      intuition: `Place one queen per row. Columns and diagonals become danger lanes; only safe squares can host the next queen.`,
      inputs: [{ id: 'in-n', label: 'n', value: '4' }],
      presets: [{ label: 'n = 4', values: { 'in-n': '4' } }, { label: 'n = 5', values: { 'in-n': '5' } }],
      code: `class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> res = new ArrayList<>();
        backtrack(0, n, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int row, int n, List<Integer> queens, List<List<String>> res) {
        if (row == n) { buildBoard(queens, res); return; }
        for (int col = 0; col < n; col++) {
            if (!safe(row, col, queens)) continue;
            queens.add(col);
            backtrack(row + 1, n, queens, res);
            queens.remove(queens.size() - 1);
        }
    }
}`,
      build() {
        const n = Math.max(1, Math.min(6, parseInt(document.getElementById('in-n').value, 10) || 4)), F = [], sol = [];
        const safe = (row, col, qs) => qs.every((c, r) => c !== col && Math.abs(row - r) !== Math.abs(col - c));
        const snap = (line, msg, row, col, qs, extra) => F.push(Object.assign({ line, msg, n, row, col, queens: qs.slice(), sol: sol.map(x => x.slice()) }, extra || {}));
        function dfs(row, qs) {
          if (row === n) { sol.push(qs.slice()); snap(8, `Board solved with queens in columns ${arr(qs)}.`, row, null, qs, { found: true }); return; }
          for (let col = 0; col < n; col++) {
            snap(10, `Try row ${row}, column ${col}.`, row, col, qs);
            if (!safe(row, col, qs)) { snap(11, 'Square is under attack.', row, col, qs, { dead: true }); continue; }
            qs.push(col); snap(12, `Place queen at (${row}, ${col}).`, row, col, qs, { active: col });
            dfs(row + 1, qs);
            qs.pop(); snap(14, `Backtrack: remove queen from (${row}, ${col}).`, row, col, qs);
          }
        }
        dfs(0, []);
        snap(4, `Collected ${sol.length} board${sol.length === 1 ? '' : 's'}.`, n, null, [], { done: 'ok' });
        return F;
      },
      render(f) {
        const cells = [];
        for (let r = 0; r < f.n; r++) {
          for (let c = 0; c < f.n; c++) {
            const hasQ = f.queens[r] === c;
            const cls = hasQ ? 'ok' : (r === f.row && c === f.col) ? (f.dead ? 'bad active' : 'active') : ((r + c) % 2 ? 'dark' : '');
            cells.push(`<div class="mini-tile ${cls}">${hasQ ? '♛' : ''}</div>`);
          }
        }
        setHtml('stage-main', `<div class="mini-board" style="grid-template-columns:repeat(${f.n},42px)">${cells.join('')}</div>`);
        setHtml('stage-path', renderPath(f.queens.map((c, r) => `r${r}c${c}`)));
        setHtml('stage-solutions', renderSolutions(f.sol.map(q => q.map((c, r) => `r${r}c${c}`).join(' '))));
        updateStats(f);
      }
    };
  }

  function makeWordSearch() {
    return {
      title: 'Word Search', lc: '79', difficulty: 'Medium',
      chips: ['Grid DFS', '⏱ O(mn · 4ᴸ) time', '💾 O(L) path'],
      problem: `Given a board and a word, determine if the word exists by moving horizontally or vertically without reusing a cell.`,
      intuition: `Each matching letter lights the next tile in a path. If a direction fails, the path rewinds and tries another route.`,
      inputs: [{ id: 'in-board', label: 'board rows', value: 'ABCE/SFCS/ADEE' }, { id: 'in-word', label: 'word', value: 'ABCCED' }],
      presets: [{ label: 'ABCCED', values: { 'in-board': 'ABCE/SFCS/ADEE', 'in-word': 'ABCCED' } }, { label: 'SEE', values: { 'in-board': 'ABCE/SFCS/ADEE', 'in-word': 'SEE' } }, { label: 'ABCB', values: { 'in-board': 'ABCE/SFCS/ADEE', 'in-word': 'ABCB' } }],
      code: `class Solution {
    public boolean exist(char[][] board, String word) {
        for (int r = 0; r < board.length; r++) {
            for (int c = 0; c < board[0].length; c++) {
                if (dfs(board, word, r, c, 0)) return true;
            }
        }
        return false;
    }

    private boolean dfs(char[][] b, String w, int r, int c, int i) {
        if (i == w.length()) return true;
        if (r < 0 || c < 0 || r == b.length || c == b[0].length || b[r][c] != w.charAt(i)) return false;
        char temp = b[r][c];
        b[r][c] = '#';
        boolean found = dfs(b,w,r+1,c,i+1) || dfs(b,w,r-1,c,i+1) || dfs(b,w,r,c+1,i+1) || dfs(b,w,r,c-1,i+1);
        b[r][c] = temp;
        return found;
    }
}`,
      build() {
        const board = document.getElementById('in-board').value.split('/').map(r => r.trim().toUpperCase().split('')).filter(r => r.length);
        const word = document.getElementById('in-word').value.trim().toUpperCase();
        const F = [], path = [];
        let answer = false;
        const key = (r, c) => `${r},${c}`;
        const snap = (line, msg, r, c, i, extra) => F.push(Object.assign({ line, msg, board, word, r, c, i, path: path.slice(), sol: answer ? [word] : [] }, extra || {}));
        function dfs(r, c, i, seen) {
          snap(10, `Look for "${word[i] || 'done'}" at (${r}, ${c}).`, r, c, i);
          if (i === word.length) { answer = true; snap(11, `All letters matched.`, r, c, i, { done: 'ok', answer: true }); return true; }
          if (r < 0 || c < 0 || r >= board.length || c >= board[0].length || seen.has(key(r, c)) || board[r][c] !== word[i]) { snap(12, 'This cell cannot continue the word.', r, c, i, { dead: true }); return false; }
          seen.add(key(r, c)); path.push([r, c, board[r][c]]); snap(14, `Match "${board[r][c]}" and step deeper.`, r, c, i, { active: true });
          const ok = dfs(r + 1, c, i + 1, seen) || dfs(r - 1, c, i + 1, seen) || dfs(r, c + 1, i + 1, seen) || dfs(r, c - 1, i + 1, seen);
          if (ok) return true;
          path.pop(); seen.delete(key(r, c)); snap(17, `Backtrack from (${r}, ${c}).`, r, c, i);
          return false;
        }
        for (let r = 0; r < board.length && !answer; r++) for (let c = 0; c < board[0].length && !answer; c++) { snap(3, `Start search from (${r}, ${c}).`, r, c, 0); dfs(r, c, 0, new Set()); }
        if (!answer) snap(7, `No path spells ${word}.`, 0, 0, 0, { done: 'bad', answer: false });
        return F;
      },
      render(f) {
        const inPath = new Map(f.path.map((p, i) => [`${p[0]},${p[1]}`, i]));
        const cells = [];
        for (let r = 0; r < f.board.length; r++) for (let c = 0; c < f.board[0].length; c++) {
          const k = `${r},${c}`;
          const cls = r === f.r && c === f.c ? (f.dead ? 'bad active' : 'active') : inPath.has(k) ? 'ok' : '';
          cells.push(`<div class="mini-tile ${cls}">${esc(f.board[r][c])}</div>`);
        }
        setHtml('stage-main', `<div class="mini-board" style="grid-template-columns:repeat(${f.board[0].length},42px)">${cells.join('')}</div>`);
        setHtml('stage-path', renderPath(f.path.map(p => p[2])));
        setHtml('stage-solutions', f.answer ? chip(f.word) : '<span style="color:var(--text-3);font-size:.8rem;">searching</span>');
        updateStats(f);
      }
    };
  }

  function renderGeneric(f, note) {
    const used = f.used || null;
    setHtml('stage-main', renderCards(f.values || [], f.i, used));
    setHtml('stage-path', renderPath(f.path || []));
    setHtml('stage-solutions', renderSolutions(f.sol || []));
    setHtml('state-extra', note || (f.choice ? f.choice : f.duplicate ? 'duplicate skipped' : f.dead ? 'dead end' : f.found ? 'solution recorded' : '-'));
    updateStats(f);
  }

  function updateStats(f) {
    document.getElementById('state-depth').textContent = (f.path || f.queens || []).length;
    document.getElementById('state-solutions-count').textContent = (f.sol || []).length;
    const res = document.getElementById('result');
    res.className = 'result-banner' + (f.done ? ` show ${f.done}` : '');
    res.textContent = f.done ? (f.done === 'bad' ? '✗ no solution' : `✓ ${((f.sol || []).length)} solution${(f.sol || []).length === 1 ? '' : 's'}`) : '';
  }

  function mountShell(cfg) {
    document.title = `${cfg.title} — Interactive Visualization`;
    document.getElementById('problem-title').textContent = cfg.title;
    document.getElementById('lc-chip').textContent = `LC ${cfg.lc}`;
    document.getElementById('difficulty-chip').textContent = cfg.difficulty;
    document.getElementById('difficulty-chip').className = `chip ${cfg.difficulty.toLowerCase()}`;
    document.getElementById('hero-chips').innerHTML = cfg.chips.map((c, i) => `<span class="chip ${i === 0 ? 'accent' : ''}">${c}</span>`).join('');
    document.getElementById('problem-copy').innerHTML = `<p>${cfg.problem}</p>`;
    document.getElementById('intuition-copy').innerHTML = `<p>${cfg.intuition}</p>`;
    document.getElementById('input-fields').innerHTML = cfg.inputs.map(inp => `<div class="field"><label for="${inp.id}">${inp.label}</label><input id="${inp.id}" value="${esc(inp.value)}"></div>`).join('');
    document.getElementById('preset-row').innerHTML = cfg.presets.map((p, i) => `<button class="preset-btn" data-preset="${i}">${p.label}</button>`).join('');
    document.getElementById('narration').innerHTML = `<p>${cfg.intuition}</p>`;
  }

  function init(key) {
    const cfg = CONFIGS[key];
    if (!cfg) throw new Error(`Unknown backtracking problem: ${key}`);
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
