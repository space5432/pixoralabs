"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DebugStoragePage() {
  const [log, setLog] = useState("Checking storage...\n");

  useEffect(() => {
    const run = async () => {
      setLog((p) => p + `\n✅ URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

      const { data: userData, error: userErr } = await supabase.auth.getUser();

      if (userErr) {
        setLog((p) => p + `\n❌ getUser ERROR: ${userErr.message}`);
      } else {
        setLog((p) => p + `\n✅ User: ${userData.user?.id || "NO USER"}`);
      }

      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        setLog((p) => p + `\n❌ listBuckets ERROR: ${error.message}`);
        return;
      }

      setLog((p) => p + `\n✅ Buckets found:\n${JSON.stringify(data, null, 2)}`);
    };

    run();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>Storage Debug</h1>
      <pre style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>{log}</pre>
    </div>
  );
}
