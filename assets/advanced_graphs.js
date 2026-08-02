window.AdvancedGraphPage = (function () {
  'use strict';

  const C = {};
  const esc = s => Viz.escapeHtml(String(s));
  const val = id => document.getElementById(id).value;
  const num = id => Number(val(id));
  const list = id => val(id).split(',').map(x => x.trim()).filter(Boolean);
  const triples = id => val(id).split('|').map(x => x.split(',').map(v => Number(v.trim()))).filter(x => x.length === 3 && x.every(Number.isFinite));
  const pairs = id => val(id).split('|').map(x => x.split(',').map(v => v.trim())).filter(x => x.length === 2 && x.every(Boolean));
  const points = id => val(id).split('|').map(x => x.split(',').map(Number)).filter(x => x.length === 2 && x.every(Number.isFinite));
  const clone = x => JSON.parse(JSON.stringify(x));
  const add = (k, o) => C[k] = Object.assign({ key: k, difficulty: 'Medium' }, o);
  const presets = rows => rows.map(r => ({ label: r[0], values: Object.fromEntries(r.slice(1)) }));

  function graphSvg(f) {
    const nodes = f.nodes || [], edges = f.edges || [], n = Math.max(nodes.length, 1);
    const width = 720, height = 270, positions = {};
    if (f.positions) {
      const xs = Object.values(f.positions).map(p => p[0]), ys = Object.values(f.positions).map(p => p[1]);
      const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
      nodes.forEach(x => { const p=f.positions[x]; positions[x]=[70+(p[0]-minX)/(maxX-minX||1)*580,45+(p[1]-minY)/(maxY-minY||1)*170]; });
    } else {
      nodes.forEach((x,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;positions[x]=[360+Math.cos(a)*Math.min(230,70+n*18),135+Math.sin(a)*90];});
    }
    const selected=new Set(f.selectedEdges||[]),used=new Set(f.usedEdges||[]),hot=f.hotEdge;
    let body=`<defs><marker id="ag-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs>`;
    edges.forEach((e,i)=>{
      const a=positions[e.from],b=positions[e.to];if(!a||!b)return;
      const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d,x1=a[0]+ux*25,y1=a[1]+uy*25,x2=b[0]-ux*27,y2=b[1]-uy*27;
      const id=e.id ?? `${e.from}>${e.to}#${i}`,cls=selected.has(id)?'selected':used.has(id)?'used':hot===id?'hot':'';
      body+=`<g class="ag-edge ${cls}"><path d="M${x1} ${y1}L${x2} ${y2}" ${f.directed?'marker-end="url(#ag-arrow)"':''}/>${e.w!=null?`<text x="${(x1+x2)/2+uy*10}" y="${(y1+y2)/2-ux*10}">${esc(e.w)}</text>`:''}</g>`;
    });
    const active=new Set(f.activeNodes||[]),done=new Set(f.doneNodes||[]),bad=new Set(f.badNodes||[]);
    nodes.forEach(x=>{const p=positions[x],cls=active.has(x)?'active':done.has(x)?'ok':bad.has(x)?'bad':'';body+=`<g class="ag-node ${cls}" transform="translate(${p[0]},${p[1]})"><circle r="24"/><text>${esc(x)}</text>${f.nodeSub?.[x]!=null?`<text class="sub" y="38">${esc(f.nodeSub[x])}</text>`:''}</g>`;});
    return `<svg class="ag-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(f.aria||'Graph algorithm visualization')}">${body}</svg>`;
  }

  function gridSvg(f) {
    const g=f.grid||[],R=g.length,Cc=g[0]?.length||0,size=Math.min(62,500/Math.max(R,Cc)),left=(720-Cc*size)/2,top=24;
    const wet=new Set((f.wet||[]).map(x=>x.join(','))),done=new Set((f.doneCells||[]).map(x=>x.join(','))),active=f.active?.join(',');
    let body='';
    for(let r=0;r<R;r++)for(let c=0;c<Cc;c++){const k=`${r},${c}`,cls=k===active?'active':done.has(k)?'ok':wet.has(k)?'wet':'';body+=`<g class="ag-grid-cell ${cls}" transform="translate(${left+c*size},${top+r*size})"><rect width="${size-5}" height="${size-5}" rx="7"/><text x="${(size-5)/2}" y="${(size-5)/2}">${g[r][c]}</text>${wet.has(k)?`<path class="water" d="M2 ${size-17}Q${size/4} ${size-24} ${size/2} ${size-17}T${size-7} ${size-17}V${size-7}H2Z"/>`:''}</g>`;}
    return `<svg class="ag-svg" viewBox="0 0 720 ${Math.max(150,top+R*size+12)}" role="img" aria-label="Rising water grid">${body}</svg>`;
  }

  function render(f) {
    document.getElementById('stage-main').innerHTML=f.mode==='grid'?gridSvg(f):graphSvg(f);
    document.getElementById('stage-route').innerHTML=(f.route||[]).map((x,i)=>`<span class="solution-chip">${esc(x)}</span>${i<f.route.length-1?'<span class="story-arrow">→</span>':''}`).join('')||'<span class="stage-empty">route builds here</span>';
    document.getElementById('stage-state').innerHTML=(f.state||[]).map(x=>`<span class="choice-card ${x.cls||''}">${esc(x.label??x)}</span>`).join('');
    document.getElementById('state-a').textContent=f.metricA??'-';document.getElementById('state-b').textContent=f.metricB??'-';
    const r=document.getElementById('result');r.className=`result-banner${f.done?` show ${f.done}`:''}`;r.textContent=f.result||'';
  }

  add('reconstruct_itinerary',{
    title:'Reconstruct Itinerary',lc:'332',difficulty:'Hard',chips:['Hierholzer + Lexical Heap','O(E log E)','Eulerian Trail'],
    problem:'Use every airline ticket exactly once, start at JFK, and return the lexicographically smallest itinerary.',
    intuition:'Always consume the smallest available destination. A dead end is not failure: it is the confirmed suffix of the Eulerian route, so prepend it while backtracking.',
    inputs:[{id:'in-tickets',label:'tickets as FROM,TO separated by |',value:'JFK,SFO|JFK,ATL|SFO,ATL|ATL,JFK|ATL,SFO'}],
    presets:presets([['classic',['in-tickets','JFK,SFO|JFK,ATL|SFO,ATL|ATL,JFK|ATL,SFO']],['JFK KUL NRT',['in-tickets','JFK,KUL|JFK,NRT|NRT,JFK']],['chain',['in-tickets','JFK,A|A,B|B,C']],['branch',['in-tickets','JFK,B|JFK,A|A,JFK|B,A']]]),
    code:`class Solution {
    public List<String> findItinerary(List<List<String>> tickets) {
        Map<String, PriorityQueue<String>> graph = buildGraph(tickets);
        LinkedList<String> route = new LinkedList<>();
        visit("JFK", graph, route);
        return route;
    }
    private void visit(String airport, Map<String,PriorityQueue<String>> g,
                       LinkedList<String> route) {
        while (g.containsKey(airport) && !g.get(airport).isEmpty())
            visit(g.get(airport).poll(), g, route);
        route.addFirst(airport);
    }
}`,
    build(){
      const ts=pairs('in-tickets').map((x,i)=>({from:x[0],to:x[1],id:`t${i}`})),nodes=[...new Set(ts.flatMap(x=>[x.from,x.to]))],adj={};ts.forEach(e=>(adj[e.from]||=[]).push(e));Object.values(adj).forEach(a=>a.sort((x,y)=>x.to.localeCompare(y.to)||x.id.localeCompare(y.id)));
      const F=[],used=[],route=[],stack=[];function visit(a){stack.push(a);F.push({line:5,msg:`Enter ${a}. Choose its smallest unused destination.`,nodes,edges:ts,directed:true,usedEdges:used.slice(),activeNodes:[a],route:route.slice(),state:stack.map(x=>({label:x})),metricA:used.length,metricB:'tickets used'});
        while(adj[a]?.length){const e=adj[a].shift();used.push(e.id);F.push({line:[10,11],msg:`Consume ${e.from} → ${e.to}; that ticket can never be reused.`,nodes,edges:ts,directed:true,usedEdges:used.slice(),hotEdge:e.id,activeNodes:[e.from,e.to],route:route.slice(),state:stack.map(x=>({label:x})),metricA:used.length,metricB:`of ${ts.length}`});visit(e.to);}
        stack.pop();route.unshift(a);F.push({line:12,msg:`${a} has no tickets left. Prepend it to the confirmed route.`,nodes,edges:ts,directed:true,usedEdges:used.slice(),doneNodes:route.slice(),route:route.slice(),state:stack.map(x=>({label:x})),metricA:route.length,metricB:'route length'});}
      visit('JFK');F.push({line:6,msg:`Every ticket is used; itinerary is ${route.join(' → ')}.`,nodes,edges:ts,directed:true,selectedEdges:used,doneNodes:nodes,route,metricA:ts.length,metricB:'complete',done:'ok',result:`✓ ${route.join(' → ')}`});return F;
    }
  });

  add('min_cost_connect_points',{
    title:'Min Cost to Connect All Points',lc:'1584',chips:['Prim’s MST','O(n²) visual algorithm','Manhattan Distance'],
    problem:'Connect every point with minimum total Manhattan-distance edge cost.',
    intuition:'Grow one connected island. At each step, the cheapest edge crossing from the island to an outside point is safe to add to the minimum spanning tree.',
    inputs:[{id:'in-points',label:'points as x,y separated by |',value:'0,0|2,2|3,10|5,2|7,0'}],
    presets:presets([['classic',['in-points','0,0|2,2|3,10|5,2|7,0']],['three',['in-points','3,12|-2,5|-4,1']],['square',['in-points','0,0|0,2|2,0|2,2']],['line',['in-points','0,0|2,0|5,0|9,0']]]),
    code:`class Solution {
    public int minCostConnectPoints(int[][] points) {
        boolean[] inTree = new boolean[points.length];
        int[] best = new int[points.length];
        Arrays.fill(best, Integer.MAX_VALUE);
        best[0] = 0;
        int cost = 0;
        for (int step = 0; step < points.length; step++) {
            int next = cheapestOutsidePoint(best, inTree);
            inTree[next] = true;
            cost += best[next];
            relaxManhattanEdgesFrom(next, points, best, inTree);
        }
        return cost;
    }
}`,
    build(){
      const ps=points('in-points'),nodes=ps.map((_,i)=>String(i)),pos=Object.fromEntries(nodes.map((x,i)=>[x,ps[i]])),all=[];for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++)all.push({from:String(i),to:String(j),w:Math.abs(ps[i][0]-ps[j][0])+Math.abs(ps[i][1]-ps[j][1]),id:`${i}-${j}`});
      const inTree=new Set(),best=Array(ps.length).fill(Infinity),parent=Array(ps.length).fill(-1),selected=[],F=[];best[0]=0;let cost=0;
      for(let step=0;step<ps.length;step++){let u=-1;for(let i=0;i<ps.length;i++)if(!inTree.has(i)&&(u<0||best[i]<best[u]))u=i;inTree.add(u);cost+=best[u];if(parent[u]>=0)selected.push(`${Math.min(u,parent[u])}-${Math.max(u,parent[u])}`);
        F.push({line:[8,9,10,11],msg:`Add point ${u} through the cheapest crossing edge (${best[u]}). Tree cost is ${cost}.`,nodes,edges:all,positions:pos,selectedEdges:selected.slice(),activeNodes:[String(u)],doneNodes:[...inTree].map(String),nodeSub:Object.fromEntries(nodes.map((x,i)=>[x,`best ${best[i]===Infinity?'∞':best[i]}`])),metricA:cost,metricB:`${inTree.size}/${ps.length}`,state:selected.map(x=>({label:x})),route:[]});
        for(let v=0;v<ps.length;v++)if(!inTree.has(v)){const w=Math.abs(ps[u][0]-ps[v][0])+Math.abs(ps[u][1]-ps[v][1]);if(w<best[v]){best[v]=w;parent[v]=u;F.push({line:12,msg:`Edge ${u}—${v} offers a cheaper connection cost ${w}.`,nodes,edges:all,positions:pos,selectedEdges:selected.slice(),hotEdge:`${Math.min(u,v)}-${Math.max(u,v)}`,activeNodes:[String(u),String(v)],doneNodes:[...inTree].map(String),nodeSub:Object.fromEntries(nodes.map((x,i)=>[x,`best ${best[i]===Infinity?'∞':best[i]}`])),metricA:cost,metricB:`candidate ${w}`,state:selected.map(x=>({label:x}))});}}}
      F.push({line:14,msg:`All points are connected for minimum cost ${cost}.`,nodes,edges:all,positions:pos,selectedEdges:selected,doneNodes:nodes,nodeSub:Object.fromEntries(nodes.map(x=>[x,'connected'])),metricA:cost,metricB:'MST complete',state:selected.map(x=>({label:x,cls:'ok'})),done:'ok',result:`✓ minimum cost = ${cost}`});return F;
    }
  });

  add('swim_in_rising_water',{
    title:'Swim in Rising Water',lc:'778',difficulty:'Hard',chips:['Minimax Dijkstra','O(n² log n)','Rising Water Story'],
    problem:'Return the earliest water level that permits a path from top-left to bottom-right.',
    intuition:'A path’s cost is its highest elevation. Dijkstra still works when edge addition becomes max: always expand the cell with the lowest required water level.',
    inputs:[{id:'in-grid',label:'rows separated by |',value:'0,1,2,3,4|24,23,22,21,5|12,13,14,15,16|11,17,18,19,20|10,9,8,7,6'}],
    presets:presets([['spiral',['in-grid','0,1,2,3,4|24,23,22,21,5|12,13,14,15,16|11,17,18,19,20|10,9,8,7,6']],['2×2',['in-grid','0,2|1,3']],['ridge',['in-grid','0,8,2|1,7,3|6,5,4']],['single',['in-grid','0']]]),
    code:`class Solution {
    public int swimInWater(int[][] grid) {
        PriorityQueue<State> pq = new PriorityQueue<>();
        pq.offer(new State(grid[0][0], 0, 0));
        boolean[][] seen = new boolean[grid.length][grid.length];
        while (!pq.isEmpty()) {
            State cur = pq.poll();
            if (seen[cur.r][cur.c]) continue;
            seen[cur.r][cur.c] = true;
            if (cur.isGoal()) return cur.level;
            for (Cell next : neighbors(cur))
                pq.offer(new State(Math.max(cur.level, next.height), next.r, next.c));
        }
        return -1;
    }
}`,
    build(){
      const g=val('in-grid').split('|').map(r=>r.split(',').map(Number)),R=g.length,Cc=g[0].length,best=Array.from({length:R},()=>Array(Cc).fill(Infinity)),seen=new Set(),pq=[[g[0][0],0,0]],F=[];best[0][0]=g[0][0];
      while(pq.length){pq.sort((a,b)=>a[0]-b[0]);const [level,r,c]=pq.shift(),k=`${r},${c}`;if(seen.has(k))continue;seen.add(k);const wet=[];for(let i=0;i<R;i++)for(let j=0;j<Cc;j++)if(g[i][j]<=level)wet.push([i,j]);F.push({mode:'grid',line:[5,6,7,8],msg:`At water level ${level}, settle cell (${r},${c}) with elevation ${g[r][c]}.`,grid:g,active:[r,c],doneCells:[...seen].map(x=>x.split(',').map(Number)),wet,metricA:level,metricB:`${seen.size} settled`,state:pq.slice(0,8).map(x=>({label:`(${x[1]},${x[2]})@${x[0]}`}))});if(r===R-1&&c===Cc-1){F.push({mode:'grid',line:9,msg:`The destination is reachable when water reaches ${level}.`,grid:g,active:[r,c],doneCells:[...seen].map(x=>x.split(',').map(Number)),wet,metricA:level,metricB:'destination',done:'ok',result:`✓ earliest time = ${level}`});return F;}for(const [dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(nr<0||nr>=R||nc<0||nc>=Cc||seen.has(`${nr},${nc}`))continue;const nl=Math.max(level,g[nr][nc]);if(nl<best[nr][nc]){best[nr][nc]=nl;pq.push([nl,nr,nc]);}}}return F;
    }
  });

  add('alien_dictionary',{
    title:'Alien Dictionary',lc:'269',difficulty:'Hard',chips:['Topological Sort','O(total letters)','First Difference Rule'],
    problem:'Infer a valid character order from words already sorted in an alien language.',
    intuition:'The first differing character between adjacent words creates one directed precedence edge. Kahn’s algorithm then reveals letters with no remaining prerequisites.',
    inputs:[{id:'in-words',label:'sorted alien words',value:'wrt,wrf,er,ett,rftt'}],
    presets:presets([['classic',['in-words','wrt,wrf,er,ett,rftt']],['simple',['in-words','z,x']],['cycle',['in-words','z,x,z']],['prefix invalid',['in-words','abc,ab']],['several',['in-words','baa,abcd,abca,cab,cad']]]),
    code:`class Solution {
    public String alienOrder(String[] words) {
        Graph g = graphWithEveryCharacter(words);
        for (int i = 0; i + 1 < words.length; i++) {
            int first = firstDifference(words[i], words[i + 1]);
            if (invalidPrefix(words[i], words[i + 1], first)) return "";
            if (first >= 0) g.addEdge(words[i].charAt(first), words[i+1].charAt(first));
        }
        Queue<Character> zero = allZeroIndegree(g);
        StringBuilder order = new StringBuilder();
        while (!zero.isEmpty()) removeAndAppend(zero.poll(), g, order);
        return order.length() == g.size() ? order.toString() : "";
    }
}`,
    build(){
      const ws=list('in-words'),chars=[...new Set(ws.join(''))].sort(),edgeSet=new Set(),edges=[],F=[];for(let i=0;i+1<ws.length;i++){const a=ws[i],b=ws[i+1];if(a.startsWith(b)&&a.length>b.length)return [{line:5,msg:`“${a}” appears before its own prefix “${b}”, which is impossible.`,nodes:chars,edges,directed:true,badNodes:[...b],metricA:'invalid',metricB:'prefix',done:'bad',result:'✗ no valid order'}];let j=0;while(j<Math.min(a.length,b.length)&&a[j]===b[j])j++;if(j<Math.min(a.length,b.length)){const id=`${a[j]}>${b[j]}`;if(!edgeSet.has(id)){edgeSet.add(id);edges.push({from:a[j],to:b[j],id});}F.push({line:[4,5,6],msg:`First difference: '${a[j]}' must come before '${b[j]}'.`,nodes:chars,edges:edges.slice(),directed:true,hotEdge:id,activeNodes:[a[j],b[j]],route:[],state:[],metricA:edges.length,metricB:'constraints'});}}
      const indeg=Object.fromEntries(chars.map(c=>[c,0])),adj=Object.fromEntries(chars.map(c=>[c,[]]));edges.forEach(e=>{adj[e.from].push(e.to);indeg[e.to]++;});let q=chars.filter(c=>indeg[c]===0).sort(),order=[],done=[];
      while(q.length){const c=q.shift();order.push(c);done.push(c);F.push({line:[8,9,10],msg:`'${c}' has no remaining prerequisites. Append it to the alphabet.`,nodes:chars,edges,directed:true,doneNodes:done.slice(),activeNodes:[c],route:order.slice(),state:q.map(x=>({label:x})),nodeSub:indeg,metricA:order.join(''),metricB:'order'});for(const nei of adj[c]){indeg[nei]--;if(indeg[nei]===0){q.push(nei);q.sort();}}}
      const ok=order.length===chars.length;F.push({line:11,msg:ok?`A valid alien alphabet is ${order.join('')}.`:'A cycle leaves letters with prerequisites forever.',nodes:chars,edges,directed:true,doneNodes:done,badNodes:chars.filter(x=>!done.includes(x)),route:order,metricA:ok?order.join(''):'cycle',metricB:'final',done:ok?'ok':'bad',result:ok?`✓ order = ${order.join('')}`:'✗ no valid order'});return F;
    }
  });

  add('cheapest_flights_k_stops',{
    title:'Cheapest Flights Within K Stops',lc:'787',chips:['Layered Bellman-Ford','O((k+1)E)','Stop-Bounded Relaxation'],
    problem:'Find the cheapest flight from src to dst using at most k intermediate stops.',
    intuition:'Run exactly k+1 edge-relaxation layers. Each round reads a frozen previous-price table, preventing a route from sneaking in extra flights during the same layer.',
    inputs:[{id:'in-flights',label:'flights as u,v,price separated by |',value:'0,1,100|1,2,100|2,0,100|1,3,600|2,3,200'},{id:'in-n',label:'cities',value:'4'},{id:'in-src',label:'src',value:'0'},{id:'in-dst',label:'dst',value:'3'},{id:'in-k',label:'max stops',value:'1'}],
    presets:presets([['classic',['in-flights','0,1,100|1,2,100|2,0,100|1,3,600|2,3,200'],['in-n','4'],['in-src','0'],['in-dst','3'],['in-k','1']],['direct only',['in-flights','0,1,100|1,2,100|0,2,500'],['in-n','3'],['in-src','0'],['in-dst','2'],['in-k','0']],['one stop',['in-flights','0,1,100|1,2,100|0,2,500'],['in-n','3'],['in-src','0'],['in-dst','2'],['in-k','1']],['unreachable',['in-flights','0,1,50'],['in-n','3'],['in-src','0'],['in-dst','2'],['in-k','2']]]),
    code:`class Solution {
    public int findCheapestPrice(int n, int[][] flights, int src, int dst, int k) {
        int[] price = new int[n];
        Arrays.fill(price, Integer.MAX_VALUE);
        price[src] = 0;
        for (int edges = 0; edges <= k; edges++) {
            int[] next = price.clone();
            for (int[] f : flights)
                if (price[f[0]] != Integer.MAX_VALUE)
                    next[f[1]] = Math.min(next[f[1]], price[f[0]] + f[2]);
            price = next;
        }
        return price[dst] == Integer.MAX_VALUE ? -1 : price[dst];
    }
}`,
    build(){
      const fs=triples('in-flights').map((x,i)=>({from:String(x[0]),to:String(x[1]),w:x[2],id:`f${i}`})),n=num('in-n'),src=num('in-src'),dst=num('in-dst'),k=num('in-k'),nodes=Array.from({length:n},(_,i)=>String(i)),price=Array(n).fill(Infinity),F=[];price[src]=0;
      for(let round=0;round<=k;round++){const next=price.slice();for(const e of fs){const u=Number(e.from),v=Number(e.to),cand=price[u]+e.w,improve=price[u]!==Infinity&&cand<next[v];if(improve)next[v]=cand;F.push({line:[6,7,8,9,10],msg:`Layer ${round+1}, ${e.from} → ${e.to}: ${price[u]===Infinity?'∞':price[u]} + ${e.w} ${improve?`improves city ${v} to ${cand}`:'does not improve'}.`,nodes,edges:fs,directed:true,hotEdge:e.id,activeNodes:[e.from,e.to],nodeSub:Object.fromEntries(nodes.map((x,i)=>[x,next[i]===Infinity?'∞':`$${next[i]}`])),route:[],state:next.map((x,i)=>({label:`${i}:${x===Infinity?'∞':x}`,cls:i===dst?'active':''})),metricA:next[dst]===Infinity?'∞':next[dst],metricB:`${round+1} flights`});}for(let i=0;i<n;i++)price[i]=next[i];}
      const ans=price[dst]===Infinity?-1:price[dst];F.push({line:12,msg:ans<0?`City ${dst} is unreachable within ${k} stops.`:`Cheapest price within ${k} stops is ${ans}.`,nodes,edges:fs,directed:true,doneNodes:ans<0?[]:[String(dst)],badNodes:ans<0?[String(dst)]:[],nodeSub:Object.fromEntries(nodes.map((x,i)=>[x,price[i]===Infinity?'∞':`$${price[i]}`])),state:price.map((x,i)=>({label:`${i}:${x===Infinity?'∞':x}`})),metricA:ans,metricB:`≤ ${k} stops`,done:ans<0?'bad':'ok',result:ans<0?'✗ no route':`✓ cheapest price = ${ans}`});return F;
    }
  });

  function shell(c) {
    document.body.innerHTML=`<nav class="topbar"><a class="back-link" href="../../index.html">← All Problems</a><span class="category-label">Advanced Graphs</span><span class="problem-meta"><span class="chip accent">LC ${c.lc}</span><span class="chip ${c.difficulty.toLowerCase()}">${c.difficulty}</span></span></nav><main class="pwrap">
    <header class="phero"><h1 class="grad-text">${esc(c.title)}</h1><div class="chips">${c.chips.map((x,i)=>`<span class="chip ${i?'':'accent'}">${esc(x)}</span>`).join('')}</div></header>
    <div class="grid2"><section class="card"><h2 class="card-title"><span class="dot"></span>Problem</h2><div class="prose-dark"><p>${esc(c.problem)}</p></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Graph Insight</h2><div class="prose-dark"><p>${esc(c.intuition)}</p></div></section></div>
    <div class="gridmain"><section class="card"><h2 class="card-title"><span class="dot"></span>Solution — synced with playback</h2><div id="code-panel" class="code-panel"></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Live Visualization</h2>
    <div id="input-fields" class="grid2 greedy-inputs">${c.inputs.map(x=>`<div class="field"><label for="${x.id}">${esc(x.label)}</label><input id="${x.id}" value="${esc(x.value)}"></div>`).join('')}</div><div class="run-row"><button id="run-btn" class="btn-primary">▶ Run</button><span class="examples-label">Examples</span><span id="preset-row">${c.presets.map((p,i)=>`<button class="preset-btn" data-preset="${i}">${esc(p.label)}</button>`).join('')}</span></div>
    <div id="step-msg" class="step-msg"></div><div class="viz-stage ag-stage"><div class="stage-label">The graph changes with every decision</div><div id="stage-main"></div><div class="stage-label">Confirmed route / order</div><div id="stage-route" class="story-lane"></div><div class="stage-label">Frontier state</div><div id="stage-state" class="story-lane"></div><div class="state-grid"><div class="state-tile"><div class="k">Value</div><div id="state-a" class="v">-</div></div><div class="state-tile"><div class="k">Progress</div><div id="state-b" class="v">-</div></div></div><div id="result" class="result-banner"></div></div><div id="viz-controls" class="viz-controls"></div></section></div>
    <section class="card section-gap"><h2 class="card-title"><span class="dot"></span>Execution Log</h2><div id="log-panel" class="log-panel"></div></section><section class="card"><div class="explanation-head"><h2 class="card-title"><span class="dot"></span>Full Explanation</h2><button id="narrate-btn" class="preset-btn">🔊 Narrate</button></div><div id="narration" class="prose-dark"><p>${esc(c.intuition)}</p></div></section></main>`;
  }
  function init(k){const c=C[k];if(!c)throw Error(`Unknown advanced graph: ${k}`);document.title=`${c.title} — Interactive Visualization`;shell(c);const viz=Viz.init({code:c.code,buildFrames:c.build,render});document.getElementById('run-btn').addEventListener('click',viz.run);document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{Object.entries(c.presets[Number(b.dataset.preset)].values).forEach(([id,v])=>document.getElementById(id).value=v);viz.run();}));document.getElementById('narrate-btn').addEventListener('click',function(){if(speechSynthesis.speaking){speechSynthesis.cancel();this.textContent='🔊 Narrate';return;}const u=new SpeechSynthesisUtterance(document.getElementById('narration').innerText);u.onend=()=>this.textContent='🔊 Narrate';this.textContent='⏹ Stop';speechSynthesis.speak(u);});viz.run();}
  return {init};
})();
