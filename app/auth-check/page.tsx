"use client";
export const dynamic = "force-dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCheckPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      // 1) Check user logged in
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        router.push("/login");
        return;
      }

      const userId = userData.user.id;

      // 2) Fetch role from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        alert(profileError.message);
        return;
      }

      // If role not selected
      if (!profile?.role) {
        router.push("/choose-role");
        return;
      }

      // 3) Startup profile exists?
      if (profile.role === "startup") {
        const { data: startupProfile, error: spError } = await supabase
          .from("startup_profiles")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (spError) {
          alert(spError.message);
          return;
        }

        // ✅ Only check row existence (not company_name)
        if (!startupProfile?.user_id) {
          router.push("/onboarding/startup");
          return;
        }

        router.push("/dashboard");
        return;
      }

      // 4) Creator profile exists?
      if (profile.role === "creator") {
        const { data: creatorProfile, error: cpError } = await supabase
          .from("creator_profiles")
          .select("user_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (cpError) {
          alert(cpError.message);
          return;
        }

        // ✅ Only check row existence (not creator_name)
        if (!creatorProfile?.user_id) {
          router.push("/onboarding/creator");
          return;
        }

        router.push("/dashboard");
        return;
      }

      router.push("/choose-role");
    };

    run();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      Checking your account...
    </div>
  );
}
