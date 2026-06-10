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
  pseudo: `FLOYD-CYCLE-DETECTION(head):
  if head is NULL or head.next is NULL:
    return NULL

  // Phase 1: Detect if cycle exists
  slow = head
  fast = head

  while fast ≠ NULL and fast.next ≠ NULL:
    slow = slow.next           // Move 1 step
    fast = fast.next.next      // Move 2 steps

    if slow == fast:           // Cycle detected
      break

  if fast == NULL or fast.next == NULL:
    return NULL                // No cycle found

  // Phase 2: Find the start of the cycle
  finder = head

  while finder ≠ slow:
    finder = finder.next       // Move 1 step
    slow = slow.next           // Move 1 step

  return finder                // Loop start node`,
  python: `def detect_cycle(head):
    if not head or not head.next:
        return None

    # Phase 1: Detect if cycle exists
    slow = head
    fast = head

    while fast and fast.next:
        slow = slow.next          # Move 1 step
        fast = fast.next.next     # Move 2 steps

        if slow == fast:          # Cycle detected
            break
    else:
        return None               # No cycle found

    # Phase 2: Find the start of the cycle
    finder = head

    while finder != slow:
        finder = finder.next      # Move 1 step
        slow = slow.next          # Move 1 step

    return finder                 # Loop start node`,
  javascript: `function detectCycle(head) {
  if (!head || !head.next) return null;

  // Phase 1: Detect if cycle exists
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;          // Move 1 step
    fast = fast.next.next;     // Move 2 steps

    if (slow === fast) {       // Cycle detected
      break;
    }
  }

  if (!fast || !fast.next) {
    return null;               // No cycle found
  }

  // Phase 2: Find the start of the cycle
  let finder = head;

  while (finder !== slow) {
    finder = finder.next;      // Move 1 step
    slow = slow.next;          // Move 1 step
  }

  return finder;               // Loop start node
}`,
  cpp: `ListNode* detectCycle(ListNode* head) {
    if (!head || !head->next) return nullptr;

    // Phase 1: Detect if cycle exists
    ListNode* slow = head;
    ListNode* fast = head;

    while (fast && fast->next) {
        slow = slow->next;          // Move 1 step
        fast = fast->next->next;    // Move 2 steps

        if (slow == fast) {         // Cycle detected
            break;
        }
    }

    if (!fast || !fast->next) {
        return nullptr;             // No cycle found
    }

    // Phase 2: Find the start of the cycle
    ListNode* finder = head;

    while (finder != slow) {
        finder = finder->next;      // Move 1 step
        slow = slow->next;          // Move 1 step
    }

    return finder;                  // Loop start node
}`,
};

/* ── list structures ──────────────────────────────── */

const listStructures = {
  "with-loop": {
    nodes: [
      { id: 1, value: "1", x: 100, y: 200, next: 2 },
      { id: 2, value: "2", x: 200, y: 200, next: 3 },
      { id: 3, value: "3", x: 300, y: 200, next: 4 },
      { id: 4, value: "4", x: 400, y: 200, next: 5 },
      { id: 5, value: "5", x: 500, y: 200, next: 6 },
      { id: 6, value: "6", x: 600, y: 200, next: 7 },
      { id: 7, value: "7", x: 700, y: 200, next: 8 },
      { id: 8, value: "8", x: 700, y: 300, next: 9 },
      { id: 9, value: "9", x: 600, y: 300, next: 10 },
      { id: 10, value: "10", x: 500, y: 300, next: 11 },
      { id: 11, value: "11", x: 400, y: 300, next: 12 },
      { id: 12, value: "12", x: 300, y: 300, next: 5 },
    ],
    loopStart: 5,
    loopNodes: new Set([5, 6, 7, 8, 9, 10, 11, 12]),
  },
  "no-loop": {
    nodes: [
      { id: 1, value: "A", x: 100, y: 200, next: 2 },
      { id: 2, value: "B", x: 200, y: 200, next: 3 },
      { id: 3, value: "C", x: 300, y: 200, next: 4 },
      { id: 4, value: "D", x: 400, y: 200, next: 5 },
      { id: 5, value: "E", x: 500, y: 200, next: 6 },
      { id: 6, value: "F", x: 600, y: 200, next: null },
    ],
    loopStart: null,
    loopNodes: new Set(),
  },
  "self-loop": {
    nodes: [
      { id: 1, value: "X", x: 150, y: 200, next: 2 },
      { id: 2, value: "Y", x: 250, y: 200, next: 3 },
      { id: 3, value: "Z", x: 350, y: 200, next: 3 },
    ],
    loopStart: 3,
    loopNodes: new Set([3]),
  },
};

/* ── buildSteps ───────────────────────────────────── */

function buildSteps(type) {
  const structure = listStructures[type];
  const listNodes = structure.nodes;
  const loopNodeSet = structure.loopNodes;
  const steps = [];
  const nodeMap = new Map();
  listNodes.forEach((node) => nodeMap.set(node.id, node));

  if (listNodes.length === 0) return steps;

  let slow = listNodes[0];
  let fast = listNodes[0];

  // Step: initialize
  steps.push({
    slowPointer: slow,
    fastPointer: fast,
    phase: "detection",
    loopDetected: false,
    loopStartFound: false,
    loopNodes: new Set(),
    highlightedNode: null,
    line: 5,
    explanation: "Initialize both slow and fast pointers at the head of the list.",
  });

  while (true) {
    // Move slow 1 step
    if (slow.next) {
      slow = nodeMap.get(slow.next);
    } else {
      slow = null;
    }

    // Move fast 2 steps
    if (fast.next) {
      fast = nodeMap.get(fast.next);
      if (fast && fast.next) {
        fast = nodeMap.get(fast.next);
      } else {
        fast = null;
      }
    } else {
      fast = null;
    }

    steps.push({
      slowPointer: slow,
      fastPointer: fast,
      phase: "detection",
      loopDetected: false,
      loopStartFound: false,
      loopNodes: new Set(),
      highlightedNode: null,
      line: 9,
      explanation: "Move slow pointer 1 step, fast pointer 2 steps.",
    });

    // Fast reached end → no loop
    if (!fast || !slow) {
      steps.push({
        slowPointer: slow,
        fastPointer: fast,
        phase: "complete",
        loopDetected: false,
        loopStartFound: false,
        loopNodes: new Set(),
        highlightedNode: null,
        line: 15,
        explanation: "Fast pointer reached end — no loop detected.",
      });
      break;
    }

    // Pointers meet → loop detected
    if (slow.id === fast.id) {
      steps.push({
        slowPointer: slow,
        fastPointer: fast,
        phase: "detection",
        loopDetected: true,
        loopStartFound: false,
        loopNodes: loopNodeSet,
        highlightedNode: slow.id,
        line: 12,
        explanation: "Pointers meet — loop detected!",
      });

      // Phase 2: find loop start
      let finder = listNodes[0];

      steps.push({
        slowPointer: finder,
        fastPointer: slow,
        phase: "finding-start",
        loopDetected: true,
        loopStartFound: false,
        loopNodes: loopNodeSet,
        highlightedNode: null,
        line: 18,
        explanation: "Phase 2: Move one pointer to head, keep other at meeting point.",
      });

      while (finder.id !== slow.id) {
        finder = nodeMap.get(finder.next);
        slow = nodeMap.get(slow.next);

        steps.push({
          slowPointer: slow,
          fastPointer: finder,
          phase: "finding-start",
          loopDetected: true,
          loopStartFound: false,
          loopNodes: loopNodeSet,
          highlightedNode: null,
          line: 21,
          explanation: "Move both pointers 1 step each.",
        });
      }

      steps.push({
        slowPointer: slow,
        fastPointer: finder,
        phase: "complete",
        loopDetected: true,
        loopStartFound: true,
        loopNodes: loopNodeSet,
        highlightedNode: finder.id,
        line: 24,
        explanation: `Loop start found at node '${finder.value}'!`,
      });

      break;
    }
  }

  return steps;
}

/* ── SVG sub-components ───────────────────────────── */

const ListNode = ({ node, x, y, isSlowPointer, isFastPointer, isInLoop, isHighlighted }) => {
  const radius = 25;
  return (
    <g>
      <circle
        cx={x} cy={y} r={radius}
        fill={
          isHighlighted ? "#FDE047"
          : isInLoop ? "#EF4444"
          : "#374151"
        }
        stroke={
          isSlowPointer && isFastPointer ? "#8B5CF6"
          : isSlowPointer ? "#10B981"
          : isFastPointer ? "#3B82F6"
          : isInLoop ? "#DC2626"
          : "#6B7280"
        }
        strokeWidth="4"
        className="transition-all duration-300"
      />
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#FFF" fontSize="14" fontWeight="bold" className="pointer-events-none">
        {node.value}
      </text>
      {isSlowPointer && (
        <text x={x} y={y - 40} textAnchor="middle" fill="#10B981" fontSize="12" fontWeight="bold" className="pointer-events-none">Slow</text>
      )}
      {isFastPointer && (
        <text x={x} y={y + (isSlowPointer ? 50 : 45)} textAnchor="middle" fill="#3B82F6" fontSize="12" fontWeight="bold" className="pointer-events-none">Fast</text>
      )}
    </g>
  );
};

const Arrow = ({ fromX, fromY, toX, toY, isLoopArrow = false, isHighlighted = false }) => {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / length;
  const unitY = dy / length;
  const startX = fromX + unitX * 25;
  const startY = fromY + unitY * 25;
  const endX = toX - unitX * 25;
  const endY = toY - unitY * 25;

  return (
    <g>
      <defs>
        <marker id={`arrowhead-${isLoopArrow ? "loop" : "normal"}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={isLoopArrow ? "#EF4444" : isHighlighted ? "#FDE047" : "#6B7280"} />
        </marker>
      </defs>
      <line x1={startX} y1={startY} x2={endX} y2={endY}
        stroke={isLoopArrow ? "#EF4444" : isHighlighted ? "#FDE047" : "#6B7280"}
        strokeWidth="2" markerEnd={`url(#arrowhead-${isLoopArrow ? "loop" : "normal"})`}
        className="transition-all duration-300" />
    </g>
  );
};

const PointerStatus = ({ slowPointer, fastPointer, phase, loopDetected, loopStartFound }) => (
  <div className="flex flex-col items-center gap-3 mb-4">
    <div className="flex gap-6">
      <div className="text-center">
        <div className="text-cyan-400 font-semibold text-xs mb-1">Slow Pointer</div>
        <div className="bg-green-600 text-white px-3 py-1.5 rounded font-mono text-sm">
          {slowPointer ? slowPointer.value : "NULL"}
        </div>
      </div>
      <div className="text-center">
        <div className="text-blue-400 font-semibold text-xs mb-1">Fast Pointer</div>
        <div className="bg-blue-600 text-white px-3 py-1.5 rounded font-mono text-sm">
          {fastPointer ? fastPointer.value : "NULL"}
        </div>
      </div>
    </div>
    <div className="text-center">
      <div className={`px-3 py-1.5 rounded text-xs font-semibold ${
        phase === "detection" ? "bg-yellow-500" : phase === "finding-start" ? "bg-purple-600" : "bg-neutral-600 text-neutral-100"
      }`}>
        {phase === "detection" ? "Loop Detection" : phase === "finding-start" ? "Finding Loop Start" : "Complete"}
      </div>
    </div>
    <div className="flex gap-3">
      <div className={`px-2 py-0.5 rounded text-xs font-semibold ${loopDetected ? "bg-red-600 text-white" : "bg-neutral-700 text-neutral-400"}`}>
        Loop: {loopDetected ? "DETECTED" : "Not Found"}
      </div>
      {loopDetected && (
        <div className={`px-2 py-0.5 rounded text-xs font-semibold ${loopStartFound ? "bg-green-600 text-white" : "bg-neutral-700 text-neutral-400"}`}>
          Start: {loopStartFound ? "FOUND" : "Searching"}
        </div>
      )}
    </div>
  </div>
);

/* ── Main component ───────────────────────────────── */

function FloydCycleDetection() {
  const [listType, setListType] = useState("with-loop");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timer = useRef(null);
  const cur = steps[stepIdx] || null;

  const structure = listStructures[listType];
  const nodes = structure.nodes;
  const loopNodeSet = structure.loopNodes;

  const getNextNode = (node) => nodes.find((n) => n.id === node.next);

  const reset = useCallback(() => {
    clearInterval(timer.current);
    setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]);
  }, []);

  const run = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0; clearInterval(timer.current);
    timer.current = setInterval(() => {
      idx++;
      if (idx >= s.length) { clearInterval(timer.current); setPlaying(false); setStepIdx(s.length - 1); return; }
      setStepIdx(idx);
    }, speed);
  };

  const togglePlay = () => {
    if (!started) { run(buildSteps(listType)); return; }
    if (playing) { clearInterval(timer.current); setPlaying(false); }
    else {
      setPlaying(true); let idx = stepIdx;
      timer.current = setInterval(() => {
        idx++;
        if (idx >= steps.length) { clearInterval(timer.current); setPlaying(false); setStepIdx(steps.length - 1); return; }
        setStepIdx(idx);
      }, speed);
    }
  };

  const handleListTypeChange = (type) => {
    reset();
    setListType(type);
  };

  // Derived visualization state from current step
  const slowPointer = cur ? cur.slowPointer : null;
  const fastPointer = cur ? cur.fastPointer : null;
  const phase = cur ? cur.phase : "detection";
  const loopDetected = cur ? cur.loopDetected : false;
  const loopStartFound = cur ? cur.loopStartFound : false;
  const highlightedNode = cur ? cur.highlightedNode : null;
  const vizLoopNodes = cur ? cur.loopNodes : loopNodeSet;

  const LIST_TYPE_OPTIONS = [
    { value: "with-loop", label: "With Loop" },
    { value: "no-loop", label: "No Loop" },
    { value: "self-loop", label: "Self Loop" },
  ];

  return (
    <>
      <SEO data={{ title: "Floyd's Cycle Detection Algorithm" }} />
      <AlgoPageLayout title="Floyd's Cycle Detection" category="Array & LinkedList" categoryHref="/array-linkedlist" timeComplexity="O(n)" spaceComplexity="O(1)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Input: list type selector */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">List Type</p>
              <div className="flex gap-2 flex-wrap">
                {LIST_TYPE_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => handleListTypeChange(opt.value)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: listType === opt.value ? CYAN : "oklch(0.17 0.03 240)",
                      color: listType === opt.value ? "oklch(0.1 0.02 240)" : "rgb(148 163 184)",
                      border: `1px solid ${listType === opt.value ? CYAN : BORDER}`,
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visualization */}
            <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
              <PointerStatus
                slowPointer={slowPointer}
                fastPointer={fastPointer}
                phase={phase}
                loopDetected={loopDetected}
                loopStartFound={loopStartFound}
              />

              <div className="flex justify-center mb-4 overflow-x-auto">
                <svg width="800" height="400" viewBox="0 0 800 400" className="min-w-[600px]">
                  {nodes.map((node) => {
                    const nextNode = getNextNode(node);
                    if (nextNode) {
                      return (
                        <Arrow key={`arrow-${node.id}`}
                          fromX={node.x} fromY={node.y} toX={nextNode.x} toY={nextNode.y}
                          isLoopArrow={vizLoopNodes.has(node.id) && vizLoopNodes.has(nextNode.id)}
                          isHighlighted={highlightedNode === node.id}
                        />
                      );
                    }
                    return null;
                  })}
                  {nodes.map((node) => (
                    <ListNode key={node.id} node={node} x={node.x} y={node.y}
                      isSlowPointer={slowPointer?.id === node.id}
                      isFastPointer={fastPointer?.id === node.id}
                      isInLoop={vizLoopNodes.has(node.id)}
                      isHighlighted={highlightedNode === node.id}
                    />
                  ))}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#10B981]" /> Slow</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#3B82F6]" /> Fast</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#EF4444]" /> Loop nodes</span>
                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-[#FDE047]" /> Highlighted</span>
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border p-4 flex flex-wrap gap-3 items-center" style={{ background: BG, borderColor: BORDER }}>
              <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm" style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300" style={{ borderColor: BORDER }}>
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

export default FloydCycleDetection;
