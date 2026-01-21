"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCheckPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      // ✅ 1) Most reliable after OAuth redirect
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user;

      // ✅ 2) fallback
      const { data: userData } = await supabase.auth.getUser();
      const user = sessionUser ?? userData.user;

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

      if (profile.role === "startup") router.replace("/dashboard/startup");
      else router.replace("/dashboard/creator");
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p className="text-sm font-bold">Finishing login...</p>
    </div>
  );
}