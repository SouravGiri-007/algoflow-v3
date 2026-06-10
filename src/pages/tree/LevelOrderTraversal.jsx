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
  pseudo: `LEVEL-ORDER(root):
  if root is null: return []
  queue ← [root]
  result ← []
  while queue is not empty:
    node ← dequeue(queue)
    visit(node)
    result.append(node.val)
    if node.left:  enqueue(queue, node.left)
    if node.right: enqueue(queue, node.right)
  return result`,
  python: `from collections import deque

def level_order(root):
    if not root:
        return []
    queue = deque([root])
    result = []
    while queue:
        node = queue.popleft()
        result.append(node.val)
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    return result`,
  javascript: `function levelOrder(root) {
  if (!root) return [];
  const queue = [root];
  const result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}`,
  cpp: `vector<int> levelOrder(Node* root) {
  if (!root) return {};
  queue<Node*> q;
  q.push(root);
  vector<int> result;
  while (!q.empty()) {
    Node* node = q.front();
    q.pop();
    result.push_back(node->val);
    if (node->left) q.push(node->left);
    if (node->right) q.push(node->right);
  }
  return result;
}`,
};

// Tree structures with precomputed layout positions
const TREE_STRUCTURES = {
  balanced: {
    nodes: [
      { id: 1, value: "A", x: 260, y: 50, left: 2, right: 3 },
      { id: 2, value: "B", x: 160, y: 120, left: 4, right: 5 },
      { id: 3, value: "C", x: 360, y: 120, left: 6, right: 7 },
      { id: 4, value: "D", x: 100, y: 190, left: null, right: null },
      { id: 5, value: "E", x: 220, y: 190, left: 8, right: 9 },
      { id: 6, value: "F", x: 300, y: 190, left: null, right: null },
      { id: 7, value: "G", x: 420, y: 190, left: null, right: null },
      { id: 8, value: "H", x: 180, y: 260, left: null, right: null },
      { id: 9, value: "I", x: 260, y: 260, left: null, right: null },
    ],
  },
  skewed: {
    nodes: [
      { id: 1, value: "A", x: 260, y: 50, left: 2, right: null },
      { id: 2, value: "B", x: 200, y: 120, left: 3, right: null },
      { id: 3, value: "C", x: 140, y: 190, left: 4, right: null },
      { id: 4, value: "D", x: 80, y: 260, left: null, right: null },
    ],
  },
  complete: {
    nodes: [
      { id: 1, value: "1", x: 260, y: 50, left: 2, right: 3 },
      { id: 2, value: "2", x: 150, y: 120, left: 4, right: 5 },
      { id: 3, value: "3", x: 370, y: 120, left: 6, right: 7 },
      { id: 4, value: "4", x: 80, y: 190, left: 8, right: 9 },
      { id: 5, value: "5", x: 220, y: 190, left: 10, right: 11 },
      { id: 6, value: "6", x: 300, y: 190, left: 12, right: null },
      { id: 7, value: "7", x: 440, y: 190, left: null, right: null },
      { id: 8, value: "8", x: 50, y: 260, left: null, right: null },
      { id: 9, value: "9", x: 110, y: 260, left: null, right: null },
      { id: 10, value: "10", x: 190, y: 260, left: null, right: null },
      { id: 11, value: "11", x: 250, y: 260, left: null, right: null },
      { id: 12, value: "12", x: 330, y: 260, left: null, right: null },
    ],
  },
};

function buildSteps(treeNodes) {
  const steps = [];
  const queue = [];
  const visited = new Set();
  const result = [];

  if (treeNodes.length === 0) return steps;

  const root = treeNodes[0];
  queue.push(root);

  steps.push({
    visited: new Set(),
    currentlyVisiting: null,
    queueList: [...queue],
    result: [],
    line: 2,
    explanation: `Initialize: enqueue root node '${root.value}'. Queue: [${root.value}]`,
  });

  while (queue.length > 0) {
    const currentNode = queue.shift();
    visited.add(currentNode.id);
    result.push(currentNode.value);

    steps.push({
      visited: new Set(visited),
      currentlyVisiting: currentNode.id,
      queueList: [...queue],
      result: [...result],
      line: 6,
      explanation: `Dequeue '${currentNode.value}' and visit it. Result: [${result.join(", ")}]`,
    });

    const children = [];
    if (currentNode.left) {
      const leftChild = treeNodes.find((n) => n.id === currentNode.left);
      if (leftChild) {
        queue.push(leftChild);
        children.push(`'${leftChild.value}'`);
      }
    }
    if (currentNode.right) {
      const rightChild = treeNodes.find((n) => n.id === currentNode.right);
      if (rightChild) {
        queue.push(rightChild);
        children.push(`'${rightChild.value}'`);
      }
    }

    if (children.length > 0) {
      steps.push({
        visited: new Set(visited),
        currentlyVisiting: null,
        queueList: [...queue],
        result: [...result],
        line: children.length === 2 ? 9 : 8,
        explanation: `Enqueue children: ${children.join(", ")}. Queue: [${queue.map((n) => n.value).join(", ")}]`,
      });
    }
  }

  steps.push({
    visited: new Set(visited),
    currentlyVisiting: null,
    queueList: [],
    result: [...result],
    line: 11,
    explanation: `✅ Traversal complete! Result: ${result.join(" → ")}`,
  });

  return steps;
}

function getNodeChildren(node, nodes) {
  const children = [];
  if (node.left) {
    const leftChild = nodes.find((n) => n.id === node.left);
    if (leftChild) children.push(leftChild);
  }
  if (node.right) {
    const rightChild = nodes.find((n) => n.id === node.right);
    if (rightChild) children.push(rightChild);
  }
  return children;
}

export default function LevelOrderTraversal() {
  const [treeType, setTreeType] = useState("balanced");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  const cur = steps[stepIdx] || null;
  const nodes = TREE_STRUCTURES[treeType].nodes;

  const visitedNodes = cur?.visited || new Set();
  const currentlyVisiting = cur?.currentlyVisiting || null;
  const queueList = cur?.queueList || [];
  const traversalResult = cur?.result || [];

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setPlaying(false);
    setStepIdx(0);
    setStarted(false);
    setSteps([]);
  }, []);

  const switchTreeType = (t) => {
    reset();
    setTreeType(t);
  };

  const runSteps = (s) => {
    setSteps(s);
    setStepIdx(0);
    setStarted(true);
    setPlaying(true);
    let idx = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      idx++;
      if (idx >= s.length) {
        clearInterval(timerRef.current);
        setPlaying(false);
        setStepIdx(s.length - 1);
        return;
      }
      setStepIdx(idx);
    }, speed);
  };

  const togglePlay = () => {
    if (!started) {
      const treeNodes = TREE_STRUCTURES[treeType].nodes;
      runSteps(buildSteps(treeNodes));
      return;
    }
    if (playing) {
      clearInterval(timerRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      let idx = stepIdx;
      timerRef.current = setInterval(() => {
        idx++;
        if (idx >= steps.length) {
          clearInterval(timerRef.current);
          setPlaying(false);
          setStepIdx(steps.length - 1);
          return;
        }
        setStepIdx(idx);
      }, speed);
    }
  };

  return (
    <>
      <SEO
        data={{
          title: "Level Order Traversal - Breadth First Search Visualization",
          description:
            "Visualize Level Order Traversal (BFS) on binary trees with step-by-step animation.",
        }}
      />
      <AlgoPageLayout
        title="Level Order Traversal (BFS)"
        category="Tree"
        categoryHref="/tree"
        timeComplexity="O(n)"
        spaceComplexity="O(w)"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Tree type selector & controls */}
            <div
              className="rounded-xl border p-4"
              style={{ background: BG, borderColor: BORDER }}
            >
              <div className="flex flex-wrap gap-3 items-center">
                {["balanced", "skewed", "complete"].map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTreeType(t)}
                    disabled={started && playing}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all capitalize"
                    style={{
                      background:
                        treeType === t
                          ? "oklch(0.75 0.18 195 / 0.15)"
                          : "oklch(0.17 0.03 240)",
                      borderColor: treeType === t ? CYAN : BORDER,
                      color:
                        treeType === t ? CYAN : "rgb(148 163 184)",
                      opacity: started && playing ? 0.5 : 1,
                    }}
                  >
                    {t}
                  </button>
                ))}

                <div className="ml-auto flex gap-2">
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm"
                    style={{
                      background: CYAN,
                      color: "oklch(0.1 0.02 240)",
                    }}
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
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                  <SpeedControl
                    animationSpeed={speed}
                    setAnimationSpeed={setSpeed}
                    isAnimating={playing}
                  />
                </div>
              </div>
            </div>

            {/* Queue & Result visualization */}
            <div
              className="rounded-xl border p-4"
              style={{ background: BG, borderColor: BORDER }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Queue */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Queue (FIFO)
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 text-xs mr-1">
                      Front →
                    </span>
                    {queueList.length === 0 ? (
                      <div
                        className="w-10 h-10 border-2 border-dashed rounded-lg flex items-center justify-center text-slate-600 text-xs"
                        style={{ borderColor: BORDER }}
                      >
                        ∅
                      </div>
                    ) : (
                      queueList.map((node, index) => (
                        <div
                          key={`queue-${node.id}-${index}`}
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border transition-all duration-300"
                          style={{
                            background:
                              index === 0
                                ? "oklch(0.75 0.15 80 / 0.25)"
                                : "oklch(0.55 0.18 240 / 0.25)",
                            borderColor:
                              index === 0
                                ? "oklch(0.75 0.15 80)"
                                : "oklch(0.55 0.18 240)",
                            color:
                              index === 0
                                ? "oklch(0.85 0.12 80)"
                                : "oklch(0.75 0.18 240)",
                          }}
                        >
                          {node.value}
                        </div>
                      ))
                    )}
                    <span className="text-slate-500 text-xs ml-1">
                      ← Rear
                    </span>
                  </div>
                </div>

                {/* Result */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Traversal Result
                  </p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {traversalResult.length === 0 ? (
                      <span className="text-slate-600 text-xs">—</span>
                    ) : (
                      traversalResult.map((value, index) => (
                        <div key={`result-${index}`} className="flex items-center gap-1">
                          <span
                            className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border"
                            style={{
                              background:
                                "oklch(0.55 0.18 145 / 0.15)",
                              borderColor: "oklch(0.55 0.18 145)",
                              color: "oklch(0.8 0.15 145)",
                            }}
                          >
                            {value}
                          </span>
                          {index < traversalResult.length - 1 && (
                            <span className="text-slate-600">→</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tree SVG visualization */}
            <div
              className="rounded-xl border p-4 overflow-x-auto"
              style={{ background: BG, borderColor: BORDER }}
            >
              <svg
                width={520}
                height={300}
                viewBox="0 0 520 300"
                className="mx-auto"
              >
                {nodes.map((node) => {
                  const children = getNodeChildren(node, nodes);
                  return (
                    <g key={node.id}>
                      {/* Edges */}
                      {children.map((child) => (
                        <line
                          key={`line-${node.id}-${child.id}`}
                          x1={node.x}
                          y1={node.y}
                          x2={child.x}
                          y2={child.y}
                          stroke="oklch(0.28 0.05 240)"
                          strokeWidth={1.5}
                        />
                      ))}

                      {/* Node circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={22}
                        fill={
                          currentlyVisiting === node.id
                            ? "oklch(0.75 0.15 80 / 0.25)"
                            : queueList.some((q) => q.id === node.id)
                              ? "oklch(0.55 0.18 240 / 0.25)"
                              : visitedNodes.has(node.id)
                                ? "oklch(0.55 0.18 145 / 0.2)"
                                : BG
                        }
                        stroke={
                          currentlyVisiting === node.id
                            ? "oklch(0.75 0.15 80)"
                            : queueList.some((q) => q.id === node.id)
                              ? "oklch(0.55 0.18 240)"
                              : visitedNodes.has(node.id)
                                ? "oklch(0.55 0.18 145)"
                                : BORDER
                        }
                        strokeWidth={2}
                        className="transition-all duration-300"
                      />

                      {/* Node value */}
                      <text
                        x={node.x}
                        y={node.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={13}
                        fontWeight="bold"
                        fill={
                          currentlyVisiting === node.id
                            ? "oklch(0.85 0.12 80)"
                            : queueList.some((q) => q.id === node.id)
                              ? "oklch(0.75 0.18 240)"
                              : visitedNodes.has(node.id)
                                ? "oklch(0.8 0.15 145)"
                                : "rgb(203 213 225)"
                        }
                        className="pointer-events-none"
                      >
                        {node.value}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div
              className="rounded-xl border p-3 flex flex-wrap gap-4 items-center text-xs text-slate-400"
              style={{ background: BG, borderColor: BORDER }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.75 0.15 80)" }}
                />
                Currently visiting
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.55 0.18 240)" }}
                />
                In queue
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.55 0.18 145)" }}
                />
                Visited
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border"
                  style={{ borderColor: BORDER, background: BG }}
                />
                Unvisited
              </div>
            </div>

            <ExplanationPanel
              steps={steps.map((s) => s.explanation)}
              currentStep={stepIdx}
              totalSteps={steps.length}
            />
          </div>

          <div className="h-[500px] xl:h-auto">
            <CodePanel codes={CODES} highlightLine={cur?.line ?? null} />
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
