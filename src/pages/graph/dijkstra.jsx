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
  pseudo: `DIJKSTRA(graph, source):
  dist[v] = ∞ for all v
  dist[source] = 0
  visited = {}

  while |visited| < |V|:
    u = unvisited node with min dist[u]
    if dist[u] = ∞: break
    visited.add(u)
    for each edge (u, v, w):
      if v not in visited:
        if dist[u] + w < dist[v]:
          dist[v] = dist[u] + w
          prev[v] = u
  return dist, prev`,
  python: `def dijkstra(graph, start):
    dist = {v: float('inf') for v in graph}
    dist[start] = 0
    prev = {v: None for v in graph}
    visited = set()

    while len(visited) < len(graph):
        u = min(
            (v for v in graph if v not in visited),
            key=lambda v: dist[v]
        )
        if dist[u] == float('inf'):
            break
        visited.add(u)

        for neighbor, weight in graph[u]:
            new_dist = dist[u] + weight
            if new_dist < dist[neighbor]:
                dist[neighbor] = new_dist
                prev[neighbor] = u

    return dist, prev`,
  javascript: `function dijkstra(graph, start) {
  const dist = {};
  const prev = {};
  const visited = new Set();

  for (const v of Object.keys(graph)) {
    dist[v] = Infinity;
    prev[v] = null;
  }
  dist[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let u = null;
    for (const v of Object.keys(graph)) {
      if (!visited.has(v) && (u === null || dist[v] < dist[u])) u = v;
    }
    if (dist[u] === Infinity) break;
    visited.add(u);

    for (const { node: nb, weight } of graph[u]) {
      const nd = dist[u] + weight;
      if (nd < dist[nb]) {
        dist[nb] = nd;
        prev[nb] = u;
      }
    }
  }
  return { dist, prev };
}`,
  cpp: `vector<int> dijkstra(const vector<vector<pair<int,int>>>& graph, int start) {
  int n = graph.size();
  vector<int> dist(n, INT_MAX);
  vector<bool> visited(n, false);
  dist[start] = 0;

  for (int i = 0; i < n; i++) {
    int u = -1;
    for (int v = 0; v < n; v++)
      if (!visited[v] && (u == -1 || dist[v] < dist[u]))
        u = v;
    if (dist[u] == INT_MAX) break;
    visited[u] = true;

    for (auto [nb, w] : graph[u]) {
      if (!visited[nb] && dist[u] + w < dist[nb])
        dist[nb] = dist[u] + w;
    }
  }
  return dist;
}`,
};

/* ─── Graph definition ─────────────────────────────────────────────────────── */
const NODES = ["A", "B", "C", "D", "E", "F"];

const GRAPH = {
  A: [{ node: "B", weight: 4 }, { node: "C", weight: 2 }],
  B: [{ node: "A", weight: 4 }, { node: "C", weight: 1 }, { node: "D", weight: 5 }],
  C: [{ node: "A", weight: 2 }, { node: "B", weight: 1 }, { node: "D", weight: 8 }, { node: "E", weight: 10 }],
  D: [{ node: "B", weight: 5 }, { node: "C", weight: 8 }, { node: "E", weight: 2 }, { node: "F", weight: 6 }],
  E: [{ node: "C", weight: 10 }, { node: "D", weight: 2 }, { node: "F", weight: 3 }],
  F: [{ node: "D", weight: 6 }, { node: "E", weight: 3 }],
};

const EDGES = [
  { from: "A", to: "B", weight: 4 },
  { from: "A", to: "C", weight: 2 },
  { from: "B", to: "C", weight: 1 },
  { from: "B", to: "D", weight: 5 },
  { from: "C", to: "D", weight: 8 },
  { from: "C", to: "E", weight: 10 },
  { from: "D", to: "E", weight: 2 },
  { from: "D", to: "F", weight: 6 },
  { from: "E", to: "F", weight: 3 },
];

const NODE_POS = {
  A: { x: 90, y: 200 },
  B: { x: 260, y: 80 },
  C: { x: 260, y: 320 },
  D: { x: 430, y: 80 },
  E: { x: 430, y: 320 },
  F: { x: 580, y: 200 },
};

const START = "A";

/* ─── Step generator ────────────────────────────────────────────────────────── */
function buildSteps() {
  const steps = [];
  const dist = {};
  const prev = {};
  const visited = new Set();

  NODES.forEach((n) => {
    dist[n] = n === START ? 0 : Infinity;
    prev[n] = null;
  });

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(),
    currentNode: null,
    relaxedEdges: new Set(),
    updatedNodes: new Set(),
    pathEdges: null,
    line: 2,
    explanation: `Initialize: set dist[${START}] = 0, all others = ∞.`,
  });

  while (visited.size < NODES.length) {
    let minNode = null;
    NODES.forEach((n) => {
      if (!visited.has(n) && dist[n] !== Infinity)
        if (minNode === null || dist[n] < dist[minNode]) minNode = n;
    });
    if (!minNode) break;

    steps.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: new Set(visited),
      currentNode: minNode,
      relaxedEdges: new Set(),
      updatedNodes: new Set(),
      pathEdges: null,
      line: 6,
      explanation: `Pick node ${minNode} (dist = ${dist[minNode]}) — minimum unvisited. Mark visited.`,
    });

    visited.add(minNode);

    const relaxedEdges = new Set();
    const updatedNodes = new Set();

    GRAPH[minNode].forEach(({ node: nb, weight }) => {
      if (!visited.has(nb)) {
        relaxedEdges.add([minNode, nb].sort().join("-"));
        const nd = dist[minNode] + weight;
        if (nd < dist[nb]) {
          dist[nb] = nd;
          prev[nb] = minNode;
          updatedNodes.add(nb);
        }
      }
    });

    steps.push({
      dist: { ...dist },
      prev: { ...prev },
      visited: new Set(visited),
      currentNode: minNode,
      relaxedEdges,
      updatedNodes,
      pathEdges: null,
      line: 10,
      explanation:
        updatedNodes.size > 0
          ? `Relax edges from ${minNode} → updated: ${[...updatedNodes].map((n) => `${n}=${dist[n]}`).join(", ")}.`
          : `Relax edges from ${minNode} — no improvements found.`,
    });
  }

  /* build shortest-path edges for the final step */
  const pathEdges = new Set();
  NODES.forEach((n) => {
    if (prev[n]) pathEdges.add([prev[n], n].sort().join("-"));
  });

  steps.push({
    dist: { ...dist },
    prev: { ...prev },
    visited: new Set(visited),
    currentNode: null,
    relaxedEdges: new Set(),
    updatedNodes: new Set(),
    pathEdges,
    line: 13,
    explanation: `Done! Shortest distances from ${START} to all nodes found.`,
  });

  return steps;
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const fmt = (d) => (d === Infinity ? "∞" : d);

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function Dijkstra() {
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
      run(buildSteps());
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

  const goNext = useCallback(() => {
    if (stepIdx >= steps.length - 1 || playing) return;
    setStepIdx((i) => i + 1);
  }, [stepIdx, steps.length, playing]);

  const goPrev = useCallback(() => {
    if (stepIdx <= 0 || playing) return;
    setStepIdx((i) => i - 1);
  }, [stepIdx, playing]);

  /* ── edge / node colors ── */
  const step = cur;

  const edgeColor = (from, to) => {
    if (!step) return "oklch(0.3 0.04 240)";
    const key = [from, to].sort().join("-");
    if (step.pathEdges?.has(key)) return "oklch(0.65 0.17 160)";
    if (step.relaxedEdges?.has(key)) return "oklch(0.78 0.16 85)";
    if (step.visited?.has(from) && step.visited?.has(to)) return "oklch(0.55 0.12 160)";
    return "oklch(0.3 0.04 240)";
  };

  const edgeWidth = (from, to) => {
    if (!step) return 1.5;
    const key = [from, to].sort().join("-");
    if (step.pathEdges?.has(key)) return 3;
    if (step.relaxedEdges?.has(key)) return 2.5;
    return 1.5;
  };

  const nodeFill = (n) => {
    if (!step) return "oklch(0.25 0.04 240)";
    if (step.currentNode === n) return "oklch(0.78 0.16 85)";
    if (step.updatedNodes?.has(n)) return "oklch(0.65 0.18 220)";
    if (step.visited?.has(n)) return "oklch(0.6 0.17 160)";
    return "oklch(0.25 0.04 240)";
  };

  const nodeStroke = (n) => {
    if (!step) return "oklch(0.4 0.04 240)";
    if (step.currentNode === n) return "oklch(0.7 0.17 75)";
    if (step.updatedNodes?.has(n)) return "oklch(0.55 0.18 220)";
    if (step.visited?.has(n)) return "oklch(0.5 0.15 160)";
    return "oklch(0.4 0.04 240)";
  };

  const nodeTxt = (n) => {
    if (!step) return "oklch(0.55 0.04 240)";
    if (step.currentNode === n || step.updatedNodes?.has(n) || step.visited?.has(n)) return "#000";
    return "#fff";
  };

  const distTxt = (n) => {
    if (!step || step.dist[n] === Infinity) return "oklch(0.4 0.04 240)";
    return "oklch(0.85 0.04 240)";
  };

  /* ─── Render ─────────────────────────────────────────────────────────────── */
  return (
    <>
      <SEO data={{ title: "Dijkstra's Algorithm — Shortest Path Visualization" }} />
      <AlgoPageLayout
        title="Dijkstra's Algorithm"
        category="Graph"
        categoryHref="/graph"
        timeComplexity="O((V+E) log V)"
        spaceComplexity="O(V)"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Graph SVG visualization */}
            <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* SVG Graph */}
                <div className="flex-1 flex items-center justify-center overflow-x-auto">
                  <svg viewBox="0 0 680 410" className="w-full max-w-2xl" style={{ minWidth: 320 }}>
                    {/* Edges */}
                    {EDGES.map(({ from, to, weight }) => {
                      const fp = NODE_POS[from];
                      const tp = NODE_POS[to];
                      const mx = (fp.x + tp.x) / 2;
                      const my = (fp.y + tp.y) / 2;
                      const col = edgeColor(from, to);
                      const w = edgeWidth(from, to);
                      return (
                        <g key={`${from}-${to}`}>
                          <line
                            x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                            stroke={col} strokeWidth={w} strokeLinecap="round"
                          />
                          <rect
                            x={mx - 11} y={my - 9} width={22} height={18} rx={4}
                            fill="oklch(0.08 0.02 240)"
                            stroke={col}
                            strokeWidth={0.5}
                          />
                          <text
                            x={mx} y={my + 0.5}
                            textAnchor="middle" dominantBaseline="central"
                            fill={col} fontSize={11} fontWeight={700}
                            fontFamily="ui-monospace, monospace"
                          >
                            {weight}
                          </text>
                        </g>
                      );
                    })}

                    {/* Nodes */}
                    {NODES.map((n) => {
                      const { x, y } = NODE_POS[n];
                      const d = step ? step.dist[n] : Infinity;
                      const isCur = step?.currentNode === n;
                      return (
                        <g key={n}>
                          {isCur && (
                            <circle
                              cx={x} cy={y} r={34}
                              fill="none"
                              stroke="oklch(0.78 0.16 85)"
                              strokeWidth={1.5}
                              opacity={0.4}
                              style={{ animation: "pulse 1s ease-in-out infinite" }}
                            />
                          )}
                          <circle
                            cx={x} cy={y} r={26}
                            fill={nodeFill(n)}
                            stroke={nodeStroke(n)}
                            strokeWidth={2}
                          />
                          <text
                            x={x} y={y}
                            textAnchor="middle" dominantBaseline="central"
                            fill={nodeTxt(n)}
                            fontSize={15} fontWeight={700}
                            fontFamily="ui-monospace, monospace"
                          >
                            {n}
                          </text>
                          <text
                            x={x} y={y + 40}
                            textAnchor="middle" dominantBaseline="central"
                            fill={distTxt(n)}
                            fontSize={12}
                            fontFamily="ui-monospace, monospace"
                          >
                            {fmt(d)}
                          </text>
                        </g>
                      );
                    })}

                    {/* START label */}
                    <text
                      x={NODE_POS.A.x} y={NODE_POS.A.y - 38}
                      textAnchor="middle"
                      fill="oklch(0.45 0.04 240)"
                      fontSize={10}
                      fontFamily="ui-monospace, monospace"
                    >
                      source
                    </text>

                    <style>{`@keyframes pulse{0%,100%{r:34;opacity:.4}50%{r:38;opacity:.15}}`}</style>
                  </svg>
                </div>

                {/* Distance table + legend + path summary */}
                <div className="lg:w-56 flex-shrink-0 space-y-4">
                  <div className="rounded-lg p-4 border" style={{ background: "oklch(0.1 0.02 240)", borderColor: BORDER }}>
                    <h3 className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-3 text-center">
                      Distance table
                    </h3>

                    <table className="w-full text-sm font-mono border-collapse">
                      <thead>
                        <tr className="text-slate-600 text-xs">
                          <th className="text-left pb-2 font-normal">Node</th>
                          <th className="text-center pb-2 font-normal">Dist</th>
                          <th className="text-center pb-2 font-normal">Via</th>
                          <th className="text-center pb-2 font-normal">✓</th>
                        </tr>
                      </thead>
                      <tbody>
                        {NODES.map((n) => {
                          const isCur = step?.currentNode === n;
                          const isUpd = step?.updatedNodes?.has(n);
                          const isVis = step?.visited?.has(n);
                          const rowBg = isCur
                            ? "oklch(0.2 0.08 75 / 0.3)"
                            : isUpd
                              ? "oklch(0.2 0.08 220 / 0.3)"
                              : "transparent";
                          const nameCl = isCur
                            ? "oklch(0.78 0.16 85)"
                            : isUpd
                              ? "oklch(0.65 0.18 220)"
                              : isVis
                                ? "oklch(0.65 0.15 160)"
                                : "oklch(0.45 0.04 240)";
                          const distCl = isCur
                            ? "oklch(0.8 0.14 75)"
                            : isUpd
                              ? "oklch(0.7 0.16 220)"
                              : "oklch(0.8 0.04 240)";
                          return (
                            <tr
                              key={n}
                              className="border-t"
                              style={{ borderColor: BORDER, background: rowBg }}
                            >
                              <td className="py-1.5 pl-2 font-bold" style={{ color: nameCl }}>{n}</td>
                              <td className="py-1.5 text-center" style={{ color: distCl }}>
                                {step ? fmt(step.dist[n]) : "∞"}
                              </td>
                              <td className="py-1.5 text-center" style={{ color: "oklch(0.45 0.04 240)" }}>
                                {step?.prev[n] ?? "—"}
                              </td>
                              <td className="py-1.5 text-center" style={{ color: "oklch(0.6 0.17 160)" }}>
                                {isVis ? "✓" : ""}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Legend */}
                  <div className="rounded-lg p-4 border" style={{ background: "oklch(0.1 0.02 240)", borderColor: BORDER }}>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Legend</p>
                    <div className="space-y-2 text-xs font-mono">
                      {[
                        { color: "oklch(0.78 0.16 85)", label: "Current" },
                        { color: "oklch(0.65 0.18 220)", label: "Updated" },
                        { color: "oklch(0.6 0.17 160)", label: "Visited" },
                        { color: "oklch(0.35 0.04 240)", label: "Unvisited" },
                      ].map(({ color, label }) => (
                        <div key={label} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: color }}
                          />
                          <span className="text-slate-400">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Path summary on done */}
                  {step?.pathEdges && (
                    <div className="rounded-lg p-4 border" style={{ background: "oklch(0.1 0.02 240)", borderColor: BORDER }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "oklch(0.65 0.17 160)" }}>
                        Shortest paths from A:
                      </p>
                      <div className="text-xs font-mono text-slate-400 space-y-1">
                        {NODES.filter((n) => n !== START).map((n) => {
                          const path = [];
                          let c = n;
                          while (c) {
                            path.unshift(c);
                            c = step.prev[c];
                          }
                          return (
                            <p key={n}>
                              <span className="text-slate-200">{path.join("→")}</span>
                              <span className="text-slate-500"> = {fmt(step.dist[n])}</span>
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
              {started && (
                <>
                  <button
                    onClick={goPrev}
                    disabled={stepIdx <= 0 || playing}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ borderColor: BORDER }}
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={goNext}
                    disabled={stepIdx >= steps.length - 1 || playing}
                    className="px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ borderColor: BORDER }}
                  >
                    Next →
                  </button>
                </>
              )}
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
