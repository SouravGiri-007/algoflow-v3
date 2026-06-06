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
  pseudo: `CYCLE-DETECTION-DFS(graph):
  visited = {}
  rec_stack = {}
  for each node:
    if not visited[node]:
      if dfs(node):
        return "Cycle found!"
  return "No cycle"

DFS(node):
  visited[node] = True
  rec_stack[node] = True
  for each neighbor:
    if not visited[neighbor]:
      if dfs(neighbor): return True
    elif neighbor in rec_stack:
      return True  // back edge = cycle
  rec_stack[node] = False
  return False`,
  python: `def has_cycle(graph):
    visited = set()
    rec_stack = set()

    def dfs(node):
        visited.add(node)
        rec_stack.add(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                if dfs(neighbor):
                    return True
            elif neighbor in rec_stack:
                return True  # back edge
        rec_stack.discard(node)
        return False

    for node in graph:
        if node not in visited:
            if dfs(node):
                return True
    return False`,
  javascript: `function hasCycle(graph) {
  const visited = new Set();
  const recStack = new Set();
  function dfs(node) {
    visited.add(node); recStack.add(node);
    for (const nb of graph[node]) {
      if (!visited.has(nb)) {
        if (dfs(nb)) return true;
      } else if (recStack.has(nb)) return true;
    }
    recStack.delete(node);
    return false;
  }
  return Object.keys(graph).some(n => !visited.has(n) && dfs(n));
}`,
  cpp: `bool hasCycle(int V, vector<vector<int>>& adj) {
  vector<bool> vis(V,false), rec(V,false);
  function<bool(int)> dfs = [&](int u) {
    vis[u] = rec[u] = true;
    for (int v : adj[u])
      if (!vis[v] && dfs(v)) return true;
      else if (rec[v]) return true;
    rec[u] = false; return false;
  };
  for (int i=0; i<V; i++) if (!vis[i] && dfs(i)) return true;
  return false;
}`,
};

const NODES_NO_CYCLE = ["A","B","C","D","E"];
const EDGES_NO_CYCLE = [{u:"A",v:"B"},{u:"A",v:"C"},{u:"B",v:"D"},{u:"C",v:"D"},{u:"D",v:"E"}];
const NODES_CYCLE    = ["A","B","C","D","E"];
const EDGES_CYCLE    = [{u:"A",v:"B"},{u:"B",v:"C"},{u:"C",v:"D"},{u:"D",v:"B"},{u:"D",v:"E"}];
const POS = {A:{x:80,y:160},B:{x:200,y:80},C:{x:200,y:240},D:{x:320,y:160},E:{x:440,y:160}};

function buildSteps(hasCycleGraph) {
  const NODES = hasCycleGraph ? NODES_CYCLE : NODES_NO_CYCLE;
  const EDGES = hasCycleGraph ? EDGES_CYCLE : EDGES_NO_CYCLE;
  const graph = Object.fromEntries(NODES.map(n => [n, []]));
  EDGES.forEach(({u,v}) => graph[u].push(v));

  const steps = [];
  const visited = new Set();
  const recStack = new Set();
  let cycleEdge = null;

  steps.push({ visited: new Set(), recStack: new Set(), active: null, cycleEdge: null, line: 1, explanation: `Cycle Detection via DFS. Graph has ${hasCycleGraph?"a cycle":"no cycle"}. We track visited + recursion stack.` });

  function dfs(node) {
    visited.add(node); recStack.add(node);
    steps.push({ visited: new Set(visited), recStack: new Set(recStack), active: node, cycleEdge: null, line: 9, explanation: `DFS visiting ${node}. recStack: [${[...recStack].join(", ")}].` });
    for (const nb of graph[node]) {
      if (!visited.has(nb)) {
        steps.push({ visited: new Set(visited), recStack: new Set(recStack), active: nb, cycleEdge: null, line: 12, explanation: `${nb} not visited, recurse into ${nb}.` });
        if (dfs(nb)) return true;
      } else if (recStack.has(nb)) {
        cycleEdge = {u: node, v: nb};
        steps.push({ visited: new Set(visited), recStack: new Set(recStack), active: node, cycleEdge, line: 14, explanation: `⚠️ Back edge found! ${node} → ${nb} (${nb} is in recursion stack). CYCLE DETECTED!` });
        return true;
      } else {
        steps.push({ visited: new Set(visited), recStack: new Set(recStack), active: nb, cycleEdge: null, line: 12, explanation: `${nb} already fully visited (not in recStack). Safe cross-edge.` });
      }
    }
    recStack.delete(node);
    steps.push({ visited: new Set(visited), recStack: new Set(recStack), active: node, cycleEdge: null, line: 15, explanation: `Finished ${node}. Remove from recStack. recStack: [${[...recStack].join(", ")}].` });
    return false;
  }

  let found = false;
  for (const n of NODES) {
    if (!visited.has(n)) {
      if (dfs(n)) { found = true; break; }
    }
  }
  steps.push({ visited: new Set(visited), recStack: new Set(recStack), active: null, cycleEdge, line: found?14:16,
    explanation: found ? `✅ Cycle detected in graph!` : `✅ No cycle found. Graph is a DAG.` });
  return steps;
}

export default function CycleDetection() {
  const [hasCycleGraph, setHasCycleGraph] = useState(true);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const cur = steps[stepIdx] || null;
  const EDGES = hasCycleGraph ? EDGES_CYCLE : EDGES_NO_CYCLE;

  const reset = useCallback(() => { clearInterval(timerRef.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);
  const switchGraph = (withCycle) => { reset(); setHasCycleGraph(withCycle); };
  const runSteps = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0; clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length-1); return; } setStepIdx(idx); }, speed);
  };
  const togglePlay = () => {
    if (!started) { runSteps(buildSteps(hasCycleGraph)); return; }
    if (playing) { clearInterval(timerRef.current); setPlaying(false); }
    else { setPlaying(true); let idx = stepIdx; timerRef.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length-1); return; } setStepIdx(idx); }, speed); }
  };

  return (
    <>
      <SEO data={{ title: "Cycle Detection" }} />
      <AlgoPageLayout title="Cycle Detection (Directed Graph)" category="Graph" categoryHref="/graph" timeComplexity="O(V+E)" spaceComplexity="O(V)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Choose Graph</p>
              <div className="flex gap-3">
                {[true, false].map(withCycle => (
                  <button key={String(withCycle)} onClick={() => switchGraph(withCycle)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
                    style={{ background: hasCycleGraph===withCycle?"oklch(0.75 0.18 195/0.15)":"oklch(0.17 0.03 240)", borderColor: hasCycleGraph===withCycle?CYAN:BORDER, color: hasCycleGraph===withCycle?CYAN:"rgb(148 163 184)" }}>
                    {withCycle ? "Graph with Cycle" : "Graph without Cycle"}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <svg width={520} height={280} viewBox="0 0 520 280" className="mx-auto">
                <defs>
                  <marker id="arr-cd" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="oklch(0.4 0.05 240)" /></marker>
                  <marker id="arr-cd-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill={CYAN} /></marker>
                  <marker id="arr-cd-cycle" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="oklch(0.65 0.18 30)" /></marker>
                </defs>
                {EDGES.map(({u,v},i) => {
                  const p1=POS[u], p2=POS[v];
                  const dx=p2.x-p1.x, dy=p2.y-p1.y, len=Math.sqrt(dx*dx+dy*dy);
                  const isCycle = cur?.cycleEdge?.u===u&&cur?.cycleEdge?.v===v;
                  const stroke = isCycle?"oklch(0.65 0.18 30)":"oklch(0.35 0.05 240)";
                  const markerId = isCycle?"arr-cd-cycle":"arr-cd";
                  return (
                    <line key={i} x1={p1.x+dx/len*22} y1={p1.y+dy/len*22} x2={p2.x-dx/len*22} y2={p2.y-dy/len*22}
                      stroke={stroke} strokeWidth={isCycle?3:1.5} markerEnd={`url(#${markerId})`} />
                  );
                })}
                {(hasCycleGraph ? NODES_CYCLE : NODES_NO_CYCLE).map(n => {
                  const {x,y}=POS[n];
                  const visited = cur?.visited?.has(n);
                  const inStack = cur?.recStack?.has(n);
                  const isActive = cur?.active===n;
                  return (
                    <g key={n}>
                      <circle cx={x} cy={y} r={22}
                        fill={inStack?"oklch(0.65 0.18 60/0.2)":visited?"oklch(0.55 0.18 145/0.15)":BG}
                        stroke={isActive?CYAN:inStack?"oklch(0.65 0.18 60)":visited?"oklch(0.55 0.18 145)":BORDER}
                        strokeWidth={2} />
                      <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="bold"
                        fill={isActive?CYAN:inStack?"oklch(0.75 0.18 60)":"rgb(203 213 225)"}>{n}</text>
                    </g>
                  );
                })}
              </svg>
              <div className="flex gap-3 mt-2 text-xs text-slate-500 justify-center">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{background:"oklch(0.65 0.18 60)"}}/>In Rec Stack</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{background:"oklch(0.55 0.18 145)"}}/>Fully Visited</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:"oklch(0.65 0.18 30)"}}/>Cycle Edge</span>
              </div>
            </div>

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
