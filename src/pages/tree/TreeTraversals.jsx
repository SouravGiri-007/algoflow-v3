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
  pseudo: `INORDER(root):    Left → Root → Right
PREORDER(root):   Root → Left → Right
POSTORDER(root):  Left → Right → Root

INORDER(node):
  if node is null: return
  inorder(node.left)
  visit(node)
  inorder(node.right)`,
  python: `def inorder(root, result=[]):
    if root:
        inorder(root.left, result)
        result.append(root.val)
        inorder(root.right, result)
    return result

def preorder(root, result=[]):
    if root:
        result.append(root.val)
        preorder(root.left, result)
        preorder(root.right, result)

def postorder(root, result=[]):
    if root:
        postorder(root.left, result)
        postorder(root.right, result)
        result.append(root.val)`,
  javascript: `function inorder(root, res=[]) {
  if (!root) return res;
  inorder(root.left, res);
  res.push(root.val);
  inorder(root.right, res);
  return res;
}
function preorder(root, res=[]) {
  if (!root) return res;
  res.push(root.val);
  preorder(root.left, res);
  preorder(root.right, res);
  return res;
}
function postorder(root, res=[]) {
  if (!root) return res;
  postorder(root.left, res);
  postorder(root.right, res);
  res.push(root.val);
  return res;
}`,
  cpp: `void inorder(Node* root, vector<int>& res) {
  if (!root) return;
  inorder(root->left, res);
  res.push_back(root->val);
  inorder(root->right, res);
}
void preorder(Node* root, vector<int>& res) {
  if (!root) return;
  res.push_back(root->val);
  preorder(root->left, res);
  preorder(root->right, res);
}
void postorder(Node* root, vector<int>& res) {
  if (!root) return;
  postorder(root->left, res);
  postorder(root->right, res);
  res.push_back(root->val);
}`,
};

// Tree: {val, left, right, id, x, y}
const TREE = {
  val:4,id:1,x:260,y:40,
  left:{val:2,id:2,x:160,y:110,
    left:{val:1,id:3,x:100,y:180,left:null,right:null},
    right:{val:3,id:4,x:220,y:180,left:null,right:null}},
  right:{val:6,id:5,x:360,y:110,
    left:{val:5,id:6,x:300,y:180,left:null,right:null},
    right:{val:7,id:7,x:420,y:180,left:null,right:null}}
};

function flatten(node, arr=[]) {
  if (!node) return arr;
  arr.push(node);
  flatten(node.left, arr);
  flatten(node.right, arr);
  return arr;
}
const ALL_NODES = flatten(TREE);

function buildSteps(mode) {
  const steps = [];
  const visited = [];

  function inorder(node) {
    if (!node) return;
    steps.push({ visited: [...visited], active: node.id, line: 6, explanation: `Inorder: visit left subtree of ${node.val}.` });
    inorder(node.left);
    visited.push(node.id);
    steps.push({ visited: [...visited], active: node.id, line: 7, explanation: `Inorder: visit node ${node.val}. Result so far: [${visited.map(id=>ALL_NODES.find(n=>n.id===id)?.val).join(", ")}]` });
    inorder(node.right);
  }
  function preorder(node) {
    if (!node) return;
    visited.push(node.id);
    steps.push({ visited: [...visited], active: node.id, line: 7, explanation: `Preorder: visit node ${node.val} first. Result: [${visited.map(id=>ALL_NODES.find(n=>n.id===id)?.val).join(", ")}]` });
    preorder(node.left);
    preorder(node.right);
  }
  function postorder(node) {
    if (!node) return;
    steps.push({ visited: [...visited], active: node.id, line: 6, explanation: `Postorder: descend into subtrees of ${node.val} first.` });
    postorder(node.left);
    postorder(node.right);
    visited.push(node.id);
    steps.push({ visited: [...visited], active: node.id, line: 8, explanation: `Postorder: both subtrees done, now visit ${node.val}. Result: [${visited.map(id=>ALL_NODES.find(n=>n.id===id)?.val).join(", ")}]` });
  }

  const names = {inorder:"Left→Root→Right",preorder:"Root→Left→Right",postorder:"Left→Right→Root"};
  steps.push({ visited: [], active: null, line: 1, explanation: `Starting ${mode} traversal (${names[mode]}).` });
  if (mode==="inorder") inorder(TREE);
  else if (mode==="preorder") preorder(TREE);
  else postorder(TREE);
  const finalOrder = visited.map(id=>ALL_NODES.find(n=>n.id===id)?.val);
  steps.push({ visited: [...visited], active: null, line: 8, explanation: `✅ ${mode} traversal complete: [${finalOrder.join(", ")}]` });
  return steps;
}

function renderEdges(node) {
  if (!node) return [];
  const edges = [];
  if (node.left) edges.push({x1:node.x,y1:node.y,x2:node.left.x,y2:node.left.y}, ...renderEdges(node.left));
  if (node.right) edges.push({x1:node.x,y1:node.y,x2:node.right.x,y2:node.right.y}, ...renderEdges(node.right));
  return edges;
}

export default function TreeTraversals() {
  const [mode, setMode] = useState("inorder");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => { clearInterval(timerRef.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);
  const switchMode = (m) => { reset(); setMode(m); };
  const runSteps = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0; clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length-1); return; } setStepIdx(idx); }, speed);
  };
  const togglePlay = () => {
    if (!started) { runSteps(buildSteps(mode)); return; }
    if (playing) { clearInterval(timerRef.current); setPlaying(false); }
    else { setPlaying(true); let idx = stepIdx; timerRef.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length-1); return; } setStepIdx(idx); }, speed); }
  };

  const edges = renderEdges(TREE);
  const visitedOrder = cur?.visited?.map(id => ALL_NODES.find(n=>n.id===id)?.val) || [];

  return (
    <>
      <SEO data={{ title: "Tree Traversals" }} />
      <AlgoPageLayout title="Tree Traversals" category="Tree" categoryHref="/tree" timeComplexity="O(n)" spaceComplexity="O(h)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex gap-2 flex-wrap">
                {["inorder","preorder","postorder"].map(m => (
                  <button key={m} onClick={() => switchMode(m)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all capitalize"
                    style={{ background: mode===m?"oklch(0.75 0.18 195/0.15)":"oklch(0.17 0.03 240)", borderColor: mode===m?CYAN:BORDER, color: mode===m?CYAN:"rgb(148 163 184)" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <svg width={520} height={240} viewBox="0 0 520 240" className="mx-auto">
                {edges.map((e,i) => <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="oklch(0.28 0.05 240)" strokeWidth={1.5} />)}
                {ALL_NODES.map(n => {
                  const isVisited = cur?.visited?.includes(n.id);
                  const isActive = cur?.active === n.id;
                  return (
                    <g key={n.id}>
                      <circle cx={n.x} cy={n.y} r={20}
                        fill={isActive?"oklch(0.75 0.18 195/0.2)":isVisited?"oklch(0.55 0.18 145/0.2)":BG}
                        stroke={isActive?CYAN:isVisited?"oklch(0.55 0.18 145)":BORDER} strokeWidth={2} />
                      <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight="bold"
                        fill={isActive?CYAN:isVisited?"oklch(0.8 0.15 145)":"rgb(203 213 225)"}>{n.val}</text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {visitedOrder.length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Traversal Order</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {visitedOrder.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border"
                        style={{ background: "oklch(0.55 0.18 145/0.15)", borderColor: "oklch(0.55 0.18 145)", color: "oklch(0.8 0.15 145)" }}>{v}</span>
                      {i < visitedOrder.length - 1 && <span className="text-slate-600">→</span>}
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
