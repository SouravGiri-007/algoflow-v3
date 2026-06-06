import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN="oklch(0.75 0.18 195)";const BG="oklch(0.13 0.025 240)";const BORDER="oklch(0.22 0.04 240)";

const CODES = {
  pseudo: `KNAPSACK-01(weights, values, W):
  n = number of items
  dp[0..n][0..W] = 0
  for i from 1 to n:
    for w from 0 to W:
      // Don't take item i
      dp[i][w] = dp[i-1][w]
      // Take item i if it fits
      if weights[i-1] <= w:
        dp[i][w] = max(dp[i][w],
          dp[i-1][w-weights[i-1]] + values[i-1])
  return dp[n][W]`,
  python: `def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0]*(W+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(W+1):
            dp[i][w] = dp[i-1][w]
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i][w],
                    dp[i-1][w-weights[i-1]]
                    + values[i-1])
    return dp[n][W]`,
  javascript: `function knapsack(weights, values, W) {
  const n = weights.length;
  const dp = Array.from({length: n+1},
    () => new Array(W+1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i-1][w];
      if (weights[i-1] <= w)
        dp[i][w] = Math.max(dp[i][w],
          dp[i-1][w-weights[i-1]] + values[i-1]);
    }
  }
  return dp[n][W];
}`,
  cpp: `int knapsack(vector<int>& w, vector<int>& v, int W) {
  int n = w.size();
  vector<vector<int>> dp(n+1, vector<int>(W+1,0));
  for (int i = 1; i <= n; i++)
    for (int c = 0; c <= W; c++) {
      dp[i][c] = dp[i-1][c];
      if (w[i-1] <= c)
        dp[i][c] = max(dp[i][c],
          dp[i-1][c-w[i-1]] + v[i-1]);
    }
  return dp[n][W];
}`,
};

const DEFAULT_ITEMS = [
  { weight: 2, value: 6 },
  { weight: 2, value: 10 },
  { weight: 3, value: 12 },
  { weight: 5, value: 15 },
];
const DEFAULT_W = 7;

function buildSteps(items, W) {
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));
  const steps = [];
  steps.push({ dp: dp.map(r => [...r]), active: null, line: 2, explanation: `Initialized ${n+1}×${W+1} DP table with zeros. Items: ${items.map((it,i)=>`Item${i+1}(w=${it.weight},v=${it.value})`).join(", ")}. Capacity W=${W}.` });
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i-1][w];
      let took = false;
      if (items[i-1].weight <= w) {
        const withItem = dp[i-1][w - items[i-1].weight] + items[i-1].value;
        if (withItem > dp[i][w]) { dp[i][w] = withItem; took = true; }
      }
      steps.push({ dp: dp.map(r => [...r]), active: [i, w], took, line: took ? 10 : 6,
        explanation: `Item ${i} (w=${items[i-1].weight},v=${items[i-1].value}), capacity ${w}: ${took ? `✅ Taking item! dp[${i}][${w}] = ${dp[i][w]}` : `Skip. dp[${i}][${w}] = ${dp[i][w]}`}` });
    }
  }
  steps.push({ dp: dp.map(r => [...r]), active: [n, W], took: false, line: 12, explanation: `✅ Done! Maximum value = dp[${n}][${W}] = ${dp[n][W]}.` });
  return steps;
}

export default function Knapsack() {
  const [steps, setSteps] = useState([]); const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false); const [speed, setSpeed] = useState(200); const [started, setStarted] = useState(false);
  const timer = useRef(null); const cur = steps[stepIdx] || null;

  const reset = useCallback(() => { clearInterval(timer.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);
  const run = (s) => { setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true); let idx = 0; clearInterval(timer.current); timer.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timer.current); setPlaying(false); setStepIdx(s.length - 1); return; } setStepIdx(idx); }, speed); };
  const togglePlay = () => { if (!started) { run(buildSteps(DEFAULT_ITEMS, DEFAULT_W)); return; } if (playing) { clearInterval(timer.current); setPlaying(false); } else { setPlaying(true); let idx = stepIdx; timer.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timer.current); setPlaying(false); setStepIdx(steps.length - 1); return; } setStepIdx(idx); }, speed); } };

  const dpTable = cur ? cur.dp : Array.from({ length: DEFAULT_ITEMS.length + 1 }, () => new Array(DEFAULT_W + 1).fill(0));
  const maxVal = Math.max(...dpTable.flat(), 1);

  return (<><SEO data={{ title: "0/1 Knapsack" }} />
    <AlgoPageLayout title="0/1 Knapsack Problem" category="Dynamic Programming" categoryHref="/dp" timeComplexity="O(n·W)" spaceComplexity="O(n·W)">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          {/* Items */}
          <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Items & Capacity W={DEFAULT_W}</p>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_ITEMS.map((it, i) => (
                <div key={i} className="px-3 py-2 rounded-lg border text-sm" style={{ background: "oklch(0.17 0.03 240)", borderColor: BORDER }}>
                  <span className="text-slate-400">Item {i+1}: </span>
                  <span className="text-white">w={it.weight}, v={it.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DP Table */}
          <div className="rounded-xl border p-4 overflow-x-auto" style={{ background: BG, borderColor: BORDER }}>
            <p className="text-xs text-slate-500 mb-3">DP Table — rows = items, cols = capacity</p>
            <table className="text-xs font-mono border-collapse">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-slate-500">i\w</th>
                  {Array.from({ length: DEFAULT_W + 1 }, (_, w) => (
                    <th key={w} className="px-2 py-1 text-slate-500">{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dpTable.map((row, i) => (
                  <tr key={i}>
                    <td className="px-2 py-1 text-slate-500">{i}</td>
                    {row.map((val, w) => {
                      const isActive = cur?.active?.[0] === i && cur?.active?.[1] === w;
                      const intensity = val / maxVal;
                      return (
                        <td key={w} className="px-2 py-1 text-center rounded transition-all duration-200 border"
                          style={{ borderColor: "oklch(0.18 0.03 240)", background: isActive ? "oklch(0.75 0.18 195/0.25)" : val > 0 ? `oklch(0.75 0.18 195 / ${intensity * 0.2})` : "transparent", color: isActive ? CYAN : val > 0 ? "white" : "rgb(100 116 139)", fontWeight: isActive ? "bold" : "normal", minWidth: 32 }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{ background: BG, borderColor: BORDER }}>
            <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm" style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>{playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{!started ? "Start" : playing ? "Pause" : "Resume"}</button>
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300" style={{ borderColor: BORDER }}><RotateCcw className="w-4 h-4" />Reset</button>
            <SpeedControl animationSpeed={speed} setAnimationSpeed={setSpeed} isAnimating={playing} />
          </div>
          <ExplanationPanel steps={steps.map(s => s.explanation)} currentStep={stepIdx} totalSteps={steps.length} />
        </div>
        <div className="h-[500px] xl:h-auto"><CodePanel codes={CODES} highlightLine={cur?.line ?? null} /></div>
      </div>
    </AlgoPageLayout>
  </>);
}
