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
  pseudo: `KADANE(arr):
  current_sum ← 0
  max_sum ← -∞
  start ← 0, end ← 0, temp_start ← 0

  FOR i ← 0 TO length(arr) - 1:
    current_sum ← current_sum + arr[i]

    IF current_sum > max_sum:
      max_sum ← current_sum
      start ← temp_start
      end ← i

    IF current_sum < 0:
      current_sum ← 0
      temp_start ← i + 1

  RETURN max_sum, start, end`,
  python: `def kadanes_algorithm(arr):
    current_sum = 0
    max_sum = float('-inf')
    start = 0
    end = 0
    temp_start = 0

    for i in range(len(arr)):
        current_sum += arr[i]

        if current_sum > max_sum:
            max_sum = current_sum
            start = temp_start
            end = i

        if current_sum < 0:
            current_sum = 0
            temp_start = i + 1

    return max_sum, start, end`,
  javascript: `function kadanesAlgorithm(arr) {
  let currentSum = 0;
  let maxSum = -Infinity;
  let start = 0, end = 0, tempStart = 0;

  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];

    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
    }

    if (currentSum < 0) {
      currentSum = 0;
      tempStart = i + 1;
    }
  }

  return { maxSum, start, end };
}`,
  cpp: `#include <climits>
pair<int, pair<int,int>> kadanesAlgorithm(vector<int>& arr) {
    int currentSum = 0, maxSum = INT_MIN;
    int start = 0, end = 0, tempStart = 0;

    for (int i = 0; i < arr.size(); i++) {
        currentSum += arr[i];

        if (currentSum > maxSum) {
            maxSum = currentSum;
            start = tempStart;
            end = i;
        }

        if (currentSum < 0) {
            currentSum = 0;
            tempStart = i + 1;
        }
    }
    return {maxSum, {start, end}};
}`,
};

function buildSteps(arr) {
  const steps = [];
  let currentSum = 0;
  let maxSum = Number.NEGATIVE_INFINITY;
  let maxStart = 0;
  let maxEnd = 0;
  let currentStart = 0;

  // Initial step
  steps.push({
    index: -1,
    currentSum: 0,
    maxSum: Number.NEGATIVE_INFINITY,
    maxStart: 0,
    maxEnd: 0,
    currentStart: 0,
    line: 1,
    explanation: `Initialize: current_sum = 0, max_sum = -∞. Ready to find maximum subarray.`,
  });

  for (let i = 0; i < arr.length; i++) {
    const element = arr[i];

    // Check if current sum is negative -> restart
    if (currentSum < 0) {
      currentSum = element;
      currentStart = i;
      steps.push({
        index: i,
        currentSum,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        line: 4,
        explanation: `arr[${i}] = ${element}. Current sum was negative, so start new subarray at index ${i}. current_sum = ${currentSum}.`,
      });
    } else {
      currentSum += element;
      steps.push({
        index: i,
        currentSum,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        line: 4,
        explanation: `arr[${i}] = ${element}. Adding to current subarray. current_sum = ${currentSum}.`,
      });
    }

    // Check if current sum is greater than max
    if (currentSum > maxSum) {
      maxSum = currentSum;
      maxStart = currentStart;
      maxEnd = i;
      steps.push({
        index: i,
        currentSum,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        line: 7,
        explanation: `New maximum found! max_sum updated to ${maxSum}, subarray [${maxStart}..${maxEnd}].`,
      });
    } else if (currentSum < 0) {
      steps.push({
        index: i,
        currentSum,
        maxSum,
        maxStart,
        maxEnd,
        currentStart,
        line: 12,
        explanation: `Current sum ${currentSum} is negative. Will reset at next element.`,
      });
    }
  }

  steps.push({
    index: arr.length - 1,
    currentSum,
    maxSum,
    maxStart,
    maxEnd,
    currentStart,
    line: 16,
    explanation: `Algorithm complete! Maximum subarray sum = ${maxSum}, from index ${maxStart} to ${maxEnd}.`,
  });

  return steps;
}

function generateRandomArray() {
  const length = Math.floor(Math.random() * 3) + 8;
  return Array.from({ length }, () => {
    const val = Math.floor(Math.random() * 21) - 10;
    return val === 0 ? 1 : val;
  });
}

export default function Kadane() {
  const [arr, setArr] = useState(() => [-2, 1, -3, 4, -1, 2, 1, -5, 4]);
  const [customInput, setCustomInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timer = useRef(null);
  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => {
    clearInterval(timer.current);
    setPlaying(false);
    setStepIdx(0);
    setStarted(false);
    setSteps([]);
  }, []);

  const shuffle = () => {
    reset();
    setArr(generateRandomArray());
    setCustomInput("");
  };

  const applyCustom = () => {
    reset();
    const parsed = customInput
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n));
    if (parsed.length < 2) return;
    setArr(parsed);
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

  const getCellStyle = (i) => {
    if (!cur || cur.index < 0) {
      return {
        bg: arr[i] >= 0 ? "oklch(0.2 0.03 240)" : "oklch(0.22 0.08 20)",
        border: arr[i] >= 0 ? BORDER : "oklch(0.4 0.12 20)",
        text: arr[i] >= 0 ? "rgb(148 163 184)" : "oklch(0.7 0.12 20)",
        scale: "1",
      };
    }

    const isCurrent = i === cur.index;
    const isInMaxSubarray =
      cur.maxSum > Number.NEGATIVE_INFINITY &&
      i >= cur.maxStart &&
      i <= cur.maxEnd;
    const isInCurrentSubarray =
      i >= cur.currentStart && i <= cur.index && cur.currentSum > 0;

    if (isCurrent) {
      return {
        bg: "oklch(0.22 0.14 80 / 0.4)",
        border: "oklch(0.8 0.18 80)",
        text: "oklch(0.95 0.15 80)",
        scale: "1.1",
      };
    }
    if (isInMaxSubarray) {
      return {
        bg: "oklch(0.18 0.12 145 / 0.3)",
        border: "oklch(0.55 0.15 145)",
        text: "oklch(0.75 0.15 145)",
        scale: "1.05",
      };
    }
    if (isInCurrentSubarray) {
      return {
        bg: "oklch(0.75 0.18 195 / 0.1)",
        border: "oklch(0.55 0.15 195)",
        text: "oklch(0.85 0.12 195)",
        scale: "1",
      };
    }
    if (arr[i] < 0) {
      return {
        bg: "oklch(0.22 0.08 20)",
        border: "oklch(0.4 0.12 20)",
        text: "oklch(0.7 0.12 20)",
        scale: "1",
      };
    }
    return {
      bg: "oklch(0.2 0.03 240)",
      border: BORDER,
      text: "rgb(148 163 184)",
      scale: "1",
    };
  };

  return (
    <>
      <SEO data={{ title: "Kadane's Algorithm" }} />
      <AlgoPageLayout
        title="Kadane's Algorithm"
        category="Array & LinkedList"
        categoryHref="/array-linkedlist"
        timeComplexity="O(n)"
        spaceComplexity="O(1)"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Custom input */}
            <div
              className="rounded-xl border p-4"
              style={{ background: BG, borderColor: BORDER }}
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Custom Array
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-slate-500 mb-1 block">
                    Comma-separated integers
                  </label>
                  <input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. -2, 1, -3, 4, -1, 2, 1, -5, 4"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-colors"
                    style={{
                      background: "oklch(0.17 0.03 240)",
                      border: `1px solid ${BORDER}`,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = CYAN)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={applyCustom}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}
                  >
                    Apply
                  </button>
                  <button
                    onClick={shuffle}
                    className="px-3 py-2 rounded-lg transition-all border"
                    style={{ borderColor: BORDER, color: "rgb(148 163 184)" }}
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Visualization */}
            <div
              className="rounded-xl border p-5"
              style={{ background: BG, borderColor: BORDER }}
            >
              {/* Info bar */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {cur && cur.maxSum > Number.NEGATIVE_INFINITY && (
                    <span
                      className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{
                        background: "oklch(0.18 0.12 145 / 0.3)",
                        color: "oklch(0.75 0.15 145)",
                      }}
                    >
                      Max Sum: {cur.maxSum}
                    </span>
                  )}
                  {cur && cur.currentSum !== 0 && (
                    <span
                      className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{
                        background: "oklch(0.75 0.18 195 / 0.1)",
                        color: CYAN,
                      }}
                    >
                      Current Sum: {cur.currentSum}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ background: "oklch(0.8 0.18 80)" }}
                    />
                    Current
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ background: "oklch(0.75 0.18 195 / 0.3)" }}
                    />
                    Subarray
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ background: "oklch(0.55 0.15 145)" }}
                    />
                    Max
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ background: "oklch(0.4 0.12 20)" }}
                    />
                    Negative
                  </span>
                </div>
              </div>

              {/* Array cells */}
              <div className="flex flex-wrap gap-2 justify-center">
                {arr.map((val, i) => {
                  const c = getCellStyle(i);
                  return (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-1 transition-all duration-300"
                    >
                      <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center font-bold text-base border transition-all duration-300"
                        style={{
                          background: c.bg,
                          borderColor: c.border,
                          color: c.text,
                          transform: `scale(${c.scale})`,
                        }}
                      >
                        {val}
                      </div>
                      <span className="text-xs text-slate-600">{i}</span>
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
                )}{" "}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300"
                style={{ borderColor: BORDER }}
              >
                <RotateCcw className="w-4 h-4" /> Reset
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
