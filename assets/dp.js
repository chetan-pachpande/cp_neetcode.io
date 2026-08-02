window.DPPage = (function () {
  'use strict';

  const C = {};
  const esc = s => Viz.escapeHtml(String(s));
  const val = id => document.getElementById(id).value;
  const nums = id => val(id).split(',').map(x => Number(x.trim())).filter(Number.isFinite);
  const words = id => val(id).split(',').map(x => x.trim()).filter(Boolean);
  const copy = a => a.map(r => Array.isArray(r) ? r.slice() : r);
  const fmt = a => `[${a.join(', ')}]`;
  const key = (r, c) => `${r},${c}`;
  function add(k, o) { C[k] = Object.assign({ key: k, difficulty: 'Medium' }, o); }
  function presets(rows) {
    return rows.map(r => ({ label: r[0], values: Object.fromEntries(r.slice(1)) }));
  }
  function frame(base, extra) { return Object.assign({}, base, extra || {}); }

  function render(f) {
    const mount = document.getElementById('stage-main');
    if (f.matrix) {
      const rows = f.matrix.length, cols = Math.max(0, ...f.matrix.map(r => r.length));
      const active = f.active ? key(f.active[0], f.active[1]) : '';
      const deps = new Set((f.deps || []).map(x => key(x[0], x[1])));
      const good = new Set((f.good || []).map(x => key(x[0], x[1])));
      let html = `<div class="dp-matrix" style="--cols:${cols}">`;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const k = key(r, c), v = f.matrix[r]?.[c];
        const cls = k === active ? 'active' : deps.has(k) ? 'dep' : good.has(k) ? 'ok' : v == null ? 'dim' : '';
        const label = f.cellLabels?.[r]?.[c];
        html += `<div class="dp-cell ${cls}"><span>${esc(v == null ? '·' : typeof v === 'boolean' ? (v ? 'T' : 'F') : v)}</span>${label != null ? `<small>${esc(label)}</small>` : ''}</div>`;
      }
      html += '</div>';
      mount.innerHTML = html;
    } else {
      const values = f.values || [], deps = new Set(f.deps || []), good = new Set(f.good || []);
      mount.innerHTML = `<div class="dp-timeline">${values.map((v, i) => {
        const cls = i === f.active ? 'active' : deps.has(i) ? 'dep' : good.has(i) ? 'ok' : v == null ? 'dim' : '';
        return `<div class="dp-column ${cls}"><div class="dp-value">${esc(v == null ? '·' : typeof v === 'boolean' ? (v ? 'T' : 'F') : v)}</div><div class="dp-index">${esc(f.labels?.[i] ?? i)}</div></div>`;
      }).join('')}</div>`;
    }
    document.getElementById('stage-story').innerHTML = (f.story || []).map(x => `<span class="solution-chip">${esc(x)}</span>`).join('');
    document.getElementById('state-a').textContent = f.metricA ?? '-';
    document.getElementById('state-b').textContent = f.metricB ?? '-';
    const result = document.getElementById('result');
    result.className = `result-banner${f.done ? ` show ${f.done}` : ''}`;
    result.textContent = f.result || '';
  }

  add('min_cost_climbing_stairs', {
    title: 'Min Cost Climbing Stairs', lc: '746', difficulty: 'Easy',
    chips: ['Rolling Cost DP', 'O(n) time', 'O(n) visual table'],
    problem: 'Pay the cost of each visited step and reach the top as cheaply as possible.',
    intuition: 'The cheapest arrival at step i comes from exactly one or two steps below. Compare both paid routes and keep only the cheaper history.',
    inputs: [{ id: 'in-arr', label: 'cost', value: '10,15,20' }],
    presets: presets([['classic', ['in-arr','10,15,20']], ['long', ['in-arr','1,100,1,1,1,100,1,1,100,1']], ['two steps', ['in-arr','5,8']], ['flat', ['in-arr','3,3,3,3']], ['zigzag', ['in-arr','9,1,9,1,9']]]),
    code: `class Solution {
    public int minCostClimbingStairs(int[] cost) {
        int[] dp = new int[cost.length + 1];
        for (int i = 2; i <= cost.length; i++) {
            dp[i] = Math.min(dp[i - 1] + cost[i - 1],
                             dp[i - 2] + cost[i - 2]);
        }
        return dp[cost.length];
    }
}`,
    build() {
      const a = nums('in-arr'), dp = Array(a.length + 1).fill(null), F = []; dp[0] = dp[1] = 0;
      F.push({ line: 3, msg: 'Standing before either first step costs nothing.', values: dp.slice(), active: 1, good: [0,1], labels: dp.map((_,i)=>`top ${i}`), metricA: 0, metricB: 'base', story: ['dp[0] = dp[1] = 0'] });
      for (let i=2;i<=a.length;i++) { const one=dp[i-1]+a[i-1], two=dp[i-2]+a[i-2]; dp[i]=Math.min(one,two); F.push({ line:[4,5,6], msg:`Top ${i}: min(${dp[i-1]} + ${a[i-1]}, ${dp[i-2]} + ${a[i-2]}) = ${dp[i]}.`, values:dp.slice(), active:i, deps:[i-1,i-2], labels:dp.map((_,j)=>j===a.length?'top':j), metricA:dp[i], metricB:one<=two?'1-step route':'2-step route', story:[`one step ${one}`,`two steps ${two}`] }); }
      F.push({ line:8,msg:`The cheapest route costs ${dp[a.length]}.`,values:dp,active:a.length,good:[a.length],labels:dp.map((_,j)=>j===a.length?'top':j),metricA:dp[a.length],metricB:'minimum',story:['top reached'],done:'ok',result:`✓ minimum cost = ${dp[a.length]}` }); return F;
    }
  });

  add('house_robber_ii', {
    title:'House Robber II',lc:'213',chips:['Two Linear DP Runs','O(n) time','Circular Constraint'],
    problem:'Rob houses arranged in a circle without taking adjacent houses.',
    intuition:'The first and last houses touch, so they cannot both appear. Solve two straight streets: exclude the last, then exclude the first.',
    inputs:[{id:'in-arr',label:'house values',value:'2,3,2'}],
    presets:presets([['classic',['in-arr','2,3,2']],['four',['in-arr','1,2,3,1']],['single',['in-arr','7']],['skip ends',['in-arr','8,1,9,1,8']],['mixed',['in-arr','4,1,2,7,5,3,1']]]),
    code:`class Solution {
    public int rob(int[] nums) {
        if (nums.length == 1) return nums[0];
        return Math.max(robLine(nums, 0, nums.length - 2),
                        robLine(nums, 1, nums.length - 1));
    }
    private int robLine(int[] a, int left, int right) {
        int prev2 = 0, prev1 = 0;
        for (int i = left; i <= right; i++) {
            int next = Math.max(prev1, prev2 + a[i]);
            prev2 = prev1; prev1 = next;
        }
        return prev1;
    }
}`,
    build(){
      const a=nums('in-arr'),F=[]; if(a.length===1)return [{line:3,msg:'One house has no circular conflict.',values:a,active:0,good:[0],metricA:a[0],metricB:'only house',story:['take it'],done:'ok',result:`✓ maximum loot = ${a[0]}`}];
      const run=(l,r,name)=>{let p2=0,p1=0,dp=Array(a.length).fill(null);for(let i=l;i<=r;i++){const take=p2+a[i],skip=p1,n=Math.max(take,skip);dp[i]=n;F.push({line:[9,10],msg:`${name}, house ${i}: take ${take} or skip ${skip}; keep ${n}.`,values:dp.slice(),active:i,deps:[i-1,i-2].filter(x=>x>=l),labels:a,metricA:n,metricB:name,story:[`take ${take}`,`skip ${skip}`]});p2=p1;p1=n;}return p1;};
      const x=run(0,a.length-2,'exclude last'),y=run(1,a.length-1,'exclude first'),ans=Math.max(x,y);
      F.push({line:[4,5],msg:`Compare both legal streets: ${x} versus ${y}.`,values:a,metricA:ans,metricB:x>=y?'exclude last':'exclude first',story:[`max(${x}, ${y})`],done:'ok',result:`✓ maximum loot = ${ans}`});return F;
    }
  });

  function palindromeConfig(countOnly) {
    return {
      title:countOnly?'Palindromic Substrings':'Longest Palindromic Substring',lc:countOnly?'647':'5',
      chips:['Expand Around Centers','O(n²) time','O(1) state'],
      problem:countOnly?'Count every palindromic substring.':'Return the longest palindromic substring.',
      intuition:'Every palindrome has a center. Expand outward from each character and each gap; matching edges keep the mirror alive.',
      inputs:[{id:'in-s',label:'string',value:countOnly?'aaa':'babad'}],
      presets:presets((countOnly?[['triple',['in-s','aaa']],['distinct',['in-s','abc']],['mixed',['in-s','ababa']],['pair',['in-s','aa']]]:[['classic',['in-s','babad']],['even',['in-s','cbbd']],['single',['in-s','a']],['nested',['in-s','forgeeksskeegfor']],['none long',['in-s','abcd']]])),
      code:countOnly?`class Solution {
    public int countSubstrings(String s) {
        int count = 0;
        for (int center = 0; center < s.length(); center++) {
            count += expand(s, center, center);
            count += expand(s, center, center + 1);
        }
        return count;
    }
}`:`class Solution {
    public String longestPalindrome(String s) {
        int bestL = 0, bestR = 0;
        for (int center = 0; center < s.length(); center++) {
            expandOddAndEvenFrom(center);
            if (currentLength > bestR - bestL + 1)
                saveCurrentAsBest();
        }
        return s.substring(bestL, bestR + 1);
    }
}`,
      build(){
        const ch=[...val('in-s')],F=[];let count=0,bL=0,bR=Math.max(0,ch.length?0:-1),good=[];
        for(let c=0;c<ch.length;c++)for(const pair of [[c,c],[c,c+1]]){let [l,r]=pair;while(l>=0&&r<ch.length&&ch[l]===ch[r]){count++;good.push(...Array.from({length:r-l+1},(_,i)=>l+i));if(r-l>bR-bL){bL=l;bR=r;}F.push({line:countOnly?[5,6]:[4,5,6],msg:`Mirror match at ${l} and ${r}: “${ch.slice(l,r+1).join('')}” is a palindrome.`,values:ch,active:r,deps:[l,r],good:[...new Set(countOnly?good:Array.from({length:bR-bL+1},(_,i)=>bL+i))],labels:ch.map((_,i)=>i),metricA:countOnly?count:r-l+1,metricB:countOnly?'palindromes':ch.slice(bL,bR+1).join(''),story:[`center ${(l+r)/2}`,`range ${l}…${r}`]});l--;r++;}}
        const ans=countOnly?count:ch.slice(bL,bR+1).join('');
        F.push({line:countOnly?8:9,msg:countOnly?`Counted ${count} palindromic substrings.`:`The longest mirror is “${ans}”.`,values:ch,good:countOnly?[...new Set(good)]:Array.from({length:bR-bL+1},(_,i)=>bL+i),metricA:ans,metricB:countOnly?'total':'longest',story:['all centers explored'],done:'ok',result:countOnly?`✓ count = ${count}`:`✓ longest = “${ans}”`});return F;
      }
    };
  }
  add('longest_palindromic_substring',palindromeConfig(false));
  add('palindromic_substrings',palindromeConfig(true));

  add('decode_ways',{
    title:'Decode Ways',lc:'91',chips:['Prefix DP','O(n) time','Two Valid Cuts'],
    problem:'Count how many ways a digit string maps to letters 1 through 26.',
    intuition:'A decoded prefix can end with one valid digit or one valid two-digit number. Add the counts from those earlier cut points.',
    inputs:[{id:'in-s',label:'digits',value:'226'}],
    presets:presets([['classic',['in-s','226']],['twelve',['in-s','12']],['leading zero',['in-s','06']],['zero inside',['in-s','2101']],['many',['in-s','11106']]]),
    code:`class Solution {
    public int numDecodings(String s) {
        int[] dp = new int[s.length() + 1];
        dp[0] = 1;
        dp[1] = s.charAt(0) == '0' ? 0 : 1;
        for (int i = 2; i <= s.length(); i++) {
            if (s.charAt(i - 1) != '0') dp[i] += dp[i - 1];
            int two = Integer.parseInt(s.substring(i - 2, i));
            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
        }
        return dp[s.length()];
    }
}`,
    build(){const s=val('in-s'),dp=Array(s.length+1).fill(0),F=[];dp[0]=1;if(s.length)dp[1]=s[0]==='0'?0:1;F.push({line:[3,4,5],msg:`Seed empty prefix with 1 way; first digit gives ${dp[1]} way.`,values:dp.slice(),active:1,deps:[0],labels:['∅',...s],metricA:dp[1],metricB:'base',story:['empty prefix = 1']});for(let i=2;i<=s.length;i++){const one=s[i-1]!=='0',two=Number(s.slice(i-2,i));if(one)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];F.push({line:[7,8,9],msg:`Prefix “${s.slice(0,i)}”: ${one?'use '+s[i-1]:'single blocked'}; ${two>=10&&two<=26?'use '+two:'pair blocked'} → ${dp[i]} ways.`,values:dp.slice(),active:i,deps:[one?i-1:null,two>=10&&two<=26?i-2:null].filter(x=>x!=null),labels:['∅',...s],metricA:dp[i],metricB:`prefix ${i}`,story:[one?`1-digit +${dp[i-1]}`:'1-digit invalid',two>=10&&two<=26?`2-digit +${dp[i-2]}`:'2-digit invalid']});}const ans=dp[s.length]||0;F.push({line:11,msg:`The full string has ${ans} decodings.`,values:dp,active:s.length,good:[s.length],labels:['∅',...s],metricA:ans,metricB:'ways',story:['full prefix'],done:ans?'ok':'bad',result:`${ans?'✓':'✗'} decodings = ${ans}`});return F;}
  });

  add('coin_change',{
    title:'Coin Change',lc:'322',chips:['Minimum-Coin DP','O(amount × coins)','Unbounded Choices'],
    problem:'Return the fewest coins needed to make an amount, or -1.',
    intuition:'For every reachable amount, try placing each coin last. The best predecessor plus one coin becomes the new minimum.',
    inputs:[{id:'in-coins',label:'coins',value:'1,2,5'},{id:'in-amount',label:'amount',value:'11'}],
    presets:presets([['classic',['in-coins','1,2,5'],['in-amount','11']],['impossible',['in-coins','2'],['in-amount','3']],['exact',['in-coins','2,4'],['in-amount','8']],['zero',['in-coins','1,3'],['in-amount','0']],['mixed',['in-coins','2,5,10,1'],['in-amount','27']]]),
    code:`class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int coin : coins)
                if (coin <= a) dp[a] = Math.min(dp[a], 1 + dp[a - coin]);
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
    build(){const cs=nums('in-coins'),amount=Number(val('in-amount')),inf=amount+1,dp=Array(amount+1).fill(inf),F=[];dp[0]=0;for(let a=1;a<=amount;a++)for(const c of cs)if(c<=a){const old=dp[a],cand=dp[a-c]+1;dp[a]=Math.min(dp[a],cand);F.push({line:[7,8],msg:`Amount ${a}, coin ${c}: predecessor ${a-c} needs ${dp[a-c]} coins; candidate ${cand>=inf?'∞':cand}.`,values:dp.map(x=>x>=inf?'∞':x),active:a,deps:[a-c],metricA:dp[a]>=inf?'∞':dp[a],metricB:`coin ${c}`,story:[`dp[${a-c}] + 1`,old!==dp[a]?'new minimum':'keep minimum']});}const ans=dp[amount]>=inf?-1:dp[amount];F.push({line:9,msg:ans<0?'The target amount remains unreachable.':`The minimum is ${ans} coins.`,values:dp.map(x=>x>=inf?'∞':x),active:amount,good:ans<0?[]:[amount],metricA:ans,metricB:'answer',story:['target state'],done:ans<0?'bad':'ok',result:ans<0?'✗ impossible':`✓ minimum coins = ${ans}`});return F;}
  });

  add('maximum_product_subarray',{
    title:'Maximum Product Subarray',lc:'152',chips:['Track Max + Min','O(n) time','Sign-Flip DP'],
    problem:'Find the contiguous subarray with the largest product.',
    intuition:'A negative number swaps fortunes: yesterday’s smallest product may become today’s largest. Carry both extremes.',
    inputs:[{id:'in-arr',label:'nums',value:'2,3,-2,4'}],
    presets:presets([['classic',['in-arr','2,3,-2,4']],['negative pair',['in-arr','-2,0,-1']],['flip',['in-arr','-2,3,-4']],['single',['in-arr','-3']],['zeros',['in-arr','0,2,0,3,-2']]]),
    code:`class Solution {
    public int maxProduct(int[] nums) {
        int high = nums[0], low = nums[0], answer = nums[0];
        for (int i = 1; i < nums.length; i++) {
            int oldHigh = high;
            high = Math.max(nums[i], Math.max(high * nums[i], low * nums[i]));
            low = Math.min(nums[i], Math.min(oldHigh * nums[i], low * nums[i]));
            answer = Math.max(answer, high);
        }
        return answer;
    }
}`,
    build(){const a=nums('in-arr'),F=[];let hi=a[0],lo=a[0],ans=a[0];F.push({line:3,msg:`Start with max = min = ${a[0]}.`,values:a,active:0,good:[0],labels:a,metricA:hi,metricB:lo,story:['high = low']});for(let i=1;i<a.length;i++){const oh=hi,ol=lo;hi=Math.max(a[i],oh*a[i],ol*a[i]);lo=Math.min(a[i],oh*a[i],ol*a[i]);ans=Math.max(ans,hi);F.push({line:[5,6,7,8],msg:`At ${a[i]}, candidates are ${a[i]}, ${oh*a[i]}, ${ol*a[i]}; range becomes ${lo}…${hi}.`,values:a,active:i,deps:[i-1],labels:a,metricA:hi,metricB:lo,story:[`high ${hi}`,`low ${lo}`,`answer ${ans}`]});}F.push({line:10,msg:`The largest product is ${ans}.`,values:a,metricA:ans,metricB:'maximum',story:['all sign flips considered'],done:'ok',result:`✓ maximum product = ${ans}`});return F;}
  });

  add('word_break',{
    title:'Word Break',lc:'139',chips:['Prefix Reachability','O(n²) time','Dictionary Cuts'],
    problem:'Decide whether a string can be segmented entirely into dictionary words.',
    intuition:'A prefix is reachable when some earlier reachable cut is followed by a dictionary word. Each true state becomes a stepping stone.',
    inputs:[{id:'in-s',label:'string',value:'leetcode'},{id:'in-words',label:'dictionary',value:'leet,code'}],
    presets:presets([['classic',['in-s','leetcode'],['in-words','leet,code']],['apple',['in-s','applepenapple'],['in-words','apple,pen']],['false',['in-s','catsandog'],['in-words','cats,dog,sand,and,cat']],['small',['in-s','aaaaaaa'],['in-words','aaaa,aaa']],['single',['in-s','code'],['in-words','code']]]),
    code:`class Solution {
    public boolean wordBreak(String s, List<String> words) {
        boolean[] dp = new boolean[s.length() + 1];
        dp[0] = true;
        for (int end = 1; end <= s.length(); end++)
            for (int cut = 0; cut < end; cut++)
                if (dp[cut] && words.contains(s.substring(cut, end))) {
                    dp[end] = true; break;
                }
        return dp[s.length()];
    }
}`,
    build(){const s=val('in-s'),dict=new Set(words('in-words')),dp=Array(s.length+1).fill(false),F=[];dp[0]=true;for(let end=1;end<=s.length;end++)for(let cut=0;cut<end;cut++){const word=s.slice(cut,end),ok=dp[cut]&&dict.has(word);F.push({line:[6,7],msg:`Try cut ${cut}→${end}: “${word}” ${dict.has(word)?'is in':'is not in'} the dictionary; prefix ${cut} is ${dp[cut]?'reachable':'blocked'}.`,values:dp.slice(),active:end,deps:[cut],labels:['∅',...s],metricA:end,metricB:word,story:[ok?'valid bridge':'no bridge']});if(ok){dp[end]=true;F.push({line:[7,8],msg:`Mark prefix ${end} reachable using “${word}”.`,values:dp.slice(),active:end,deps:[cut],good:dp.map((x,i)=>x?i:-1).filter(i=>i>=0),labels:['∅',...s],metricA:end,metricB:word,story:[`cut at ${cut}`,`word ${word}`]});break;}}const ok=dp[s.length];F.push({line:10,msg:ok?'The full string is reachable.':'No chain of dictionary cuts reaches the end.',values:dp,active:s.length,good:dp.map((x,i)=>x?i:-1).filter(i=>i>=0),labels:['∅',...s],metricA:ok,metricB:'full prefix',story:['segmentation complete'],done:ok?'ok':'bad',result:ok?'✓ segmentable':'✗ not segmentable'});return F;}
  });

  add('longest_increasing_subsequence',{
    title:'Longest Increasing Subsequence',lc:'300',chips:['Sequence DP','O(n²) visual algorithm','Best Predecessor'],
    problem:'Find the length of the longest strictly increasing subsequence.',
    intuition:'Let dp[i] be the best rising story ending exactly at i. Every smaller earlier value may extend into it.',
    inputs:[{id:'in-arr',label:'nums',value:'10,9,2,5,3,7,101,18'}],
    presets:presets([['classic',['in-arr','10,9,2,5,3,7,101,18']],['ascending',['in-arr','1,2,3,4']],['descending',['in-arr','4,3,2,1']],['duplicates',['in-arr','7,7,7,7']],['mixed',['in-arr','0,1,0,3,2,3']]]),
    code:`class Solution {
    public int lengthOfLIS(int[] nums) {
        int[] dp = new int[nums.length];
        Arrays.fill(dp, 1);
        for (int i = 0; i < nums.length; i++)
            for (int j = 0; j < i; j++)
                if (nums[j] < nums[i])
                    dp[i] = Math.max(dp[i], dp[j] + 1);
        return Arrays.stream(dp).max().getAsInt();
    }
}`,
    build(){const a=nums('in-arr'),dp=Array(a.length).fill(1),F=[];for(let i=0;i<a.length;i++)for(let j=0;j<i;j++)if(a[j]<a[i]){const old=dp[i];dp[i]=Math.max(dp[i],dp[j]+1);F.push({line:[6,7,8],msg:`${a[j]} < ${a[i]}: extend the subsequence ending at ${j}; dp[${i}] becomes ${dp[i]}.`,values:dp.slice(),active:i,deps:[j],labels:a,metricA:dp[i],metricB:`from ${j}`,story:[`candidate ${dp[j]+1}`,old!==dp[i]?'improved':'already better']});}const ans=Math.max(0,...dp);F.push({line:9,msg:`The longest ending-state has length ${ans}.`,values:dp,good:dp.map((x,i)=>x===ans?i:-1).filter(i=>i>=0),labels:a,metricA:ans,metricB:'length',story:['best endpoint'],done:'ok',result:`✓ LIS length = ${ans}`});return F;}
  });

  add('partition_equal_subset_sum',{
    title:'Partition Equal Subset Sum',lc:'416',chips:['0/1 Knapsack','O(n × target)','Descending Updates'],
    problem:'Decide whether the numbers can split into two subsets with equal sum.',
    intuition:'An equal split needs one subset totaling half the full sum. Mark reachable totals, updating backward so each number is used once.',
    inputs:[{id:'in-arr',label:'nums',value:'1,5,11,5'}],
    presets:presets([['classic yes',['in-arr','1,5,11,5']],['classic no',['in-arr','1,2,3,5']],['pair',['in-arr','2,2']],['odd sum',['in-arr','1,2,4']],['many',['in-arr','3,3,3,4,5']]]),
    code:`class Solution {
    public boolean canPartition(int[] nums) {
        int sum = Arrays.stream(nums).sum();
        if (sum % 2 == 1) return false;
        int target = sum / 2;
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;
        for (int num : nums)
            for (int s = target; s >= num; s--)
                dp[s] |= dp[s - num];
        return dp[target];
    }
}`,
    build(){const a=nums('in-arr'),sum=a.reduce((x,y)=>x+y,0),F=[];if(sum%2)return [{line:4,msg:`Total ${sum} is odd, so an equal split is impossible.`,values:[sum],active:0,metricA:sum,metricB:'odd',story:['cannot halve'],done:'bad',result:'✗ cannot partition'}];const target=sum/2,dp=Array(target+1).fill(false);dp[0]=true;for(const n of a)for(let s=target;s>=n;s--){const before=dp[s];dp[s]=dp[s]||dp[s-n];F.push({line:[8,9,10],msg:`Use ${n} once: total ${s} can inherit reachability from ${s-n}.`,values:dp.slice(),active:s,deps:[s-n],good:dp.map((x,i)=>x?i:-1).filter(i=>i>=0),metricA:s,metricB:`number ${n}`,story:[before?'already reachable':dp[s]?'new reachable':'still blocked']});}const ok=dp[target];F.push({line:11,msg:ok?`Half-sum ${target} is reachable.`:`Half-sum ${target} is unreachable.`,values:dp,active:target,good:dp.map((x,i)=>x?i:-1).filter(i=>i>=0),metricA:target,metricB:ok,story:['target half'],done:ok?'ok':'bad',result:ok?'✓ equal partition exists':'✗ cannot partition'});return F;}
  });

  add('best_time_buy_sell_stock_cooldown',{
    title:'Buy & Sell Stock with Cooldown',lc:'309',chips:['State Machine DP','O(n) time','Hold / Sold / Rest'],
    problem:'Maximize trading profit when every sale forces a one-day cooldown.',
    intuition:'Each day ends in one of three states. Hold comes from holding or buying after rest; sold comes from selling; rest comes from resting or yesterday’s sale.',
    inputs:[{id:'in-arr',label:'prices',value:'1,2,3,0,2'}],
    presets:presets([['classic',['in-arr','1,2,3,0,2']],['falling',['in-arr','5,4,3,2']],['single',['in-arr','4']],['two trades',['in-arr','1,4,2,7']],['zigzag',['in-arr','2,1,4,5,2,9,7']]]),
    code:`class Solution {
    public int maxProfit(int[] prices) {
        int hold = -prices[0], sold = 0, rest = 0;
        for (int i = 1; i < prices.length; i++) {
            int oldHold = hold, oldSold = sold;
            hold = Math.max(hold, rest - prices[i]);
            sold = oldHold + prices[i];
            rest = Math.max(rest, oldSold);
        }
        return Math.max(sold, rest);
    }
}`,
    build(){const p=nums('in-arr'),F=[];let hold=-p[0],sold=0,rest=0,table=[Array(p.length).fill(null),Array(p.length).fill(null),Array(p.length).fill(null)];table[0][0]=hold;table[1][0]=sold;table[2][0]=rest;F.push({line:3,msg:`Day 0: buying creates hold = ${hold}; sold and rest are 0.`,matrix:copy(table),active:[0,0],metricA:0,metricB:'hold',story:['buy or rest']});for(let i=1;i<p.length;i++){const oh=hold,os=sold,or=rest;hold=Math.max(oh,or-p[i]);sold=oh+p[i];rest=Math.max(or,os);table[0][i]=hold;table[1][i]=sold;table[2][i]=rest;F.push({line:[5,6,7,8],msg:`Day ${i}, price ${p[i]}: hold ${hold}, sold ${sold}, rest ${rest}.`,matrix:copy(table),active:[1,i],deps:[[0,i-1],[1,i-1],[2,i-1]],metricA:Math.max(sold,rest),metricB:`day ${i}`,story:[`hold ${hold}`,`sold ${sold}`,`rest ${rest}`]});}const ans=Math.max(sold,rest);F.push({line:10,msg:`Finish without holding stock: max(sold, rest) = ${ans}.`,matrix:table,good:[[sold>=rest?1:2,p.length-1]],metricA:ans,metricB:'profit',story:['position closed'],done:'ok',result:`✓ maximum profit = ${ans}`});return F;}
  });

  add('coin_change_2',{
    title:'Coin Change II',lc:'518',chips:['Combination Count DP','O(coins × amount)','Coin-First Ordering'],
    problem:'Count combinations of unlimited coins that make the amount.',
    intuition:'Process coins outside and amounts inside. Every new way to make a total appends the current coin, so order never creates duplicates.',
    inputs:[{id:'in-amount',label:'amount',value:'5'},{id:'in-coins',label:'coins',value:'1,2,5'}],
    presets:presets([['classic',['in-amount','5'],['in-coins','1,2,5']],['none',['in-amount','3'],['in-coins','2']],['one',['in-amount','10'],['in-coins','10']],['zero',['in-amount','0'],['in-coins','1,2']],['many',['in-amount','8'],['in-coins','1,3,4']]]),
    code:`class Solution {
    public int change(int amount, int[] coins) {
        int[] dp = new int[amount + 1];
        dp[0] = 1;
        for (int coin : coins)
            for (int a = coin; a <= amount; a++)
                dp[a] += dp[a - coin];
        return dp[amount];
    }
}`,
    build(){const amount=Number(val('in-amount')),cs=nums('in-coins'),dp=Array(amount+1).fill(0),F=[];dp[0]=1;for(const c of cs)for(let a=c;a<=amount;a++){const add=dp[a-c];dp[a]+=add;F.push({line:[5,6,7],msg:`Coin ${c}, total ${a}: append ${c} to ${add} combinations for ${a-c}.`,values:dp.slice(),active:a,deps:[a-c],metricA:dp[a],metricB:`coin ${c}`,story:[`+${add} combinations`]});}F.push({line:8,msg:`There are ${dp[amount]} unordered combinations.`,values:dp,active:amount,good:[amount],metricA:dp[amount],metricB:'combinations',story:['coin order fixed'],done:'ok',result:`✓ combinations = ${dp[amount]}`});return F;}
  });

  add('target_sum',{
    title:'Target Sum',lc:'494',chips:['Sum-State DP','O(n × reachable sums)','Add or Subtract'],
    problem:'Assign + or - before every number so the expression equals target.',
    intuition:'After each number, every reachable sum forks into plus and minus. Merge equal destinations by adding their path counts.',
    inputs:[{id:'in-arr',label:'nums',value:'1,1,1,1,1'},{id:'in-target',label:'target',value:'3'}],
    presets:presets([['classic',['in-arr','1,1,1,1,1'],['in-target','3']],['single',['in-arr','1'],['in-target','1']],['zeros',['in-arr','0,0,1'],['in-target','1']],['negative target',['in-arr','1,2,1'],['in-target','-2']],['none',['in-arr','2,4'],['in-target','1']]]),
    code:`class Solution {
    public int findTargetSumWays(int[] nums, int target) {
        Map<Integer,Integer> ways = Map.of(0, 1);
        for (int num : nums) {
            Map<Integer,Integer> next = new HashMap<>();
            for (var e : ways.entrySet()) {
                add(next, e.getKey() + num, e.getValue());
                add(next, e.getKey() - num, e.getValue());
            }
            ways = next;
        }
        return ways.getOrDefault(target, 0);
    }
}`,
    build(){const a=nums('in-arr'),target=Number(val('in-target')),F=[];let map=new Map([[0,1]]);a.forEach((n,i)=>{const next=new Map();for(const [s,w]of map){next.set(s+n,(next.get(s+n)||0)+w);next.set(s-n,(next.get(s-n)||0)+w);}map=next;const sums=[...map.keys()].sort((x,y)=>x-y);F.push({line:[4,5,6,7,8,10],msg:`After ${n}, ${sums.length} sums are reachable; identical sums merge their path counts.`,values:sums.map(s=>map.get(s)),labels:sums,active:sums.indexOf(target),metricA:map.get(target)||0,metricB:`after ${i+1} nums`,story:[`+${n} / -${n}`,`${sums.length} states`]});});const ans=map.get(target)||0,sums=[...map.keys()].sort((x,y)=>x-y);F.push({line:12,msg:`Target ${target} has ${ans} sign assignments.`,values:sums.map(s=>map.get(s)),labels:sums,active:sums.indexOf(target),good:ans?[sums.indexOf(target)]:[],metricA:ans,metricB:`target ${target}`,story:['target lookup'],done:ans?'ok':'bad',result:`${ans?'✓':'✗'} ways = ${ans}`});return F;}
  });

  function stringTableBase(title,lc,problem,intuition,inputs,presetRows,code,build,difficulty) {
    return {title,lc,problem,intuition,inputs,presets:presets(presetRows),code,build,difficulty:difficulty||'Medium',chips:['2-D String DP','Dependency Table','Prefix States']};
  }

  add('interleaving_string',stringTableBase('Interleaving String','97','Decide whether s3 interleaves s1 and s2 while preserving both orders.','Cell (i,j) means the first i and j characters can form the first i+j target characters. Match the next target character from above or left.',
    [{id:'in-a',label:'s1',value:'aabcc'},{id:'in-b',label:'s2',value:'dbbca'},{id:'in-c',label:'s3',value:'aadbbcbcac'}],
    [['classic yes',['in-a','aabcc'],['in-b','dbbca'],['in-c','aadbbcbcac']],['classic no',['in-a','aabcc'],['in-b','dbbca'],['in-c','aadbbbaccc']],['empty',['in-a',''],['in-b',''],['in-c','']],['simple',['in-a','ab'],['in-b','cd'],['in-c','acbd']]],
    `class Solution {
    public boolean isInterleave(String a, String b, String c) {
        if (a.length() + b.length() != c.length()) return false;
        boolean[][] dp = new boolean[a.length()+1][b.length()+1];
        dp[0][0] = true;
        for (int i = 0; i <= a.length(); i++)
            for (int j = 0; j <= b.length(); j++) {
                if (i > 0) dp[i][j] |= dp[i-1][j] && a.charAt(i-1)==c.charAt(i+j-1);
                if (j > 0) dp[i][j] |= dp[i][j-1] && b.charAt(j-1)==c.charAt(i+j-1);
            }
        return dp[a.length()][b.length()];
    }
}`,function(){const a=val('in-a'),b=val('in-b'),c=val('in-c'),F=[];if(a.length+b.length!==c.length)return [{line:3,msg:'Lengths do not add up.',values:[false],active:0,metricA:false,metricB:'length mismatch',story:['impossible'],done:'bad',result:'✗ not interleavable'}];const dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(false));dp[0][0]=true;for(let i=0;i<=a.length;i++)for(let j=0;j<=b.length;j++){if(!i&&!j)continue;const k=i+j-1,up=i>0&&dp[i-1][j]&&a[i-1]===c[k],left=j>0&&dp[i][j-1]&&b[j-1]===c[k];dp[i][j]=up||left;F.push({line:[7,8,9],msg:`Target '${c[k]}' at ${k}: ${up?'take from s1':''}${up&&left?' or ':''}${left?'take from s2':''}${!up&&!left?'no valid predecessor':''}.`,matrix:copy(dp),active:[i,j],deps:[[i-1,j],[i,j-1]].filter(x=>x[0]>=0&&x[1]>=0),good:dp.flatMap((r,ri)=>r.map((x,ci)=>x?[ri,ci]:null).filter(Boolean)),metricA:dp[i][j],metricB:`prefix ${i+j}`,story:[`s1 ${i}`,`s2 ${j}`]});}const ok=dp[a.length][b.length];F.push({line:11,msg:ok?'The bottom-right prefix state is reachable.':'The full target prefix is unreachable.',matrix:dp,active:[a.length,b.length],metricA:ok,metricB:'full strings',story:['final prefix'],done:ok?'ok':'bad',result:ok?'✓ valid interleaving':'✗ invalid interleaving'});return F;}));

  add('longest_increasing_path_matrix',{
    title:'Longest Increasing Path in a Matrix',lc:'329',difficulty:'Hard',chips:['DFS + Memo','O(rows × cols)','Cached Path Lengths'],
    problem:'Find the longest path of strictly increasing orthogonal moves.',
    intuition:'Each cell asks for one plus the best larger neighbor. Memoization turns overlapping exploration into one solved state per cell.',
    inputs:[{id:'in-grid',label:'rows separated by |',value:'9,9,4|6,6,8|2,1,1'}],
    presets:presets([['classic',['in-grid','9,9,4|6,6,8|2,1,1']],['descending',['in-grid','3,2,1|4,5,0|7,6,9']],['flat',['in-grid','2,2|2,2']],['single',['in-grid','7']],['snake',['in-grid','1,2,3|6,5,4|7,8,9']]]),
    code:`class Solution {
    public int longestIncreasingPath(int[][] matrix) {
        int[][] memo = new int[matrix.length][matrix[0].length];
        int answer = 0;
        for (int r = 0; r < matrix.length; r++)
            for (int c = 0; c < matrix[0].length; c++)
                answer = Math.max(answer, dfs(matrix, r, c, memo));
        return answer;
    }
    // dfs returns 1 + the best strictly larger neighbor
}`,
    build(){const g=val('in-grid').split('|').map(r=>r.split(',').map(Number)),R=g.length,Cc=g[0].length,m=Array.from({length:R},()=>Array(Cc).fill(0)),F=[];const dfs=(r,c)=>{if(m[r][c])return m[r][c];let best=1,deps=[];for(const [dr,dc]of [[1,0],[-1,0],[0,1],[0,-1]]){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<R&&nc>=0&&nc<Cc&&g[nr][nc]>g[r][c]){best=Math.max(best,1+dfs(nr,nc));deps.push([nr,nc]);}}m[r][c]=best;F.push({line:[5,6,7],msg:`Cell (${r},${c}) = ${g[r][c]} stores path length ${best} from larger neighbors.`,matrix:copy(m),active:[r,c],deps,metricA:best,metricB:g[r][c],story:[`${deps.length} larger neighbors`,`memo = ${best}`]});return best;};let ans=0;for(let r=0;r<R;r++)for(let c=0;c<Cc;c++)ans=Math.max(ans,dfs(r,c));F.push({line:8,msg:`The largest memoized path length is ${ans}.`,matrix:m,good:m.flatMap((row,r)=>row.map((x,c)=>x===ans?[r,c]:null).filter(Boolean)),metricA:ans,metricB:'longest',story:['all cells cached'],done:'ok',result:`✓ longest path = ${ans}`});return F;}
  });

  function countSubsequenceConfig() {
    return stringTableBase('Distinct Subsequences','115','Count how many subsequences of s equal t.','At (i,j), either skip s[i-1], or when characters match, also use it to complete t[j-1].',
      [{id:'in-s',label:'source s',value:'rabbbit'},{id:'in-t',label:'target t',value:'rabbit'}],
      [['classic',['in-s','rabbbit'],['in-t','rabbit']],['babgbag',['in-s','babgbag'],['in-t','bag']],['same',['in-s','abc'],['in-t','abc']],['none',['in-s','abc'],['in-t','d']]],
      `class Solution {
    public int numDistinct(String s, String t) {
        int[][] dp = new int[s.length()+1][t.length()+1];
        for (int i = 0; i <= s.length(); i++) dp[i][0] = 1;
        for (int i = 1; i <= s.length(); i++)
            for (int j = 1; j <= t.length(); j++) {
                dp[i][j] = dp[i-1][j];
                if (s.charAt(i-1) == t.charAt(j-1)) dp[i][j] += dp[i-1][j-1];
            }
        return dp[s.length()][t.length()];
    }
}`,function(){const s=val('in-s'),t=val('in-t'),dp=Array.from({length:s.length+1},()=>Array(t.length+1).fill(0)),F=[];for(let i=0;i<=s.length;i++)dp[i][0]=1;for(let i=1;i<=s.length;i++)for(let j=1;j<=t.length;j++){dp[i][j]=dp[i-1][j];const match=s[i-1]===t[j-1];if(match)dp[i][j]+=dp[i-1][j-1];F.push({line:[5,6,7,8],msg:`${s[i-1]} ${match?'matches':'does not match'} ${t[j-1]}: skip contributes ${dp[i-1][j]}${match?`, use contributes ${dp[i-1][j-1]}`:''}.`,matrix:copy(dp),active:[i,j],deps:[[i-1,j],...(match?[[i-1,j-1]]:[])],metricA:dp[i][j],metricB:`${i},${j}`,story:[`skip ${dp[i-1][j]}`,match?`use ${dp[i-1][j-1]}`:'no use']});}const ans=dp[s.length][t.length];F.push({line:10,msg:`The full source forms the target ${ans} ways.`,matrix:dp,active:[s.length,t.length],good:[[s.length,t.length]],metricA:ans,metricB:'ways',story:['bottom-right count'],done:ans?'ok':'bad',result:`${ans?'✓':'✗'} distinct subsequences = ${ans}`});return F;});
  }
  add('distinct_subsequences',countSubsequenceConfig());

  add('edit_distance',stringTableBase('Edit Distance','72','Find the minimum insertions, deletions, and replacements converting word1 to word2.','Each prefix pair chooses the cheapest final edit. Matching characters move diagonally for free.',
    [{id:'in-a',label:'word1',value:'horse'},{id:'in-b',label:'word2',value:'ros'}],
    [['classic',['in-a','horse'],['in-b','ros']],['intention',['in-a','intention'],['in-b','execution']],['same',['in-a','abc'],['in-b','abc']],['empty',['in-a',''],['in-b','abc']]],
    `class Solution {
    public int minDistance(String a, String b) {
        int[][] dp = new int[a.length()+1][b.length()+1];
        for (int i=0;i<=a.length();i++) dp[i][0]=i;
        for (int j=0;j<=b.length();j++) dp[0][j]=j;
        for (int i=1;i<=a.length();i++)
            for (int j=1;j<=b.length();j++)
                if (a.charAt(i-1)==b.charAt(j-1)) dp[i][j]=dp[i-1][j-1];
                else dp[i][j]=1+Math.min(dp[i-1][j-1],Math.min(dp[i-1][j],dp[i][j-1]));
        return dp[a.length()][b.length()];
    }
}`,function(){const a=val('in-a'),b=val('in-b'),dp=Array.from({length:a.length+1},()=>Array(b.length+1).fill(0)),F=[];for(let i=0;i<=a.length;i++)dp[i][0]=i;for(let j=0;j<=b.length;j++)dp[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++){const same=a[i-1]===b[j-1];dp[i][j]=same?dp[i-1][j-1]:1+Math.min(dp[i-1][j-1],dp[i-1][j],dp[i][j-1]);F.push({line:[6,7,8,9],msg:same?`'${a[i-1]}' matches: carry diagonal cost ${dp[i][j]}.`:`'${a[i-1]}'→'${b[j-1]}': choose cheapest insert, delete, or replace = ${dp[i][j]}.`,matrix:copy(dp),active:[i,j],deps:same?[[i-1,j-1]]:[[i-1,j-1],[i-1,j],[i,j-1]],metricA:dp[i][j],metricB:same?'match':'edit',story:[same?'free diagonal':'1 + best neighbor']});}const ans=dp[a.length][b.length];F.push({line:10,msg:`Minimum edit distance is ${ans}.`,matrix:dp,active:[a.length,b.length],good:[[a.length,b.length]],metricA:ans,metricB:'edits',story:['full words'],done:'ok',result:`✓ edit distance = ${ans}`});return F;}));

  add('burst_balloons',{
    title:'Burst Balloons',lc:'312',difficulty:'Hard',chips:['Interval DP','O(n³) time','Choose Last Balloon'],
    problem:'Burst balloons in an order that maximizes collected coins.',
    intuition:'For each interval, choose which balloon bursts last. Its neighbors are then fixed interval boundaries, splitting the earlier work into solved subintervals.',
    inputs:[{id:'in-arr',label:'balloons',value:'3,1,5,8'}],
    presets:presets([['classic',['in-arr','3,1,5,8']],['two',['in-arr','1,5']],['single',['in-arr','7']],['small',['in-arr','2,4,3']],['ones',['in-arr','1,1,1']]]),
    code:`class Solution {
    public int maxCoins(int[] nums) {
        int[] a = withBoundaryOnes(nums);
        int[][] dp = new int[a.length][a.length];
        for (int len = 2; len < a.length; len++)
            for (int left = 0; left + len < a.length; left++) {
                int right = left + len;
                for (int last = left + 1; last < right; last++)
                    dp[left][right] = Math.max(dp[left][right],
                        dp[left][last] + a[left]*a[last]*a[right] + dp[last][right]);
            }
        return dp[0][a.length-1];
    }
}`,
    build(){const a=[1,...nums('in-arr'),1],n=a.length,dp=Array.from({length:n},()=>Array(n).fill(0)),F=[];for(let len=2;len<n;len++)for(let l=0;l+len<n;l++){const r=l+len;for(let k=l+1;k<r;k++){const cand=dp[l][k]+a[l]*a[k]*a[r]+dp[k][r];dp[l][r]=Math.max(dp[l][r],cand);F.push({line:[5,6,7,8,9],msg:`Interval (${l},${r}), burst ${a[k]} last: ${dp[l][k]} + ${a[l]}×${a[k]}×${a[r]} + ${dp[k][r]} = ${cand}.`,matrix:copy(dp),active:[l,r],deps:[[l,k],[k,r]],metricA:dp[l][r],metricB:`last ${k}`,story:[`candidate ${cand}`,`best ${dp[l][r]}`]});}}const ans=dp[0][n-1];F.push({line:12,msg:`The full interval yields ${ans} coins.`,matrix:dp,active:[0,n-1],good:[[0,n-1]],metricA:ans,metricB:'maximum',story:['all burst orders summarized'],done:'ok',result:`✓ maximum coins = ${ans}`});return F;}
  });

  add('regular_expression_matching',stringTableBase('Regular Expression Matching','10','Match a full string against a pattern containing . and *.','DP over string and pattern prefixes. A star either erases its preceding token or repeats it while consuming one matching character.',
    [{id:'in-s',label:'string',value:'aab'},{id:'in-p',label:'pattern',value:'c*a*b'}],
    [['classic yes',['in-s','aab'],['in-p','c*a*b']],['classic no',['in-s','mississippi'],['in-p','mis*is*p*.']],['dot star',['in-s','ab'],['in-p','.*']],['repeat',['in-s','aaa'],['in-p','a*']],['empty',['in-s',''],['in-p','a*']]],
    `class Solution {
    public boolean isMatch(String s, String p) {
        boolean[][] dp = new boolean[s.length()+1][p.length()+1];
        dp[0][0] = true;
        for (int j=2;j<=p.length();j++)
            if (p.charAt(j-1)=='*') dp[0][j]=dp[0][j-2];
        for (int i=1;i<=s.length();i++)
            for (int j=1;j<=p.length();j++)
                if (p.charAt(j-1)=='*')
                    dp[i][j]=dp[i][j-2] || (matches(s.charAt(i-1),p.charAt(j-2)) && dp[i-1][j]);
                else dp[i][j]=matches(s.charAt(i-1),p.charAt(j-1)) && dp[i-1][j-1];
        return dp[s.length()][p.length()];
    }
}`,function(){const s=val('in-s'),p=val('in-p'),dp=Array.from({length:s.length+1},()=>Array(p.length+1).fill(false)),F=[],match=(a,b)=>b==='.'||a===b;dp[0][0]=true;for(let j=2;j<=p.length;j++)if(p[j-1]==='*')dp[0][j]=dp[0][j-2];for(let i=1;i<=s.length;i++)for(let j=1;j<=p.length;j++){let deps=[];if(p[j-1]==='*'){dp[i][j]=dp[i][j-2]||(match(s[i-1],p[j-2])&&dp[i-1][j]);deps=[[i,j-2],[i-1,j]];}else{dp[i][j]=match(s[i-1],p[j-1])&&dp[i-1][j-1];deps=[[i-1,j-1]];}F.push({line:[7,8,9,10,11],msg:p[j-1]==='*'?`Star at pattern ${j}: erase pair or repeat '${p[j-2]}' against '${s[i-1]}'.`:`Compare '${s[i-1]}' with '${p[j-1]}': ${dp[i][j]?'match':'blocked'}.`,matrix:copy(dp),active:[i,j],deps,good:dp.flatMap((r,ri)=>r.map((x,ci)=>x?[ri,ci]:null).filter(Boolean)),metricA:dp[i][j],metricB:`${i},${j}`,story:[p[j-1]==='*'?'zero or more':'direct match']});}const ok=dp[s.length][p.length];F.push({line:12,msg:ok?'The full prefixes match.':'The pattern cannot consume the full string.',matrix:dp,active:[s.length,p.length],metricA:ok,metricB:'full match',story:['bottom-right state'],done:ok?'ok':'bad',result:ok?'✓ full match':'✗ no full match'});return F;},'Hard'));

  function shell(cfg) {
    document.body.innerHTML = `<nav class="topbar"><a class="back-link" href="../../index.html">← All Problems</a><span class="category-label">${cfg.key === 'best_time_buy_sell_stock_cooldown' || ['coin_change_2','target_sum','interleaving_string','longest_increasing_path_matrix','distinct_subsequences','edit_distance','burst_balloons','regular_expression_matching'].includes(cfg.key) ? '2-D' : '1-D'} Dynamic Programming</span><span class="problem-meta"><span class="chip accent">LC ${cfg.lc}</span><span class="chip ${cfg.difficulty.toLowerCase()}">${cfg.difficulty}</span></span></nav>
    <main class="pwrap"><header class="phero"><h1 class="grad-text">${esc(cfg.title)}</h1><div class="chips">${cfg.chips.map((x,i)=>`<span class="chip ${i?'':'accent'}">${esc(x)}</span>`).join('')}</div></header>
    <div class="grid2"><section class="card"><h2 class="card-title"><span class="dot"></span>Problem</h2><div class="prose-dark"><p>${esc(cfg.problem)}</p></div></section><section class="card"><h2 class="card-title"><span class="dot"></span>DP Insight</h2><div class="prose-dark"><p>${esc(cfg.intuition)}</p></div></section></div>
    <div class="gridmain"><section class="card"><h2 class="card-title"><span class="dot"></span>Solution — synced with playback</h2><div id="code-panel" class="code-panel"></div></section>
    <section class="card"><h2 class="card-title"><span class="dot"></span>Live Visualization</h2><div id="input-fields" class="grid2 greedy-inputs">${cfg.inputs.map(x=>`<div class="field"><label for="${x.id}">${esc(x.label)}</label><input id="${x.id}" value="${esc(x.value)}"></div>`).join('')}</div>
    <div class="run-row"><button id="run-btn" class="btn-primary">▶ Run</button><span class="examples-label">Examples</span><span id="preset-row">${cfg.presets.map((p,i)=>`<button class="preset-btn" data-preset="${i}">${esc(p.label)}</button>`).join('')}</span></div>
    <div id="step-msg" class="step-msg"></div><div class="viz-stage dp-stage"><div class="stage-label">State memory — highlighted cells explain the transition</div><div id="stage-main"></div><div id="stage-story" class="story-lane"></div><div class="state-grid"><div class="state-tile"><div class="k">Value</div><div id="state-a" class="v">-</div></div><div class="state-tile"><div class="k">State</div><div id="state-b" class="v">-</div></div></div><div id="result" class="result-banner"></div></div><div id="viz-controls" class="viz-controls"></div></section></div>
    <section class="card section-gap"><h2 class="card-title"><span class="dot"></span>Execution Log</h2><div id="log-panel" class="log-panel"></div></section><section class="card"><div class="explanation-head"><h2 class="card-title"><span class="dot"></span>Full Explanation</h2><button id="narrate-btn" class="preset-btn" title="Read aloud">🔊 Narrate</button></div><div id="narration" class="prose-dark"><p>${esc(cfg.intuition)}</p></div></section></main>`;
  }

  function init(k) {
    const cfg=C[k]; if(!cfg)throw new Error(`Unknown DP problem: ${k}`);
    document.title=`${cfg.title} — Interactive Visualization`; shell(cfg);
    const viz=Viz.init({code:cfg.code,buildFrames:cfg.build,render});
    document.getElementById('run-btn').addEventListener('click',viz.run);
    document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{Object.entries(cfg.presets[Number(b.dataset.preset)].values).forEach(([id,v])=>document.getElementById(id).value=v);viz.run();}));
    document.getElementById('narrate-btn').addEventListener('click',function(){if(speechSynthesis.speaking){speechSynthesis.cancel();this.textContent='🔊 Narrate';return;}const u=new SpeechSynthesisUtterance(document.getElementById('narration').innerText);u.onend=()=>this.textContent='🔊 Narrate';this.textContent='⏹ Stop';speechSynthesis.speak(u);});
    viz.run();
  }
  return {init};
})();
