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
  pseudo: `FLOYD-WARSHALL(n, dist):
  for k = 0 to n-1:          // intermediate node
    for i = 0 to n-1:        // source
      for j = 0 to n-1:      // destination
        if dist[i][k] + dist[k][j] < dist[i][j]:
          dist[i][j] = dist[i][k] + dist[k][j]

  // Negative cycle check
  for i = 0 to n-1:
    if dist[i][i] < 0:
      return "Negative cycle!"
  return dist`,
  python: `INF = float('inf')

def floyd_warshall(graph, n):
    dist = [row[:] for row in graph]

    for k in range(n):
        for i in range(n):
            for j in range(n):
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] = dist[i][k] + dist[k][j]

    for i in range(n):
        if dist[i][i] < 0:
            raise ValueError("Negative cycle")

    return dist`,
  javascript: `function floydWarshall(graph, n) {
  const INF = Infinity;
  const dist = graph.map(r => [...r]);

  for (let k = 0; k < n; k++)
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j])
          dist[i][j] = dist[i][k] + dist[k][j];

  for (let i = 0; i < n; i++)
    if (dist[i][i] < 0)
      throw new Error("Negative cycle");

  return dist;
}`,
  cpp: `void floydWarshall(vector<vector<int>>& dist, int n) {
  const int INF = 1e8;
  for (int k = 0; k < n; k++)
    for (int i = 0; i < n; i++)
      for (int j = 0; j < n; j++)
        if (dist[i][k] + dist[k][j] < dist[i][j])
          dist[i][j] = dist[i][k] + dist[k][j];

  for (int i = 0; i < n; i++)
    if (dist[i][i] < 0)
      throw runtime_error("Negative cycle");
}`,
};

// ─── Constants ────────────────────────────────────────────────────────────────
const INF = 1e8;
const N = 5;

const DIRECTED_EDGES = [
  [0, 1, 3],
  [0, 2, 8],
  [1, 2, 2],
  [1, 3, 5],
  [2, 4, 1],
  [3, 2, 1],
  [3, 4, 6],
  [4, 0, 4],
  [4, 3, 2],
];

const GRAPH_NODES = [
  { id: 0, x: 250, y: 55 },
  { id: 1, x: 60, y: 200 },
  { id: 2, x: 145, y: 375 },
  { id: 3, x: 355, y: 375 },
  { id: 4, x: 440, y: 200 },
];

// ─── buildSteps ──────────────────────────────────────────────────────────────
function buildSteps() {
  const steps = [];
  const dist = Array.from({ length: N }, () => Array(N).fill(INF));
  for (let i = 0; i < N; i++) dist[i][i] = 0;
  for (const [u, v, w] of DIRECTED_EDGES) dist[u][v] = w;
  const everUpdated = new Set();

  const snap = () => dist.map((r) => [...r]);
  const disp = (v) => (v >= INF ? "∞" : v);

  steps.push({
    k: -1, i: -1, j: -1,
    matrix: snap(), updated: false, oldVal: null, newVal: null,
    ikVal: null, kjVal: null, phase: "init",
    everUpdated: new Set(),
    explanation: "Initial matrix — direct edge weights, 0 on diagonal, ∞ where no direct path.",
    line: 0,
  });

  for (let k = 0; k < N; k++) {
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const ikVal = dist[i][k];
        const kjVal = dist[k][j];
        const through = ikVal >= INF || kjVal >= INF ? INF : ikVal + kjVal;
        const oldVal = dist[i][j];
        const updated = through < oldVal;

        if (updated) {
          dist[i][j] = through;
          everUpdated.add(`${i}-${j}`);
        }

        let explanation;
        if (i === j) {
          explanation = `dist[${i}][${j}] = 0  (diagonal — trivial self-path)`;
        } else if (updated) {
          explanation = `dist[${i}][${j}]: ${disp(oldVal)} → ${disp(through)}  via node ${k}  (${disp(ikVal)} + ${disp(kjVal)} < ${disp(oldVal)})  ✓ Updated`;
        } else {
          const why = through >= INF
            ? `path ${i}→${k}→${j} doesn't exist`
            : `${disp(ikVal)} + ${disp(kjVal)} = ${through} ≥ ${disp(oldVal)}`;
          explanation = `dist[${i}][${j}] stays ${disp(oldVal)}  —  ${why}`;
        }

        steps.push({
          k, i, j,
          matrix: snap(), updated, oldVal, newVal: dist[i][j],
          ikVal, kjVal, phase: "running",
          everUpdated: new Set(everUpdated),
          explanation,
          line: updated ? 7 : 5,
        });
      }
    }
  }

  steps.push({
    k: -1, i: -1, j: -1,
    matrix: snap(), updated: false, oldVal: null, newVal: null,
    ikVal: null, kjVal: null, phase: "done",
    everUpdated: new Set(everUpdated),
    explanation: `All-pairs shortest paths computed — ${everUpdated.size} cells updated from the initial matrix.`,
    line: 10,
  });

  return steps;
}

// ─── Style helpers ────────────────────────────────────────────────────────────
function getNodeStyle(id, step) {
  const DEFAULT = { fill: "oklch(0.22 0.03 240)", stroke: "oklch(0.35 0.05 240)", text: "rgb(148 163 184)" };
  if (!step || step.phase !== "running") return DEFAULT;
  if (id === step.k)
    return { fill: "oklch(0.55 0.2 270)", stroke: "oklch(0.7 0.18 270)", text: "#ffffff" };
  if (id === step.i)
    return { fill: "oklch(0.6 0.18 80)", stroke: "oklch(0.75 0.15 80)", text: "#000000" };
  if (id === step.j)
    return { fill: "oklch(0.55 0.2 25)", stroke: "oklch(0.7 0.18 25)", text: "#ffffff" };
  return DEFAULT;
}

function getEdgeStyle(u, v, step) {
  const DEFAULT = { stroke: "oklch(0.35 0.05 240)", markerIdx: 0, width: 2, opacity: 0.6, dash: undefined };
  if (!step || step.phase !== "running") return DEFAULT;
  if (u === step.i && v === step.k)
    return { stroke: "oklch(0.75 0.15 80)", markerIdx: 1, width: 2.5, opacity: 1, dash: undefined };
  if (u === step.k && v === step.j)
    return { stroke: "oklch(0.7 0.18 25)", markerIdx: 2, width: 2.5, opacity: 1, dash: undefined };
  if (u === step.i && v === step.j)
    return { stroke: "oklch(0.65 0.04 230)", markerIdx: 3, width: 1.5, opacity: 0.7, dash: "6 3" };
  return DEFAULT;
}

function arrowEndpoints(n1, n2, r = 26, pad = 10) {
  const dx = n2.x - n1.x, dy = n2.y - n1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len;
  return {
    x1: n1.x + ux * (r + 2), y1: n1.y + uy * (r + 2),
    x2: n2.x - ux * (r + pad), y2: n2.y - uy * (r + pad),
  };
}

function edgeLabelPos(n1, n2, offset = 13) {
  const mx = (n1.x + n2.x) / 2, my = (n1.y + n2.y) / 2;
  const dx = n2.x - n1.x, dy = n2.y - n1.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  return { x: mx + (-dy / len) * offset, y: my + (dx / len) * offset };
}

function getCellStyle(i, j, step) {
  const isCurrent = step?.phase === "running" && i === step.i && j === step.j;
  const isKAxis = step?.phase === "running" && (i === step.k || j === step.k);
  const wasUpdated = step?.everUpdated?.has(`${i}-${j}`);
  const isDiag = i === j;

  if (isCurrent && step.updated)
    return { bg: "oklch(0.3 0.1 155)", text: "oklch(0.75 0.15 155)", bold: true };
  if (isCurrent)
    return { bg: "oklch(0.35 0.12 80)", text: "oklch(0.8 0.15 80)", bold: true };
  if (isDiag)
    return { bg: "oklch(0.15 0.02 240)", text: "oklch(0.35 0.04 240)", bold: false };
  if (isKAxis && wasUpdated)
    return { bg: "oklch(0.2 0.08 270)", text: "oklch(0.7 0.12 270)", bold: false };
  if (isKAxis)
    return { bg: "oklch(0.18 0.06 270)", text: "oklch(0.65 0.1 270)", bold: false };
  if (wasUpdated)
    return { bg: "oklch(0.18 0.07 155)", text: "oklch(0.7 0.13 155)", bold: false };
  return { bg: "oklch(0.16 0.02 240)", text: "oklch(0.5 0.04 240)", bold: false };
}

const disp = (v) => (v === null || v >= INF ? "∞" : v);

// ─── Component ────────────────────────────────────────────────────────────────
export default function FloydWarshall() {
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]);
  }, []);

  const runSteps = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      idx++;
      if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; }
      setStepIdx(idx);
    }, speed);
  };

  const togglePlay = () => {
    if (!started) { runSteps(buildSteps()); return; }
    if (playing) { clearInterval(timerRef.current); setPlaying(false); }
    else {
      setPlaying(true);
      let idx = stepIdx;
      timerRef.current = setInterval(() => {
        idx++;
        if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length - 1); return; }
        setStepIdx(idx);
      }, speed);
    }
  };

  return (
    <>
      <SEO data={{ title: "Floyd-Warshall Algorithm" }} />
      <AlgoPageLayout
        title="Floyd-Warshall"
        category="Graph"
        categoryHref="/graph"
        timeComplexity="O(V³)"
        spaceComplexity="O(V²)"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Graph SVG */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs text-slate-500 mb-3">
                Graph (directed, weighted)
                {cur?.phase === "running" && (
                  <span className="ml-3"> — k = {cur.k}, i = {cur.i}, j = {cur.j}</span>
                )}
              </p>
              <div className="overflow-x-auto">
                <svg viewBox="0 0 500 420" className="w-full h-auto" style={{ maxWidth: 500 }}>
                  <defs>
                    {[
                      { id: "arr-0", color: "oklch(0.35 0.05 240)" },
                      { id: "arr-1", color: "oklch(0.75 0.15 80)" },
                      { id: "arr-2", color: "oklch(0.7 0.18 25)" },
                      { id: "arr-3", color: "oklch(0.65 0.04 230)" },
                    ].map(({ id, color }) => (
                      <marker key={id} id={id} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill={color} />
                      </marker>
                    ))}
                  </defs>

                  {DIRECTED_EDGES.map(([u, v, w]) => {
                    const nu = GRAPH_NODES[u];
                    const nv = GRAPH_NODES[v];
                    const ep = arrowEndpoints(nu, nv);
                    const lp = edgeLabelPos(nu, nv);
                    const sty = getEdgeStyle(u, v, cur);
                    return (
                      <g key={`${u}-${v}`}>
                        <line
                          x1={ep.x1} y1={ep.y1} x2={ep.x2} y2={ep.y2}
                          stroke={sty.stroke} strokeWidth={sty.width}
                          strokeOpacity={sty.opacity} strokeDasharray={sty.dash}
                          markerEnd={`url(#arr-${sty.markerIdx})`}
                          className="transition-all duration-200"
                        />
                        <text
                          x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
                          fill={sty.stroke} fontSize={11} fontFamily="monospace"
                          className="select-none transition-all duration-200"
                          fillOpacity={sty.opacity}
                        >
                          {w}
                        </text>
                      </g>
                    );
                  })}

                  {GRAPH_NODES.map((node) => {
                    const sty = getNodeStyle(node.id, cur);
                    return (
                      <g key={node.id}>
                        <circle
                          cx={node.x} cy={node.y} r={26}
                          fill={sty.fill} stroke={sty.stroke} strokeWidth={2}
                          className="transition-all duration-300"
                        />
                        <text
                          x={node.x} y={node.y} textAnchor="middle" dominantBaseline="central"
                          fill={sty.text} fontSize={15} fontWeight="700" fontFamily="monospace"
                          className="select-none"
                        >
                          {node.id}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Node role legend */}
              {cur?.phase === "running" && (
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-3">
                  {[
                    { color: "oklch(0.55 0.2 270)", label: `k = ${cur.k}  (intermediate)` },
                    { color: "oklch(0.6 0.18 80)", label: `i = ${cur.i}  (source row)` },
                    { color: "oklch(0.55 0.2 25)", label: `j = ${cur.j}  (dest col)` },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                      <span className="text-slate-500 text-xs font-mono">{l.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Distance Matrix */}
            <div className="rounded-xl border p-4 overflow-x-auto" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs text-slate-500 mb-3">
                Distance Matrix
                {cur?.phase === "running" ? ` — outer loop k = ${cur.k}` : ""}
              </p>
              <div className="flex justify-center">
                <table className="border-collapse font-mono text-sm">
                  <thead>
                    <tr>
                      <th className="w-10 h-10 font-normal text-xs" style={{ color: "oklch(0.4 0.04 240)" }}>i \ j</th>
                      {Array.from({ length: N }, (_, j) => (
                        <th
                          key={j}
                          className="w-14 h-10 text-center transition-colors duration-200"
                          style={{
                            color: cur?.phase === "running" && j === cur.k ? "oklch(0.65 0.1 270)" : "oklch(0.5 0.04 240)",
                            fontWeight: cur?.phase === "running" && j === cur.k ? "700" : "400",
                          }}
                        >
                          {j}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: N }, (_, i) => (
                      <tr key={i}>
                        <td
                          className="w-10 h-12 text-center transition-colors duration-200"
                          style={{
                            color: cur?.phase === "running" && i === cur.k ? "oklch(0.65 0.1 270)" : "oklch(0.5 0.04 240)",
                            fontWeight: cur?.phase === "running" && i === cur.k ? "700" : "400",
                          }}
                        >
                          {i}
                        </td>
                        {Array.from({ length: N }, (_, j) => {
                          const val = cur?.matrix?.[i]?.[j] ?? INF;
                          const cs = getCellStyle(i, j, cur);
                          return (
                            <td
                              key={j}
                              style={{ backgroundColor: cs.bg, color: cs.text }}
                              className={`text-center w-14 h-12 border transition-all duration-200 text-base ${cs.bold ? "font-bold" : ""}`}
                            >
                              {val >= INF ? "∞" : val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Matrix legend */}
              <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-5">
                {[
                  { bg: "oklch(0.35 0.12 80)", text: "oklch(0.8 0.15 80)", label: "Evaluating" },
                  { bg: "oklch(0.3 0.1 155)", text: "oklch(0.75 0.15 155)", label: "Updated ✓" },
                  { bg: "oklch(0.18 0.06 270)", text: "oklch(0.65 0.1 270)", label: "k row / col" },
                  { bg: "oklch(0.18 0.07 155)", text: "oklch(0.7 0.13 155)", label: "Previously updated" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div
                      className="w-8 h-5 rounded text-xs flex items-center justify-center font-mono shrink-0"
                      style={{ backgroundColor: l.bg, color: l.text }}
                    >
                      3
                    </div>
                    <span className="text-slate-500 text-xs">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formula breakdown */}
            {cur?.phase === "running" && cur.i !== cur.j && (
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs text-slate-500 mb-2">Formula Breakdown</p>
                <div className="flex justify-center items-center gap-2 font-mono text-xs flex-wrap">
                  <span style={{ color: "oklch(0.5 0.04 240)" }}>
                    dist[{cur.i}][{cur.k}] ={" "}
                    <span style={{ color: "oklch(0.75 0.15 80)" }}>{disp(cur.ikVal)}</span>
                  </span>
                  <span style={{ color: "oklch(0.35 0.04 240)" }}>+</span>
                  <span style={{ color: "oklch(0.5 0.04 240)" }}>
                    dist[{cur.k}][{cur.j}] ={" "}
                    <span style={{ color: "oklch(0.7 0.18 25)" }}>{disp(cur.kjVal)}</span>
                  </span>
                  <span style={{ color: "oklch(0.35 0.04 240)" }}>=</span>
                  <span
                    style={{
                      color: cur.updated ? "oklch(0.75 0.15 155)" : "oklch(0.55 0.04 240)",
                      fontWeight: cur.updated ? "bold" : "normal",
                    }}
                  >
                    {cur.ikVal >= INF || cur.kjVal >= INF ? "∞" : cur.ikVal + cur.kjVal}
                  </span>
                  <span style={{ color: "oklch(0.35 0.04 240)" }}>
                    {cur.updated ? "< " : "≥ "}
                  </span>
                  <span style={{ color: "oklch(0.5 0.04 240)" }}>
                    dist[{cur.i}][{cur.j}] = {disp(cur.oldVal)}
                  </span>
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

            <ExplanationPanel steps={steps.map(s => s.explanation)} currentStep={stepIdx} totalSteps={steps.length} />
          </div>
          <div className="h-[500px] xl:h-auto">
            <CodePanel codes={CODES} highlightLine={cur?.line ?? null} />
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
