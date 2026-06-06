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
  pseudo: `RABIN-KARP(text, pattern, q):
  m = len(pattern), n = len(text)
  compute hash of pattern: p_hash
  compute hash of text[0..m-1]: t_hash
  for i = 0 to n-m:
    if p_hash == t_hash:
      verify character by character
      if match: record i
    if i < n-m:
      update rolling hash for next window`,
  python: `def rabin_karp(text, pattern, q=101):
    d, m, n = 256, len(pattern), len(text)
    h = pow(d, m-1, q)
    p_hash = t_hash = 0
    matches = []
    for i in range(m):
        p_hash = (d*p_hash + ord(pattern[i])) % q
        t_hash = (d*t_hash + ord(text[i])) % q
    for i in range(n - m + 1):
        if p_hash == t_hash:
            if text[i:i+m] == pattern:
                matches.append(i)
        if i < n - m:
            t_hash = (d*(t_hash - ord(text[i])*h)
                     + ord(text[i+m])) % q
            if t_hash < 0: t_hash += q
    return matches`,
  javascript: `function rabinKarp(text, pattern, q=101) {
  const d=256, m=pattern.length, n=text.length;
  let h=1, pH=0, tH=0, matches=[];
  for (let i=0; i<m-1; i++) h=(h*d)%q;
  for (let i=0; i<m; i++) {
    pH=(d*pH+pattern.charCodeAt(i))%q;
    tH=(d*tH+text.charCodeAt(i))%q;
  }
  for (let i=0; i<=n-m; i++) {
    if (pH===tH && text.slice(i,i+m)===pattern)
      matches.push(i);
    if (i<n-m) {
      tH=(d*(tH-text.charCodeAt(i)*h)+text.charCodeAt(i+m))%q;
      if (tH<0) tH+=q;
    }
  }
  return matches;
}`,
  cpp: `vector<int> rabinKarp(string txt, string pat, int q=101) {
  int d=256, m=pat.size(), n=txt.size();
  int h=1, pH=0, tH=0;
  vector<int> res;
  for (int i=0; i<m-1; i++) h=(h*d)%q;
  for (int i=0; i<m; i++) {
    pH=(d*pH+pat[i])%q;
    tH=(d*tH+txt[i])%q;
  }
  for (int i=0; i<=n-m; i++) {
    if (pH==tH && txt.substr(i,m)==pat) res.push_back(i);
    if (i<n-m) {
      tH=(d*(tH-txt[i]*h)+txt[i+m])%q;
      if (tH<0) tH+=q;
    }
  }
  return res;
}`,
};

function buildSteps(text, pattern, q = 101) {
  const d = 256;
  const m = pattern.length, n = text.length;
  const steps = [];
  let h = 1;
  for (let i = 0; i < m - 1; i++) h = (h * d) % q;
  let pH = 0, tH = 0;
  for (let i = 0; i < m; i++) {
    pH = (d * pH + pattern.charCodeAt(i)) % q;
    tH = (d * tH + text.charCodeAt(i)) % q;
  }
  steps.push({ window: 0, tH, pH, matches: [], spurious: false, line: 3, explanation: `Rabin-Karp: text="${text}", pattern="${pattern}". Pattern hash=${pH}. Initial window hash=${tH}. Modulus q=${q}.` });

  const matches = [];
  for (let i = 0; i <= n - m; i++) {
    const windowText = text.slice(i, i + m);
    if (pH === tH) {
      if (windowText === pattern) {
        matches.push(i);
        steps.push({ window: i, tH, pH, matches: [...matches], spurious: false, line: 6, explanation: `✅ Hash match AND character match at index ${i}! Pattern found.` });
      } else {
        steps.push({ window: i, tH, pH, matches: [...matches], spurious: true, line: 6, explanation: `⚠️ Spurious hit! Hash=${tH} matches but "${windowText}" ≠ "${pattern}". Verify by character comparison.` });
      }
    } else {
      steps.push({ window: i, tH, pH, matches: [...matches], spurious: false, line: 8, explanation: `Window "${windowText}" hash=${tH} ≠ pattern hash=${pH}. Skip.` });
    }
    if (i < n - m) {
      tH = (d * (tH - text.charCodeAt(i) * h) + text.charCodeAt(i + m)) % q;
      if (tH < 0) tH += q;
      steps.push({ window: i + 1, tH, pH, matches: [...matches], spurious: false, line: 8, explanation: `Rolling hash: remove '${text[i]}', add '${text[i + m]}'. New window hash=${tH}.` });
    }
  }
  steps.push({ window: null, tH, pH, matches: [...matches], line: 9, explanation: matches.length > 0 ? `✅ Complete! Found ${matches.length} match(es) at: [${matches.join(", ")}].` : `❌ Pattern not found in text.` });
  return steps;
}

export default function RabinKarp() {
  const [text, setText] = useState("GEEKS FOR GEEKS");
  const [pattern, setPattern] = useState("GEEK");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
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
    if (!started) { runSteps(buildSteps(text.toUpperCase(), pattern.toUpperCase())); return; }
    if (playing) { clearInterval(timerRef.current); setPlaying(false); }
    else { setPlaying(true); let idx = stepIdx; timerRef.current = setInterval(() => { idx++; if (idx >= steps.length) { clearInterval(timerRef.current); setPlaying(false); setStepIdx(steps.length - 1); return; } setStepIdx(idx); }, speed); }
  };

  const tu = text.toUpperCase(), pu = pattern.toUpperCase();
  const window = cur?.window ?? null;

  return (
    <>
      <SEO data={{ title: "Rabin-Karp" }} />
      <AlgoPageLayout title="Rabin-Karp Algorithm" category="String" categoryHref="/string" timeComplexity="O(n+m)" spaceComplexity="O(1)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Text</label>
                  <input value={text} onChange={e => { reset(); setText(e.target.value.toUpperCase().slice(0, 25)); }}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none font-mono"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Pattern</label>
                  <input value={pattern} onChange={e => { reset(); setPattern(e.target.value.toUpperCase().slice(0, 8)); }}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none font-mono"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex gap-3 mb-4 text-xs">
                {cur && <>
                  <span className="px-2 py-1 rounded" style={{ background: "oklch(0.75 0.18 195/0.12)", color: CYAN }}>Pattern hash: {cur.pH}</span>
                  <span className="px-2 py-1 rounded" style={{ background: cur.spurious ? "oklch(0.65 0.18 30/0.15)" : "oklch(0.75 0.18 195/0.08)", color: cur.spurious ? "oklch(0.75 0.18 30)" : "rgb(148 163 184)" }}>Window hash: {cur.tH}</span>
                </>}
              </div>
              <div className="flex flex-wrap gap-1">
                {tu.split("").map((ch, i) => {
                  const inWindow = window !== null && i >= window && i < window + pu.length;
                  const isMatch = cur?.matches?.some(m => i >= m && i < m + pu.length);
                  const isSpurious = cur?.spurious && inWindow;
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm border transition-all"
                        style={{
                          background: isMatch ? "oklch(0.18 0.12 145/0.3)" : isSpurious ? "oklch(0.22 0.12 30/0.3)" : inWindow ? "oklch(0.75 0.18 195/0.15)" : "oklch(0.17 0.03 240)",
                          borderColor: isMatch ? "oklch(0.55 0.18 145)" : isSpurious ? "oklch(0.65 0.18 30)" : inWindow ? CYAN : BORDER,
                          color: isMatch ? "oklch(0.75 0.18 145)" : inWindow ? CYAN : "white",
                        }}>{ch}</div>
                      <span className="text-[9px] text-slate-600">{i}</span>
                    </div>
                  );
                })}
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
