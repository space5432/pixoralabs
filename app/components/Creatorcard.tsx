"use client";

import React from "react";
import { useRouter } from "next/navigation";

export type CreatorCardData = {
  user_id: string;
  creator_name: string | null;
  niches: string | null;
  portfolio_link: string | null;
  profile_image?: string | null;

  // optional thumbnail for preview
  thumb_1?: string | null;

  // optional rating added by dashboard
  rating?: number;
};

export default function CreatorCard({
  creator,
  onHire,
}: {
  creator: CreatorCardData;
  onHire: () => void;
}) {
  const router = useRouter();

  const name = creator.creator_name ?? "Creator";
  const niches = (creator.niches ?? "UGC • Editing • Social").trim();
  const rating = creator.rating ?? 4.6;

  const profileImg =
    creator.profile_image ||
    "https://dummyimage.com/200x200/0b1220/ffffff&text=Creator";

  const thumb =
    creator.thumb_1 ||
    "https://dummyimage.com/800x500/0b1220/ffffff&text=UGC+Preview";

  const nicheTags = splitNiches(niches);

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl hover:bg-white/10 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative h-[160px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-black/10 to-transparent z-10" />
        <img
          src={thumb}
          alt="Creator preview"
          className="h-full w-full object-cover scale-[1.02] group-hover:scale-[1.05] transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute left-4 bottom-4 z-20 flex items-center gap-3">
          <img
            src={profileImg}
            alt={name}
            className="h-12 w-12 rounded-2xl border border-white/15 object-cover"
            loading="lazy"
          />
          <div>
            <p className="text-white font-extrabold leading-tight">{name}</p>
            <p className="text-white/70 text-xs font-semibold">
              ★ {rating.toFixed(1)} • Verified profile
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Niches */}
        <div className="flex flex-wrap gap-2">
          {nicheTags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/80 text-xs font-bold"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-2">
          Clean UGC scripts, strong hook + retention editing, and fast delivery
          built for startups.
        </p>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push(`/creators/${creator.user_id}`)}
            className="px-4 py-3 rounded-2xl border border-white/12 bg-white/5 text-white font-extrabold hover:bg-white/10 transition"
          >
            View Profile
          </button>

          <button
            onClick={onHire}
            className="px-4 py-3 rounded-2xl bg-white text-slate-900 font-extrabold hover:bg-white/90 transition shadow-sm"
          >
            Hire
          </button>
        </div>

        {/* Footer mini info */}
        <div className="mt-4 flex items-center justify-between text-xs text-white/55">
          <span>Response: fast</span>
          {creator.portfolio_link ? (
            <a
              href={creator.portfolio_link}
              target="_blank"
              rel="noreferrer"
              className="text-sky-200 font-bold hover:underline"
            >
              Portfolio →
            </a>
          ) : (
            <span>Portfolio: not linked</span>
          )}
        </div>
      </div>

      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute -top-24 -right-24 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>
    </div>
  );
}

function splitNiches(n: string) {
  // supports: comma or space-separated
  const raw = n
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (raw.length > 1) return raw;

  // fallback split by space if user typed "tech fitness"
  const bySpace = n
    .split(" ")
    .map((x) => x.trim())
    .filter(Boolean);

  // compact tags
  const tags = bySpace.length > 0 ? bySpace : ["UGC"];
  return tags.slice(0, 6);
}