"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // ✅ Check if user already has startup/creator profile
  const decideRedirect = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) {
      router.push("/choose-role");
      return;
    }

    // check startup profile
    const { data: startupProfile } = await supabase
      .from("startup_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (startupProfile?.user_id) {
      router.push("/dashboard");
      return;
    }

    // check creator profile
    const { data: creatorProfile } = await supabase
      .from("creator_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (creatorProfile?.user_id) {
      router.push("/dashboard");
      return;
    }

    // else not onboarded
    router.push("/choose-role");
  };

  const signupWithEmail = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setBusy(false);

    if (error) {
      alert(error.message);
      return;
    }

    // ✅ Some users need email confirm, some get session instantly
    await decideRedirect();
  };

  const signupWithGoogle = async () => {
    setBusy(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth-check`,
      },
    });

    setBusy(false);
    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-200">
      {/* ✅ Background same as login page (black/grey glow) */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-slate-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-24 right-[-140px] h-[420px] w-[420px] rounded-full bg-zinc-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-220px] left-[-180px] h-[520px] w-[520px] rounded-full bg-neutral-500/10 blur-3xl animate-pulse" />
      </div>

      {/* ✅ Center */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div
          className={[
            "w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-7",
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          ].join(" ")}
        >
          {/* Header */}
          <div className="text-center">
            <p className="text-white font-extrabold text-2xl">
              Create your account
            </p>
            <p className="text-white/70 text-sm mt-2 leading-relaxed">
              Join as a startup or creator and build real UGC projects.
            </p>
          </div>

          {/* Form */}
          <div className="mt-7 grid gap-3">
            <div>
              <p className="text-sm font-bold text-white/80 mb-2">Email</p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/50 outline-none focus:border-white/30 focus:bg-white/15 transition"
              />
            </div>

            <div>
              <p className="text-sm font-bold text-white/80 mb-2">Password</p>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                type="password"
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/50 outline-none focus:border-white/30 focus:bg-white/15 transition"
              />
            </div>

            <button
              onClick={signupWithEmail}
              disabled={busy}
              className="mt-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-extrabold hover:bg-white/90 hover:-translate-y-[1px] active:translate-y-0 transition disabled:opacity-60"
              type="button"
            >
              {busy ? "Please wait..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="my-2 flex items-center gap-3">
              <div className="h-px bg-white/10 flex-1" />
              <p className="text-xs text-white/50 font-semibold">OR</p>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <button
              onClick={signupWithGoogle}
              disabled={busy}
              className="px-5 py-3 rounded-2xl border border-white/10 bg-white/10 text-white font-extrabold hover:bg-white/15 hover:-translate-y-[1px] active:translate-y-0 transition disabled:opacity-60"
              type="button"
            >
              Continue with Google
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-white/65 mt-3">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/login")}
                className="text-white font-extrabold hover:underline underline-offset-4"
                type="button"
              >
                Login
              </button>
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-2 text-center text-xs text-white/40 hover:text-white/70 transition"
              type="button"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}