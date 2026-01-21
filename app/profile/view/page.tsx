"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Role = "startup" | "creator";

type ProfileRow = {
  id: string;
  role: Role | null;
};

type StartupProfile = {
  user_id: string;
  company_name: string | null;
  phone: string | null;
  description: string | null;
  website_link: string | null;
};

type CreatorProfile = {
  user_id: string;
  creator_name: string | null;
  phone: string | null;
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

export default function ProfileViewPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);

  const [startupProfile, setStartupProfile] = useState<StartupProfile | null>(
    null
  );
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: baseProfile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!baseProfile?.role) {
        router.push("/choose-role");
        return;
      }

      setRole(baseProfile.role as Role);

      // ✅ Startup profile
      if (baseProfile.role === "startup") {
        const { data: sp } = await supabase
          .from("startup_profiles")
          .select("user_id, company_name, phone, description, website_link")
          .eq("user_id", user.id)
          .maybeSingle();

        // If not onboarded -> go onboarding
        if (!sp) {
          router.push("/onboarding/startup");
          return;
        }

        setStartupProfile(sp as StartupProfile);
      }

      // ✅ Creator profile
      if (baseProfile.role === "creator") {
        const { data: cp } = await supabase
          .from("creator_profiles")
          .select(
            `
            user_id,
            creator_name,
            phone,
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
          .eq("user_id", user.id)
          .maybeSingle();

        if (!cp) {
          router.push("/onboarding/creator");
          return;
        }

        setCreatorProfile(cp as CreatorProfile);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5">
          <p className="font-extrabold text-lg">Loading your profile...</p>
          <p className="text-sm text-white/60 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  // ✅ Startup View
  if (role === "startup" && startupProfile) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070A12] via-[#0A1020] to-[#070A12]" />
        <div className="relative z-10 max-w-[900px] mx-auto px-6 py-10">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => router.push("/dashboard/startup")}
              className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-bold"
            >
              ← Back
            </button>

            <button
              onClick={() => router.push("/onboarding/startup")}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 font-extrabold hover:opacity-95 transition"
            >
              Edit Profile
            </button>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-7">
            <p className="text-2xl font-extrabold">
              {startupProfile.company_name ?? "Startup"}
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Info label="Company Name" value={startupProfile.company_name} />
              <Info label="Phone (private)" value={startupProfile.phone} />
              <Info label="Website" value={startupProfile.website_link} />
              <Info
                label="Description"
                value={startupProfile.description ?? "—"}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Creator View
  if (role === "creator" && creatorProfile) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#070A12] via-[#0A1020] to-[#070A12]" />
        <div className="relative z-10 max-w-[1000px] mx-auto px-6 py-10">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => router.push("/dashboard/creator")}
              className="px-4 py-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-bold"
            >
              ← Back
            </button>

            <button
              onClick={() => router.push("/onboarding/creator")}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 font-extrabold hover:opacity-95 transition"
            >
              Edit Profile
            </button>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-7">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-3xl overflow-hidden border border-white/10 bg-black/30">
                <img
                  src={
                    creatorProfile.profile_image ||
                    "https://dummyimage.com/200x200/111827/ffffff&text=UGC"
                  }
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-2xl font-extrabold">
                  {creatorProfile.creator_name ?? "Creator"}
                </p>
                <p className="text-white/60 text-sm">
                  {creatorProfile.niches ?? "Niches not added"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <Info label="Phone (private)" value={creatorProfile.phone} />
              <Info label="Portfolio" value={creatorProfile.portfolio_link} />
              <Info label="Niches" value={creatorProfile.niches} />
              <Info label="Thumbnail" value={creatorProfile.thumbnail_url} />
            </div>

            {/* Sample Videos */}
            <div className="mt-6">
              <p className="font-extrabold text-lg">Sample Videos</p>
              <div className="mt-3 grid md:grid-cols-2 gap-4">
                {[creatorProfile.sample_video_1, creatorProfile.sample_video_2, creatorProfile.sample_video_3]
                  .filter(Boolean)
                  .map((v, i) => (
                    <div
                      key={i}
                      className="rounded-2xl overflow-hidden border border-white/10 bg-black/30"
                    >
                      <video
                        controls
                        className="w-full h-[220px] bg-black object-cover"
                        src={v as string}
                      />
                    </div>
                  ))}
                {[
                  creatorProfile.sample_video_1,
                  creatorProfile.sample_video_2,
                  creatorProfile.sample_video_3,
                ].filter(Boolean).length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60 text-sm">
                    No sample videos uploaded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Sample Images */}
            <div className="mt-6">
              <p className="font-extrabold text-lg">Sample Images</p>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  creatorProfile.sample_image_1,
                  creatorProfile.sample_image_2,
                  creatorProfile.sample_image_3,
                ]
                  .filter(Boolean)
                  .map((img, i) => (
                    <a
                      key={i}
                      href={img as string}
                      target="_blank"
                      className="rounded-2xl overflow-hidden border border-white/10 bg-black/30 block hover:opacity-90 transition"
                    >
                      <img
                        src={img as string}
                        alt="sample"
                        className="w-full h-[170px] object-cover"
                      />
                    </a>
                  ))}

                {[
                  creatorProfile.sample_image_1,
                  creatorProfile.sample_image_2,
                  creatorProfile.sample_image_3,
                ].filter(Boolean).length === 0 && (
                  <div className="col-span-2 md:col-span-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-white/60 text-sm">
                    No sample images uploaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // fallback
  return (
    <div className="min-h-screen bg-[#070A12] flex items-center justify-center text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5">
        <p className="font-extrabold text-lg">Profile data not found</p>
        <p className="text-white/60 text-sm mt-1">
          Please complete onboarding.
        </p>
        <button
          onClick={() => router.push("/choose-role")}
          className="mt-4 px-5 py-3 rounded-2xl bg-white text-slate-900 font-extrabold hover:bg-white/90 transition w-full"
        >
          Go to choose role
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  const text =
    value === null || value === undefined || value === "" ? "—" : String(value);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-white/50 text-xs font-bold">{label}</p>
      <p className="text-white font-extrabold mt-1 break-all">{text}</p>
    </div>
  );
}