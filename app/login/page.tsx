"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loginWithEmail = async () => {
    setMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      router.push("/auth-check");
    } catch (e: any) {
      setMsg(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setMsg(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth-check`,
        },
      });

      if (error) {
        setMsg(error.message);
      }
    } catch (e: any) {
      setMsg(e?.message ?? "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    setMsg(null);
    if (!email.trim()) {
      setMsg("Enter your email first, then click Forgot password.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setMsg(error.message);
        return;
      }

      setMsg("✅ Password reset email sent. Check your inbox/spam.");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 overflow-x-hidden">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-slate-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-24 right-[-140px] h-[420px] w-[420px] rounded-full bg-zinc-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-220px] left-[-180px] h-[520px] w-[520px] rounded-full bg-neutral-500/10 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10">
        {/* Top bar */}
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-white">
              P
            </div>
            <div className="font-extrabold tracking-wide text-white">
              PIXORALABS
            </div>
          </Link>

          <Link
            href="/signup"
            className="px-4 py-2 rounded-xl border border-white/15 text-white hover:bg-white/10 transition"
          >
            Create account
          </Link>
        </div>

        {/* Main */}
        <div className="max-w-6xl mx-auto px-4 pb-16 pt-6 grid lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Secure login for creators & startups
            </div>

            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-white leading-tight">
              Welcome back.
              <br />
              <span className="text-white/70">Continue your UGC workflow.</span>
            </h1>

            <p className="mt-4 text-white/60 max-w-xl leading-relaxed">
              Log in to hire creators, track projects, and manage submissions —
              all in one clean workspace.
            </p>

            <div className="mt-6 flex gap-3">
              <Link
                href="/"
                className="px-5 py-3 rounded-xl border border-white/15 text-white hover:bg-white/10 transition"
              >
                Back to Home
              </Link>
              <Link
                href="/signup"
                className="px-5 py-3 rounded-xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/15 transition"
              >
                New here? Sign up
              </Link>
            </div>
          </div>

          {/* Right: Login Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl">
            <h2 className="text-white font-extrabold text-2xl">Login</h2>
            <p className="text-white/60 text-sm mt-1">
              Use email/password or continue with Google.
            </p>

            {msg && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-sm text-white">{msg}</p>
              </div>
            )}

            <div className="mt-5 grid gap-3">
              {/* Google */}
              <button
                onClick={loginWithGoogle}
                disabled={loading}
                className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 text-white font-bold hover:bg-white/15 transition disabled:opacity-60"
              >
                {loading ? "Please wait..." : "Continue with Google"}
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-white/40">OR</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Email */}
              <div>
                <p className="text-white/70 text-sm font-bold mb-2">Email</p>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
                />
              </div>

              {/* Password */}
              <div>
                <p className="text-white/70 text-sm font-bold mb-2">
                  Password
                </p>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
                />
              </div>

              {/* Forgot */}
              <button
                onClick={forgotPassword}
                disabled={loading}
                className="text-left text-sm text-white/70 hover:text-white transition"
              >
                Forgot password?
              </button>

              {/* Login button */}
              <button
                onClick={loginWithEmail}
                disabled={loading}
                className="w-full rounded-2xl bg-gradient-to-r from-slate-200/20 to-white/10 border border-white/10 py-3 text-white font-extrabold hover:bg-white/15 transition disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="text-xs text-white/50 mt-2">
                By continuing you agree to our platform terms and workflow rules.
              </p>

              <p className="text-sm text-white/60 mt-2">
                Don’t have an account?{" "}
                <Link href="/signup" className="text-white font-bold underline">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-6xl mx-auto px-4 pb-10 text-xs text-white/40">
          © {new Date().getFullYear()} PixoraLabs. All rights reserved.
        </div>
      </div>
    </div>
  );
}