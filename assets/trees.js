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
        if (!n) { snap(7, 'Null child contributes height 0.', null); return 0; }
        snap(8, `Visit node ${n.val}; measure left and right heights.`, n.id);
        const left = height(n.left), right = height(n.right);
        best = Math.max(best, left + right);
        labels[n.id] = `h${1 + Math.max(left, right)}`;
        okIds.push(n.id);
        snap([10, 11], `Node ${n.val}: left ${left} + right ${right} gives candidate diameter ${left + right}. Best is ${best}.`, n.id);
        return 1 + Math.max(left, right);
      }
      height(root);
      snap(4, `Return diameter ${best}.`, null, { done: 'ok', result: `✓ diameter = ${best}` });
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
        snap(6, `Check node ${n.val}.`, n.id);
        const l = height(n.left), r = height(n.right);
        if (l === -1 || r === -1 || Math.abs(l - r) > 1) { badIds.push(n.id); labels[n.id] = 'bad'; snap(9, `Node ${n.val} is imbalanced: left ${l}, right ${r}.`, n.id); return -1; }
        labels[n.id] = `h${1 + Math.max(l, r)}`; okIds.push(n.id); snap(10, `Node ${n.val} is balanced with height ${labels[n.id]}.`, n.id);
        return 1 + Math.max(l, r);
      }
      const ok = height(root) !== -1;
      snap(3, ok ? 'Every subtree is balanced.' : 'At least one subtree is imbalanced.', null, { done: ok ? 'ok' : 'bad', result: ok ? '✓ balanced' : '✗ not balanced' });
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
        snap(7, `Start a level with ${size} node${size === 1 ? '' : 's'}.`, q[0].id);
        for (let i = 0; i < size; i++) {
          const n = q.shift();
          snap(9, `Visit node ${n.val}.`, n.id);
          if (i === size - 1) { items.push(n.val); okIds.push(n.id); snap(10, `${n.val} is the rightmost node on this level.`, n.id); }
          if (n.left) q.push(n.left);
          if (n.right) q.push(n.right);
        }
      }
      snap(15, `Return right side view ${arr(items)}.`, null, { done: 'ok', result: `✓ ${arr(items)}` });
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
        snap(6, `Path max is ${max === -Infinity ? '-∞' : max}; inspect ${n.val}.`, n.id);
        if (n.val >= max) { count++; okIds.push(n.id); snap(7, `${n.val} is visible from the root, so it is good.`, n.id); }
        dfs(n.left, Math.max(max, n.val));
        dfs(n.right, Math.max(max, n.val));
      }
      dfs(root, -Infinity);
      snap(3, `Return ${count} good node${count === 1 ? '' : 's'}.`, null, { done: 'ok', result: `✓ ${count} good nodes` });
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
          snap(4, `Stand at ${cur.val}. Compare both targets with this split point.`, cur.id);
          if (p < cur.val && q < cur.val) { snap(5, `${p} and ${q} are both left of ${cur.val}.`, cur.id); cur = cur.left; }
          else if (p > cur.val && q > cur.val) { snap(6, `${p} and ${q} are both right of ${cur.val}.`, cur.id); cur = cur.right; }
          else { okIds.push(cur.id); snap(7, `${cur.val} is where the paths split, so it is the lowest common ancestor.`, cur.id, { done: 'ok', result: `✓ LCA = ${cur.val}` }); break; }
        }
        if (!cur) snap(10, 'Targets were not both reachable in this BST.', null, { done: 'bad', result: 'not found' });
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
          snap(8, `From ${n.val}, go left before counting this node.`, n.id);
          inorder(n.left);
          if (answer !== null) return;
          items.push(n.val); okIds.push(n.id);
          snap(10, `Inorder visits ${n.val}; sorted position is ${items.length}.`, n.id);
          if (items.length === k) { answer = n.val; snap(10, `${n.val} is the ${k}${k === 1 ? 'st' : k === 2 ? 'nd' : k === 3 ? 'rd' : 'th'} smallest value.`, n.id, { done: 'ok', result: `✓ ${answer}` }); return; }
          inorder(n.right);
        }
        inorder(root);
        if (answer === null) snap(5, `The tree has fewer than ${k} nodes.`, null, { done: 'bad', result: 'k too large' });
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
    'Find the maximum path sum where a path can start and end at any nodes.',
    'Each node may join its best left gain and best right gain into a full path, but it can only return one side upward.',
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
        snap(8, `Enter ${n.val}; negative child gains will be ignored.`, n.id);
        const left = Math.max(0, gain(n.left));
        const right = Math.max(0, gain(n.right));
        const full = n.val + left + right;
        best = Math.max(best, full);
        const up = n.val + Math.max(left, right);
        labels[n.id] = `↑${up}`; okIds.push(n.id);
        snap(10, `${n.val} can make full path ${n.val} + ${left} + ${right} = ${full}. Best is ${best}.`, n.id);
        return up;
      }
      gain(root);
      snap(4, `Return maximum path sum ${best}.`, null, { done: 'ok', result: `✓ max path = ${best}` });
      return F;
    }
  );

  CONFIGS.serialize_deserialize_binary_tree = basicTreeConfig(
    'serialize_deserialize_binary_tree', 'Serialize and Deserialize Binary Tree', '297', 'Hard',
    ['Preorder with Nulls', '⏱ O(n) time', '💾 O(n) data'],
    'Encode a binary tree into a string and decode it back to the same structure.',
    'Write each node in preorder and keep explicit null markers. Those markers are the missing branches needed to rebuild the exact shape.',
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
        if (!n) { items.push('#'); snap(8, 'Write # for a missing child so the shape can be rebuilt.', null); return; }
        items.push(n.val); okIds.push(n.id); snap(9, `Write ${n.val}, then serialize left and right children.`, n.id);
        dfs(n.left); dfs(n.right);
      }
      dfs(root);
      snap(4, `Serialized stream is ${items.join(',')}.`, null, { done: 'ok', result: `✓ ${items.join(',')}` });
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
          if (left > right) { snap(9, `No inorder values in [${left}, ${right}], so this child is null.`, null); return null; }
          const val = preorder[pre++], node = { id: nextId++, val, left: null, right: null };
          if (!root) root = node;
          items.push(`root ${val}`);
          snap(10, `Preorder gives ${val} as the next root.`, node.id);
          const mid = idx.get(val);
          snap(11, `${val} splits inorder at index ${mid}: left [${left}, ${mid - 1}], right [${mid + 1}, ${right}].`, node.id);
          node.left = build(left, mid - 1);
          node.right = build(mid + 1, right);
          return node;
        }
        root = build(0, inorder.length - 1);
        snap(5, 'All preorder roots consumed; reconstructed tree is complete.', null, { done: 'ok', result: '✓ tree built' });
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
        snap(2, `Compare ${a ? a.val : 'null'} with ${b ? b.val : 'null'}.`, a, b);
        if (!a && !b) return true;
        if (!a || !b) { if (a) badA.push(a.id); if (b) badB.push(b.id); snap(4, 'One side is missing, so the structure differs.', a, b); return false; }
        if (a.val !== b.val) { badA.push(a.id); badB.push(b.id); snap(5, `${a.val} does not equal ${b.val}.`, a, b); return false; }
        okA.push(a.id); okB.push(b.id); snap(6, `${a.val} matches. Recurse into both children.`, a, b);
        return same(a.left, b.left) && same(a.right, b.right);
      }
      const ans = same(A.root, B.root);
      snap(6, ans ? 'Both trees matched all the way down.' : 'A mismatch stops the comparison.', null, null, { done: ans ? 'ok' : 'bad', result: ans ? '✓ true' : '✗ false' });
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
        okA.push(a.id); okB.push(b.id); snap(8, `Pair ${a.val} with ${b.val}; children must also match.`, a, b);
        return same(a.left, b.left) && same(a.right, b.right);
      }
      function search(n) {
        if (!n) return false;
        snap(3, `Try node ${n.val} as the possible subtree root.`, n, B.root);
        const beforeA = okA.length, beforeB = okB.length;
        if (same(n, B.root)) { snap(4, `${n.val} anchors a complete match.`, n, B.root, { done: 'ok', result: '✓ true' }); return true; }
        okA.splice(beforeA); okB.splice(beforeB); badA.push(n.id);
        snap(5, `${n.val} failed; keep searching lower in the main tree.`, n, B.root);
        return search(n.left) || search(n.right);
      }
      const ans = search(A.root);
      if (!ans) snap(5, 'No node in root matched subRoot exactly.', null, null, { done: 'bad', result: '✗ false' });
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
