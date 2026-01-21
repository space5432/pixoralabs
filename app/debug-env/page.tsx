"use client";

export default function DebugEnvPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold">Debug Env</h1>

      <div className="mt-6 space-y-3 text-sm">
        <p>
          <b>Origin:</b>{" "}
          {typeof window !== "undefined" ? window.location.origin : "server"}
        </p>

        <p>
          <b>NEXT_PUBLIC_SUPABASE_URL:</b>{" "}
          {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ EXISTS" : "❌ MISSING"}
        </p>

        <p className="break-all">
          <b>URL value:</b>{" "}
          {process.env.NEXT_PUBLIC_SUPABASE_URL || "null"}
        </p>

        <p>
          <b>NEXT_PUBLIC_SUPABASE_ANON_KEY:</b>{" "}
          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ EXISTS" : "❌ MISSING"}
        </p>

        <p>
          <b>Anon key length:</b>{" "}
          {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length
            : 0}
        </p>
      </div>
    </div>
  );
}