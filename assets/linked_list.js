window.LinkedListPage = (function () {
  'use strict';

  const esc = (s) => Viz.escapeHtml(String(s));
  const nums = id => document.getElementById(id).value.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n));
  const toks = id => document.getElementById(id).value.split(',').map(s => s.trim()).filter(Boolean);
  const arr = a => `[${a.join(', ')}]`;

  function htmlList(items) {
    return items && items.length ? items.map(x => `<span class="solution-chip">${esc(x)}</span>`).join('') : '<span style="color:var(--text-3);font-size:.8rem;">empty</span>';
  }

  function renderListSvg(mount, nodes, opts) {
    opts = opts || {};
    const gap = 86, y = 72, r = 23, w = Math.max(260, nodes.length * gap + 80), h = opts.cycleTo != null || opts.random ? 170 : 130;
    const x = i => 44 + i * gap;
    let svg = '';
    for (let i = 0; i < nodes.length - 1; i++) {
      svg += `<path class="ll-arrow" d="M${x(i) + r} ${y} L${x(i + 1) - r - 8} ${y}"/>`;
      svg += `<path class="ll-head" d="M${x(i + 1) - r - 8} ${y} l-8 -5 v10 z"/>`;
    }
    if (opts.cycleTo != null && nodes.length) {
      const from = nodes.length - 1, to = opts.cycleTo;
      svg += `<path class="ll-random" d="M${x(from)} ${y + r + 8} C${x(from)} 155 ${x(to)} 155 ${x(to)} ${y + r + 8}"/>`;
      svg += `<text class="tree-sub" x="${(x(from) + x(to)) / 2}" y="164">cycle</text>`;
    }
    if (opts.random) {
      opts.random.forEach(([i, j]) => {
        if (j == null || i >= nodes.length || j >= nodes.length) return;
        svg += `<path class="ll-random" d="M${x(i)} ${y - r - 7} C${x(i)} 12 ${x(j)} 12 ${x(j)} ${y - r - 7}"/>`;
      });
    }
    nodes.forEach((n, i) => {
      const cls = i === opts.active ? 'active' : (opts.ok || []).includes(i) ? 'ok' : (opts.bad || []).includes(i) ? 'bad' : (opts.warn || []).includes(i) ? 'warn' : '';
      svg += `<g class="ll-node ${cls}"><circle cx="${x(i)}" cy="${y}" r="${r}"></circle><text x="${x(i)}" y="${y}">${esc(n)}</text></g>`;
      if (opts.labels && opts.labels[i]) svg += `<text class="tree-sub" x="${x(i)}" y="${y + r + 17}">${esc(opts.labels[i])}</text>`;
    });
    mount.innerHTML = `<svg class="ll-svg" viewBox="0 0 ${w} ${h}">${svg}</svg>`;
  }

  function render(f) {
    renderListSvg(document.getElementById('stage-main'), f.values || [], f);
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

  CONFIGS.reverse_linked_list = base('reverse_linked_list', 'Reverse Linked List', '206', 'Easy',
    ['Pointer Flip', '⏱ O(n) time', '💾 O(1) space'],
    'Reverse a singly linked list and return the new head.',
    'Each node turns its next pointer backward. Save next before flipping so the rest of the list is not lost.',
    [{ id: 'in-list', label: 'list', value: '1,2,3,4,5' }],
    [{ label: 'five', values: { 'in-list': '1,2,3,4,5' } }, { label: 'pair', values: { 'in-list': '1,2' } }, { label: 'mixed', values: { 'in-list': '4,9,1,7' } }],
    `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null, curr = head;
        while (curr != null) {
            ListNode next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }
}`,
    function () {
      const original = nums('in-list'), F = [], done = [];
      let remaining = original.slice(), rev = [];
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, values: rev.concat(remaining), active: rev.length, ok: [...Array(rev.length).keys()], labels: Object.fromEntries(rev.map((_, i) => [i, 'reversed'])), metricA: arr(rev), metricB: 'prev' }, extra || {}));
      snap(3, 'Start with prev=null and curr at the head.');
      while (remaining.length) {
        snap(5, `Save next before changing node ${remaining[0]}.`);
        rev.unshift(remaining.shift());
        done.push(rev[0]);
        snap(6, `Flip ${rev[0]} so it points back into the reversed prefix.`);
      }
      snap(10, `Return new head ${rev[0] ?? 'null'}.`, { done: 'ok', result: `✓ ${arr(rev)}` });
      return F;
    });

  CONFIGS.merge_two_sorted_lists = base('merge_two_sorted_lists', 'Merge Two Sorted Lists', '21', 'Easy',
    ['Dummy Tail', '⏱ O(n+m) time', '💾 O(1) links'],
    'Merge two sorted linked lists into one sorted list.',
    'A dummy node owns the output. The tail always takes the smaller front node from either list.',
    [{ id: 'in-a', label: 'list1', value: '1,2,4' }, { id: 'in-b', label: 'list2', value: '1,3,4' }],
    [{ label: 'classic', values: { 'in-a': '1,2,4', 'in-b': '1,3,4' } }, { label: 'uneven', values: { 'in-a': '1,5,9', 'in-b': '2,3,4,10' } }, { label: 'empty one', values: { 'in-a': '', 'in-b': '0' } }],
    `class Solution {
    public ListNode mergeTwoLists(ListNode a, ListNode b) {
        ListNode dummy = new ListNode(0), tail = dummy;
        while (a != null && b != null) {
            if (a.val <= b.val) { tail.next = a; a = a.next; }
            else { tail.next = b; b = b.next; }
            tail = tail.next;
        }
        tail.next = a != null ? a : b;
        return dummy.next;
    }
}`,
    function () {
      let a = nums('in-a'), b = nums('in-b'), out = [], F = [];
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, values: out.concat(a).concat(b), active: out.length, ok: [...Array(out.length).keys()], items: [`a ${arr(a)}`, `b ${arr(b)}`], metricA: arr(out), metricB: 'merged' }, extra || {}));
      while (a.length && b.length) {
        snap(4, `Compare ${a[0]} and ${b[0]}.`);
        out.push(a[0] <= b[0] ? a.shift() : b.shift());
        snap(7, `Attach ${out[out.length - 1]} to tail.`);
      }
      out = out.concat(a, b); snap(9, 'Attach the non-empty remainder.', { done: 'ok', result: `✓ ${arr(out)}` });
      return F;
    });

  CONFIGS.reorder_list = base('reorder_list', 'Reorder List', '143', 'Medium',
    ['Middle + Reverse + Weave', '⏱ O(n) time', '💾 O(1) links'],
    'Reorder L0→L1→...→Ln into L0→Ln→L1→Ln-1...',
    'Split at the middle, reverse the second half, then weave one node from each half.',
    [{ id: 'in-list', label: 'list', value: '1,2,3,4,5' }],
    [{ label: 'odd', values: { 'in-list': '1,2,3,4,5' } }, { label: 'even', values: { 'in-list': '1,2,3,4' } }, { label: 'six', values: { 'in-list': '1,2,3,4,5,6' } }],
    `class Solution {
    public void reorderList(ListNode head) {
        ListNode slow = head, fast = head.next;
        while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
        ListNode second = reverse(slow.next);
        slow.next = null;
        ListNode first = head;
        while (second != null) {
            ListNode t1 = first.next, t2 = second.next;
            first.next = second; second.next = t1;
            first = t1; second = t2;
        }
    }
}`,
    function () {
      const a = nums('in-list'), F = [], mid = Math.ceil(a.length / 2), first = a.slice(0, mid), second = a.slice(mid).reverse(), out = [];
      F.push({ line: 4, msg: `Slow/fast finds the split after ${first[first.length - 1]}.`, values: a, active: mid - 1, metricA: mid, metricB: 'split' });
      F.push({ line: 5, msg: `Reverse second half into ${arr(second)}.`, values: first.concat(second), active: first.length, warn: second.map((_, i) => first.length + i), items: [`first ${arr(first)}`, `second ${arr(second)}`], metricA: arr(second), metricB: 'second' });
      while (first.length || second.length) {
        if (first.length) out.push(first.shift());
        if (second.length) out.push(second.shift());
        F.push({ line: 11, msg: `Weave next pair. Output is ${arr(out)}.`, values: out.concat(first, second), ok: out.map((_, i) => i), items: [`out ${arr(out)}`], metricA: out.length, metricB: 'woven' });
      }
      F.push({ line: 14, msg: 'Reorder complete.', values: out, ok: out.map((_, i) => i), done: 'ok', result: `✓ ${arr(out)}` });
      return F;
    });

  CONFIGS.remove_nth_node_from_end = base('remove_nth_node_from_end', 'Remove Nth Node From End', '19', 'Medium',
    ['Fast Gap', '⏱ O(n) time', '💾 O(1) space'],
    'Remove the nth node from the end of the list.',
    'Move fast n steps ahead. Then fast and slow walk together until fast reaches the tail; slow sits before the node to remove.',
    [{ id: 'in-list', label: 'list', value: '1,2,3,4,5' }, { id: 'in-n', label: 'n', value: '2' }],
    [{ label: 'remove 4', values: { 'in-list': '1,2,3,4,5', 'in-n': '2' } }, { label: 'head', values: { 'in-list': '1,2', 'in-n': '2' } }, { label: 'tail', values: { 'in-list': '1,2,3', 'in-n': '1' } }],
    `class Solution {
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0, head);
        ListNode slow = dummy, fast = dummy;
        for (int i = 0; i < n; i++) fast = fast.next;
        while (fast.next != null) { slow = slow.next; fast = fast.next; }
        slow.next = slow.next.next;
        return dummy.next;
    }
}`,
    function () {
      const a = nums('in-list'), n = parseInt(document.getElementById('in-n').value, 10), F = [];
      const remove = a.length - n;
      F.push({ line: 5, msg: `Advance fast ${n} step(s), creating a fixed gap.`, values: a, active: Math.min(n - 1, a.length - 1), labels: { [Math.min(n - 1, a.length - 1)]: 'fast' }, metricA: n, metricB: 'gap' });
      F.push({ line: 6, msg: `Walk together. Slow lands before index ${remove}.`, values: a, active: Math.max(0, remove - 1), warn: [remove], labels: { [remove]: 'remove' }, metricA: remove, metricB: 'target index' });
      const out = a.filter((_, i) => i !== remove);
      F.push({ line: 7, msg: `Skip node ${a[remove]}.`, values: out, ok: out.map((_, i) => i), done: 'ok', result: `✓ ${arr(out)}` });
      return F;
    });

  CONFIGS.copy_list_with_random_pointer = base('copy_list_with_random_pointer', 'Copy List with Random Pointer', '138', 'Medium',
    ['Hash Map Clones', '⏱ O(n) time', '💾 O(n) map'],
    'Deep-copy a list where each node has next and random pointers.',
    'First clone every node into a map. Then wire each clone using the original node’s next and random references.',
    [{ id: 'in-list', label: 'values', value: '7,13,11,10,1' }, { id: 'in-random', label: 'random indices (-1 for null)', value: '-1,0,4,2,0' }],
    [{ label: 'classic', values: { 'in-list': '7,13,11,10,1', 'in-random': '-1,0,4,2,0' } }, { label: 'pair', values: { 'in-list': '1,2', 'in-random': '1,1' } }, { label: 'none', values: { 'in-list': '3,3,3', 'in-random': '-1,-1,-1' } }],
    `class Solution {
    public Node copyRandomList(Node head) {
        Map<Node, Node> map = new HashMap<>();
        for (Node cur = head; cur != null; cur = cur.next) map.put(cur, new Node(cur.val));
        for (Node cur = head; cur != null; cur = cur.next) {
            map.get(cur).next = map.get(cur.next);
            map.get(cur).random = map.get(cur.random);
        }
        return map.get(head);
    }
}`,
    function () {
      const a = nums('in-list'), r = nums('in-random'), F = [], made = [];
      for (let i = 0; i < a.length; i++) { made.push(i); F.push({ line: 4, msg: `Clone node ${a[i]} and store original→copy in the map.`, values: a, active: i, ok: made.slice(), random: r.map((x, j) => [j, x < 0 ? null : x]), items: made.map(j => `${j}→copy`), metricA: made.length, metricB: 'clones' }); }
      F.push({ line: 7, msg: 'Wire next and random pointers on the cloned nodes.', values: a, ok: a.map((_, i) => i), random: r.map((x, j) => [j, x < 0 ? null : x]), done: 'ok', result: '✓ deep copy built' });
      return F;
    });

  CONFIGS.add_two_numbers = base('add_two_numbers', 'Add Two Numbers', '2', 'Medium',
    ['Digit Carry', '⏱ O(n+m) time', '💾 O(1) carry'],
    'Add two numbers stored in reverse-order linked lists.',
    'Walk both lists digit by digit. The carry becomes the little ember passed to the next column.',
    [{ id: 'in-a', label: 'l1', value: '2,4,3' }, { id: 'in-b', label: 'l2', value: '5,6,4' }],
    [{ label: '342+465', values: { 'in-a': '2,4,3', 'in-b': '5,6,4' } }, { label: 'carry chain', values: { 'in-a': '9,9,9,9', 'in-b': '9,9' } }, { label: 'zero', values: { 'in-a': '0', 'in-b': '0' } }],
    `class Solution {
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        int carry = 0;
        ListNode dummy = new ListNode(0), tail = dummy;
        while (l1 != null || l2 != null || carry != 0) {
            int sum = carry + val(l1) + val(l2);
            tail.next = new ListNode(sum % 10);
            carry = sum / 10;
            tail = tail.next;
        }
        return dummy.next;
    }
}`,
    function () {
      let a = nums('in-a'), b = nums('in-b'), out = [], carry = 0, F = [], i = 0;
      while (i < a.length || i < b.length || carry) {
        const sum = carry + (a[i] || 0) + (b[i] || 0);
        out.push(sum % 10); carry = Math.floor(sum / 10);
        F.push({ line: 6, msg: `Column ${i}: ${a[i] || 0} + ${b[i] || 0} plus carry gives ${sum}. Write ${sum % 10}, carry ${carry}.`, values: out.concat(a.slice(i + 1), b.slice(i + 1)), active: out.length - 1, ok: out.map((_, j) => j), items: [`out ${arr(out)}`], metricA: carry, metricB: 'carry' });
        i++;
      }
      F.push({ line: 11, msg: 'Return the sum list.', values: out, ok: out.map((_, i) => i), done: 'ok', result: `✓ ${arr(out)}` });
      return F;
    });

  CONFIGS.linked_list_cycle = base('linked_list_cycle', 'Linked List Cycle', '141', 'Easy',
    ['Slow/Fast Pointers', '⏱ O(n) time', '💾 O(1) space'],
    'Return true if the linked list contains a cycle.',
    'Slow moves one step and fast moves two. If there is a loop, fast eventually laps slow.',
    [{ id: 'in-list', label: 'list', value: '3,2,0,-4' }, { id: 'in-pos', label: 'cycle position (-1 none)', value: '1' }],
    [{ label: 'cycle', values: { 'in-list': '3,2,0,-4', 'in-pos': '1' } }, { label: 'none', values: { 'in-list': '1,2,3,4', 'in-pos': '-1' } }, { label: 'self', values: { 'in-list': '1', 'in-pos': '0' } }],
    `class Solution {
    public boolean hasCycle(ListNode head) {
        ListNode slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }
}`,
    function () {
      const a = nums('in-list'), pos = parseInt(document.getElementById('in-pos').value, 10), F = [];
      let slow = 0, fast = 0;
      for (let step = 0; step < Math.max(1, a.length * 2); step++) {
        F.push({ line: 4, msg: `slow at ${slow}, fast at ${fast}.`, values: a, active: slow, warn: [fast], cycleTo: pos >= 0 ? pos : null, labels: { [slow]: 'slow', [fast]: 'fast' }, metricA: step, metricB: 'steps' });
        slow = nextIndex(slow, a.length, pos); fast = nextIndex(nextIndex(fast, a.length, pos), a.length, pos);
        if (slow == null || fast == null) { F.push({ line: 9, msg: 'Fast reached null, so no cycle exists.', values: a, done: 'bad', result: '✗ false' }); return F; }
        if (slow === fast) { F.push({ line: 7, msg: `Pointers meet at index ${slow}.`, values: a, active: slow, cycleTo: pos, done: 'ok', result: '✓ true' }); return F; }
      }
      return F;
    });

  function nextIndex(i, n, pos) { if (i == null) return null; if (i + 1 < n) return i + 1; return pos >= 0 ? pos : null; }

  CONFIGS.find_duplicate_number = base('find_duplicate_number', 'Find the Duplicate Number', '287', 'Medium',
    ['Array as Linked List', '⏱ O(n) time', '💾 O(1) space'],
    'Find the repeated number without modifying the array.',
    'Treat each value as a next pointer. The duplicate is the entrance to the cycle.',
    [{ id: 'in-list', label: 'nums', value: '1,3,4,2,2' }],
    [{ label: 'dup 2', values: { 'in-list': '1,3,4,2,2' } }, { label: 'dup 3', values: { 'in-list': '3,1,3,4,2' } }, { label: 'small', values: { 'in-list': '1,1' } }],
    `class Solution {
    public int findDuplicate(int[] nums) {
        int slow = nums[0], fast = nums[0];
        do { slow = nums[slow]; fast = nums[nums[fast]]; } while (slow != fast);
        slow = nums[0];
        while (slow != fast) { slow = nums[slow]; fast = nums[fast]; }
        return slow;
    }
}`,
    function () {
      const a = nums('in-list'), F = [];
      let slow = a[0], fast = a[0], guard = 0;
      do { F.push({ line: 4, msg: `slow=${slow}, fast=${fast}; follow values as next pointers.`, values: a, active: slow, warn: [fast], labels: { [slow]: 'slow', [fast]: 'fast' }, metricA: slow, metricB: fast }); slow = a[slow]; fast = a[a[fast]]; } while (slow !== fast && ++guard < 20);
      F.push({ line: 4, msg: `Pointers meet inside the cycle at ${slow}.`, values: a, active: slow, metricA: slow, metricB: 'meet' });
      slow = a[0];
      while (slow !== fast) { F.push({ line: 6, msg: `Move both one step: slow=${slow}, fast=${fast}.`, values: a, active: slow, warn: [fast], metricA: slow, metricB: fast }); slow = a[slow]; fast = a[fast]; }
      F.push({ line: 7, msg: `${slow} is the cycle entrance and duplicate value.`, values: a, active: slow, done: 'ok', result: `✓ duplicate = ${slow}` });
      return F;
    });

  CONFIGS.lru_cache = base('lru_cache', 'LRU Cache', '146', 'Medium',
    ['Map + Doubly Linked List', '⏱ O(1) ops', '💾 O(capacity)'],
    'Design an LRU cache with O(1) get and put. Evict the least recently used key when capacity is exceeded.',
    'A HashMap gives O(1) lookup by key, but by itself it can’t tell you usage order. A doubly linked list fixes that: keep the most-recently-used node right after a dummy head, and the least-recently-used node right before a dummy tail. Every touch — a get or a put — unlinks the node from wherever it sits and relinks it at the front. Both unlink and relink are O(1) because each node holds direct prev/next pointers, no scanning required. When the map grows past capacity, the node just before the tail sentinel is, by construction, the LRU one — evict it in O(1) too.',
    [{ id: 'in-cap', label: 'capacity', value: '2' }, { id: 'in-ops', label: 'operations', value: 'put 1 1,put 2 2,get 1,put 3 3,get 2,put 4 4,get 1,get 3,get 4' }],
    [{ label: 'classic', values: { 'in-cap': '2', 'in-ops': 'put 1 1,put 2 2,get 1,put 3 3,get 2,put 4 4,get 1,get 3,get 4' } }, { label: 'capacity 3', values: { 'in-cap': '3', 'in-ops': 'put 1 1,put 2 2,put 3 3,get 1,put 4 4' } }],
    `class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int key, int val) { this.key = key; this.val = val; }
    }

    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);
    private final Node tail = new Node(0, 0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        insertFront(node);
        return node.val;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        }
        Node node = new Node(key, value);
        map.put(key, node);
        insertFront(node);

        if (map.size() > capacity) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void insertFront(Node node) {
        node.next = head.next;
        node.prev = head;
        head.next.prev = node;
        head.next = node;
    }
}`,
    function () {
      const cap = parseInt(document.getElementById('in-cap').value, 10), ops = toks('in-ops'), order = [], map = new Map(), F = [];
      const front = k => { const i = order.indexOf(k); if (i >= 0) order.splice(i, 1); order.unshift(k); };
      const snap = (line, msg, i, extra) => F.push(Object.assign({ line, msg, values: order.map(k => `${k}:${map.get(k)}`), active: 0, items: [`op ${ops[i] || 'done'}`, `keys ${arr([...map.keys()])}`], metricA: `${order.length}/${cap}`, metricB: 'size' }, extra || {}));
      ops.forEach((op, i) => {
        const [name, kRaw, vRaw] = op.split(/\s+/); const k = parseInt(kRaw, 10);
        if (name === 'get') {
          if (map.has(k)) {
            snap(21, `get(${k}) hits. Unlink node ${k} from its current spot…`, i);
            front(k);
            snap([23, 24], `…and relink it right after head — it's now the most-recently-used. Return ${map.get(k)}.`, i, { done: false });
          } else {
            snap(20, `get(${k}) misses — not in the map. Return -1 without touching the list.`, i);
          }
        } else {
          if (map.has(k)) {
            snap([28, 29], `put(${k}, ${vRaw}) updates an existing key — unlink its old node first.`, i);
          }
          map.set(k, parseInt(vRaw, 10));
          front(k);
          snap([31, 32, 33], `Insert ${k} right after head — it's the new most-recently-used.`, i);
          if (order.length > cap) {
            const ev = order.pop(); map.delete(ev);
            snap([35, 36, 37, 38], `Capacity exceeded — tail.prev is key ${ev}, the LRU. Unlink and remove it from the map.`, i);
          }
        }
      });
      snap(53, 'Cache operations complete — head→…→tail always stays MRU→…→LRU order.', ops.length, { done: 'ok', result: '✓ cache simulated' });
      return F;
    });

  CONFIGS.merge_k_sorted_lists = base('merge_k_sorted_lists', 'Merge k Sorted Lists', '23', 'Hard',
    ['Min Heap Fronts', '⏱ O(n log k)', '💾 O(k) heap'],
    'Merge k sorted linked lists into one sorted linked list.',
    'Keep each list’s front node in a min heap. Pop the smallest front, then push its successor.',
    [{ id: 'in-lists', label: 'lists separated by |', value: '1,4,5|1,3,4|2,6' }],
    [{ label: 'classic', values: { 'in-lists': '1,4,5|1,3,4|2,6' } }, { label: 'two', values: { 'in-lists': '2,8|1,3,9' } }, { label: 'empty-ish', values: { 'in-lists': '|1|0,2' } }],
    `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a,b) -> a.val - b.val);
        for (ListNode node : lists) if (node != null) pq.offer(node);
        ListNode dummy = new ListNode(0), tail = dummy;
        while (!pq.isEmpty()) {
            ListNode node = pq.poll();
            tail.next = node; tail = tail.next;
            if (node.next != null) pq.offer(node.next);
        }
        return dummy.next;
    }
}`,
    function () {
      const lists = document.getElementById('in-lists').value.split('|').map(x => x.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !Number.isNaN(n))), heap = [], out = [], F = [];
      lists.forEach((l, i) => { if (l.length) heap.push({ v: l.shift(), i }); });
      const snap = (line, msg, extra) => F.push(Object.assign({ line, msg, values: out.concat(heap.map(h => h.v)), ok: out.map((_, i) => i), items: [`heap ${arr(heap.map(h => h.v).sort((a,b)=>a-b))}`, `out ${arr(out)}`], metricA: out.length, metricB: 'merged' }, extra || {}));
      snap(4, 'Seed heap with each non-empty list head.');
      while (heap.length) {
        heap.sort((a, b) => a.v - b.v); const h = heap.shift(); out.push(h.v); snap(7, `Pop smallest head ${h.v}.`);
        if (lists[h.i].length) { heap.push({ v: lists[h.i].shift(), i: h.i }); snap(9, `Push the successor from list ${h.i}.`); }
      }
      snap(11, `Return ${arr(out)}.`, { done: 'ok', result: `✓ ${arr(out)}` });
      return F;
    });

  CONFIGS.reverse_nodes_k_group = base('reverse_nodes_k_group', 'Reverse Nodes in k-Group', '25', 'Hard',
    ['Chunk Reversal', '⏱ O(n) time', '💾 O(1) links'],
    'Reverse nodes in groups of k, leaving a final short group unchanged.',
    'Each complete block of k nodes is reversed locally, then stitched back to the previous tail.',
    [{ id: 'in-list', label: 'list', value: '1,2,3,4,5' }, { id: 'in-k', label: 'k', value: '2' }],
    [{ label: 'k=2', values: { 'in-list': '1,2,3,4,5', 'in-k': '2' } }, { label: 'k=3', values: { 'in-list': '1,2,3,4,5', 'in-k': '3' } }, { label: 'six k=3', values: { 'in-list': '1,2,3,4,5,6', 'in-k': '3' } }],
    `class Solution {
    public ListNode reverseKGroup(ListNode head, int k) {
        ListNode dummy = new ListNode(0, head), groupPrev = dummy;
        while (true) {
            ListNode kth = getKth(groupPrev, k);
            if (kth == null) break;
            ListNode groupNext = kth.next;
            reverseGroup(groupPrev.next, kth);
            stitch(groupPrev, kth, groupNext);
            groupPrev = oldGroupHead;
        }
        return dummy.next;
    }
}`,
    function () {
      const a = nums('in-list'), k = parseInt(document.getElementById('in-k').value, 10), out = [], F = [];
      for (let i = 0; i < a.length; i += k) {
        const group = a.slice(i, i + k);
        if (group.length === k) { F.push({ line: 5, msg: `Found complete group ${arr(group)}.`, values: out.concat(group, a.slice(i + k)), active: out.length, warn: group.map((_, j) => out.length + j), metricA: k, metricB: 'group' }); out.push(...group.reverse()); F.push({ line: 8, msg: `Reverse and stitch group as ${arr(out)}.`, values: out.concat(a.slice(i + k)), ok: out.map((_, j) => j), metricA: out.length, metricB: 'done' }); }
        else { out.push(...group); F.push({ line: 6, msg: `Final group ${arr(group)} is shorter than k, so leave it in order.`, values: out, ok: out.map((_, j) => j), metricA: out.length, metricB: 'done' }); }
      }
      F.push({ line: 12, msg: `Return ${arr(out)}.`, values: out, ok: out.map((_, i) => i), done: 'ok', result: `✓ ${arr(out)}` });
      return F;
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
    if (!cfg) throw new Error(`Unknown linked-list problem: ${key}`);
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
