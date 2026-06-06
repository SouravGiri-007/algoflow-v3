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
  pseudo: `TOPOLOGICAL-SORT(graph):
  compute in-degree for each node
  queue = all nodes with in-degree 0
  result = []
  while queue not empty:
    node = dequeue
    result.append(node)
    for each neighbor of node:
      in-degree[neighbor] -= 1
      if in-degree[neighbor] == 0:
        enqueue neighbor
  return result`,
  python: `from collections import deque

def topological_sort(graph):
    in_degree = {v: 0 for v in graph}
    for u in graph:
        for v in graph[u]:
            in_degree[v] += 1
    queue = deque([v for v in in_degree if in_degree[v] == 0])
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    return result`,
  javascript: `function topologicalSort(graph) {
  const inDegree = {};
  for (const u in graph) inDegree[u] = 0;
  for (const u in graph)
    for (const v of graph[u]) inDegree[v]++;
  const queue = Object.keys(inDegree).filter(v => inDegree[v] === 0);
  const result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    for (const nb of graph[node]) {
      if (--inDegree[nb] === 0) queue.push(nb);
    }
  }
  return result;
}`,
  cpp: `vector<int> topoSort(int V, vector<vector<int>>& adj) {
  vector<int> inDeg(V, 0);
  for (int u=0; u<V; u++) for (int v : adj[u]) inDeg[v]++;
  queue<int> q;
  for (int i=0; i<V; i++) if (!inDeg[i]) q.push(i);
  vector<int> res;
  while (!q.empty()) {
    int u = q.front(); q.pop(); res.push_back(u);
    for (int v : adj[u]) if (--inDeg[v]==0) q.push(v);
  }
  return res;
}`,
};

const NODES = ["A","B","C","D","E","F"];
const EDGES = [{u:"A",v:"C"},{u:"A",v:"B"},{u:"B",v:"D"},{u:"C",v:"D"},{u:"C",v:"E"},{u:"D",v:"F"},{u:"E",v:"F"}];
const POS = {A:{x:80,y:160},B:{x:200,y:80},C:{x:200,y:240},D:{x:320,y:80},E:{x:320,y:240},F:{x:440,y:160}};

function buildSteps() {
  const graph = Object.fromEntries(NODES.map(n => [n, []]));
  EDGES.forEach(({u,v}) => graph[u].push(v));
  const inDeg = Object.fromEntries(NODES.map(n => [n, 0]));
  EDGES.forEach(({v}) => inDeg[v]++);
  const steps = [];
  const result = [];
  const visited = new Set();
  const queue = NODES.filter(n => inDeg[n] === 0);

  steps.push({ result: [], visited: new Set(), active: null, inDeg: {...inDeg}, queue: [...queue], line: 1,
    explanation: `Topological Sort (Kahn's Algorithm). In-degrees: ${NODES.map(n=>`${n}:${inDeg[n]}`).join(", ")}. Start queue: [${queue.join(", ")}].` });

  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    visited.add(node);
    steps.push({ result: [...result], visited: new Set(visited), active: node, inDeg: {...inDeg}, queue: [...queue], line: 5,
      explanation: `Dequeue ${node}. Add to result: [${result.join(" → ")}]. Processing neighbors.` });
    for (const nb of graph[node]) {
      inDeg[nb]--;
      if (inDeg[nb] === 0) queue.push(nb);
      steps.push({ result: [...result], visited: new Set(visited), active: nb, inDeg: {...inDeg}, queue: [...queue], line: 8,
        explanation: `Reduce in-degree of ${nb} to ${inDeg[nb]}.${inDeg[nb]===0?" Enqueue "+nb+"!":""}` });
    }
  }
  steps.push({ result: [...result], visited: new Set(visited), active: null, inDeg: {...inDeg}, queue: [], line: 10,
    explanation: `✅ Topological order: ${result.join(" → ")}` });
  return steps;
}

export default function TopologicalSort() {
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

  return (
    <>
      <SEO data={{ title: "Topological Sort" }} />
      <AlgoPageLayout title="Topological Sort (Kahn's Algorithm)" category="Graph" categoryHref="/graph" timeComplexity="O(V+E)" spaceComplexity="O(V)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <svg width={520} height={300} viewBox="0 0 520 300" className="mx-auto">
                <defs>
                  <marker id="arrow-topo" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill="oklch(0.4 0.05 240)" />
                  </marker>
                  <marker id="arrow-topo-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill={CYAN} />
                  </marker>
                </defs>
                {EDGES.map(({u,v},i) => {
                  const p1=POS[u], p2=POS[v];
                  const dx=p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy);
                  const ex=p1.x+dx/len*22, ey=p1.y+dy/len*22;
                  const ex2=p2.x-dx/len*22, ey2=p2.y-dy/len*22;
                  const isActive = cur?.active===v && cur?.visited?.has(u);
                  return (
                    <line key={i} x1={ex} y1={ey} x2={ex2} y2={ey2}
                      stroke={isActive?CYAN:"oklch(0.35 0.05 240)"} strokeWidth={isActive?2.5:1.5}
                      markerEnd={`url(#${isActive?"arrow-topo-active":"arrow-topo"})`} />
                  );
                })}
                {NODES.map(n => {
                  const {x,y}=POS[n];
                  const visited = cur?.visited?.has(n);
                  const isActive = cur?.active===n;
                  const inQueue = cur?.queue?.includes(n);
                  return (
                    <g key={n}>
                      <circle cx={x} cy={y} r={22}
                        fill={visited?"oklch(0.55 0.18 145/0.2)":isActive?"oklch(0.75 0.18 195/0.2)":inQueue?"oklch(0.65 0.18 60/0.15)":BG}
                        stroke={visited?"oklch(0.55 0.18 145)":isActive?CYAN:inQueue?"oklch(0.65 0.18 60)":BORDER}
                        strokeWidth={2} />
                      <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="bold"
                        fill={visited?"oklch(0.8 0.15 145)":isActive?CYAN:"rgb(203 213 225)"}>{n}</text>
                      {cur?.inDeg && (
                        <text x={x} y={y+34} textAnchor="middle" fontSize={10} fill="rgb(100 116 139)">
                          in:{cur.inDeg[n]}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {cur?.result?.length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Result Order</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {cur.result.map((n, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border"
                        style={{ background: "oklch(0.55 0.18 145/0.15)", borderColor: "oklch(0.55 0.18 145)", color: "oklch(0.8 0.15 145)" }}>{n}</span>
                      {i < cur.result.length - 1 && <span className="text-slate-600">→</span>}
                    </div>
                  ))}
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
