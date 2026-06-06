import { useEffect, useRef, memo, useState } from "react";

const CYAN = "oklch(0.75 0.18 195)";

const LANGS = ["python", "javascript", "cpp"];

export const CodePanel = memo(function CodePanel({ codes, highlightLine, language: defaultLang = "python" }) {
  const [lang, setLang] = useState(defaultLang);
  const [mode, setMode] = useState("code"); // "code" | "pseudo"
  const activeRef = useRef(null);

  // codes shape: { python, javascript, cpp, pseudo }
  // If codes is a plain string (legacy), wrap it
  const codeMap = codes ? (typeof codes === "string" ? { python: codes, javascript: codes, cpp: codes, pseudo: codes } : codes) : { python: "", javascript: "", cpp: "", pseudo: "" };
  const displayCode = mode === "pseudo" ? (codeMap.pseudo || codeMap.python) : (codeMap[lang] || codeMap.python);
  const lines = displayCode.split("\n");

  useEffect(() => {
    if (activeRef.current) activeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightLine]);

  return (
    <div className="rounded-xl border overflow-hidden h-full flex flex-col"
      style={{ background: "oklch(0.09 0.018 240)", borderColor: "oklch(0.2 0.04 240)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0 flex-wrap"
        style={{ borderColor: "oklch(0.18 0.03 240)", background: "oklch(0.12 0.025 240)" }}>
        {/* traffic lights */}
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 flex-shrink-0" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60 flex-shrink-0" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60 flex-shrink-0" />

        {/* Pseudo toggle */}
        <button onClick={() => setMode(m => m === "pseudo" ? "code" : "pseudo")}
          className="ml-2 text-xs px-2 py-0.5 rounded-full border transition-all"
          style={{
            background: mode === "pseudo" ? "oklch(0.75 0.18 195 / 0.15)" : "transparent",
            borderColor: mode === "pseudo" ? CYAN : "oklch(0.28 0.05 240)",
            color: mode === "pseudo" ? CYAN : "rgb(100 116 139)",
          }}>
          {mode === "pseudo" ? "Pseudocode" : "Code"}
        </button>

        {/* Language tabs — only show when in code mode */}
        {mode === "code" && (
          <div className="flex gap-1 ml-auto">
            {LANGS.map(l => (
              <button key={l} onClick={() => setLang(l)}
                className="text-xs px-2 py-0.5 rounded transition-all"
                style={{
                  background: lang === l ? "oklch(0.75 0.18 195 / 0.15)" : "transparent",
                  color: lang === l ? CYAN : "rgb(100 116 139)",
                }}>
                {l === "cpp" ? "C++" : l === "javascript" ? "JS" : "Python"}
              </button>
            ))}
          </div>
        )}

        {highlightLine != null && (
          <span className="text-xs px-2 py-0.5 rounded-full font-mono ml-auto"
            style={{ background: "oklch(0.75 0.18 195 / 0.15)", color: CYAN }}>
            line {highlightLine + 1}
          </span>
        )}
      </div>

      {/* Lines */}
      <div className="overflow-y-auto flex-1 p-2 scrollbar-hide">
        <div className="font-mono text-xs leading-6">
          {lines.map((line, i) => {
            const active = highlightLine === i;
            return (
              <div key={i} ref={active ? activeRef : null}
                className="flex items-start gap-3 px-2 rounded-md transition-all duration-200"
                style={{
                  background: active ? "oklch(0.75 0.18 195 / 0.12)" : "transparent",
                  borderLeft: active ? `2px solid ${CYAN}` : "2px solid transparent",
                }}>
                <span className="select-none w-6 text-right flex-shrink-0"
                  style={{ color: active ? CYAN : "oklch(0.35 0.04 240)" }}>{i + 1}</span>
                <span className="flex-1 whitespace-pre"
                  style={{ color: active ? "#fff" : "oklch(0.65 0.04 230)" }}>{line || " "}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default CodePanel;
