import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Play, ArrowRight, Layers, RotateCcw, Code2, GitBranch, Network, Zap, Search, Database, Type } from "lucide-react";
import { Sidebar, TopBar } from "../../components/Sidebar";
import AppLogo from "../../components/Logo";
import { navLinks } from "../../assets/data/navLinks";
import SEO from "../../components/SEO";

const CYAN = "oklch(0.75 0.18 195)";
const BG   = "oklch(0.1 0.02 240)";
const SURF = "oklch(0.13 0.025 240)";
const BDR  = "oklch(0.22 0.04 240)";

const ICONS = {
  "Array & LinkedList": <Layers className="w-5 h-5" />,
  Recursion:            <RotateCcw className="w-5 h-5" />,
  "Stack & Queue":      <Code2 className="w-5 h-5" />,
  Sorting:              <Zap className="w-5 h-5" />,
  Searching:            <Search className="w-5 h-5" />,
  Tree:                 <GitBranch className="w-5 h-5" />,
  Graph:                <Network className="w-5 h-5" />,
  "Dynamic Programming":<Database className="w-5 h-5" />,
  String:               <Type className="w-5 h-5" />,
  Greedy:               <Zap className="w-5 h-5" />,
  Backtracking:         <RotateCcw className="w-5 h-5" />,
};

const FEATURES = [
  { icon: "🎬", title: "Live Animations",    desc: "Watch every step play out visually in real time." },
  { icon: "✏️", title: "Custom Input",       desc: "Enter your own arrays or values." },
  { icon: "💡", title: "Live Explanation",   desc: "Step-by-step English synced to animation." },
  { icon: "🖥️", title: "Code Highlight",    desc: "Exact executing line highlighted live." },
  { icon: "🔀", title: "Pseudo ↔ Code",     desc: "Toggle between pseudocode and Python/JS/C++." },
  { icon: "⏱️", title: "Complexity Badges", desc: "Time & Space shown for every algorithm." },
];

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const totalAlgos = navLinks.reduce((a, c) => a + c.dropdownElements.length, 0);

  return (
    <>
      <SEO data={{ title: "AlgoFlow — Visualize DSA", description: "Interactive DSA visualizations with live code highlighting, pseudocode toggle, custom inputs, and real-time explanations." }} />
      <div className="flex h-screen overflow-hidden" style={{ background: BG }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
          {/* Hero */}
          <section className="relative overflow-hidden px-8 pt-16 pb-14">
            <div className="absolute inset-0 opacity-[0.025]"
              style={{ backgroundImage: "linear-gradient(oklch(0.75 0.18 195) 1px,transparent 1px),linear-gradient(90deg,oklch(0.75 0.18 195) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none" style={{ background: CYAN }} />

            <div className="relative max-w-3xl">
              <div className="flex items-center gap-4 mb-6">
                <AppLogo width={64} height={64} />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 border"
                style={{ background: "oklch(0.75 0.18 195/0.08)", borderColor: "oklch(0.75 0.18 195/0.25)", color: CYAN }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background: CYAN }} />
                {totalAlgos} Interactive Visualizations
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-white">
                Learn Algorithms<br />
                <span className="gradient-text-cyan">Step by Step</span>
              </h1>
              <p className="text-slate-400 text-lg mb-8 max-w-xl leading-relaxed">
                Animated DSA visualizations with live code highlighting, pseudocode toggle,
                custom inputs, and real-time explanations.
              </p>
              <div className="flex gap-3 flex-wrap">
                <NavLink to="/array-linkedlist/binary-search"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                  <Play className="w-4 h-4" /> Try Binary Search
                </NavLink>
                <NavLink to="/dp/lcs"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border text-slate-300 transition-all hover:text-white"
                  style={{ borderColor: BDR, background: SURF }}>
                  Try LCS <ArrowRight className="w-4 h-4" />
                </NavLink>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="px-8 pb-10">
            <h2 className="text-lg font-bold text-white mb-4">What's in AlgoFlow</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
              {FEATURES.map(f => (
                <div key={f.title} className="rounded-xl border p-4" style={{ background: SURF, borderColor: BDR }}>
                  <div className="text-xl mb-2">{f.icon}</div>
                  <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Browse */}
            <h2 className="text-lg font-bold text-white mb-4">Browse Algorithms</h2>
            <div className="space-y-6 mb-16">
              {navLinks.map(cat => (
                <div key={cat._id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span style={{ color: CYAN }}>{ICONS[cat.title]}</span>
                      <h3 className="text-sm font-semibold text-slate-300">{cat.title}</h3>
                      <span className="text-xs text-slate-600">({cat.dropdownElements.length})</span>
                    </div>
                    <NavLink to={cat.hrefPrefix} className="text-xs flex items-center gap-1 transition-colors hover:underline" style={{ color: CYAN }}>
                      All <ArrowRight className="w-3 h-3" />
                    </NavLink>
                  </div>
                  {cat.dropdownElements.length === 0 ? (
                    <p className="text-xs text-slate-600 border border-dashed rounded-lg px-4 py-3" style={{ borderColor: BDR }}>Coming soon…</p>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {cat.dropdownElements.map(algo => (
                        <NavLink key={algo.href} to={`${cat.hrefPrefix}${algo.href}`}
                          className="group flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-slate-400 hover:text-white transition-all"
                          style={{ background: SURF, borderColor: BDR }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = "oklch(0.75 0.18 195/0.4)"; e.currentTarget.style.color = "white"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = BDR; e.currentTarget.style.color = ""; }}>
                          <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" style={{ color: CYAN }} />
                          {algo.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* About */}
          <section className="px-8 py-14 border-t" style={{ borderColor: BDR, background: SURF }}>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-5">About This Project</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                If you love to visualize algorithms and learn intuitively then you are in the right place.
                AlgoFlow features animations of beautiful algorithms related to Data Structures and Algorithms.
                I hope these help you grasp things better!
              </p>
              <p className="text-slate-400 leading-relaxed mb-6">
                Of course, the world of algorithms is vast and fascinating — far beyond what one person can animate alone.
                So if you're enthusiastic, consider contributing and help make this an even better resource for everyone.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {["React","JavaScript","Tailwind CSS","Data Visualization"].map(t => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full border text-slate-300"
                    style={{ background: "oklch(0.17 0.03 240)", borderColor: BDR }}>{t}</span>
                ))}
              </div>

              {/* Code window */}
              <div className="rounded-2xl border overflow-hidden mb-14" style={{ background: "oklch(0.1 0.02 240)", borderColor: BDR }}>
                <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ borderColor: BDR, background: "oklch(0.13 0.025 240)" }}>
                  <span className="w-3 h-3 rounded-full bg-red-500/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <span className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="ml-3 text-xs text-slate-500 font-mono">quickSort.js</span>
                </div>
                <pre className="p-5 text-sm font-mono leading-7 overflow-x-auto">
                  <span style={{ color: CYAN }}>function </span>
                  <span className="text-white">quickSort</span>
                  <span className="text-yellow-300">(arr)</span>
                  <span className="text-slate-400">{"{"}</span>{"\n"}
                  <span className="text-slate-400">  </span>
                  <span style={{ color: CYAN }}>if </span>
                  <span className="text-slate-400">(arr.length {"<="} 1) </span>
                  <span style={{ color: CYAN }}>return </span>
                  <span className="text-slate-400">arr;</span>{"\n"}
                  <span className="text-slate-400">  </span>
                  <span style={{ color: CYAN }}>const </span>
                  <span className="text-white">pivot </span>
                  <span className="text-slate-400">= arr[0];</span>{"\n"}
                  <span className="text-slate-500">  {"// ... algorithm steps"}</span>{"\n"}
                  <span className="text-slate-400">{"}"}</span>
                </pre>
              </div>

              {/* Get In Touch */}
              <h2 className="text-3xl font-bold text-white mb-3 text-center">Get In Touch</h2>
              <p className="text-slate-400 text-center mb-8 leading-relaxed">
                Have questions, suggestions, or want to contribute? I'd love to hear from you.<br />
                Let's connect and make learning algorithms even better together.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="mailto:souravgiri.dev@gmail.com"
                  className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl border font-semibold text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: "oklch(0.15 0.03 240)", borderColor: BDR, color: "rgb(203 213 225)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = CYAN; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BDR; e.currentTarget.style.color = "rgb(203 213 225)"; }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </a>
                <a href="https://github.com/SouravGiri-007" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl border font-semibold text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: "oklch(0.15 0.03 240)", borderColor: BDR, color: "rgb(203 213 225)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = CYAN; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BDR; e.currentTarget.style.color = "rgb(203 213 225)"; }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
                <a href="https://www.linkedin.com/in/sourav-giri-aa239b284/" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl border font-semibold text-sm transition-all hover:-translate-y-0.5"
                  style={{ background: "oklch(0.15 0.03 240)", borderColor: BDR, color: "rgb(203 213 225)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = CYAN; e.currentTarget.style.color = "white"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BDR; e.currentTarget.style.color = "rgb(203 213 225)"; }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
