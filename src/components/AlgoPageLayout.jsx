import { useState, memo } from "react";
import { NavLink } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Sidebar, TopBar } from "./Sidebar";

const CYAN = "oklch(0.75 0.18 195)";

const COMPLEXITY_COLORS = {
  "O(1)":        { bg: "oklch(0.2 0.12 145 / 0.2)", border: "oklch(0.55 0.15 145)", text: "oklch(0.75 0.15 145)" },
  "O(log n)":    { bg: "oklch(0.2 0.12 195 / 0.2)", border: "oklch(0.55 0.18 195)", text: "oklch(0.75 0.18 195)" },
  "O(n)":        { bg: "oklch(0.2 0.10 230 / 0.2)", border: "oklch(0.55 0.12 230)", text: "oklch(0.72 0.12 230)" },
  "O(n log n)":  { bg: "oklch(0.22 0.10 60 / 0.2)",  border: "oklch(0.6 0.15 60)",   text: "oklch(0.8 0.15 60)" },
  "O(n²)":       { bg: "oklch(0.22 0.10 30 / 0.2)",  border: "oklch(0.6 0.18 30)",   text: "oklch(0.78 0.18 30)" },
  "O(V+E)":      { bg: "oklch(0.2 0.10 280 / 0.2)",  border: "oklch(0.55 0.15 280)", text: "oklch(0.72 0.15 280)" },
  "O(V²)":       { bg: "oklch(0.22 0.10 30 / 0.2)",  border: "oklch(0.6 0.18 30)",   text: "oklch(0.78 0.18 30)" },
  "O(VE)":       { bg: "oklch(0.22 0.10 30 / 0.2)",  border: "oklch(0.6 0.18 30)",   text: "oklch(0.78 0.18 30)" },
};

function ComplexityBadge({ label, value }) {
  const c = COMPLEXITY_COLORS[value] || COMPLEXITY_COLORS["O(n)"];
  return (
    <div className="flex flex-col items-center px-3 py-1.5 rounded-lg border text-center"
      style={{ background: c.bg, borderColor: c.border }}>
      <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold font-mono" style={{ color: c.text }}>{value}</span>
    </div>
  );
}

export const AlgoPageLayout = memo(function AlgoPageLayout({
  title,
  category,
  categoryHref,
  timeComplexity,
  spaceComplexity,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "oklch(0.1 0.02 240)" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(true)} />

      {/* Main scrollable area */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {/* Page header */}
        <div className="sticky top-0 z-20 border-b px-6 py-3 flex items-center justify-between"
          style={{ background: "oklch(0.1 0.02 240 / 0.95)", borderColor: "oklch(0.2 0.04 240)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <NavLink to={categoryHref}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
              <ChevronLeft className="w-3.5 h-3.5" />
              {category}
            </NavLink>
            <span className="text-slate-700">/</span>
            <h1 className="text-sm font-semibold text-white truncate">{title}</h1>
          </div>

          {/* Complexity badges */}
          {(timeComplexity || spaceComplexity) && (
            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
              {timeComplexity && <ComplexityBadge label="Time" value={timeComplexity} />}
              {spaceComplexity && <ComplexityBadge label="Space" value={spaceComplexity} />}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
});

export default AlgoPageLayout;
