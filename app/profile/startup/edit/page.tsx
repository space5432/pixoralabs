"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type StartupProfile = {
  user_id: string;
  company_name: string | null;
  phone: string | null;
  description: string | null;
};

export default function StartupEditPage() {
  const router = useRouter();

  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      setBusy(true);

      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: row } = await supabase
        .from("startup_profiles")
        .select("user_id, company_name, phone, description")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!row?.user_id) {
        // startup profile not created yet → send to startup onboarding
        router.push("/onboarding/startup");
        return;
      }

      const s = row as StartupProfile;
      setCompanyName(s.company_name || "");
      setPhone(s.phone || "");
      setDescription(s.description || "");

      setBusy(false);
    };

    load();
  }, [router]);

  const save = async () => {
    if (!companyName.trim()) {
      alert("Company name is required");
      return;
    }

    setSaving(true);

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      alert("Login required");
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("startup_profiles").upsert({
      user_id: user.id,
      company_name: companyName.trim(),
      phone: phone.trim() ? phone.trim() : null,
      description: description.trim() ? description.trim() : null,
    });

    setSaving(false);

    if (error) {
      alert("Update failed: " + error.message);
      return;
    }

    alert("✅ Startup profile updated!");
    router.push("/profile/view");
  };

  if (busy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#071021] via-[#071B33] to-[#05070D]" />

      <div className="relative z-10 max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.push("/profile/view")}
            className="px-4 py-2.5 rounded-2xl border border-white/10 bg-white/10 text-white font-semibold hover:bg-white/15 transition"
          >
            ← Back
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-3 rounded-2xl bg-sky-200/25 border border-sky-200/25 text-white font-extrabold hover:bg-sky-200/35 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-7">
          <p className="text-white font-extrabold text-2xl">
            Edit Startup Profile
          </p>
          <p className="text-white/70 text-sm mt-2">
            Update your company details for creators to trust you.
          </p>

          <div className="mt-6 grid gap-4">
            <div>
              <p className="text-sm font-bold text-white/80 mb-2">
                Company name *
              </p>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white outline-none"
              />
            </div>

            <div>
              <p className="text-sm font-bold text-white/80 mb-2">Phone</p>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white outline-none"
              />
            </div>

            <div>
              <p className="text-sm font-bold text-white/80 mb-2">
                Description
              </p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[140px] rounded-2xl border border-white/10 bg-white/10 p-3 text-white outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
