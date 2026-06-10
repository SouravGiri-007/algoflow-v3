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
  pseudo: `QUICK-SORT(arr, low, high):
  if low < high:
    pi = PARTITION(arr, low, high)
    QUICK-SORT(arr, low, pi - 1)
    QUICK-SORT(arr, pi + 1, high)

PARTITION(arr, low, high):
  pivot = arr[high]
  i = low - 1
  for j from low to high - 1:
    if arr[j] < pivot:
      i = i + 1
      swap arr[i] and arr[j]
  swap arr[i+1] and arr[high]
  return i + 1`,
  python: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
  javascript: `function quickSort(arr, low, high) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
  cpp: `void quickSort(int arr[], int low, int high) {
  if (low < high) {
    int pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

int partition(int arr[], int low, int high) {
  int pivot = arr[high];
  int i = low - 1;
  for (int j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      swap(arr[i], arr[j]);
    }
  }
  swap(arr[i + 1], arr[high]);
  return i + 1;
}`,
};

function buildSteps(input) {
  const arr = [...input];
  const n = arr.length;
  const steps = [];
  const sorted = [];

  steps.push({
    arr: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    pivot: [],
    line: 1,
    explanation: `Starting QuickSort on ${n} elements. We pick a pivot and partition elements around it.`,
  });

  function qsort(a, low, high) {
    if (low >= high) {
      if (low === high && !sorted.includes(low)) {
        sorted.push(low);
      }
      return;
    }

    // Partition start
    const pivotVal = a[high];
    steps.push({
      arr: [...a],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      pivot: [high],
      line: 8,
      explanation: `Partitioning range [${low}..${high}] with pivot ${pivotVal} at index ${high}.`,
    });

    let i = low - 1;
    for (let j = low; j < high; j++) {
      // Compare step
      steps.push({
        arr: [...a],
        comparing: [j, high],
        swapping: [],
        sorted: [...sorted],
        pivot: [high],
        line: 11,
        explanation: `Comparing arr[${j}]=${a[j]} with pivot ${pivotVal}.`,
      });

      if (a[j] < pivotVal) {
        i++;
        if (i !== j) {
          // Swap step
          steps.push({
            arr: [...a],
            comparing: [],
            swapping: [i, j],
            sorted: [...sorted],
            pivot: [high],
            line: 13,
            explanation: `arr[${j}]=${a[j]} < pivot ${pivotVal}, swap arr[${i}]=${a[i]} and arr[${j}]=${a[j]}.`,
          });
          [a[i], a[j]] = [a[j], a[i]];
        }
      }
    }

    // Pivot placement
    const pi = i + 1;
    if (pi !== high) {
      steps.push({
        arr: [...a],
        comparing: [],
        swapping: [pi, high],
        sorted: [...sorted],
        pivot: [high],
        line: 14,
        explanation: `Placing pivot ${pivotVal} at its correct position index ${pi}.`,
      });
      [a[pi], a[high]] = [a[high], a[pi]];
    }

    sorted.push(pi);
    steps.push({
      arr: [...a],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      pivot: [],
      line: 15,
      explanation: `Pivot ${a[pi]} is now in its final sorted position at index ${pi}.`,
    });

    // Recurse left
    qsort(a, low, pi - 1);
    // Recurse right
    qsort(a, pi + 1, high);
  }

  qsort(arr, 0, n - 1);

  // Mark all as sorted
  const allSorted = Array.from({ length: n }, (_, i) => i);
  steps.push({
    arr: [...arr],
    comparing: [],
    swapping: [],
    sorted: allSorted,
    pivot: [],
    line: 4,
    explanation: `✅ QuickSort complete! Array is fully sorted.`,
  });

  return steps;
}

function randomArr(n = 14) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 85) + 10);
}

export default function QuickSort() {
  const [arr, setArr] = useState(() => randomArr());
  const [customInput, setCustomInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [started, setStarted] = useState(false);
  const timer = useRef(null);
  const cur = steps[stepIdx] || null;
  const display = cur ? cur.arr : arr;
  const maxVal = Math.max(...display, 1);

  const reset = useCallback(() => {
    clearInterval(timer.current);
    setPlaying(false);
    setStepIdx(0);
    setStarted(false);
    setSteps([]);
  }, []);

  const shuffle = () => {
    reset();
    setArr(randomArr());
    setCustomInput("");
  };

  const applyCustom = () => {
    reset();
    const p = customInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
    if (p.length >= 2) setArr(p.slice(0, 18));
  };

  const run = (s) => {
    setSteps(s);
    setStepIdx(0);
    setStarted(true);
    setPlaying(true);
    let idx = 0;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      idx++;
      if (idx >= s.length) {
        clearInterval(timer.current);
        setPlaying(false);
        setStepIdx(s.length - 1);
        return;
      }
      setStepIdx(idx);
    }, speed);
  };

  const togglePlay = () => {
    if (!started) {
      run(buildSteps(arr));
      return;
    }
    if (playing) {
      clearInterval(timer.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      let idx = stepIdx;
      timer.current = setInterval(() => {
        idx++;
        if (idx >= steps.length) {
          clearInterval(timer.current);
          setPlaying(false);
          setStepIdx(steps.length - 1);
          return;
        }
        setStepIdx(idx);
      }, speed);
    }
  };

  const getBar = (i) => {
    if (!cur)
      return { bg: "oklch(0.75 0.18 195 / 0.4)", border: CYAN };
    if (cur.sorted && cur.sorted.includes(i))
      return {
        bg: "oklch(0.18 0.12 145 / 0.4)",
        border: "oklch(0.55 0.18 145)",
      };
    if (cur.pivot && cur.pivot.includes(i))
      return {
        bg: "oklch(0.22 0.12 300 / 0.5)",
        border: "oklch(0.65 0.18 300)",
      };
    if (cur.swapping && cur.swapping.includes(i))
      return {
        bg: "oklch(0.22 0.12 30 / 0.5)",
        border: "oklch(0.65 0.18 30)",
      };
    if (cur.comparing && cur.comparing.includes(i))
      return {
        bg: "oklch(0.22 0.12 60 / 0.5)",
        border: "oklch(0.65 0.18 60)",
      };
    return {
      bg: "oklch(0.75 0.18 195 / 0.2)",
      border: "oklch(0.75 0.18 195 / 0.4)",
    };
  };

  return (
    <>
      <SEO data={{ title: "QuickSort" }} />
      <AlgoPageLayout
        title="QuickSort"
        category="Recursion"
        categoryHref="/recursion"
        timeComplexity="O(n log n)"
        spaceComplexity="O(log n)"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Custom input */}
            <div
              className="rounded-xl border p-4"
              style={{ background: BG, borderColor: BORDER }}
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Custom Input
              </p>
              <div className="flex gap-3 flex-wrap">
                <input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 64, 34, 25, 12, 22"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{
                    background: "oklch(0.17 0.03 240)",
                    border: `1px solid ${BORDER}`,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = CYAN)}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />
                <button
                  onClick={applyCustom}
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}
                >
                  Apply
                </button>
                <button
                  onClick={shuffle}
                  className="px-3 py-2 rounded-lg border text-slate-400"
                  style={{ borderColor: BORDER }}
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bar chart visualization */}
            <div
              className="rounded-xl border p-5"
              style={{ background: BG, borderColor: BORDER }}
            >
              <div className="flex gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: "oklch(0.65 0.18 60)" }}
                  />
                  Comparing
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: "oklch(0.65 0.18 30)" }}
                  />
                  Swapping
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: "oklch(0.65 0.18 300)" }}
                  />
                  Pivot
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: "oklch(0.55 0.18 145)" }}
                  />
                  Sorted
                </span>
              </div>
              <div className="flex items-end gap-1.5 h-48 justify-center">
                {display.map((val, i) => {
                  const s = getBar(i);
                  const pct = (val / maxVal) * 100;
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1 flex-1 min-w-0"
                    >
                      <span className="text-[10px] text-slate-400">{val}</span>
                      <div
                        className="w-full rounded-t-sm border transition-all duration-200"
                        style={{
                          height: `${pct}%`,
                          minHeight: 4,
                          background: s.bg,
                          borderColor: s.border,
                        }}
                      />
                      <span className="text-[10px] text-slate-600">{i}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div
              className="rounded-xl border p-4 flex flex-wrap gap-3"
              style={{ background: BG, borderColor: BORDER }}
            >
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm"
                style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}
              >
                {playing ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300"
                style={{ borderColor: BORDER }}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <SpeedControl
                animationSpeed={speed}
                setAnimationSpeed={setSpeed}
                isAnimating={playing}
              />
            </div>
            <ExplanationPanel
              steps={steps.map((s) => s.explanation)}
              currentStep={stepIdx}
              totalSteps={steps.length}
            />
          </div>
          <div className="h-[500px] xl:h-auto xl:min-h-[600px]">
            <CodePanel codes={CODES} highlightLine={cur?.line ?? null} />
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
