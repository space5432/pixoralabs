"use client";

import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
        <h1 className="text-2xl font-extrabold">Profile</h1>
        <p className="text-sm text-slate-300 mt-2">
          Choose what you want to open.
        </p>

        <div className="mt-6 grid gap-3">
          <button
            onClick={() => router.push("/profile/view")}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition"
          >
            View Profile
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-3 rounded-xl border border-white/15 text-white hover:bg-white/10 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
