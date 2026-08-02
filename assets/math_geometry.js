window.MathGeometryPage = (function () {
  'use strict';
  const C={},esc=s=>Viz.escapeHtml(String(s)),val=id=>document.getElementById(id).value,num=id=>Number(val(id));
  const nums=id=>val(id).split(',').map(x=>Number(x.trim())).filter(Number.isFinite);
  const matrix=id=>val(id).split('|').map(r=>r.split(',').map(Number)).filter(r=>r.length&&r.every(Number.isFinite));
  const points=id=>val(id).split('|').map(p=>p.split(',').map(Number)).filter(p=>p.length===2&&p.every(Number.isFinite));
  const copy=a=>a.map(r=>r.slice()),fmt=a=>`[${a.join(', ')}]`,add=(k,o)=>C[k]=Object.assign({key:k,difficulty:'Medium'},o);
  const presets=rows=>rows.map(r=>({label:r[0],values:Object.fromEntries(r.slice(1))}));

  function renderMatrix(f){
    const g=f.matrix||[],R=g.length,Cc=g[0]?.length||0,active=new Set((f.activeCells||[]).map(x=>x.join(','))),good=new Set((f.goodCells||[]).map(x=>x.join(','))),bad=new Set((f.badCells||[]).map(x=>x.join(',')));
    return `<div class="mg-matrix" style="--cols:${Cc}">${g.flatMap((row,r)=>row.map((x,c)=>`<div class="mg-cell ${active.has(`${r},${c}`)?'active':good.has(`${r},${c}`)?'ok':bad.has(`${r},${c}`)?'bad':''}"><span>${esc(x)}</span><small>${r},${c}</small></div>`)).join('')}</div>`;
  }
  function renderDigits(f){
    return `<div class="mg-digits">${(f.digits||[]).map((x,i)=>`<div class="mg-digit ${i===f.active?'active':(f.good||[]).includes(i)?'ok':''}"><span>${esc(x)}</span><small>${esc(f.labels?.[i]??i)}</small></div>`).join('')}</div>`;
  }
  function renderChain(f){
    return `<div class="mg-chain">${(f.chain||[]).map((x,i)=>`${i?'<span class="mg-arrow">→</span>':''}<div class="mg-number ${i===f.chain.length-1?'active':''}">${esc(x)}</div>`).join('')}</div>`;
  }
  function renderPlane(f){
    const ps=f.points||[],q=f.query||[0,0],all=ps.concat([q]),xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),pos=p=>[65+(p[0]-minX)/(maxX-minX||1)*590,220-(p[1]-minY)/(maxY-minY||1)*170];
    let body='<path class="mg-axis" d="M45 230H680M55 240V30"/>';const sq=f.square||[];if(sq.length===4){const p=sq.map(pos);body+=`<path class="mg-square" d="M${p.map(x=>x.join(' ')).join('L')}Z"/>`;}
    ps.forEach((p,i)=>{const a=pos(p),hot=sq.some(x=>x[0]===p[0]&&x[1]===p[1]);body+=`<g class="mg-point ${hot?'ok':''}" transform="translate(${a[0]},${a[1]})"><circle r="9"/><text y="-15">(${p})</text></g>`;});
    const z=pos(q);body+=`<g class="mg-point query" transform="translate(${z[0]},${z[1]})"><circle r="11"/><text y="-17">query (${q})</text></g>`;
    return `<svg class="mg-plane" viewBox="0 0 720 260" role="img" aria-label="Coordinate plane square counting">${body}</svg>`;
  }
  function render(f){
    const mount=document.getElementById('stage-main');mount.innerHTML=f.mode==='matrix'?renderMatrix(f):f.mode==='plane'?renderPlane(f):f.mode==='chain'?renderChain(f):renderDigits(f);
    document.getElementById('stage-story').innerHTML=(f.story||[]).map(x=>`<span class="solution-chip">${esc(x)}</span>`).join('');
    document.getElementById('state-a').textContent=f.metricA??'-';document.getElementById('state-b').textContent=f.metricB??'-';
    const r=document.getElementById('result');r.className=`result-banner${f.done?` show ${f.done}`:''}`;r.textContent=f.result||'';
  }

  add('rotate_image',{
    title:'Rotate Image',lc:'48',chips:['Transpose + Reverse','O(n²) time','In-Place Matrix'],
    problem:'Rotate an n × n image 90 degrees clockwise in place.',
    intuition:'A clockwise rotation decomposes cleanly: transpose across the main diagonal, then reverse every row.',
    inputs:[{id:'in-matrix',label:'rows separated by |',value:'1,2,3|4,5,6|7,8,9'}],
    presets:presets([['3×3',['in-matrix','1,2,3|4,5,6|7,8,9']],['2×2',['in-matrix','1,2|3,4']],['4×4',['in-matrix','5,1,9,11|2,4,8,10|13,3,6,7|15,14,12,16']],['single',['in-matrix','7']]]),
    code:`class Solution {
    public void rotate(int[][] matrix) {
        int n = matrix.length;
        for (int r = 0; r < n; r++)
            for (int c = r + 1; c < n; c++)
                swap(matrix, r, c, c, r);
        for (int[] row : matrix)
            reverse(row);
    }
}`,
    build(){const g=matrix('in-matrix'),n=g.length,F=[];for(let r=0;r<n;r++)for(let c=r+1;c<n;c++){[g[r][c],g[c][r]]=[g[c][r],g[r][c]];F.push({mode:'matrix',line:[4,5,6],msg:`Transpose: swap (${r},${c}) with (${c},${r}).`,matrix:copy(g),activeCells:[[r,c],[c,r]],metricA:'transpose',metricB:`${r},${c}`,story:['mirror across diagonal']});}for(let r=0;r<n;r++){g[r].reverse();F.push({mode:'matrix',line:[7,8],msg:`Reverse row ${r} to turn the transpose clockwise.`,matrix:copy(g),activeCells:g[r].map((_,c)=>[r,c]),metricA:'reverse',metricB:`row ${r}`,story:['left ↔ right']});}F.push({mode:'matrix',line:9,msg:'The image is rotated 90° clockwise.',matrix:g,goodCells:g.flatMap((r,i)=>r.map((_,j)=>[i,j])),metricA:`${n}×${n}`,metricB:'rotated',done:'ok',result:`✓ ${g.map(r=>fmt(r)).join(' ')}`});return F;}
  });

  add('spiral_matrix',{
    title:'Spiral Matrix',lc:'54',chips:['Shrinking Boundaries','O(mn) time','Clockwise Traversal'],
    problem:'Return every matrix value in clockwise spiral order.',
    intuition:'Four boundaries frame the unvisited rectangle. Walk its top, right, bottom, and left edges, then shrink the frame.',
    inputs:[{id:'in-matrix',label:'rows separated by |',value:'1,2,3|4,5,6|7,8,9'}],
    presets:presets([['square',['in-matrix','1,2,3|4,5,6|7,8,9']],['wide',['in-matrix','1,2,3,4|5,6,7,8|9,10,11,12']],['row',['in-matrix','1,2,3,4']],['column',['in-matrix','1|2|3']]]),
    code:`class Solution {
    public List<Integer> spiralOrder(int[][] a) {
        List<Integer> out = new ArrayList<>();
        int top=0, bottom=a.length-1, left=0, right=a[0].length-1;
        while (top <= bottom && left <= right) {
            for (int c=left;c<=right;c++) out.add(a[top][c]); top++;
            for (int r=top;r<=bottom;r++) out.add(a[r][right]); right--;
            if (top<=bottom) for (int c=right;c>=left;c--) out.add(a[bottom][c]); bottom--;
            if (left<=right) for (int r=bottom;r>=top;r--) out.add(a[r][left]); left++;
        }
        return out;
    }
}`,
    build(){const g=matrix('in-matrix'),R=g.length,Cc=g[0].length,F=[],out=[],seen=[];let t=0,b=R-1,l=0,r=Cc-1;const push=(x,y,line,side)=>{out.push(g[x][y]);seen.push([x,y]);F.push({mode:'matrix',line,msg:`Visit ${g[x][y]} along the ${side} boundary.`,matrix:g,activeCells:[[x,y]],goodCells:seen.slice(),metricA:out.length,metricB:side,story:[`spiral ${fmt(out)}`]});};while(t<=b&&l<=r){for(let c=l;c<=r;c++)push(t,c,6,'top');t++;for(let x=t;x<=b;x++)push(x,r,7,'right');r--;if(t<=b){for(let c=r;c>=l;c--)push(b,c,8,'bottom');b--;}if(l<=r){for(let x=b;x>=t;x--)push(x,l,9,'left');l++;}}F.push({mode:'matrix',line:11,msg:'Every cell has joined the spiral.',matrix:g,goodCells:seen,metricA:out.length,metricB:'complete',story:[fmt(out)],done:'ok',result:`✓ ${fmt(out)}`});return F;}
  });

  add('set_matrix_zeroes',{
    title:'Set Matrix Zeroes',lc:'73',chips:['Marker Rows + Columns','O(mn) time','In-Place Marking'],
    problem:'If a matrix cell is zero, set its entire row and column to zero.',
    intuition:'First discover every poisoned row and column without mutating evidence. Then sweep again and zero every cell touched by a marker.',
    inputs:[{id:'in-matrix',label:'rows separated by |',value:'1,1,1|1,0,1|1,1,1'}],
    presets:presets([['center',['in-matrix','1,1,1|1,0,1|1,1,1']],['multiple',['in-matrix','0,1,2,0|3,4,5,2|1,3,1,5']],['none',['in-matrix','1,2|3,4']],['single zero',['in-matrix','0']]]),
    code:`class Solution {
    public void setZeroes(int[][] matrix) {
        Set<Integer> rows = new HashSet<>(), cols = new HashSet<>();
        for (int r=0;r<matrix.length;r++)
            for (int c=0;c<matrix[0].length;c++)
                if (matrix[r][c] == 0) { rows.add(r); cols.add(c); }
        for (int r=0;r<matrix.length;r++)
            for (int c=0;c<matrix[0].length;c++)
                if (rows.contains(r) || cols.contains(c)) matrix[r][c] = 0;
    }
}`,
    build(){const g=matrix('in-matrix'),rows=new Set(),cols=new Set(),F=[];for(let r=0;r<g.length;r++)for(let c=0;c<g[0].length;c++)if(g[r][c]===0){rows.add(r);cols.add(c);F.push({mode:'matrix',line:[4,5,6],msg:`Zero at (${r},${c}) marks row ${r} and column ${c}.`,matrix:copy(g),activeCells:[[r,c]],badCells:g.flatMap((row,i)=>row.map((_,j)=>rows.has(i)||cols.has(j)?[i,j]:null).filter(Boolean)),metricA:[...rows].join(','),metricB:[...cols].join(','),story:[`rows ${[...rows]}`,`cols ${[...cols]}`]});}for(let r=0;r<g.length;r++)for(let c=0;c<g[0].length;c++)if(rows.has(r)||cols.has(c)){g[r][c]=0;F.push({mode:'matrix',line:[7,8,9],msg:`(${r},${c}) lies on a marked line, so set it to zero.`,matrix:copy(g),activeCells:[[r,c]],metricA:r,metricB:c,story:['apply markers']});}F.push({mode:'matrix',line:10,msg:'All marked rows and columns are zero.',matrix:g,goodCells:g.flatMap((r,i)=>r.map((_,j)=>[i,j])),metricA:rows.size,metricB:`${cols.size} columns`,done:'ok',result:`✓ ${g.map(r=>fmt(r)).join(' ')}`});return F;}
  });

  add('happy_number',{
    title:'Happy Number',lc:'202',difficulty:'Easy',chips:['Cycle Detection','O(log n) per step','Digit Squares'],
    problem:'Repeatedly replace n with the sum of its squared digits; determine whether the process reaches 1.',
    intuition:'The sequence either reaches 1 or enters a cycle. A visited set turns repetition into a decisive unhappy ending.',
    inputs:[{id:'in-n',label:'number',value:'19'}],
    presets:presets([['happy 19',['in-n','19']],['unhappy 2',['in-n','2']],['one',['in-n','1']],['happy 7',['in-n','7']],['unhappy 20',['in-n','20']]]),
    code:`class Solution {
    public boolean isHappy(int n) {
        Set<Integer> seen = new HashSet<>();
        while (n != 1 && seen.add(n)) {
            int next = 0;
            while (n > 0) { int d=n%10; next += d*d; n/=10; }
            n = next;
        }
        return n == 1;
    }
}`,
    build(){let n=num('in-n'),seen=new Set(),chain=[],F=[];while(n!==1&&!seen.has(n)){seen.add(n);chain.push(n);const ds=String(Math.abs(n)).split('').map(Number),next=ds.reduce((s,d)=>s+d*d,0);F.push({mode:'chain',line:[4,5,6,7],msg:`${n}: ${ds.map(d=>`${d}²`).join(' + ')} = ${next}.`,chain:chain.concat(next),metricA:next,metricB:`${seen.size} seen`,story:ds.map(d=>`${d}²=${d*d}`)});n=next;}if(n===1&&!chain.includes(1))chain.push(1);const ok=n===1;F.push({mode:'chain',line:9,msg:ok?'The chain reaches 1.':'A repeated number reveals a cycle.',chain,metricA:n,metricB:ok?'happy':'cycle',done:ok?'ok':'bad',result:ok?'✓ happy number':'✗ not happy'});return F;}
  });

  add('plus_one',{
    title:'Plus One',lc:'66',difficulty:'Easy',chips:['Carry Propagation','O(n) time','Right-to-Left Digits'],
    problem:'Add one to a non-negative integer stored as an array of digits.',
    intuition:'Start at the ones place. A nine becomes zero and sends a carry left; the first smaller digit absorbs the carry and ends the story.',
    inputs:[{id:'in-digits',label:'digits',value:'1,2,3'}],
    presets:presets([['simple',['in-digits','1,2,3']],['carry',['in-digits','1,2,9']],['all nines',['in-digits','9,9,9']],['zero',['in-digits','0']],['mixed',['in-digits','4,9,9,8']]]),
    code:`class Solution {
    public int[] plusOne(int[] digits) {
        for (int i=digits.length-1;i>=0;i--) {
            if (digits[i] < 9) { digits[i]++; return digits; }
            digits[i] = 0;
        }
        int[] answer = new int[digits.length+1];
        answer[0] = 1;
        return answer;
    }
}`,
    build(){let d=nums('in-digits'),F=[];for(let i=d.length-1;i>=0;i--){if(d[i]<9){d[i]++;F.push({line:4,msg:`Digit ${i} absorbs the carry and becomes ${d[i]}.`,digits:d.slice(),active:i,good:d.map((_,j)=>j>=i?j:-1).filter(j=>j>=0),metricA:d[i],metricB:'carry resolved',story:['+1 here']});F.push({line:4,msg:'Return the updated digits.',digits:d,good:d.map((_,j)=>j),metricA:fmt(d),metricB:'answer',done:'ok',result:`✓ ${fmt(d)}`});return F;}d[i]=0;F.push({line:5,msg:`Digit ${i} was 9: write 0 and carry left.`,digits:d.slice(),active:i,metricA:0,metricB:'carry 1',story:['9 + 1 = 10']});}d=[1,...d];F.push({line:[7,8,9],msg:'Every digit overflowed, so prepend a new 1.',digits:d,active:0,good:d.map((_,i)=>i),metricA:fmt(d),metricB:'new digit',done:'ok',result:`✓ ${fmt(d)}`});return F;}
  });

  add('pow_x_n',{
    title:'Pow(x, n)',lc:'50',chips:['Exponentiation by Squaring','O(log |n|)','Binary Exponent'],
    problem:'Compute x raised to integer power n efficiently.',
    intuition:'Every exponent bit decides whether the current base joins the answer. Square the base and halve the exponent at each step.',
    inputs:[{id:'in-x',label:'base x',value:'2'},{id:'in-n',label:'exponent n',value:'10'}],
    presets:presets([['2¹⁰',['in-x','2'],['in-n','10']],['negative exponent',['in-x','2'],['in-n','-2']],['decimal',['in-x','2.1'],['in-n','3']],['zero power',['in-x','5'],['in-n','0']],['negative base',['in-x','-2'],['in-n','5']]]),
    code:`class Solution {
    public double myPow(double x, int n) {
        long power = Math.abs((long)n);
        double answer = 1;
        while (power > 0) {
            if ((power & 1) == 1) answer *= x;
            x *= x;
            power >>= 1;
        }
        return n < 0 ? 1 / answer : answer;
    }
}`,
    build(){let x=num('in-x'),n=num('in-n'),p=Math.abs(n),ans=1,F=[],chain=[`1`];while(p>0){const odd=p%2===1;if(odd){ans*=x;chain.push(Number(ans.toFixed(8)));}F.push({mode:'chain',line:[5,6],msg:`Power ${p} is ${odd?'odd: multiply answer by '+x:'even: no multiply'}.`,chain:chain.slice(),metricA:Number(ans.toFixed(8)),metricB:`power ${p}`,story:[`bit ${odd?1:0}`,`base ${Number(x.toFixed(8))}`]});x*=x;p=Math.floor(p/2);F.push({mode:'chain',line:[7,8],msg:`Square the base to ${Number(x.toFixed(8))} and halve the power to ${p}.`,chain:chain.slice(),metricA:Number(ans.toFixed(8)),metricB:`power ${p}`,story:['base²','power ÷ 2']});}const out=n<0?1/ans:ans,show=Number(out.toFixed(8));F.push({mode:'chain',line:10,msg:n<0?'Negative exponent: return the reciprocal.':'Return the accumulated product.',chain:chain.concat(show),metricA:show,metricB:'answer',done:'ok',result:`✓ ${show}`});return F;}
  });

  add('multiply_strings',{
    title:'Multiply Strings',lc:'43',chips:['Grade-School Multiplication','O(mn) time','Digit Array'],
    problem:'Multiply two non-negative integer strings without converting them to big integers.',
    intuition:'Every digit pair contributes to one result column. Store ones in i+j+1 and carry tens into i+j, exactly like multiplication on paper.',
    inputs:[{id:'in-a',label:'num1',value:'123'},{id:'in-b',label:'num2',value:'456'}],
    presets:presets([['123×456',['in-a','123'],['in-b','456']],['small',['in-a','2'],['in-b','3']],['zero',['in-a','0'],['in-b','999']],['nines',['in-a','99'],['in-b','99']],['different lengths',['in-a','314'],['in-b','12']]]),
    code:`class Solution {
    public String multiply(String a, String b) {
        int[] out = new int[a.length()+b.length()];
        for (int i=a.length()-1;i>=0;i--)
            for (int j=b.length()-1;j>=0;j--) {
                int product=(a.charAt(i)-'0')*(b.charAt(j)-'0')+out[i+j+1];
                out[i+j+1]=product%10;
                out[i+j]+=product/10;
            }
        return digitsToString(out);
    }
}`,
    build(){const a=val('in-a'),b=val('in-b'),out=Array(a.length+b.length).fill(0),F=[];for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--){const product=Number(a[i])*Number(b[j])+out[i+j+1];out[i+j+1]=product%10;out[i+j]+=Math.floor(product/10);F.push({line:[4,5,6,7,8],msg:`${a[i]} × ${b[j]} plus column carry = ${product}; write ${product%10}, carry ${Math.floor(product/10)}.`,digits:out.slice(),active:i+j+1,labels:out.map((_,k)=>`col ${k}`),metricA:product,metricB:`${a[i]}×${b[j]}`,story:[`ones ${product%10}`,`carry ${Math.floor(product/10)}`]});}const result=out.join('').replace(/^0+/,'')||'0';F.push({line:10,msg:`Read the result digits as ${result}.`,digits:[...result],good:[...result].map((_,i)=>i),metricA:result,metricB:'product',done:'ok',result:`✓ ${result}`});return F;}
  });

  add('detect_squares',{
    title:'Detect Squares',lc:'2013',chips:['Coordinate Frequency Map','O(points on row)','Duplicate-Aware Counting'],
    problem:'Store points and count axis-aligned squares having a query point as one corner.',
    intuition:'Choose another point on the query’s row; its horizontal distance fixes the two possible vertical sides. Multiply corner frequencies so duplicates count correctly.',
    inputs:[{id:'in-points',label:'stored points x,y separated by |',value:'3,10|11,2|3,2|11,2'},{id:'in-query',label:'query x,y',value:'11,10'}],
    presets:presets([['classic',['in-points','3,10|11,2|3,2|11,2'],['in-query','11,10']],['one square',['in-points','0,0|0,2|2,0'],['in-query','2,2']],['none',['in-points','0,0|1,1|2,2'],['in-query','0,2']],['two sides',['in-points','0,0|2,0|0,2|2,2|0,-2|2,-2'],['in-query','0,0']]]),
    code:`class DetectSquares {
    Map<Point,Integer> count = new HashMap<>();
    public void add(int[] p) { count.merge(new Point(p), 1, Integer::sum); }
    public int count(int[] q) {
        int answer = 0;
        for (Point sameRow : count.keySet()) {
            if (sameRow.y != q[1] || sameRow.x == q[0]) continue;
            int side = sameRow.x - q[0];
            answer += freq(sameRow.x,q[1]+side)*freq(q[0],q[1]+side)*freq(sameRow);
            answer += freq(sameRow.x,q[1]-side)*freq(q[0],q[1]-side)*freq(sameRow);
        }
        return answer;
    }
}`,
    build(){const ps=points('in-points'),q=val('in-query').split(',').map(Number),freq=new Map(),F=[];ps.forEach(p=>freq.set(p.join(','),(freq.get(p.join(','))||0)+1));let ans=0;for(const [k,m]of freq){const p=k.split(',').map(Number);if(p[1]!==q[1]||p[0]===q[0])continue;const side=p[0]-q[0];for(const sign of [1,-1]){const y=q[1]+sign*side,a=[q[0],y],b=[p[0],y],ways=m*(freq.get(a.join(','))||0)*(freq.get(b.join(','))||0);ans+=ways;F.push({mode:'plane',line:[6,7,8,9],msg:`Base ${q}—${p} fixes corners ${a} and ${b}; frequency product contributes ${ways}.`,points:ps,query:q,square:[q,p,b,a],metricA:ans,metricB:`side ${Math.abs(side)}`,story:[`multiplicity ${ways}`,`total ${ans}`]});}}F.push({mode:'plane',line:11,msg:`The query belongs to ${ans} stored squares.`,points:ps,query:q,metricA:ans,metricB:'squares',done:'ok',result:`✓ square count = ${ans}`});return F;}
  });

  function shell(c){document.body.innerHTML=`<nav class="topbar"><a class="back-link" href="../../index.html">← All Problems</a><span class="category-label">Math & Geometry</span><span class="problem-meta"><span class="chip accent">LC ${c.lc}</span><span class="chip ${c.difficulty.toLowerCase()}">${c.difficulty}</span></span></nav><main class="pwrap"><header class="phero"><h1 class="grad-text">${esc(c.title)}</h1><div class="chips">${c.chips.map((x,i)=>`<span class="chip ${i?'':'accent'}">${esc(x)}</span>`).join('')}</div></header><div class="grid2"><section class="card"><h2 class="card-title"><span class="dot"></span>Problem</h2><div class="prose-dark"><p>${esc(c.problem)}</p></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Core Insight</h2><div class="prose-dark"><p>${esc(c.intuition)}</p></div></section></div><div class="gridmain"><section class="card"><h2 class="card-title"><span class="dot"></span>Solution — synced with playback</h2><div id="code-panel" class="code-panel"></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Live Visualization</h2><div id="input-fields" class="grid2 greedy-inputs">${c.inputs.map(x=>`<div class="field"><label for="${x.id}">${esc(x.label)}</label><input id="${x.id}" value="${esc(x.value)}"></div>`).join('')}</div><div class="run-row"><button id="run-btn" class="btn-primary">▶ Run</button><span class="examples-label">Examples</span><span id="preset-row">${c.presets.map((p,i)=>`<button class="preset-btn" data-preset="${i}">${esc(p.label)}</button>`).join('')}</span></div><div id="step-msg" class="step-msg"></div><div class="viz-stage mg-stage"><div class="stage-label">The transformation unfolds here</div><div id="stage-main"></div><div id="stage-story" class="story-lane"></div><div class="state-grid"><div class="state-tile"><div class="k">Value</div><div id="state-a" class="v">-</div></div><div class="state-tile"><div class="k">Operation</div><div id="state-b" class="v">-</div></div></div><div id="result" class="result-banner"></div></div><div id="viz-controls" class="viz-controls"></div></section></div><section class="card section-gap"><h2 class="card-title"><span class="dot"></span>Execution Log</h2><div id="log-panel" class="log-panel"></div></section><section class="card"><div class="explanation-head"><h2 class="card-title"><span class="dot"></span>Full Explanation</h2><button id="narrate-btn" class="preset-btn">🔊 Narrate</button></div><div id="narration" class="prose-dark"><p>${esc(c.intuition)}</p></div></section></main>`;}
  function init(k){const c=C[k];if(!c)throw Error(`Unknown math problem: ${k}`);document.title=`${c.title} — Interactive Visualization`;shell(c);const viz=Viz.init({code:c.code,buildFrames:c.build,render});document.getElementById('run-btn').addEventListener('click',viz.run);document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{Object.entries(c.presets[Number(b.dataset.preset)].values).forEach(([id,v])=>document.getElementById(id).value=v);viz.run();}));document.getElementById('narrate-btn').addEventListener('click',function(){if(speechSynthesis.speaking){speechSynthesis.cancel();this.textContent='🔊 Narrate';return;}const u=new SpeechSynthesisUtterance(document.getElementById('narration').innerText);u.onend=()=>this.textContent='🔊 Narrate';this.textContent='⏹ Stop';speechSynthesis.speak(u);});viz.run();}
  return {init};
})();
