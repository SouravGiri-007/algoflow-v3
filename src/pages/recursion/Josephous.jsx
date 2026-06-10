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
  pseudo: `JOSEPHUS(n, k):
  res = 0
  for i = 2 to n:
    res = (res + k) mod i
  return res  // 0-based index

JOSEPHUS-RECURSIVE(n, k):
  if n == 1:
    return 0
  return (JOSEPHUS-RECURSIVE(n-1, k) + k) mod n`,
  python: `# Iterative
def josephus(n, k):
    res = 0
    for i in range(2, n + 1):
        res = (res + k) % i
    return res  # 0-based

# Recursive
def josephus_recursive(n, k):
    if n == 1:
        return 0
    return (josephus_recursive(n - 1, k) + k) % n`,
  javascript: `// Iterative
function josephus(n, k) {
  let res = 0;
  for (let i = 2; i <= n; i++) {
    res = (res + k) % i;
  }
  return res; // 0-based
}

// Recursive
function josephusRecursive(n, k) {
  if (n === 1) return 0;
  return (josephusRecursive(n - 1, k) + k) % n;
}`,
  cpp: `// Iterative
int josephus(int n, int k) {
  int res = 0;
  for (int i = 2; i <= n; i++)
    res = (res + k) % i;
  return res; // 0-based
}

// Recursive
int josephusRecursive(int n, int k) {
  if (n == 1) return 0;
  return (josephusRecursive(n - 1, k) + k) % n;
}`,
};

function buildSteps(n, k) {
  const steps = [];
  const people = Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    eliminated: false,
  }));
  const eliminationOrder = [];
  let currentList = Array.from({ length: n }, (_, i) => i);
  let pos = 0;

  steps.push({
    people: people.map((p) => ({ ...p })),
    eliminationOrder: [],
    currentPos: 0,
    targetId: null,
    line: 0,
    explanation: `Josephus Problem: ${n} people in a circle, eliminate every ${k}-th person. J(n,k) = (J(n-1,k) + k) % n.`,
  });

  for (let round = 0; round < n - 1; round++) {
    pos = (pos + k - 1) % currentList.length;
    const eliminatedIdx = currentList[pos];
    const eliminatedPerson = eliminatedIdx + 1;

    // Highlight target
    steps.push({
      people: people.map((p) => ({ ...p })),
      eliminationOrder: [...eliminationOrder],
      currentPos: pos,
      targetId: eliminatedPerson,
      line: 3,
      explanation: `Round ${round + 1}: Counting ${k} steps from current position → Person ${eliminatedPerson} is targeted.`,
    });

    // Eliminate
    people[eliminatedIdx].eliminated = true;
    eliminationOrder.push(eliminatedPerson);
    currentList.splice(pos, 1);
    if (pos === currentList.length) pos = 0;

    steps.push({
      people: people.map((p) => ({ ...p })),
      eliminationOrder: [...eliminationOrder],
      currentPos: pos,
      targetId: null,
      line: 4,
      explanation: `Person ${eliminatedPerson} eliminated! ${currentList.length} people remaining.`,
    });
  }

  // Survivor
  const survivorIdx = currentList[0];
  const survivor = survivorIdx + 1;

  // Recursive formula verification
  let res = 0;
  for (let i = 2; i <= n; i++) res = (res + k) % i;

  steps.push({
    people: people.map((p) => ({ ...p })),
    eliminationOrder: [...eliminationOrder],
    currentPos: 0,
    targetId: null,
    line: 5,
    explanation: `✅ Survivor: Person ${survivor}! Mathematical formula J(${n},${k}) = ${res + 1} (1-based).`,
  });

  return steps;
}

function getPersonPosition(index, total) {
  const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
  const radius = Math.min(150, 100 + total * 3);
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  return { x, y };
}

const N_OPTIONS = [5, 6, 7, 8, 9, 10, 12, 15, 20];
const K_OPTIONS = [2, 3, 4, 5, 6, 7, 8];

export default function Josephous() {
  const [n, setN] = useState(7);
  const [k, setK] = useState(3);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timer = useRef(null);
  const cur = steps[stepIdx] || null;

  const people = cur
    ? cur.people
    : Array.from({ length: n }, (_, i) => ({ id: i + 1, eliminated: false }));
  const eliminationOrder = cur?.eliminationOrder ?? [];
  const targetId = cur?.targetId ?? null;

  const reset = useCallback(() => {
    clearInterval(timer.current);
    setPlaying(false);
    setStepIdx(0);
    setStarted(false);
    setSteps([]);
  }, []);

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
      run(buildSteps(n, k));
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

  const selectN = (val) => {
    if (started) return;
    setN(val);
  };

  const selectK = (val) => {
    if (started) return;
    setK(val);
  };

  const getPersonColor = (person) => {
    if (person.eliminated) return { fill: "oklch(0.35 0.1 25 / 0.4)", stroke: "oklch(0.5 0.12 25)", text: "oklch(0.5 0.06 25)" };
    if (targetId && person.id === targetId) return { fill: "oklch(0.65 0.18 55 / 0.5)", stroke: "oklch(0.75 0.2 55)", text: "#fff" };
    if (eliminationOrder.length === 0 && !person.eliminated) return { fill: "oklch(0.5 0.04 240 / 0.4)", stroke: "oklch(0.4 0.06 240)", text: "oklch(0.7 0.04 230)" };
    return { fill: CYAN, stroke: CYAN, text: "#fff" };
  };

  // For the survivor highlight on last step
  const isLastStep = cur && stepIdx === steps.length - 1 && steps.length > 0;

  return (
    <>
      <SEO data={{ title: "Josephus Problem" }} />
      <AlgoPageLayout title="Josephus Problem" category="Recursion" categoryHref="/recursion" timeComplexity="O(n)" spaceComplexity="O(1)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Config */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Parameters</p>
              <div className="flex gap-6 flex-wrap">
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">People (n)</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {N_OPTIONS.map((val) => (
                      <button
                        key={val}
                        onClick={() => selectN(val)}
                        disabled={started}
                        className="w-9 h-9 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                        style={{
                          background: n === val ? CYAN : "oklch(0.17 0.03 240)",
                          color: n === val ? "oklch(0.1 0.02 240)" : "oklch(0.65 0.04 230)",
                          borderWidth: 1,
                          borderColor: n === val ? CYAN : BORDER,
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-2 block">Step (k)</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {K_OPTIONS.map((val) => (
                      <button
                        key={val}
                        onClick={() => selectK(val)}
                        disabled={started}
                        className="w-9 h-9 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                        style={{
                          background: k === val ? CYAN : "oklch(0.17 0.03 240)",
                          color: k === val ? "oklch(0.1 0.02 240)" : "oklch(0.65 0.04 230)",
                          borderWidth: 1,
                          borderColor: k === val ? CYAN : BORDER,
                        }}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Circle Visualization */}
            <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex justify-center items-center">
                <div className="relative" style={{ width: "360px", height: "360px" }}>
                  <svg width="360" height="360" className="inset-0">
                    {people.map((person, index) => {
                      const pos = getPersonPosition(index, people.length);
                      const c = getPersonColor(person);
                      // Highlight survivor on last step
                      const isSurvivor = isLastStep && !person.eliminated;
                      return (
                        <g key={person.id} className="transition-all duration-300">
                          <circle
                            cx={180 + pos.x}
                            cy={180 + pos.y}
                            r="18"
                            fill={isSurvivor ? CYAN : c.fill}
                            stroke={isSurvivor ? CYAN : c.stroke}
                            strokeWidth={isSurvivor ? 3 : 1.5}
                            opacity={person.eliminated ? 0.25 : 1}
                          />
                          <text
                            x={180 + pos.x}
                            y={180 + pos.y + 4}
                            textAnchor="middle"
                            className="text-xs font-bold"
                            fill={isSurvivor ? "oklch(0.1 0.02 240)" : c.text}
                            opacity={person.eliminated ? 0.3 : 1}
                          >
                            {person.id}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-5 text-xs text-slate-400 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: "oklch(0.5 0.04 240 / 0.4)", borderWidth: 1, borderColor: "oklch(0.4 0.06 240)" }} />
                  <span>Alive</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: "oklch(0.65 0.18 55 / 0.5)", borderWidth: 1, borderColor: "oklch(0.75 0.2 55)" }} />
                  <span>Target</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: "oklch(0.35 0.1 25 / 0.4)", borderWidth: 1, borderColor: "oklch(0.5 0.12 25)" }} />
                  <span>Eliminated</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: CYAN, borderWidth: 2, borderColor: CYAN }} />
                  <span>Survivor</span>
                </div>
              </div>
            </div>

            {/* Elimination Order */}
            {eliminationOrder.length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Elimination Order</p>
                <div className="flex flex-wrap gap-2">
                  {eliminationOrder.map((personId, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-lg text-xs font-semibold"
                      style={{ background: "oklch(0.17 0.03 240)", color: "oklch(0.65 0.04 230)", borderWidth: 1, borderColor: BORDER }}
                    >
                      {personId}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{ background: BG, borderColor: BORDER }}>
              <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm"
                style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300"
                style={{ borderColor: BORDER }}>
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <SpeedControl animationSpeed={speed} setAnimationSpeed={setSpeed} isAnimating={playing} />
            </div>

            <ExplanationPanel steps={steps.map((s) => s.explanation)} currentStep={stepIdx} totalSteps={steps.length} />
          </div>
          <div className="h-[500px] xl:h-auto xl:min-h-[600px]">
            <CodePanel codes={CODES} highlightLine={cur?.line ?? null} />
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
