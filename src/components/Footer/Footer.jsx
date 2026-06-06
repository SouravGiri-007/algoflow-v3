import { NavLink } from "react-router-dom";
import AppLogo from "../Logo";

export default function Footer() {
  return (
    <footer className="border-t mt-10" style={{ borderColor: "oklch(0.2 0.04 240)", background: "oklch(0.1 0.02 240)" }}>
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AppLogo width={28} height={28} />
            <span className="font-bold text-white">
              Algo<span style={{ color: "oklch(0.75 0.18 195)" }}>Flow</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            Interactive algorithm visualizations to help you understand DSA concepts intuitively.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Topics</h4>
          <div className="grid grid-cols-2 gap-1">
            {["Array & LinkedList", "Recursion", "Stack & Queue", "Tree", "Graph", "Backtracking"].map(t => (
              <span key={t} className="text-sm text-slate-400">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Built with</h4>
          <div className="flex flex-wrap gap-2">
            {["React", "Vite", "Tailwind CSS", "Lucide"].map(t => (
              <span key={t} className="text-xs px-2 py-1 rounded-full text-slate-400"
                style={{ background: "oklch(0.17 0.03 240)", border: "1px solid oklch(0.25 0.04 240)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: "oklch(0.17 0.03 240)" }}>
        <p className="max-w-7xl mx-auto px-6 py-4 text-xs text-slate-600 text-center">
          © {new Date().getFullYear()} AlgoFlow. Made for learners, by learners.
        </p>
      </div>
    </footer>
  );
}
