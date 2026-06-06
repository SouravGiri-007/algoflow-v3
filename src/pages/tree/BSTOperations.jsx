import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Plus, Search, Trash2 } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN = "oklch(0.75 0.18 195)";
const BG = "oklch(0.13 0.025 240)";
const BORDER = "oklch(0.22 0.04 240)";

const CODES = {
  pseudo: `BST-INSERT(root, key):
  if root is null: return new Node(key)
  if key < root.val: root.left = insert(root.left, key)
  else: root.right = insert(root.right, key)
  return root

BST-SEARCH(root, key):
  if root is null or root.val == key: return root
  if key < root.val: return search(root.left, key)
  return search(root.right, key)

BST-DELETE(root, key):
  find node → replace with inorder successor`,
  python: `class BST:
    def insert(self, root, key):
        if not root: return Node(key)
        if key < root.val:
            root.left = self.insert(root.left, key)
        else:
            root.right = self.insert(root.right, key)
        return root

    def search(self, root, key):
        if not root or root.val == key:
            return root
        if key < root.val:
            return self.search(root.left, key)
        return self.search(root.right, key)

    def delete(self, root, key):
        if not root: return root
        if key < root.val:
            root.left = self.delete(root.left, key)
        elif key > root.val:
            root.right = self.delete(root.right, key)
        else:
            if not root.left: return root.right
            if not root.right: return root.left
            # find inorder successor
            succ = self.min_node(root.right)
            root.val = succ.val
            root.right = self.delete(root.right, succ.val)
        return root`,
  javascript: `class BST {
  insert(root, key) {
    if (!root) return new Node(key);
    if (key < root.val)
      root.left = this.insert(root.left, key);
    else
      root.right = this.insert(root.right, key);
    return root;
  }
  search(root, key) {
    if (!root || root.val === key) return root;
    if (key < root.val) return this.search(root.left, key);
    return this.search(root.right, key);
  }
  delete(root, key) {
    if (!root) return null;
    if (key < root.val) root.left = this.delete(root.left, key);
    else if (key > root.val) root.right = this.delete(root.right, key);
    else {
      if (!root.left) return root.right;
      if (!root.right) return root.left;
      const succ = this.minNode(root.right);
      root.val = succ.val;
      root.right = this.delete(root.right, succ.val);
    }
    return root;
  }
}`,
  cpp: `struct Node { int val; Node *left, *right; };
Node* insert(Node* root, int key) {
  if (!root) return new Node{key};
  if (key < root->val) root->left = insert(root->left, key);
  else root->right = insert(root->right, key);
  return root;
}
Node* search(Node* root, int key) {
  if (!root || root->val == key) return root;
  if (key < root->val) return search(root->left, key);
  return search(root->right, key);
}
Node* deleteNode(Node* root, int key) {
  if (!root) return root;
  if (key < root->val) root->left = deleteNode(root->left, key);
  else if (key > root->val) root->right = deleteNode(root->right, key);
  else {
    if (!root->left) return root->right;
    if (!root->right) return root->left;
    Node* succ = root->right;
    while (succ->left) succ = succ->left;
    root->val = succ->val;
    root->right = deleteNode(root->right, succ->val);
  }
  return root;
}`,
};

let nodeId = 100;
function makeNode(val) { return { val, id: nodeId++, left: null, right: null }; }
function cloneTree(n) { if (!n) return null; return { ...n, left: cloneTree(n.left), right: cloneTree(n.right) }; }
function layoutTree(node, x, y, spread, pos = {}) {
  if (!node) return pos;
  pos[node.id] = { x, y };
  layoutTree(node.left, x - spread, y + 65, Math.max(spread / 2, 30), pos);
  layoutTree(node.right, x + spread, y + 65, Math.max(spread / 2, 30), pos);
  return pos;
}
function collectEdges(node, pos, edges = []) {
  if (!node) return edges;
  if (node.left && pos[node.left.id]) edges.push({ x1: pos[node.id].x, y1: pos[node.id].y, x2: pos[node.left.id].x, y2: pos[node.left.id].y });
  if (node.right && pos[node.right.id]) edges.push({ x1: pos[node.id].x, y1: pos[node.id].y, x2: pos[node.right.id].x, y2: pos[node.right.id].y });
  collectEdges(node.left, pos, edges);
  collectEdges(node.right, pos, edges);
  return edges;
}
function collectNodes(node, arr = []) { if (!node) return arr; arr.push(node); collectNodes(node.left, arr); collectNodes(node.right, arr); return arr; }

function buildInsertSteps(root, key) {
  const steps = [];
  function ins(node, k) {
    if (!node) {
      steps.push({ tree: null, highlight: null, found: k, line: 2, explanation: `Reached null position. Creating new node with value ${k}.` });
      return makeNode(k);
    }
    steps.push({ tree: cloneTree(root), highlight: node.id, found: null, line: 1, explanation: `At node ${node.val}. ${k} ${k < node.val ? "<" : ">="} ${node.val} → go ${k < node.val ? "left" : "right"}.` });
    if (k < node.val) node.left = ins(node.left, k);
    else node.right = ins(node.right, k);
    return node;
  }
  const newRoot = ins(cloneTree(root), key);
  steps.push({ tree: cloneTree(newRoot), highlight: null, found: key, line: 5, explanation: `✅ Inserted ${key} into BST.` });
  return { steps, newRoot };
}

function buildSearchSteps(root, key) {
  const steps = [];
  function srch(node) {
    if (!node) { steps.push({ tree: cloneTree(root), highlight: null, found: null, line: 8, explanation: `❌ Reached null. ${key} not found in BST.` }); return; }
    steps.push({ tree: cloneTree(root), highlight: node.id, found: null, line: 7, explanation: `Checking node ${node.val}. ${key === node.val ? "Match!" : key < node.val ? `${key} < ${node.val}, go left.` : `${key} > ${node.val}, go right.`}` });
    if (key === node.val) { steps.push({ tree: cloneTree(root), highlight: node.id, found: node.id, line: 8, explanation: `✅ Found ${key}!` }); return; }
    if (key < node.val) srch(node.left); else srch(node.right);
  }
  srch(root);
  return steps;
}

function bstDelete(node, key) {
  if (!node) return null;
  if (key < node.val) { node.left = bstDelete(node.left, key); }
  else if (key > node.val) { node.right = bstDelete(node.right, key); }
  else {
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    let succ = node.right; while (succ.left) succ = succ.left;
    node.val = succ.val; node.id = node.id;
    node.right = bstDelete(node.right, succ.val);
  }
  return node;
}

function buildDefaultTree() {
  let root = null;
  [50, 30, 70, 20, 40, 60, 80].forEach(v => {
    const { newRoot } = buildInsertSteps(root, v);
    root = newRoot;
  });
  return root;
}

export default function BSTOperations() {
  const [bstRoot, setBstRoot] = useState(() => buildDefaultTree());
  const [inputVal, setInputVal] = useState("");
  const [opMode, setOpMode] = useState("insert");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const cur = steps[stepIdx] || null;
  const displayTree = cur?.tree !== undefined ? cur.tree : bstRoot;

  const reset = useCallback(() => { clearInterval(timerRef.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);

  const runOp = () => {
    const key = parseInt(inputVal);
    if (isNaN(key)) return;
    reset();
    if (opMode === "insert") {
      const { steps: s, newRoot } = buildInsertSteps(cloneTree(bstRoot), key);
      setBstRoot(newRoot);
      setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true); setInputVal("");
      let idx = 0; clearInterval(timerRef.current);
      timerRef.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; } setStepIdx(idx); }, speed);
    } else if (opMode === "search") {
      const s = buildSearchSteps(bstRoot, key);
      setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true); setInputVal("");
      let idx = 0; clearInterval(timerRef.current);
      timerRef.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; } setStepIdx(idx); }, speed);
    } else {
      const newRoot = bstDelete(cloneTree(bstRoot), key);
      setBstRoot(newRoot);
      setSteps([{ tree: cloneTree(newRoot), highlight: null, found: null, line: 12, explanation: `✅ Deleted ${key} from BST.` }]);
      setStepIdx(0); setStarted(true); setInputVal("");
    }
  };

  const pos = displayTree ? layoutTree(displayTree, 260, 40, 110) : {};
  const edges = displayTree ? collectEdges(displayTree, pos) : [];
  const nodes = displayTree ? collectNodes(displayTree) : [];

  return (
    <>
      <SEO data={{ title: "BST Operations" }} />
      <AlgoPageLayout title="BST — Insert, Search, Delete" category="Tree" categoryHref="/tree" timeComplexity="O(log n)" spaceComplexity="O(n)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex gap-2 mb-3">
                {[["insert","Insert",<Plus className="w-3.5 h-3.5"/>],["search","Search",<Search className="w-3.5 h-3.5"/>],["delete","Delete",<Trash2 className="w-3.5 h-3.5"/>]].map(([m,label,icon])=>(
                  <button key={m} onClick={()=>{reset();setOpMode(m);}}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all"
                    style={{background:opMode===m?"oklch(0.75 0.18 195/0.15)":"oklch(0.17 0.03 240)",borderColor:opMode===m?CYAN:BORDER,color:opMode===m?CYAN:"rgb(148 163 184)"}}>
                    {icon}{label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runOp()}
                  placeholder="Enter value" type="number"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{background:"oklch(0.17 0.03 240)",border:`1px solid ${BORDER}`}}
                  onFocus={e=>e.target.style.borderColor=CYAN} onBlur={e=>e.target.style.borderColor=BORDER}/>
                <button onClick={runOp} className="px-5 py-2 rounded-lg text-sm font-semibold" style={{background:CYAN,color:"oklch(0.1 0.02 240)"}}>
                  Run
                </button>
                <button onClick={()=>{reset();setBstRoot(buildDefaultTree());}} className="px-3 py-2 rounded-lg border text-slate-400" style={{borderColor:BORDER}}>
                  <RotateCcw className="w-4 h-4"/>
                </button>
              </div>
            </div>

            <div className="rounded-xl border p-4 overflow-x-auto" style={{ background: BG, borderColor: BORDER }}>
              {!displayTree ? (
                <p className="text-slate-500 text-sm text-center py-8">Tree is empty. Insert some values.</p>
              ) : (
                <svg width={520} height={260} viewBox="0 0 520 260" className="mx-auto">
                  {edges.map((e,i)=>(
                    <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="oklch(0.28 0.05 240)" strokeWidth={1.5}/>
                  ))}
                  {nodes.map(n=>{
                    const p=pos[n.id];if(!p)return null;
                    const isHL=cur?.highlight===n.id;
                    const isFound=cur?.found===n.id;
                    return(
                      <g key={n.id}>
                        <circle cx={p.x} cy={p.y} r={20}
                          fill={isFound?"oklch(0.55 0.18 145/0.25)":isHL?"oklch(0.75 0.18 195/0.2)":BG}
                          stroke={isFound?"oklch(0.55 0.18 145)":isHL?CYAN:BORDER} strokeWidth={2}/>
                        <text x={p.x} y={p.y+1} textAnchor="middle" dominantBaseline="middle" fontSize={12} fontWeight="bold"
                          fill={isFound?"oklch(0.8 0.15 145)":isHL?CYAN:"rgb(203 213 225)"}>{n.val}</text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            <ExplanationPanel steps={steps.map(s=>s.explanation)} currentStep={stepIdx} totalSteps={steps.length}/>
          </div>
          <div className="h-[500px] xl:h-auto">
            <CodePanel codes={CODES} highlightLine={cur?.line??null}/>
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
