window.BitPage=(function(){
  'use strict';
  const C={},esc=s=>Viz.escapeHtml(String(s)),val=id=>document.getElementById(id).value,num=id=>Number(val(id)),nums=id=>val(id).split(',').map(Number).filter(Number.isFinite);
  const add=(k,o)=>C[k]=Object.assign({key:k,difficulty:'Easy'},o),presets=rows=>rows.map(r=>({label:r[0],values:Object.fromEntries(r.slice(1))}));
  const bits=(n,w=32)=>(n>>>0).toString(2).padStart(w,'0').slice(-w);
  function render(f){
    document.getElementById('stage-main').innerHTML=`<div class="bit-registers">${(f.registers||[]).map(reg=>`<div class="bit-register"><div class="bit-label">${esc(reg.label)}</div><div class="bit-row">${[...reg.bits].map((b,i)=>`<span class="${(reg.active||[]).includes(i)?'active':(reg.good||[]).includes(i)?'ok':''}">${b}<small>${reg.bits.length-1-i}</small></span>`).join('')}</div><div class="bit-decimal">${esc(reg.value??'')}</div></div>`).join('')}</div>`;
    document.getElementById('stage-story').innerHTML=(f.story||[]).map(x=>`<span class="solution-chip">${esc(x)}</span>`).join('');
    document.getElementById('state-a').textContent=f.metricA??'-';document.getElementById('state-b').textContent=f.metricB??'-';
    const r=document.getElementById('result');r.className=`result-banner${f.done?` show ${f.done}`:''}`;r.textContent=f.result||'';
  }
  const reg=(label,n,w=32,active=[],good=[])=>({label,bits:bits(n,w),value:n,active,good});

  add('single_number',{title:'Single Number',lc:'136',chips:['XOR Cancellation','O(n) time','O(1) space'],problem:'Every number appears twice except one; return the unique number.',intuition:'XOR erases equal pairs because x XOR x = 0. Order does not matter, so the accumulator ends as the lone value.',inputs:[{id:'in-arr',label:'nums',value:'4,1,2,1,2'}],presets:presets([['classic',['in-arr','4,1,2,1,2']],['small',['in-arr','2,2,1']],['single',['in-arr','7']],['negative',['in-arr','-1,3,3']]]),code:`class Solution {
    public int singleNumber(int[] nums) {
        int answer = 0;
        for (int n : nums)
            answer ^= n;
        return answer;
    }
}`,build(){const a=nums('in-arr'),F=[];let x=0;a.forEach((n,i)=>{const before=x;x^=n;F.push({line:[3,4,5],msg:`${before} XOR ${n} = ${x}. Equal bit patterns cancel.`,registers:[reg('accumulator before',before),reg(`number ${i}`,n),reg('XOR result',x)],metricA:x,metricB:`item ${i+1}/${a.length}`,story:[`${before} ⊕ ${n} = ${x}`]});});F.push({line:6,msg:`Only ${x} survives cancellation.`,registers:[reg('unique',x,32,[],[...Array(32).keys()])],metricA:x,metricB:'unique',done:'ok',result:`✓ single number = ${x}`});return F;}});

  add('number_of_1_bits',{title:'Number of 1 Bits',lc:'191',chips:['Clear Lowest Set Bit','O(number of 1s)','n & (n-1)'],problem:'Return the Hamming weight of a 32-bit integer.',intuition:'Subtracting one flips the lowest set bit and everything below it. AND with the original clears exactly that one bit.',inputs:[{id:'in-n',label:'unsigned integer',value:'11'}],presets:presets([['11',['in-n','11']],['one',['in-n','1']],['all low bits',['in-n','255']],['power of two',['in-n','1024']],['zero',['in-n','0']]]),code:`class Solution {
    public int hammingWeight(int n) {
        int count = 0;
        while (n != 0) {
            n &= n - 1;
            count++;
        }
        return count;
    }
}`,build(){let n=num('in-n')>>>0,count=0,F=[];while(n!==0){const next=(n&(n-1))>>>0;F.push({line:[4,5,6],msg:`${n} & ${n-1} clears the lowest 1-bit.`,registers:[reg('n',n),reg('n - 1',(n-1)>>>0),reg('next',next)],metricA:count+1,metricB:'ones cleared',story:[`${n} → ${next}`]});n=next;count++;}F.push({line:8,msg:`Cleared ${count} set bits.`,registers:[reg('zero',0)],metricA:count,metricB:'Hamming weight',done:'ok',result:`✓ 1-bits = ${count}`});return F;}});

  add('counting_bits',{title:'Counting Bits',lc:'338',chips:['Half-Number Recurrence','O(n) time','Reuse dp[i >> 1]'],problem:'For every integer from 0 through n, return its number of set bits.',intuition:'Shifting i right removes its last bit. Its count is the smaller solved count plus that last bit.',inputs:[{id:'in-n',label:'n',value:'5'}],presets:presets([['five',['in-n','5']],['two',['in-n','2']],['zero',['in-n','0']],['eight',['in-n','8']],['sixteen',['in-n','16']]]),code:`class Solution {
    public int[] countBits(int n) {
        int[] dp = new int[n + 1];
        for (int i=1;i<=n;i++)
            dp[i] = dp[i >> 1] + (i & 1);
        return dp;
    }
}`,build(){const n=num('in-n'),dp=Array(n+1).fill(0),F=[];for(let i=1;i<=n;i++){dp[i]=dp[i>>1]+(i&1);F.push({line:[3,4,5],msg:`count[${i}] = count[${i>>1}] + lastBit(${i&1}) = ${dp[i]}.`,registers:[reg(`i = ${i}`,i,8),reg(`i >> 1 = ${i>>1}`,i>>1,8)],metricA:dp[i],metricB:`i ${i}`,story:[`dp[${i>>1}] ${dp[i>>1]}`,`last bit ${i&1}`,`counts [${dp.slice(0,i+1)}]`]});}F.push({line:6,msg:`All counts through ${n} are ready.`,registers:[reg('n',n,8)],metricA:`[${dp}]`,metricB:'answer',done:'ok',result:`✓ [${dp.join(', ')}]`});return F;}});

  add('reverse_bits',{title:'Reverse Bits',lc:'190',chips:['32-Step Shift','O(32) time','Mirror Bit Positions'],problem:'Reverse all 32 bits of an unsigned integer.',intuition:'Read n from right to left while building the answer from left to right: shift answer, copy n’s last bit, then shift n.',inputs:[{id:'in-n',label:'unsigned integer',value:'43261596'}],presets:presets([['classic',['in-n','43261596']],['one',['in-n','1']],['zero',['in-n','0']],['alternating',['in-n','2863311530']]]),code:`class Solution {
    public int reverseBits(int n) {
        int answer = 0;
        for (int i=0;i<32;i++) {
            answer = (answer << 1) | (n & 1);
            n >>>= 1;
        }
        return answer;
    }
}`,build(){let n=num('in-n')>>>0,ans=0,F=[];for(let i=0;i<32;i++){const bit=n&1;ans=((ans<<1)|bit)>>>0;n=n>>>1;F.push({line:[4,5,6],msg:`Step ${i+1}: copy bit ${bit} into the growing reversed register.`,registers:[reg('remaining n',n),reg('reversed',ans,32,[31-i])],metricA:ans,metricB:`${i+1}/32`,story:[`copied ${bit}`]});}F.push({line:8,msg:`All 32 positions are reversed: ${ans}.`,registers:[reg('answer',ans,32,[],[...Array(32).keys()])],metricA:ans,metricB:'unsigned',done:'ok',result:`✓ reversed = ${ans}`});return F;}});

  add('missing_number',{title:'Missing Number',lc:'268',chips:['Index-Value XOR','O(n) time','Complete Range Cancellation'],problem:'An array contains distinct values from 0 through n with one missing; return it.',intuition:'XOR every expected index and every present value. Matching numbers disappear, leaving only the missing member.',inputs:[{id:'in-arr',label:'nums',value:'3,0,1'}],presets:presets([['classic',['in-arr','3,0,1']],['missing two',['in-arr','0,1']],['missing last',['in-arr','0,1,2,3']],['single empty',['in-arr','']],['mixed',['in-arr','9,6,4,2,3,5,7,0,1']]]),code:`class Solution {
    public int missingNumber(int[] nums) {
        int answer = nums.length;
        for (int i=0;i<nums.length;i++)
            answer ^= i ^ nums[i];
        return answer;
    }
}`,build(){const a=nums('in-arr'),F=[];let x=a.length;for(let i=0;i<a.length;i++){const before=x;x^=i^a[i];F.push({line:[3,4,5],msg:`Accumulator ${before} XOR index ${i} XOR value ${a[i]} = ${x}.`,registers:[reg('before',before,8),reg('index',i,8),reg('value',a[i],8),reg('result',x,8)],metricA:x,metricB:`pair ${i}`,story:[`${before} ⊕ ${i} ⊕ ${a[i]}`]});}F.push({line:6,msg:`All matched range members cancel, leaving ${x}.`,registers:[reg('missing',x,8,[],[...Array(8).keys()])],metricA:x,metricB:'missing',done:'ok',result:`✓ missing = ${x}`});return F;}});

  add('sum_of_two_integers',{title:'Sum of Two Integers',lc:'371',difficulty:'Medium',chips:['XOR Sum + AND Carry','O(32) time','No + Operator'],problem:'Add two integers without using + or -.',intuition:'XOR adds bits without carry. AND finds positions that produce carry; shift that carry left and repeat until none remains.',inputs:[{id:'in-a',label:'a',value:'1'},{id:'in-b',label:'b',value:'2'}],presets:presets([['1 + 2',['in-a','1'],['in-b','2']],['carry chain',['in-a','7'],['in-b','5']],['negative',['in-a','-2'],['in-b','3']],['both negative',['in-a','-4'],['in-b','-7']],['zero',['in-a','0'],['in-b','9']]]),code:`class Solution {
    public int getSum(int a, int b) {
        while (b != 0) {
            int sum = a ^ b;
            int carry = (a & b) << 1;
            a = sum;
            b = carry;
        }
        return a;
    }
}`,build(){let a=num('in-a')|0,b=num('in-b')|0,F=[],guard=0;while(b!==0&&guard++<32){const sum=a^b,carry=(a&b)<<1;F.push({line:[3,4,5,6,7],msg:`XOR gives partial sum ${sum}; shared 1-bits create carry ${carry}.`,registers:[reg('a',a),reg('b / carry',b),reg('a XOR b',sum),reg('(a AND b) << 1',carry)],metricA:sum,metricB:`carry ${carry}`,story:['XOR = sum without carry','AND << 1 = carry']});a=sum;b=carry;}F.push({line:9,msg:`Carry is zero; the signed 32-bit result is ${a}.`,registers:[reg('sum',a,32,[],[...Array(32).keys()])],metricA:a,metricB:'answer',done:'ok',result:`✓ sum = ${a}`});return F;}});

  add('reverse_integer',{title:'Reverse Integer',lc:'7',difficulty:'Medium',chips:['Pop and Push Digits','O(log |x|)','32-Bit Overflow Guard'],problem:'Reverse a signed 32-bit integer; return zero if the reversed value overflows.',intuition:'Pop the last decimal digit and push it onto the result. Check bounds before each push because overflow cannot be repaired afterward.',inputs:[{id:'in-x',label:'integer',value:'123'}],presets:presets([['positive',['in-x','123']],['negative',['in-x','-123']],['trailing zero',['in-x','120']],['overflow',['in-x','1534236469']],['single',['in-x','7']]]),code:`class Solution {
    public int reverse(int x) {
        int answer = 0;
        while (x != 0) {
            int digit = x % 10;
            x /= 10;
            if (answer > Integer.MAX_VALUE/10 || answer < Integer.MIN_VALUE/10)
                return 0;
            answer = answer * 10 + digit;
        }
        return answer;
    }
}`,build(){let x=num('in-x')|0,ans=0,F=[];while(x!==0){const digit=x%10|0;x=(x/10)|0;const overflow=ans>214748364||(ans===214748364&&digit>7)||ans< -214748364||(ans===-214748364&&digit< -8);F.push({line:[4,5,6,7,8],msg:`Pop digit ${digit}; candidate push is ${ans} × 10 + ${digit}.`,registers:[reg('remaining x',x),reg('current answer',ans),reg('digit',digit,8)],metricA:ans,metricB:`digit ${digit}`,story:['pop rightmost','push onto answer']});if(overflow){F.push({line:8,msg:'That push would cross the signed 32-bit boundary.',registers:[reg('overflow candidate',ans)],metricA:0,metricB:'overflow',done:'bad',result:'✗ overflow → 0'});return F;}ans=ans*10+digit;}F.push({line:11,msg:`Digits reversed to ${ans}.`,registers:[reg('answer',ans,32,[],[...Array(32).keys()])],metricA:ans,metricB:'reversed',done:'ok',result:`✓ reversed = ${ans}`});return F;}});

  function shell(c){document.body.innerHTML=`<nav class="topbar"><a class="back-link" href="../../index.html">← All Problems</a><span class="category-label">Bit Manipulation</span><span class="problem-meta"><span class="chip accent">LC ${c.lc}</span><span class="chip ${c.difficulty.toLowerCase()}">${c.difficulty}</span></span></nav><main class="pwrap"><header class="phero"><h1 class="grad-text">${esc(c.title)}</h1><div class="chips">${c.chips.map((x,i)=>`<span class="chip ${i?'':'accent'}">${esc(x)}</span>`).join('')}</div></header><div class="grid2"><section class="card"><h2 class="card-title"><span class="dot"></span>Problem</h2><div class="prose-dark"><p>${esc(c.problem)}</p></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Bit Insight</h2><div class="prose-dark"><p>${esc(c.intuition)}</p></div></section></div><div class="gridmain"><section class="card"><h2 class="card-title"><span class="dot"></span>Solution — synced with playback</h2><div id="code-panel" class="code-panel"></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>Live Visualization</h2><div id="input-fields" class="grid2 greedy-inputs">${c.inputs.map(x=>`<div class="field"><label for="${x.id}">${esc(x.label)}</label><input id="${x.id}" value="${esc(x.value)}"></div>`).join('')}</div><div class="run-row"><button id="run-btn" class="btn-primary">▶ Run</button><span class="examples-label">Examples</span><span id="preset-row">${c.presets.map((p,i)=>`<button class="preset-btn" data-preset="${i}">${esc(p.label)}</button>`).join('')}</span></div><div id="step-msg" class="step-msg"></div><div class="viz-stage bit-stage"><div class="stage-label">Binary registers — bit 31 on the left, bit 0 on the right</div><div id="stage-main"></div><div id="stage-story" class="story-lane"></div><div class="state-grid"><div class="state-tile"><div class="k">Value</div><div id="state-a" class="v">-</div></div><div class="state-tile"><div class="k">Operation</div><div id="state-b" class="v">-</div></div></div><div id="result" class="result-banner"></div></div><div id="viz-controls" class="viz-controls"></div></section></div><section class="card section-gap"><h2 class="card-title"><span class="dot"></span>Execution Log</h2><div id="log-panel" class="log-panel"></div></section><section class="card"><div class="explanation-head"><h2 class="card-title"><span class="dot"></span>Full Explanation</h2></div><div id="narration" class="prose-dark"><p>${esc(c.intuition)}</p></div></section></main>`;}
  function init(k){const c=C[k];if(!c)throw Error(`Unknown bit problem: ${k}`);document.title=`${c.title} — Interactive Visualization`;shell(c);const viz=Viz.init({code:c.code,buildFrames:c.build,render});document.getElementById('run-btn').addEventListener('click',viz.run);document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{Object.entries(c.presets[Number(b.dataset.preset)].values).forEach(([id,v])=>document.getElementById(id).value=v);viz.run();}));viz.run();}
  return {init};
})();
