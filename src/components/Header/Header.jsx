import { useState, memo } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, Layers, RotateCcw, Code2, GitBranch, Network, Zap } from "lucide-react";
import AppLogo from "../Logo";
import { navLinks } from "../../assets/data/navLinks";

const ICONS = {
  "Array & LinkedList": <Layers className="w-3.5 h-3.5" />,
  Recursion: <RotateCcw className="w-3.5 h-3.5" />,
  "Stack & Queue": <Code2 className="w-3.5 h-3.5" />,
  Tree: <GitBranch className="w-3.5 h-3.5" />,
  Graph: <Network className="w-3.5 h-3.5" />,
  Greedy: <Zap className="w-3.5 h-3.5" />,
  Backtracking: <RotateCcw className="w-3.5 h-3.5" />,
};

export const AlgoFlowHeader = memo(function AlgoFlowHeader({ abs = true }) {
  const [openIdx, setOpenIdx] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={`${abs ? "absolute" : "fixed"} top-0 left-0 right-0 z-50 w-full
        border-b border-[oklch(0.25_0.04_240)]`}
      style={{ background: "oklch(0.1 0.02 240 / 0.95)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-5">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <AppLogo width={32} height={32} />
          <span className="font-bold text-lg tracking-tight text-white group-hover:text-[oklch(0.75_0.18_195)] transition-colors">
            Algo<span style={{ color: "oklch(0.75 0.18 195)" }}>Flow</span>
          </span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => setOpenIdx(i)}
              onMouseLeave={() => setOpenIdx(null)}
            >
              <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-md hover:bg-[oklch(0.18_0.03_240)] transition-all duration-150">
                <span style={{ color: openIdx === i ? "oklch(0.75 0.18 195)" : undefined }}>
                  {ICONS[link.title]}
                </span>
                {link.title}
                {link.dropdownElements.length > 0 && (
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`} />
                )}
              </button>

              {openIdx === i && link.dropdownElements.length > 0 && (
                <div
                  className="absolute top-[calc(100%+4px)] min-w-[340px] rounded-xl border shadow-2xl overflow-hidden z-50"
                  style={{
                    background: "oklch(0.13 0.025 240)",
                    borderColor: "oklch(0.25 0.04 240)",
                    left: i > 3 ? "auto" : 0,
                    right: i > 3 ? 0 : "auto",
                    boxShadow: "0 20px 60px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.75 0.18 195 / 0.1)",
                  }}
                >
                  {/* Header strip */}
                  <div className="px-4 py-3 border-b flex items-center gap-2"
                    style={{ borderColor: "oklch(0.2 0.04 240)", background: "oklch(0.15 0.03 240)" }}>
                    <span style={{ color: "oklch(0.75 0.18 195)" }}>{ICONS[link.title]}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{link.title}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-2">
                    {link.dropdownElements.map((item, j) => (
                      <NavLink
                        key={j}
                        to={`${link.hrefPrefix}${item.href}`}
                        onClick={() => setOpenIdx(null)}
                        className="flex flex-col gap-0.5 px-3 py-2.5 rounded-lg hover:bg-[oklch(0.2_0.04_240)] transition-all group"
                      >
                        <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                          {item.title}
                        </span>
                        <span className="text-xs text-slate-500 group-hover:text-[oklch(0.75_0.18_195)] transition-colors">
                          Interactive animation
                        </span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[oklch(0.18_0.03_240)] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ background: "oklch(0.12 0.025 240)", borderColor: "oklch(0.2 0.04 240)" }}>
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer
                  text-slate-300 hover:text-white hover:bg-[oklch(0.18_0.03_240)] transition-colors text-sm font-medium list-none">
                  <div className="flex items-center gap-2">
                    <span style={{ color: "oklch(0.75 0.18 195)" }}>{ICONS[link.title]}</span>
                    {link.title}
                  </div>
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="ml-6 mt-1 space-y-0.5">
                  {link.dropdownElements.map((item, j) => (
                    <NavLink
                      key={j}
                      to={`${link.hrefPrefix}${item.href}`}
                      onClick={() => setMobileOpen(false)}
                      className="block py-2 px-3 text-sm text-slate-400 hover:text-white hover:bg-[oklch(0.18_0.03_240)] rounded-md transition-all"
                    >
                      {item.title}
                    </NavLink>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </header>
  );
});

export default AlgoFlowHeader;
