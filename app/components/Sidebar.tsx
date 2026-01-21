"use client";

import React from "react";

type Tab = "browse" | "orders" | "track" | "profile";

type SidebarProps = {
  active: Tab;
  roleLabel: string;
  onNavigate: (tab: Tab) => void;
};

export default function Sidebar({ active, roleLabel, onNavigate }: SidebarProps) {
  const items: { id: Tab; label: string }[] = [
    { id: "browse", label: "Browse Creators" },
    { id: "orders", label: "My Orders" },
    { id: "track", label: "Track Projects" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-extrabold text-white">PixoraLabs</p>
          <p className="text-sm text-white/60 mt-1">{roleLabel}</p>
        </div>

        <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold">
          M
        </div>
      </div>

      {/* Nav */}
      <div className="mt-6 space-y-2">
        {items.map((item) => {
          const isActive = active === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={[
                "w-full text-left px-4 py-3 rounded-2xl transition font-semibold",
                isActive
                  ? "bg-white text-slate-900 shadow"
                  : "bg-white/10 text-white hover:bg-white/15 border border-white/10",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer card */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
        <p className="text-white font-bold">Affordable UGC, real results</p>
        <p className="text-sm text-white/70 mt-2 leading-relaxed">
          Startups hire creators quickly. Creators get consistent work without agencies.
        </p>

        <button
          onClick={() => onNavigate("browse")}
          className="mt-4 w-full rounded-2xl bg-sky-400/30 border border-sky-400/30 text-white font-extrabold py-3 hover:bg-sky-400/40 transition"
        >
          Go to Marketplace
        </button>
      </div>

      <p className="text-xs text-white/40 mt-5">© 2026 PixoraLabs</p>
    </div>
  );
}
