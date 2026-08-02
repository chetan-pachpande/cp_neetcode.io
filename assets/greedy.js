window.GreedyPage = (function () {
  'use strict';

  const esc = s => Viz.escapeHtml(String(s));
  const value = id => document.getElementById(id).value;
  const nums = id => value(id).split(',').map(s => Number(s.trim())).filter(Number.isFinite);
  const words = id => value(id).split(',').map(s => s.trim()).filter(Boolean);
  const pairs = id => value(id).split('|').map(x => x.split(',').map(Number)).filter(x => x.length === 3 && x.every(Number.isFinite));
  const fmt = a => `[${a.join(', ')}]`;

  const CONFIGS = {};
  function config(key, title, lc, chips, problem, intuition, inputs, presets, code, build) {
    CONFIGS[key] = { key, title, lc, difficulty: 'Medium', chips, problem, intuition, inputs, presets, code, build };
  }

  function svg(tag, attrs, body) {
    const at = Object.entries(attrs || {}).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
    return `<${tag} ${at}>${body || ''}</${tag}>`;
  }
  function tile(x, y, w, h, label, cls, sub) {
    return `<g class="greedy-tile ${cls || ''}">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>
      <text x="${x + w / 2}" y="${y + h / 2 - (sub ? 5 : 0)}">${esc(label)}</text>
      ${sub ? `<text class="sub" x="${x + w / 2}" y="${y + h / 2 + 13}">${esc(sub)}</text>` : ''}
    </g>`;
  }
  function arrow(x1, y1, x2, y2, cls) {
    return `<path class="greedy-arrow ${cls || ''}" d="M${x1},${y1} C${x1 + (x2 - x1) * .35},${y1 - 18} ${x1 + (x2 - x1) * .65},${y2 - 18} ${x2},${y2}" marker-end="url(#g-arrow)"/>`;
  }
  const defs = `<defs><marker id="g-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs>`;

  function renderLinear(f) {
    const a = f.values || [], n = Math.max(a.length, 1), gap = 7, w = Math.max(34, Math.min(58, (690 - gap * n) / n));
    const total = n * (w + gap) - gap, left = (720 - total) / 2;
    let body = defs;
    if (f.reach != null) {
      const end = left + Math.min(n - 1, f.reach) * (w + gap) + w;
      body += `<rect class="greedy-reach" x="${left - 6}" y="38" width="${Math.max(10, end - left + 12)}" height="76" rx="16"/>`;
    }
    a.forEach((v, i) => {
      let cls = i === f.active ? 'active' : '';
      if (f.bestL != null && i >= f.bestL && i <= f.bestR) cls += ' ok';
      if (f.start != null && i >= f.start && i <= (f.end ?? f.active)) cls += ' current';
      if (f.dead != null && i > f.dead) cls += ' dim';
      body += tile(left + i * (w + gap), 56, w, 54, v, cls, i);
    });
    if (f.from != null && f.to != null && f.from !== f.to) {
      body += arrow(left + f.from * (w + gap) + w / 2, 51, left + Math.min(n - 1, f.to) * (w + gap) + w / 2, 51, 'jump');
    }
    return svg('svg', { class: 'greedy-svg', viewBox: '0 0 720 150', role: 'img', 'aria-label': f.aria || 'Greedy array visualization' }, body);
  }

  function renderGas(f) {
    const gas = f.gas || [], cost = f.cost || [], n = Math.max(gas.length, 1);
    let body = defs + `<circle class="greedy-road" cx="360" cy="145" r="92"/>`;
    gas.forEach((g, i) => {
      const a = -Math.PI / 2 + i * Math.PI * 2 / n, x = 360 + Math.cos(a) * 92, y = 145 + Math.sin(a) * 92;
      const cls = i === f.active ? 'active' : i < (f.start || 0) ? 'dim' : '';
      body += `<g class="gas-stop ${cls}" transform="translate(${x},${y})">
        <circle r="25"/><path class="pump" d="M-8 10V-9h13v19M-5-4h7M5-6h5l4 5v11"/>
        <text y="39">+${esc(g)} / -${esc(cost[i] ?? 0)}</text><text class="idx" y="-33">${i}</text>
      </g>`;
    });
    if (f.active != null) {
      const a = -Math.PI / 2 + f.active * Math.PI * 2 / n, x = 360 + Math.cos(a) * 66, y = 145 + Math.sin(a) * 66;
      body += `<g class="gas-car" transform="translate(${x - 18},${y - 11}) rotate(${f.active * 360 / n})"><path d="M2 12h34l-5-12H12L2 12Z"/><circle cx="10" cy="14" r="4"/><circle cx="29" cy="14" r="4"/></g>`;
    }
    body += `<text class="greedy-center-label" x="360" y="137">tank</text><text class="greedy-center-value" x="360" y="164">${esc(f.tank ?? 0)}</text>`;
    return svg('svg', { class: 'greedy-svg gas-svg', viewBox: '0 0 720 290', role: 'img', 'aria-label': 'Circular gas station route' }, body);
  }

  function renderCards(f) {
    const cards = f.cards || [], n = Math.max(cards.length, 1), w = Math.max(30, Math.min(48, 630 / n)), left = (720 - n * (w + 5)) / 2;
    let body = defs;
    cards.forEach((v, i) => {
      const group = f.groups?.findIndex(g => g.includes(i)) ?? -1;
      let cls = i === f.active ? 'active' : group >= 0 ? `ok group-${group % 4}` : '';
      if (f.failed === i) cls = 'bad';
      body += `<g class="playing-card ${cls}" transform="translate(${left + i * (w + 5)},50)">
        <rect width="${w}" height="76" rx="7"/><text x="${w / 2}" y="31">${esc(v)}</text><text class="suit" x="${w / 2}" y="56">♦</text>
      </g>`;
    });
    (f.groups || []).forEach((g, i) => {
      if (!g.length) return;
      const x1 = left + g[0] * (w + 5), x2 = left + g[g.length - 1] * (w + 5) + w;
      body += `<path class="card-bracket group-${i % 4}" d="M${x1} 138v9h${x2 - x1}v-9"/><text class="card-group-label group-${i % 4}" x="${(x1 + x2) / 2}" y="165">group ${i + 1}</text>`;
    });
    return svg('svg', { class: 'greedy-svg', viewBox: '0 0 720 185', role: 'img', 'aria-label': 'Playing cards grouped into consecutive hands' }, body);
  }

  function renderTriplets(f) {
    const ts = f.triplets || [], target = f.target || [0, 0, 0], n = Math.max(ts.length, 1), col = Math.min(110, 630 / n), left = (720 - n * col) / 2;
    let body = '';
    ts.forEach((t, i) => {
      const cls = i === f.active ? 'active' : f.used?.includes(i) ? 'ok' : f.rejected?.includes(i) ? 'bad' : '';
      body += `<g class="triplet ${cls}" transform="translate(${left + i * col},34)">
        <rect width="${col - 10}" height="92" rx="9"/>
        ${t.map((v, j) => `<rect class="trip-bar b${j}" x="${12 + j * ((col - 34) / 3)}" y="${74 - v * 9}" width="${Math.max(8, (col - 42) / 3)}" height="${v * 9}"/><text x="${16 + j * ((col - 34) / 3)}" y="87">${v}</text>`).join('')}
      </g>`;
    });
    body += `<text class="target-label" x="360" y="152">merged max = ${esc(fmt(f.merged || [0, 0, 0]))}  →  target ${esc(fmt(target))}</text>`;
    return svg('svg', { class: 'greedy-svg', viewBox: '0 0 720 175', role: 'img', 'aria-label': 'Triplet bars merging toward target' }, body);
  }

  function renderString(f) {
    const chars = f.chars || [], n = Math.max(chars.length, 1), gap = 4, w = Math.max(24, Math.min(42, (690 - gap * n) / n));
    const left = (720 - (n * (w + gap) - gap)) / 2;
    let body = defs;
    chars.forEach((c, i) => {
      let cls = i === f.active ? 'active' : f.parts?.some(([l, r]) => i >= l && i <= r) ? 'ok' : '';
      body += tile(left + i * (w + gap), 69, w, 46, c, cls, i);
    });
    if (f.boundary != null) {
      const x = left + f.boundary * (w + gap) + w;
      body += `<path class="partition-wall" d="M${x + 2} 54v76"/><text class="boundary-label" x="${x + 7}" y="50">last occurrence</text>`;
    }
    (f.parts || []).forEach(([l, r], i) => {
      const x1 = left + l * (w + gap), x2 = left + r * (w + gap) + w;
      body += `<path class="partition-bracket" d="M${x1} 128v10h${x2 - x1}v-10"/><text class="partition-size" x="${(x1 + x2) / 2}" y="156">${r - l + 1}</text>`;
    });
    return svg('svg', { class: 'greedy-svg', viewBox: '0 0 720 175', role: 'img', 'aria-label': 'String partition visualization' }, body);
  }

  function renderBalance(f) {
    const chars = f.chars || [], n = Math.max(chars.length, 1), step = Math.min(58, 620 / n), left = (720 - (n - 1) * step) / 2;
    const scale = 16, zero = 125;
    let body = `<path class="balance-zero" d="M45 ${zero}H675"/><path class="balance-band" d="M45 42H675V${zero}H45Z"/>`;
    let ptsLo = [], ptsHi = [];
    (f.history || []).forEach((p, i) => { const x = left + i * step; ptsLo.push(`${x},${zero - p.lo * scale}`); ptsHi.push(`${x},${zero - p.hi * scale}`); });
    if (ptsHi.length) body += `<polyline class="balance-line high" points="${ptsHi.join(' ')}"/><polyline class="balance-line low" points="${ptsLo.join(' ')}"/>`;
    chars.forEach((c, i) => {
      const x = left + i * step;
      body += `<g class="balance-char ${i === f.active ? 'active' : i < (f.history?.length || 0) ? 'ok' : ''}"><circle cx="${x}" cy="177" r="18"/><text x="${x}" y="177">${esc(c)}</text></g>`;
    });
    body += `<text class="balance-legend" x="52" y="29">possible open balance: ${esc(f.lo ?? 0)} … ${esc(f.hi ?? 0)}</text><text class="balance-zero-label" x="680" y="${zero + 4}">0</text>`;
    return svg('svg', { class: 'greedy-svg', viewBox: '0 0 720 210', role: 'img', 'aria-label': 'Possible parenthesis balance corridor' }, body);
  }

  function render(f) {
    let picture;
    if (f.mode === 'gas') picture = renderGas(f);
    else if (f.mode === 'cards') picture = renderCards(f);
    else if (f.mode === 'triplets') picture = renderTriplets(f);
    else if (f.mode === 'string') picture = renderString(f);
    else if (f.mode === 'balance') picture = renderBalance(f);
    else picture = renderLinear(f);
    document.getElementById('stage-main').innerHTML = picture;
    document.getElementById('stage-story').innerHTML = (f.story || []).map((s, i) => `<span class="solution-chip ${i === f.story.length - 1 ? 'active' : ''}">${esc(s)}</span>`).join('');
    document.getElementById('state-a').textContent = f.metricA ?? '-';
    document.getElementById('state-b').textContent = f.metricB ?? '-';
    const result = document.getElementById('result');
    result.className = `result-banner${f.done ? ` show ${f.done}` : ''}`;
    result.textContent = f.result || '';
  }

  config('maximum_subarray', 'Maximum Subarray', '53',
    ['Kadane’s Algorithm', 'O(n) time', 'O(1) space'],
    'Find the contiguous subarray with the largest sum.',
    'A negative running sum only hurts every future subarray. Drop that baggage and let the current number begin a new story.',
    [{ id: 'in-arr', label: 'nums', value: '-2,1,-3,4,-1,2,1,-5,4' }],
    [
      ['classic', '-2,1,-3,4,-1,2,1,-5,4'], ['all negative', '-8,-3,-6,-2,-5,-4'],
      ['single', '7'], ['late winner', '5,-8,6,7,-2,3'], ['steady gain', '1,2,3,4']
    ].map(([label, a]) => ({ label, values: { 'in-arr': a } })),
    `class Solution {
    public int maxSubArray(int[] nums) {
        int best = nums[0], sum = 0;
        for (int i = 0; i < nums.length; i++) {
            if (sum < 0) sum = 0;
            sum += nums[i];
            best = Math.max(best, sum);
        }
        return best;
    }
}`,
    function () {
      const a = nums('in-arr'), F = []; let sum = 0, best = -Infinity, start = 0, bestL = 0, bestR = 0;
      a.forEach((x, i) => {
        if (sum < 0) { sum = 0; start = i; F.push({ mode: 'linear', line: 5, msg: `The old sum is negative, so index ${i} starts fresh.`, values: a, active: i, start, end: i, bestL, bestR, metricA: sum, metricB: best, story: [`reset at ${i}`] }); }
        sum += x;
        if (sum > best) { best = sum; bestL = start; bestR = i; }
        F.push({ mode: 'linear', line: [6, 7], msg: `Add ${x}: current sum ${sum}, best ${best}.`, values: a, active: i, start, end: i, bestL, bestR, metricA: sum, metricB: best, story: [`current ${sum}`, `best ${best}`] });
      });
      F.push({ mode: 'linear', line: 9, msg: `The best contiguous range sums to ${best}.`, values: a, active: bestR, bestL, bestR, metricA: best, metricB: `${bestL}…${bestR}`, story: [`winner ${fmt(a.slice(bestL, bestR + 1))}`], done: 'ok', result: `✓ maximum sum = ${best}` });
      return F;
    });

  config('jump_game', 'Jump Game', '55',
    ['Farthest Reach', 'O(n) time', 'O(1) space'],
    'Decide whether jumps from the first index can reach the last index.',
    'Carry one frontier: the farthest landing spot reachable so far. Every reachable platform can push that beam farther.',
    [{ id: 'in-arr', label: 'jump lengths', value: '2,3,1,1,4' }],
    [
      ['reachable', '2,3,1,1,4'], ['blocked', '3,2,1,0,4'], ['one leap', '5,0,0,0,0,0'],
      ['single', '0'], ['zeros inside', '2,0,2,0,1']
    ].map(([label, a]) => ({ label, values: { 'in-arr': a } })),
    `class Solution {
    public boolean canJump(int[] nums) {
        int farthest = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > farthest) return false;
            farthest = Math.max(farthest, i + nums[i]);
        }
        return true;
    }
}`,
    function () {
      const a = nums('in-arr'), F = []; let far = 0;
      for (let i = 0; i < a.length; i++) {
        if (i > far) { F.push({ mode: 'linear', line: 5, msg: `Index ${i} lies beyond the reachable beam ${far}.`, values: a, active: i, reach: far, dead: far, metricA: far, metricB: 'blocked', story: [`stuck before ${i}`], done: 'bad', result: '✗ cannot reach the end' }); return F; }
        const old = far; far = Math.max(far, i + a[i]);
        F.push({ mode: 'linear', line: 6, msg: `Platform ${i} extends reach from ${old} to ${far}.`, values: a, active: i, from: i, to: Math.min(a.length - 1, far), reach: far, metricA: far, metricB: a.length - 1, story: [`reach ${far}`] });
      }
      F.push({ mode: 'linear', line: 8, msg: 'The reachable beam covers the final platform.', values: a, active: a.length - 1, reach: far, metricA: far, metricB: 'reachable', story: ['end covered'], done: 'ok', result: '✓ can reach the end' });
      return F;
    });

  config('jump_game_ii', 'Jump Game II', '45',
    ['Level-by-Level Reach', 'O(n) time', 'O(1) space'],
    'Return the minimum number of jumps needed to reach the last index.',
    'Treat every current reachable range like one BFS layer. Scan it for the next farthest frontier, then commit exactly one jump.',
    [{ id: 'in-arr', label: 'jump lengths', value: '2,3,1,1,4' }],
    [
      ['classic', '2,3,1,1,4'], ['wide first jump', '4,1,1,3,1,1,1'], ['small steps', '1,1,1,1'],
      ['overlap', '2,3,0,1,4'], ['short', '2,1']
    ].map(([label, a]) => ({ label, values: { 'in-arr': a } })),
    `class Solution {
    public int jump(int[] nums) {
        int jumps = 0, left = 0, right = 0;
        while (right < nums.length - 1) {
            int farthest = right;
            for (int i = left; i <= right; i++)
                farthest = Math.max(farthest, i + nums[i]);
            left = right + 1;
            right = farthest;
            jumps++;
        }
        return jumps;
    }
}`,
    function () {
      const a = nums('in-arr'), F = []; let jumps = 0, left = 0, right = 0;
      while (right < a.length - 1) {
        let far = right;
        for (let i = left; i <= right; i++) {
          far = Math.max(far, i + a[i]);
          F.push({ mode: 'linear', line: [6, 7], msg: `From layer [${left}, ${right}], index ${i} can reach ${i + a[i]}.`, values: a, active: i, start: left, end: right, reach: far, from: i, to: Math.min(a.length - 1, i + a[i]), metricA: jumps, metricB: far, story: [`layer ${left}…${right}`, `next reach ${far}`] });
        }
        left = right + 1; right = far; jumps++;
        F.push({ mode: 'linear', line: [8, 9, 10], msg: `Commit jump ${jumps}; the next layer ends at ${right}.`, values: a, active: Math.min(left, a.length - 1), start: left, end: right, reach: right, metricA: jumps, metricB: right, story: [`jump ${jumps}`, `frontier ${right}`] });
      }
      F.push({ mode: 'linear', line: 12, msg: `The last index is covered in ${jumps} jumps.`, values: a, active: a.length - 1, reach: right, metricA: jumps, metricB: 'minimum', story: [`${jumps} jumps`], done: 'ok', result: `✓ minimum jumps = ${jumps}` });
      return F;
    });

  config('gas_station', 'Gas Station', '134',
    ['Reset on Deficit', 'O(n) time', 'O(1) space'],
    'Find the unique station where a full clockwise circuit can begin, or return -1.',
    'If the tank becomes negative at station i, no station in the failed segment could have done better. Restart after i.',
    [{ id: 'in-gas', label: 'gas', value: '1,2,3,4,5' }, { id: 'in-cost', label: 'cost', value: '3,4,5,1,2' }],
    [
      ['classic', '1,2,3,4,5', '3,4,5,1,2'], ['impossible', '2,3,4', '3,4,3'],
      ['start zero', '5,1,2,3,4', '4,4,1,5,1'], ['single works', '3', '2'], ['single fails', '2', '3']
    ].map(([label, g, c]) => ({ label, values: { 'in-gas': g, 'in-cost': c } })),
    `class Solution {
    public int canCompleteCircuit(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            int gain = gas[i] - cost[i];
            total += gain;
            tank += gain;
            if (tank < 0) {
                start = i + 1;
                tank = 0;
            }
        }
        return total < 0 ? -1 : start;
    }
}`,
    function () {
      const gas = nums('in-gas'), cost = nums('in-cost'), F = []; let total = 0, tank = 0, start = 0;
      gas.forEach((g, i) => {
        const gain = g - (cost[i] || 0); total += gain; tank += gain;
        F.push({ mode: 'gas', line: [5, 6, 7], msg: `Station ${i}: collect ${g}, spend ${cost[i] || 0}, tank becomes ${tank}.`, gas, cost, active: i, start, tank, metricA: tank, metricB: total, story: [`net ${gain >= 0 ? '+' : ''}${gain}`, `candidate ${start}`] });
        if (tank < 0) { start = i + 1; tank = 0; F.push({ mode: 'gas', line: [8, 9, 10], msg: `Deficit proves starts ${start === 1 ? '0' : `before ${start}`} fail. Restart at ${start}.`, gas, cost, active: i, start, tank, metricA: tank, metricB: total, story: [`reset start → ${start}`] }); }
      });
      const answer = total < 0 ? -1 : start;
      F.push({ mode: 'gas', line: 13, msg: answer < 0 ? 'Total fuel is below total cost, so no circuit exists.' : `Total fuel is sufficient; station ${answer} completes the loop.`, gas, cost, active: answer < 0 ? gas.length - 1 : answer, start, tank, metricA: answer, metricB: total, story: [answer < 0 ? 'no route' : `start ${answer}`], done: answer < 0 ? 'bad' : 'ok', result: answer < 0 ? '✗ no valid start' : `✓ start at station ${answer}` });
      return F;
    });

  config('hand_of_straights', 'Hand of Straights', '846',
    ['Smallest Card First', 'O(n log n) time', 'O(n) space'],
    'Determine whether every card can be rearranged into groups of consecutive values of size groupSize.',
    'The smallest remaining card has no earlier group that can absorb it. It must start the next consecutive run.',
    [{ id: 'in-hand', label: 'hand', value: '1,2,3,6,2,3,4,7,8' }, { id: 'in-size', label: 'group size', value: '3' }],
    [
      ['classic', '1,2,3,6,2,3,4,7,8', '3'], ['impossible', '1,2,3,4,5', '4'],
      ['pairs', '1,1,2,2,3,3', '3'], ['one group', '8,6,7', '3'], ['duplicates', '1,2,2,3,3,4', '3']
    ].map(([label, hand, size]) => ({ label, values: { 'in-hand': hand, 'in-size': size } })),
    `class Solution {
    public boolean isNStraightHand(int[] hand, int groupSize) {
        TreeMap<Integer, Integer> count = frequencies(hand);
        while (!count.isEmpty()) {
            int first = count.firstKey();
            for (int card = first; card < first + groupSize; card++) {
                if (!count.containsKey(card)) return false;
                decrementOrRemove(count, card);
            }
        }
        return true;
    }
}`,
    function () {
      const cards = nums('in-hand').sort((a, b) => a - b), size = Number(value('in-size')), F = [], count = new Map(), used = new Set(), groups = [];
      cards.forEach(x => count.set(x, (count.get(x) || 0) + 1));
      while (count.size) {
        const first = Math.min(...count.keys()), group = [];
        for (let card = first; card < first + size; card++) {
          const idx = cards.findIndex((x, i) => x === card && !used.has(i));
          F.push({ mode: 'cards', line: [5, 6], msg: `The smallest remaining card ${first} demands ${card} next.`, cards, groups: groups.concat([group.slice()]), active: idx, metricA: groups.length, metricB: card, story: [`need ${card}`] });
          if (idx < 0) { F.push({ mode: 'cards', line: 7, msg: `Card ${card} is missing, so the hand cannot be partitioned.`, cards, groups, failed: cards.findIndex(x => x > card), metricA: groups.length, metricB: 'missing', story: [`missing ${card}`], done: 'bad', result: '✗ invalid grouping' }); return F; }
          used.add(idx); group.push(idx);
          const next = count.get(card) - 1; if (next) count.set(card, next); else count.delete(card);
          F.push({ mode: 'cards', line: 8, msg: `Place ${card} into group ${groups.length + 1}.`, cards, groups: groups.concat([group.slice()]), active: idx, metricA: groups.length + 1, metricB: `${group.length}/${size}`, story: [`group ${groups.length + 1}: ${group.map(i => cards[i]).join(' ')}`] });
        }
        groups.push(group);
      }
      F.push({ mode: 'cards', line: 11, msg: 'Every card belongs to a complete consecutive group.', cards, groups, metricA: groups.length, metricB: 'complete', story: [`${groups.length} groups`], done: 'ok', result: '✓ valid grouping' });
      return F;
    });

  config('merge_triplets', 'Merge Triplets to Form Target', '1899',
    ['Reject Overshoots', 'O(n) time', 'O(1) space'],
    'Choose triplets whose coordinate-wise maximum equals the target triplet.',
    'A triplet that overshoots any target coordinate is poisonous. Every safe triplet can contribute exact target coordinates.',
    [{ id: 'in-triplets', label: 'triplets separated by |', value: '2,5,3|1,8,4|1,7,5' }, { id: 'in-target', label: 'target', value: '2,7,5' }],
    [
      ['classic yes', '2,5,3|1,8,4|1,7,5', '2,7,5'], ['classic no', '3,4,5|4,5,6', '3,2,5'],
      ['one exact', '1,1,1|2,3,4', '2,3,4'], ['merge three', '5,1,1|1,6,1|1,1,7', '5,6,7'],
      ['overshoots', '2,9,3|3,2,5|1,4,4', '3,4,5']
    ].map(([label, ts, t]) => ({ label, values: { 'in-triplets': ts, 'in-target': t } })),
    `class Solution {
    public boolean mergeTriplets(int[][] triplets, int[] target) {
        int[] merged = new int[3];
        for (int[] t : triplets) {
            if (t[0] > target[0] || t[1] > target[1] || t[2] > target[2])
                continue;
            for (int i = 0; i < 3; i++)
                merged[i] = Math.max(merged[i], t[i]);
        }
        return Arrays.equals(merged, target);
    }
}`,
    function () {
      const triplets = pairs('in-triplets'), target = nums('in-target').slice(0, 3), merged = [0, 0, 0], used = [], rejected = [], F = [];
      triplets.forEach((t, i) => {
        const bad = t.some((x, j) => x > target[j]);
        F.push({ mode: 'triplets', line: [4, 5], msg: bad ? `${fmt(t)} overshoots the target and is rejected.` : `${fmt(t)} is safe to merge.`, triplets, target, merged: merged.slice(), active: i, used: used.slice(), rejected: rejected.slice(), metricA: fmt(merged), metricB: bad ? 'reject' : 'safe', story: [bad ? 'overshoot' : 'safe'] });
        if (bad) rejected.push(i);
        else { used.push(i); t.forEach((x, j) => merged[j] = Math.max(merged[j], x)); F.push({ mode: 'triplets', line: [7, 8], msg: `Coordinate-wise max becomes ${fmt(merged)}.`, triplets, target, merged: merged.slice(), active: i, used: used.slice(), rejected: rejected.slice(), metricA: fmt(merged), metricB: fmt(target), story: [`merged ${fmt(merged)}`] }); }
      });
      const ok = merged.every((x, i) => x === target[i]);
      F.push({ mode: 'triplets', line: 10, msg: ok ? 'Every target coordinate has been supplied.' : 'At least one target coordinate is still missing.', triplets, target, merged, used, rejected, metricA: fmt(merged), metricB: fmt(target), story: [ok ? 'target formed' : 'target missing'], done: ok ? 'ok' : 'bad', result: ok ? '✓ target can be formed' : '✗ target cannot be formed' });
      return F;
    });

  config('partition_labels', 'Partition Labels', '763',
    ['Last Occurrence Boundary', 'O(n) time', 'O(1) alphabet'],
    'Split a string into as many parts as possible so each letter appears in at most one part.',
    'Each letter extends the current scene to its final appearance. The moment the scan meets that boundary, the scene can close.',
    [{ id: 'in-string', label: 'string', value: 'ababcbacadefegdehijhklij' }],
    [
      ['classic', 'ababcbacadefegdehijhklij'], ['one partition', 'eccbbbbdec'], ['all unique', 'abcdef'],
      ['paired', 'aabbcc'], ['nested', 'abacbc']
    ].map(([label, s]) => ({ label, values: { 'in-string': s } })),
    `class Solution {
    public List<Integer> partitionLabels(String s) {
        int[] last = lastPositions(s);
        List<Integer> sizes = new ArrayList<>();
        int start = 0, end = 0;
        for (int i = 0; i < s.length(); i++) {
            end = Math.max(end, last[s.charAt(i) - 'a']);
            if (i == end) {
                sizes.add(end - start + 1);
                start = i + 1;
            }
        }
        return sizes;
    }
}`,
    function () {
      const chars = [...value('in-string')], last = {}, F = [], parts = []; chars.forEach((c, i) => last[c] = i);
      let start = 0, end = 0;
      chars.forEach((c, i) => {
        end = Math.max(end, last[c]);
        F.push({ mode: 'string', line: 7, msg: `'${c}' last appears at ${last[c]}, so this partition must reach ${end}.`, chars, active: i, boundary: end, parts: parts.slice(), metricA: `${start}…${end}`, metricB: parts.length, story: [`'${c}' → ${last[c]}`, `boundary ${end}`] });
        if (i === end) { parts.push([start, end]); F.push({ mode: 'string', line: [8, 9, 10], msg: `The scan meets the boundary. Close a partition of size ${end - start + 1}.`, chars, active: i, boundary: end, parts: parts.slice(), metricA: end - start + 1, metricB: parts.length, story: [`close ${start}…${end}`] }); start = i + 1; }
      });
      F.push({ mode: 'string', line: 13, msg: `Return partition sizes ${fmt(parts.map(([l, r]) => r - l + 1))}.`, chars, active: chars.length - 1, parts, metricA: parts.length, metricB: fmt(parts.map(([l, r]) => r - l + 1)), story: ['all scenes closed'], done: 'ok', result: `✓ sizes = ${fmt(parts.map(([l, r]) => r - l + 1))}` });
      return F;
    });

  config('valid_parenthesis_string', 'Valid Parenthesis String', '678',
    ['Balance Range', 'O(n) time', 'O(1) space'],
    'Check whether a string containing (, ), and * can form a valid parenthesis string.',
    'Track the lowest and highest possible number of unmatched opens. A star widens the corridor because it may be (, ), or empty.',
    [{ id: 'in-string', label: 'parenthesis string', value: '(*))' }],
    [
      ['classic', '(*))'], ['simple', '(*)'], ['impossible', '(*)))'], ['stars', '(**)'],
      ['empty stars', '***'], ['early close', ')*(']
    ].map(([label, s]) => ({ label, values: { 'in-string': s } })),
    `class Solution {
    public boolean checkValidString(String s) {
        int low = 0, high = 0;
        for (char c : s.toCharArray()) {
            if (c == '(') { low++; high++; }
            else if (c == ')') { low--; high--; }
            else { low--; high++; }
            if (high < 0) return false;
            low = Math.max(low, 0);
        }
        return low == 0;
    }
}`,
    function () {
      const chars = [...value('in-string')], F = [], history = []; let lo = 0, hi = 0;
      for (let i = 0; i < chars.length; i++) {
        const c = chars[i];
        if (c === '(') { lo++; hi++; } else if (c === ')') { lo--; hi--; } else { lo--; hi++; }
        history.push({ lo: Math.max(0, lo), hi });
        F.push({ mode: 'balance', line: [5, 6, 7], msg: c === '*' ? `Star ${i} widens possible balance to ${lo}…${hi}.` : `'${c}' moves possible balance to ${lo}…${hi}.`, chars, active: i, history: history.slice(), lo, hi, metricA: lo, metricB: hi, story: [`range ${lo}…${hi}`] });
        if (hi < 0) { F.push({ mode: 'balance', line: 8, msg: 'Even the most optimistic interpretation has too many closing parentheses.', chars, active: i, history, lo, hi, metricA: lo, metricB: hi, story: ['corridor below zero'], done: 'bad', result: '✗ invalid' }); return F; }
        lo = Math.max(lo, 0); history[history.length - 1].lo = lo;
      }
      const ok = lo === 0;
      F.push({ mode: 'balance', line: 11, msg: ok ? 'Zero remains in the possible balance corridor.' : 'Every interpretation leaves unmatched opening parentheses.', chars, active: chars.length - 1, history, lo, hi, metricA: lo, metricB: hi, story: [ok ? 'zero is reachable' : 'zero is unreachable'], done: ok ? 'ok' : 'bad', result: ok ? '✓ valid' : '✗ invalid' });
      return F;
    });

  function shell(cfg) {
    document.body.innerHTML = `
      <nav class="topbar"><a class="back-link" href="../../index.html">← All Problems</a><span class="category-label">Greedy</span><span class="problem-meta"><span id="lc-chip" class="chip accent">LC ${cfg.lc}</span><span id="difficulty-chip" class="chip medium">${cfg.difficulty}</span></span></nav>
      <main class="pwrap">
        <header class="phero"><h1 id="problem-title" class="grad-text">${esc(cfg.title)}</h1><div id="hero-chips" class="chips">${cfg.chips.map((c, i) => `<span class="chip ${i ? '' : 'accent'}">${esc(c)}</span>`).join('')}</div></header>
        <div class="grid2"><section class="card"><h2 class="card-title"><span class="dot"></span>Problem</h2><div class="prose-dark"><p>${esc(cfg.problem)}</p></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Greedy Insight</h2><div class="prose-dark"><p>${esc(cfg.intuition)}</p></div></section></div>
        <div class="gridmain">
          <section class="card"><h2 class="card-title"><span class="dot"></span>Solution — synced with playback</h2><div id="code-panel" class="code-panel"></div></section>
          <section class="card"><h2 class="card-title"><span class="dot"></span>Live Visualization</h2>
            <div id="input-fields" class="grid2 greedy-inputs">${cfg.inputs.map(x => `<div class="field"><label for="${x.id}">${esc(x.label)}</label><input id="${x.id}" value="${esc(x.value)}"></div>`).join('')}</div>
            <div class="run-row"><button id="run-btn" class="btn-primary">▶ Run</button><span class="examples-label">Examples</span><span id="preset-row">${cfg.presets.map((p, i) => `<button class="preset-btn" data-preset="${i}">${esc(p.label)}</button>`).join('')}</span></div>
            <div id="step-msg" class="step-msg"></div>
            <div class="viz-stage greedy-stage"><div class="stage-label">The greedy decision unfolds here</div><div id="stage-main"></div><div id="stage-story" class="story-lane"></div><div class="state-grid"><div class="state-tile"><div class="k">Current</div><div id="state-a" class="v">-</div></div><div class="state-tile"><div class="k">Frontier</div><div id="state-b" class="v">-</div></div></div><div id="result" class="result-banner"></div></div>
            <div id="viz-controls" class="viz-controls"></div>
          </section>
        </div>
        <section class="card section-gap"><h2 class="card-title"><span class="dot"></span>Execution Log</h2><div id="log-panel" class="log-panel"></div></section>
        <section class="card"><div class="explanation-head"><h2 class="card-title"><span class="dot"></span>Full Explanation</h2><button id="narrate-btn" class="preset-btn" title="Read aloud">🔊 Narrate</button></div><div id="narration" class="prose-dark"><p>${esc(cfg.intuition)}</p></div></section>
      </main>`;
  }

  function init(key) {
    const cfg = CONFIGS[key];
    if (!cfg) throw new Error(`Unknown greedy problem: ${key}`);
    document.title = `${cfg.title} — Interactive Visualization`;
    shell(cfg);
    const viz = Viz.init({ code: cfg.code, buildFrames: cfg.build, render });
    document.getElementById('run-btn').addEventListener('click', viz.run);
    document.querySelectorAll('[data-preset]').forEach(btn => btn.addEventListener('click', () => {
      Object.entries(cfg.presets[Number(btn.dataset.preset)].values).forEach(([id, v]) => document.getElementById(id).value = v);
      viz.run();
    }));
    document.getElementById('narrate-btn').addEventListener('click', function () {
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); this.textContent = '🔊 Narrate'; return; }
      const utterance = new SpeechSynthesisUtterance(document.getElementById('narration').innerText);
      utterance.onend = () => this.textContent = '🔊 Narrate';
      this.textContent = '⏹ Stop'; speechSynthesis.speak(utterance);
    });
    viz.run();
  }

  return { init };
})();
