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
  pseudo: `COIN-CHANGE(coins, amount):
  dp[0] = 0
  for i = 1 to amount:
    dp[i] = Infinity
    for each coin in coins:
      if coin <= i:
        dp[i] = min(dp[i], dp[i-coin] + 1)
  return dp[amount]`,
  python: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i],
                            dp[i - coin] + 1)
    return dp[amount] if dp[amount] != inf else -1`,
  javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
  cpp: `int coinChange(vector<int>& coins, int amount) {
  vector<int> dp(amount+1, INT_MAX);
  dp[0] = 0;
  for (int i = 1; i <= amount; i++)
    for (int c : coins)
      if (c <= i && dp[i-c] != INT_MAX)
        dp[i] = min(dp[i], dp[i-c] + 1);
  return dp[amount] == INT_MAX ? -1 : dp[amount];
}`,
};

function buildSteps(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  const steps = [];
  steps.push({ dp: [...dp], active: null, coin: null, line: 1, explanation: `Coin Change: find min coins to make ${amount}. Coins: [${coins.join(", ")}]. dp[0]=0, rest=∞.` });
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        steps.push({ dp: [...dp], active: i, coin, line: 5, explanation: `Amount ${i}: trying coin ${coin}. dp[${i}-${coin}]=dp[${i-coin}]=${dp[i-coin] === Infinity ? "∞" : dp[i-coin]}.` });
        if (dp[i - coin] !== Infinity && dp[i - coin] + 1 < dp[i]) {
          dp[i] = dp[i - coin] + 1;
          steps.push({ dp: [...dp], active: i, coin, line: 6, explanation: `✅ Updated! dp[${i}] = dp[${i-coin}]+1 = ${dp[i]}. (use coin ${coin})` });
        }
      }
    }
  }
  const ans = dp[amount];
  steps.push({ dp: [...dp], active: amount, coin: null, line: 7, explanation: ans === Infinity ? `❌ Cannot make amount ${amount} with given coins.` : `✅ Minimum coins needed = ${ans}. dp[${amount}] = ${ans}.` });
  return steps;
}

export default function CoinChange() {
  const [coins, setCoins] = useState([1, 5, 6, 9]);
  const [amount, setAmount] = useState(11);
  const [coinsInput, setCoinsInput] = useState("1, 5, 6, 9");
  const [amountInput, setAmountInput] = useState("11");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => { clearInterval(timerRef.current); setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]); }, []);
  const applyCustom = () => {
    reset();
    const c = coinsInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    const a = parseInt(amountInput);
    if (c.length > 0 && !isNaN(a) && a > 0 && a <= 30) { setCoins(c); setAmount(a); }
  };
  const runSteps = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0; clearInterval(timerRef.current);
    timerRef.current = setInterval(() => { idx++; if (idx >= s.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(s.length - 1); return; } setStepIdx(idx); }, speed);
  };
  const togglePlay = () => {
    if (!started) { runSteps(buildSteps(coins, amount)); return; }
    if (playing) { clearInterval(timerRef.current); setPlaying(false); }
    else { setPlaying(true); let idx = stepIdx; timerRef.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length - 1); return; } setStepIdx(idx); }, speed); }
  };

  const dp = cur?.dp || new Array(amount + 1).fill(Infinity);

  return (
    <>
      <SEO data={{ title: "Coin Change" }} />
      <AlgoPageLayout title="Coin Change" category="Dynamic Programming" categoryHref="/dp" timeComplexity="O(n·m)" spaceComplexity="O(n)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Custom Input</p>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Coins</label>
                  <input value={coinsInput} onChange={e => setCoinsInput(e.target.value)} placeholder="e.g. 1, 5, 6, 9"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
                <div className="w-28">
                  <label className="text-xs text-slate-500 mb-1 block">Amount (≤30)</label>
                  <input value={amountInput} onChange={e => setAmountInput(e.target.value)} type="number"
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
                <div className="flex items-end">
                  <button onClick={applyCustom} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>Apply</button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">DP Array — dp[i] = min coins to make amount i</p>
              <div className="flex flex-wrap gap-2">
                {dp.map((val, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border transition-all duration-200"
                      style={{
                        background: cur?.active === i ? "oklch(0.75 0.18 195/0.2)" : val === Infinity ? "oklch(0.15 0.03 240)" : "oklch(0.75 0.18 195/0.1)",
                        borderColor: cur?.active === i ? CYAN : val === Infinity ? BORDER : "oklch(0.75 0.18 195/0.3)",
                        color: cur?.active === i ? CYAN : val === Infinity ? "oklch(0.35 0.04 240)" : CYAN,
                      }}>
                      {val === Infinity ? "∞" : val}
                    </div>
                    <span className="text-[10px] text-slate-600">{i}</span>
                  </div>
                ))}
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
