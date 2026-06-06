import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";
const CYAN="oklch(0.75 0.18 195)";const BG="oklch(0.13 0.025 240)";const BORDER="oklch(0.22 0.04 240)";
const CODES={
  pseudo:`LINEAR-SEARCH(arr, target):
  for i from 0 to n-1:
    if arr[i] == target:
      return i
  return -1`,
  python:`def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
  javascript:`function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
  cpp:`int linearSearch(int arr[], int n, int t) {
  for (int i = 0; i < n; i++)
    if (arr[i] == t) return i;
  return -1;
}`,
};
function buildSteps(arr,target){
  const steps=[];
  steps.push({current:-1,found:-1,line:1,explanation:`Searching for ${target} in ${arr.length} elements. Checking each one sequentially.`});
  for(let i=0;i<arr.length;i++){
    steps.push({current:i,found:-1,line:2,explanation:`Checking index ${i}: arr[${i}] = ${arr[i]}.`});
    if(arr[i]===target){steps.push({current:i,found:i,line:3,explanation:`✅ Found! arr[${i}] = ${target} at index ${i}.`});return steps;}
  }
  steps.push({current:-1,found:-2,line:5,explanation:`❌ Not found after checking all ${arr.length} elements.`});
  return steps;
}
function randomArr(n=16){return Array.from({length:n},()=>Math.floor(Math.random()*99)+1);}
export default function LinearSearch(){
  const [arr,setArr]=useState(()=>randomArr());
  const [target,setTarget]=useState(()=>{const a=randomArr();return a[Math.floor(Math.random()*a.length)];});
  const [customArr,setCustomArr]=useState("");const [customTarget,setCustomTarget]=useState("");
  const [steps,setSteps]=useState([]);const [stepIdx,setStepIdx]=useState(0);
  const [playing,setPlaying]=useState(false);const [speed,setSpeed]=useState(500);const [started,setStarted]=useState(false);
  const timer=useRef(null);const cur=steps[stepIdx]||null;
  const reset=useCallback(()=>{clearInterval(timer.current);setPlaying(false);setStepIdx(0);setStarted(false);setSteps([]);},[]);
  const shuffle=()=>{reset();const a=randomArr();setArr(a);setTarget(a[Math.floor(Math.random()*a.length)]);setCustomArr("");setCustomTarget("");};
  const applyCustom=()=>{reset();const p=customArr.split(",").map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));const t=parseInt(customTarget);if(p.length>=2){setArr(p);setTarget(isNaN(t)?p[0]:t);}};
  const run=(s)=>{setSteps(s);setStepIdx(0);setStarted(true);setPlaying(true);let idx=0;clearInterval(timer.current);timer.current=setInterval(()=>{idx++;if(idx>=s.length){clearInterval(timer.current);setPlaying(false);setStepIdx(s.length-1);return;}setStepIdx(idx);},speed);};
  const togglePlay=()=>{if(!started){run(buildSteps(arr,target));return;}if(playing){clearInterval(timer.current);setPlaying(false);}else{setPlaying(true);let idx=stepIdx;timer.current=setInterval(()=>{idx++;if(idx>=steps.length){clearInterval(timer.current);setPlaying(false);setStepIdx(steps.length-1);return;}setStepIdx(idx);},speed);}};
  const getColor=(i)=>{if(!cur)return{bg:BG,border:BORDER,text:"rgb(148 163 184)"};if(cur.found===i)return{bg:"oklch(0.18 0.12 145/0.3)",border:"oklch(0.55 0.18 145)",text:"oklch(0.75 0.15 145)"};if(cur.current===i)return{bg:"oklch(0.22 0.12 60/0.4)",border:"oklch(0.65 0.18 60)",text:"white"};if(cur.current>i)return{bg:"oklch(0.15 0.03 240)",border:"oklch(0.2 0.04 240)",text:"rgb(100 116 139)"};return{bg:BG,border:BORDER,text:"rgb(148 163 184)"};};
  return(<><SEO data={{title:"Linear Search"}}/>
    <AlgoPageLayout title="Linear Search" category="Searching" categoryHref="/searching" timeComplexity="O(n)" spaceComplexity="O(1)">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{background:BG,borderColor:BORDER}}>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1"><label className="text-xs text-slate-500 mb-1 block">Array</label>
                <input value={customArr} onChange={e=>setCustomArr(e.target.value)} placeholder="e.g. 4, 2, 7, 1, 9" className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={{background:"oklch(0.17 0.03 240)",border:`1px solid ${BORDER}`}} onFocus={e=>e.target.style.borderColor=CYAN} onBlur={e=>e.target.style.borderColor=BORDER}/></div>
              <div className="w-28"><label className="text-xs text-slate-500 mb-1 block">Target</label>
                <input value={customTarget} onChange={e=>setCustomTarget(e.target.value)} placeholder="e.g. 7" className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={{background:"oklch(0.17 0.03 240)",border:`1px solid ${BORDER}`}} onFocus={e=>e.target.style.borderColor=CYAN} onBlur={e=>e.target.style.borderColor=BORDER}/></div>
              <div className="flex items-end gap-2">
                <button onClick={applyCustom} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{background:CYAN,color:"oklch(0.1 0.02 240)"}}>Apply</button>
                <button onClick={shuffle} className="px-3 py-2 rounded-lg border text-slate-400" style={{borderColor:BORDER}}><Shuffle className="w-4 h-4"/></button>
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-5" style={{background:BG,borderColor:BORDER}}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-slate-400">Target:</span>
              <span className="px-3 py-1 rounded-lg font-bold text-sm" style={{background:"oklch(0.75 0.18 195/0.15)",color:CYAN}}>{target}</span>
              {cur?.found>=0&&<span className="text-sm font-semibold" style={{color:"oklch(0.75 0.18 145)"}}>Found at index {cur.found}!</span>}
              {cur?.found===-2&&<span className="text-sm font-semibold text-red-400">Not found</span>}
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {arr.map((val,i)=>{const c=getColor(i);return(
                <div key={i} className="flex flex-col items-center gap-1 transition-all duration-200">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm border transition-all duration-200" style={{background:c.bg,borderColor:c.border,color:c.text}}>{val}</div>
                  <span className="text-xs text-slate-600">{i}</span>
                </div>
              );})}
            </div>
          </div>
          <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{background:BG,borderColor:BORDER}}>
            <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm" style={{background:CYAN,color:"oklch(0.1 0.02 240)"}}>{playing?<Pause className="w-4 h-4"/>:<Play className="w-4 h-4"/>}{!started?"Start":playing?"Pause":"Resume"}</button>
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
