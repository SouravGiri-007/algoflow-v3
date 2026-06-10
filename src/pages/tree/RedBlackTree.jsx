import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Plus, Search } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN = "oklch(0.75 0.18 195)";
const BG = "oklch(0.13 0.025 240)";
const BORDER = "oklch(0.22 0.04 240)";

const CODES = {
  pseudo: `RB-INSERT(root, key):
  node ← new RBNode(key)   // RED
  BST-INSERT(root, node)
  FIX-INSERT(node)

FIX-INSERT(node):
  while node ≠ root AND node.parent.color = RED:
    if node.parent is left child:
      uncle ← node.parent.parent.right
      if uncle.color = RED:        // Case 1
        recolor(parent, uncle, grandparent)
        node ← grandparent
      else:                         // Case 2 & 3
        if node is right child:     // Case 2
          LEFT-ROTATE(parent)
          node ← node.parent
        node.parent.color ← BLACK  // Case 3
        grandparent.color ← RED
        RIGHT-ROTATE(grandparent)
  root.color ← BLACK`,
  python: `class RBNode:
    def __init__(self, val):
        self.val = val
        self.color = 'RED'
        self.left = self.right = self.parent = None

def rb_insert(root, key):
    node = RBNode(key)
    root = bst_insert(root, node)
    fix_insert(node)
    return root

def fix_insert(node):
    while node != root and node.parent.color == 'RED':
        if node.parent == node.parent.parent.left:
            uncle = node.parent.parent.right
            if uncle and uncle.color == 'RED':
                node.parent.color = 'BLACK'
                uncle.color = 'BLACK'
                node.parent.parent.color = 'RED'
                node = node.parent.parent
            else:
                if node == node.parent.right:
                    node = node.parent
                    left_rotate(node)
                node.parent.color = 'BLACK'
                node.parent.parent.color = 'RED'
                right_rotate(node.parent.parent)
    root.color = 'BLACK'`,
  javascript: `class RBNode {
  constructor(val) {
    this.val = val;
    this.color = 'RED';
    this.left = this.right = this.parent = null;
  }
}
function rbInsert(root, key) {
  const node = new RBNode(key);
  bstInsert(root, node);
  fixInsert(node);
}
function fixInsert(node) {
  while (node !== root && node.parent.color === 'RED') {
    if (node.parent === node.parent.parent.left) {
      const uncle = node.parent.parent.right;
      if (uncle && uncle.color === 'RED') {
        node.parent.color = 'BLACK';
        uncle.color = 'BLACK';
        node.parent.parent.color = 'RED';
        node = node.parent.parent;
      } else {
        if (node === node.parent.right) {
          node = node.parent;
          leftRotate(node);
        }
        node.parent.color = 'BLACK';
        node.parent.parent.color = 'RED';
        rightRotate(node.parent.parent);
      }
    }
  }
  root.color = 'BLACK';
}`,
  cpp: `struct RBNode {
  int val; Color color;
  RBNode *left, *right, *parent;
};
void rbInsert(RBNode*& root, int key) {
  RBNode* node = new RBNode{key, RED, nil, nil, nil};
  bstInsert(root, node);
  fixInsert(root, node);
}
void fixInsert(RBNode*& root, RBNode* node) {
  while (node != root && node->parent->color == RED) {
    if (node->parent == node->parent->parent->left) {
      RBNode* uncle = node->parent->parent->right;
      if (uncle->color == RED) {
        node->parent->color = BLACK;
        uncle->color = BLACK;
        node->parent->parent->color = RED;
        node = node->parent->parent;
      } else {
        if (node == node->parent->right) {
          node = node->parent;
          leftRotate(root, node);
        }
        node->parent->color = BLACK;
        node->parent->parent->color = RED;
        rightRotate(root, node->parent->parent);
      }
    }
  }
  root->color = BLACK;
}`,
};

class RBNode {
  constructor(value) {
    this.value = value;
    this.color = "RED";
    this.left = null;
    this.right = null;
    this.parent = null;
  }
}

class RBTreeClass {
  constructor() {
    this.root = null;
  }

  serialize() {
    const s = (node) => {
      if (!node) return null;
      return {
        value: node.value,
        color: node.color,
        left: s(node.left),
        right: s(node.right),
      };
    };
    return s(this.root);
  }

  insert(value, steps = []) {
    const newNode = new RBNode(value);

    if (!this.root) {
      newNode.color = "BLACK";
      this.root = newNode;
      steps.push({
        tree: this.serialize(),
        highlight: value,
        specialNodes: {},
        line: 1,
        explanation: `Inserted ${value} as root. Root must be black.`,
      });
      return steps;
    }

    let current = this.root;
    let parent = null;

    while (current) {
      parent = current;
      steps.push({
        tree: this.serialize(),
        highlight: current.value,
        specialNodes: {},
        line: 3,
        explanation: `Comparing ${value} with ${current.value}.`,
      });

      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        steps.push({
          tree: this.serialize(),
          highlight: value,
          specialNodes: {},
          line: 3,
          explanation: `Value ${value} already exists. No insertion needed.`,
        });
        return steps;
      }
    }

    newNode.parent = parent;
    if (value < parent.value) {
      parent.left = newNode;
    } else {
      parent.right = newNode;
    }

    steps.push({
      tree: this.serialize(),
      highlight: value,
      specialNodes: {},
      line: 4,
      explanation: `Inserted ${value} as red node. Checking RB properties...`,
    });

    this.fixInsert(newNode, steps);
    return steps;
  }

  fixInsert(node, steps) {
    while (node !== this.root && node.parent.color === "RED") {
      if (node.parent === node.parent.parent.left) {
        const uncle = node.parent.parent.right;

        if (uncle && uncle.color === "RED") {
          steps.push({
            tree: this.serialize(),
            highlight: node.value,
            specialNodes: {
              [node.parent.value]: "parent",
              [uncle.value]: "uncle",
              [node.parent.parent.value]: "grandparent",
            },
            line: 9,
            explanation: `Case 1: Uncle ${uncle.value} is red. Recoloring parent, uncle to black and grandparent to red.`,
          });

          node.parent.color = "BLACK";
          uncle.color = "BLACK";
          node.parent.parent.color = "RED";
          node = node.parent.parent;

          steps.push({
            tree: this.serialize(),
            highlight: node.value,
            specialNodes: {},
            line: 9,
            explanation: `Recoloring complete. Moving up to check grandparent.`,
          });
        } else {
          if (node === node.parent.right) {
            steps.push({
              tree: this.serialize(),
              highlight: node.value,
              specialNodes: { [node.parent.value]: "parent" },
              line: 13,
              explanation: `Case 2: Uncle is black, node is right child. Left rotation needed.`,
            });

            node = node.parent;
            this.rotateLeft(node, steps);
          }

          steps.push({
            tree: this.serialize(),
            highlight: node.value,
            specialNodes: {
              [node.parent.value]: "parent",
              [node.parent.parent.value]: "grandparent",
            },
            line: 17,
            explanation: `Case 3: Uncle is black, node is left child. Recolor and right rotation.`,
          });

          node.parent.color = "BLACK";
          node.parent.parent.color = "RED";
          this.rotateRight(node.parent.parent, steps);
        }
      } else {
        const uncle = node.parent.parent.left;

        if (uncle && uncle.color === "RED") {
          steps.push({
            tree: this.serialize(),
            highlight: node.value,
            specialNodes: {
              [node.parent.value]: "parent",
              [uncle.value]: "uncle",
              [node.parent.parent.value]: "grandparent",
            },
            line: 9,
            explanation: `Case 1: Uncle ${uncle.value} is red. Recoloring parent, uncle to black and grandparent to red.`,
          });

          node.parent.color = "BLACK";
          uncle.color = "BLACK";
          node.parent.parent.color = "RED";
          node = node.parent.parent;

          steps.push({
            tree: this.serialize(),
            highlight: node.value,
            specialNodes: {},
            line: 9,
            explanation: `Recoloring complete. Moving up to check grandparent.`,
          });
        } else {
          if (node === node.parent.left) {
            steps.push({
              tree: this.serialize(),
              highlight: node.value,
              specialNodes: { [node.parent.value]: "parent" },
              line: 13,
              explanation: `Case 2: Uncle is black, node is left child. Right rotation needed.`,
            });

            node = node.parent;
            this.rotateRight(node, steps);
          }

          steps.push({
            tree: this.serialize(),
            highlight: node.value,
            specialNodes: {
              [node.parent.value]: "parent",
              [node.parent.parent.value]: "grandparent",
            },
            line: 17,
            explanation: `Case 3: Uncle is black, node is right child. Recolor and left rotation.`,
          });

          node.parent.color = "BLACK";
          node.parent.parent.color = "RED";
          this.rotateLeft(node.parent.parent, steps);
        }
      }
    }

    this.root.color = "BLACK";
    steps.push({
      tree: this.serialize(),
      highlight: this.root?.value ?? null,
      specialNodes: {},
      line: 20,
      explanation: `✅ Red-Black tree properties restored. Root is always black.`,
    });
  }

  rotateLeft(node, steps) {
    const rightChild = node.right;
    node.right = rightChild.left;

    if (rightChild.left) {
      rightChild.left.parent = node;
    }

    rightChild.parent = node.parent;

    if (!node.parent) {
      this.root = rightChild;
    } else if (node === node.parent.left) {
      node.parent.left = rightChild;
    } else {
      node.parent.right = rightChild;
    }

    rightChild.left = node;
    node.parent = rightChild;

    steps.push({
      tree: this.serialize(),
      highlight: rightChild.value,
      specialNodes: { [rightChild.value]: "rotated" },
      line: 14,
      explanation: `Left rotation complete around node ${rightChild.value}.`,
    });
  }

  rotateRight(node, steps) {
    const leftChild = node.left;
    node.left = leftChild.right;

    if (leftChild.right) {
      leftChild.right.parent = node;
    }

    leftChild.parent = node.parent;

    if (!node.parent) {
      this.root = leftChild;
    } else if (node === node.parent.right) {
      node.parent.right = leftChild;
    } else {
      node.parent.left = leftChild;
    }

    leftChild.right = node;
    node.parent = leftChild;

    steps.push({
      tree: this.serialize(),
      highlight: leftChild.value,
      specialNodes: { [leftChild.value]: "rotated" },
      line: 18,
      explanation: `Right rotation complete around node ${leftChild.value}.`,
    });
  }

  search(value, steps = []) {
    let current = this.root;

    steps.push({
      tree: this.serialize(),
      highlight: null,
      specialNodes: {},
      line: 3,
      explanation: `Searching for ${value} in Red-Black tree...`,
    });

    while (current) {
      steps.push({
        tree: this.serialize(),
        highlight: current.value,
        specialNodes: {},
        line: 3,
        explanation: `Comparing ${value} with ${current.value}.`,
      });

      if (value === current.value) {
        steps.push({
          tree: this.serialize(),
          highlight: current.value,
          specialNodes: {},
          line: 3,
          explanation: `✅ Found ${value}!`,
        });
        return steps;
      } else if (value < current.value) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    steps.push({
      tree: this.serialize(),
      highlight: null,
      specialNodes: {},
      line: 3,
      explanation: `❌ ${value} not found in the tree.`,
    });

    return steps;
  }
}

// Layout tree for SVG rendering
function layoutTree(node, x, y, spread, positions = {}) {
  if (!node) return positions;
  positions[node.value] = { x, y, node };
  layoutTree(node.left, x - spread, y + 65, Math.max(spread / 2, 35), positions);
  layoutTree(node.right, x + spread, y + 65, Math.max(spread / 2, 35), positions);
  return positions;
}

function getEdges(node, positions, edges = []) {
  if (!node) return edges;
  if (node.left && positions[node.left.value])
    edges.push({
      x1: positions[node.value].x,
      y1: positions[node.value].y,
      x2: positions[node.left.value].x,
      y2: positions[node.left.value].y,
    });
  if (node.right && positions[node.right.value])
    edges.push({
      x1: positions[node.value].x,
      y1: positions[node.value].y,
      x2: positions[node.right.value].x,
      y2: positions[node.right.value].y,
    });
  getEdges(node.left, positions, edges);
  getEdges(node.right, positions, edges);
  return edges;
}

function TreeSVG({ treeData, highlight, specialNodes }) {
  if (!treeData)
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        Red-Black Tree is empty. Insert some values.
      </div>
    );

  const positions = layoutTree(treeData, 260, 40, 100);
  const edges = getEdges(treeData, positions);
  const posValues = Object.values(positions);

  return (
    <svg
      width={520}
      height={300}
      viewBox="0 0 520 300"
      className="mx-auto overflow-visible"
    >
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke="oklch(0.28 0.05 240)"
          strokeWidth={1.5}
        />
      ))}
      {posValues.map(({ x, y, node }) => {
        const isHighlight = highlight === node.value;
        const specialType = specialNodes?.[node.value];
        const isRed = node.color === "RED";

        let fill, stroke, textColor;
        if (isHighlight) {
          fill = "oklch(0.75 0.18 145 / 0.25)";
          stroke = "oklch(0.75 0.18 145)";
          textColor = "oklch(0.85 0.15 145)";
        } else if (specialType === "uncle") {
          fill = "oklch(0.65 0.18 50 / 0.25)";
          stroke = "oklch(0.65 0.18 50)";
          textColor = "oklch(0.8 0.15 50)";
        } else if (specialType === "parent") {
          fill = "oklch(0.55 0.18 240 / 0.25)";
          stroke = "oklch(0.55 0.18 240)";
          textColor = "oklch(0.75 0.18 240)";
        } else if (specialType === "grandparent") {
          fill = "oklch(0.55 0.15 300 / 0.25)";
          stroke = "oklch(0.55 0.15 300)";
          textColor = "oklch(0.75 0.15 300)";
        } else if (specialType === "rotated") {
          fill = "oklch(0.75 0.18 195 / 0.25)";
          stroke = CYAN;
          textColor = CYAN;
        } else if (isRed) {
          fill = "oklch(0.55 0.2 25 / 0.25)";
          stroke = "oklch(0.55 0.2 25)";
          textColor = "oklch(0.75 0.18 25)";
        } else {
          fill = BG;
          stroke = BORDER;
          textColor = "rgb(203 213 225)";
        }

        return (
          <g key={node.value}>
            <circle
              cx={x}
              cy={y}
              r={20}
              fill={fill}
              stroke={stroke}
              strokeWidth={2.5}
              className="transition-all duration-500"
            />
            <text
              x={x}
              y={y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={12}
              fontWeight="bold"
              fill={textColor}
            >
              {node.value}
            </text>
            {/* Color label */}
            <text
              x={x}
              y={y - 28}
              textAnchor="middle"
              fontSize={8}
              fontWeight="bold"
              fill={isRed ? "oklch(0.65 0.2 25)" : "oklch(0.45 0.04 240)"}
            >
              {node.color}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function RedBlackTree() {
  const [rbTree] = useState(() => new RBTreeClass());
  const [treeData, setTreeData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const [operation, setOperation] = useState("insert");
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef(null);

  const cur = steps[stepIdx] || null;
  const highlight = cur?.highlight ?? null;
  const specialNodes = cur?.specialNodes ?? {};

  const reset = useCallback(() => {
    clearInterval(timerRef.current);
    setPlaying(false);
    setStepIdx(0);
    setStarted(false);
    setSteps([]);
    setTreeData(null);
    rbTree.root = null;
  }, [rbTree]);

  const runSteps = (s) => {
    setSteps(s);
    setStepIdx(0);
    setStarted(true);
    setPlaying(true);
    let idx = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      idx++;
      if (idx >= s.length) {
        clearInterval(timerRef.current);
        setPlaying(false);
        setStepIdx(s.length - 1);
        return;
      }
      setStepIdx(idx);
    }, speed);
  };

  const togglePlay = () => {
    if (!started) {
      const value = parseInt(inputValue);
      if (isNaN(value)) return;
      let s = [];
      if (operation === "insert") {
        s = rbTree.insert(value);
      } else {
        s = rbTree.search(value);
      }
      if (s.length > 0) {
        const lastStep = s[s.length - 1];
        setTreeData(lastStep.tree);
      }
      runSteps(s);
      setInputValue("");
      return;
    }
    if (playing) {
      clearInterval(timerRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      let idx = stepIdx;
      timerRef.current = setInterval(() => {
        idx++;
        if (idx >= steps.length) {
          clearInterval(timerRef.current);
          setPlaying(false);
          setStepIdx(steps.length - 1);
          return;
        }
        setStepIdx(idx);
      }, speed);
    }
  };

  const fullReset = () => {
    reset();
    setInputValue("");
  };

  const displayTree =
    cur?.tree !== undefined ? cur.tree : treeData;

  return (
    <>
      <SEO
        data={{
          title: "Red-Black Tree Visualization",
          description:
            "Interactive visualization of Red-Black Tree insert and search operations.",
        }}
      />
      <AlgoPageLayout
        title="Red-Black Tree"
        category="Tree"
        categoryHref="/tree"
        timeComplexity="O(log n)"
        spaceComplexity="O(log n)"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Operation selector & input */}
            <div
              className="rounded-xl border p-4"
              style={{ background: BG, borderColor: BORDER }}
            >
              <div className="flex gap-2 mb-3">
                {[
                  [
                    "insert",
                    "Insert",
                    <Plus className="w-3.5 h-3.5" />,
                  ],
                  [
                    "search",
                    "Search",
                    <Search className="w-3.5 h-3.5" />,
                  ],
                ].map(([m, label, icon]) => (
                  <button
                    key={m}
                    onClick={() => {
                      reset();
                      setOperation(m);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all"
                    style={{
                      background:
                        operation === m
                          ? "oklch(0.75 0.18 195 / 0.15)"
                          : "oklch(0.17 0.03 240)",
                      borderColor: operation === m ? CYAN : BORDER,
                      color:
                        operation === m ? CYAN : "rgb(148 163 184)",
                    }}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 flex-wrap">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && togglePlay()}
                  placeholder={`Value to ${operation}`}
                  type="number"
                  disabled={playing}
                  className="flex-1 min-w-[120px] px-3 py-2 rounded-lg text-sm text-white outline-none"
                  style={{
                    background: "oklch(0.17 0.03 240)",
                    border: `1px solid ${BORDER}`,
                    opacity: playing ? 0.5 : 1,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = CYAN)}
                  onBlur={(e) => (e.target.style.borderColor = BORDER)}
                />
                <button
                  onClick={togglePlay}
                  disabled={playing}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold"
                  style={{
                    background: CYAN,
                    color: "oklch(0.1 0.02 240)",
                    opacity: playing ? 0.5 : 1,
                  }}
                >
                  {playing ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {!started
                    ? operation === "insert"
                      ? "Insert"
                      : "Search"
                    : playing
                      ? "Pause"
                      : "Resume"}
                </button>
                <button
                  onClick={fullReset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300"
                  style={{ borderColor: BORDER }}
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <SpeedControl
                  animationSpeed={speed}
                  setAnimationSpeed={setSpeed}
                  isAnimating={playing}
                />
              </div>
            </div>

            {/* Tree visualization */}
            <div
              className="rounded-xl border p-4 overflow-x-auto"
              style={{ background: BG, borderColor: BORDER }}
            >
              <TreeSVG
                treeData={displayTree}
                highlight={highlight}
                specialNodes={specialNodes}
              />
            </div>

            {/* Legend */}
            <div
              className="rounded-xl border p-3 flex flex-wrap gap-4 items-center text-xs text-slate-400"
              style={{ background: BG, borderColor: BORDER }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.55 0.2 25)" }}
                />
                Red Node
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full border"
                  style={{ borderColor: BORDER, background: BG }}
                />
                Black Node
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.75 0.18 145)" }}
                />
                Current/Found
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.65 0.18 50)" }}
                />
                Uncle
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.55 0.18 240)" }}
                />
                Parent
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ background: "oklch(0.55 0.15 300)" }}
                />
                Grandparent
              </div>
            </div>

            <ExplanationPanel
              steps={steps.map((s) => s.explanation)}
              currentStep={stepIdx}
              totalSteps={steps.length}
            />
          </div>

          <div className="h-[500px] xl:h-auto">
            <CodePanel codes={CODES} highlightLine={cur?.line ?? null} />
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
