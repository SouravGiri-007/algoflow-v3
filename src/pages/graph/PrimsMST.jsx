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

const CODE = `def prims_mst(graph, start):
    visited = {start}
    mst_edges = []
    total_cost = 0

    while len(visited) < len(graph):
        min_edge = None
        min_cost = float('inf')

        # Find minimum weight edge crossing the cut
        for u in visited:
            for v, w in graph[u]:
                if v not in visited:
                    if w < min_cost:
                        min_cost = w
                        min_edge = (u, v, w)

        if min_edge is None:
            break

        u, v, w = min_edge
        visited.add(v)
        mst_edges.append(min_edge)
        total_cost += w

    return mst_edges, total_cost`;

const NODES = ["A","B","C","D","E","F"];
const EDGES = [
  {u:"A",v:"B",w:4},{u:"A",v:"C",w:2},{u:"B",v:"C",w:1},
  {u:"B",v:"D",w:5},{u:"C",v:"D",w:8},{u:"C",v:"E",w:10},
  {u:"D",v:"E",w:2},{u:"D",v:"F",w:6},{u:"E",v:"F",w:3},
];
const POS = { A:{x:80,y:160}, B:{x:200,y:70}, C:{x:200,y:250}, D:{x:320,y:70}, E:{x:320,y:250}, F:{x:440,y:160} };

function buildGraph() {
  const g = {};
  NODES.forEach(n => g[n] = []);
  EDGES.forEach(({u,v,w}) => { g[u].push([v,w]); g[v].push([u,w]); });
  return g;
}

function buildSteps() {
  const graph = buildGraph();
  const steps = [];
  const visited = new Set(["A"]);
  const mstEdges = new Set();
  let totalCost = 0;

  steps.push({ visited: new Set(visited), mstEdges: new Set(), considering: null, line: 1,
    explanation: `Starting Prim's MST from node A. visited={A}. We'll grow the MST by always picking the cheapest edge crossing the cut.` });

  while (visited.size < NODES.length) {
    let minEdge = null, minCost = Infinity;
    for (const u of visited) {
      for (const [v, w] of graph[u]) {
        if (!visited.has(v)) {
          steps.push({ visited: new Set(visited), mstEdges: new Set(mstEdges), considering: {u,v,w}, line: 10,
            explanation: `Considering edge ${u}→${v} (weight ${w}). Current min = ${minCost === Infinity ? "∞" : minCost}.` });
          if (w < minCost) { minCost = w; minEdge = {u,v,w}; }
        }
      }
    }
    if (!minEdge) break;
    const {u,v,w} = minEdge;
    visited.add(v);
    mstEdges.add(`${u}-${v}`);
    totalCost += w;
    steps.push({ visited: new Set(visited), mstEdges: new Set(mstEdges), chosen: minEdge, line: 21,
      explanation: `✅ Chose edge ${u}→${v} (weight ${w}) — cheapest crossing edge. Total MST cost so far: ${totalCost}. Adding ${v} to MST.` });
  }
  steps.push({ visited: new Set(visited), mstEdges: new Set(mstEdges), line: 24,
    explanation: `✅ Prim's MST complete! Total cost = ${totalCost}. All ${NODES.length} nodes connected.` });
  return steps;
}

export default function PrimsMST() {
  const [steps, setSteps]     = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed]     = useState(800);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]);
  }, []);

  const runSteps = useCallback((s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      idx++;
      if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; }
      setStepIdx(idx);
    }, speed);
  }, [speed]);

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

  const isMST = (u,v) => cur?.mstEdges?.has(`${u}-${v}`) || cur?.mstEdges?.has(`${v}-${u}`);
  const isConsidering = (u,v) => (cur?.considering?.u===u&&cur?.considering?.v===v)||(cur?.considering?.u===v&&cur?.considering?.v===u);
  const isChosen = (u,v) => (cur?.chosen?.u===u&&cur?.chosen?.v===v)||(cur?.chosen?.u===v&&cur?.chosen?.v===u);

  return (
    <>
      <SEO data={{ title: "Prim's MST" }} />
      <AlgoPageLayout title="Prim's Minimum Spanning Tree" category="Graph" categoryHref="/graph" timeComplexity="O(V²)" spaceComplexity="O(V)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: CYAN }} />MST Edge</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "oklch(0.65 0.18 60)" }} />Considering</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "oklch(0.55 0.18 145)" }} />In MST</span>
              </div>
              <div className="overflow-x-auto">
                <svg width={520} height={320} viewBox="0 0 520 320" className="mx-auto">
                  {EDGES.map(({u,v,w},i) => {
                    const p1=POS[u], p2=POS[v];
                    const inMST = isMST(u,v);
                    const considering = isConsidering(u,v);
                    const chosen = isChosen(u,v);
                    const mx=(p1.x+p2.x)/2, my=(p1.y+p2.y)/2;
                    return (
                      <g key={i}>
                        <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                          stroke={chosen ? "oklch(0.65 0.18 145)" : inMST ? CYAN : considering ? "oklch(0.65 0.18 60)" : "oklch(0.28 0.05 240)"}
                          strokeWidth={inMST||chosen ? 3 : considering ? 2 : 1.5}
                          strokeDasharray={!inMST && !considering && !chosen ? "4,3" : undefined} />
                        <rect x={mx-10} y={my-9} width={20} height={16} rx={3}
                          fill="oklch(0.13 0.025 240)" />
                        <text x={mx} y={my+1} textAnchor="middle" dominantBaseline="middle"
                          fontSize={11} fill="rgb(148 163 184)">{w}</text>
                      </g>
                    );
                  })}
                  {NODES.map(n => {
                    const {x,y}=POS[n];
                    const inVisited = cur?.visited?.has(n);
                    return (
                      <g key={n}>
                        <circle cx={x} cy={y} r={20}
                          fill={inVisited ? "oklch(0.55 0.18 145 / 0.2)" : BG}
                          stroke={inVisited ? "oklch(0.55 0.18 145)" : BORDER}
                          strokeWidth={2} />
                        <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle"
                          fontSize={13} fontWeight="bold"
                          fill={inVisited ? "oklch(0.8 0.15 145)" : "rgb(148 163 184)"}>{n}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

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
