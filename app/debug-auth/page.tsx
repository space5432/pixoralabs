"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DebugAuthPage() {
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const run = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        setInfo({ status: "NOT LOGGED IN" });
        return;
      }

      const { data: profileRow } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      setInfo({
        status: "LOGGED IN",
        user_id: user.id,
        email: user.email,
        profileRow,
      });
    };

    run();
  }, []);

  return (
    <div style={{ padding: 20, color: "white", background: "#0b1220", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800 }}>Debug Auth</h1>
      <pre style={{ marginTop: 15, background: "#111827", padding: 12, borderRadius: 12 }}>
        {JSON.stringify(info, null, 2)}
      </pre>
    </div>
  );
}