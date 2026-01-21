"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Tab = "dashboard" | "marketplace" | "projects" | "messages" | "billing";

type CreatorRow = {
  user_id: string;
  creator_name: string | null;
  niches: string | null;
  portfolio_link: string | null;
  profile_image: string | null;
  thumbnail_url: string | null;
};

type StartupProfile = {
  user_id: string;
  company_name: string | null;
};

type OrderRow = {
  id: string;
  startup_id: string;
  creator_id: string;
  status: string;

  project_title: string | null;
  project_brief: string | null;

  product_name: string | null;
  product_type: string | null;
  product_description: string | null;
  company_name: string | null;

  website_link: string | null;
  instagram_handle: string | null;

  video_type: string | null;
  deadline_days: number | null;
  price: number | null;

  created_at: string;

  // startup uploads
  product_media_urls?: string[] | null;

  // creator delivery
  final_video_url: string | null;
  final_drive_link: string | null;
};

type CreatorCardData = CreatorRow & {
  rating: number;
};

function getFakeRating(seed: string) {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n += seed.charCodeAt(i);
  const base = 4.0 + (n % 10) / 10;
  return Math.min(5, base);
}

const getPriceFromDeadline = (days: number) => {
  if (days === 1) return 2000;
  if (days === 3) return 1500;
  if (days === 4) return 1000;
  return 1500;
};

async function uploadStartupProductFile(file: File, userId: string) {
  const safeName = file.name.replaceAll(" ", "-").toLowerCase();
  const path = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("startup-products")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from("startup-products").getPublicUrl(path);
  return data.publicUrl;
}

export default function StartupDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  const [startupProfile, setStartupProfile] = useState<StartupProfile | null>(
    null
  );

  const [creators, setCreators] = useState<CreatorCardData[]>([]);
  const [search, setSearch] = useState("");

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  // Hire modal
  const [hireOpen, setHireOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<CreatorCardData | null>(
    null
  );

  // hire fields
  const [projectTitle, setProjectTitle] = useState("");
  const [projectBrief, setProjectBrief] = useState("");

  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState<"physical" | "online" | "">("");
  const [productDescription, setProductDescription] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [websiteLink, setWebsiteLink] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");

  const [videoType, setVideoType] = useState("1 Reel (15-30 sec)");
  const [deadlineDays, setDeadlineDays] = useState<number>(3);

  // ✅ Product Media Upload state
  const [productFiles, setProductFiles] = useState<File[]>([]);
  const [uploadingProductMedia, setUploadingProductMedia] = useState(false);

  // smooth entrance
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Load dashboard initial
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

      // Must have role = startup
      const { data: baseProfile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!baseProfile?.role) {
        router.push("/choose-role");
        return;
      }

      if (baseProfile.role !== "startup") {
        router.push("/dashboard/creator");
        return;
      }

      // Startup profile required
      const { data: sp } = await supabase
        .from("startup_profiles")
        .select("user_id, company_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!sp) {
        router.push("/onboarding/startup");
        return;
      }

      setStartupProfile(sp as StartupProfile);

      // creators (IMPORTANT: include thumbnail_url)
      const { data: creatorsData, error: creatorsErr } = await supabase
        .from("creator_profiles")
        .select(
          "user_id, creator_name, niches, portfolio_link, profile_image, thumbnail_url"
        );

      if (creatorsErr) {
        console.log("Creators load error:", creatorsErr.message);
      }

      const normalizedCreators: CreatorCardData[] = (creatorsData ?? []).map(
        (c: any) => ({
          ...(c as CreatorRow),
          rating: getFakeRating(c.creator_name ?? ""),
        })
      );

      setCreators(normalizedCreators);

      // Orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("startup_id", user.id)
        .order("created_at", { ascending: false });

      setOrders((ordersData ?? []) as OrderRow[]);

      setLoading(false);
    };

    load();
  }, [router]);

  // ✅ REAL-TIME STATUS refresh (every 3 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("startup_id", user.id)
        .order("created_at", { ascending: false });

      setOrders((ordersData ?? []) as OrderRow[]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const filteredCreators = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return creators;

    return creators.filter((c) => {
      const name = (c.creator_name ?? "").toLowerCase();
      const niches = (c.niches ?? "").toLowerCase();
      return name.includes(q) || niches.includes(q);
    });
  }, [search, creators]);

  const openHire = (creator: CreatorCardData) => {
    setSelectedCreator(creator);

    setProjectTitle("");
    setProjectBrief("");

    setProductName("");
    setProductType("");
    setProductDescription("");
    setCompanyName(startupProfile?.company_name ?? "");

    setWebsiteLink("");
    setInstagramHandle("");

    setVideoType("1 Reel (15-30 sec)");
    setDeadlineDays(3);

    setProductFiles([]);
    setUploadingProductMedia(false);

    setHireOpen(true);
  };

  const confirmHire = async () => {
    if (!selectedCreator?.user_id) return;

    const price = getPriceFromDeadline(deadlineDays);

    if (!projectTitle.trim()) return alert("Please enter Project title");
    if (!productName.trim()) return alert("Please enter Product / Brand name");
    if (!productType.trim()) return alert("Please select Product type");
    if (!projectBrief.trim()) return alert("Please enter Brief / requirements");

    // ✅ optional by default, required for physical
    if (productType === "physical" && productFiles.length === 0) {
      alert("For physical products, please upload at least 1 product image/video.");
      return;
    }

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    setUploadingProductMedia(true);

    let mediaUrls: string[] = [];
    try {
      for (const file of productFiles) {
        const url = await uploadStartupProductFile(file, user.id);
        mediaUrls.push(url);
      }
    } catch (e: any) {
      setUploadingProductMedia(false);
      alert("Upload failed: " + (e?.message || "Unknown error"));
      return;
    }

    const { error } = await supabase.from("orders").insert({
      startup_id: user.id,
      creator_id: selectedCreator.user_id,
      status: "pending",

      project_title: projectTitle,
      project_brief: projectBrief,

      product_name: productName,
      product_type: productType,
      product_description: productDescription || null,
      company_name: companyName || null,

      website_link: websiteLink || null,
      instagram_handle: instagramHandle || null,

      video_type: videoType,
      deadline_days: deadlineDays,
      price: price,

      // ✅ NEW: uploaded product media
      product_media_urls: mediaUrls,
    });

    setUploadingProductMedia(false);

    if (error) {
      alert("Hire failed: " + error.message);
      return;
    }

    alert("✅ Order placed successfully!");
    setHireOpen(false);
    setSelectedCreator(null);
    setActiveTab("projects");
  };

  const totalSpendCompleted = useMemo(() => {
    return orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + (o.price ?? 0), 0);
  }, [orders]);

  const activeProjectsCount = useMemo(() => {
    return orders.filter((o) =>
      ["pending", "accepted", "in_progress", "submitted"].includes(o.status)
    ).length;
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060B16] text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <p className="font-bold text-lg">Loading Startup Dashboard...</p>
          <p className="text-sm text-white/70 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  // ---------------- UI ----------------

  return (
    <div className="min-h-screen bg-[#060B16] relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-black-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-40 h-[560px] w-[560px] rounded-full bg-cyan-400/10 blur-3xl" />

      {/* Top bar */}
      <div className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-red-500 flex items-center justify-center font-black text-white">
              M
            </div>
            <div>
              <p className="text-white font-extrabold leading-tight">
                MediaMatrix UGC Marketplace
              </p>
              <p className="text-white/60 text-xs">Startup Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-white/70 text-sm">
                Live: Status sync active
              </span>
            </div>

            <div className="hidden md:block text-right">
              <p className="text-xs text-white/50">Logged in</p>
              <p className="text-sm font-bold text-white">{email}</p>
            </div>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/15 transition"
            >
      <div
  onClick={() => router.push("/profile/view")}
  className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-white font-bold hover:bg-white/15 transition cursor-pointer select-none"
>
  Profile
</div>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-6 grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
          <div className="p-5">
            <p className="text-white font-extrabold text-lg">
              {startupProfile?.company_name ?? "Startup"}
            </p>
            <p className="text-white/60 text-xs mt-1">Workspace</p>

            <div className="mt-5 space-y-2">
              <SideBtn
                active={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
                label="Dashboard"
              />
              <SideBtn
                active={activeTab === "marketplace"}
                onClick={() => setActiveTab("marketplace")}
                label="Marketplace"
              />
              <SideBtn
                active={activeTab === "projects"}
                onClick={() => setActiveTab("projects")}
                label="My Projects"
              />
              <SideBtn
                active={activeTab === "messages"}
                onClick={() => setActiveTab("messages")}
                label="Messages"
              />
              <SideBtn
                active={activeTab === "billing"}
                onClick={() => setActiveTab("billing")}
                label="Billing"
              />
            </div>
          </div>

          <div className="border-t border-white/10 p-5">
            <p className="text-white/70 text-xs font-bold mb-2">Quick tip</p>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-white font-bold text-sm">
                Affordable UGC, real results
              </p>
              <p className="text-white/60 text-xs mt-1 leading-relaxed">
                Hire smaller creators fast and track deliverables without
                agencies.
              </p>
              <button
                onClick={() => setActiveTab("marketplace")}
                className="mt-4 w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-black-500 text-white font-extrabold py-3 hover:opacity-95 transition"
              >
                Go to Marketplace
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main
          className={[
            "rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden",
            "transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          ].join(" ")}
        >
          {/* Header section */}
          <div className="p-7 border-b border-white/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <p className="text-white font-extrabold text-3xl">
                  Welcome back, {startupProfile?.company_name ?? "Startup"}{" "}
                  <span className="text-white/70">👋</span>
                </p>
                <p className="text-white/60 text-sm mt-1">
                  Browse creators, hire instantly, and track UGC deliveries in a
                  calm workspace.
                </p>
              </div>

              {/* ✅ Removed Launch Campaign + Download Report */}
            </div>
          </div>

          {/* Content */}
          <div className="p-7">
            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Metrics */}
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <MetricCard
                    title="Total Spend (Completed)"
                    value={`₹${totalSpendCompleted}`}
                    sub="Based on completed orders"
                  />
                  <MetricCard
                    title="Active Projects"
                    value={`${activeProjectsCount}`}
                    sub="Pending / Accepted / In progress"
                  />
                  <MetricCard
                    title="Avg. Response Time"
                    value={`4.2h`}
                    sub="Demo (we’ll calculate later)"
                  />
                  <MetricCard title="Platform Rating" value="Elite" sub="Demo status" />
                </div>

                {/* Activity / Orders preview */}
                <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <p className="text-white font-extrabold">
                      Recent Orders (Live)
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      Auto-refresh every 3 seconds.
                    </p>

                    <div className="mt-4 space-y-3">
                      {orders.length === 0 ? (
                        <p className="text-white/60 text-sm">
                          No orders yet. Go to Marketplace to hire creators.
                        </p>
                      ) : (
                        orders.slice(0, 5).map((o) => (
                          <button
                            key={o.id}
                            onClick={() => {
                              setSelectedOrder(o);
                              setActiveTab("projects");
                            }}
                            className="w-full text-left rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-black/30 transition"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-white font-bold">
                                  {o.project_title ?? "Untitled Project"}
                                </p>
                                <p className="text-white/60 text-xs mt-1">
                                  {o.product_name ?? "-"} •{" "}
                                  {o.video_type ?? "Video"}
                                </p>
                              </div>
                              <StatusPill status={o.status} />
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <p className="text-white font-extrabold">Quick Actions</p>
                    <p className="text-white/60 text-xs mt-1">
                      Common things you’ll do.
                    </p>

                    <div className="mt-4 grid gap-2">
                      <QuickBtn
                        label="Browse creators"
                        onClick={() => setActiveTab("marketplace")}
                      />
                      <QuickBtn
                        label="Open my projects"
                        onClick={() => setActiveTab("projects")}
                      />
                      <QuickBtn
                        label="Billing (coming soon)"
                        onClick={() => setActiveTab("billing")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MARKETPLACE */}
            {activeTab === "marketplace" && (
              <div className="space-y-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <p className="text-white font-extrabold text-lg">Marketplace</p>

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Find creators (fitness, skincare, reels...)"
                    className="w-full md:w-[520px] rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
                  />
                </div>

                {filteredCreators.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                    <p className="text-white font-extrabold text-lg">
                      No creators found
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      Try another niche keyword.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredCreators.map((c) => (
                      <CreatorCard
                        key={c.user_id}
                        creator={c}
                        onView={() => router.push(`/creators/${c.user_id}`)}
                        onHire={() => openHire(c)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white font-extrabold text-lg">My Projects</p>
                  <button
                    onClick={() => setActiveTab("marketplace")}
                    className="px-4 py-2 rounded-2xl border border-white/10 bg-white/10 text-white font-bold hover:bg-white/15 transition"
                  >
                    + Hire Creator
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                    <p className="text-white font-extrabold text-lg">
                      No projects yet
                    </p>
                    <p className="text-white/60 text-sm mt-1">
                      Create your first order from Marketplace.
                    </p>
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
                    {/* Orders list */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-white font-extrabold">Orders</p>
                      <div className="mt-4 space-y-2 max-h-[520px] overflow-auto pr-1">
                        {orders.map((o) => (
                          <button
                            key={o.id}
                            onClick={() => setSelectedOrder(o)}
                            className={[
                              "w-full text-left rounded-2xl p-4 border transition",
                              selectedOrder?.id === o.id
                                ? "border-indigo-400/40 bg-indigo-500/10"
                                : "border-white/10 bg-black/20 hover:bg-black/30",
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-white font-bold">
                                  {o.project_title ?? "Untitled"}
                                </p>
                                <p className="text-white/60 text-xs mt-1">
                                  {o.product_name ?? "-"} •{" "}
                                  {o.video_type ?? "Video"}
                                </p>
                              </div>
                              <StatusPill status={o.status} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Order detail */}
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                      {!selectedOrder ? (
                        <p className="text-white/60 text-sm">
                          Select an order to view details.
                        </p>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-white font-extrabold text-xl">
                                {selectedOrder.project_title ?? "Untitled"}
                              </p>
                              <p className="text-white/60 text-xs mt-1">
                                Created:{" "}
                                {new Date(
                                  selectedOrder.created_at
                                ).toLocaleString()}
                              </p>
                            </div>

                            <StatusPill status={selectedOrder.status} />
                          </div>

                          <div className="mt-5 grid sm:grid-cols-2 gap-3">
                            <InfoBox
                              label="Product / Brand"
                              value={selectedOrder.product_name ?? "-"}
                            />
                            <InfoBox
                              label="Video type"
                              value={selectedOrder.video_type ?? "-"}
                            />
                            <InfoBox
                              label="Deadline (days)"
                              value={
                                selectedOrder.deadline_days
                                  ? String(selectedOrder.deadline_days)
                                  : "-"
                              }
                            />
                            <InfoBox
                              label="Price"
                              value={
                                selectedOrder.price
                                  ? `₹${selectedOrder.price}`
                                  : "-"
                              }
                            />
                          </div>

                          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-white font-bold text-sm">
                              Brief / requirements
                            </p>
                            <p className="text-white/70 text-sm mt-2 leading-relaxed">
                              {selectedOrder.project_brief ?? "-"}
                            </p>
                          </div>

                          {/* ✅ Startup uploaded product media */}
                          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-white font-bold text-sm mb-2">
                              Product Media (uploaded by startup)
                            </p>

                            {(selectedOrder.product_media_urls ?? []).length ===
                            0 ? (
                              <p className="text-white/60 text-sm">
                                No product media uploaded.
                              </p>
                            ) : (
                              <div className="grid sm:grid-cols-2 gap-3">
                                {(selectedOrder.product_media_urls ?? []).map(
                                  (url, idx) => {
                                    const lower = url.toLowerCase();
                                    const isVideo =
                                      lower.endsWith(".mp4") ||
                                      lower.endsWith(".mov") ||
                                      lower.endsWith(".webm");

                                    if (isVideo) {
                                      return (
                                        <div
                                          key={idx}
                                          className="rounded-xl overflow-hidden border border-white/10 bg-black/30"
                                        >
                                          <video
                                            controls
                                            className="w-full h-[220px] bg-black object-contain"
                                            src={url}
                                          />
                                        </div>
                                      );
                                    }

                                    return (
                                      <a
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        className="rounded-xl overflow-hidden border border-white/10 bg-black/30 block"
                                      >
                                        <img
                                          src={url}
                                          alt="product"
                                          className="w-full h-[220px] object-cover"
                                        />
                                      </a>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>

                          {/* ✅ Creator Delivery visible */}
                          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-white font-bold text-sm mb-2">
                              Creator Delivery
                            </p>

                            {!selectedOrder.final_video_url &&
                            !selectedOrder.final_drive_link ? (
                              <p className="text-white/60 text-sm">
                                No delivery uploaded yet.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {selectedOrder.final_video_url && (
                                  <div className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
                                    <video
                                      controls
                                      className="w-full max-h-[420px] bg-black object-contain"
                                      src={selectedOrder.final_video_url}
                                    />
                                  </div>
                                )}

                                {selectedOrder.final_drive_link && (
                                  <a
                                    href={selectedOrder.final_drive_link}
                                    target="_blank"
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-black-600 hover:bg-black-500 transition font-bold text-white"
                                  >
                                    Open Drive Link
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {activeTab === "messages" && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <p className="text-white font-extrabold text-lg">Messages</p>
                <p className="text-white/60 text-sm mt-2">
                  Coming soon — creator chat & updates.
                </p>
              </div>
            )}

            {/* Billing */}
            {activeTab === "billing" && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
                <p className="text-white font-extrabold text-lg">Billing</p>
                <p className="text-white/60 text-sm mt-2">
                  Coming soon — payments and invoices.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ✅ Hire Modal */}
      {hireOpen && selectedCreator && (
        <HireModal
          creatorName={selectedCreator.creator_name ?? "Creator"}
          onClose={() => setHireOpen(false)}
          onConfirm={confirmHire}
          price={getPriceFromDeadline(deadlineDays)}
          projectTitle={projectTitle}
          setProjectTitle={setProjectTitle}
          projectBrief={projectBrief}
          setProjectBrief={setProjectBrief}
          productName={productName}
          setProductName={setProductName}
          productType={productType}
          setProductType={setProductType}
          productDescription={productDescription}
          setProductDescription={setProductDescription}
          companyName={companyName}
          setCompanyName={setCompanyName}
          websiteLink={websiteLink}
          setWebsiteLink={setWebsiteLink}
          instagramHandle={instagramHandle}
          setInstagramHandle={setInstagramHandle}
          videoType={videoType}
          setVideoType={setVideoType}
          deadlineDays={deadlineDays}
          setDeadlineDays={setDeadlineDays}
          productFiles={productFiles}
          setProductFiles={setProductFiles}
          uploading={uploadingProductMedia}
        />
      )}
    </div>
  );
}

/* -------------------- UI Components -------------------- */

function SideBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full text-left px-4 py-3 rounded-2xl font-bold text-sm transition border",
        active
          ? "bg-white text-slate-900 border-white shadow"
          : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function MetricCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <p className="text-white/60 text-xs font-bold">{title}</p>
      <p className="text-white text-2xl font-extrabold mt-2">{value}</p>
      <p className="text-white/50 text-xs mt-2">{sub}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-white/10 text-white",
    accepted: "bg-blue-500/20 text-blue-200",
    in_progress: "bg-indigo-500/20 text-indigo-200",
    submitted: "bg-amber-500/20 text-amber-200",
    completed: "bg-emerald-500/20 text-emerald-200",
    cancelled: "bg-red-500/20 text-red-200",
    rejected: "bg-red-500/20 text-red-200",
  };

  return (
    <span
      className={[
        "px-3 py-1 rounded-full text-xs font-extrabold border border-white/10",
        map[status] ?? "bg-white/10 text-white",
      ].join(" ")}
    >
      {status}
    </span>
  );
}

function QuickBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-white/10 py-3 text-white font-bold hover:bg-white/15 transition"
    >
      {label}
    </button>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-white/60 text-xs font-bold">{label}</p>
      <p className="text-white font-extrabold mt-1">{value}</p>
    </div>
  );
}

function CreatorCard({
  creator,
  onHire,
  onView,
}: {
  creator: CreatorCardData;
  onHire: () => void;
  onView: () => void;
}) {
  const thumb =
    creator.thumbnail_url ||
    creator.profile_image ||
    "https://dummyimage.com/600x340/111827/ffffff&text=UGC+Preview";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden hover:bg-white/10 transition">
      {/* ✅ Thumbnail */}
      <div className="relative">
        <img
          src={thumb}
          alt="thumbnail"
          className="h-[170px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-extrabold">
            {creator.creator_name ?? "Creator"}
          </p>
          <p className="text-white/70 text-xs">
            ⭐ {creator.rating.toFixed(1)} • UGC Creator
          </p>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {(creator.niches ?? "")
            .split(",")
            .map((n) => n.trim())
            .filter(Boolean)
            .slice(0, 3)
            .map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full border border-white/10 bg-white/10 text-white/80 text-xs font-bold"
              >
                {tag}
              </span>
            ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onView}
            className="rounded-2xl border border-white/10 bg-white/10 py-3 text-white font-bold hover:bg-white/15 transition"
          >
            View Profile
          </button>
          <button
            onClick={onHire}
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-500 py-3 text-white font-extrabold hover:opacity-95 transition"
          >
            Hire
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Hire Modal -------------------- */

function HireModal(props: {
  creatorName: string;
  onClose: () => void;
  onConfirm: () => void;

  price: number;

  projectTitle: string;
  setProjectTitle: (v: string) => void;

  projectBrief: string;
  setProjectBrief: (v: string) => void;

  productName: string;
  setProductName: (v: string) => void;

  productType: "physical" | "online" | "";
  setProductType: (v: "physical" | "online" | "") => void;

  productDescription: string;
  setProductDescription: (v: string) => void;

  companyName: string;
  setCompanyName: (v: string) => void;

  websiteLink: string;
  setWebsiteLink: (v: string) => void;

  instagramHandle: string;
  setInstagramHandle: (v: string) => void;

  videoType: string;
  setVideoType: (v: string) => void;

  deadlineDays: number;
  setDeadlineDays: (v: number) => void;

  productFiles: File[];
  setProductFiles: (files: File[]) => void;

  uploading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-gradient-to-b from-[#0B162A] to-[#060B16] p-6 shadow-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white font-extrabold text-xl">
              Hire {props.creatorName}
            </p>
            <p className="text-white/60 text-sm mt-1">
              Fill required details. Optional fields help creators deliver
              faster.
            </p>
          </div>

          <button
            onClick={props.onClose}
            className="px-3 py-2 rounded-2xl border border-white/10 bg-white/10 text-white font-bold hover:bg-white/15 transition"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <Field label="Project title *">
            <input
              value={props.projectTitle}
              onChange={(e) => props.setProjectTitle(e.target.value)}
              placeholder="Example: 1 UGC Reel for Face Wash"
              className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Product / Brand name *">
              <input
                value={props.productName}
                onChange={(e) => props.setProductName(e.target.value)}
                placeholder="Example: Pixora"
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
              />
            </Field>

            <Field label="Video type *">
              <select
                value={props.videoType}
                onChange={(e) => props.setVideoType(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white outline-none focus:border-white/25"
              >
                <option className="bg-white text-black">
                  1 Reel (15-30 sec)
                </option>
                <option className="bg-white text-black">
                  1 Reel (30-45 sec)
                </option>
                <option className="bg-white text-black">2 Reels Package</option>
                <option className="bg-white text-black">
                  1 Product Demo Video
                </option>
                <option className="bg-white text-black">UGC Testimonial</option>
              </select>
            </Field>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Product type *">
              <select
                value={props.productType}
                onChange={(e) => props.setProductType(e.target.value as any)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white outline-none focus:border-white/25"
              >
                <option value="" className="bg-white text-black">
                  Choose product type
                </option>
                <option value="physical" className="bg-white text-black">
                  Physical product
                </option>
                <option value="online" className="bg-white text-black">
                  Online product / service
                </option>
              </select>
            </Field>

            <Field label="Deadline + pricing *">
              <select
                value={props.deadlineDays}
                onChange={(e) => props.setDeadlineDays(Number(e.target.value))}
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white outline-none focus:border-white/25"
              >
                <option value={1} className="bg-white text-black">
                  24 hours / 1 day — ₹2000
                </option>
                <option value={3} className="bg-white text-black">
                  3 days — ₹1500
                </option>
                <option value={4} className="bg-white text-black">
                  4 days — ₹1000
                </option>
              </select>
              <p className="text-xs text-white/60 mt-2">
                Price:{" "}
                <span className="text-white font-extrabold">₹{props.price}</span>
              </p>
            </Field>
          </div>

          <Field label="Brief / requirements *">
            <textarea
              value={props.projectBrief}
              onChange={(e) => props.setProjectBrief(e.target.value)}
              placeholder="Hook, talking points, what to show, what NOT to show..."
              className="w-full min-h-[120px] rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
            />
          </Field>

          {/* ✅ NEW Upload section */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-white font-bold text-sm mb-2">
              Upload product images/videos (optional, but required for physical)
            </p>

            <input
              type="file"
              multiple
              accept="image/*,video/mp4,video/webm,video/quicktime"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                props.setProductFiles(files);
              }}
              className="w-full text-white"
            />

            {props.productFiles.length > 0 && (
              <p className="text-white/60 text-xs mt-2">
                Selected:{" "}
                <span className="text-white font-bold">
                  {props.productFiles.length}
                </span>{" "}
                file(s)
              </p>
            )}

            {props.productType === "physical" && props.productFiles.length === 0 && (
              <p className="text-xs text-amber-200 mt-2 font-bold">
                Physical product requires at least 1 upload.
              </p>
            )}
          </div>

          <Field label="Product description (optional)">
            <textarea
              value={props.productDescription}
              onChange={(e) => props.setProductDescription(e.target.value)}
              placeholder="What is the product? Who is it for?"
              className="w-full min-h-[90px] rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Company name (optional)">
              <input
                value={props.companyName}
                onChange={(e) => props.setCompanyName(e.target.value)}
                placeholder="Example: MediaMatrix"
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
              />
            </Field>

            <Field label="Website link (optional)">
              <input
                value={props.websiteLink}
                onChange={(e) => props.setWebsiteLink(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
              />
            </Field>
          </div>

          <Field label="Product Instagram handle (optional)">
            <input
              value={props.instagramHandle}
              onChange={(e) => props.setInstagramHandle(e.target.value)}
              placeholder="@brandname or https://instagram.com/brand"
              className="w-full rounded-2xl border border-white/10 bg-white/10 p-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
            />
          </Field>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-white font-bold text-sm">
              Cancellation policy (important)
            </p>
            <p className="text-white/60 text-xs mt-2 leading-relaxed">
              You can cancel an order only within{" "}
              <span className="text-white font-bold">5 hours</span> after placing
              it. After that, cancellation and refund are not available.
            </p>
          </div>

          <button
            onClick={props.onConfirm}
            disabled={props.uploading}
            className={[
              "w-full mt-1 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 py-4 text-white font-extrabold hover:opacity-95 transition",
              props.uploading ? "opacity-60 cursor-not-allowed" : "",
            ].join(" ")}
          >
            {props.uploading ? "Uploading..." : `Confirm Hire • ₹${props.price}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-white/80 text-sm font-bold mb-2">{label}</p>
      {children}
    </div>
  );
}