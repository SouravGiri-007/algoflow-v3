import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN = "oklch(0.75 0.18 195)";
const BG = "oklch(0.13 0.025 240)";
const BORDER = "oklch(0.22 0.04 240)";

const CODES = {
  pseudo: `DYNAMIC_ARRAY_INSERT(arr, size, capacity, value):
  IF size >= capacity:
    newCapacity ← capacity × 2
    newArr ← new array of size newCapacity

    FOR i ← 0 TO size - 1:
      newArr[i] ← arr[i]

    arr ← newArr
    capacity ← newCapacity

  arr[size] ← value
  size ← size + 1
  RETURN arr, size, capacity`,
  python: `def dynamic_array_insert(arr, capacity, value):
    if len(arr) >= capacity:
        new_capacity = capacity * 2
        new_arr = [None] * new_capacity
        for i in range(len(arr)):
            new_arr[i] = arr[i]
        arr = new_arr
        capacity = new_capacity

    arr.append(value)
    return arr, capacity`,
  javascript: `function dynamicArrayInsert(arr, capacity, value) {
  if (arr.length >= capacity) {
    const newCapacity = capacity * 2;
    const newArr = new Array(newCapacity).fill(null);
    for (let i = 0; i < arr.length; i++) {
      newArr[i] = arr[i];
    }
    arr = newArr;
    capacity = newCapacity;
  }

  arr[arr.length] = value;
  return { arr, capacity };
}`,
  cpp: `void dynamicArrayInsert(int*& arr, int& size, int& capacity, int value) {
    if (size >= capacity) {
        int newCapacity = capacity * 2;
        int* newArr = new int[newCapacity];
        for (int i = 0; i < size; i++) {
            newArr[i] = arr[i];
        }
        delete[] arr;
        arr = newArr;
        capacity = newCapacity;
    }
    arr[size++] = value;
}`,
};

function buildSteps(arr, capacity, value) {
  const steps = [];
  const currentArray = [...arr];
  const currentCap = capacity;
  const numVal = parseInt(value);

  // Step 1: Show trying to insert when array is full
  steps.push({
    array: [...currentArray],
    capacity: currentCap,
    newArray: [],
    newCapacity: 0,
    showNewArray: false,
    highlightIndices: [],
    copyingIndex: -1,
    line: 1,
    explanation: `Trying to insert ${numVal}. Array is full (${currentArray.length}/${currentCap})! Resize needed.`,
  });

  // Step 2: Create new array with double capacity
  const newCap = currentCap * 2;
  steps.push({
    array: [...currentArray],
    capacity: currentCap,
    newArray: new Array(newCap).fill(null),
    newCapacity: newCap,
    showNewArray: true,
    highlightIndices: [],
    copyingIndex: -1,
    line: 3,
    explanation: `Creating new array with double capacity: ${newCap}.`,
  });

  // Step 3-N: Copy each element one by one
  for (let i = 0; i < currentArray.length; i++) {
    const tempNewArray = new Array(newCap).fill(null);
    for (let j = 0; j <= i; j++) {
      tempNewArray[j] = currentArray[j];
    }
    steps.push({
      array: [...currentArray],
      capacity: currentCap,
      newArray: [...tempNewArray],
      newCapacity: newCap,
      showNewArray: true,
      highlightIndices: [i],
      copyingIndex: i,
      line: 6,
      explanation: `Copying element ${currentArray[i]} to position ${i} in new array.`,
    });
  }

  // Step N+1: Add new element
  const finalArray = [...currentArray, numVal];
  const tempNewArray = new Array(newCap).fill(null);
  for (let j = 0; j < finalArray.length; j++) {
    tempNewArray[j] = finalArray[j];
  }
  steps.push({
    array: [...currentArray],
    capacity: currentCap,
    newArray: [...tempNewArray],
    newCapacity: newCap,
    showNewArray: true,
    highlightIndices: [finalArray.length - 1],
    copyingIndex: finalArray.length - 1,
    line: 9,
    explanation: `Inserting new element ${numVal} at position ${finalArray.length - 1}.`,
  });

  // Step N+2: Replace old array
  steps.push({
    array: [...finalArray],
    capacity: newCap,
    newArray: [],
    newCapacity: 0,
    showNewArray: false,
    highlightIndices: [finalArray.length - 1],
    copyingIndex: -1,
    line: 10,
    explanation: `Replacing old array. New capacity: ${newCap}, Size: ${finalArray.length}.`,
  });

  // Final step
  steps.push({
    array: [...finalArray],
    capacity: newCap,
    newArray: [],
    newCapacity: 0,
    showNewArray: false,
    highlightIndices: [],
    copyingIndex: -1,
    line: 12,
    explanation: `Dynamic array resize complete! Ready for more insertions.`,
  });

  return steps;
}

const INITIAL_ARRAY = [5, 3, 8, 1, 9];
const INITIAL_CAPACITY = 5;

export default function DynamicArray() {
  const [array, setArray] = useState([...INITIAL_ARRAY]);
  const [capacity, setCapacity] = useState(INITIAL_CAPACITY);
  const [inputValue, setInputValue] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timer = useRef(null);
  const cur = steps[stepIdx] || null;

  // Derived display state
  const displayArray = cur ? cur.array : array;
  const displayCapacity = cur ? cur.capacity : capacity;
  const displayNewArray = cur ? cur.newArray : [];
  const displayNewCapacity = cur ? cur.newCapacity : 0;
  const displayShowNewArray = cur ? cur.showNewArray : false;
  const displayHighlightIndices = cur ? cur.highlightIndices : [];
  const displayCopyingIndex = cur ? cur.copyingIndex : -1;

  const reset = useCallback(() => {
    clearInterval(timer.current);
    setPlaying(false);
    setStepIdx(0);
    setStarted(false);
    setSteps([]);
    setArray([...INITIAL_ARRAY]);
    setCapacity(INITIAL_CAPACITY);
    setInputValue("");
  }, []);

  const handleInsert = () => {
    if (!inputValue) return;
    const numVal = parseInt(inputValue);
    if (isNaN(numVal)) return;

    // If not full, do simple insert without animation
    if (array.length < capacity && !started) {
      const newArr = [...array, numVal];
      setArray(newArr);
      setInputValue("");
      return;
    }

    // If full, animate resize
    const s = buildSteps(array, capacity, inputValue);
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
        // Update base state to final
        const finalStep = s[s.length - 1];
        setArray([...finalStep.array]);
        setCapacity(finalStep.capacity);
        setInputValue("");
        return;
      }
      setStepIdx(idx);
    }, speed);
  };

  const togglePlay = () => {
    if (!started) {
      handleInsert();
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
          const finalStep = steps[steps.length - 1];
          setArray([...finalStep.array]);
          setCapacity(finalStep.capacity);
          setInputValue("");
          return;
        }
        setStepIdx(idx);
      }, speed);
    }
  };

  const renderArraySlots = (arr, cap, isNew = false) => {
    const slots = [];
    for (let i = 0; i < cap; i++) {
      const value = i < arr.length ? arr[i] : null;
      const isEmpty = value === null;
      const isHighlighted = displayHighlightIndices.includes(i) && (isNew || !displayShowNewArray);
      const isHighlightedInNew = displayHighlightIndices.includes(i) && isNew;
      const isCopying = displayCopyingIndex === i && (isNew || !displayShowNewArray);
      const isCopyingInNew = displayCopyingIndex === i && isNew;
      const active = isHighlighted || isHighlightedInNew || isCopying || isCopyingInNew;

      let bgColor, borderColorVal, textColor;
      if (isEmpty) {
        bgColor = "oklch(0.15 0.03 240)";
        borderColorVal = "oklch(0.25 0.04 240)";
        textColor = "oklch(0.35 0.04 240)";
      } else if (active) {
        bgColor = "oklch(0.75 0.18 195 / 0.2)";
        borderColorVal = CYAN;
        textColor = "#fff";
      } else if (isNew && !isEmpty) {
        bgColor = "oklch(0.22 0.05 240)";
        borderColorVal = "oklch(0.4 0.06 240)";
        textColor = "rgb(203 213 225)";
      } else if (!isEmpty) {
        bgColor = "oklch(0.2 0.04 240)";
        borderColorVal = "oklch(0.35 0.05 240)";
        textColor = "rgb(203 213 225)";
      }

      slots.push(
        <div key={`${isNew ? "new" : "old"}-${i}`} className="flex flex-col items-center gap-1">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-lg font-bold text-sm border transition-all duration-300"
            style={{
              background: bgColor,
              borderColor: borderColorVal,
              color: textColor,
              transform: active ? "scale(1.1)" : "scale(1)",
            }}
          >
            {!isEmpty ? value : ""}
          </div>
          <span className="text-xs text-slate-600">{i}</span>
        </div>
      );
    }
    return slots;
  };

  return (
    <>
      <SEO data={{ title: "Dynamic Array Resizing" }} />
      <AlgoPageLayout
        title="Dynamic Array Resizing"
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
                Insert Element
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="w-40">
                  <label className="text-xs text-slate-500 mb-1 block">
                    Value to insert
                  </label>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="e.g. 7"
                    disabled={playing}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none transition-colors"
                    style={{
                      background: "oklch(0.17 0.03 240)",
                      border: `1px solid ${BORDER}`,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = CYAN)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                </div>
                <button
                  onClick={handleInsert}
                  disabled={playing || !inputValue}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}
                >
                  Insert
                </button>
              </div>
              <div className="mt-2 flex gap-3 text-xs text-slate-500">
                <span>
                  Size: {displayArray.length} / Capacity: {displayCapacity}
                </span>
                <span>
                  Load Factor: {((displayArray.length / displayCapacity) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Visualization */}
            <div
              className="rounded-xl border p-5"
              style={{ background: BG, borderColor: BORDER }}
            >
              <div className="space-y-6">
                {/* Current Array */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3 text-center">
                    {displayShowNewArray ? "Current Array (Old)" : "Current Array"}
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center min-h-[70px]">
                    {renderArraySlots(displayArray, displayCapacity, false)}
                  </div>
                </div>

                {/* New Array (shown during resizing) */}
                {displayShowNewArray && (
                  <div>
                    <div
                      className="rounded-lg border p-4"
                      style={{
                        background: "oklch(0.75 0.18 195 / 0.04)",
                        borderColor: "oklch(0.55 0.12 195 / 0.3)",
                      }}
                    >
                      <h3
                        className="text-sm font-semibold mb-3 text-center"
                        style={{ color: CYAN }}
                      >
                        New Array (Double Capacity: {displayNewCapacity})
                      </h3>
                      <div className="flex flex-wrap gap-2 justify-center min-h-[70px]">
                        {renderArraySlots(displayNewArray, displayNewCapacity, true)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div
              className="rounded-xl border p-4 flex flex-wrap gap-3"
              style={{ background: BG, borderColor: BORDER }}
            >
              <button
                onClick={togglePlay}
                disabled={!inputValue && !started}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-40"
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
