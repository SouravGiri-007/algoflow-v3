import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN   = "oklch(0.75 0.18 195)";
const BG     = "oklch(0.13 0.025 240)";
const BORDER = "oklch(0.22 0.04 240)";

const CODE = `def heapify(arr, n, i):
    largest = i
    left  = 2 * i + 1
    right = 2 * i + 2

    if left < n and arr[left] > arr[largest]:
        largest = left

    if right < n and arr[right] > arr[largest]:
        largest = right

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def heap_sort(arr):
    n = len(arr)

    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)

    # Extract elements one by one
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, n, 0)`;

function buildSteps(inputArr) {
  const arr = [...inputArr];
  const n = arr.length;
  const steps = [];

  const snap = (comparing, swapping, heapSize, sorted, line, explanation) => {
    steps.push({ arr: [...arr], comparing: comparing || [], swapping: swapping || [], heapSize, sorted: sorted || [], line, explanation });
  };

  function heapify(heapSize, i, sorted) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    snap([i, left, right].filter(x => x < heapSize), null, heapSize, sorted, 1,
      `heapify at index ${i}. Checking children: left=${left < heapSize ? arr[left] : "N/A"}, right=${right < heapSize ? arr[right] : "N/A"}.`);

    if (left < heapSize && arr[left] > arr[largest]) largest = left;
    if (right < heapSize && arr[right] > arr[largest]) largest = right;

    if (largest !== i) {
      snap(null, [i, largest], heapSize, sorted, 13,
        `Swapping arr[${i}]=${arr[i]} with arr[${largest}]=${arr[largest]} to restore heap property.`);
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      heapify(heapSize, largest, sorted);
    } else {
      snap([i], null, heapSize, sorted, 1,
        `arr[${i}]=${arr[i]} is already the largest among its subtree. Heap property satisfied.`);
    }
  }

  snap(null, null, n, [], 18, `Starting Heap Sort on ${n} elements. First we build a Max Heap.`);

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    snap(null, null, n, [], 20,
      `Building max heap: calling heapify at index ${i} (value=${arr[i]}).`);
    heapify(n, i, []);
  }

  snap(null, null, n, [], 20, `✅ Max Heap built. Root ${arr[0]} is the largest element.`);

  const sorted = [];
  for (let i = n - 1; i > 0; i--) {
    snap(null, [0, i], n, [...sorted], 24,
      `Swapping root (max=${arr[0]}) with last unsorted element arr[${i}]=${arr[i]}.`);
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sorted.unshift(i);
    snap(null, null, i, [...sorted], 25,
      `arr[${i}]=${arr[i]} is now in its final sorted position. Heapifying remaining ${i} elements.`);
    heapify(i, 0, [...sorted]);
  }
  sorted.unshift(0);
  snap(null, null, 0, [...sorted], 25, `✅ Heap Sort complete! Array is fully sorted.`);
  return steps;
}

function randomArray(size = 12) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

export default function HeapSort() {
  const [arr, setArr]         = useState(() => randomArray());
  const [customInput, setCustomInput] = useState("");
  const [steps, setSteps]     = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed]     = useState(600);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  const cur = steps[stepIdx] || null;
  const displayArr = cur ? cur.arr : arr;

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]);
  }, []);

  const shuffle = () => { reset(); setArr(randomArray()); setCustomInput(""); };

  const applyCustom = () => {
    reset();
    const parsed = customInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length >= 2) setArr(parsed.slice(0, 18));
  };

  const runSteps = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      idx++;
      if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; }
      setStepIdx(idx);
    }, speed);
  };

  const togglePlay = () => {
    if (!started) { runSteps(buildSteps(arr)); return; }
    if (playing) { clearInterval(timerRef.current); setPlaying(false); }
    else {
      setPlaying(true);
      let idx = stepIdx;
      timerRef.current = setInterval(() => {
        idx++;
        if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length - 1); return; }
        setStepIdx(idx);
      }, speed);
    }
  };

  const maxVal = Math.max(...displayArr, 1);

  const getBarStyle = (i) => {
    if (!cur) return { bg: "oklch(0.75 0.18 195 / 0.5)", border: CYAN };
    if (cur.sorted.includes(i)) return { bg: "oklch(0.18 0.12 145 / 0.4)", border: "oklch(0.55 0.18 145)" };
    if (cur.swapping?.includes(i)) return { bg: "oklch(0.22 0.12 30 / 0.4)", border: "oklch(0.65 0.18 30)" };
    if (cur.comparing?.includes(i)) return { bg: "oklch(0.22 0.12 60 / 0.4)", border: "oklch(0.65 0.18 60)" };
    if (i < (cur.heapSize ?? displayArr.length)) return { bg: "oklch(0.75 0.18 195 / 0.2)", border: "oklch(0.75 0.18 195 / 0.5)" };
    return { bg: "oklch(0.17 0.03 240)", border: BORDER };
  };

  return (
    <>
      <SEO data={{ title: "Heap Sort" }} />
      <AlgoPageLayout title="Heap Sort" category="Sorting" categoryHref="/sorting" timeComplexity="O(n log n)" spaceComplexity="O(1)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Custom input */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Custom Input</p>
              <div className="flex gap-3 flex-wrap">
                <input value={customInput} onChange={e => setCustomInput(e.target.value)}
                  placeholder="e.g. 38, 27, 43, 3, 9, 82"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                  onFocus={e => e.target.style.borderColor = CYAN}
                  onBlur={e => e.target.style.borderColor = BORDER} />
                <button onClick={applyCustom} className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>Apply</button>
                <button onClick={shuffle} className="px-3 py-2 rounded-lg border text-slate-400"
                  style={{ borderColor: BORDER }}><Shuffle className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Bar chart */}
            <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex gap-3 mb-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "oklch(0.65 0.18 60)" }} />Comparing</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "oklch(0.65 0.18 30)" }} />Swapping</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "oklch(0.55 0.18 145)" }} />Sorted</span>
              </div>
              <div className="flex items-end gap-1.5 h-48 justify-center">
                {displayArr.map((val, i) => {
                  const s = getBarStyle(i);
                  const pct = (val / maxVal) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                      <span className="text-[10px] text-slate-400">{val}</span>
                      <div className="w-full rounded-t-sm border transition-all duration-300"
                        style={{ height: `${pct}%`, minHeight: 4, background: s.bg, borderColor: s.border }} />
                      <span className="text-[10px] text-slate-600">{i}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{ background: BG, borderColor: BORDER }}>
              <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm"
                style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm border text-slate-300"
                style={{ borderColor: BORDER }}>
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <SpeedControl animationSpeed={speed} setAnimationSpeed={setSpeed} isAnimating={playing} />
            </div>

            <ExplanationPanel steps={steps.map(s => s.explanation)} currentStep={stepIdx} totalSteps={steps.length} />
          </div>

          <div className="h-[500px] xl:h-auto">
            <CodePanel code={CODE} highlightLine={cur?.line ?? null} language="python" />
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
