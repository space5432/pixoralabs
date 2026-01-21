"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ChooseRolePage() {
  const router = useRouter();

  const [busy, setBusy] = useState(true);
  const [savingRole, setSavingRole] = useState<"startup" | "creator" | null>(
    null
  );

  useEffect(() => {
    const checkUser = async () => {
      setBusy(true);

      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // ✅ If role already exists → redirect directly
      const { data: profileRow } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileRow?.role === "startup") {
        router.push("/dashboard");
        return;
      }

      if (profileRow?.role === "creator") {
        router.push("/dashboard");
        return;
      }

      setBusy(false);
    };

    checkUser();
  }, [router]);

  const setRoleAndContinue = async (role: "startup" | "creator") => {
    setSavingRole(role);

    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      alert("Login required");
      router.push("/login");
      return;
    }

    // ✅ Save role into profiles table
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      role,
    });

    if (error) {
      setSavingRole(null);
      alert("Role save failed: " + error.message);
      return;
    }

    // ✅ Redirect to correct onboarding
    if (role === "startup") {
      router.push("/onboarding/startup");
    } else {
      router.push("/onboarding/creator");
    }
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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071021] via-[#071B33] to-[#05070D]" />
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
          <p className="text-white font-extrabold text-3xl text-center">
            Choose your role
          </p>
          <p className="text-white/70 text-sm mt-2 text-center max-w-2xl mx-auto">
            Select how you want to use MediaMatrix. You can switch later, but
            this helps us set up your dashboard correctly.
          </p>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {/* Startup */}
            <button
              onClick={() => setRoleAndContinue("startup")}
              disabled={savingRole !== null}
              className="text-left rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-6"
            >
              <p className="text-white font-extrabold text-xl">I’m a Startup</p>
              <p className="text-white/65 text-sm mt-2 leading-relaxed">
                Post UGC jobs, browse creators, hire fast, and manage orders.
              </p>

              <div className="mt-5">
                <span className="inline-flex px-4 py-2 rounded-2xl bg-sky-200/25 border border-sky-200/25 text-white font-extrabold">
                  {savingRole === "startup" ? "Saving..." : "Continue →"}
                </span>
              </div>
            </button>

            {/* Creator */}
            <button
              onClick={() => setRoleAndContinue("creator")}
              disabled={savingRole !== null}
              className="text-left rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-6"
            >
              <p className="text-white font-extrabold text-xl">I’m a Creator</p>
              <p className="text-white/65 text-sm mt-2 leading-relaxed">
                Create your profile, upload samples, get hired, deliver content
                and get paid.
              </p>

              <div className="mt-5">
                <span className="inline-flex px-4 py-2 rounded-2xl bg-sky-200/25 border border-sky-200/25 text-white font-extrabold">
                  {savingRole === "creator" ? "Saving..." : "Continue →"}
                </span>
              </div>
            </button>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 w-full px-5 py-3 rounded-2xl border border-white/10 bg-white/10 text-white font-extrabold hover:bg-white/15 transition"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Animated background ---------- */
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl animate-blob1" />
      <div className="absolute top-40 -right-40 h-[480px] w-[480px] rounded-full bg-cyan-400/20 blur-3xl animate-blob2" />
      <div className="absolute bottom-[-180px] left-[35%] h-[520px] w-[520px] rounded-full bg-indigo-500/15 blur-3xl animate-blob3" />

      <style jsx global>{`
        @keyframes blob1 {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(50px, 30px) scale(1.08);
          }
        }
        @keyframes blob2 {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(-40px, 20px) scale(1.06);
          }
        }
        @keyframes blob3 {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          50% {
            transform: translate(30px, -25px) scale(1.1);
          }
        }
        .animate-blob1 {
          animation: blob1 10s ease-in-out infinite;
        }
        .animate-blob2 {
          animation: blob2 12s ease-in-out infinite;
        }
        .animate-blob3 {
          animation: blob3 14s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
