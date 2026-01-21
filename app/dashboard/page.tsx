"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.role) {
        router.replace("/choose-role");
        return;
      }

      // ✅ role-based dashboard routing
      if (profile.role === "startup") {
        router.replace("/dashboard/startup");
        return;
      }

      if (profile.role === "creator") {
        router.replace("/dashboard/creator");
        return;
      }

      router.replace("/choose-role");
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5">
        <p className="font-extrabold text-lg">Loading your dashboard...</p>
        <p className="text-sm text-white/60 mt-1">Redirecting</p>
      </div>
    </div>
  );
}