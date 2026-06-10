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
  pseudo: `DFS(graph, start):
  visited = {}
  stack = [start]

  while stack is not empty:
    node = stack.pop()
    if node not in visited:
      visited.add(node)
      process(node)
      for each neighbour of node (reversed):
        if neighbour not in visited:
          stack.push(neighbour)
  return visited`,
  python: `def dfs_iterative(graph, start):
    visited = set()
    stack = [start]
    order = []

    while stack:
        node = stack.pop()        # LIFO — deepest first
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        # push in reverse so first neighbour is processed first
        for neighbour in reversed(graph[node]):
            if neighbour not in visited:
                stack.append(neighbour)

    return order`,
  javascript: `function dfsIterative(graph, start) {
  const visited = new Set();
  const stack = [start];
  const order = [];

  while (stack.length > 0) {
    const node = stack.pop();
    if (visited.has(node)) continue;
    visited.add(node);
    order.push(node);

    for (let i = graph[node].length - 1; i >= 0; i--) {
      const nb = graph[node][i];
      if (!visited.has(nb)) {
        stack.push(nb);
      }
    }
  }

  return order;
}`,
  cpp: `vector<int> dfs(const vector<vector<int>>& graph, int start) {
  vector<int> order;
  vector<bool> visited(graph.size(), false);
  stack<int> st;

  st.push(start);

  while (!st.empty()) {
    int node = st.top();
    st.pop();
    if (visited[node]) continue;
    visited[node] = true;
    order.push_back(node);

    for (auto it = graph[node].rbegin();
         it != graph[node].rend(); ++it) {
      if (!visited[*it]) st.push(*it);
    }
  }
  return order;
}`,
};

// ─── Graph Definition ──────────────────────────────────────────────────────────
const GRAPH_NODES = [
  { id: 0, x: 400, y: 60 },
  { id: 1, x: 200, y: 170 },
  { id: 2, x: 600, y: 170 },
  { id: 3, x: 90, y: 300 },
  { id: 4, x: 310, y: 300 },
  { id: 5, x: 490, y: 300 },
  { id: 6, x: 710, y: 300 },
  { id: 7, x: 190, y: 420 },
  { id: 8, x: 610, y: 420 },
];

const ADJACENCY = {
  0: [1, 2],
  1: [0, 3, 4],
  2: [0, 5, 6],
  3: [1, 7],
  4: [1, 5, 7],
  5: [2, 4, 8],
  6: [2, 8],
  7: [3, 4],
  8: [5, 6],
};

const EDGES = [
  [0, 1], [0, 2], [1, 3], [1, 4],
  [2, 5], [2, 6], [3, 7], [4, 7],
  [4, 5], [5, 8], [6, 8],
];

// ─── DFS Step Generator (iterative, explicit stack) ────────────────────────────
function buildSteps(startNode) {
  const steps = [];
  const visited = new Set();
  const stack = [startNode];
  const treeEdges = new Set();
  const parent = {};

  steps.push({
    current: null,
    stack: [startNode],
    visited: new Set(),
    treeEdges: new Set(),
    justPushed: startNode,
    done: false,
    line: 2,
    explanation: `Initialize: push node ${startNode} onto the stack.`,
  });

  while (stack.length > 0) {
    const node = stack[stack.length - 1];

    if (!visited.has(node)) {
      visited.add(node);
      stack.pop();

      steps.push({
        current: node,
        stack: [...stack],
        visited: new Set(visited),
        treeEdges: new Set(treeEdges),
        justPushed: null,
        done: false,
        line: 5,
        explanation: `Pop node ${node} and mark it visited — processing now.`,
      });

      const neighbours = [...ADJACENCY[node]].reverse();
      for (const nb of neighbours) {
        if (!visited.has(nb)) {
          stack.push(nb);
          if (parent[nb] === undefined) {
            parent[nb] = node;
            treeEdges.add(`${node}-${nb}`);
            treeEdges.add(`${nb}-${node}`);
          }
          steps.push({
            current: node,
            stack: [...stack],
            visited: new Set(visited),
            treeEdges: new Set(treeEdges),
            justPushed: nb,
            done: false,
            line: 9,
            explanation: `Node ${nb} is unvisited — push it onto the stack.`,
          });
        }
      }
    } else {
      stack.pop();
    }
  }

  steps.push({
    current: null,
    stack: [],
    visited: new Set(visited),
    treeEdges: new Set(treeEdges),
    justPushed: null,
    done: true,
    line: 10,
    explanation: `DFS complete — all reachable nodes have been visited.`,
  });

  return steps;
}

// ─── Colour logic ─────────────────────────────────────────────────────────────
function getNodeStyle(nodeId, step) {
  if (!step) return { fill: "oklch(0.25 0.04 240)", stroke: "oklch(0.4 0.04 240)", text: "oklch(0.55 0.04 240)" };

  if (step.current === nodeId)
    return { fill: "#ffffff", stroke: "#ffffff", text: "#000000" };
  if (step.justPushed === nodeId)
    return { fill: "oklch(0.55 0.2 280)", stroke: "oklch(0.68 0.18 280)", text: "#000000" };
  if (step.stack && step.stack.includes(nodeId) && !step.visited.has(nodeId))
    return { fill: "oklch(0.45 0.18 280)", stroke: "oklch(0.6 0.18 280)", text: "#ffffff" };
  if (step.visited.has(nodeId))
    return { fill: "oklch(0.6 0.17 160)", stroke: "oklch(0.7 0.17 160)", text: "#000000" };
  return { fill: "oklch(0.25 0.04 240)", stroke: "oklch(0.4 0.04 240)", text: "oklch(0.55 0.04 240)" };
}

function getEdgeStyle(a, b, step) {
  if (!step) return { stroke: "oklch(0.3 0.04 240)", width: 2.5, opacity: 1 };

  const key1 = `${a}-${b}`;
  const key2 = `${b}-${a}`;
  if (step.treeEdges && (step.treeEdges.has(key1) || step.treeEdges.has(key2)))
    return { stroke: "oklch(0.6 0.17 160)", width: 3, opacity: 1 };

  const bothVisited = step.visited.has(a) && step.visited.has(b);
  if (bothVisited) return { stroke: "oklch(0.28 0.04 240)", width: 2, opacity: 0.6 };

  return { stroke: "oklch(0.3 0.04 240)", width: 2.5, opacity: 1 };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DFS() {
  const [startNode, setStartNode] = useState(0);
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
      run(buildSteps(startNode));
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

  const handleNodeClick = (nodeId) => {
    if (started) return;
    setStartNode(nodeId);
  };

  const legend = [
    { color: "oklch(0.25 0.04 240)", border: "oklch(0.4 0.04 240)", label: "Unvisited" },
    { color: "oklch(0.45 0.18 280)", border: "oklch(0.6 0.18 280)", label: "On Stack" },
    { color: "#ffffff", border: "#ffffff", label: "Current" },
    { color: "oklch(0.6 0.17 160)", border: "oklch(0.7 0.17 160)", label: "Visited" },
  ];

  return (
    <>
      <SEO data={{ title: "Depth First Search (DFS) — Graph Traversal Visualization" }} />
      <AlgoPageLayout
        title="Depth First Search"
        category="Graph"
        categoryHref="/graph"
        timeComplexity="O(V+E)"
        spaceComplexity="O(V)"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Start node picker */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Start Node</p>
              <div className="flex flex-wrap gap-2">
                {GRAPH_NODES.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleNodeClick(n.id)}
                    disabled={started}
                    className={`w-9 h-9 rounded-lg text-sm font-bold font-mono transition-all duration-200 border ${
                      startNode === n.id
                        ? "text-black"
                        : "text-slate-400 hover:text-white"
                    }`}
                    style={{
                      background: startNode === n.id ? CYAN : "oklch(0.17 0.03 240)",
                      borderColor: startNode === n.id ? CYAN : BORDER,
                    }}
                  >
                    {n.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Graph SVG visualization */}
            <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex flex-col lg:flex-row justify-center items-start gap-6">
                {/* SVG Graph */}
                <div className="flex-1 w-full">
                  <svg viewBox="0 0 800 480" className="w-full h-auto" style={{ maxHeight: 480 }}>
                    {/* Edges */}
                    {EDGES.map(([a, b]) => {
                      const na = GRAPH_NODES[a];
                      const nb = GRAPH_NODES[b];
                      const sty = getEdgeStyle(a, b, cur);
                      return (
                        <line
                          key={`${a}-${b}`}
                          x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                          stroke={sty.stroke}
                          strokeWidth={sty.width}
                          strokeOpacity={sty.opacity}
                          strokeLinecap="round"
                          className="transition-all duration-300"
                        />
                      );
                    })}

                    {/* Nodes */}
                    {GRAPH_NODES.map((node) => {
                      const style = getNodeStyle(node.id, cur);
                      return (
                        <g key={node.id}>
                          <circle
                            cx={node.x} cy={node.y} r={26}
                            fill={style.fill}
                            stroke={style.stroke}
                            strokeWidth={2}
                            className="transition-all duration-300"
                          />
                          <text
                            x={node.x} y={node.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={style.text}
                            fontSize={15}
                            fontWeight="700"
                            fontFamily="monospace"
                            className="select-none transition-all duration-300"
                          >
                            {node.id}
                          </text>
                          {node.id === startNode && (
                            <text
                              x={node.x} y={node.y - 36}
                              textAnchor="middle"
                              fill={CYAN}
                              fontSize={10}
                              fontFamily="monospace"
                              fontWeight="600"
                              className="select-none"
                            >
                              START
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-4 w-full lg:w-52 shrink-0">
                  {/* Stack — rendered top-of-stack first */}
                  <div className="rounded-lg p-4 border" style={{ background: "oklch(0.1 0.02 240)", borderColor: BORDER }}>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
                      Stack (top → bottom)
                    </p>
                    <div className="flex flex-col gap-1.5 min-h-[60px]">
                      {cur?.stack?.length > 0 ? (
                        [...cur.stack].reverse().map((nodeId, i) => (
                          <div key={`${nodeId}-${i}`} className="flex items-center gap-2">
                            <span className="text-slate-600 text-xs w-4 text-right">
                              {i === 0 ? "↑" : ""}
                            </span>
                            <div
                              className="rounded px-3 py-0.5 text-sm font-bold font-mono w-full text-center"
                              style={{ background: "oklch(0.45 0.18 280)", color: "#fff" }}
                            >
                              {nodeId}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-600 text-sm italic text-center mt-2">empty</p>
                      )}
                    </div>
                  </div>

                  {/* Visited set */}
                  <div className="rounded-lg p-4 border" style={{ background: "oklch(0.1 0.02 240)", borderColor: BORDER }}>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
                      Visited
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cur?.visited?.size > 0 ? (
                        [...cur.visited].sort((a, b) => a - b).map((nodeId) => (
                          <span
                            key={nodeId}
                            className="rounded px-2 py-0.5 text-xs font-bold font-mono"
                            style={{ background: "oklch(0.5 0.15 160)", color: "#000" }}
                          >
                            {nodeId}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-600 text-sm italic">none yet</p>
                      )}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="rounded-lg p-4 border" style={{ background: "oklch(0.1 0.02 240)", borderColor: BORDER }}>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
                      Legend
                    </p>
                    <div className="flex flex-col gap-2">
                      {legend.map((l) => (
                        <div key={l.label} className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full shrink-0 border"
                            style={{ backgroundColor: l.color, borderColor: l.border }}
                          />
                          <span className="text-slate-300 text-xs">{l.label}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-4 h-0.5 shrink-0 opacity-60"
                          style={{ backgroundColor: "oklch(0.28 0.04 240)" }}
                        />
                        <span className="text-slate-300 text-xs">Back edge</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{ background: BG, borderColor: BORDER }}>
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm"
                style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300"
                style={{ borderColor: BORDER }}
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <SpeedControl animationSpeed={speed} setAnimationSpeed={setSpeed} isAnimating={playing} />
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
