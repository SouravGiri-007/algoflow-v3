import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN="oklch(0.75 0.18 195)";const BG="oklch(0.13 0.025 240)";const BORDER="oklch(0.22 0.04 240)";

const CODES={
  pseudo:`// Memoization (Top-Down)
FIBO-MEMO(n, memo={}):
  if n in memo: return memo[n]
  if n <= 1: return n
  memo[n] = FIBO-MEMO(n-1) + FIBO-MEMO(n-2)
  return memo[n]

// Tabulation (Bottom-Up)
FIBO-TAB(n):
  dp[0] = 0, dp[1] = 1
  for i from 2 to n:
    dp[i] = dp[i-1] + dp[i-2]
  return dp[n]`,
  python:`# Memoization
def fib_memo(n, memo={}):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib_memo(n-1) + fib_memo(n-2)
    return memo[n]

# Tabulation (Bottom-Up)
def fib_tab(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`,
  javascript:`// Tabulation
function fibonacci(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1).fill(0);
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i-1] + dp[i-2];
  }
  return dp[n];
}`,
  cpp:`// Tabulation
int fibonacci(int n) {
  if (n <= 1) return n;
  vector<int> dp(n+1, 0);
  dp[1] = 1;
  for (int i = 2; i <= n; i++)
    dp[i] = dp[i-1] + dp[i-2];
  return dp[n];
}`,
};

function buildSteps(n) {
  const steps = [];
  const dp = new Array(n + 1).fill(null);
  dp[0] = 0;
  if (n >= 1) dp[1] = 1;
  steps.push({ dp: [...dp], current: -1, line: 9, explanation: `Computing Fibonacci(${n}) using tabulation. dp[0]=0, dp[1]=1 are base cases.` });
  for (let i = 2; i <= n; i++) {
    steps.push({ dp: [...dp], current: i, line: 11, explanation: `dp[${i}] = dp[${i-1}] + dp[${i-2}] = ${dp[i-1]} + ${dp[i-2]} = ${dp[i-1]+dp[i-2]}.` });
    dp[i] = dp[i-1] + dp[i-2];
    steps.push({ dp: [...dp], current: i, line: 12, explanation: `Stored dp[${i}] = ${dp[i]}.` });
  }
  steps.push({ dp: [...dp], current: n, line: 13, explanation: `✅ Fibonacci(${n}) = ${dp[n]}.` });
  return steps;
}

export default function Fibonacci() {
  const [n, setN] = useState(10);
  const [steps, setSteps] = useState([]); const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false); const [speed, setSpeed] = useState(400); const [started, setStarted] = useState(false);
  const timer = useRef(null); const cur = steps[stepIdx] || null;
  const dp = cur ? cur.dp : [];

  const reset = useCallback(() => { clearInterval(timer.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);
  const run = (s) => { setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true); let idx = 0; clearInterval(timer.current); timer.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timer.current); setPlaying(false); setStepIdx(s.length - 1); return; } setStepIdx(idx); }, speed); };
  const togglePlay = () => { if (!started) { run(buildSteps(n)); return; } if (playing) { clearInterval(timer.current); setPlaying(false); } else { setPlaying(true); let idx = stepIdx; timer.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timer.current); setPlaying(false); setStepIdx(steps.length - 1); return; } setStepIdx(idx); }, speed); } };

  return (<><SEO data={{ title: "Fibonacci DP" }} />
    <AlgoPageLayout title="Fibonacci (Memoization vs Tabulation)" category="Dynamic Programming" categoryHref="/dp" timeComplexity="O(n)" spaceComplexity="O(n)">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-4">
          <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
            <label className="text-xs text-slate-500 mb-2 block">Compute Fibonacci(n) — n = {n}</label>
            <div className="flex items-center gap-4">
              <input type="range" min={2} max={20} value={n} onChange={e => { reset(); setN(parseInt(e.target.value)); }} className="flex-1 accent-cyan-400" />
              <span className="text-white font-bold w-8 text-center">{n}</span>
            </div>
          </div>

          <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
            <p className="text-xs text-slate-500 mb-4">DP Table — each cell shows dp[i]</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: n + 1 }, (_, i) => {
                const val = dp[i];
                const active = cur?.current === i;
                const filled = val !== null && val !== undefined;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 transition-all duration-300">
                    <div className="w-14 h-10 rounded-lg flex items-center justify-center font-bold text-sm border transition-all duration-300"
                      style={{ background: active ? "oklch(0.75 0.18 195/0.2)" : filled ? "oklch(0.75 0.18 195/0.08)" : "oklch(0.17 0.03 240)", borderColor: active ? CYAN : filled ? "oklch(0.75 0.18 195/0.4)" : BORDER, color: active ? CYAN : filled ? "white" : "rgb(100 116 139)" }}>
                      {filled ? val : "?"}
                    </div>
                    <span className="text-[10px] text-slate-600">dp[{i}]</span>
                  </div>
                );
              })}
            </div>
            {cur && dp[n] !== null && dp[n] !== undefined && (
              <div className="mt-4 p-3 rounded-lg border text-center" style={{ background: "oklch(0.75 0.18 195/0.08)", borderColor: "oklch(0.75 0.18 195/0.3)" }}>
                <span className="text-slate-400 text-sm">fib({n}) = </span>
                <span className="font-bold text-xl" style={{ color: CYAN }}>{dp[n]}</span>
              </div>
            )}
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
