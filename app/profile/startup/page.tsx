"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function StartupProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [instagram, setInstagram] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return router.push("/login");

      const userId = userData.user.id;

      const { data: base } = await supabase
        .from("profiles")
        .select("full_name, phone, role")
        .eq("id", userId)
        .maybeSingle();

      if (!base?.role) return router.push("/auth-check");
      if (base.role !== "startup") return router.push("/profile/view");

      setFullName(base.full_name ?? "");
      setPhone(base.phone ?? "");

      const { data: sp } = await supabase
        .from("startup_profiles")
        .select(
          "company_name, company_website, product_name, product_category, company_description, instagram"
        )
        .eq("user_id", userId)
        .maybeSingle();

      setCompanyName(sp?.company_name ?? "");
      setCompanyWebsite(sp?.company_website ?? "");
      setProductName(sp?.product_name ?? "");
      setProductCategory(sp?.product_category ?? "");
      setCompanyDescription(sp?.company_description ?? "");
      setInstagram(sp?.instagram ?? "");

      setLoading(false);
    };

    load();
  }, [router]);

  const save = async () => {
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setSaving(false);
      return router.push("/login");
    }

    const userId = userData.user.id;

    const { error: e1 } = await supabase.from("profiles").upsert({
      id: userId,
      role: "startup",
      full_name: fullName,
      phone: phone,
      updated_at: new Date().toISOString(),
    });

    if (e1) {
      alert(e1.message);
      setSaving(false);
      return;
    }

    const { error: e2 } = await supabase.from("startup_profiles").upsert({
      user_id: userId,
      company_name: companyName,
      company_website: companyWebsite,
      product_name: productName,
      product_category: productCategory,
      company_description: companyDescription,
      instagram: instagram,
      updated_at: new Date().toISOString(),
    });

    if (e2) {
      alert(e2.message);
      setSaving(false);
      return;
    }

    alert("✅ Startup profile updated!");
    setSaving(false);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-2xl mx-auto rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-extrabold text-white">Startup Profile</h1>
        <p className="text-sm text-slate-400 mt-2">
          Update your company details anytime.
        </p>

        <div className="mt-6 grid gap-3">
          <Input label="Your Name" value={fullName} setValue={setFullName} />
          <Input label="Mobile Number" value={phone} setValue={setPhone} />
          <Input label="Company Name" value={companyName} setValue={setCompanyName} />
          <Input label="Company Website" value={companyWebsite} setValue={setCompanyWebsite} />
          <Input label="Product Name" value={productName} setValue={setProductName} />
          <Input
            label="Product Category"
            value={productCategory}
            setValue={setProductCategory}
          />
          <Textarea
            label="Company / Product Description"
            value={companyDescription}
            setValue={setCompanyDescription}
          />
          <Input label="Instagram" value={instagram} setValue={setInstagram} />

          <button
            onClick={save}
            disabled={saving}
            className="mt-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-3 rounded-xl border border-white/15 text-white hover:bg-white/10 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-slate-300 mb-2">{label}</p>
      <input
        className="w-full rounded-xl border border-white/10 bg-slate-950/40 p-3 text-white outline-none focus:border-blue-500/60"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={label}
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  setValue,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm text-slate-300 mb-2">{label}</p>
      <textarea
        className="w-full min-h-[120px] rounded-xl border border-white/10 bg-slate-950/40 p-3 text-white outline-none focus:border-blue-500/60"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write here..."
      />
    </div>
  );
}
