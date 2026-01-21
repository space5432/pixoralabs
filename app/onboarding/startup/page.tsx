"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function StartupOnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ required fields
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ optional fields
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // If already onboarded → go dashboard
      const { data: existing } = await supabase
        .from("startup_profiles")
        .select("company_name, phone, website, description")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing?.company_name && existing?.phone) {
        router.push("/dashboard");
        return;
      }

      // preload if partial exists
      if (existing) {
        setCompanyName(existing.company_name ?? "");
        setPhone(existing.phone ?? "");
        setWebsite(existing.website ?? "");
        setDescription(existing.description ?? "");
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const save = async () => {
    if (!companyName.trim()) {
      alert("Company name is required");
      return;
    }

    if (!phone.trim()) {
      alert("Phone number is required");
      return;
    }

    setSaving(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    if (!user) {
      alert("Not logged in");
      setSaving(false);
      return;
    }

    // ✅ UPSERT startup profile
    const { error } = await supabase.from("startup_profiles").upsert(
      {
        user_id: user.id,
        company_name: companyName.trim(),
        phone: phone.trim(), // ✅ PRIVATE
        website: website.trim() || null,
        description: description.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    alert("✅ Startup profile created!");
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
      <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6">
        <h1 className="text-3xl font-extrabold text-white">
          Startup Setup
        </h1>
        <p className="text-sm text-white/70 mt-2 leading-relaxed">
          Complete your startup profile. Phone number is required for internal
          contact/support and is <span className="text-white font-bold">not shown publicly</span>.
        </p>

        <div className="mt-8 space-y-5">
          <Field label="Company Name *">
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Example: Pixora Media"
              className={inputClass}
            />
          </Field>

          <Field label="Phone Number * (Private)">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Example: +91 98765 43210"
              className={inputClass}
            />
            <p className="text-xs text-white/50 mt-2">
              Only used for order contact/support. Not visible to creators publicly.
            </p>
          </Field>

          <Field label="Website Link (optional)">
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className={inputClass}
            />
          </Field>

          <Field label="Company Description (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell creators what your startup does..."
              className={textareaClass}
            />
          </Field>

          <button
            onClick={save}
            disabled={saving}
            className="w-full rounded-2xl bg-white text-slate-900 font-extrabold py-3 hover:bg-white/90 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Finish Setup"}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-2xl border border-white/15 bg-white/10 text-white font-bold py-3 hover:bg-white/15 transition"
          >
            Skip for now
          </button>
        </div>
      </div>
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
const textareaClass =
  "w-full min-h-[120px] rounded-2xl border border-white/15 bg-[#0F2A4A]/70 p-3 text-white placeholder:text-white/45 outline-none focus:border-white/35 transition";