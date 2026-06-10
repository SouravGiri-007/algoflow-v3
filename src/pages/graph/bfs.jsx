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
  pseudo: `BFS(graph, start):
  visited = {start}
  queue = [start]

  while queue is not empty:
    node = dequeue(queue)
    process(node)
    for each neighbour of node:
      if neighbour not in visited:
        visited.add(neighbour)
        enqueue(queue, neighbour)
  return visited`,
  python: `from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    order = []

    while queue:
        node = queue.popleft()   # O(1) dequeue
        order.append(node)

        for neighbour in graph[node]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append(neighbour)

    return order   # nodes in BFS visit order`,
  javascript: `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);

    for (const neighbour of graph[node]) {
      if (!visited.has(neighbour)) {
        visited.add(neighbour);
        queue.push(neighbour);
      }
    }
  }

  return order;
}`,
  cpp: `vector<int> bfs(const vector<vector<int>>& graph, int start) {
  vector<int> order;
  vector<bool> visited(graph.size(), false);
  queue<int> q;

  visited[start] = true;
  q.push(start);

  while (!q.empty()) {
    int node = q.front();
    q.pop();
    order.push_back(node);

    for (int nb : graph[node]) {
      if (!visited[nb]) {
        visited[nb] = true;
        q.push(nb);
      }
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

// ─── BFS Step Generator ────────────────────────────────────────────────────────
function buildSteps(startNode) {
  const steps = [];
  const visited = new Set();
  const queue = [startNode];
  visited.add(startNode);

  steps.push({
    current: null,
    queue: [startNode],
    visited: new Set(visited),
    justVisited: null,
    enqueued: null,
    line: 2,
    explanation: `Initialize: enqueue node ${startNode} and mark it visited.`,
  });

  while (queue.length > 0) {
    const node = queue.shift();

    steps.push({
      current: node,
      queue: [...queue],
      visited: new Set(visited),
      justVisited: node,
      enqueued: null,
      line: 5,
      explanation: `Dequeue node ${node} — processing it now.`,
    });

    for (const neighbor of ADJACENCY[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);

        steps.push({
          current: node,
          queue: [...queue],
          visited: new Set(visited),
          justVisited: null,
          enqueued: neighbor,
          line: 8,
          explanation: `Node ${neighbor} is unvisited — enqueue it and mark visited.`,
        });
      }
    }
  }

  steps.push({
    current: null,
    queue: [],
    visited: new Set(visited),
    justVisited: null,
    enqueued: null,
    done: true,
    line: 10,
    explanation: `BFS complete — all reachable nodes have been visited.`,
  });

  return steps;
}

// ─── Node colour logic ─────────────────────────────────────────────────────────
function getNodeStyle(nodeId, step) {
  if (!step) return { fill: "oklch(0.25 0.04 240)", stroke: "oklch(0.4 0.04 240)", text: "oklch(0.55 0.04 240)" };

  if (step.current === nodeId) {
    return { fill: "#ffffff", stroke: "#ffffff", text: "#000000" };
  }
  if (step.enqueued === nodeId) {
    return { fill: "oklch(0.7 0.17 75)", stroke: "oklch(0.78 0.16 85)", text: "#000000" };
  }
  if (step.queue && step.queue.includes(nodeId) && step.visited.has(nodeId)) {
    return { fill: "oklch(0.6 0.15 70)", stroke: "oklch(0.7 0.17 75)", text: "#000000" };
  }
  if (step.visited.has(nodeId)) {
    return { fill: "oklch(0.6 0.17 160)", stroke: "oklch(0.7 0.17 160)", text: "#000000" };
  }
  return { fill: "oklch(0.25 0.04 240)", stroke: "oklch(0.4 0.04 240)", text: "oklch(0.55 0.04 240)" };
}

function getEdgeStyle(a, b, step) {
  if (!step) return "oklch(0.3 0.04 240)";
  const bothVisited = step.visited.has(a) && step.visited.has(b);
  return bothVisited ? "oklch(0.6 0.17 160)" : "oklch(0.3 0.04 240)";
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BFS() {
  const [startNode, setStartNode] = useState(0);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const [selectingStart, setSelectingStart] = useState(false);
  const timer = useRef(null);
  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => {
    clearInterval(timer.current);
    setPlaying(false);
    setStepIdx(0);
    setStarted(false);
    setSteps([]);
    setSelectingStart(false);
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
    if (started || selectingStart) return;
    setStartNode(nodeId);
  };

  const handleSelectStart = () => {
    if (!started) setSelectingStart((v) => !v);
  };

  // ── Legend entries ──
  const legend = [
    { color: "oklch(0.25 0.04 240)", border: "oklch(0.4 0.04 240)", label: "Unvisited" },
    { color: "oklch(0.6 0.15 70)", border: "oklch(0.7 0.17 75)", label: "In Queue" },
    { color: "#ffffff", border: "#ffffff", label: "Current" },
    { color: "oklch(0.6 0.17 160)", border: "oklch(0.7 0.17 160)", label: "Visited" },
  ];

  return (
    <>
      <SEO data={{ title: "Breadth First Search (BFS) — Graph Traversal Visualization" }} />
      <AlgoPageLayout
        title="Breadth First Search"
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
                      const color = getEdgeStyle(a, b, cur);
                      return (
                        <line
                          key={`${a}-${b}`}
                          x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                          stroke={color}
                          strokeWidth={2.5}
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

                {/* Sidebar: Queue + Visited + Legend */}
                <div className="flex flex-col gap-4 w-full lg:w-52 shrink-0">
                  {/* Queue visualisation */}
                  <div className="rounded-lg p-4 border" style={{ background: "oklch(0.1 0.02 240)", borderColor: BORDER }}>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">
                      Queue (front → back)
                    </p>
                    <div className="flex flex-col gap-1.5 min-h-[60px]">
                      {cur?.queue?.length > 0 ? (
                        cur.queue.map((nodeId, i) => (
                          <div key={`${nodeId}-${i}`} className="flex items-center gap-2">
                            <span className="text-slate-600 text-xs w-4 text-right">
                              {i === 0 ? "↑" : ""}
                            </span>
                            <div
                              className="rounded px-3 py-0.5 text-sm font-bold font-mono w-full text-center"
                              style={{ background: "oklch(0.6 0.15 70)", color: "#000" }}
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
