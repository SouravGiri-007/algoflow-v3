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
  pseudo: `MERGE-SORT(arr, left, right):
  if left < right:
    mid = floor((left + right) / 2)
    MERGE-SORT(arr, left, mid)
    MERGE-SORT(arr, mid + 1, right)
    MERGE(arr, left, mid, right)

MERGE(arr, left, mid, right):
  leftArr = arr[left..mid]
  rightArr = arr[mid+1..right]
  i = 0, j = 0, k = left
  while i < len(leftArr) and j < len(rightArr):
    if leftArr[i] <= rightArr[j]:
      arr[k] = leftArr[i]; i++
    else:
      arr[k] = rightArr[j]; j++
    k++
  copy remaining elements`,
  python: `def merge_sort(arr, left, right):
    if left < right:
        mid = (left + right) // 2
        merge_sort(arr, left, mid)
        merge_sort(arr, mid + 1, right)
        merge(arr, left, mid, right)

def merge(arr, left, mid, right):
    left_arr = arr[left:mid + 1]
    right_arr = arr[mid + 1:right + 1]
    i = j = 0
    k = left
    while i < len(left_arr) and j < len(right_arr):
        if left_arr[i] <= right_arr[j]:
            arr[k] = left_arr[i]; i += 1
        else:
            arr[k] = right_arr[j]; j += 1
        k += 1
    while i < len(left_arr):
        arr[k] = left_arr[i]; i += 1; k += 1
    while j < len(right_arr):
        arr[k] = right_arr[j]; j += 1; k += 1`,
  javascript: `function mergeSort(arr, left, right) {
  if (left < right) {
    const mid = Math.floor((left + right) / 2);
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }
}

function merge(arr, left, mid, right) {
  const leftArr = arr.slice(left, mid + 1);
  const rightArr = arr.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;
  while (i < leftArr.length && j < rightArr.length) {
    if (leftArr[i] <= rightArr[j]) {
      arr[k++] = leftArr[i++];
    } else {
      arr[k++] = rightArr[j++];
    }
  }
  while (i < leftArr.length) arr[k++] = leftArr[i++];
  while (j < rightArr.length) arr[k++] = rightArr[j++];
}`,
  cpp: `void mergeSort(int arr[], int left, int right) {
  if (left < right) {
    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }
}

void merge(int arr[], int left, int mid, int right) {
  vector<int> leftArr(arr + left, arr + mid + 1);
  vector<int> rightArr(arr + mid + 1, arr + right + 1);
  int i = 0, j = 0, k = left;
  while (i < leftArr.size() && j < rightArr.size()) {
    if (leftArr[i] <= rightArr[j])
      arr[k++] = leftArr[i++];
    else
      arr[k++] = rightArr[j++];
  }
  while (i < leftArr.size()) arr[k++] = leftArr[i++];
  while (j < rightArr.size()) arr[k++] = rightArr[j++];
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
    merging: [],
    line: 1,
    explanation: `Starting MergeSort on ${n} elements. We recursively divide the array then merge sorted halves.`,
  });

  function msort(a, left, right) {
    if (left >= right) return;

    const mid = Math.floor((left + right) / 2);

    // Divide step
    steps.push({
      arr: [...a],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      merging: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      line: 3,
      explanation: `Dividing array from index ${left} to ${right} at midpoint ${mid}.`,
    });

    // Recurse left
    msort(a, left, mid);
    // Recurse right
    msort(a, mid + 1, right);

    // Merge step
    const leftArr = a.slice(left, mid + 1);
    const rightArr = a.slice(mid + 1, right + 1);

    steps.push({
      arr: [...a],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      merging: Array.from({ length: right - left + 1 }, (_, i) => left + i),
      line: 8,
      explanation: `Merging subarrays [${leftArr.join(", ")}] and [${rightArr.join(", ")}] into range [${left}..${right}].`,
    });

    let i = 0,
      j = 0,
      k = left;
    const tempArr = [...a];

    while (i < leftArr.length && j < rightArr.length) {
      // Compare step
      steps.push({
        arr: [...tempArr],
        comparing: [left + i, mid + 1 + j],
        swapping: [],
        sorted: [...sorted],
        merging: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        line: 10,
        explanation: `Comparing left[${i}]=${leftArr[i]} and right[${j}]=${rightArr[j]}.`,
      });

      if (leftArr[i] <= rightArr[j]) {
        tempArr[k] = leftArr[i];
        steps.push({
          arr: [...tempArr],
          comparing: [],
          swapping: [k],
          sorted: [...sorted],
          merging: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
          line: 11,
          explanation: `Placing ${leftArr[i]} at position ${k} (left element is smaller).`,
        });
        i++;
      } else {
        tempArr[k] = rightArr[j];
        steps.push({
          arr: [...tempArr],
          comparing: [],
          swapping: [k],
          sorted: [...sorted],
          merging: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
          line: 13,
          explanation: `Placing ${rightArr[j]} at position ${k} (right element is smaller).`,
        });
        j++;
      }
      k++;
    }

    // Copy remaining from left
    while (i < leftArr.length) {
      tempArr[k] = leftArr[i];
      steps.push({
        arr: [...tempArr],
        comparing: [],
        swapping: [k],
        sorted: [...sorted],
        merging: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        line: 15,
        explanation: `Copying remaining element ${leftArr[i]} to position ${k}.`,
      });
      i++;
      k++;
    }

    // Copy remaining from right
    while (j < rightArr.length) {
      tempArr[k] = rightArr[j];
      steps.push({
        arr: [...tempArr],
        comparing: [],
        swapping: [k],
        sorted: [...sorted],
        merging: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        line: 16,
        explanation: `Copying remaining element ${rightArr[j]} to position ${k}.`,
      });
      j++;
      k++;
    }

    // Write back
    for (let idx = left; idx <= right; idx++) {
      a[idx] = tempArr[idx];
    }

    steps.push({
      arr: [...a],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      merging: [],
      line: 5,
      explanation: `Merged range [${left}..${right}]: [${a.slice(left, right + 1).join(", ")}].`,
    });
  }

  msort(arr, 0, n - 1);

  // Mark all as sorted
  const allSorted = Array.from({ length: n }, (_, i) => i);
  steps.push({
    arr: [...arr],
    comparing: [],
    swapping: [],
    sorted: allSorted,
    merging: [],
    line: 1,
    explanation: `✅ MergeSort complete! Array is fully sorted.`,
  });

  return steps;
}

function randomArr(n = 14) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 85) + 10);
}

export default function MergeSort() {
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
    if (!cur) return { bg: "oklch(0.75 0.18 195 / 0.4)", border: CYAN };
    if (cur.sorted && cur.sorted.includes(i))
      return {
        bg: "oklch(0.18 0.12 145 / 0.4)",
        border: "oklch(0.55 0.18 145)",
      };
    if (cur.merging && cur.merging.includes(i))
      return {
        bg: "oklch(0.22 0.12 250 / 0.4)",
        border: "oklch(0.55 0.15 250)",
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
      <SEO data={{ title: "MergeSort" }} />
      <AlgoPageLayout
        title="MergeSort"
        category="Recursion"
        categoryHref="/recursion"
        timeComplexity="O(n log n)"
        spaceComplexity="O(n)"
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
                  placeholder="e.g. 38, 27, 43, 3, 9"
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
                  Placing
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ background: "oklch(0.55 0.15 250)" }}
                  />
                  Merging
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
