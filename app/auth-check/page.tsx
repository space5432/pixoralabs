"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCheckPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) {
        router.replace("/login");
        return;
      }

      // get role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.role) {
        router.replace("/choose-role");
        return;
      }

      if (profile.role === "startup") {
        router.replace("/dashboard/startup");
      } else {
        router.replace("/dashboard/creator");
      }
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <p className="text-sm font-bold">Logging you in...</p>
    </div>
  );
}