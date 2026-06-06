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
const BUCKET_COLORS = ["#e74c3c","#e67e22","#f1c40f","#2ecc71","#1abc9c","#3498db","#9b59b6","#e91e63","#795548","#607d8b"];

const CODES = {
  pseudo: `RADIX-SORT(arr):
  max = maximum element in arr
  for exp = 1 to max (×10 each pass):
    create 10 empty buckets (0–9)
    for each num in arr:
      digit = (num / exp) % 10
      place num in bucket[digit]
    flatten buckets back into arr
  return arr`,
  python: `def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort_by_digit(arr, exp)
        exp *= 10

def counting_sort_by_digit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    for num in arr:
        idx = (num // exp) % 10
        count[idx] += 1
    for i in range(1, 10):
        count[i] += count[i - 1]
    for i in range(n - 1, -1, -1):
        idx = (arr[i] // exp) % 10
        output[count[idx] - 1] = arr[i]
        count[idx] -= 1
    for i in range(n):
        arr[i] = output[i]`,
  javascript: `function radixSort(arr) {
  const max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countingSortByDigit(arr, exp);
  }
  return arr;
}
function countingSortByDigit(arr, exp) {
  const n = arr.length;
  const output = new Array(n).fill(0);
  const count = new Array(10).fill(0);
  arr.forEach(num => count[Math.floor(num / exp) % 10]++);
  for (let i = 1; i < 10; i++) count[i] += count[i - 1];
  for (let i = n - 1; i >= 0; i--) {
    const idx = Math.floor(arr[i] / exp) % 10;
    output[--count[idx]] = arr[i];
  }
  output.forEach((v, i) => arr[i] = v);
}`,
  cpp: `void radixSort(int arr[], int n) {
  int max = *max_element(arr, arr+n);
  for (int exp = 1; max/exp > 0; exp *= 10)
    countSort(arr, n, exp);
}
void countSort(int arr[], int n, int exp) {
  int output[n], count[10] = {0};
  for (int i = 0; i < n; i++) count[(arr[i]/exp)%10]++;
  for (int i = 1; i < 10; i++) count[i] += count[i-1];
  for (int i = n-1; i >= 0; i--) {
    output[--count[(arr[i]/exp)%10]] = arr[i];
  }
  for (int i = 0; i < n; i++) arr[i] = output[i];
}`,
};

function buildSteps(input) {
  const arr = [...input];
  const steps = [];
  const maxVal = Math.max(...arr);
  steps.push({ arr: [...arr], buckets: null, exp: 1, pass: 0, line: 2, explanation: `Starting Radix Sort. Max value = ${maxVal}. We'll sort digit by digit from least significant to most significant.` });
  let exp = 1, pass = 0;
  while (Math.floor(maxVal / exp) > 0) {
    pass++;
    const digit = exp === 1 ? "units" : exp === 10 ? "tens" : exp === 100 ? "hundreds" : `exp=${exp}`;
    const buckets = Array.from({ length: 10 }, () => []);
    steps.push({ arr: [...arr], buckets: buckets.map(b => [...b]), exp, pass, line: 4, explanation: `Pass ${pass} (${digit} digit): Creating 10 empty buckets (0–9).` });
    for (const num of arr) {
      const d = Math.floor(num / exp) % 10;
      buckets[d].push(num);
      steps.push({ arr: [...arr], buckets: buckets.map(b => [...b]), exp, pass, highlighted: num, line: 6, explanation: `${digit} digit of ${num} = ${d}. Placing in bucket[${d}].` });
    }
    steps.push({ arr: [...arr], buckets: buckets.map(b => [...b]), exp, pass, line: 7, explanation: `All numbers bucketed by ${digit} digit. Flattening back into array.` });
    let i = 0;
    for (const b of buckets) for (const v of b) arr[i++] = v;
    steps.push({ arr: [...arr], buckets: null, exp, pass, line: 7, explanation: `After pass ${pass}: [${arr.join(", ")}]` });
    exp *= 10;
  }
  steps.push({ arr: [...arr], buckets: null, line: 1, explanation: `✅ Radix Sort complete! Array sorted in ${pass} passes.` });
  return steps;
}

function randomArr() { return Array.from({ length: 10 }, () => Math.floor(Math.random() * 900) + 10); }

export default function RadixSort() {
  const [arr, setArr] = useState(() => randomArr());
  const [customInput, setCustomInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const cur = steps[stepIdx] || null;
  const displayArr = cur ? cur.arr : arr;

  const reset = useCallback(() => { clearInterval(timerRef.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);
  const shuffle = () => { reset(); setArr(randomArr()); setCustomInput(""); };
  const applyCustom = () => {
    reset();
    const p = customInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    if (p.length >= 2) setArr(p.slice(0, 12));
  };
  const runSteps = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0; clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; } setStepIdx(idx); }, speed);
  };
  const togglePlay = () => {
    if (!started) { runSteps(buildSteps(arr)); return; }
    if (playing) { clearInterval(timerRef.current); setPlaying(false); }
    else { setPlaying(true); let idx = stepIdx; timerRef.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length - 1); return; } setStepIdx(idx); }, speed); }
  };

  return (
    <>
      <SEO data={{ title: "Radix Sort" }} />
      <AlgoPageLayout title="Radix Sort" category="Sorting" categoryHref="/sorting" timeComplexity="O(n·k)" spaceComplexity="O(n+k)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Custom Input</p>
              <div className="flex gap-3 flex-wrap">
                <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="e.g. 170, 45, 75, 90, 802, 24, 2, 66"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                  onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                <button onClick={applyCustom} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>Apply</button>
                <button onClick={shuffle} className="px-3 py-2 rounded-lg border text-slate-400" style={{ borderColor: BORDER }}><Shuffle className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Current array */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Current Array {cur?.pass ? `— Pass ${cur.pass} (${cur.exp === 1 ? "units" : cur.exp === 10 ? "tens" : "hundreds"} digit)` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {displayArr.map((val, i) => (
                  <div key={i} className="w-14 h-10 rounded-lg flex items-center justify-center font-bold text-sm border transition-all"
                    style={{ background: cur?.highlighted === val ? "oklch(0.75 0.18 195 / 0.15)" : "oklch(0.17 0.03 240)", borderColor: cur?.highlighted === val ? CYAN : BORDER, color: cur?.highlighted === val ? CYAN : "white" }}>
                    {val}
                  </div>
                ))}
              </div>
            </div>

            {/* Buckets */}
            {cur?.buckets && (
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Buckets</p>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                  {cur.buckets.map((bucket, d) => (
                    <div key={d} className="rounded-lg overflow-hidden border" style={{ borderColor: BORDER }}>
                      <div className="text-center text-xs font-bold py-1" style={{ background: BUCKET_COLORS[d] + "33", color: BUCKET_COLORS[d] }}>{d}</div>
                      <div className="p-1 min-h-[28px] flex flex-col gap-1">
                        {bucket.map((v, j) => (
                          <div key={j} className="text-center text-xs rounded px-1 py-0.5 font-mono"
                            style={{ background: BUCKET_COLORS[d] + "22", color: BUCKET_COLORS[d] }}>{v}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
