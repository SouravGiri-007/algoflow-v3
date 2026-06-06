import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Play } from "lucide-react";
import { Sidebar, TopBar } from "./Sidebar";
import SEO from "./SEO";
import { navLinks } from "../assets/data/navLinks";

const CYAN = "oklch(0.75 0.18 195)";
const BG   = "oklch(0.1 0.02 240)";
const SURF = "oklch(0.13 0.025 240)";
const BDR  = "oklch(0.22 0.04 240)";

export default function TopicsPage({ topicID }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const topic = navLinks.find(item => item._id === topicID);
  const subTopics = topic?.dropdownElements || [];

  return (
    <>
      <SEO data={{ title: topic?.title || "Topics" }} />
      <div className="flex h-screen overflow-hidden" style={{ background: BG }}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto pt-14 lg:pt-0 px-8 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: CYAN }}>
            AlgoFlow / {topic?.title}
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">{topic?.title}</h1>
          <p className="text-slate-400 mb-8">Select a visualization to begin learning interactively.</p>

          {subTopics.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-12 text-center" style={{ borderColor: BDR }}>
              <p className="text-slate-400">More visualizations coming soon…</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
              {subTopics.map(({ title, href }) => (
                <NavLink key={href} to={`${topic.hrefPrefix}${href}`}
                  className="group relative rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1"
                  style={{ background: SURF, borderColor: BDR }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "oklch(0.75 0.18 195 / 0.5)"; e.currentTarget.style.boxShadow = "0 8px 30px oklch(0 0 0 / 0.3)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = BDR; e.currentTarget.style.boxShadow = "none"; }}>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at top left, oklch(0.75 0.18 195 / 0.05), transparent 70%)" }} />
                  <h3 className="font-semibold text-white mb-1">{title}</h3>
                  <p className="text-xs text-slate-500 mb-4">Interactive step-by-step animation</p>
                  <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: CYAN }}>
                    <Play size={12} /> Launch Visualization
                  </div>
                </NavLink>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
