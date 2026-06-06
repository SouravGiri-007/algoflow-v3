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

const CODE = `def binary_search(arr, target):
    left, right = 0, len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid          # Found!

        elif arr[mid] < target:
            left = mid + 1      # Search right half

        else:
            right = mid - 1     # Search left half

    return -1                   # Not found`;

function buildSteps(arr, target) {
  const steps = [];
  let left = 0, right = arr.length - 1;

  steps.push({
    left, right, mid: null, found: -1, eliminated: [],
    line: 1,
    explanation: `Starting binary search for target ${target} in sorted array of ${arr.length} elements. left=0, right=${right}.`,
  });

  const eliminated = [];
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    steps.push({
      left, right, mid, found: -1, eliminated: [...eliminated],
      line: 4,
      explanation: `Calculating midpoint: mid = (${left} + ${right}) // 2 = ${mid}. Array[${mid}] = ${arr[mid]}.`,
    });

    if (arr[mid] === target) {
      steps.push({
        left, right, mid, found: mid, eliminated: [...eliminated],
        line: 7,
        explanation: `✅ Found! arr[${mid}] = ${arr[mid]} equals target ${target}. Returning index ${mid}.`,
      });
      return steps;
    } else if (arr[mid] < target) {
      steps.push({
        left, right, mid, found: -1, eliminated: [...eliminated],
        line: 10,
        explanation: `arr[${mid}] = ${arr[mid]} < target ${target}. Discarding left half. New left = ${mid + 1}.`,
      });
      for (let i = left; i <= mid; i++) eliminated.push(i);
      left = mid + 1;
    } else {
      steps.push({
        left, right, mid, found: -1, eliminated: [...eliminated],
        line: 13,
        explanation: `arr[${mid}] = ${arr[mid]} > target ${target}. Discarding right half. New right = ${mid - 1}.`,
      });
      for (let i = mid; i <= right; i++) eliminated.push(i);
      right = mid - 1;
    }
  }

  steps.push({
    left, right, mid: null, found: -2, eliminated: [...eliminated],
    line: 16,
    explanation: `❌ Target ${target} not found in array. Search space exhausted.`,
  });
  return steps;
}

function generateSortedArray(size = 15) {
  const set = new Set();
  while (set.size < size) set.add(Math.floor(Math.random() * 99) + 1);
  return [...set].sort((a, b) => a - b);
}

export default function BinarySearch() {
  const [arr, setArr]         = useState(() => generateSortedArray(15));
  const [target, setTarget]   = useState(() => {
    const a = generateSortedArray(15);
    return a[Math.floor(Math.random() * a.length)];
  });
  const [customInput, setCustomInput] = useState("");
  const [customTarget, setCustomTarget] = useState("");
  const [steps, setSteps]     = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed]     = useState(800);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  const currentStep = steps[stepIdx] || null;

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setPlaying(false);
    setStepIdx(0);
    setStarted(false);
    setSteps([]);
  }, []);

  const shuffle = () => {
    reset();
    const a = generateSortedArray(15);
    setArr(a);
    setTarget(a[Math.floor(Math.random() * a.length)]);
    setCustomInput("");
    setCustomTarget("");
  };

  const applyCustom = () => {
    reset();
    const parsed = customInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length < 2) return;
    const sorted = [...new Set(parsed)].sort((a, b) => a - b);
    const t = parseInt(customTarget);
    setArr(sorted);
    setTarget(isNaN(t) ? sorted[0] : t);
  };

  const start = () => {
    const s = buildSteps(arr, target);
    setSteps(s);
    setStepIdx(0);
    setStarted(true);
    setPlaying(true);
    let idx = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      idx++;
      if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; }
      setStepIdx(idx);
    }, speed);
  };

  const togglePlay = () => {
    if (!started) { start(); return; }
    if (playing) {
      clearInterval(timerRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      let idx = stepIdx;
      timerRef.current = setInterval(() => {
        idx++;
        if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length - 1); return; }
        setStepIdx(idx);
      }, speed);
    }
  };

  const getColor = (i) => {
    if (!currentStep) return { bg: BG, border: BORDER, text: "rgb(148 163 184)" };
    if (currentStep.found === i) return { bg: "oklch(0.18 0.12 145 / 0.3)", border: "oklch(0.55 0.18 145)", text: "oklch(0.75 0.18 145)" };
    if (currentStep.eliminated.includes(i)) return { bg: "oklch(0.15 0.04 240)", border: "oklch(0.2 0.04 240)", text: "oklch(0.35 0.04 240)" };
    if (currentStep.mid === i) return { bg: "oklch(0.18 0.12 60 / 0.3)", border: "oklch(0.65 0.18 60)", text: "oklch(0.85 0.18 60)" };
    if (i >= (currentStep.left ?? 0) && i <= (currentStep.right ?? arr.length - 1))
      return { bg: "oklch(0.75 0.18 195 / 0.08)", border: "oklch(0.75 0.18 195 / 0.4)", text: "white" };
    return { bg: BG, border: BORDER, text: "rgb(148 163 184)" };
  };

  const explanations = steps.map(s => s.explanation);

  return (
    <>
      <SEO data={{ title: "Binary Search" }} />
      <AlgoPageLayout
        title="Binary Search"
        category="Array & LinkedList"
        categoryHref="/array-linkedlist"
        timeComplexity="O(log n)"
        spaceComplexity="O(1)"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          {/* LEFT: visualization + controls */}
          <div className="space-y-4">
            {/* Custom input */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Custom Input</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-slate-500 mb-1 block">Sorted Array (comma separated)</label>
                  <input
                    value={customInput}
                    onChange={e => setCustomInput(e.target.value)}
                    placeholder="e.g. 2, 5, 8, 12, 16, 23, 38"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-colors"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={e => e.target.style.borderColor = CYAN}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
                <div className="w-32">
                  <label className="text-xs text-slate-500 mb-1 block">Target</label>
                  <input
                    value={customTarget}
                    onChange={e => setCustomTarget(e.target.value)}
                    placeholder="e.g. 16"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={e => e.target.style.borderColor = CYAN}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button onClick={applyCustom}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                    Apply
                  </button>
                  <button onClick={shuffle}
                    className="px-3 py-2 rounded-lg transition-all border"
                    style={{ borderColor: BORDER, color: "rgb(148 163 184)" }}>
                    <Shuffle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Array visualization */}
            <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">Searching for:</span>
                  <span className="px-3 py-1 rounded-lg font-bold text-sm"
                    style={{ background: "oklch(0.75 0.18 195 / 0.15)", color: CYAN }}>
                    {target}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "oklch(0.65 0.18 60)" }} />Mid</span>
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
                        style={{ background: c.bg, borderColor: c.border, color: c.text }}>
                        {val}
                      </div>
                      <span className="text-xs text-slate-600">{i}</span>
                      {currentStep?.left === i && <span className="text-[9px] font-bold" style={{ color: CYAN }}>L</span>}
                      {currentStep?.right === i && <span className="text-[9px] font-bold" style={{ color: CYAN }}>R</span>}
                      {currentStep?.mid === i && <span className="text-[9px] font-bold" style={{ color: "oklch(0.85 0.18 60)" }}>M</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border p-4 flex flex-wrap items-center gap-3" style={{ background: BG, borderColor: BORDER }}>
              <button onClick={togglePlay}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
                style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button onClick={reset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm border transition-all text-slate-300"
                style={{ borderColor: BORDER }}>
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <SpeedControl animationSpeed={speed} setAnimationSpeed={setSpeed} isAnimating={playing} />
            </div>

            {/* Explanation */}
            <ExplanationPanel
              steps={explanations}
              currentStep={stepIdx}
              totalSteps={steps.length}
            />
          </div>

          {/* RIGHT: code panel */}
          <div className="h-[500px] xl:h-auto xl:min-h-[600px]">
            <CodePanel
              codes={CODE}
              highlightLine={currentStep?.line ?? null}
              language="python"
            />
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
