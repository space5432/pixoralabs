"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DebugSessionPage() {
  const [log, setLog] = useState<any>({ loading: true });

  useEffect(() => {
    const run = async () => {
      const out: any = {};

      try {
        out.origin =
          typeof window !== "undefined" ? window.location.origin : "server";

        // 1) current session
        const { data: sessionData, error: sessionErr } =
          await supabase.auth.getSession();
        out.getSession = {
          hasSession: !!sessionData.session,
          userId: sessionData.session?.user?.id ?? null,
          error: sessionErr?.message ?? null,
        };

        // 2) get user
        const { data: userData, error: userErr } =
          await supabase.auth.getUser();
        out.getUser = {
          hasUser: !!userData.user,
          userId: userData.user?.id ?? null,
          email: userData.user?.email ?? null,
          error: userErr?.message ?? null,
        };

        // 3) auth events listener
        out.note =
          "If hasSession=false and hasUser=false, production is not storing cookies/session.";

        setLog(out);
      } catch (e: any) {
        setLog({ error: e?.message ?? String(e) });
      }
    };

    run();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-xl font-bold">Debug Session</h1>
      <p className="text-white/60 text-sm mt-1">
        This page checks if Supabase session exists in production.
      </p>

      <pre className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5 overflow-auto text-xs">
        {JSON.stringify(log, null, 2)}
      </pre>
    </div>
  );
}