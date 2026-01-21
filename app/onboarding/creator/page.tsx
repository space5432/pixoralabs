"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type UploadState = {
  profile: boolean;
  thumb: boolean;
  video: boolean;
};

export default function CreatorOnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ required fields
  const [creatorName, setCreatorName] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ optional
  const [headline, setHeadline] = useState("");
  const [niches, setNiches] = useState("");

  // ✅ required uploads
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [thumb1, setThumb1] = useState<string | null>(null);
  const [sampleVideo1, setSampleVideo1] = useState<string | null>(null);

  const [uploading, setUploading] = useState<UploadState>({
    profile: false,
    thumb: false,
    video: false,
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

      // ✅ If already onboarded → go dashboard
      const { data: existing } = await supabase
        .from("creator_profiles")
        .select("creator_name, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing?.creator_name && existing?.phone) {
        router.push("/dashboard");
        return;
      }

      setLoading(false);
    };

    load();
  }, [router]);

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
    // ✅ required checks
    if (!creatorName.trim()) return alert("Creator name is required");
    if (!phone.trim()) return alert("Phone number is required");

    // ✅ require uploads on onboarding
    if (!profileImage) return alert("Upload profile picture");
    if (!thumb1) return alert("Upload thumbnail");
    if (!sampleVideo1) return alert("Upload sample video");

    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      alert("Not logged in");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("creator_profiles").upsert(
      {
        user_id: user.id,
        creator_name: creatorName.trim(),
        phone: phone.trim(), // ✅ PRIVATE (not shown publicly)
        headline: headline.trim() || null,
        niches: niches.trim() || null,

        profile_image: profileImage,
        thumb_1: thumb1,
        sample_video_1: sampleVideo1,

        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    alert("✅ Creator profile created!");
    setSaving(false);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#071021] via-[#071B33] to-[#05070D] text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071021] via-[#071B33] to-[#05070D] p-6">
      <div className="max-w-3xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
        <h1 className="text-3xl font-extrabold text-white">Creator Setup</h1>
        <p className="text-sm text-white/70 mt-2">
          Add your details + uploads so startups can trust you instantly.
        </p>

        <div className="mt-8 space-y-5">
          <Field label="Creator Name *">
            <input
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="Your name"
              className={inputClass}
            />
          </Field>

          <Field label="Phone Number * (Private)">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91XXXXXXXXXX"
              className={inputClass}
            />
            <p className="text-xs text-white/50 mt-2">
              This phone is stored for internal contact/support only. Not visible publicly.
            </p>
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Headline (optional)">
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="High-converting UGC for brands"
                className={inputClass}
              />
            </Field>

            <Field label="Niches (optional)">
              <input
                value={niches}
                onChange={(e) => setNiches(e.target.value)}
                placeholder="Skincare, Fitness, Tech"
                className={inputClass}
              />
            </Field>
          </div>

          {/* ✅ Uploads */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-white font-extrabold">Creator Uploads *</p>
            <p className="text-white/60 text-sm mt-1">
              Required: profile photo + thumbnail + sample video.
            </p>

            <div className="mt-4 grid md:grid-cols-3 gap-4">
              {/* Profile photo */}
              <UploadCard
                title="Profile Photo"
                required
                preview={profileImage}
                type="image"
                buttonText={uploading.profile ? "Uploading..." : "Upload"}
                onUpload={async (file) => {
                  setUploading((s) => ({ ...s, profile: true }));
                  try {
                    const url = await uploadToBucket(
                      "creator-image",
                      file,
                      "profile"
                    );
                    setProfileImage(url);
                    alert("✅ Profile photo uploaded!");
                  } catch (err: any) {
                    alert(err.message);
                  } finally {
                    setUploading((s) => ({ ...s, profile: false }));
                  }
                }}
              />

              {/* Thumbnail */}
              <UploadCard
                title="Thumbnail"
                required
                preview={thumb1}
                type="image"
                buttonText={uploading.thumb ? "Uploading..." : "Upload"}
                onUpload={async (file) => {
                  setUploading((s) => ({ ...s, thumb: true }));
                  try {
                    const url = await uploadToBucket(
                      "creator-image",
                      file,
                      "thumb-1"
                    );
                    setThumb1(url);
                    alert("✅ Thumbnail uploaded!");
                  } catch (err: any) {
                    alert(err.message);
                  } finally {
                    setUploading((s) => ({ ...s, thumb: false }));
                  }
                }}
              />

              {/* Sample video */}
              <UploadCard
                title="Sample Video"
                required
                preview={sampleVideo1}
                type="video"
                buttonText={uploading.video ? "Uploading..." : "Upload"}
                onUpload={async (file) => {
                  setUploading((s) => ({ ...s, video: true }));
                  try {
                    const url = await uploadToBucket(
                      "creator-samples",
                      file,
                      "sample-video-1"
                    );
                    setSampleVideo1(url);
                    alert("✅ Sample video uploaded!");
                  } catch (err: any) {
                    alert(err.message);
                  } finally {
                    setUploading((s) => ({ ...s, video: false }));
                  }
                }}
              />
            </div>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-2xl bg-white text-slate-900 font-extrabold py-3 hover:bg-white/90 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Finish Setup"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small UI component ---------- */

function UploadCard({
  title,
  required,
  preview,
  type,
  buttonText,
  onUpload,
}: {
  title: string;
  required?: boolean;
  preview: string | null;
  type: "image" | "video";
  buttonText: string;
  onUpload: (file: File) => Promise<void>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F2A4A]/35 p-4">
      <p className="text-white font-extrabold text-sm">
        {title} {required ? <span className="text-red-300">*</span> : null}
      </p>

      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        {preview ? (
          type === "image" ? (
            <img src={preview} className="w-full h-[120px] object-cover" />
          ) : (
            <div className="p-3">
              <p className="text-white/80 text-sm font-bold">Uploaded ✅</p>
              <a
                href={preview}
                target="_blank"
                rel="noreferrer"
                className="text-sky-200 text-sm font-bold hover:underline"
              >
                Open video →
              </a>
            </div>
          )
        ) : (
          <div className="h-[120px] flex items-center justify-center text-white/45 text-sm font-bold">
            No file
          </div>
        )}
      </div>

      <label className="block mt-3">
        <input
          type="file"
          accept={
            type === "image"
              ? "image/png,image/jpeg,image/jpg"
              : "video/mp4"
          }
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            await onUpload(f);
          }}
        />
        <div className="cursor-pointer w-full rounded-xl border border-white/15 bg-white/10 text-white font-bold py-2.5 text-center hover:bg-white/15 transition">
          {buttonText}
        </div>
      </label>
    </div>
  );
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <p className="text-sm font-bold text-white/85 mb-2">{label}</p>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-[#0F2A4A]/70 p-3 text-white placeholder:text-white/45 outline-none focus:border-white/35 transition";