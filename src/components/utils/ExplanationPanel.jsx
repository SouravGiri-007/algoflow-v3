import { memo } from "react";
import { MessageSquare } from "lucide-react";

const CYAN = "oklch(0.75 0.18 195)";

export const ExplanationPanel = memo(function ExplanationPanel({ steps, currentStep, totalSteps }) {
  const msg = steps?.[currentStep] || "Press Play to start the animation.";

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

      {/* Message */}
      <div className="p-4 flex-1">
        <p className="text-sm text-slate-200 leading-relaxed animate-fade-in" key={currentStep}>
          {msg}
        </p>
      </div>
    </div>
  );
});

export default ExplanationPanel;
