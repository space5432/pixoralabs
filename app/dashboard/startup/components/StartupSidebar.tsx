"use client";

import { useMemo } from "react";

type StartupTab = "dashboard" | "marketplace" | "orders" | "profile";

export default function StartupSidebar({
  activeTab,
  onTabChange,
  brandName = "PixoraLabs",
}: {
  activeTab: StartupTab;
  onTabChange: (tab: StartupTab) => void;
  brandName?: string;
}) {
  const items = useMemo(
    () => [
      { id: "dashboard" as const, label: "Dashboard", icon: "📊" },
      { id: "marketplace" as const, label: "Marketplace", icon: "🧑‍🎤" },
      { id: "orders" as const, label: "My Projects", icon: "📦" },
      { id: "profile" as const, label: "Profile", icon: "👤" },
    ],
    []
  );

  return (
    <aside className="h-[calc(100vh-28px)] w-full rounded-3xl border border-white/10 bg-[#0a0d14]/80 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] p-5 flex flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white font-extrabold">
            M
          </div>
          <div>
            <p className="text-white font-extrabold leading-tight">{brandName}</p>
            <p className="text-xs text-white/60 -mt-0.5">Startup Workspace</p>
          </div>
        </div>

        <div className="h-9 w-9 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
          ⚙️
        </div>
      </div>

      {/* Divider */}
      <div className="mt-5 h-px bg-white/10" />

      {/* Nav */}
      <nav className="mt-5 flex flex-col gap-2">
        {items.map((item) => {
          const active = item.id === activeTab;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={[
                "w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
                active
                  ? "bg-white/10 border border-white/15 text-white shadow-sm"
                  : "bg-transparent border border-transparent text-white/70 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Card */}
      <div className="mt-auto pt-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-white font-bold">Affordable UGC, real results</p>
          <p className="text-sm text-white/65 mt-1 leading-relaxed">
            Hire smaller creators quickly. Keep campaigns lean and measurable.
          </p>

          <button
            onClick={() => onTabChange("marketplace")}
            className="mt-4 w-full rounded-2xl bg-white/10 border border-white/15 text-white font-bold py-3 hover:bg-white/15 transition"
          >
            Go to Marketplace
          </button>
        </div>

        <p className="text-xs text-white/40 mt-4 text-center">© 2026 PixoraLabs</p>
      </div>
    </aside>
  );
}