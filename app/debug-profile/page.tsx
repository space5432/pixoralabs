"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DebugProfilePage() {
  const [log, setLog] = useState<string[]>([]);
  const add = (s: string) => setLog((prev) => [...prev, s]);

  useEffect(() => {
    const run = async () => {
      add("🔍 Checking user...");

      const { data: userData, error: userErr } = await supabase.auth.getUser();

      if (userErr) add("❌ getUser error: " + userErr.message);

      const user = userData?.user;

      if (!user) {
        add("❌ No logged in user session found");
        return;
      }

      add("✅ User ID: " + user.id);
      add("✅ Email: " + (user.email || "no email"));

      add("🔍 Checking startup_profiles row...");
      const { data: startupRow, error: startupErr } = await supabase
        .from("startup_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (startupErr) add("❌ startup_profiles error: " + startupErr.message);
      add("Startup row: " + JSON.stringify(startupRow));

      add("🔍 Checking creator_profiles row...");
      const { data: creatorRow, error: creatorErr } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (creatorErr) add("❌ creator_profiles error: " + creatorErr.message);
      add("Creator row: " + JSON.stringify(creatorRow));

      add("✅ Done.");
    };

    run();
  }, []);

  return (
    <div style={{ background: "black", minHeight: "100vh", padding: 20 }}>
      <h1 style={{ color: "white", fontWeight: 800, fontSize: 22 }}>
        Debug Profile
      </h1>

      <div style={{ marginTop: 12 }}>
        {log.map((l, idx) => (
          <p key={idx} style={{ color: "white", fontFamily: "monospace" }}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}
