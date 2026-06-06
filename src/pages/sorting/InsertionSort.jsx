import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN="oklch(0.75 0.18 195)";const BG="oklch(0.13 0.025 240)";const BORDER="oklch(0.22 0.04 240)";

const CODES={
  pseudo:`INSERTION-SORT(arr):
  for i from 1 to n-1:
    key = arr[i]
    j = i - 1
    while j >= 0 and arr[j] > key:
      arr[j+1] = arr[j]
      j = j - 1
    arr[j+1] = key
  return arr`,
  python:`def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
  javascript:`function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
  cpp:`void insertionSort(int arr[], int n) {
  for (int i = 1; i < n; i++) {
    int key = arr[i];
    int j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j+1] = arr[j];
      j--;
    }
    arr[j+1] = key;
  }
}`,
};

function buildSteps(input){
  const arr=[...input];const n=arr.length;const steps=[];
  steps.push({arr:[...arr],key:null,keyIdx:-1,shifting:[],sorted:[0],line:1,explanation:`Starting Insertion Sort. The first element is trivially sorted. We insert each subsequent element into its correct position.`});
  for(let i=1;i<n;i++){
    const key=arr[i];
    steps.push({arr:[...arr],key,keyIdx:i,shifting:[],sorted:Array.from({length:i},(_,k)=>k),line:2,explanation:`Picking key = arr[${i}] = ${key}. Will insert into sorted portion [0..${i-1}].`});
    let j=i-1;
    while(j>=0&&arr[j]>key){
      steps.push({arr:[...arr],key,keyIdx:j+1,shifting:[j],sorted:Array.from({length:i},(_,k)=>k),line:4,explanation:`arr[${j}]=${arr[j]} > key=${key}, shifting right.`});
      arr[j+1]=arr[j];j--;
    }
    arr[j+1]=key;
    const s=Array.from({length:i+1},(_,k)=>k);
    steps.push({arr:[...arr],key,keyIdx:j+1,shifting:[],sorted:s,line:7,explanation:`Inserted ${key} at index ${j+1}. Sorted portion is now [0..${i}].`});
  }
  steps.push({arr:[...arr],key:null,keyIdx:-1,shifting:[],sorted:Array.from({length:n},(_,k)=>k),line:8,explanation:`✅ Insertion Sort complete!`});
  return steps;
}

function randomArr(n=14){return Array.from({length:n},()=>Math.floor(Math.random()*85)+10);}

export default function InsertionSort(){
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
    if(cur.shifting.includes(i))return{bg:"oklch(0.22 0.12 30 / 0.5)",border:"oklch(0.65 0.18 30)"};
    if(cur.keyIdx===i)return{bg:"oklch(0.22 0.12 60 / 0.5)",border:"oklch(0.65 0.18 60)"};
    if(cur.sorted.includes(i))return{bg:"oklch(0.18 0.12 145 / 0.4)",border:"oklch(0.55 0.18 145)"};
    return{bg:"oklch(0.75 0.18 195 / 0.15)",border:"oklch(0.75 0.18 195 / 0.3)"};
  };

  return(<>
    <SEO data={{title:"Insertion Sort"}}/>
    <AlgoPageLayout title="Insertion Sort" category="Sorting" categoryHref="/sorting" timeComplexity="O(n²)" spaceComplexity="O(1)">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{background:BG,borderColor:BORDER}}>
            <div className="flex gap-3 flex-wrap">
              <input value={customInput} onChange={e=>setCustomInput(e.target.value)} placeholder="e.g. 12, 11, 13, 5, 6"
                className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                style={{background:"oklch(0.17 0.03 240)",border:`1px solid ${BORDER}`}}
                onFocus={e=>e.target.style.borderColor=CYAN} onBlur={e=>e.target.style.borderColor=BORDER}/>
              <button onClick={applyCustom} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{background:CYAN,color:"oklch(0.1 0.02 240)"}}>Apply</button>
              <button onClick={shuffle} className="px-3 py-2 rounded-lg border text-slate-400" style={{borderColor:BORDER}}><Shuffle className="w-4 h-4"/></button>
            </div>
          </div>
          <div className="rounded-xl border p-5" style={{background:BG,borderColor:BORDER}}>
            <div className="flex gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:"oklch(0.65 0.18 60)"}}/>Key</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:"oklch(0.65 0.18 30)"}}/>Shifting</span>
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
