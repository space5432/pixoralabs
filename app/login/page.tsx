"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const loginWithEmail = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password.");
      return;
    }

    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/dashboard");
  };

  const loginWithGoogle = async () => {
    setBusy(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setBusy(false);

    if (error) alert(error.message);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071021] via-[#071B33] to-[#05070D]" />
      <AnimatedBackground />

      {/* Center */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        {/* Glow behind card */}
        <div className="absolute w-[520px] h-[520px] rounded-full bg-blue-500/15 blur-3xl animate-softPulse" />

        <div
          className={[
            "w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-7",
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          ].join(" ")}
        >
          {/* Header */}
          <div className="text-center">
            <p className="text-white font-extrabold text-2xl">Welcome back</p>
            <p className="text-white/70 text-sm mt-2 leading-relaxed">
              Login to manage UGC projects, creators, and orders.
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
                placeholder="••••••••"
                type="password"
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/50 outline-none focus:border-white/30 focus:bg-white/15 transition"
              />
            </div>
            
<button
  onClick={() => router.push("/forgot-password")}
  className="text-right text-xs text-white/60 hover:text-white transition"
>
  Forgot password?
</button>

            <button
              onClick={loginWithEmail}
              disabled={busy}
              className="mt-2 px-5 py-3 rounded-2xl bg-white text-slate-900 font-extrabold hover:bg-white/90 hover:-translate-y-[1px] active:translate-y-0 transition disabled:opacity-60"
            >
              {busy ? "Please wait..." : "Login"}
            </button>

            {/* Divider */}
            <div className="my-2 flex items-center gap-3">
              <div className="h-px bg-white/10 flex-1" />
              <p className="text-xs text-white/50 font-semibold">OR</p>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <button
              onClick={loginWithGoogle}
              disabled={busy}
              className="px-5 py-3 rounded-2xl border border-white/10 bg-white/10 text-white font-extrabold hover:bg-white/15 hover:-translate-y-[1px] active:translate-y-0 transition disabled:opacity-60"
            >
              Continue with Google
            </button>

            {/* Footer */}
            <p className="text-center text-sm text-white/65 mt-3">
              New here?{" "}
              <button
                onClick={() => router.push("/signup")}
                className="text-white font-extrabold hover:underline underline-offset-4"
              >
                Create account
              </button>
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-2 text-center text-xs text-white/40 hover:text-white/70 transition"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes softPulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        .animate-softPulse {
          animation: softPulse 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

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
