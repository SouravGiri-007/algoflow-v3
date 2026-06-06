import { useState, memo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Layers, RotateCcw, Code2, GitBranch, Network,
  Zap, ChevronDown, ChevronRight, X, Menu
} from "lucide-react";
import AppLogo from "./Logo";
import { navLinks } from "../assets/data/navLinks";

const CYAN = "oklch(0.75 0.18 195)";

const ICONS = {
  "Array & LinkedList": <Layers className="w-4 h-4" />,
  "Recursion":          <RotateCcw className="w-4 h-4" />,
  "Stack & Queue":      <Code2 className="w-4 h-4" />,
  "Sorting":            <ChevronDown className="w-4 h-4" />,
  "Tree":               <GitBranch className="w-4 h-4" />,
  "Graph":              <Network className="w-4 h-4" />,
  "Greedy":             <Zap className="w-4 h-4" />,
  "Backtracking":       <RotateCcw className="w-4 h-4" />,
};

function SidebarCategory({ link, defaultOpen }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(link.hrefPrefix);
  const [open, setOpen] = useState(defaultOpen || isActive);

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all"
        style={{
          color: isActive ? CYAN : "rgb(148 163 184)",
          background: isActive ? "oklch(0.75 0.18 195 / 0.08)" : "transparent",
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "oklch(0.18 0.03 240)"; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
      >
        <div className="flex items-center gap-2.5">
          <span style={{ color: isActive ? CYAN : "rgb(100 116 139)" }}>
            {ICONS[link.title]}
          </span>
          {link.title}
        </div>
        {link.dropdownElements.length > 0 && (
          open
            ? <ChevronDown className="w-3.5 h-3.5" />
            : <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>

      {open && link.dropdownElements.length > 0 && (
        <div className="ml-4 mt-0.5 border-l pl-3 space-y-0.5"
          style={{ borderColor: "oklch(0.22 0.04 240)" }}>
          {link.dropdownElements.map((item, j) => (
            <NavLink
              key={j}
              to={`${link.hrefPrefix}${item.href}`}
              className="block px-2 py-1.5 rounded-md text-sm transition-all"
              style={({ isActive }) => ({
                color: isActive ? CYAN : "rgb(148 163 184)",
                background: isActive ? "oklch(0.75 0.18 195 / 0.1)" : "transparent",
                fontWeight: isActive ? 600 : 400,
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.style.background.includes("0.1"))
                  e.currentTarget.style.background = "oklch(0.18 0.03 240)";
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.style.background.includes("0.1"))
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {item.title}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export const Sidebar = memo(function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay on mobile */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          width: 256,
          background: "oklch(0.11 0.022 240)",
          borderRight: "1px solid oklch(0.2 0.04 240)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 h-14 border-b flex-shrink-0"
          style={{ borderColor: "oklch(0.2 0.04 240)" }}>
          <NavLink to="/" className="flex items-center gap-2.5 group" onClick={onClose}>
            <AppLogo width={28} height={28} />
            <span className="font-bold text-white text-base">
              Algo<span style={{ color: CYAN }}>Flow</span>
            </span>
          </NavLink>
          <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 mb-2">
            Algorithms
          </p>
          {navLinks.map((link) => (
            <SidebarCategory key={link._id} link={link} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t flex-shrink-0" style={{ borderColor: "oklch(0.2 0.04 240)" }}>
          <p className="text-xs text-slate-600 text-center">AlgoFlow v3.0</p>
        </div>
      </aside>
    </>
  );
});

export function TopBar({ onMenuClick }) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4 border-b"
      style={{ background: "oklch(0.1 0.02 240 / 0.95)", borderColor: "oklch(0.2 0.04 240)", backdropFilter: "blur(12px)" }}>
      <button onClick={onMenuClick} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[oklch(0.18_0.03_240)] transition-colors">
        <Menu className="w-5 h-5" />
      </button>
      <NavLink to="/" className="flex items-center gap-2 ml-3">
        <AppLogo width={24} height={24} />
        <span className="font-bold text-white text-sm">
          Algo<span style={{ color: CYAN }}>Flow</span>
        </span>
      </NavLink>
    </header>
  );
}
