"use client";

export type CreatorCardData = {
  user_id: string;
  creator_name: string | null;
  niches: string | null;
  portfolio_link: string | null;
  profile_image?: string | null;
  thumbnail_url?: string | null; // ✅ new thumbnail field (optional)
  rating?: number;
};

export default function CreatorGridCard({
  creator,
  onViewProfile,
  onHire,
}: {
  creator: CreatorCardData;
  onViewProfile: () => void;
  onHire: () => void;
}) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-white/5 hover:bg-white/7 transition shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
      {/* Thumbnail */}
      <div className="relative h-[170px] w-full bg-black/30 overflow-hidden">
        {creator.thumbnail_url ? (
          <img
            src={creator.thumbnail_url}
            alt="creator thumbnail"
            className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/40 text-sm">
            No thumbnail
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-14 w-14 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center text-white text-lg">
            ▶
          </div>
        </div>

        {/* Like */}
        <div className="absolute top-3 right-3 h-10 w-10 rounded-2xl bg-black/35 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/80">
          ♡
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white font-extrabold text-lg leading-tight">
              {creator.creator_name ?? "Creator"}
            </p>

            <p className="text-sm text-white/65 mt-1 line-clamp-2">
              {creator.niches
                ? `Niches: ${creator.niches}`
                : "Niches not added yet"}
            </p>

            <div className="mt-3 flex items-center gap-2 text-white/70 text-sm">
              <span>⭐</span>
              <span className="font-bold text-white">
                {(creator.rating ?? 4.5).toFixed(1)}
              </span>
              <span className="text-white/50">(verified)</span>
            </div>
          </div>

          <button
            onClick={onViewProfile}
            className="rounded-2xl border border-white/12 bg-white/6 px-4 py-2 text-white/85 text-sm font-bold hover:bg-white/10 transition"
          >
            View
          </button>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onViewProfile}
            className="rounded-2xl border border-white/10 bg-white/6 text-white font-bold py-3 hover:bg-white/10 transition"
          >
            View Profile
          </button>

          <button
            onClick={onHire}
            className="rounded-2xl bg-gradient-to-r from-[#6d5dfc] to-[#4b7bff] text-white font-extrabold py-3 hover:opacity-95 transition shadow-[0_15px_40px_rgba(80,120,255,0.25)]"
          >
            Hire
          </button>
        </div>
      </div>
    </div>
  );
}