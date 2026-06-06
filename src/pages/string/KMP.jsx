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
  pseudo: `KMP-SEARCH(text, pattern):
  lps = computeLPS(pattern)
  i = 0 (text index), j = 0 (pattern index)
  while i < len(text):
    if text[i] == pattern[j]: i++, j++
    if j == len(pattern):
      record match at i - j
      j = lps[j-1]
    elif i < len(text) and text[i] != pattern[j]:
      if j != 0: j = lps[j-1]
      else: i++`,
  python: `def kmp_search(text, pattern):
    m, n = len(pattern), len(text)
    lps = compute_lps(pattern)
    i = j = 0
    matches = []
    while i < n:
        if text[i] == pattern[j]:
            i += 1; j += 1
        if j == m:
            matches.append(i - j)
            j = lps[j - 1]
        elif i < n and text[i] != pattern[j]:
            j = lps[j-1] if j != 0 else 0
            if j == 0: i += 1
    return matches

def compute_lps(pattern):
    m = len(pattern)
    lps = [0] * m
    length = 0; i = 1
    while i < m:
        if pattern[i] == pattern[length]:
            length += 1; lps[i] = length; i += 1
        elif length != 0:
            length = lps[length - 1]
        else:
            lps[i] = 0; i += 1
    return lps`,
  javascript: `function kmpSearch(text, pattern) {
  const lps = computeLPS(pattern);
  const matches = [];
  let i = 0, j = 0;
  while (i < text.length) {
    if (text[i] === pattern[j]) { i++; j++; }
    if (j === pattern.length) {
      matches.push(i - j);
      j = lps[j - 1];
    } else if (i < text.length && text[i] !== pattern[j]) {
      j = j !== 0 ? lps[j - 1] : 0;
      if (j === 0) i++;
    }
  }
  return matches;
}`,
  cpp: `vector<int> kmpSearch(string text, string pat) {
  vector<int> lps = computeLPS(pat);
  vector<int> matches;
  int i = 0, j = 0;
  while (i < text.size()) {
    if (text[i] == pat[j]) { i++; j++; }
    if (j == pat.size()) {
      matches.push_back(i - j);
      j = lps[j - 1];
    } else if (i < text.size() && text[i] != pat[j]) {
      j = j ? lps[j-1] : 0;
      if (!j) i++;
    }
  }
  return matches;
}`,
};

function computeLPS(pattern) {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0, i = 1;
  while (i < m) {
    if (pattern[i] === pattern[len]) { len++; lps[i] = len; i++; }
    else if (len !== 0) { len = lps[len - 1]; }
    else { lps[i] = 0; i++; }
  }
  return lps;
}

function buildSteps(text, pattern) {
  const steps = [];
  const lps = computeLPS(pattern);
  const matches = [];
  let i = 0, j = 0;
  const n = text.length, m = pattern.length;

  steps.push({ i, j, matches: [], lps, line: 1, explanation: `KMP Search: text="${text}", pattern="${pattern}". LPS array = [${lps.join(",")}]. i=text pointer, j=pattern pointer.` });

  while (i < n) {
    steps.push({ i, j, matches: [...matches], lps, line: 4, explanation: `Comparing text[${i}]='${text[i]}' with pattern[${j}]='${pattern[j]}'.` });
    if (text[i] === pattern[j]) {
      i++; j++;
      steps.push({ i, j, matches: [...matches], lps, line: 4, explanation: `Match! Moving both pointers. i=${i}, j=${j}.` });
    }
    if (j === m) {
      matches.push(i - j);
      steps.push({ i, j, matches: [...matches], lps, line: 6, explanation: `✅ Pattern found at index ${i - j}! Using LPS: j jumps from ${j} to ${lps[j-1]}.` });
      j = lps[j - 1];
    } else if (i < n && text[i] !== pattern[j]) {
      if (j !== 0) {
        steps.push({ i, j, matches: [...matches], lps, line: 9, explanation: `Mismatch. j=${j} ≠ 0, so j = lps[${j-1}] = ${lps[j-1]}. Avoid redundant comparisons.` });
        j = lps[j - 1];
      } else {
        steps.push({ i, j, matches: [...matches], lps, line: 10, explanation: `Mismatch and j=0. No fallback. Advance i.` });
        i++;
      }
    }
  }
  steps.push({ i, j, matches: [...matches], lps, line: 11, explanation: matches.length > 0 ? `✅ Done! Pattern found ${matches.length} time(s) at index(es): ${matches.join(", ")}.` : `❌ Pattern not found in text.` });
  return steps;
}

export default function KMP() {
  const [text, setText] = useState("AABAACAADAABAABA");
  const [pattern, setPattern] = useState("AABA");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
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
  const lps = computeLPS(pu);

  return (
    <>
      <SEO data={{ title: "KMP Pattern Matching" }} />
      <AlgoPageLayout title="KMP Pattern Matching" category="String" categoryHref="/string" timeComplexity="O(n+m)" spaceComplexity="O(m)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Text</label>
                  <input value={text} onChange={e => { reset(); setText(e.target.value.toUpperCase().slice(0,30)); }}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none font-mono"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 mb-1 block">Pattern</label>
                  <input value={pattern} onChange={e => { reset(); setPattern(e.target.value.toUpperCase().slice(0,10)); }}
                    className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none font-mono"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={e => e.target.style.borderColor = CYAN} onBlur={e => e.target.style.borderColor = BORDER} />
                </div>
              </div>
            </div>

            {/* Text visualization */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Text</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {tu.split("").map((ch, i) => {
                  const isMatch = cur?.matches?.some(m => i >= m && i < m + pu.length);
                  const isI = cur?.i === i;
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm border transition-all"
                        style={{
                          background: isMatch ? "oklch(0.18 0.12 145/0.3)" : isI ? "oklch(0.75 0.18 195/0.15)" : "oklch(0.17 0.03 240)",
                          borderColor: isMatch ? "oklch(0.55 0.18 145)" : isI ? CYAN : BORDER,
                          color: isMatch ? "oklch(0.75 0.18 145)" : isI ? CYAN : "white",
                        }}>{ch}</div>
                      <span className="text-[9px] text-slate-600">{i}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pattern + LPS</p>
              <div className="flex gap-1">
                {pu.split("").map((ch, j) => (
                  <div key={j} className="flex flex-col items-center gap-0.5">
                    <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm border transition-all"
                      style={{
                        background: cur?.j === j ? "oklch(0.75 0.18 195/0.15)" : "oklch(0.17 0.03 240)",
                        borderColor: cur?.j === j ? CYAN : BORDER,
                        color: cur?.j === j ? CYAN : "white",
                      }}>{ch}</div>
                    <span className="text-[9px]" style={{ color: CYAN }}>{lps[j]}</span>
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
