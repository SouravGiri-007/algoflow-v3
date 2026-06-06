import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Sidebar, TopBar } from "../components/Sidebar";
import AppLogo from "../components/Logo";
import SEO from "../components/SEO";

export default function NotFoundPage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SEO data={{ title: "404" }} />
      <div className="flex h-screen overflow-hidden" style={{ background: "oklch(0.1 0.02 240)" }}>
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <TopBar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 flex items-center justify-center pt-14 lg:pt-0 px-6 text-center">
          <div>
            <AppLogo width={80} height={80} className="mx-auto mb-6" />
            <h1 className="text-8xl font-black mb-3" style={{ color: "oklch(0.75 0.18 195)" }}>404</h1>
            <p className="text-xl font-semibold text-white mb-2">Page not found</p>
            <p className="text-slate-400 mb-8">The algorithm you're looking for doesn't exist here.</p>
            <NavLink to="/" className="px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5"
              style={{ background: "oklch(0.75 0.18 195)", color: "oklch(0.1 0.02 240)" }}>
              Back to Home
            </NavLink>
          </div>
        </main>
      </div>
    </>
  );
}
