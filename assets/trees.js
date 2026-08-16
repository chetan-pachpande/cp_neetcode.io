window.TreeStoryPage = (function () {
  'use strict';

  const esc = (s) => Viz.escapeHtml(String(s));
  const arr = (a) => `[${a.join(', ')}]`;
  const chip = (k, v, cls) => Viz.kvChip(k, v, cls || '');

  function parseTreeInput(id) {
    return document.getElementById(id).value.split(',').map(s => {
      const t = s.trim();
      return !t || t.toLowerCase() === 'null' ? null : parseInt(t, 10);
    });
  }

  function treeData(values) {
    const built = Viz.buildTree(values);
    return { root: built.root, nodes: built.nodes };
  }

  function cloneLayout(root) {
    const clone = Viz.cloneTree(root);
    return { root: clone, nodes: Viz.layoutTree(clone) };
  }

  function nodeList(root) {
    const out = [];
    (function walk(n) { if (!n) return; out.push(n); walk(n.left); walk(n.right); })(root);
    return out;
  }

  function htmlList(items) {
    return items.length ? items.map(x => `<span class="solution-chip">${esc(x)}</span>`).join('') : '<span style="color:var(--text-3);font-size:.8rem;">empty</span>';
  }

  function renderSingle(f, classFn, subFn) {
    document.getElementById('stage-extra-tree').style.display = 'none';
    Viz.renderTree(document.getElementById('stage-tree'), { root: f.root, nodes: f.nodes }, classFn, { sub: subFn });
    document.getElementById('stage-list').innerHTML = htmlList(f.items || []);
    document.getElementById('state-a').textContent = f.metricA ?? '-';
    document.getElementById('state-b').textContent = f.metricB ?? '-';
    const res = document.getElementById('result');
    res.className = 'result-banner' + (f.done ? ` show ${f.done}` : '');
    res.textContent = f.result || '';
  }

  function renderDual(f, classFnA, classFnB, subA, subB) {
    document.getElementById('stage-extra-tree').style.display = 'flex';
    Viz.renderTree(document.getElementById('stage-tree'), { root: f.root, nodes: f.nodes }, classFnA, { sub: subA });
    Viz.renderTree(document.getElementById('stage-extra-tree'), { root: f.root2, nodes: f.nodes2 }, classFnB, { sub: subB });
    document.getElementById('stage-list').innerHTML = htmlList(f.items || []);
    document.getElementById('state-a').textContent = f.metricA ?? '-';
    document.getElementById('state-b').textContent = f.metricB ?? '-';
    const res = document.getElementById('result');
    res.className = 'result-banner' + (f.done ? ` show ${f.done}` : '');
    res.textContent = f.result || '';
  }

  function basicTreeConfig(key, title, lc, difficulty, chips, problem, intuition, code, build) {
    return { key, title, lc, difficulty, chips, problem, intuition, inputs: [{ id: 'in-tree', label: 'tree — level-order, null for missing', value: '4,2,7,1,3,6,9' }], presets: [
      { label: 'balanced', values: { 'in-tree': '4,2,7,1,3,6,9' } },
      { label: 'skewed', values: { 'in-tree': '1,2,null,3,null,4' } },
      { label: 'small', values: { 'in-tree': '2,1,3' } }
    ], code, build, render: (f) => renderSingle(f, n => n.id === f.activeId ? 'active' : (f.okIds || []).includes(n.id) ? 'ok' : (f.badIds || []).includes(n.id) ? 'bad' : '', n => f.labels ? f.labels[n.id] : null) };
  }

  const CONFIGS = {};

  CONFIGS.diameter_binary_tree = basicTreeConfig(
    'diameter_binary_tree', 'Diameter of Binary Tree', '543', 'Easy',
    ['Postorder Height', '⏱ O(n) time', '💾 O(h) stack'],
    'Return the length of the longest path between any two nodes in the tree.',
    'Each node acts like a bridge. Its best path is left height plus right height, while it returns one height upward to its parent.',
    `class Solution {
    int best = 0;
    public int diameterOfBinaryTree(TreeNode root) {
        height(root);
        return best;
    }
    private int height(TreeNode node) {
        if (node == null) return 0;
        int left = height(node.left);
        int right = height(node.right);
        best = Math.max(best, left + right);
        return 1 + Math.max(left, right);
    }
}`,
    function () {
      const { root } = treeData(parseTreeInput('in-tree'));
      const F = [], okIds = [], labels = {};
      let best = 0;
      const snap = (line, msg, activeId, extra) => F.push(Object.assign({ line, msg, ...cloneLayout(root), activeId, okIds: okIds.slice(), labels: Object.assign({}, labels), metricA: best, metricB: 'diameter' }, extra || {}));
      function height(n) {
        if (!n) { snap(7, 'This child is null — a null subtree contributes a height of 0 to any path calculations, since there is no descent through it at all.', null); return 0; }
        snap(8, `Descend into node ${n.val} — the diameter calculation treats every node like a potential "bridge" between two of its subtrees. Recursively measure the height of the left subtree and the height of the right subtree first.`, n.id);
        const left = height(n.left), right = height(n.right);
        best = Math.max(best, left + right);
        labels[n.id] = `h${1 + Math.max(left, right)}`;
        okIds.push(n.id);
        snap([10, 11], `Back at node ${n.val}: the longest path that bends through this node uses its left height (${left}) plus its right height (${right}) = ${left + right} edges. This is a candidate for the global diameter. The best path found so far is ${best}.`, n.id);
        return 1 + Math.max(left, right);
      }
      height(root);
      snap(4, `Every node has been visited. The path that spanned the widest through some node in the tree is the diameter — the longest possible path between any two nodes. Return ${best}.`, null, { done: 'ok', result: `✓ diameter = ${best}` });
      return F;
    }
  );

  CONFIGS.balanced_binary_tree = basicTreeConfig(
    'balanced_binary_tree', 'Balanced Binary Tree', '110', 'Easy',
    ['Height Check', '⏱ O(n) time', '💾 O(h) stack'],
    'Return true if every node has left and right subtree heights differing by at most one.',
    'A subtree reports its height upward. If any node sees a height gap larger than one, the imbalance spreads upward.',
    `class Solution {
    public boolean isBalanced(TreeNode root) {
        return height(root) != -1;
    }
    private int height(TreeNode node) {
        if (node == null) return 0;
        int left = height(node.left);
        int right = height(node.right);
        if (left == -1 || right == -1 || Math.abs(left - right) > 1) return -1;
        return 1 + Math.max(left, right);
    }
}`,
    function () {
      const { root } = treeData(parseTreeInput('in-tree'));
      const F = [], okIds = [], badIds = [], labels = {};
      const snap = (line, msg, activeId, extra) => F.push(Object.assign({ line, msg, ...cloneLayout(root), activeId, okIds: okIds.slice(), badIds: badIds.slice(), labels: Object.assign({}, labels), metricA: badIds.length ? 'false' : 'true', metricB: 'balanced?' }, extra || {}));
      function height(n) {
        if (!n) return 0;
        snap(6, `Inspect node ${n.val} — it is balanced if and only if both its subtrees are balanced AND the height difference between them is at most 1.`, n.id);
        const l = height(n.left), r = height(n.right);
        if (l === -1 || r === -1 || Math.abs(l - r) > 1) { badIds.push(n.id); labels[n.id] = 'bad'; snap(9, `Node ${n.val} fails the balance check: its left subtree has height ${l === -1 ? 'invalid (imbalanced)' : l} and right subtree has height ${r === -1 ? 'invalid (imbalanced)' : r}. When one subtree is already imbalanced, or when the two sides differ by more than 1, this node and all its ancestors are imbalanced. Return -1 to signal the failure upward.`, n.id); return -1; }
        labels[n.id] = `h${1 + Math.max(l, r)}`; okIds.push(n.id); snap(10, `Node ${n.val} is balanced: both children are balanced, and the height difference is ${Math.abs(l - r)} (within the allowed 1). Its own height is ${labels[n.id]}.`, n.id);
        return 1 + Math.max(l, r);
      }
      const ok = height(root) !== -1;
      snap(3, ok ? 'The entire tree is balanced: every node has subtrees with height difference at most 1, and no node failed the check.' : 'The tree is not balanced: at least one node has subtrees differing in height by more than 1, or a child subtree is already imbalanced.', null, { done: ok ? 'ok' : 'bad', result: ok ? '✓ balanced' : '✗ not balanced' });
      return F;
    }
  );

  CONFIGS.binary_tree_right_side_view = basicTreeConfig(
    'binary_tree_right_side_view', 'Binary Tree Right Side View', '199', 'Medium',
    ['Level Order View', '⏱ O(n) time', '💾 O(w) queue'],
    'Return the node values visible from the right side of the tree.',
    'Scan level by level. The last node visited on each level is the one visible from the right.',
    `class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> res = new ArrayList<>();
        Queue<TreeNode> q = new ArrayDeque<>();
        if (root != null) q.offer(root);
        while (!q.isEmpty()) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                TreeNode node = q.poll();
                if (i == size - 1) res.add(node.val);
                if (node.left != null) q.offer(node.left);
                if (node.right != null) q.offer(node.right);
            }
        }
        return res;
    }
}`,
    function () {
      const { root } = treeData(parseTreeInput('in-tree'));
      const F = [], items = [], okIds = [];
      const snap = (line, msg, activeId, extra) => F.push(Object.assign({ line, msg, ...cloneLayout(root), activeId, okIds: okIds.slice(), items: items.slice(), metricA: items.length, metricB: 'visible' }, extra || {}));
      const q = root ? [root] : [];
      while (q.length) {
        const size = q.length;
        snap(7, `Process level ${Math.floor(Math.log2(Math.max(1, items.length + 1)))} with ${size} node${size === 1 ? '' : 's'} currently in the queue — only the last node visited on this level is visible from the right.`, q[0].id);
        for (let i = 0; i < size; i++) {
          const n = q.shift();
          snap(9, `Dequeue node ${n.val}. Add its children to the back of the queue for the next level (if they exist).`, n.id);
          if (i === size - 1) { items.push(n.val); okIds.push(n.id); snap(10, `Node ${n.val} is the last (rightmost) node dequeued from this level — when viewed from the right side of the tree, this is the only node from this depth that would be visible, since all its siblings to the left are hidden behind it.`, n.id); }
          if (n.left) q.push(n.left);
          if (n.right) q.push(n.right);
        }
      }
      snap(15, `Every level has been processed. The nodes we collected are those visible when looking at the tree from the right side: ${arr(items)}.`, null, { done: 'ok', result: `✓ ${arr(items)}` });
      return F;
    }
  );

  CONFIGS.count_good_nodes = basicTreeConfig(
    'count_good_nodes', 'Count Good Nodes in Binary Tree', '1448', 'Medium',
    ['DFS with Max So Far', '⏱ O(n) time', '💾 O(h) stack'],
    'A node is good if no ancestor has a value greater than it. Count all good nodes.',
    'Carry the maximum value seen on the path. A node that meets or beats that maximum becomes visible and good.',
    `class Solution {
    public int goodNodes(TreeNode root) {
        return dfs(root, Integer.MIN_VALUE);
    }
    private int dfs(TreeNode node, int maxSoFar) {
        if (node == null) return 0;
        int good = node.val >= maxSoFar ? 1 : 0;
        maxSoFar = Math.max(maxSoFar, node.val);
        return good + dfs(node.left, maxSoFar) + dfs(node.right, maxSoFar);
    }
}`,
    function () {
      const { root } = treeData(parseTreeInput('in-tree'));
      const F = [], okIds = [];
      let count = 0;
      const snap = (line, msg, activeId, extra) => F.push(Object.assign({ line, msg, ...cloneLayout(root), activeId, okIds: okIds.slice(), metricA: count, metricB: 'good' }, extra || {}));
      function dfs(n, max) {
        if (!n) return;
        snap(6, `Visit node ${n.val}. The largest value seen anywhere on the path from root down to here is ${max === -Infinity ? '-∞ (nothing yet)' : max}. A node is "good" if its value is at least that maximum — meaning no ancestor was ever larger.`, n.id);
        if (n.val >= max) { count++; okIds.push(n.id); snap(7, `Node ${n.val} ≥ ${max === -Infinity ? '-∞' : max}, so no ancestor is larger — this node qualifies as good. Increment the count to ${count}.`, n.id); }
        dfs(n.left, Math.max(max, n.val));
        dfs(n.right, Math.max(max, n.val));
      }
      dfs(root, -Infinity);
      snap(3, `Every path from root to a leaf has been explored. Total good nodes discovered: ${count}.`, null, { done: 'ok', result: `✓ ${count} good nodes` });
      return F;
    }
  );

  CONFIGS.lowest_common_ancestor_bst = Object.assign(
    basicTreeConfig(
      'lowest_common_ancestor_bst', 'Lowest Common Ancestor of a BST', '235', 'Medium',
      ['BST Guided Walk', '⏱ O(h) time', '💾 O(1) space'],
      'Find the lowest node in a BST that has both target nodes in its subtree.',
      'The BST orders the search. If both targets are smaller, walk left. If both are larger, walk right. The first split point is the LCA.',
      `class Solution {
    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
        TreeNode cur = root;
        while (cur != null) {
            if (p.val < cur.val && q.val < cur.val) cur = cur.left;
            else if (p.val > cur.val && q.val > cur.val) cur = cur.right;
            else return cur;
        }
        return null;
    }
}`,
      function () {
        const { root } = treeData(parseTreeInput('in-tree'));
        const p = parseInt(document.getElementById('in-p').value, 10);
        const q = parseInt(document.getElementById('in-q').value, 10);
        const F = [], okIds = [];
        const snap = (line, msg, activeId, extra) => F.push(Object.assign({ line, msg, ...cloneLayout(root), activeId, okIds: okIds.slice(), metricA: `${p}, ${q}`, metricB: 'targets' }, extra || {}));
        let cur = root;
        while (cur) {
          snap(4, `Inspect node ${cur.val}. In a binary search tree, this single node acts as a "split point" — everything to its left is smaller, everything to the right is larger. Use that to determine where both targets must lie.`, cur.id);
          if (p < cur.val && q < cur.val) { snap(5, `Both targets ${p} and ${q} are strictly less than ${cur.val}, so both must be in the left subtree. The LCA must be in the left branch, because the right branch contains only values larger than both targets.`, cur.id); cur = cur.left; }
          else if (p > cur.val && q > cur.val) { snap(6, `Both targets ${p} and ${q} are strictly greater than ${cur.val}, so both must be in the right subtree. The LCA cannot be at this node or in its left subtree — it must be further right.`, cur.id); cur = cur.right; }
          else { okIds.push(cur.id); snap(7, `Node ${cur.val} is the lowest common ancestor: one target is on the left and one is on the right (or one is exactly this node). This node is the unique point where the paths to both targets must diverge. It is lower than the root because at least one target required walking down the tree, and it is lower than the targets themselves because they lie in different subtrees from here.`, cur.id, { done: 'ok', result: `✓ LCA = ${cur.val}` }); break; }
        }
        if (!cur) snap(10, 'One or both targets were not found in the tree structure.', null, { done: 'bad', result: 'not found' });
        return F;
      }
    ),
    { inputs: [
      { id: 'in-tree', label: 'BST — level-order, null for missing', value: '6,2,8,0,4,7,9,null,null,3,5' },
      { id: 'in-p', label: 'p', value: '2' },
      { id: 'in-q', label: 'q', value: '8' }
    ], presets: [
      { label: 'split at root', values: { 'in-tree': '6,2,8,0,4,7,9,null,null,3,5', 'in-p': '2', 'in-q': '8' } },
      { label: 'inside left', values: { 'in-tree': '6,2,8,0,4,7,9,null,null,3,5', 'in-p': '3', 'in-q': '5' } },
      { label: 'ancestor target', values: { 'in-tree': '6,2,8,0,4,7,9,null,null,3,5', 'in-p': '2', 'in-q': '4' } }
    ] }
  );

  CONFIGS.kth_smallest_bst = Object.assign(
    basicTreeConfig(
      'kth_smallest_bst', 'Kth Smallest Element in a BST', '230', 'Medium',
      ['Inorder = Sorted', '⏱ O(h + k) time', '💾 O(h) stack'],
      'Return the kth smallest value in a binary search tree.',
      'Inorder traversal of a BST produces values in sorted order. Count visits until the kth node appears.',
      `class Solution {
    int seen = 0;
    int answer = 0;
    public int kthSmallest(TreeNode root, int k) {
        inorder(root, k);
        return answer;
    }
    private void inorder(TreeNode node, int k) {
        if (node == null) return;
        inorder(node.left, k);
        if (++seen == k) answer = node.val;
        inorder(node.right, k);
    }
}`,
      function () {
        const { root } = treeData(parseTreeInput('in-tree'));
        const k = parseInt(document.getElementById('in-k').value, 10);
        const F = [], items = [], okIds = [];
        let answer = null;
        const snap = (line, msg, activeId, extra) => F.push(Object.assign({ line, msg, ...cloneLayout(root), activeId, okIds: okIds.slice(), items: items.slice(), metricA: `${items.length}/${k}`, metricB: 'seen' }, extra || {}));
        function inorder(n) {
          if (!n || answer !== null) return;
          snap(8, `Inorder traversal visits subtrees in the order: left, then this node, then right. By visiting the left subtree first, we encounter smaller values before larger ones — that is what makes inorder traversal of a BST produce values in ascending sorted order.`, n.id);
          inorder(n.left);
          if (answer !== null) return;
          items.push(n.val); okIds.push(n.id);
          snap(10, `Visit node ${n.val} in inorder sequence. It is the ${items.length}${items.length === 1 ? 'st' : items.length === 2 ? 'nd' : items.length === 3 ? 'rd' : 'th'} smallest node encountered so far, because inorder visits nodes in ascending order.`, n.id);
          if (items.length === k) { answer = n.val; snap(10, `Node ${n.val} is the kth = ${k}${k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} smallest value overall in the tree. Stop traversing and return this value.`, n.id, { done: 'ok', result: `✓ ${answer}` }); return; }
          inorder(n.right);
        }
        inorder(root);
        if (answer === null) snap(5, `Inorder traversal finished, but we never reached k = ${k} nodes. The tree must have fewer than ${k} nodes total.`, null, { done: 'bad', result: 'k too large' });
        return F;
      }
    ),
    { inputs: [
      { id: 'in-tree', label: 'BST — level-order, null for missing', value: '5,3,6,2,4,null,null,1' },
      { id: 'in-k', label: 'k', value: '3' }
    ], presets: [
      { label: 'k = 3', values: { 'in-tree': '5,3,6,2,4,null,null,1', 'in-k': '3' } },
      { label: 'first', values: { 'in-tree': '3,1,4,null,2', 'in-k': '1' } },
      { label: 'middle', values: { 'in-tree': '7,3,9,1,5,8,10', 'in-k': '5' } }
    ] }
  );

  CONFIGS.binary_tree_maximum_path_sum = basicTreeConfig(
    'binary_tree_maximum_path_sum', 'Binary Tree Maximum Path Sum', '124', 'Hard',
    ['Postorder Gain', '⏱ O(n) time', '💾 O(h) stack'],
    'Given the root of a binary tree, find the maximum sum of any path through it. A path is a sequence of nodes connected by edges where no node repeats — it does not need to pass through the root, and it does not need to start or end at a leaf. Return the maximum sum over every possible path.',
    "Think about the best path that bends AT a specific node: it can use up to two branches out of it, one going down-left and one going down-right, forming an upside-down V. That gives node.val + best gain from the left subtree + best gain from the right subtree — a candidate for the global answer. But here is the subtlety that trips most people up: when this node needs to hand a usable value UP to its own parent, it can only offer ONE branch, not both — a path is a single unbranching line, and if the parent tried to extend through this node using both children at once, the path would fork into a Y-shape, which is no longer a valid path. So every node computes two different things: the best 'full path' bending here (using both children, only ever a candidate for the answer, never passed upward), and the best 'extendable gain' handed up to the parent (this node's value plus the LARGER of its two child gains, not both). One more detail: if a child's best gain is negative, using it would only shrink the sum, so clamp it to 0 — meaning 'do not extend into that subtree at all.' Track the best full-path value seen at any node as the traversal proceeds; that running best is the final answer.",
    `class Solution {
    int best = Integer.MIN_VALUE;
    public int maxPathSum(TreeNode root) {
        gain(root);
        return best;
    }
    private int gain(TreeNode node) {
        if (node == null) return 0;
        int left = Math.max(0, gain(node.left));
        int right = Math.max(0, gain(node.right));
        best = Math.max(best, node.val + left + right);
        return node.val + Math.max(left, right);
    }
}`,
    function () {
      const { root } = treeData(parseTreeInput('in-tree'));
      const F = [], okIds = [], labels = {};
      let best = -Infinity;
      const snap = (line, msg, activeId, extra) => F.push(Object.assign({ line, msg, ...cloneLayout(root), activeId, okIds: okIds.slice(), labels: Object.assign({}, labels), metricA: best === -Infinity ? '-∞' : best, metricB: 'best' }, extra || {}));
      function gain(n) {
        if (!n) return 0;
        snap([9, 10], `Visit node ${n.val} — recurse into its left and right children first to learn each one's best "extendable gain" (the most it could add to a path continuing through it from below). Any negative gain gets clamped to 0, since using it would only shrink whatever path it's attached to.`, n.id);
        const left = Math.max(0, gain(n.left));
        const right = Math.max(0, gain(n.right));
        const full = n.val + left + right;
        const improved = full > best;
        best = Math.max(best, full);
        snap(11, `Back at ${n.val}: the best path that BENDS here uses both children at once — ${n.val} + left gain ${left} + right gain ${right} = ${full}. This full path is only a candidate for the global answer (the path doesn't have to pass through the root or end at a leaf).${improved ? ` It beats the previous best, so best updates to ${best}.` : ` It doesn't beat the current best of ${best}, so best stays put.`}`, n.id);
        const up = n.val + Math.max(left, right);
        labels[n.id] = `↑${up}`; okIds.push(n.id);
        snap(12, `${n.val} can only report ONE usable branch up to its parent, not both — a path can't fork through two children and still be a single line. So it hands up ${n.val} + max(${left}, ${right}) = ${up}, keeping whichever side extends further, and silently discarding the other.`, n.id);
        return up;
      }
      gain(root);
      snap(4, `Every node has been visited. The full-path candidate that produced the best value along the way is the answer, whether or not it happened to pass through the root: maximum path sum = ${best}.`, null, { done: 'ok', result: `✓ max path = ${best}` });
      return F;
    }
  );

  CONFIGS.serialize_deserialize_binary_tree = basicTreeConfig(
    'serialize_deserialize_binary_tree', 'Serialize and Deserialize Binary Tree', '297', 'Hard',
    ['Preorder with Nulls', '⏱ O(n) time', '💾 O(n) data'],
    'Design an algorithm that serializes a binary tree into a single string, and deserializes that string back into a tree with the exact same structure — same values in the same positions, including exactly where children are missing. The tree may contain duplicate values, so values alone are never enough to reconstruct the shape; the structure itself must be encoded.',
    "A plain traversal that only records real node values loses information: given just a sequence of numbers, there's no way to tell where one subtree ends and the next begins, or where a child was missing versus simply not yet visited — the same sequence could match multiple different tree shapes. The fix is to write an explicit marker (here, the character '#') every time the traversal reaches a missing child, instead of silently skipping over it. Because the traversal is preorder — a node is always written before either of its children — decoding can rebuild the tree with a simple recursive process: read the next token; if it's '#', that subtree is empty and decoding returns immediately; otherwise it's a real value, so create that node, then recursively decode its left subtree, then its right subtree, consuming tokens from the same stream in the exact order they were written. Because every null is explicit, there is never any ambiguity about where one subtree's tokens end and the next one's begin.",
    `public class Codec {
    public String serialize(TreeNode root) {
        List<String> out = new ArrayList<>();
        dfs(root, out);
        return String.join(",", out);
    }
    private void dfs(TreeNode node, List<String> out) {
        if (node == null) { out.add("#"); return; }
        out.add(String.valueOf(node.val));
        dfs(node.left, out);
        dfs(node.right, out);
    }
}`,
    function () {
      const { root } = treeData(parseTreeInput('in-tree'));
      const F = [], items = [], okIds = [];
      const snap = (line, msg, activeId, extra) => F.push(Object.assign({ line, msg, ...cloneLayout(root), activeId, okIds: okIds.slice(), items: items.slice(), metricA: items.length, metricB: 'tokens' }, extra || {}));
      function dfs(n) {
        if (!n) { items.push('#'); snap(8, 'This branch is empty — write the explicit marker "#" instead of just skipping it. Without a marker here, decoding would have no way to know a child was missing at this exact position versus simply not reached yet.', null); return; }
        items.push(n.val); okIds.push(n.id); snap(9, `Write node ${n.val} BEFORE its children — that's what makes this preorder. Decoding will read this value first, immediately know a real node belongs here, and only then recurse to consume its left subtree's tokens, followed by its right subtree's tokens, in this exact order.`, n.id);
        dfs(n.left); dfs(n.right);
      }
      dfs(root);
      snap(4, `Serialized stream: ${items.join(',')}. Every real value and every "#" null-marker appears in preorder, so decode() can walk this exact sequence token by token and rebuild an identical tree shape with zero ambiguity.`, null, { done: 'ok', result: `✓ ${items.join(',')}` });
      return F;
    }
  );

  CONFIGS.construct_binary_tree_pre_inorder = Object.assign(
    basicTreeConfig(
      'construct_binary_tree_pre_inorder', 'Construct Tree from Preorder and Inorder', '105', 'Medium',
      ['Root then Split', '⏱ O(n) time', '💾 O(n) map'],
      'Build a binary tree from preorder and inorder traversal arrays.',
      'Preorder reveals the next root. Inorder tells which values belong left and which belong right. Repeating that split reconstructs the tree.',
      `class Solution {
    int pre = 0;
    Map<Integer, Integer> idx = new HashMap<>();
    public TreeNode buildTree(int[] preorder, int[] inorder) {
        for (int i = 0; i < inorder.length; i++) idx.put(inorder[i], i);
        return build(preorder, 0, inorder.length - 1);
    }
    private TreeNode build(int[] preorder, int left, int right) {
        if (left > right) return null;
        TreeNode root = new TreeNode(preorder[pre++]);
        int mid = idx.get(root.val);
        root.left = build(preorder, left, mid - 1);
        root.right = build(preorder, mid + 1, right);
        return root;
    }
}`,
      function () {
        const preorder = document.getElementById('in-pre').value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
        const inorder = document.getElementById('in-in').value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
        let pre = 0, nextId = 0;
        const idx = new Map(inorder.map((v, i) => [v, i]));
        const F = [], items = [];
        let root = null;
        const snap = (line, msg, activeId, extra) => {
          const clone = cloneLayout(root);
          F.push(Object.assign({ line, msg, root: clone.root, nodes: clone.nodes, activeId, items: items.slice(), metricA: pre, metricB: 'pre index' }, extra || {}));
        };
        function build(left, right) {
          if (left > right) { snap(9, `The inorder range [${left}, ${right}] is empty (left > right), meaning there are no more values to assign to this subtree — return null.`, null); return null; }
          const val = preorder[pre++], node = { id: nextId++, val, left: null, right: null };
          if (!root) root = node;
          items.push(`root ${val}`);
          snap(10, `Preorder visits roots first, so the next unprocessed value in preorder is ${val} — it must be the root of the current subtree. Create a node with value ${val}.`, node.id);
          const mid = idx.get(val);
          snap(11, `In inorder, ${val} appears at index ${mid}. Everything to its left (inorder indices [${left}, ${mid - 1}]) must belong to the left subtree, and everything to its right (inorder indices [${mid + 1}, ${right}]) must belong to the right subtree. This split is absolute and unambiguous — once we know which node is root and its position in inorder, the subtree boundaries are determined.`, node.id);
          node.left = build(left, mid - 1);
          node.right = build(mid + 1, right);
          return node;
        }
        root = build(0, inorder.length - 1);
        snap(5, 'All nodes have been constructed by consuming preorder values in sequence and splitting inorder ranges. The tree structure has been completely reconstructed: same values in the same positions as the original tree.', null, { done: 'ok', result: '✓ tree built' });
        return F;
      }
    ),
    { inputs: [
      { id: 'in-pre', label: 'preorder', value: '3,9,20,15,7' },
      { id: 'in-in', label: 'inorder', value: '9,3,15,20,7' }
    ], presets: [
      { label: 'classic', values: { 'in-pre': '3,9,20,15,7', 'in-in': '9,3,15,20,7' } },
      { label: 'balanced', values: { 'in-pre': '4,2,1,3,6,5,7', 'in-in': '1,2,3,4,5,6,7' } },
      { label: 'chain', values: { 'in-pre': '1,2,3,4', 'in-in': '4,3,2,1' } }
    ] }
  );

  CONFIGS.same_tree = {
    key: 'same_tree', title: 'Same Tree', lc: '100', difficulty: 'Easy',
    chips: ['Paired DFS', '⏱ O(n) time', '💾 O(h) stack'],
    problem: 'Return true if two binary trees are structurally identical and have the same values.',
    intuition: 'Walk both trees in lockstep. Every pair must either be two nulls or two nodes with equal values whose children also match.',
    inputs: [
      { id: 'in-tree', label: 'p — level-order', value: '1,2,3' },
      { id: 'in-tree-b', label: 'q — level-order', value: '1,2,3' }
    ],
    presets: [
      { label: 'same', values: { 'in-tree': '1,2,3', 'in-tree-b': '1,2,3' } },
      { label: 'shape differs', values: { 'in-tree': '1,2', 'in-tree-b': '1,null,2' } },
      { label: 'value differs', values: { 'in-tree': '1,2,1', 'in-tree-b': '1,1,2' } }
    ],
    code: `class Solution {
    public boolean isSameTree(TreeNode p, TreeNode q) {
        if (p == null && q == null) return true;
        if (p == null || q == null) return false;
        if (p.val != q.val) return false;
        return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
    }
}`,
    build: function () {
      const A = treeData(parseTreeInput('in-tree'));
      const B = treeData(parseTreeInput('in-tree-b'));
      const F = [], okA = [], okB = [], badA = [], badB = [];
      const snap = (line, msg, a, b, extra) => F.push(Object.assign({ line, msg, ...cloneLayout(A.root), ...Object.fromEntries(Object.entries(cloneLayout(B.root)).map(([k, v]) => [k === 'root' ? 'root2' : 'nodes2', v])), activeA: a ? a.id : null, activeB: b ? b.id : null, okA: okA.slice(), okB: okB.slice(), badA: badA.slice(), badB: badB.slice(), metricA: okA.length, metricB: 'matched' }, extra || {}));
      function same(a, b) {
        snap(2, `Compare node from p (${a ? `value ${a.val}` : 'null'}) with node from q (${b ? `value ${b.val}` : 'null'}). Both must match structurally and by value at every position for the trees to be identical.`, a, b);
        if (!a && !b) return true;
        if (!a || !b) { if (a) badA.push(a.id); if (b) badB.push(b.id); snap(4, `One tree has a null at this position while the other has a node — the structures diverge, so the trees cannot be identical.`, a, b); return false; }
        if (a.val !== b.val) { badA.push(a.id); badB.push(b.id); snap(5, `Both positions have nodes, but node from p has value ${a.val} while the node from q has value ${b.val} — the values differ, so the trees are not identical.`, a, b); return false; }
        okA.push(a.id); okB.push(b.id); snap(6, `Nodes match: both have value ${a.val}. Now recursively check both the left subtrees and the right subtrees — if those match, then these two nodes and all their descendants match.`, a, b);
        return same(a.left, b.left) && same(a.right, b.right);
      }
      const ans = same(A.root, B.root);
      snap(6, ans ? 'Both trees are structurally identical with matching values at every node. Every subtree matched, including empty subtrees.' : 'A structural or value mismatch was found, so the trees are not identical.', null, null, { done: ans ? 'ok' : 'bad', result: ans ? '✓ true' : '✗ false' });
      return F;
    },
    render: (f) => renderDual(f, n => n.id === f.activeA ? 'active' : f.okA.includes(n.id) ? 'ok' : f.badA.includes(n.id) ? 'bad' : '', n => n.id === f.activeB ? 'active' : f.okB.includes(n.id) ? 'ok' : f.badB.includes(n.id) ? 'bad' : '')
  };

  CONFIGS.subtree_of_another_tree = Object.assign({}, CONFIGS.same_tree, {
    key: 'subtree_of_another_tree', title: 'Subtree of Another Tree', lc: '572',
    chips: ['Try Each Root', '⏱ O(mn) worst', '💾 O(h) stack'],
    problem: 'Return true if one tree appears as a subtree inside another tree.',
    intuition: 'Every node in the main tree is an audition. When its value matches the candidate root, run the Same Tree check from there.',
    inputs: [
      { id: 'in-tree', label: 'root — level-order', value: '3,4,5,1,2' },
      { id: 'in-tree-b', label: 'subRoot — level-order', value: '4,1,2' }
    ],
    presets: [
      { label: 'is subtree', values: { 'in-tree': '3,4,5,1,2', 'in-tree-b': '4,1,2' } },
      { label: 'extra child', values: { 'in-tree': '3,4,5,1,2,null,null,null,null,0', 'in-tree-b': '4,1,2' } },
      { label: 'leaf match', values: { 'in-tree': '1,2,3', 'in-tree-b': '3' } }
    ],
    code: `class Solution {
    public boolean isSubtree(TreeNode root, TreeNode subRoot) {
        if (root == null) return false;
        if (same(root, subRoot)) return true;
        return isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
    }
    private boolean same(TreeNode a, TreeNode b) {
        if (a == null && b == null) return true;
        if (a == null || b == null || a.val != b.val) return false;
        return same(a.left, b.left) && same(a.right, b.right);
    }
}`,
    build: function () {
      const A = treeData(parseTreeInput('in-tree'));
      const B = treeData(parseTreeInput('in-tree-b'));
      const F = [], okA = [], okB = [], badA = [];
      const snap = (line, msg, a, b, extra) => {
        const ca = cloneLayout(A.root), cb = cloneLayout(B.root);
        F.push(Object.assign({ line, msg, root: ca.root, nodes: ca.nodes, root2: cb.root, nodes2: cb.nodes, activeA: a ? a.id : null, activeB: b ? b.id : null, okA: okA.slice(), okB: okB.slice(), badA: badA.slice(), metricA: okA.length, metricB: 'matched' }, extra || {}));
      };
      function same(a, b) {
        if (!a && !b) return true;
        if (!a || !b || a.val !== b.val) return false;
        okA.push(a.id); okB.push(b.id); snap(8, `Both nodes have value ${a.val} — they match. Now recursively check if all descendants match: the left subtree of the main tree must match the left subtree of the subroot, and the right must match the right. If all descendants match, then the structure rooted at ${a.val} is identical to the entire subRoot.`, a, b);
        return same(a.left, b.left) && same(a.right, b.right);
      }
      function search(n) {
        if (!n) return false;
        snap(3, `Inspect node ${n.val} in the main tree — is this node a possible root of the subRoot? Use the "same tree" check to compare the subtree starting at ${n.val} with the entire subRoot.`, n, B.root);
        const beforeA = okA.length, beforeB = okB.length;
        if (same(n, B.root)) { snap(4, `Node ${n.val} and its subtree match the entire subRoot perfectly — all node values and the entire structure are identical. The subRoot exists as a subtree in the main tree.`, n, B.root, { done: 'ok', result: '✓ true' }); return true; }
        okA.splice(beforeA); okB.splice(beforeB); badA.push(n.id);
        snap(5, `The subtree rooted at ${n.val} does not match the subRoot — either a structure diverges or a value differs. Try other nodes in the main tree: search the left and right children of ${n.val}.`, n, B.root);
        return search(n.left) || search(n.right);
      }
      const ans = search(A.root);
      if (!ans) snap(5, 'Every node in the main tree was tested as a potential subtree root, but none of them matched the subRoot. The subRoot does not appear as a subtree anywhere in the main tree.', null, null, { done: 'bad', result: '✗ false' });
      return F;
    }
  });

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
    if (!cfg) throw new Error(`Unknown tree problem: ${key}`);
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
