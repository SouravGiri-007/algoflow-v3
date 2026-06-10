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
  pseudo: `SUBSET-GEN(arr, index, current):
  if index == length(arr):
    print current    // found a subset
    return

  // Exclude arr[index] (left branch)
  SUBSET-GEN(arr, index + 1, current)

  // Include arr[index] (right branch)
  current.append(arr[index])
  SUBSET-GEN(arr, index + 1, current)
  current.pop()     // backtrack`,
  python: `def generate_subsets(arr, index=0, current=None):
    if current is None:
        current = []
    if index == len(arr):
        print(current)
        return

    # Exclude current element
    generate_subsets(arr, index + 1, current)

    # Include current element
    current.append(arr[index])
    generate_subsets(arr, index + 1, current)
    current.pop()  # backtrack

generate_subsets(['A', 'B', 'C'])`,
  javascript: `function generateSubsets(arr, index = 0, current = []) {
  if (index === arr.length) {
    console.log(current);
    return;
  }

  // Exclude current element (left branch)
  generateSubsets(arr, index + 1, current);

  // Include current element (right branch)
  current.push(arr[index]);
  generateSubsets(arr, index + 1, current);
  current.pop(); // backtrack
}

generateSubsets(['A', 'B', 'C']);`,
  cpp: `void generateSubsets(vector<char>& arr,
                int idx, vector<char>& cur) {
  if (idx == arr.size()) {
    // print current subset
    return;
  }

  // Exclude (left branch)
  generateSubsets(arr, idx + 1, cur);

  // Include (right branch)
  cur.push_back(arr[idx]);
  generateSubsets(arr, idx + 1, cur);
  cur.pop_back(); // backtrack
}`,
};

// ─── Tree node creation ──────────────────────────────────────────────────────
function createTreeNode(subset, level, path, isLeaf) {
  return { subset: [...subset], level, path, isLeaf, x: 0, y: 0, id: `${level}-${path}` };
}

// ─── calculate positions ─────────────────────────────────────────────────────
function calculateNodePositions(nodes, elementCount) {
  const maxLevel = elementCount;
  const nodeSpacingY = 80;
  const margin = 60;
  const leafCount = Math.pow(2, maxLevel);
  const svgWidth = Math.max(800, leafCount * 70);
  const svgHeight = (maxLevel + 1) * nodeSpacingY + margin * 2;

  nodes.forEach((node) => {
    if (node.level === 0) {
      node.x = svgWidth / 2;
      node.y = margin;
      return;
    }
    let position = 0;
    for (let i = 0; i < node.path.length; i++) {
      position = position * 2 + (node.path[i] === "R" ? 1 : 0);
    }
    const nodesAtLevel = Math.pow(2, node.level);
    const spacing = svgWidth / nodesAtLevel;
    node.x = spacing * (position + 0.5);
    node.y = margin + node.level * nodeSpacingY;
  });

  return { nodes, svgWidth, svgHeight };
}

// ─── buildSteps ──────────────────────────────────────────────────────────────
function buildSteps(elements) {
  const nodes = [];
  const subsets = [];
  let nodeCounter = 0;

  const backtrack = (index, currentSubset, path = "") => {
    const node = createTreeNode(currentSubset, index, path, index === elements.length);
    nodes.push({ ...node, step: nodeCounter++ });

    if (index === elements.length) {
      subsets.push([...currentSubset]);
      return;
    }

    // Left branch: exclude
    backtrack(index + 1, currentSubset, path + "L");

    // Right branch: include
    currentSubset.push(elements[index]);
    backtrack(index + 1, currentSubset, path + "R");
    currentSubset.pop();
  };

  backtrack(0, []);

  const { nodes: positionedNodes, svgWidth, svgHeight } = calculateNodePositions(nodes, elements.length);

  // Build step array — each step reveals one more node
  const steps = [];
  const collectedSubsets = [];

  for (let i = 0; i < positionedNodes.length; i++) {
    const node = positionedNodes[i];
    const isLeaf = node.isLeaf;
    if (isLeaf) collectedSubsets.push([...node.subset]);

    let explanation;
    if (i === 0) {
      explanation = `Start at root with empty subset. Elements: [${elements.join(", ")}]. Total subsets: 2^${elements.length} = ${Math.pow(2, elements.length)}.`;
    } else if (isLeaf) {
      explanation = `Leaf node reached! Subset found: {${node.subset.join(", ") || "∅"}}. (${collectedSubsets.length}/${Math.pow(2, elements.length)} subsets found)`;
    } else {
      const decision = node.path.slice(-1) === "L" ? "Exclude" : "Include";
      const elem = elements[node.level - 1];
      explanation = `${decision} element '${elem}' → subset is now {${node.subset.join(", ") || "∅"}}. Decision: ${decision === "Exclude" ? "0" : "1"}.`;
    }

    steps.push({
      currentNodeIndex: i,
      currentSubset: [...node.subset],
      allSubsets: [...collectedSubsets],
      treeNodes: positionedNodes,
      svgWidth,
      svgHeight,
      explanation,
      line: isLeaf ? 3 : node.path.slice(-1) === "L" ? 7 : 11,
    });
  }

  steps.push({
    currentNodeIndex: positionedNodes.length - 1,
    currentSubset: [...positionedNodes[positionedNodes.length - 1].subset],
    allSubsets: [...collectedSubsets],
    treeNodes: positionedNodes,
    svgWidth,
    svgHeight,
    explanation: `✅ All ${collectedSubsets.length} subsets generated from [${elements.join(", ")}]. Total: 2^${elements.length} = ${Math.pow(2, elements.length)}.`,
    line: 13,
  });

  return steps;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SubsetGenerationVisualization() {
  const [elements, setElements] = useState(["A", "B", "C"]);
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

  const handleElementChange = useCallback((count) => {
    clearInterval(timerRef.current);
    setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]);
    const newElements = Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
    setElements(newElements);
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
    if (!started) { runSteps(buildSteps(elements)); return; }
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

  const treeNodes = cur?.treeNodes || [];
  const svgWidth = cur?.svgWidth || 800;
  const svgHeight = cur?.svgHeight || 400;
  const currentNodeIndex = cur?.currentNodeIndex ?? -1;
  const currentSubset = cur?.currentSubset || [];
  const allSubsets = cur?.allSubsets || [];

  return (
    <>
      <SEO data={{ title: "Subset Generation — Backtracking" }} />
      <AlgoPageLayout
        title="Subset Generation"
        category="Backtracking"
        categoryHref="/backtracking"
        timeComplexity="O(2ⁿ)"
        spaceComplexity="O(n)"
      >
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Element count selector */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Elements: [{elements.join(", ")}] — Select count
              </p>
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 4, 5, 6, 7].map((count) => (
                  <button
                    key={count}
                    onClick={() => handleElementChange(count)}
                    disabled={playing}
                    className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-200"
                    style={{
                      background: elements.length === count ? "oklch(0.75 0.18 195 / 0.15)" : "oklch(0.17 0.03 240)",
                      borderColor: elements.length === count ? CYAN : BORDER,
                      color: elements.length === count ? CYAN : "rgb(148 163 184)",
                      opacity: playing ? 0.4 : 1,
                    }}
                  >
                    {count}
                  </button>
                ))}
                <span className="flex items-center text-xs text-slate-600 ml-2">
                  Total subsets: 2<sup>{elements.length}</sup> = {Math.pow(2, elements.length)}
                </span>
              </div>
            </div>

            {/* Decision Tree */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs text-slate-500 mb-3">
                Decision Tree — Step {started ? stepIdx + 1 : 0} / {steps.length || "?"}
              </p>
              <div className="overflow-x-auto">
                <svg
                  width={svgWidth}
                  height={svgHeight}
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="mx-auto"
                  style={{ minWidth: Math.min(svgWidth, 600) }}
                >
                  {/* Connections */}
                  {treeNodes.map((node, index) => {
                    if (node.level === 0) return null;
                    const parentPath = node.path.slice(0, -1);
                    const parent = treeNodes.find(
                      (n) => n.level === node.level - 1 && n.path === parentPath
                    );
                    if (!parent) return null;
                    const isActive = index <= currentNodeIndex;
                    return (
                      <line
                        key={`line-${node.id}`}
                        x1={parent.x} y1={parent.y + 18}
                        x2={node.x} y2={node.y - 18}
                        stroke={isActive ? CYAN : "oklch(0.3 0.04 240)"}
                        strokeWidth={isActive ? 2.5 : 1.5}
                        className="transition-all duration-300"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {treeNodes.map((node, index) => {
                    const isActive = index === currentNodeIndex;
                    const isVisited = index < currentNodeIndex;
                    const isLeaf = node.isLeaf;
                    return (
                      <g key={node.id}>
                        <circle
                          cx={node.x} cy={node.y} r={18}
                          fill={
                            isActive ? CYAN
                            : isVisited ? (isLeaf ? "oklch(0.55 0.15 155)" : "oklch(0.4 0.05 240)")
                            : "oklch(0.2 0.03 240)"
                          }
                          stroke={isActive ? "oklch(0.85 0.2 195)" : "oklch(0.25 0.04 240)"}
                          strokeWidth={isActive ? 2.5 : 1.5}
                          className="transition-all duration-300"
                        />
                        {/* Subset label */}
                        <text
                          x={node.x} y={node.y - 26}
                          textAnchor="middle" fontSize={9} fontFamily="monospace"
                          fill={isActive || isVisited ? "rgb(226 232 240)" : "oklch(0.4 0.04 240)"}
                          className="select-none"
                        >
                          {node.subset.length > 0 ? `{${node.subset.join(",")}}` : "{}"}
                        </text>
                        {/* Branch label */}
                        {node.path && (
                          <text
                            x={node.x + (node.path.slice(-1) === "L" ? -14 : 14)}
                            y={node.y + 32}
                            textAnchor="middle" fontSize={9} fontWeight="bold"
                            fill={index <= currentNodeIndex ? "oklch(0.75 0.18 145)" : "oklch(0.35 0.04 240)"}
                          >
                            {node.path.slice(-1) === "L" ? "0" : "1"}
                          </text>
                        )}
                        {/* Element being decided */}
                        {!node.isLeaf && node.level < elements.length && (
                          <text
                            x={node.x} y={node.y + 5}
                            textAnchor="middle" fontSize={10} fontWeight="bold"
                            fill={isActive ? "oklch(0.1 0.02 240)" : isVisited ? "rgb(226 232 240)" : "oklch(0.5 0.04 240)"}
                          >
                            {elements[node.level]}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Current subset & generated subsets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Subset</p>
                <div className="rounded-lg p-3 font-mono text-sm" style={{ background: "oklch(0.1 0.02 240)", color: CYAN }}>
                  {currentSubset.length > 0 ? `{${currentSubset.join(", ")}}` : "{ }"}
                </div>
              </div>
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Generated Subsets ({allSubsets.length})
                </p>
                <div className="rounded-lg p-3 max-h-28 overflow-y-auto" style={{ background: "oklch(0.1 0.02 240)" }}>
                  {allSubsets.length > 0 ? allSubsets.map((subset, index) => (
                    <div key={index} className="font-mono text-xs" style={{ color: CYAN }}>
                      {subset.length > 0 ? `{${subset.join(", ")}}` : "{ }"}
                    </div>
                  )) : (
                    <span className="text-xs" style={{ color: "oklch(0.4 0.04 240)" }}>No subsets yet</span>
                  )}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="rounded-xl border p-3 flex flex-wrap gap-4 text-xs" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: CYAN }} />
                <span className="text-slate-500">Current Node</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: "oklch(0.55 0.15 155)" }} />
                <span className="text-slate-500">Leaf (Complete Subset)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: "oklch(0.4 0.05 240)" }} />
                <span className="text-slate-500">Visited Internal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold" style={{ color: "oklch(0.75 0.18 145)" }}>0</span>
                <span className="text-slate-600">= Exclude (Left)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold" style={{ color: "oklch(0.75 0.18 145)" }}>1</span>
                <span className="text-slate-600">= Include (Right)</span>
              </div>
            </div>

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
