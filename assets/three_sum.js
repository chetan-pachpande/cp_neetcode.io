window.ThreeSumPage=(function(){
  'use strict';
  const esc=s=>Viz.escapeHtml(String(s)),nums=()=>document.getElementById('in-arr').value.split(',').map(Number).filter(Number.isFinite);
  const JAVA=`class Solution {
    public List<List<Integer>> threeSum(int[] nums) {
        Arrays.sort(nums);
        List<List<Integer>> out = new ArrayList<>();
        for (int i=0;i<nums.length-2;i++) {
            if (i>0 && nums[i]==nums[i-1]) continue;
            int left=i+1, right=nums.length-1;
            while (left<right) {
                int sum=nums[i]+nums[left]+nums[right];
                if (sum<0) left++;
                else if (sum>0) right--;
                else {
                    out.add(List.of(nums[i],nums[left],nums[right]));
                    left++; right--;
                    while (left<right && nums[left]==nums[left-1]) left++;
                }
            }
        }
        return out;
    }
}`;
  function build(){
    const a=nums().sort((x,y)=>x-y),F=[],out=[];F.push({line:3,msg:`Sort the array: [${a}].`,a,i:-1,l:-1,r:-1,out:[]});
    for(let i=0;i<a.length-2;i++){if(i>0&&a[i]===a[i-1]){F.push({line:6,msg:`Skip duplicate anchor ${a[i]} at ${i}.`,a,i,l:-1,r:-1,out:out.slice()});continue;}let l=i+1,r=a.length-1;
      while(l<r){const sum=a[i]+a[l]+a[r];F.push({line:[7,8,9],msg:`${a[i]} + ${a[l]} + ${a[r]} = ${sum}.`,a,i,l,r,sum,out:out.slice()});if(sum<0)l++;else if(sum>0)r--;else{out.push([a[i],a[l],a[r]]);F.push({line:[12,13,14],msg:`Found [${out.at(-1)}]. Move both pointers and skip duplicates.`,a,i,l,r,sum,out:out.slice(),found:true});l++;r--;while(l<r&&a[l]===a[l-1])l++;}}
    }F.push({line:19,msg:`All unique zero-sum triplets are collected.`,a,i:-1,l:-1,r:-1,out,done:'ok',result:`✓ ${JSON.stringify(out)}`});return F;
  }
  function render(f){
    document.getElementById('stage-array').innerHTML=Viz.cells(f.a.map((v,j)=>({v,idx:j,cls:j===f.i?'warn':j===f.l||j===f.r?'active':f.found&&[f.i,f.l,f.r].includes(j)?'ok':''})));
    document.getElementById('pointer-row').innerHTML=f.i>=0?`<span class="solution-chip">anchor i=${f.i}</span><span class="solution-chip">left=${f.l}</span><span class="solution-chip">right=${f.r}</span><span class="solution-chip">sum=${f.sum??'-'}</span>`:'';
    document.getElementById('triplet-row').innerHTML=(f.out||[]).map(x=>`<span class="solution-chip">[${esc(x)}]</span>`).join('');
    const r=document.getElementById('result');r.className=`result-banner${f.done?' show ok':''}`;r.textContent=f.result||'';
  }
  function init(){
    document.body.innerHTML=`<nav class="topbar"><a class="back-link" href="../../index.html">← All Problems</a><span class="category-label">Two Pointers</span><span class="problem-meta"><span class="chip accent">LC 15</span><span class="chip medium">Medium</span></span></nav><main class="pwrap"><header class="phero"><h1 class="grad-text">Three Sum</h1><div class="chips"><span class="chip accent">Sort + Two Pointers</span><span class="chip">O(n²) time</span><span class="chip">Duplicate Safe</span></div></header><div class="grid2"><section class="card"><h2 class="card-title"><span class="dot"></span>Problem</h2><div class="prose-dark"><p>Return every unique triplet whose values sum to zero.</p></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Core Insight</h2><div class="prose-dark"><p>Sort first. Fix one anchor, then squeeze a left/right pair toward the target. The sum tells exactly which pointer must move.</p></div></section></div><div class="gridmain"><section class="card"><h2 class="card-title"><span class="dot"></span>Solution — synced with playback</h2><div id="code-panel" class="code-panel"></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Live Visualization</h2><div class="field"><label for="in-arr">nums</label><input id="in-arr" value="-1,0,1,2,-1,-4"></div><div class="run-row"><button id="run-btn" class="btn-primary">▶ Run</button><span class="examples-label">Examples</span><span id="preset-row"><button class="preset-btn" data-v="-1,0,1,2,-1,-4">classic</button><button class="preset-btn" data-v="0,0,0,0">duplicates</button><button class="preset-btn" data-v="1,2,-2,-1">none</button><button class="preset-btn" data-v="-2,0,1,1,2">two results</button></span></div><div id="step-msg" class="step-msg"></div><div class="viz-stage pointer-stage"><div class="stage-label">Sorted array and pointer positions</div><div id="stage-array" class="cell-row has-idx"></div><div id="pointer-row" class="story-lane"></div><div class="stage-label">Confirmed unique triplets</div><div id="triplet-row" class="story-lane"></div><div id="result" class="result-banner"></div></div><div id="viz-controls" class="viz-controls"></div></section></div><section class="card section-gap"><h2 class="card-title"><span class="dot"></span>Execution Log</h2><div id="log-panel" class="log-panel"></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Full Explanation</h2><div class="prose-dark"><p>Sorting makes pointer movement directional: a negative sum needs a larger left value, while a positive sum needs a smaller right value. Skipping repeated anchors and repeated left values prevents duplicate triplets.</p></div></section></main>`;
    const viz=Viz.init({code:JAVA,buildFrames:build,render});document.getElementById('run-btn').addEventListener('click',viz.run);document.querySelectorAll('[data-v]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('in-arr').value=b.dataset.v;viz.run();}));viz.run();
  }
  return {init,build};
})();
