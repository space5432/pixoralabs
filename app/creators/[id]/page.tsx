"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type CreatorProfile = {
  user_id: string;
  creator_name: string | null;
  niches: string | null;
  portfolio_link: string | null;

  profile_image: string | null;
  thumbnail_url: string | null;

  sample_video_1: string | null;
  sample_video_2: string | null;
  sample_video_3: string | null;

  sample_image_1: string | null;
  sample_image_2: string | null;
  sample_image_3: string | null;
};

function niceTags(niches: string | null) {
  return (niches ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function isVideo(url: string) {
  const u = url.toLowerCase();
  return u.endsWith(".mp4") || u.endsWith(".mov") || u.endsWith(".webm");
}

export default function CreatorPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = String(params?.id ?? "");

  const [loading, setLoading] = useState(true);
  const [creator, setCreator] = useState<CreatorProfile | null>(null);

  // premium fake rating (stable)
  const rating = useMemo(() => {
    if (!creator?.creator_name) return 4.6;
    let sum = 0;
    for (let i = 0; i < creator.creator_name.length; i++)
      sum += creator.creator_name.charCodeAt(i);
    return Math.min(5, 4.2 + (sum % 9) / 10);
  }, [creator?.creator_name]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      if (!creatorId) {
        router.push("/dashboard/startup");
        return;
      }

      const { data, error } = await supabase
        .from("creator_profiles")
        .select(
          `
          user_id,
          creator_name,
          niches,
          portfolio_link,
          profile_image,
          thumbnail_url,
          sample_video_1,
          sample_video_2,
          sample_video_3,
          sample_image_1,
          sample_image_2,
          sample_image_3
        `
        )
        .eq("user_id", creatorId)
        .maybeSingle();

      if (error) {
        console.log("Creator profile error:", error.message);
      }

      setCreator((data as CreatorProfile) ?? null);
      setLoading(false);
    };

    load();
  }, [creatorId, router]);

  const heroThumb =
    creator?.thumbnail_url ||
    creator?.profile_image ||
    "https://dummyimage.com/1200x500/0b1220/e5e7eb&text=Creator+Profile";

  const profileImg =
    creator?.profile_image ||
    "https://dummyimage.com/240x240/111827/e5e7eb&text=UGC";

  const videos = [
    creator?.sample_video_1,
    creator?.sample_video_2,
    creator?.sample_video_3,
  ].filter(Boolean) as string[];

  const images = [
    creator?.sample_image_1,
    creator?.sample_image_2,
    creator?.sample_image_3,
  ].filter(Boolean) as string[];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A12] text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-center">
          <p className="font-extrabold text-lg">Loading creator profile…</p>
          <p className="text-white/60 text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070A12] text-white">
        <div className="max-w-lg w-full rounded-3xl border border-white/10 bg-white/5 p-7">
          <p className="text-2xl font-extrabold">Creator not found</p>
          <p className="text-white/60 text-sm mt-2">
            This creator profile does not exist or is not public yet.
          </p>

          <button
            onClick={() => router.push("/dashboard/startup")}
            className="mt-5 w-full rounded-2xl bg-white text-slate-900 font-extrabold py-3 hover:bg-white/90 transition"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070A12] via-[#0A1020] to-[#070A12]" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-white/5 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-8">
        {/* Top actions */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition"
          >
            ← Back
          </button>

          <button
            onClick={() => router.push("/dashboard/startup")}
            className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/15 transition"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Hero */}
        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="relative h-[220px] md:h-[260px]">
            <img
              src={heroThumb}
              alt="creator cover"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          </div>

          {/* Profile header */}
          <div className="p-6 md:p-7">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="h-[74px] w-[74px] rounded-3xl overflow-hidden border border-white/15 bg-black/30">
                  <img
                    src={profileImg}
                    alt="profile"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-white font-extrabold text-2xl leading-tight">
                    {creator.creator_name ?? "UGC Creator"}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white text-xs font-extrabold">
                      ⭐ {rating.toFixed(1)}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-bold">
                      Verified-ready profile
                    </span>

                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-bold">
                      Fast delivery available
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                {creator.portfolio_link ? (
                  <a
                    href={creator.portfolio_link}
                    target="_blank"
                    className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-extrabold hover:bg-white/90 transition text-center"
                  >
                    View Portfolio
                  </a>
                ) : (
                  <button
                    disabled
                    className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/40 font-extrabold cursor-not-allowed"
                  >
                    Portfolio not added
                  </button>
                )}

                <button
                  onClick={() => router.push("/dashboard/startup")}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-extrabold hover:opacity-95 transition"
                >
                  Hire this creator
                </button>
              </div>
            </div>

            {/* Niches */}
            <div className="mt-6">
              <p className="text-white/70 text-sm font-bold">Niches</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {niceTags(creator.niches).length === 0 ? (
                  <span className="text-white/50 text-sm">
                    No niches added yet.
                  </span>
                ) : (
                  niceTags(creator.niches).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-bold"
                    >
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="mt-7 grid lg:grid-cols-2 gap-5">
          {/* Videos */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white font-extrabold text-lg">Sample Videos</p>
            <p className="text-white/60 text-sm mt-1">
              Preview creator’s UGC style and delivery quality.
            </p>

            <div className="mt-4 grid gap-4">
              {videos.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-white/60 text-sm">No videos uploaded.</p>
                </div>
              ) : (
                videos.map((url, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border border-white/10 bg-black/30"
                  >
                    <video
                      controls
                      playsInline
                      className="w-full h-[230px] bg-black object-cover"
                      src={url}
                      poster={creator.thumbnail_url ?? undefined}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Images */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white font-extrabold text-lg">Sample Images</p>
            <p className="text-white/60 text-sm mt-1">
              Product shots, thumbnails, or UGC frames.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4">
              {images.length === 0 ? (
                <div className="col-span-2 rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-white/60 text-sm">No images uploaded.</p>
                </div>
              ) : (
                images.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 block hover:opacity-90 transition"
                  >
                    <img
                      src={url}
                      alt="sample"
                      className="w-full h-[190px] object-cover"
                    />
                  </a>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-white font-extrabold text-lg">
            What happens after you hire?
          </p>
          <p className="text-white/60 text-sm mt-2 leading-relaxed">
            You will submit your product details + requirements, the creator
            accepts the order, uploads the final video (or Drive link), and you
            review it inside your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}