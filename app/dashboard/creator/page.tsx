"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CreatorSidebar from "./components/CreatorSidebar";

type CreatorTab = "dashboard" | "orders" | "deliveries" | "profile";

type Profile = {
  id: string;
  role: "startup" | "creator" | null;
};

type CreatorProfile = {
  creator_name: string | null;
};

type OrderRow = {
  id: string;
  startup_id: string;
  creator_id: string;

  status: string;

  project_title: string | null;
  project_brief: string | null;

  product_name?: string | null;
  product_type?: string | null;
  product_description?: string | null;
  company_name?: string | null;
  company_website?: string | null;
  instagram_handle?: string | null;
  deadline_days?: number | null;

  // ✅ IMPORTANT: Your startup page uses "price" not "budget"
  price?: number | null;

  created_at: string;
  updated_at?: string | null;

  // delivery
  final_video_url?: string | null;
  final_drive_link?: string | null;
  delivery_note?: string | null;

  // revision
  revision_note?: string | null;
};

type WeekPoint = { label: string; value: number };

export default function CreatorDashboardPage() {
  const router = useRouter();

  const [tab, setTab] = useState<CreatorTab>("dashboard");
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(
    null
  );

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [search, setSearch] = useState("");

  // Full order view
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  // ✅ Delivery mode: upload OR drive
  const [deliveryMode, setDeliveryMode] = useState<"upload" | "drive">("upload");

  const [driveLink, setDriveLink] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const refreshOrders = async (creatorId: string) => {
    const { data: orderRows } = await supabase
      .from("orders")
      .select("*")
      .eq("creator_id", creatorId)
      .order("created_at", { ascending: false });

    setOrders((orderRows ?? []) as OrderRow[]);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;

      if (!user) {
        router.push("/login");
        return;
      }

      setEmail(user.email ?? null);

      const { data: base } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!base?.role) {
        router.push("/choose-role");
        return;
      }

      if (base.role !== "creator") {
        router.push("/dashboard/startup");
        return;
      }

      setProfile(base as Profile);

      const { data: cp } = await supabase
        .from("creator_profiles")
        .select("creator_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cp) {
        router.push("/onboarding/creator");
        return;
      }

      setCreatorProfile(cp as CreatorProfile);

      await refreshOrders(user.id);

      setLoading(false);
    };

    load();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((o) => {
      return (
        (o.project_title ?? "").toLowerCase().includes(q) ||
        (o.company_name ?? "").toLowerCase().includes(q) ||
        (o.product_name ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, search]);

  // ✅ CHANGE 1: Completed Earnings should be from DELIVERED orders
  // (You asked: "completeearning on basis of order delivered")
  const completedEarnings = useMemo(() => {
    return orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + (o.price ?? 0), 0);
  }, [orders]);

  // ✅ Weekly chart based on delivered orders
  const weekly = useMemo<WeekPoint[]>(() => {
    const now = new Date();
    const arr: WeekPoint[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);

      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: "short" });

      const value = orders
        .filter((o) => o.status === "delivered")
        .filter((o) => (o.updated_at ?? o.created_at).slice(0, 10) === key)
        .reduce((sum, o) => sum + (o.price ?? 0), 0);

      arr.push({ label, value });
    }

    return arr;
  }, [orders]);

  const weeklyMax = Math.max(...weekly.map((x) => x.value), 1);

  const openOrder = (o: OrderRow) => {
    setSelectedOrder(o);

    setDeliveryMode("upload");
    setDriveLink(o.final_drive_link ?? "");
    setDeliveryNote(o.delivery_note ?? "");
    setSelectedFile(null);
  };

  const acceptOrder = async (orderId: string) => {
    if (!profile?.id) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) return alert(error.message);

    alert("✅ Order accepted");
    await refreshOrders(profile.id);

    // ✅ keep open on same order after accept
    const latest = orders.find((x) => x.id === orderId);
    if (latest) {
      setSelectedOrder({ ...latest, status: "in_progress" });
    }
  };

  const rejectOrder = async (orderId: string) => {
    if (!profile?.id) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (error) return alert(error.message);

    alert("✅ Order rejected");
    await refreshOrders(profile.id);
    setSelectedOrder(null);
  };

  const uploadSelectedFile = async (orderId: string) => {
    if (!profile?.id) return;
    if (!selectedFile) {
      alert("Please choose a video file first.");
      return;
    }

    setUploading(true);

    try {
      const bucket = "creator-deliveries";
      const ext = selectedFile.name.split(".").pop() || "mp4";
      const path = `${profile.id}/deliveries/order-${orderId}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, selectedFile, { upsert: true });

      if (upErr) {
        alert("Upload failed: " + upErr.message);
        setUploading(false);
        return;
      }

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      const finalUrl = pub.publicUrl;

      const { error: dbErr } = await supabase
        .from("orders")
        .update({
          final_video_url: finalUrl,
          final_drive_link: null,
          delivery_note: deliveryNote || null,
          status: "delivered",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (dbErr) {
        alert("Failed to save delivery: " + dbErr.message);
        setUploading(false);
        return;
      }

      alert("✅ Delivered successfully (MP4 uploaded)!");

      setSelectedFile(null);
      setDeliveryNote("");
      setDriveLink("");

      await refreshOrders(profile.id);

      // ✅ CHANGE 2: After delivery, go to Deliveries tab automatically
      setSelectedOrder(null);
      setTab("deliveries");
    } catch (e: any) {
      alert("Upload failed: " + (e?.message ?? "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const deliverDriveLink = async (orderId: string) => {
    if (!profile?.id) return;

    const link = driveLink.trim();
    if (!link.startsWith("http")) {
      alert("Please paste a valid Drive link.");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({
        final_drive_link: link,
        final_video_url: null,
        delivery_note: deliveryNote || null,
        status: "delivered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      alert("Failed: " + error.message);
      return;
    }

    alert("✅ Delivered successfully (Drive link submitted)!");

    setDeliveryNote("");
    setDriveLink("");
    setSelectedFile(null);

    await refreshOrders(profile.id);

    // ✅ CHANGE 2: After delivery, go to Deliveries tab automatically
    setSelectedOrder(null);
    setTab("deliveries");
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070D] flex items-center justify-center text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-5">
          <p className="font-extrabold text-lg">Loading Creator Dashboard…</p>
          <p className="text-sm text-white/60 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#05070D]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#070A10] via-[#05070D] to-[#05070D]" />
      <DarkBlobs />

      <div className="relative z-10 p-4">
        <div className="max-w-[1500px] mx-auto grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-5">
          <CreatorSidebar activeTab={tab} onTabChange={setTab} />

          <main className="rounded-3xl border border-white/10 bg-[#0a0d14]/75 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] overflow-hidden">
            {/* Topbar */}
            <div className="px-6 py-5 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 w-full max-w-xl">
                <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
                  🔎
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders by product or company..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/45 outline-none focus:border-white/25 transition"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="text-xs text-white/55">Signed in as</p>
                  <p className="text-sm text-white font-bold">{email}</p>
                </div>

                <button
                  onClick={() => router.push("/profile/view")}
                  className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-white"
                  title="Profile"
                >
                  👤
                </button>

                <button
                  onClick={logout}
                  className="rounded-2xl bg-white/10 border border-white/10 text-white font-bold px-5 py-3 hover:bg-white/15 transition"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-7">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <div>
                  <h1 className="text-3xl font-extrabold text-white">
                    Welcome, {creatorProfile?.creator_name ?? "Creator"} 👋
                  </h1>
                  <p className="text-white/60 mt-1">
                    Accept orders, deliver content, and earn more.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push("/profile/view")}
                    className="rounded-2xl bg-white/10 border border-white/10 text-white font-bold px-5 py-3 hover:bg-white/15 transition"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => router.push("/profile/edit")}
                    className="rounded-2xl bg-gradient-to-r from-[#6d5dfc] to-[#4b7bff] text-white font-extrabold px-5 py-3 hover:opacity-95 transition"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              <div className="mt-7 flex gap-2 flex-wrap">
                <TabDark active={tab === "dashboard"} onClick={() => setTab("dashboard")}>
                  Dashboard
                </TabDark>
                <TabDark active={tab === "orders"} onClick={() => setTab("orders")}>
                  Orders
                </TabDark>
                <TabDark
                  active={tab === "deliveries"}
                  onClick={() => setTab("deliveries")}
                >
                  Deliveries
                </TabDark>
                <TabDark active={tab === "profile"} onClick={() => setTab("profile")}>
                  Profile
                </TabDark>
              </div>

              {!selectedOrder && tab === "dashboard" && (
                <>
                  <div className="mt-7 grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <MetricCard
                      title="Completed Earnings"
                      value={`₹ ${completedEarnings}`}
                      sub="Based on delivered orders"
                      icon="💰"
                    />
                    <MetricCard
                      title="Pending Orders"
                      value={`${orders.filter((o) => o.status === "pending").length}`}
                      sub="Accept to start"
                      icon="📥"
                    />
                    <MetricCard
                      title="Active Work"
                      value={`${orders.filter((o) =>
                        ["in_progress", "revision_requested"].includes(o.status)
                      ).length}`}
                      sub="Deliver your best"
                      icon="🎬"
                    />
                  </div>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-white font-extrabold text-lg">
                          Earnings Analytics
                        </p>
                        <p className="text-sm text-white/60 mt-1">
                          Weekly view (delivered orders)
                        </p>
                      </div>
                      <p className="text-sm text-white/55">Last 7 days</p>
                    </div>

                    <div className="mt-6 grid grid-cols-7 gap-3 items-end h-[140px]">
                      {weekly.map((w) => (
                        <div
                          key={w.label}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="w-full h-[110px] flex items-end">
                            <div
                              className="w-full rounded-2xl bg-white/10 border border-white/10"
                              style={{
                                height: `${Math.max(
                                  8,
                                  (w.value / weeklyMax) * 110
                                )}px`,
                              }}
                              title={`₹${w.value}`}
                            />
                          </div>
                          <p className="text-[11px] text-white/60">{w.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {!selectedOrder && tab === "orders" && (
                <div className="mt-7 space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                      <p className="text-white font-extrabold text-lg">
                        No orders found
                      </p>
                      <p className="text-sm text-white/60 mt-1">
                        Orders will appear when startups hire you.
                      </p>
                    </div>
                  ) : (
                    filteredOrders.map((o) => (
                      <OrderCardCreator key={o.id} o={o} onView={() => openOrder(o)} />
                    ))
                  )}
                </div>
              )}

              {!selectedOrder && tab === "deliveries" && (
                <div className="mt-7 space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <p className="text-white font-extrabold text-lg">Deliveries</p>
                    <p className="text-sm text-white/60 mt-1">
                      Your delivered orders will show here automatically.
                    </p>
                  </div>

                  {orders.filter((o) => o.status === "delivered").length === 0 ? (
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                      <p className="text-white font-bold">No deliveries yet</p>
                      <p className="text-sm text-white/60 mt-1">
                        Deliver an order and it will appear here.
                      </p>
                    </div>
                  ) : (
                    orders
                      .filter((o) => o.status === "delivered")
                      .map((o) => (
                        <div
                          key={o.id}
                          className="rounded-3xl border border-white/10 bg-white/5 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-white font-extrabold text-lg">
                                {o.project_title ?? "Untitled"}
                              </p>
                              <p className="text-sm text-white/60 mt-1">
                                {o.company_name ?? "Startup"} •{" "}
                                {o.product_name ?? "Product"}
                              </p>
                              <p className="text-xs text-white/45 mt-2">
                                Delivered:{" "}
                                {new Date(o.updated_at ?? o.created_at).toLocaleString()}
                              </p>
                            </div>

                            <button
                              onClick={() => openOrder(o)}
                              className="rounded-2xl bg-gradient-to-r from-[#6d5dfc] to-[#4b7bff] text-white font-extrabold px-4 py-2 hover:opacity-95 transition"
                            >
                              View
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <InfoBox label="Status" value={o.status} />
                            <InfoBox label="Budget" value={`₹ ${o.price ?? 0}`} />
                            <InfoBox
                              label="Deadline"
                              value={`${o.deadline_days ?? "-"} days`}
                            />
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}

              {!selectedOrder && tab === "profile" && (
                <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-white font-extrabold text-lg">
                    Creator Profile
                  </p>
                  <p className="text-sm text-white/60 mt-1">
                    View or edit your profile.
                  </p>

                  <div className="mt-5 flex gap-3 flex-wrap">
                    <button
                      onClick={() => router.push("/profile/view")}
                      className="rounded-2xl bg-white/10 border border-white/10 text-white font-bold px-5 py-3 hover:bg-white/15 transition"
                    >
                      View Profile
                    </button>

                    <button
                      onClick={() => router.push("/profile/edit")}
                      className="rounded-2xl bg-gradient-to-r from-[#6d5dfc] to-[#4b7bff] text-white font-extrabold px-5 py-3 hover:opacity-95 transition"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}

              {selectedOrder && (
                <div className="mt-7 rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-extrabold text-xl">
                        {selectedOrder.project_title ?? "Untitled Project"}
                      </p>
                      <p className="text-sm text-white/60 mt-1">
                        {selectedOrder.company_name ?? "Startup"} •{" "}
                        {selectedOrder.product_name ?? "Product"}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="rounded-2xl bg-white/10 border border-white/10 text-white font-bold px-4 py-2 hover:bg-white/15 transition"
                    >
                      Back
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoBox label="Status" value={selectedOrder.status} />
                    <InfoBox label="Budget" value={`₹ ${selectedOrder.price ?? 0}`} />
                    <InfoBox
                      label="Deadline"
                      value={`${selectedOrder.deadline_days ?? "-"} days`}
                    />
                  </div>

                  <div className="mt-5">
                    <p className="text-sm text-white/70 font-bold mb-2">
                      Project Brief
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-white/85 text-sm leading-relaxed">
                      {selectedOrder.project_brief ?? "-"}
                    </div>
                  </div>

                  {selectedOrder.revision_note && (
                    <div className="mt-5 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-4">
                      <p className="text-amber-200 font-extrabold">
                        Revision Requested
                      </p>
                      <p className="text-sm text-amber-200/80 mt-1">
                        {selectedOrder.revision_note}
                      </p>
                    </div>
                  )}

                  {selectedOrder.status === "pending" && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => rejectOrder(selectedOrder.id)}
                        className="flex-1 rounded-2xl bg-white/10 border border-white/10 text-white font-extrabold py-3 hover:bg-white/15 transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => acceptOrder(selectedOrder.id)}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-[#6d5dfc] to-[#4b7bff] text-white font-extrabold py-3 hover:opacity-95 transition"
                      >
                        Accept
                      </button>
                    </div>
                  )}

                  {(selectedOrder.status === "in_progress" ||
                    selectedOrder.status === "revision_requested") && (
                    <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 shadow-lg">
                      <p className="text-white font-extrabold">
                        Deliver Final Content
                      </p>
                      <p className="text-sm text-white/60 mt-1">
                        Choose Upload MP4 OR Drive link. Then click Confirm.
                      </p>

                      <div className="mt-4 flex gap-2 flex-wrap">
                        <button
                          onClick={() => setDeliveryMode("upload")}
                          className={[
                            "px-4 py-2 rounded-2xl border text-sm font-bold transition",
                            deliveryMode === "upload"
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-white/5 border-white/10 text-white/65 hover:bg-white/10 hover:text-white",
                          ].join(" ")}
                        >
                          Upload MP4
                        </button>

                        <button
                          onClick={() => setDeliveryMode("drive")}
                          className={[
                            "px-4 py-2 rounded-2xl border text-sm font-bold transition",
                            deliveryMode === "drive"
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-white/5 border-white/10 text-white/65 hover:bg-white/10 hover:text-white",
                          ].join(" ")}
                        >
                          Drive Link
                        </button>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-white/70 font-bold mb-2">
                          Delivery note (optional)
                        </p>
                        <textarea
                          value={deliveryNote}
                          onChange={(e) => setDeliveryNote(e.target.value)}
                          className="w-full min-h-[90px] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/20 placeholder:text-white/35"
                          placeholder="Explain what you delivered..."
                        />
                      </div>

                      {deliveryMode === "drive" && (
                        <div className="mt-4">
                          <p className="text-sm text-white/70 font-bold mb-2">
                            Paste Drive link
                          </p>
                          <input
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none focus:border-white/20 placeholder:text-white/35"
                            placeholder="https://drive.google.com/..."
                          />

                          <button
                            onClick={() => deliverDriveLink(selectedOrder.id)}
                            disabled={uploading}
                            className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#6d5dfc] to-[#4b7bff] text-white font-extrabold py-3 hover:opacity-95 transition disabled:opacity-60"
                          >
                            Confirm Drive Delivery
                          </button>
                        </div>
                      )}

                      {deliveryMode === "upload" && (
                        <div className="mt-4">
                          <p className="text-sm text-white/70 font-bold mb-2">
                            Choose MP4 file
                          </p>

                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <input
                              type="file"
                              accept="video/mp4,video/*"
                              disabled={uploading}
                              onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setSelectedFile(f);
                              }}
                              className="block w-full text-sm text-white/80 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white file:font-bold hover:file:bg-white/15"
                            />

                            {selectedFile && (
                              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-bold truncate text-white">
                                    {selectedFile.name}
                                  </p>
                                  <p className="text-xs text-white/60">
                                    {(selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                                    MB
                                  </p>
                                </div>

                                <button
                                  onClick={removeSelectedFile}
                                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/10 hover:bg-white/15 transition text-xs font-bold text-white"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => uploadSelectedFile(selectedOrder.id)}
                            disabled={uploading}
                            className="mt-4 w-full rounded-2xl bg-white text-slate-900 font-extrabold py-3 hover:bg-white/90 transition disabled:opacity-60"
                          >
                            {uploading ? "Uploading..." : "Confirm Upload"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {(selectedOrder.final_video_url || selectedOrder.final_drive_link) && (
                    <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-white font-extrabold">Your Delivery</p>

                      {selectedOrder.final_video_url && (
                        <a
                          href={selectedOrder.final_video_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-300 underline text-sm block mt-2"
                        >
                          Open Uploaded Video
                        </a>
                      )}

                      {selectedOrder.final_drive_link && (
                        <a
                          href={selectedOrder.final_drive_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-300 underline text-sm block mt-2"
                        >
                          Open Drive Link
                        </a>
                      )}

                      <p className="text-sm text-white/60 mt-3">
                        Status:{" "}
                        <b className="text-white">{selectedOrder.status}</b>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI Components ---------- */

function TabDark({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-2xl px-4 py-2 border font-bold transition text-sm",
        active
          ? "bg-white/10 border-white/20 text-white"
          : "bg-white/5 border-white/10 text-white/65 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function MetricCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/60 text-sm font-semibold">{title}</p>
          <p className="text-white text-2xl font-extrabold mt-2">{value}</p>
          <p className="text-sm text-emerald-300/80 mt-2">{sub}</p>
        </div>

        <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white/85">
          {icon}
        </div>
      </div>
    </div>
  );
}

function OrderCardCreator({
  o,
  onView,
}: {
  o: OrderRow;
  onView: () => void;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white font-extrabold text-lg">
            {o.project_title ?? "Untitled"}
          </p>
          <p className="text-sm text-white/60 mt-1">
            {o.company_name ?? "Startup"} • {o.product_name ?? "Product"}
          </p>
          <p className="text-xs text-white/45 mt-2">
            Created: {new Date(o.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/10 text-white/85">
            {o.status}
          </span>

          <button
            onClick={onView}
            className="rounded-2xl bg-gradient-to-r from-[#6d5dfc] to-[#4b7bff] text-white font-extrabold px-4 py-2 hover:opacity-95 transition"
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs text-white/55 font-bold">{label}</p>
      <p className="text-white font-extrabold mt-1">{value}</p>
    </div>
  );
}

function DarkBlobs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[#6d5dfc]/15 blur-3xl" />
      <div className="absolute top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#4b7bff]/12 blur-3xl" />
      <div className="absolute bottom-[-200px] left-[35%] h-[620px] w-[620px] rounded-full bg-[#00d4ff]/10 blur-3xl" />
    </div>
  );
}