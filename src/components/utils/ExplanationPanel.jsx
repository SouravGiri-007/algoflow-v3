import { memo, useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";


const CYAN = "oklch(0.75 0.18 195)";

export const ExplanationPanel = memo(function ExplanationPanel({ steps, currentStep, totalSteps }) {
  const msg = steps?.[currentStep] || "Press Play to start the animation.";

  const [showHistory, setShowHistory] = useState(false);
  const activeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (showHistory && activeRef.current && containerRef.current) {
      const container = containerRef.current;
      const line = activeRef.current;
      const containerRect = container.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();
      const offset = lineRect.top - containerRect.top - container.clientHeight / 2 + line.clientHeight / 2;
      container.scrollTo({ top: container.scrollTop + offset, behavior: "smooth" });
    }
  }, [currentStep, showHistory]);


  return (
    <div className="rounded-xl border flex flex-col overflow-hidden"
      style={{ background: "oklch(0.13 0.025 240)", borderColor: "oklch(0.22 0.04 240)" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0"
        style={{ borderColor: "oklch(0.2 0.04 240)", background: "oklch(0.15 0.03 240)" }}>
        <MessageSquare className="w-3.5 h-3.5" style={{ color: CYAN }} />
        <span className="text-xs font-semibold text-slate-300">Live Explanation</span>
        {totalSteps > 0 && (
          <span className="ml-auto text-xs text-slate-500">
            Step {currentStep + 1} / {totalSteps}
          </span>
        )}
      <button onClick={() => setShowHistory(!showHistory)}
      className="ml-auto text-xs px-2 py-0.5 rounded-full border transition-all"
      style={{
        background: showHistory ? "oklch(0.75 0.18 195 / 0.15)" : "transparent",
        borderColor: showHistory ? CYAN : "oklch(0.28 0.05 240)",
        color: showHistory ? CYAN : "rgb(100 116 139)",
      }}>
      {showHistory ? "Live" : "History"}
      </button>  
    </div>


      {/* Progress bar */}
      {totalSteps > 0 && (
        <div className="h-0.5 w-full" style={{ background: "oklch(0.2 0.04 240)" }}>
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
              background: `linear-gradient(90deg, ${CYAN}, oklch(0.65 0.2 210))`,
            }}
          />
        </div>
      )}

{/* Live mode */}
{!showHistory && (
  <div className="p-4 flex-1">
    <p className="text-sm text-slate-200 leading-relaxed" key={currentStep}>
      {msg}
    </p>
  </div>
)}

{/* History mode */}
{showHistory && (
  <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide" ref={containerRef}>
    {steps.map((step, i) => (
      <div key={i} className="flex gap-2 px-2 py-1.5 rounded-lg transition-all"
        ref={i === currentStep ? activeRef : null}
        style={{
          background: i === currentStep ? "oklch(0.75 0.18 195 / 0.1)" : "transparent",
          borderLeft: i === currentStep ? `2px solid ${CYAN}` : "2px solid transparent",
        }}>
        <span className="text-[10px] w-6 text-right flex-shrink-0 mt-0.5"
          style={{ color: i === currentStep ? CYAN : "oklch(0.35 0.04 240)" }}>
          {i + 1}
        </span>
        <span className="text-xs leading-relaxed"
          style={{ color: i === currentStep ? "#fff" : "oklch(0.5 0.04 230)" }}>
          {step}
        </span>
      </div>
    ))}
  </div>
)}
    </div>
  );
});

export default ExplanationPanel;