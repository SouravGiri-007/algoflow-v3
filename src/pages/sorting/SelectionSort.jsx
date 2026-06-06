import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN="oklch(0.75 0.18 195)";const BG="oklch(0.13 0.025 240)";const BORDER="oklch(0.22 0.04 240)";

const CODES={
  pseudo:`SELECTION-SORT(arr):
  n = length of arr
  for i from 0 to n-2:
    minIdx = i
    for j from i+1 to n-1:
      if arr[j] < arr[minIdx]:
        minIdx = j
    swap arr[i] and arr[minIdx]
  return arr`,
  python:`def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
  javascript:`function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
  cpp:`void selectionSort(int arr[], int n) {
  for (int i = 0; i < n-1; i++) {
    int minIdx = i;
    for (int j = i+1; j < n; j++)
      if (arr[j] < arr[minIdx]) minIdx = j;
    swap(arr[i], arr[minIdx]);
  }
}`,
};

function buildSteps(input){
  const arr=[...input];const n=arr.length;const steps=[];const sorted=[];
  steps.push({arr:[...arr],minIdx:null,current:null,comparing:-1,swapping:[],sorted:[...sorted],line:1,explanation:`Starting Selection Sort. We find the minimum element in each pass and place it at the correct position.`});
  for(let i=0;i<n-1;i++){
    let minIdx=i;
    steps.push({arr:[...arr],minIdx,current:i,comparing:-1,swapping:[],sorted:[...sorted],line:3,explanation:`Pass ${i+1}: Looking for minimum in range [${i}, ${n-1}]. Current min = arr[${minIdx}] = ${arr[minIdx]}.`});
    for(let j=i+1;j<n;j++){
      steps.push({arr:[...arr],minIdx,current:i,comparing:j,swapping:[],sorted:[...sorted],line:4,explanation:`Comparing arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}.`});
      if(arr[j]<arr[minIdx]){minIdx=j;steps.push({arr:[...arr],minIdx,current:i,comparing:j,swapping:[],sorted:[...sorted],line:5,explanation:`New minimum found! arr[${j}]=${arr[j]} < previous min. minIdx updated to ${j}.`});}
    }
    steps.push({arr:[...arr],minIdx,current:i,comparing:-1,swapping:[i,minIdx],sorted:[...sorted],line:7,explanation:`Swapping arr[${i}]=${arr[i]} with minimum arr[${minIdx}]=${arr[minIdx]}.`});
    [arr[i],arr[minIdx]]=[arr[minIdx],arr[i]];
    sorted.push(i);
    steps.push({arr:[...arr],minIdx:null,current:null,comparing:-1,swapping:[],sorted:[...sorted],line:2,explanation:`Pass ${i+1} done. ${arr[i]} is now in its final position at index ${i}.`});
  }
  sorted.push(n-1);
  steps.push({arr:[...arr],minIdx:null,current:null,comparing:-1,swapping:[],sorted:[...sorted],line:8,explanation:`✅ Selection Sort complete!`});
  return steps;
}

function randomArr(n=14){return Array.from({length:n},()=>Math.floor(Math.random()*85)+10);}

export default function SelectionSort(){
  const [arr,setArr]=useState(()=>randomArr());
  const [customInput,setCustomInput]=useState("");
  const [steps,setSteps]=useState([]);
  const [stepIdx,setStepIdx]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [speed,setSpeed]=useState(500);
  const [started,setStarted]=useState(false);
  const timer=useRef(null);
  const cur=steps[stepIdx]||null;
  const display=cur?cur.arr:arr;
  const maxVal=Math.max(...display,1);

  const reset=useCallback(()=>{clearInterval(timer.current);setPlaying(false);setStepIdx(0);setStarted(false);setSteps([]);},[]);
  const shuffle=()=>{reset();setArr(randomArr());setCustomInput("");};
  const applyCustom=()=>{reset();const p=customInput.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));if(p.length>=2)setArr(p.slice(0,18));};

  const run=(s)=>{setSteps(s);setStepIdx(0);setStarted(true);setPlaying(true);let idx=0;clearInterval(timer.current);timer.current=setInterval(()=>{idx++;if(idx>=s.length){clearInterval(timer.current);setPlaying(false);setStepIdx(s.length-1);return;}setStepIdx(idx);},speed);};
  const togglePlay=()=>{
    if(!started){run(buildSteps(arr));return;}
    if(playing){clearInterval(timer.current);setPlaying(false);}
    else{setPlaying(true);let idx=stepIdx;timer.current=setInterval(()=>{idx++;if(idx>=steps.length){clearInterval(timer.current);setPlaying(false);setStepIdx(steps.length-1);return;}setStepIdx(idx);},speed);}
  };

  const getBar=(i)=>{
    if(!cur)return{bg:"oklch(0.75 0.18 195 / 0.4)",border:CYAN};
    if(cur.sorted.includes(i))return{bg:"oklch(0.18 0.12 145 / 0.4)",border:"oklch(0.55 0.18 145)"};
    if(cur.swapping.includes(i))return{bg:"oklch(0.22 0.12 30 / 0.5)",border:"oklch(0.65 0.18 30)"};
    if(cur.minIdx===i)return{bg:"oklch(0.18 0.12 280 / 0.5)",border:"oklch(0.6 0.18 280)"};
    if(cur.comparing===i)return{bg:"oklch(0.22 0.12 60 / 0.4)",border:"oklch(0.65 0.18 60)"};
    if(cur.current!==null&&i>=cur.current)return{bg:"oklch(0.75 0.18 195 / 0.15)",border:"oklch(0.75 0.18 195 / 0.3)"};
    return{bg:"oklch(0.17 0.03 240)",border:BORDER};
  };

  return(<>
    <SEO data={{title:"Selection Sort"}}/>
    <AlgoPageLayout title="Selection Sort" category="Sorting" categoryHref="/sorting" timeComplexity="O(n²)" spaceComplexity="O(1)">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{background:BG,borderColor:BORDER}}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Custom Input</p>
            <div className="flex gap-3 flex-wrap">
              <input value={customInput} onChange={e=>setCustomInput(e.target.value)} placeholder="e.g. 64, 25, 12, 22, 11"
                className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{background:"oklch(0.17 0.03 240)",border:`1px solid ${BORDER}`}}
                onFocus={e=>e.target.style.borderColor=CYAN} onBlur={e=>e.target.style.borderColor=BORDER}/>
              <button onClick={applyCustom} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{background:CYAN,color:"oklch(0.1 0.02 240)"}}>Apply</button>
              <button onClick={shuffle} className="px-3 py-2 rounded-lg border text-slate-400" style={{borderColor:BORDER}}><Shuffle className="w-4 h-4"/></button>
            </div>
          </div>
          <div className="rounded-xl border p-5" style={{background:BG,borderColor:BORDER}}>
            <div className="flex gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:"oklch(0.6 0.18 280)"}}/>Min Element</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:"oklch(0.65 0.18 60)"}}/>Comparing</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:"oklch(0.65 0.18 30)"}}/>Swapping</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:"oklch(0.55 0.18 145)"}}/>Sorted</span>
            </div>
            <div className="flex items-end gap-1.5 h-48 justify-center">
              {display.map((val,i)=>{const s=getBar(i);const pct=(val/maxVal)*100;return(
                <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <span className="text-[10px] text-slate-400">{val}</span>
                  <div className="w-full rounded-t-sm border transition-all duration-200" style={{height:`${pct}%`,minHeight:4,background:s.bg,borderColor:s.border}}/>
                  <span className="text-[10px] text-slate-600">{i}</span>
                </div>
              );})}
            </div>
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
