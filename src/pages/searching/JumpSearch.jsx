import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN="oklch(0.75 0.18 195)";const BG="oklch(0.13 0.025 240)";const BORDER="oklch(0.22 0.04 240)";

const CODES={
  pseudo:`JUMP-SEARCH(arr, target):
  step = √n
  prev = 0
  while arr[min(step,n)-1] < target:
    prev = step
    step += √n
    if prev >= n: return -1
  while arr[prev] < target:
    prev++
    if prev == min(step, n): return -1
  if arr[prev] == target: return prev
  return -1`,
  python:`import math
def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n: return -1
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n): return -1
    if arr[prev] == target: return prev
    return -1`,
  javascript:`function jumpSearch(arr, target) {
  const n = arr.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;
  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }
  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }
  return arr[prev] === target ? prev : -1;
}`,
  cpp:`int jumpSearch(int arr[], int n, int target) {
  int step = sqrt(n), prev = 0;
  while (arr[min(step,n)-1] < target) {
    prev = step; step += sqrt(n);
    if (prev >= n) return -1;
  }
  while (arr[prev] < target) {
    if (++prev == min(step, n)) return -1;
  }
  return arr[prev] == target ? prev : -1;
}`,
};

function buildSteps(arr, target) {
  const steps = [];
  const n = arr.length;
  const jumpSize = Math.floor(Math.sqrt(n));
  steps.push({ jumped: [], linear: [], found: -1, line: 1, explanation: `Jump Search on sorted array. Jump size = √${n} ≈ ${jumpSize}. We jump ahead in blocks, then do linear search.` });
  let prev = 0, step = jumpSize;
  const jumped = [];
  while (step < n && arr[Math.min(step, n) - 1] < target) {
    jumped.push(Math.min(step, n) - 1);
    steps.push({ jumped: [...jumped], linear: [], found: -1, line: 3, explanation: `arr[${Math.min(step,n)-1}]=${arr[Math.min(step,n)-1]} < ${target}. Jumping forward. prev=${prev}, step=${step}.` });
    prev = step; step += jumpSize;
  }
  steps.push({ jumped: [...jumped], linear: [], found: -1, line: 5, explanation: `Stopped jumping. Target ${target} is in range [${prev}, ${Math.min(step,n)-1}]. Now linear searching.` });
  for (let i = prev; i < Math.min(step, n); i++) {
    steps.push({ jumped: [...jumped], linear: [i], found: -1, line: 7, explanation: `Linear check: arr[${i}] = ${arr[i]} vs target ${target}.` });
    if (arr[i] === target) {
      steps.push({ jumped: [...jumped], linear: [], found: i, line: 9, explanation: `✅ Found ${target} at index ${i}!` });
      return steps;
    }
  }
  steps.push({ jumped: [...jumped], linear: [], found: -2, line: 11, explanation: `❌ ${target} not found.` });
  return steps;
}

function sortedArr(n=16){const s=new Set();while(s.size<n)s.add(Math.floor(Math.random()*99)+1);return[...s].sort((a,b)=>a-b);}

export default function JumpSearch() {
  const [arr, setArr] = useState(() => sortedArr());
  const [target, setTarget] = useState(() => { const a = sortedArr(); return a[Math.floor(Math.random() * a.length)]; });
  const [customArr, setCustomArr] = useState(""); const [customTarget, setCustomTarget] = useState("");
  const [steps, setSteps] = useState([]); const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false); const [speed, setSpeed] = useState(600); const [started, setStarted] = useState(false);
  const timer = useRef(null); const cur = steps[stepIdx] || null;

  const reset = useCallback(() => { clearInterval(timer.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);
  const shuffle = () => { reset(); const a = sortedArr(); setArr(a); setTarget(a[Math.floor(Math.random() * a.length)]); };
  const applyCustom = () => { reset(); const p = customArr.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n)); const t = parseInt(customTarget); if (p.length >= 2) { const s = [...new Set(p)].sort((a, b) => a - b); setArr(s); setTarget(isNaN(t) ? s[0] : t); } };
  const run = (s) => { setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true); let idx = 0; clearInterval(timer.current); timer.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timer.current); setPlaying(false); setStepIdx(s.length - 1); return; } setStepIdx(idx); }, speed); };
  const togglePlay = () => { if (!started) { run(buildSteps(arr, target)); return; } if (playing) { clearInterval(timer.current); setPlaying(false); } else { setPlaying(true); let idx = stepIdx; timer.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timer.current); setPlaying(false); setStepIdx(steps.length - 1); return; } setStepIdx(idx); }, speed); } };

  const getColor = (i) => {
    if (!cur) return { bg: BG, border: BORDER, text: "rgb(148 163 184)" };
    if (cur.found === i) return { bg: "oklch(0.18 0.12 145/0.3)", border: "oklch(0.55 0.18 145)", text: "oklch(0.75 0.15 145)" };
    if (cur.linear.includes(i)) return { bg: "oklch(0.22 0.12 60/0.4)", border: "oklch(0.65 0.18 60)", text: "white" };
    if (cur.jumped.includes(i)) return { bg: "oklch(0.18 0.12 280/0.3)", border: "oklch(0.6 0.18 280)", text: "oklch(0.75 0.18 280)" };
    return { bg: BG, border: BORDER, text: "rgb(148 163 184)" };
  };

  return (<><SEO data={{ title: "Jump Search" }} />
    <AlgoPageLayout title="Jump Search" category="Searching" categoryHref="/searching" timeComplexity="O(√n)" spaceComplexity="O(1)">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
            <div className="flex flex-wrap gap-3">
              <div className="flex-1"><label className="text-xs text-slate-500 mb-1 block">Sorted Array</label>
                <input value={customArr} onChange={e => setCustomArr(e.target.value)} placeholder="e.g. 1, 3, 5, 7, 9, 11" className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }} onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} /></div>
              <div className="w-28"><label className="text-xs text-slate-500 mb-1 block">Target</label>
                <input value={customTarget} onChange={e => setCustomTarget(e.target.value)} placeholder="e.g. 7" className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none" style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }} onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} /></div>
              <div className="flex items-end gap-2">
                <button onClick={applyCustom} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>Apply</button>
                <button onClick={shuffle} className="px-3 py-2 rounded-lg border text-slate-400" style={{ borderColor: BORDER }}><Shuffle className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
          <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-slate-400">Target:</span>
              <span className="px-3 py-1 rounded-lg font-bold text-sm" style={{ background: "oklch(0.75 0.18 195/0.15)", color: CYAN }}>{target}</span>
              <div className="flex gap-3 text-xs text-slate-500 ml-auto">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "oklch(0.6 0.18 280)" }} />Jumped</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "oklch(0.65 0.18 60)" }} />Linear</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ background: "oklch(0.55 0.18 145)" }} />Found</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {arr.map((val, i) => { const c = getColor(i); return (
                <div key={i} className="flex flex-col items-center gap-1 transition-all duration-200">
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm border transition-all duration-200" style={{ background: c.bg, borderColor: c.border, color: c.text }}>{val}</div>
                  <span className="text-xs text-slate-600">{i}</span>
                </div>
              ); })}
            </div>
          </div>
          <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{ background: BG, borderColor: BORDER }}>
            <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm" style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>{playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{!started ? "Start" : playing ? "Pause" : "Resume"}</button>
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300" style={{ borderColor: BORDER }}><RotateCcw className="w-4 h-4" />Reset</button>
            <SpeedControl animationSpeed={speed} setAnimationSpeed={setSpeed} isAnimating={playing} />
          </div>
          <ExplanationPanel steps={steps.map(s => s.explanation)} currentStep={stepIdx} totalSteps={steps.length} />
        </div>
        <div className="h-[500px] xl:h-auto"><CodePanel codes={CODES} highlightLine={cur?.line ?? null} /></div>
      </div>
    </AlgoPageLayout>
  </>);
}
