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
  pseudo: `KRUSKAL-MST(graph):
  sort all edges by weight
  create disjoint sets for each vertex
  mst = []
  for each edge (u, v, w) in sorted order:
    if find(u) != find(v):  // no cycle
      mst.add(edge)
      union(u, v)
  return mst`,
  python: `def kruskal(graph):
    edges = sorted(graph.edges, key=lambda e: e[2])
    parent = {v: v for v in graph.nodes}
    rank = {v: 0 for v in graph.nodes}
    mst = []

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(x, y):
        px, py = find(x), find(y)
        if rank[px] < rank[py]: px, py = py, px
        parent[py] = px
        if rank[px] == rank[py]: rank[px] += 1

    for u, v, w in edges:
        if find(u) != find(v):
            mst.append((u, v, w))
            union(u, v)
    return mst`,
  javascript: `function kruskal(nodes, edges) {
  edges.sort((a, b) => a.w - b.w);
  const parent = Object.fromEntries(nodes.map(n => [n, n]));
  const rank = Object.fromEntries(nodes.map(n => [n, 0]));
  const mst = [];
  const find = x => parent[x] === x ? x : (parent[x] = find(parent[x]));
  const union = (x, y) => {
    let [px, py] = [find(x), find(y)];
    if (rank[px] < rank[py]) [px, py] = [py, px];
    parent[py] = px;
    if (rank[px] === rank[py]) rank[px]++;
  };
  for (const {u, v, w} of edges)
    if (find(u) !== find(v)) { mst.push({u,v,w}); union(u, v); }
  return mst;
}`,
  cpp: `vector<tuple<int,int,int>> kruskal(int n, vector<tuple<int,int,int>>& edges) {
  sort(edges.begin(), edges.end());
  vector<int> parent(n), rank(n,0);
  iota(parent.begin(), parent.end(), 0);
  function<int(int)> find = [&](int x) {
    return parent[x]==x ? x : parent[x]=find(parent[x]);
  };
  vector<tuple<int,int,int>> mst;
  for (auto [w,u,v] : edges)
    if (find(u)!=find(v)) {
      mst.push_back({w,u,v});
      parent[find(u)] = find(v);
    }
  return mst;
}`,
};

const NODES = ["A","B","C","D","E","F"];
const EDGES = [
  {u:"A",v:"B",w:4},{u:"A",v:"C",w:2},{u:"B",v:"C",w:1},
  {u:"B",v:"D",w:5},{u:"C",v:"D",w:8},{u:"C",v:"E",w:10},
  {u:"D",v:"E",w:2},{u:"D",v:"F",w:6},{u:"E",v:"F",w:3},
];
const POS = {A:{x:80,y:160},B:{x:200,y:70},C:{x:200,y:250},D:{x:320,y:70},E:{x:320,y:250},F:{x:440,y:160}};

function buildSteps() {
  const steps = [];
  const sortedEdges = [...EDGES].sort((a,b) => a.w - b.w);
  const parent = Object.fromEntries(NODES.map(n => [n, n]));
  const rank = Object.fromEntries(NODES.map(n => [n, 0]));
  const mst = new Set();
  const rejected = new Set();
  let totalCost = 0;

  const find = x => { if (parent[x] !== x) parent[x] = find(parent[x]); return parent[x]; };
  const union = (x, y) => { let px = find(x), py = find(y); if (rank[px] < rank[py]) [px,py]=[py,px]; parent[py]=px; if (rank[px]===rank[py]) rank[px]++; };

  steps.push({ mst: new Set(), rejected: new Set(), current: null, sortedEdges, line: 1, explanation: `Kruskal's MST: Sort all edges by weight. Sorted: ${sortedEdges.map(e=>`${e.u}-${e.v}(${e.w})`).join(", ")}` });

  for (const edge of sortedEdges) {
    const {u, v, w} = edge;
    steps.push({ mst: new Set(mst), rejected: new Set(rejected), current: edge, sortedEdges, line: 4, explanation: `Checking edge ${u}–${v} (weight ${w}). find(${u})=${find(u)}, find(${v})=${find(v)}.` });
    if (find(u) !== find(v)) {
      mst.add(`${u}-${v}`);
      totalCost += w;
      union(u, v);
      steps.push({ mst: new Set(mst), rejected: new Set(rejected), current: edge, sortedEdges, line: 6, explanation: `✅ No cycle! Adding ${u}–${v} (${w}) to MST. Total cost: ${totalCost}.` });
    } else {
      rejected.add(`${u}-${v}`);
      steps.push({ mst: new Set(mst), rejected: new Set(rejected), current: edge, sortedEdges, line: 5, explanation: `❌ Cycle detected! ${u} and ${v} already connected. Skipping edge ${u}–${v} (${w}).` });
    }
    if (mst.size === NODES.length - 1) break;
  }
  steps.push({ mst: new Set(mst), rejected: new Set(rejected), current: null, sortedEdges, line: 8, explanation: `✅ Kruskal's MST complete! Total cost = ${totalCost}.` });
  return steps;
}

export default function KruskalsMST() {
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => { clearInterval(timerRef.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);
  const runSteps = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0; clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length-1); return; } setStepIdx(idx); }, speed);
  };
  const togglePlay = () => {
    if (!started) { runSteps(buildSteps()); return; }
    if (playing) { clearInterval(timerRef.current); setPlaying(false); }
    else { setPlaying(true); let idx = stepIdx; timerRef.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length-1); return; } setStepIdx(idx); }, speed); }
  };

  const inMST = (u,v) => cur?.mst?.has(`${u}-${v}`) || cur?.mst?.has(`${v}-${u}`);
  const isRejected = (u,v) => cur?.rejected?.has(`${u}-${v}`) || cur?.rejected?.has(`${v}-${u}`);
  const isCurrent = (u,v) => cur?.current?.u===u && cur?.current?.v===v;

  return (
    <>
      <SEO data={{ title: "Kruskal's MST" }} />
      <AlgoPageLayout title="Kruskal's Minimum Spanning Tree" category="Graph" categoryHref="/graph" timeComplexity="O(E log E)" spaceComplexity="O(V)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex gap-4 text-xs text-slate-500 mb-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:CYAN}}/>MST</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:"oklch(0.65 0.18 60)"}}/>Considering</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{background:"oklch(0.45 0.12 30)"}}/>Rejected</span>
              </div>
              <svg width={520} height={320} viewBox="0 0 520 320" className="mx-auto">
                {EDGES.map(({u,v,w},i) => {
                  const p1=POS[u], p2=POS[v];
                  const mst=inMST(u,v), rej=isRejected(u,v), cur_=isCurrent(u,v);
                  const mx=(p1.x+p2.x)/2, my=(p1.y+p2.y)/2;
                  return (
                    <g key={i}>
                      <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                        stroke={mst?CYAN:cur_?"oklch(0.65 0.18 60)":rej?"oklch(0.45 0.12 30)":"oklch(0.28 0.05 240)"}
                        strokeWidth={mst||cur_?3:1.5} strokeDasharray={!mst&&!cur_?"4,3":undefined}
                        opacity={rej?0.3:1} />
                      <rect x={mx-10} y={my-9} width={20} height={16} rx={3} fill="oklch(0.13 0.025 240)" />
                      <text x={mx} y={my+1} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="rgb(148 163 184)">{w}</text>
                    </g>
                  );
                })}
                {NODES.map(n => {
                  const {x,y}=POS[n];
                  return (
                    <g key={n}>
                      <circle cx={x} cy={y} r={20} fill={BG} stroke={BORDER} strokeWidth={2}/>
                      <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="bold" fill="rgb(203 213 225)">{n}</text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {cur?.sortedEdges && (
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sorted Edges</p>
                <div className="flex flex-wrap gap-2">
                  {cur.sortedEdges.map(({u,v,w},i) => {
                    const mst=inMST(u,v), rej=isRejected(u,v), isCur=cur?.current?.u===u&&cur?.current?.v===v;
                    return (
                      <span key={i} className="px-2 py-1 rounded text-xs font-mono border transition-all"
                        style={{background:mst?"oklch(0.55 0.18 145/0.15)":isCur?"oklch(0.65 0.18 60/0.15)":rej?"oklch(0.45 0.12 30/0.1)":"oklch(0.17 0.03 240)",
                          borderColor:mst?"oklch(0.55 0.18 145)":isCur?"oklch(0.65 0.18 60)":rej?"oklch(0.45 0.12 30)":BORDER,
                          color:mst?"oklch(0.75 0.18 145)":isCur?"oklch(0.75 0.18 60)":rej?"oklch(0.4 0.08 30)":"rgb(148 163 184)",
                          opacity:rej?0.5:1}}>
                        {u}–{v} ({w})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{ background: BG, borderColor: BORDER }}>
              <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm" style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300" style={{ borderColor: BORDER }}>
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
