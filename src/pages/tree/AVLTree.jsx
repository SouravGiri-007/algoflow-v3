import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Plus } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN   = "oklch(0.75 0.18 195)";
const BG     = "oklch(0.13 0.025 240)";
const BORDER = "oklch(0.22 0.04 240)";

const CODE = `def insert(root, key):
    # Standard BST insert
    if not root:
        return Node(key)
    if key < root.key:
        root.left = insert(root.left, key)
    else:
        root.right = insert(root.right, key)

    # Update height
    root.height = 1 + max(height(root.left),
                          height(root.right))

    # Get balance factor
    balance = get_balance(root)

    # Left-Left case
    if balance > 1 and key < root.left.key:
        return right_rotate(root)

    # Right-Right case
    if balance < -1 and key > root.right.key:
        return left_rotate(root)

    # Left-Right case
    if balance > 1 and key > root.left.key:
        root.left = left_rotate(root.left)
        return right_rotate(root)

    # Right-Left case
    if balance < -1 and key < root.right.key:
        root.right = right_rotate(root.right)
        return left_rotate(root)

    return root`;

class AVLNode {
  constructor(key) {
    this.key = key; this.left = null; this.right = null; this.height = 1;
  }
}

function height(n) { return n ? n.height : 0; }
function getBalance(n) { return n ? height(n.left) - height(n.right) : 0; }

function rightRotate(y) {
  const x = y.left, T2 = x.right;
  x.right = y; y.left = T2;
  y.height = Math.max(height(y.left), height(y.right)) + 1;
  x.height = Math.max(height(x.left), height(x.right)) + 1;
  return x;
}
function leftRotate(x) {
  const y = x.right, T2 = y.left;
  y.left = x; x.right = T2;
  x.height = Math.max(height(x.left), height(x.right)) + 1;
  y.height = Math.max(height(y.left), height(y.right)) + 1;
  return y;
}

function cloneTree(node) {
  if (!node) return null;
  const n = new AVLNode(node.key);
  n.height = node.height;
  n.left = cloneTree(node.left);
  n.right = cloneTree(node.right);
  return n;
}

function insertAVL(root, key, steps) {
  if (!root) {
    steps.push({ tree: null, highlight: key, rotationType: null, line: 3,
      explanation: `Inserting ${key}: reached null position. Creating new node.` });
    return new AVLNode(key);
  }
  if (key < root.key) {
    steps.push({ tree: cloneTree(root), highlight: root.key, line: 5,
      explanation: `${key} < ${root.key}, going left.` });
    root.left = insertAVL(root.left, key, steps);
  } else {
    steps.push({ tree: cloneTree(root), highlight: root.key, line: 7,
      explanation: `${key} >= ${root.key}, going right.` });
    root.right = insertAVL(root.right, key, steps);
  }

  root.height = 1 + Math.max(height(root.left), height(root.right));
  const balance = getBalance(root);

  steps.push({ tree: cloneTree(root), highlight: root.key, balance, line: 14,
    explanation: `At node ${root.key}: height=${root.height}, balance factor=${balance}.` });

  if (balance > 1 && key < root.left.key) {
    steps.push({ tree: cloneTree(root), highlight: root.key, rotationType: "LL", line: 17,
      explanation: `⟳ Left-Left case at ${root.key}. Performing Right Rotation.` });
    return rightRotate(root);
  }
  if (balance < -1 && key > root.right.key) {
    steps.push({ tree: cloneTree(root), highlight: root.key, rotationType: "RR", line: 21,
      explanation: `⟲ Right-Right case at ${root.key}. Performing Left Rotation.` });
    return leftRotate(root);
  }
  if (balance > 1 && key > root.left.key) {
    steps.push({ tree: cloneTree(root), highlight: root.key, rotationType: "LR", line: 25,
      explanation: `⟳⟲ Left-Right case at ${root.key}. Left rotate then Right rotate.` });
    root.left = leftRotate(root.left);
    return rightRotate(root);
  }
  if (balance < -1 && key < root.right.key) {
    steps.push({ tree: cloneTree(root), highlight: root.key, rotationType: "RL", line: 30,
      explanation: `⟲⟳ Right-Left case at ${root.key}. Right rotate then Left rotate.` });
    root.right = rightRotate(root.right);
    return leftRotate(root);
  }
  return root;
}

// Layout tree for SVG
function layoutTree(node, x, y, spread, positions = {}) {
  if (!node) return positions;
  positions[node.key] = { x, y, node };
  layoutTree(node.left, x - spread, y + 60, spread / 2, positions);
  layoutTree(node.right, x + spread, y + 60, spread / 2, positions);
  return positions;
}

function TreeSVG({ root, highlight, rotationType }) {
  if (!root) return <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Tree is empty</div>;
  const pos = layoutTree(root, 260, 40, 100);
  const nodes = Object.values(pos);

  function getEdges(node) {
    if (!node) return [];
    const edges = [];
    if (node.left && pos[node.left.key]) edges.push({ from: pos[node.key], to: pos[node.left.key] });
    if (node.right && pos[node.right.key]) edges.push({ from: pos[node.key], to: pos[node.right.key] });
    return [...edges, ...getEdges(node.left), ...getEdges(node.right)];
  }

  const edges = getEdges(root);
  const bal = getBalance(root);

  return (
    <svg width={520} height={260} viewBox="0 0 520 260" className="mx-auto">
      {edges.map((e, i) => (
        <line key={i} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
          stroke="oklch(0.28 0.05 240)" strokeWidth={1.5} />
      ))}
      {nodes.map(({ x, y, node }) => {
        const isHighlight = node.key === highlight;
        const nodeBalance = getBalance(node);
        const isUnbalanced = Math.abs(nodeBalance) > 1;
        return (
          <g key={node.key}>
            <circle cx={x} cy={y} r={18}
              fill={isHighlight ? "oklch(0.75 0.18 195 / 0.2)" : isUnbalanced ? "oklch(0.65 0.18 30 / 0.2)" : BG}
              stroke={isHighlight ? CYAN : isUnbalanced ? "oklch(0.65 0.18 30)" : BORDER}
              strokeWidth={2} />
            <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle"
              fontSize={12} fontWeight="bold"
              fill={isHighlight ? CYAN : "rgb(203 213 225)"}>{node.key}</text>
            <text x={x} y={y+26} textAnchor="middle" fontSize={9}
              fill={Math.abs(nodeBalance) > 1 ? "oklch(0.65 0.18 30)" : "rgb(100 116 139)"}>
              bf:{nodeBalance}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function AVLTree() {
  const [avlRoot, setAvlRoot] = useState(null);
  const [insertVal, setInsertVal]   = useState("");
  const [steps, setSteps]           = useState([]);
  const [stepIdx, setStepIdx]       = useState(0);
  const [playing, setPlaying]       = useState(false);
  const [speed, setSpeed]           = useState(800);
  const [started, setStarted]       = useState(false);
  const timerRef = useRef(null);

  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]);
  }, []);

  const insertNode = () => {
    const key = parseInt(insertVal);
    if (isNaN(key)) return;
    reset();
    const s = [];
    s.push({ tree: cloneTree(avlRoot), highlight: null, line: 1,
      explanation: `Inserting ${key} into AVL tree.` });
    const newRoot = insertAVL(cloneTree(avlRoot), key, s);
    s.push({ tree: cloneTree(newRoot), highlight: key, line: 33,
      explanation: `✅ ${key} inserted. Tree is balanced. Heights updated.` });
    setAvlRoot(newRoot);
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    setInsertVal("");
    let idx = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      idx++;
      if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; }
      setStepIdx(idx);
    }, speed);
  };

  const loadDefault = () => {
    reset();
    setAvlRoot(null);
    const vals = [30, 20, 40, 10, 25, 35, 50];
    let root = null;
    vals.forEach(v => {
      const s = [];
      root = insertAVL(cloneTree(root), v, s);
    });
    setAvlRoot(root);
  };

  const displayTree = cur?.tree !== undefined ? cur.tree : avlRoot;

  return (
    <>
      <SEO data={{ title: "AVL Tree" }} />
      <AlgoPageLayout title="AVL Tree (Self-Balancing BST)" category="Tree" categoryHref="/tree" timeComplexity="O(log n)" spaceComplexity="O(n)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Input */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Insert Node</p>
              <div className="flex gap-3 flex-wrap">
                <input value={insertVal} onChange={e => setInsertVal(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && insertNode()}
                  placeholder="Enter a number" type="number"
                  className="w-40 px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                  onFocus={e => e.target.style.borderColor = CYAN}
                  onBlur={e => e.target.style.borderColor = BORDER} />
                <button onClick={insertNode} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                  <Plus className="w-4 h-4" /> Insert
                </button>
                <button onClick={loadDefault} className="px-4 py-2 rounded-lg text-sm font-semibold border text-slate-300"
                  style={{ borderColor: BORDER }}>Load Example</button>
                <button onClick={() => { reset(); setAvlRoot(null); }}
                  className="px-3 py-2 rounded-lg border text-slate-400" style={{ borderColor: BORDER }}>
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tree visualization */}
            <div className="rounded-xl border p-4 overflow-x-auto" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs text-slate-500 mb-3">bf = balance factor (|bf| ≤ 1 for balanced)</p>
              <TreeSVG
                root={displayTree}
                highlight={cur?.highlight}
                rotationType={cur?.rotationType}
              />
              {cur?.rotationType && (
                <div className="mt-2 text-center">
                  <span className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: "oklch(0.65 0.18 30 / 0.2)", color: "oklch(0.75 0.18 30)" }}>
                    Rotation: {cur.rotationType}
                  </span>
                </div>
              )}
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
