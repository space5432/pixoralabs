"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UploadingState = {
  profile: boolean;
  thumb: boolean;
  sampleImage: boolean;
  sampleVideo: boolean;
};

export default function EditCreatorProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [creatorName, setCreatorName] = useState("");
  const [headline, setHeadline] = useState("");
  const [niches, setNiches] = useState("");

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [thumb1, setThumb1] = useState<string | null>(null);
  const [sampleImage1, setSampleImage1] = useState<string | null>(null);
  const [sampleVideo1, setSampleVideo1] = useState<string | null>(null);

  const [uploading, setUploading] = useState<UploadingState>({
    profile: false,
    thumb: false,
    sampleImage: false,
    sampleVideo: false,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: row } = await supabase
        .from("creator_profiles")
        .select(
          "creator_name, headline, niches, profile_image, thumb_1, sample_image_1, sample_video_1"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (!row) {
        router.push("/onboarding/creator");
        return;
      }

      setCreatorName(row.creator_name ?? "");
      setHeadline(row.headline ?? "");
      setNiches(row.niches ?? "");

      setProfileImage(row.profile_image ?? null);
      setThumb1(row.thumb_1 ?? null);
      setSampleImage1(row.sample_image_1 ?? null);
      setSampleVideo1(row.sample_video_1 ?? null);

      setLoading(false);
    };

    load();
  }, [router]);

  // ✅ Universal upload helper
  const uploadToBucket = async (
    bucketName: "creator-image" | "creator-samples",
    file: File,
    folderName: string
  ) => {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) throw new Error("Not logged in");

    const ext = file.name.split(".").pop() || "file";
    const fileName = `${folderName}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const path = `${user.id}/${fileName}`;

    const { error } = await supabase.storage.from(bucketName).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      throw new Error(
        `Upload failed (${bucketName}): ${error.message}. Check bucket name in Supabase Storage.`
      );
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    return data.publicUrl;
  };

  const save = async () => {
    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      alert("Not logged in");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("creator_profiles")
      .update({
        creator_name: creatorName,
        headline,
        niches,
        profile_image: profileImage,
        thumb_1: thumb1,
        sample_image_1: sampleImage1,
        sample_video_1: sampleVideo1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    alert("✅ Profile updated!");
    setSaving(false);
    router.push("/profile/view?role=creator");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#071021] via-[#071B33] to-[#05070D]">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-white shadow-lg">
          <p className="font-extrabold text-lg">Loading profile editor...</p>
          <p className="text-sm text-white/70 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071021] via-[#071B33] to-[#05070D] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">
              Edit Creator Profile
            </h1>
            <p className="text-white/70 mt-1 text-sm max-w-2xl leading-relaxed">
              Keep your profile premium and clear. Startups decide fast — your
              thumbnail and samples matter the most.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/profile/view?role=creator")}
              className="px-4 py-3 rounded-2xl border border-white/15 bg-white/10 text-white font-bold hover:bg-white/15 transition"
            >
              Back
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-extrabold hover:bg-white/90 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-8 grid lg:grid-cols-[360px_1fr] gap-6">
          {/* Left: Identity */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
            <p className="text-white font-extrabold text-lg">Identity</p>
            <p className="text-white/60 text-sm mt-1">
              This appears across the platform.
            </p>

            {/* Profile image */}
            <div className="mt-5">
              <p className="text-sm font-bold text-white/80 mb-2">
                Profile Photo
              </p>

              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl border border-white/10 bg-white/10 overflow-hidden">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-white/50 text-sm font-bold">
                      N/A
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;

                        try {
                          setUploading((s) => ({ ...s, profile: true }));
                          const url = await uploadToBucket(
                            "creator-image",
                            f,
                            "profile"
                          );
                          setProfileImage(url);
                          alert("✅ Profile image updated!");
                        } catch (err: any) {
                          alert(err.message);
                        } finally {
                          setUploading((s) => ({ ...s, profile: false }));
                        }
                      }}
                    />
                    <div className="cursor-pointer w-full rounded-2xl border border-white/15 bg-white/10 text-white font-bold py-2.5 text-center hover:bg-white/15 transition">
                      {uploading.profile ? "Uploading..." : "Change Photo"}
                    </div>
                  </label>

                  {profileImage && (
                    <button
                      onClick={() => setProfileImage(null)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 text-white/80 font-bold py-2.5 hover:bg-white/10 transition"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Basic inputs */}
            <div className="mt-6 space-y-4">
              <Field label="Creator Name">
                <input
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className={inputClass}
                  placeholder="Your name"
                />
              </Field>

              <Field label="Headline">
                <input
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className={inputClass}
                  placeholder="Example: High converting UGC ads for D2C brands"
                />
              </Field>

              <Field label="Niches (comma separated)">
                <input
                  value={niches}
                  onChange={(e) => setNiches(e.target.value)}
                  className={inputClass}
                  placeholder="Skincare, Tech, Fitness..."
                />
              </Field>
            </div>
          </div>

          {/* Right: Portfolio */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-extrabold text-lg">
                    Creator Card Thumbnail
                  </p>
                  <p className="text-white/60 text-sm mt-1">
                    This is shown in startup dashboard before clicking your
                    profile. It should look like a YouTube thumbnail.
                  </p>
                </div>

                <label className="block">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;

                      try {
                        setUploading((s) => ({ ...s, thumb: true }));
                        const url = await uploadToBucket(
                          "creator-image",
                          f,
                          "thumb-1"
                        );
                        setThumb1(url);
                        alert("✅ Thumbnail updated!");
                      } catch (err: any) {
                        alert(err.message);
                      } finally {
                        setUploading((s) => ({ ...s, thumb: false }));
                      }
                    }}
                  />
                  <div className="cursor-pointer px-4 py-3 rounded-2xl bg-sky-200/15 border border-sky-200/20 text-white font-extrabold hover:bg-sky-200/25 transition">
                    {uploading.thumb ? "Uploading..." : "Upload / Replace"}
                  </div>
                </label>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0F2A4A]/45 overflow-hidden">
                {thumb1 ? (
                  <img
                    src={thumb1}
                    alt="thumb"
                    className="w-full h-[220px] object-cover"
                  />
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-white/50 font-bold">
                    No thumbnail uploaded
                  </div>
                )}
              </div>

              {thumb1 && (
                <button
                  onClick={() => setThumb1(null)}
                  className="mt-4 w-full rounded-2xl border border-white/15 bg-white/10 text-white font-bold py-3 hover:bg-white/15 transition"
                >
                  Remove Thumbnail
                </button>
              )}
            </div>

            {/* Samples grid */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
              <p className="text-white font-extrabold text-lg">Portfolio Samples</p>
              <p className="text-white/60 text-sm mt-1">
                Keep them compact, clean, and high quality. Startups watch these
                first.
              </p>

              <div className="mt-5 grid md:grid-cols-2 gap-5">
                {/* Sample Image */}
                <div className="rounded-2xl border border-white/10 bg-[#0F2A4A]/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white font-extrabold">Sample Image</p>

                    <label className="block">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;

                          try {
                            setUploading((s) => ({ ...s, sampleImage: true }));
                            const url = await uploadToBucket(
                              "creator-image",
                              f,
                              "sample-image-1"
                            );
                            setSampleImage1(url);
                            alert("✅ Sample image uploaded!");
                          } catch (err: any) {
                            alert(err.message);
                          } finally {
                            setUploading((s) => ({
                              ...s,
                              sampleImage: false,
                            }));
                          }
                        }}
                      />

                      <div className="cursor-pointer text-sm px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white font-bold hover:bg-white/15 transition">
                        {uploading.sampleImage ? "Uploading..." : "Upload"}
                      </div>
                    </label>
                  </div>

                  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                    {sampleImage1 ? (
                      <img
                        src={sampleImage1}
                        alt="sample image"
                        className="w-full h-[150px] object-cover"
                      />
                    ) : (
                      <div className="h-[150px] flex items-center justify-center text-white/45 text-sm font-bold">
                        No image
                      </div>
                    )}
                  </div>

                  {sampleImage1 && (
                    <button
                      onClick={() => setSampleImage1(null)}
                      className="mt-3 w-full text-sm rounded-xl border border-white/10 bg-white/5 text-white/80 font-bold py-2.5 hover:bg-white/10 transition"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                {/* Sample Video */}
                <div className="rounded-2xl border border-white/10 bg-[#0F2A4A]/35 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-white font-extrabold">Sample Video</p>

                    <label className="block">
                      <input
                        type="file"
                        accept="video/mp4"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;

                          try {
                            setUploading((s) => ({ ...s, sampleVideo: true }));
                            const url = await uploadToBucket(
                              "creator-samples",
                              f,
                              "sample-video-1"
                            );
                            setSampleVideo1(url);
                            alert("✅ Sample video uploaded!");
                          } catch (err: any) {
                            alert(err.message);
                          } finally {
                            setUploading((s) => ({
                              ...s,
                              sampleVideo: false,
                            }));
                          }
                        }}
                      />

                      <div className="cursor-pointer text-sm px-3 py-2 rounded-xl border border-white/15 bg-white/10 text-white font-bold hover:bg-white/15 transition">
                        {uploading.sampleVideo ? "Uploading..." : "Upload"}
                      </div>
                    </label>
                  </div>

                  {/* ✅ compact video preview */}
                  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                    {sampleVideo1 ? (
                      <div className="p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-white/80 text-sm font-bold">
                            Video uploaded ✅
                          </p>

                          <a
                            href={sampleVideo1}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-200 text-sm font-bold hover:underline"
                          >
                            Open video →
                          </a>
                        </div>

                        <p className="text-white/50 text-xs mt-2 break-all">
                          {sampleVideo1}
                        </p>
                      </div>
                    ) : (
                      <div className="h-[150px] flex items-center justify-center text-white/45 text-sm font-bold">
                        No video
                      </div>
                    )}
                  </div>

                  {sampleVideo1 && (
                    <button
                      onClick={() => setSampleVideo1(null)}
                      className="mt-3 w-full text-sm rounded-xl border border-white/10 bg-white/5 text-white/80 font-bold py-2.5 hover:bg-white/10 transition"
                    >
                      Remove Video
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-white font-extrabold text-sm">
                  Pro tip for creators
                </p>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">
                  Best thumbnail: face + bold text + product visible. Best sample
                  video: 15–25 sec UGC with a strong hook in first 2 seconds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <button
            onClick={() => router.push("/profile/view?role=creator")}
            className="w-full md:w-auto px-5 py-3 rounded-2xl border border-white/15 bg-white/10 text-white font-bold hover:bg-white/15 transition"
          >
            Back to Profile
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="w-full md:w-auto px-6 py-3 rounded-2xl bg-white text-slate-900 font-extrabold hover:bg-white/90 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI helpers ---------- */

function Field({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <p className="text-sm font-bold text-white/85 mb-2">{label}</p>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-[#0F2A4A]/70 p-3 text-white placeholder:text-white/45 outline-none focus:border-white/35";