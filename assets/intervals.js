window.IntervalPage = (function(){
  'use strict';
  const C={},esc=s=>Viz.escapeHtml(String(s)),val=id=>document.getElementById(id).value,num=id=>Number(val(id));
  const ints=id=>val(id).split('|').map(x=>x.split(',').map(Number)).filter(x=>x.length===2&&x.every(Number.isFinite));
  const nums=id=>val(id).split(',').map(Number).filter(Number.isFinite),fmt=a=>`[${a.map(x=>`[${x}]`).join(', ')}]`;
  const add=(k,o)=>C[k]=Object.assign({key:k,difficulty:'Medium'},o),presets=rows=>rows.map(r=>({label:r[0],values:Object.fromEntries(r.slice(1))}));
  function render(f){
    const rows=f.intervals||[],all=rows.flatMap(x=>[x.start,x.end]),q=f.query,min=Math.min(0,...all,q??Infinity),max=Math.max(1,...all,q??-Infinity),span=max-min||1,x=v=>55+(v-min)/span*610;
    let body=`<path class="iv-axis" d="M45 225H680"/>`;for(let v=Math.ceil(min);v<=Math.floor(max);v++){const px=x(v);body+=`<path class="iv-tick" d="M${px} 221v8"/><text class="iv-tick-label" x="${px}" y="244">${v}</text>`;}
    rows.forEach((it,i)=>{const y=35+(it.lane??i%4)*42,cls=it.cls||'',x1=x(it.start),x2=x(it.end);body+=`<g class="iv-bar ${cls}"><rect x="${x1}" y="${y}" width="${Math.max(5,x2-x1)}" height="24" rx="8"/><text x="${(x1+x2)/2}" y="${y+16}">[${it.start},${it.end}]</text></g>`;});
    if(q!=null)body+=`<path class="iv-query" d="M${x(q)} 20V225"/><text class="iv-query-label" x="${x(q)+5}" y="18">query ${q}</text>`;
    document.getElementById('stage-main').innerHTML=`<svg class="iv-svg" viewBox="0 0 720 255" role="img" aria-label="Interval timeline">${body}</svg>`;
    document.getElementById('stage-state').innerHTML=(f.state||[]).map(x=>`<span class="choice-card ${x.cls||''}">${esc(x.label??x)}</span>`).join('');
    document.getElementById('state-a').textContent=f.metricA??'-';document.getElementById('state-b').textContent=f.metricB??'-';
    const r=document.getElementById('result');r.className=`result-banner${f.done?` show ${f.done}`:''}`;r.textContent=f.result||'';
  }
  const bars=(a,active,done,extra)=>a.map((z,i)=>({start:z[0],end:z[1],lane:i%4,cls:i===active?'active':(done||[]).includes(i)?'ok':''})).concat(extra||[]);

  add('insert_interval',{title:'Insert Interval',lc:'57',chips:['Single-Pass Merge','O(n) time','Three Regions'],problem:'Insert a new interval into sorted non-overlapping intervals and merge if necessary.',intuition:'Intervals fall into three scenes: entirely before, overlapping the growing insertion, or entirely after. Only the middle scene changes shape.',inputs:[{id:'in-intervals',label:'intervals separated by |',value:'1,3|6,9'},{id:'in-new',label:'new interval',value:'2,5'}],presets:presets([['classic',['in-intervals','1,3|6,9'],['in-new','2,5']],['wide merge',['in-intervals','1,2|3,5|6,7|8,10|12,16'],['in-new','4,8']],['before',['in-intervals','3,5|7,9'],['in-new','0,1']],['after',['in-intervals','1,2|3,4'],['in-new','6,8']]]),code:`class Solution {
    public int[][] insert(int[][] intervals, int[] fresh) {
        List<int[]> out = new ArrayList<>();
        int i = 0;
        while (i < intervals.length && intervals[i][1] < fresh[0])
            out.add(intervals[i++]);
        while (i < intervals.length && intervals[i][0] <= fresh[1]) {
            fresh[0] = Math.min(fresh[0], intervals[i][0]);
            fresh[1] = Math.max(fresh[1], intervals[i++][1]);
        }
        out.add(fresh);
        while (i < intervals.length) out.add(intervals[i++]);
        return out.toArray(new int[0][]);
    }
}`,build(){const a=ints('in-intervals'),fresh=nums('in-new').slice(0,2),out=[],F=[];let i=0;while(i<a.length&&a[i][1]<fresh[0]){out.push(a[i]);F.push({line:[4,5,6],msg:`${a[i]} ends before the new interval; copy it unchanged.`,intervals:bars(a,i,[...Array(i+1).keys()], [{start:fresh[0],end:fresh[1],lane:4,cls:'warn'}]),state:out.map(x=>({label:`[${x}]`,cls:'ok'})),metricA:out.length,metricB:'before'});i++;}while(i<a.length&&a[i][0]<=fresh[1]){fresh[0]=Math.min(fresh[0],a[i][0]);fresh[1]=Math.max(fresh[1],a[i][1]);F.push({line:[7,8,9],msg:`Overlap with ${a[i]}; grow insertion to [${fresh}].`,intervals:bars(a,i,[],[{start:fresh[0],end:fresh[1],lane:4,cls:'active'}]),state:out.map(x=>({label:`[${x}]`})),metricA:`[${fresh}]`,metricB:'merge'});i++;}out.push(fresh.slice());while(i<a.length)out.push(a[i++]);F.push({line:[11,12,13],msg:'Append the merged insertion and every remaining interval.',intervals:bars(out,-1,out.map((_,i)=>i)),state:out.map(x=>({label:`[${x}]`,cls:'ok'})),metricA:out.length,metricB:'complete',done:'ok',result:`✓ ${fmt(out)}`});return F;}});

  add('merge_intervals',{title:'Merge Intervals',lc:'56',chips:['Sort + Sweep','O(n log n)','Growing Right Edge'],problem:'Merge every overlapping interval.',intuition:'After sorting by start, only the last merged interval can overlap the next one. Extend its right edge or begin a new block.',inputs:[{id:'in-intervals',label:'intervals',value:'1,3|2,6|8,10|15,18'}],presets:presets([['classic',['in-intervals','1,3|2,6|8,10|15,18']],['touching',['in-intervals','1,4|4,5']],['nested',['in-intervals','1,10|2,3|4,8']],['disjoint',['in-intervals','1,2|4,5|7,8']]]),code:`class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] cur : intervals) {
            if (out.isEmpty() || out.get(out.size()-1)[1] < cur[0])
                out.add(cur.clone());
            else
                out.get(out.size()-1)[1] = Math.max(out.get(out.size()-1)[1], cur[1]);
        }
        return out.toArray(new int[0][]);
    }
}`,build(){const a=ints('in-intervals').sort((x,y)=>x[0]-y[0]),out=[],F=[];a.forEach((z,i)=>{if(!out.length||out.at(-1)[1]<z[0]){out.push(z.slice());F.push({line:[5,6,7],msg:`${z} starts after the current block; open a new block.`,intervals:bars(a,i,[],bars(out,-1,[]).map(x=>({...x,lane:x.lane+4,cls:'ok'}))),state:out.map(x=>({label:`[${x}]`})),metricA:out.length,metricB:'new block'});}else{out.at(-1)[1]=Math.max(out.at(-1)[1],z[1]);F.push({line:[8,9],msg:`${z} overlaps; extend the last block to [${out.at(-1)}].`,intervals:bars(a,i,[],bars(out,-1,[]).map(x=>({...x,lane:x.lane+4,cls:'active'}))),state:out.map(x=>({label:`[${x}]`})),metricA:`[${out.at(-1)}]`,metricB:'merged'});}});F.push({line:11,msg:'No overlaps remain.',intervals:bars(out,-1,out.map((_,i)=>i)),state:out.map(x=>({label:`[${x}]`,cls:'ok'})),metricA:out.length,metricB:'blocks',done:'ok',result:`✓ ${fmt(out)}`});return F;}});

  add('non_overlapping_intervals',{title:'Non-overlapping Intervals',lc:'435',chips:['Greedy by End Time','O(n log n)','Keep Earliest Finish'],problem:'Return the minimum number of intervals to remove so the rest do not overlap.',intuition:'When two intervals collide, keep the one ending sooner. It leaves the most room for every future interval.',inputs:[{id:'in-intervals',label:'intervals',value:'1,2|2,3|3,4|1,3'}],presets:presets([['classic',['in-intervals','1,2|2,3|3,4|1,3']],['duplicates',['in-intervals','1,2|1,2|1,2']],['none',['in-intervals','1,2|3,4']],['nested',['in-intervals','1,10|2,3|3,4']]]),code:`class Solution {
    public int eraseOverlapIntervals(int[][] intervals) {
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[1]));
        int removed = 0, end = Integer.MIN_VALUE;
        for (int[] cur : intervals) {
            if (cur[0] < end) removed++;
            else end = cur[1];
        }
        return removed;
    }
}`,build(){const a=ints('in-intervals').sort((x,y)=>x[1]-y[1]),kept=[],removed=[],F=[];let end=-Infinity;a.forEach((z,i)=>{if(z[0]<end){removed.push(i);F.push({line:6,msg:`${z} starts before kept end ${end}; remove it.`,intervals:a.map((x,j)=>({start:x[0],end:x[1],lane:j%4,cls:j===i?'bad':kept.includes(j)?'ok':''})),metricA:removed.length,metricB:'removed',state:kept.map(j=>({label:`[${a[j]}]`,cls:'ok'}))});}else{end=z[1];kept.push(i);F.push({line:7,msg:`Keep ${z}; it finishes at ${end}.`,intervals:a.map((x,j)=>({start:x[0],end:x[1],lane:j%4,cls:j===i?'active':kept.includes(j)?'ok':''})),metricA:end,metricB:'earliest end',state:kept.map(j=>({label:`[${a[j]}]`,cls:'ok'}))});}});F.push({line:9,msg:`Remove ${removed.length} intervals.`,intervals:a.map((x,j)=>({start:x[0],end:x[1],lane:j%4,cls:removed.includes(j)?'bad':'ok'})),metricA:removed.length,metricB:'minimum',done:'ok',result:`✓ removals = ${removed.length}`});return F;}});

  function meetingConfig(rooms){return {title:rooms?'Meeting Rooms II':'Meeting Rooms',lc:rooms?'253':'252',difficulty:rooms?'Medium':'Easy',chips:[rooms?'Min-Heap of End Times':'Sort by Start','O(n log n)',rooms?'Count Concurrent Rooms':'Detect Collision'],problem:rooms?'Return the minimum number of rooms required for all meetings.':'Decide whether one person can attend every meeting.',intuition:rooms?'Reuse the room whose meeting ends first. If it is still occupied, open another room.':'After sorting by start time, only adjacent meetings can reveal an overlap.',inputs:[{id:'in-intervals',label:'meetings',value:rooms?'0,30|5,10|15,20':'0,30|5,10|15,20'}],presets:presets([['overlap',['in-intervals','0,30|5,10|15,20']],['separate',['in-intervals','7,10|2,4']],['touching',['in-intervals','1,5|5,8|8,10']],['crowded',['in-intervals','1,10|2,9|3,8|4,7']]]),code:rooms?`class Solution {
    public int minMeetingRooms(int[][] meetings) {
        Arrays.sort(meetings, Comparator.comparingInt(a -> a[0]));
        PriorityQueue<Integer> ends = new PriorityQueue<>();
        for (int[] m : meetings) {
            if (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll();
            ends.offer(m[1]);
        }
        return ends.size();
    }
}`:`class Solution {
    public boolean canAttendMeetings(int[][] meetings) {
        Arrays.sort(meetings, Comparator.comparingInt(a -> a[0]));
        for (int i=1;i<meetings.length;i++)
            if (meetings[i][0] < meetings[i-1][1]) return false;
        return true;
    }
}`,build(){const a=ints('in-intervals').sort((x,y)=>x[0]-y[0]),F=[];if(!rooms){for(let i=1;i<a.length;i++){const bad=a[i][0]<a[i-1][1];F.push({line:[4,5],msg:bad?`${a[i-1]} overlaps ${a[i]}.`:`${a[i-1]} ends before ${a[i]} starts.`,intervals:bars(a,i,[...Array(i).keys()]),metricA:bad?'conflict':'clear',metricB:`pair ${i}`,done:bad?'bad':undefined,result:bad?'✗ cannot attend all':''});if(bad)return F;}F.push({line:6,msg:'No meetings overlap.',intervals:bars(a,-1,a.map((_,i)=>i)),metricA:true,metricB:'one room',done:'ok',result:'✓ can attend all'});return F;}let heap=[],max=0;a.forEach((m,i)=>{heap.sort((x,y)=>x-y);if(heap.length&&heap[0]<=m[0])heap.shift();heap.push(m[1]);max=Math.max(max,heap.length);F.push({line:[4,5,6,7],msg:`Meeting ${m}: ${heap.length>1?'rooms overlap':'a room is available'}; active end times ${fmt(heap.map(x=>[x]))}.`,intervals:a.map((x,j)=>({start:x[0],end:x[1],lane:j,cls:j===i?'active':j<i?'ok':''})),metricA:heap.length,metricB:`max ${max}`,state:heap.map((x,j)=>({label:`room ${j+1} → ${x}`}))});});F.push({line:9,msg:`Peak concurrency requires ${max} rooms.`,intervals:bars(a,-1,a.map((_,i)=>i)),metricA:max,metricB:'rooms',done:'ok',result:`✓ rooms = ${max}`});return F;}}}
  add('meeting_rooms',meetingConfig(false));add('meeting_rooms_ii',meetingConfig(true));

  add('minimum_interval_queries',{title:'Minimum Interval to Include Each Query',lc:'1851',difficulty:'Hard',chips:['Sort + Min-Heap','O((n+q) log n)','Sweep Queries'],problem:'For each query, return the size of the smallest interval containing it, or -1.',intuition:'Sweep queries left to right. Add intervals whose starts have arrived, discard intervals already ended, and let a size-ordered heap expose the smallest valid cover.',inputs:[{id:'in-intervals',label:'intervals',value:'1,4|2,4|3,6|4,4'},{id:'in-queries',label:'queries',value:'2,3,4,5'}],presets:presets([['classic',['in-intervals','1,4|2,4|3,6|4,4'],['in-queries','2,3,4,5']],['gaps',['in-intervals','2,3|5,8'],['in-queries','1,2,4,6']],['nested',['in-intervals','1,10|2,5|3,4'],['in-queries','3,6']],['single',['in-intervals','5,5'],['in-queries','5']]]),code:`class Solution {
    public int[] minInterval(int[][] intervals, int[] queries) {
        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));
        PriorityQueue<int[]> heap = new PriorityQueue<>((a,b) -> a[0]-b[0]);
        for (int q : sortedQueries(queries)) {
            while (nextIntervalStartsBefore(q)) heap.offer(sizeAndEnd(nextInterval()));
            while (!heap.isEmpty() && heap.peek()[1] < q) heap.poll();
            answer[q] = heap.isEmpty() ? -1 : heap.peek()[0];
        }
        return restoreOriginalOrder(answer);
    }
}`,build(){const a=ints('in-intervals').sort((x,y)=>x[0]-y[0]),qs=nums('in-queries'),sorted=[...qs].sort((x,y)=>x-y),ans=new Map(),F=[];let heap=[],i=0;for(const q of sorted){while(i<a.length&&a[i][0]<=q){heap.push([a[i][1]-a[i][0]+1,a[i][1],i]);i++;}heap=heap.filter(x=>x[1]>=q).sort((x,y)=>x[0]-y[0]);const best=heap.length?heap[0][0]:-1;ans.set(q,best);F.push({query:q,line:[4,5,6,7],msg:`Query ${q}: ${heap.length} active covers; smallest size is ${best}.`,intervals:a.map((x,j)=>({start:x[0],end:x[1],lane:j%4,cls:heap.some(h=>h[2]===j)?(heap[0][2]===j?'active':'ok'):''})),metricA:best,metricB:`query ${q}`,state:heap.map(h=>({label:`size ${h[0]} end ${h[1]}`}))});}const out=qs.map(q=>ans.get(q));F.push({line:9,msg:`Restore original query order: ${fmt(out.map(x=>[x]))}.`,intervals:bars(a,-1,[]),metricA:fmt(out.map(x=>[x])),metricB:'answers',done:'ok',result:`✓ [${out.join(', ')}]`});return F;}});

  function shell(c){document.body.innerHTML=`<nav class="topbar"><a class="back-link" href="../../index.html">← All Problems</a><span class="category-label">Intervals</span><span class="problem-meta"><span class="chip accent">LC ${c.lc}</span><span class="chip ${c.difficulty.toLowerCase()}">${c.difficulty}</span></span></nav><main class="pwrap"><header class="phero"><h1 class="grad-text">${esc(c.title)}</h1><div class="chips">${c.chips.map((x,i)=>`<span class="chip ${i?'':'accent'}">${esc(x)}</span>`).join('')}</div></header><div class="grid2"><section class="card"><h2 class="card-title"><span class="dot"></span>Problem</h2><div class="prose-dark"><p>${esc(c.problem)}</p></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Interval Insight</h2><div class="prose-dark"><p>${esc(c.intuition)}</p></div></section></div><div class="gridmain"><section class="card"><h2 class="card-title"><span class="dot"></span>Solution — synced with playback</h2><div id="code-panel" class="code-panel"></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Live Visualization</h2><div id="input-fields" class="grid2 greedy-inputs">${c.inputs.map(x=>`<div class="field"><label for="${x.id}">${esc(x.label)}</label><input id="${x.id}" value="${esc(x.value)}"></div>`).join('')}</div><div class="run-row"><button id="run-btn" class="btn-primary">▶ Run</button><span class="examples-label">Examples</span><span id="preset-row">${c.presets.map((p,i)=>`<button class="preset-btn" data-preset="${i}">${esc(p.label)}</button>`).join('')}</span></div><div id="step-msg" class="step-msg"></div><div class="viz-stage iv-stage"><div class="stage-label">Timeline sweep</div><div id="stage-main"></div><div class="stage-label">Active state</div><div id="stage-state" class="story-lane"></div><div class="state-grid"><div class="state-tile"><div class="k">Value</div><div id="state-a" class="v">-</div></div><div class="state-tile"><div class="k">Decision</div><div id="state-b" class="v">-</div></div></div><div id="result" class="result-banner"></div></div><div id="viz-controls" class="viz-controls"></div></section></div><section class="card section-gap"><h2 class="card-title"><span class="dot"></span>Execution Log</h2><div id="log-panel" class="log-panel"></div></section><section class="card"><div class="explanation-head"><h2 class="card-title"><span class="dot"></span>Full Explanation</h2><button id="narrate-btn" class="preset-btn">🔊 Narrate</button></div><div id="narration" class="prose-dark"><p>${esc(c.intuition)}</p></div></section></main>`;}
  function init(k){const c=C[k];if(!c)throw Error(`Unknown interval: ${k}`);document.title=`${c.title} — Interactive Visualization`;shell(c);const viz=Viz.init({code:c.code,buildFrames:c.build,render});document.getElementById('run-btn').addEventListener('click',viz.run);document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{Object.entries(c.presets[Number(b.dataset.preset)].values).forEach(([id,v])=>document.getElementById(id).value=v);viz.run();}));viz.run();}
  return {init};
})();
