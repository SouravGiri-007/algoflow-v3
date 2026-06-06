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
  pseudo: `LCS(X, Y):
  m = len(X), n = len(Y)
  create dp table of size (m+1) x (n+1)
  for i = 1 to m:
    for j = 1 to n:
      if X[i] == Y[j]:
        dp[i][j] = dp[i-1][j-1] + 1
      else:
        dp[i][j] = max(dp[i-1][j], dp[i][j-1])
  return dp[m][n]`,
  python: `def lcs(X, Y):
    m, n = len(X), len(Y)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if X[i-1] == Y[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j],
                               dp[i][j-1])
    return dp[m][n]`,
  javascript: `function lcs(X, Y) {
  const m = X.length, n = Y.length;
  const dp = Array.from({length: m+1},
    () => new Array(n+1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (X[i-1] === Y[j-1])
        dp[i][j] = dp[i-1][j-1] + 1;
      else
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
    }
  }
  return dp[m][n];
}`,
  cpp: `int lcs(string X, string Y) {
  int m = X.size(), n = Y.size();
  vector<vector<int>> dp(m+1, vector<int>(n+1,0));
  for (int i = 1; i <= m; i++)
    for (int j = 1; j <= n; j++)
      if (X[i-1] == Y[j-1])
        dp[i][j] = dp[i-1][j-1] + 1;
      else
        dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
  return dp[m][n];
}`,
};

function buildSteps(X, Y) {
  const m = X.length, n = Y.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const steps = [];
  steps.push({ dp: dp.map(r => [...r]), active: null, match: null, line: 2, explanation: `Starting LCS of "${X}" and "${Y}". Building ${m+1}×${n+1} DP table.` });
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (X[i - 1] === Y[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        steps.push({ dp: dp.map(r => [...r]), active: [i, j], match: true, line: 6,
          explanation: `X[${i-1}]='${X[i-1]}' == Y[${j-1}]='${Y[j-1]}' ✅ Match! dp[${i}][${j}] = dp[${i-1}][${j-1}] + 1 = ${dp[i][j]}` });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        steps.push({ dp: dp.map(r => [...r]), active: [i, j], match: false, line: 8,
          explanation: `X[${i-1}]='${X[i-1]}' ≠ Y[${j-1}]='${Y[j-1]}'. dp[${i}][${j}] = max(${dp[i-1][j]}, ${dp[i][j-1]}) = ${dp[i][j]}` });
      }
    }
  }
  steps.push({ dp: dp.map(r => [...r]), active: null, match: null, line: 9, explanation: `✅ LCS length = ${dp[m][n]}. The LCS of "${X}" and "${Y}" has length ${dp[m][n]}.` });
  return steps;
}

export default function LCS() {
  const [X, setX] = useState("ABCBDAB");
  const [Y, setY] = useState("BDCABA");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => { clearInterval(timerRef.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);
  const runSteps = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0; clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; } setStepIdx(idx); }, speed);
  };
  const togglePlay = () => {
    if (!started) { runSteps(buildSteps(X.toUpperCase(), Y.toUpperCase())); return; }
    if (playing) { clearInterval(timerRef.current); setPlaying(false); }
    else { setPlaying(true); let idx = stepIdx; timerRef.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length - 1); return; } setStepIdx(idx); }, speed); }
  };

  const dp = cur?.dp;
  const Xu = X.toUpperCase(), Yu = Y.toUpperCase();

  return (
    <>
      <SEO data={{ title: "Longest Common Subsequence" }} />
      <AlgoPageLayout title="Longest Common Subsequence" category="Dynamic Programming" categoryHref="/dp" timeComplexity="O(m·n)" spaceComplexity="O(m·n)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Strings</p>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">String X</label>
                  <input value={X} onChange={e => { reset(); setX(e.target.value.toUpperCase().slice(0,10)); }}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none font-mono"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">String Y</label>
                  <input value={Y} onChange={e => { reset(); setY(e.target.value.toUpperCase().slice(0,10)); }}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none font-mono"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
              </div>
            </div>

            {/* DP Table */}
            <div className="rounded-xl border p-4 overflow-x-auto" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">DP Table</p>
              {dp && (
                <table className="text-xs font-mono border-collapse">
                  <thead>
                    <tr>
                      <td className="w-8 h-8 text-center text-slate-600" />
                      <td className="w-8 h-8 text-center text-slate-600">ε</td>
                      {Yu.split("").map((c, j) => (
                        <td key={j} className="w-8 h-8 text-center font-bold" style={{ color: CYAN }}>{c}</td>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dp.map((row, i) => (
                      <tr key={i}>
                        <td className="w-8 h-8 text-center font-bold" style={{ color: CYAN }}>{i === 0 ? "ε" : Xu[i - 1]}</td>
                        {row.map((val, j) => {
                          const isActive = cur?.active?.[0] === i && cur?.active?.[1] === j;
                          return (
                            <td key={j} className="w-8 h-8 text-center rounded transition-all duration-200 border"
                              style={{
                                background: isActive ? (cur.match ? "oklch(0.18 0.12 145/0.4)" : "oklch(0.22 0.12 30/0.3)") : val > 0 ? "oklch(0.75 0.18 195/0.08)" : "oklch(0.15 0.03 240)",
                                borderColor: isActive ? (cur.match ? "oklch(0.55 0.18 145)" : "oklch(0.65 0.18 30)") : BORDER,
                                color: isActive ? "white" : val > 0 ? CYAN : "rgb(100 116 139)",
                                fontWeight: isActive ? "bold" : "normal",
                              }}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!dp && <p className="text-slate-500 text-sm">Press Start to build the DP table.</p>}
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
