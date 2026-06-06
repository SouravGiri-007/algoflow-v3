import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN = "oklch(0.75 0.18 195)";
const BG = "oklch(0.13 0.025 240)";
const BORDER = "oklch(0.22 0.04 240)";

const CODES = {
  pseudo: `INTERPOLATION-SEARCH(arr, target):
  low = 0, high = n - 1
  while low <= high and target in range:
    pos = low + ((target - arr[low]) *
          (high - low)) / (arr[high] - arr[low])
    if arr[pos] == target: return pos
    if arr[pos] < target:  low = pos + 1
    else:                  high = pos - 1
  return -1`,
  python: `def interpolation_search(arr, target):
    low, high = 0, len(arr) - 1
    while (low <= high and
           arr[low] <= target <= arr[high]):
        pos = low + ((target - arr[low]) *
              (high - low) //
              (arr[high] - arr[low]))
        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            low = pos + 1
        else:
            high = pos - 1
    return -1`,
  javascript: `function interpolationSearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high &&
         target >= arr[low] &&
         target <= arr[high]) {
    const pos = low + Math.floor(
      (target - arr[low]) * (high - low)
      / (arr[high] - arr[low])
    );
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) low = pos + 1;
    else high = pos - 1;
  }
  return -1;
}`,
  cpp: `int interpolationSearch(int arr[], int n, int x) {
  int low = 0, high = n - 1;
  while (low <= high &&
         x >= arr[low] && x <= arr[high]) {
    int pos = low + ((x - arr[low]) *
              (high - low) /
              (arr[high] - arr[low]));
    if (arr[pos] == x) return pos;
    if (arr[pos] < x) low = pos + 1;
    else high = pos - 1;
  }
  return -1;
}`,
};

function buildSteps(arr, target) {
  const steps = [];
  let low = 0, high = arr.length - 1;
  const eliminated = [];

  steps.push({ low, high, pos: null, found: -1, eliminated: [], line: 1,
    explanation: `Interpolation Search for ${target}. Unlike Binary Search, probe position is calculated proportionally based on value distribution.` });

  while (low <= high && arr[low] <= target && target <= arr[high]) {
    if (arr[low] === arr[high]) {
      if (arr[low] === target) {
        steps.push({ low, high, pos: low, found: low, eliminated: [...eliminated], line: 5,
          explanation: `✅ Found ${target} at index ${low}!` });
      } else {
        steps.push({ low, high, pos: null, found: -2, eliminated: [...eliminated], line: 8,
          explanation: `❌ ${target} not found.` });
      }
      return steps;
    }

    const pos = low + Math.floor(((target - arr[low]) * (high - low)) / (arr[high] - arr[low]));
    steps.push({ low, high, pos, found: -1, eliminated: [...eliminated], line: 3,
      explanation: `Probe pos = ${low} + ((${target} - ${arr[low]}) × (${high} - ${low})) / (${arr[high]} - ${arr[low]}) = ${pos}. arr[${pos}] = ${arr[pos]}.` });

    if (arr[pos] === target) {
      steps.push({ low, high, pos, found: pos, eliminated: [...eliminated], line: 5,
        explanation: `✅ Found! arr[${pos}] = ${arr[pos]} equals target ${target}.` });
      return steps;
    }

    if (arr[pos] < target) {
      for (let i = low; i <= pos; i++) eliminated.push(i);
      steps.push({ low, high, pos, found: -1, eliminated: [...eliminated], line: 6,
        explanation: `arr[${pos}]=${arr[pos]} < ${target}. Target is in right portion. new low = ${pos + 1}.` });
      low = pos + 1;
    } else {
      for (let i = pos; i <= high; i++) eliminated.push(i);
      steps.push({ low, high, pos, found: -1, eliminated: [...eliminated], line: 7,
        explanation: `arr[${pos}]=${arr[pos]} > ${target}. Target is in left portion. new high = ${pos - 1}.` });
      high = pos - 1;
    }
  }

  steps.push({ low, high, pos: null, found: -2, eliminated: [...eliminated], line: 8,
    explanation: `❌ ${target} not found in array.` });
  return steps;
}

function generateSortedArray() {
  const set = new Set();
  while (set.size < 14) set.add(Math.floor(Math.random() * 180) + 1);
  return [...set].sort((a, b) => a - b);
}

export default function InterpolationSearch() {
  const [arr, setArr] = useState(() => generateSortedArray());
  const [target, setTarget] = useState(() => { const a = generateSortedArray(); return a[Math.floor(Math.random() * a.length)]; });
  const [customInput, setCustomInput] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => { clearInterval(timerRef.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);
  const shuffle = () => { reset(); const a = generateSortedArray(); setArr(a); setTarget(a[Math.floor(Math.random() * a.length)]); setCustomInput(""); setCustomTarget(""); };
  const applyCustom = () => {
    reset();
    const p = customInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (p.length < 2) return;
    const sorted = [...new Set(p)].sort((a, b) => a - b);
    const t = parseInt(customTarget);
    setArr(sorted); setTarget(isNaN(t) ? sorted[0] : t);
  };
  const runSteps = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0; clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; } setStepIdx(idx); }, speed);
  };
  const togglePlay = () => {
    if (!started) { runSteps(buildSteps(arr, target)); return; }
    if (playing) { clearInterval(timerRef.current); setPlaying(false); }
    else { setPlaying(true); let idx = stepIdx; timerRef.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length - 1); return; } setStepIdx(idx); }, speed); }
  };

  const getColor = (i) => {
    if (!cur) return { bg: BG, border: BORDER, text: "rgb(148 163 184)" };
    if (cur.found === i) return { bg: "oklch(0.18 0.12 145/0.3)", border: "oklch(0.55 0.18 145)", text: "oklch(0.75 0.18 145)" };
    if (cur.eliminated?.includes(i)) return { bg: "oklch(0.15 0.04 240)", border: "oklch(0.2 0.04 240)", text: "oklch(0.3 0.04 240)" };
    if (cur.pos === i) return { bg: "oklch(0.18 0.12 60/0.3)", border: "oklch(0.65 0.18 60)", text: "oklch(0.85 0.18 60)" };
    if (i >= cur.low && i <= cur.high) return { bg: "oklch(0.75 0.18 195/0.08)", border: "oklch(0.75 0.18 195/0.4)", text: "white" };
    return { bg: BG, border: BORDER, text: "rgb(100 116 139)" };
  };

  return (
    <>
      <SEO data={{ title: "Interpolation Search" }} />
      <AlgoPageLayout title="Interpolation Search" category="Searching" categoryHref="/searching" timeComplexity="O(log log n)" spaceComplexity="O(1)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Custom Input</p>
              <div className="flex flex-wrap gap-3">
                <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="Sorted array e.g. 10, 20, 40, 60"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                  onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                <input value={customTarget} onChange={e => setCustomTarget(e.target.value)} placeholder="Target" type="number"
                  className="w-28 px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                  onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                <button onClick={applyCustom} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>Apply</button>
                <button onClick={shuffle} className="px-3 py-2 rounded-lg border text-slate-400" style={{ borderColor: BORDER }}><Shuffle className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">Target:</span>
                  <span className="px-3 py-1 rounded-lg font-bold text-sm" style={{ background: "oklch(0.75 0.18 195/0.15)", color: CYAN }}>{target}</span>
                </div>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "oklch(0.65 0.18 60)" }} />Probe</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: CYAN }} />Active</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "oklch(0.55 0.18 145)" }} />Found</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {arr.map((val, i) => {
                  const c = getColor(i);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 transition-all duration-300">
                      <div className="w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm border transition-all duration-300"
                        style={{ background: c.bg, borderColor: c.border, color: c.text }}>{val}</div>
                      <span className="text-xs text-slate-600">{i}</span>
                      {cur?.low === i && <span className="text-[9px] font-bold" style={{ color: CYAN }}>L</span>}
                      {cur?.high === i && <span className="text-[9px] font-bold" style={{ color: CYAN }}>R</span>}
                      {cur?.pos === i && <span className="text-[9px] font-bold" style={{ color: "oklch(0.85 0.18 60)" }}>P</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{ background: BG, borderColor: BORDER }}>
              <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm" style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300" style={{ borderColor: BORDER }}>
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <SpeedControl animationSpeed={speed} setAnimationSpeed={setSpeed} isAnimating={playing} />
            </div>
            <ExplanationPanel steps={steps.map(s => s.explanation)} currentStep={stepIdx} totalSteps={steps.length} />
          </div>
          <div className="h-[500px] xl:h-auto">
            <CodePanel codes={CODES} highlightLine={cur?.line ?? null} />
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
