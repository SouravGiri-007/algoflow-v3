import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN   = "oklch(0.75 0.18 195)";
const BG     = "oklch(0.13 0.025 240)";
const BORDER = "oklch(0.22 0.04 240)";

const CODE = `def bellman_ford(graph, source):
    dist = {v: float('inf') for v in graph}
    dist[source] = 0

    V = len(graph)

    # Relax all edges V-1 times
    for i in range(V - 1):
        for u, v, w in graph.edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w

    # Check for negative weight cycles
    for u, v, w in graph.edges:
        if dist[u] + w < dist[v]:
            return "Negative cycle detected!"

    return dist`;

const DEFAULT_NODES = ["A","B","C","D","E"];
const DEFAULT_EDGES = [
  { u:"A", v:"B", w:4 },
  { u:"A", v:"C", w:2 },
  { u:"B", v:"C", w:5 },
  { u:"B", v:"D", w:10 },
  { u:"C", v:"E", w:3 },
  { u:"E", v:"D", w:4 },
  { u:"D", v:"B", w:-6 }, // negative weight edge
];

const NODE_POSITIONS = { A:{x:80,y:160}, B:{x:220,y:80}, C:{x:220,y:240}, D:{x:380,y:80}, E:{x:380,y:240} };

function buildSteps(nodes, edges, source) {
  const steps = [];
  const dist = {};
  nodes.forEach(v => dist[v] = Infinity);
  dist[source] = 0;

  steps.push({
    dist: {...dist}, activeEdge: null, line: 2,
    explanation: `Initialize distances. dist[${source}] = 0, all others = ∞.`,
  });

  for (let i = 0; i < nodes.length - 1; i++) {
    steps.push({ dist: {...dist}, activeEdge: null, line: 7,
      explanation: `Iteration ${i + 1} of ${nodes.length - 1}: relaxing all ${edges.length} edges.` });
    for (const { u, v, w } of edges) {
      steps.push({ dist: {...dist}, activeEdge: {u,v}, line: 9,
        explanation: `Checking edge ${u}→${v} (weight ${w}). dist[${u}]=${dist[u] === Infinity ? "∞" : dist[u]}, dist[${v}]=${dist[v] === Infinity ? "∞" : dist[v]}.` });
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        steps.push({ dist: {...dist}, activeEdge: {u,v}, relaxed: {u,v}, line: 10,
          explanation: `✅ Relaxed! dist[${v}] updated to ${dist[v]} (via ${u}: ${dist[u]} + ${w}).` });
      }
    }
  }

  // Negative cycle check
  let negCycle = false;
  for (const { u, v, w } of edges) {
    steps.push({ dist: {...dist}, activeEdge: {u,v}, line: 13,
      explanation: `Negative cycle check: edge ${u}→${v} (weight ${w}).` });
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      negCycle = true;
      steps.push({ dist: {...dist}, activeEdge: {u,v}, negCycle: true, line: 15,
        explanation: `⚠️ Negative cycle detected via edge ${u}→${v}!` });
      break;
    }
  }

  if (!negCycle) {
    steps.push({ dist: {...dist}, activeEdge: null, line: 17,
      explanation: `✅ Bellman-Ford complete. Shortest distances from ${source}: ` +
        nodes.map(n => `${n}=${dist[n] === Infinity ? "∞" : dist[n]}`).join(", ") });
  }
  return steps;
}

export default function BellmanFord() {
  const [steps, setSteps]     = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed]     = useState(700);
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
    if (!started) { runSteps(buildSteps(DEFAULT_NODES, DEFAULT_EDGES, "A")); return; }
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

  const isActiveEdge = (u, v) => cur?.activeEdge?.u === u && cur?.activeEdge?.v === v;
  const isRelaxed    = (u, v) => cur?.relaxed?.u === u && cur?.relaxed?.v === v;

  const getNodeStyle = (n) => {
    if (!cur) return { bg: BG, border: BORDER, text: "rgb(148 163 184)" };
    const isActive = cur.activeEdge?.u === n || cur.activeEdge?.v === n;
    if (isActive) return { bg: "oklch(0.75 0.18 195 / 0.15)", border: CYAN, text: "white" };
    if (cur.dist?.[n] !== Infinity && cur.dist?.[n] !== undefined)
      return { bg: "oklch(0.75 0.18 195 / 0.08)", border: "oklch(0.75 0.18 195 / 0.3)", text: "white" };
    return { bg: BG, border: BORDER, text: "rgb(100 116 139)" };
  };

  const svgW = 480, svgH = 320;

  return (
    <>
      <SEO data={{ title: "Bellman-Ford" }} />
      <AlgoPageLayout title="Bellman-Ford Algorithm" category="Graph" categoryHref="/graph" timeComplexity="O(VE)" spaceComplexity="O(V)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Graph SVG */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs text-slate-500 mb-3">Graph (source: A) — includes negative weight edge D→B (-6)</p>
              <div className="overflow-x-auto">
                <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto">
                  <defs>
                    <marker id="arrow-bf" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill="oklch(0.4 0.05 240)" />
                    </marker>
                    <marker id="arrow-bf-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill={CYAN} />
                    </marker>
                    <marker id="arrow-bf-relaxed" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L8,3 z" fill="oklch(0.65 0.18 145)" />
                    </marker>
                  </defs>

                  {DEFAULT_EDGES.map(({ u, v, w }, i) => {
                    const p1 = NODE_POSITIONS[u], p2 = NODE_POSITIONS[v];
                    const active = isActiveEdge(u, v);
                    const relaxed = isRelaxed(u, v);
                    const neg = w < 0;
                    const dx = p2.x - p1.x, dy = p2.y - p1.y;
                    const len = Math.sqrt(dx*dx+dy*dy);
                    const ex = p1.x + dx/len*22, ey = p1.y + dy/len*22;
                    const ex2 = p2.x - dx/len*22, ey2 = p2.y - dy/len*22;
                    const mx = (ex+ex2)/2, my = (ey+ey2)/2;
                    const stroke = relaxed ? "oklch(0.65 0.18 145)" : active ? CYAN : neg ? "oklch(0.65 0.18 30)" : "oklch(0.35 0.05 240)";
                    const markerId = relaxed ? "arrow-bf-relaxed" : active ? "arrow-bf-active" : "arrow-bf";
                    return (
                      <g key={i}>
                        <line x1={ex} y1={ey} x2={ex2} y2={ey2}
                          stroke={stroke} strokeWidth={active || relaxed ? 2.5 : 1.5}
                          markerEnd={`url(#${markerId})`} strokeDasharray={neg ? "5,3" : undefined} />
                        <text x={mx} y={my - 6} textAnchor="middle" fontSize={11}
                          fill={neg ? "oklch(0.65 0.18 30)" : "rgb(148 163 184)"}>
                          {w}
                        </text>
                      </g>
                    );
                  })}

                  {DEFAULT_NODES.map(n => {
                    const { x, y } = NODE_POSITIONS[n];
                    const s = getNodeStyle(n);
                    const d = cur?.dist?.[n];
                    return (
                      <g key={n}>
                        <circle cx={x} cy={y} r={22} fill={s.bg} stroke={s.border} strokeWidth={2} />
                        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                          fontSize={13} fontWeight="bold" fill={s.text}>{n}</text>
                        {d !== undefined && (
                          <text x={x} y={y + 36} textAnchor="middle" fontSize={11}
                            fill={d === Infinity ? "rgb(100 116 139)" : CYAN}>
                            {d === Infinity ? "∞" : d}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Distance table */}
            {cur && (
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Distance Table</p>
                <div className="flex gap-2 flex-wrap">
                  {DEFAULT_NODES.map(n => (
                    <div key={n} className="flex flex-col items-center px-3 py-2 rounded-lg border"
                      style={{ background: cur?.activeEdge?.v === n ? "oklch(0.75 0.18 195 / 0.1)" : "oklch(0.17 0.03 240)",
                               borderColor: cur?.activeEdge?.v === n ? CYAN : BORDER }}>
                      <span className="text-xs text-slate-500">{n}</span>
                      <span className="font-bold text-sm mt-0.5" style={{ color: CYAN }}>
                        {cur.dist?.[n] === Infinity ? "∞" : cur.dist?.[n]}
                      </span>
                    </div>
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

            <ExplanationPanel steps={steps.map(s => s.explanation)} currentStep={stepIdx} totalSteps={steps.length} />
          </div>
          <div className="h-[500px] xl:h-auto">
            <CodePanel code={CODE} highlightLine={cur?.line ?? null} language="python" />
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
