import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN="oklch(0.75 0.18 195)";const BG="oklch(0.13 0.025 240)";const BORDER="oklch(0.22 0.04 240)";

const CODES={
  pseudo:`COUNTING-SORT(arr):
  max = maximum value in arr
  count = array of zeros of size max+1
  for each val in arr:
    count[val] += 1
  i = 0
  for val from 0 to max:
    while count[val] > 0:
      arr[i] = val
      i += 1
      count[val] -= 1
  return arr`,
  python:`def counting_sort(arr):
    max_val = max(arr)
    count = [0] * (max_val + 1)
    for val in arr:
        count[val] += 1
    i = 0
    for val in range(max_val + 1):
        while count[val] > 0:
            arr[i] = val
            i += 1
            count[val] -= 1
    return arr`,
  javascript:`function countingSort(arr) {
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  for (const val of arr) count[val]++;
  let i = 0;
  for (let val = 0; val <= max; val++) {
    while (count[val]-- > 0) arr[i++] = val;
  }
  return arr;
}`,
  cpp:`void countingSort(int arr[], int n) {
  int max = *max_element(arr, arr+n);
  vector<int> count(max+1, 0);
  for(int i=0;i<n;i++) count[arr[i]]++;
  int i = 0;
  for(int v=0;v<=max;v++)
    while(count[v]-->0) arr[i++]=v;
}`,
};

function buildSteps(input){
  const arr=[...input];const n=arr.length;const steps=[];
  const maxVal=Math.max(...arr);
  const count=new Array(maxVal+1).fill(0);
  steps.push({arr:[...arr],count:[...count],phase:"count",highlight:-1,outputIdx:-1,line:1,explanation:`Starting Counting Sort. Max value = ${maxVal}. Creating count array of size ${maxVal+1}.`});
  for(let k=0;k<n;k++){
    count[arr[k]]++;
    steps.push({arr:[...arr],count:[...count],phase:"count",highlight:arr[k],outputIdx:-1,line:3,explanation:`Counting arr[${k}]=${arr[k]}. count[${arr[k]}] is now ${count[arr[k]]}.`});
  }
  steps.push({arr:[...arr],count:[...count],phase:"build",highlight:-1,outputIdx:-1,line:5,explanation:`Count phase complete. Now rebuilding sorted array from count.`});
  const output=[...arr];let i=0;
  for(let val=0;val<=maxVal;val++){
    while(count[val]>0){
      output[i]=val;count[val]--;
      steps.push({arr:[...output],count:[...count],phase:"build",highlight:val,outputIdx:i,line:7,explanation:`Placing value ${val} at index ${i}. count[${val}] remaining: ${count[val]}.`});
      i++;
    }
  }
  steps.push({arr:[...output],count:[...count],phase:"done",highlight:-1,outputIdx:-1,line:11,explanation:`✅ Counting Sort complete! Array sorted in O(n+k) time.`});
  return steps;
}

function randomArr(n=12){return Array.from({length:n},()=>Math.floor(Math.random()*20)+1);}

export default function CountingSort(){
  const [arr,setArr]=useState(()=>randomArr());
  const [customInput,setCustomInput]=useState("");
  const [steps,setSteps]=useState([]);
  const [stepIdx,setStepIdx]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [speed,setSpeed]=useState(600);
  const [started,setStarted]=useState(false);
  const timer=useRef(null);
  const cur=steps[stepIdx]||null;
  const display=cur?cur.arr:arr;
  const maxVal=Math.max(...display,1);

  const reset=useCallback(()=>{clearInterval(timer.current);setPlaying(false);setStepIdx(0);setStarted(false);setSteps([]);},[]);
  const shuffle=()=>{reset();setArr(randomArr());setCustomInput("");};
  const applyCustom=()=>{reset();const p=customInput.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n)&&n>0&&n<=50);if(p.length>=2)setArr(p.slice(0,16));};
  const run=(s)=>{setSteps(s);setStepIdx(0);setStarted(true);setPlaying(true);let idx=0;clearInterval(timer.current);timer.current=setInterval(()=>{idx++;if(idx>=s.length){clearInterval(timer.current);setPlaying(false);setStepIdx(s.length-1);return;}setStepIdx(idx);},speed);};
  const togglePlay=()=>{
    if(!started){run(buildSteps(arr));return;}
    if(playing){clearInterval(timer.current);setPlaying(false);}
    else{setPlaying(true);let idx=stepIdx;timer.current=setInterval(()=>{idx++;if(idx>=steps.length){clearInterval(timer.current);setPlaying(false);setStepIdx(steps.length-1);return;}setStepIdx(idx);},speed);}
  };

  return(<>
    <SEO data={{title:"Counting Sort"}}/>
    <AlgoPageLayout title="Counting Sort" category="Sorting" categoryHref="/sorting" timeComplexity="O(n+k)" spaceComplexity="O(k)">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{background:BG,borderColor:BORDER}}>
            <p className="text-xs text-slate-500 mb-2">Values must be positive integers (best with small range, e.g. 1–20)</p>
            <div className="flex gap-3 flex-wrap">
              <input value={customInput} onChange={e=>setCustomInput(e.target.value)} placeholder="e.g. 4, 2, 2, 8, 3, 3, 1"
                className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{background:"oklch(0.17 0.03 240)",border:`1px solid ${BORDER}`}}
                onFocus={e=>e.target.style.borderColor=CYAN} onBlur={e=>e.target.style.borderColor=BORDER}/>
              <button onClick={applyCustom} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{background:CYAN,color:"oklch(0.1 0.02 240)"}}>Apply</button>
              <button onClick={shuffle} className="px-3 py-2 rounded-lg border text-slate-400" style={{borderColor:BORDER}}><Shuffle className="w-4 h-4"/></button>
            </div>
          </div>

          {/* Bar chart */}
          <div className="rounded-xl border p-5" style={{background:BG,borderColor:BORDER}}>
            <p className="text-xs text-slate-500 mb-3">Array</p>
            <div className="flex items-end gap-1.5 h-36 justify-center mb-4">
              {display.map((val,i)=>{
                const active=cur?.outputIdx===i;
                const pct=(val/maxVal)*100;
                return(
                  <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400">{val}</span>
                    <div className="w-full rounded-t-sm border transition-all duration-300"
                      style={{height:`${pct}%`,minHeight:4,
                        background:active?"oklch(0.18 0.12 145 / 0.5)":"oklch(0.75 0.18 195 / 0.25)",
                        borderColor:active?"oklch(0.55 0.18 145)":CYAN}}/>
                  </div>
                );
              })}
            </div>
            {/* Count array */}
            {cur?.count && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Count Array</p>
                <div className="flex gap-1 flex-wrap">
                  {cur.count.map((c,v)=>c>0||(cur.highlight===v)?(
                    <div key={v} className="flex flex-col items-center px-2 py-1 rounded-md border"
                      style={{background:cur.highlight===v?"oklch(0.75 0.18 195 / 0.15)":BG,
                               borderColor:cur.highlight===v?CYAN:BORDER}}>
                      <span className="text-[10px] text-slate-500">{v}</span>
                      <span className="text-xs font-bold" style={{color:cur.highlight===v?CYAN:"rgb(148 163 184)"}}>{c}</span>
                    </div>
                  ):null)}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{background:BG,borderColor:BORDER}}>
            <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm" style={{background:CYAN,color:"oklch(0.1 0.02 240)"}}>
              {playing?<Pause className="w-4 h-4"/>:<Play className="w-4 h-4"/>}{!started?"Start":playing?"Pause":"Resume"}
            </button>
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300" style={{borderColor:BORDER}}><RotateCcw className="w-4 h-4"/>Reset</button>
            <SpeedControl animationSpeed={speed} setAnimationSpeed={setSpeed} isAnimating={playing}/>
          </div>
          <ExplanationPanel steps={steps.map(s=>s.explanation)} currentStep={stepIdx} totalSteps={steps.length}/>
        </div>
        <div className="h-[500px] xl:h-auto"><CodePanel codes={CODES} highlightLine={cur?.line??null}/></div>
      </div>
    </AlgoPageLayout>
  </>);
}
