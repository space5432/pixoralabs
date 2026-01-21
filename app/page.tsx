import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070A10] text-slate-200 overflow-x-hidden scroll-smooth">
      {/* Background glow + floating shapes */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute top-24 right-[-140px] h-[420px] w-[420px] rounded-full bg-white/8 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-220px] left-[-180px] h-[520px] w-[520px] rounded-full bg-white/6 blur-3xl animate-pulse" />

        <div className="absolute top-32 left-10 h-16 w-16 rounded-full bg-white/10 blur-xl animate-float" />
        <div className="absolute top-64 right-24 h-20 w-20 rounded-full bg-white/10 blur-xl animate-float-delayed" />
        <div className="absolute bottom-40 left-1/2 h-24 w-24 rounded-full bg-white/10 blur-xl animate-float" />
      </div>

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center font-black text-white transition group-hover:scale-105 group-hover:bg-white/15">
              M
            </div>
            <div className="font-extrabold tracking-wide text-white">
              MEDIAMATRIX
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#why" className="hover:text-white transition">
              Why MediaMatrix
            </a>
            <a href="#how" className="hover:text-white transition">
              How it works
            </a>
            <a href="#for" className="hover:text-white transition">
              For Startups & Creators
            </a>
            <a href="#faq" className="hover:text-white transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-white/15 text-white hover:bg-white/10 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-white to-slate-300 text-black font-semibold hover:opacity-95 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className="relative">
        <section className="max-w-7xl mx-auto px-4 pt-16 pb-14">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm text-slate-200 hover:bg-white/10 transition">
                <span className="h-2 w-2 rounded-full bg-white/60 animate-pulse" />
                UGC built for early-stage growth
              </div>

              <h1 className="mt-5 text-4xl md:text-6xl font-extrabold text-white leading-tight">
                Affordable UGC for{" "}
                <span className="bg-gradient-to-r from-white via-slate-300 to-white bg-clip-text text-transparent animate-gradient-x">
                  new startups
                </span>
                .
                <br />
                Real work for{" "}
                <span className="bg-gradient-to-r from-slate-200 to-white bg-clip-text text-transparent">
                  small creators
                </span>
                .
              </h1>

              <p className="mt-4 text-slate-300 leading-relaxed max-w-xl">
                MediaMatrix connects startups that need high-performing content
                with creators who want consistent paid projects.
                <br />
                No agency markups. No unrealistic deals. Just clear briefs, fast
                delivery, and structured payouts.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.12)] text-center"
                >
                  Get Started
                </Link>

                <a
                  href="#how"
                  className="px-6 py-3 rounded-xl border border-white/15 text-white hover:bg-white/10 transition hover:scale-[1.02] active:scale-[0.98] text-center"
                >
                  See the workflow
                </a>
              </div>

              <div className="mt-9 grid grid-cols-3 gap-3 max-w-lg">
                <Stat title="Budget-friendly" sub="For small teams" />
                <Stat title="Creator-first" sub="Fair & simple" />
                <Stat title="Fast delivery" sub="Built for speed" />
              </div>
            </div>

            {/* Right card */}
            <div className="animate-slide-up">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_50px_rgba(255,255,255,0.08)] hover:bg-white/10 transition hover:scale-[1.01]">
                <h3 className="text-white font-bold text-xl">
                  What you get inside the platform
                </h3>

                <div className="mt-5 space-y-3">
                  <StepCard
                    number="1"
                    title="Sign up in seconds"
                    desc="Use Email or Google to create your account."
                  />
                  <StepCard
                    number="2"
                    title="Choose your role"
                    desc="Startup: hire creators. Creator: get projects."
                  />
                  <StepCard
                    number="3"
                    title="Complete a simple profile"
                    desc="Startups add company info. Creators add niche & samples."
                  />
                </div>

                <div className="mt-6 p-4 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 transition">
                  <p className="text-sm text-slate-200">
                    Next: projects, submissions, approvals, and payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHY SECTION */}
        <section id="why" className="max-w-7xl mx-auto px-4 pb-16 pt-6">
          <div className="animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Why MediaMatrix exists
            </h2>
            <p className="text-slate-300 mt-2 max-w-3xl">
              Startups should not have to pay premium agency pricing to test
              creatives. Creators should not have to depend only on “brand
              replies” to get paid work.
              <br />
              We built a fair marketplace where early-stage businesses and
              rising creators can grow together.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-5">
            <MiniFeature
              title="For startups: predictable cost"
              desc="Get UGC without burning your marketing budget."
            />
            <MiniFeature
              title="For creators: consistent projects"
              desc="Small creators get real opportunities, not empty promises."
            />
            <MiniFeature
              title="For both: structured workflow"
              desc="Brief → delivery → approval → payout with full clarity."
            />
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="max-w-7xl mx-auto px-4 pb-16 pt-6">
          <div className="animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              How it works
            </h2>
            <p className="text-slate-300 mt-2 max-w-2xl">
              A clean onboarding flow so people can start working immediately.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-5">
            <FeatureCard
              title="Step 1 — Create an account"
              points={[
                "Email signup or Google login",
                "Secure authentication (Supabase)",
                "Access your dashboard anytime",
              ]}
            />
            <FeatureCard
              title="Step 2 — Complete your profile"
              points={[
                "Startups add business details",
                "Creators add niche + portfolio",
                "Higher trust = more conversions",
              ]}
            />
            <FeatureCard
              title="Step 3 — Start projects"
              points={[
                "Post a brief / apply to a project",
                "Submit work inside the platform",
                "Approve and close delivery",
              ]}
            />
          </div>
        </section>

        {/* FOR WHO */}
        <section id="for" className="max-w-7xl mx-auto px-4 pb-16">
          <div className="animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              Made for both sides
            </h2>
            <p className="text-slate-300 mt-2 max-w-3xl">
              Whether you are launching a new product or building your creator
              career, MediaMatrix gives you a professional system to work with
              clarity.
            </p>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-5">
            <BigCard
              title="For Startups"
              subtitle="Hire creators without overspending."
              bullets={[
                "Company + product onboarding",
                "Clear briefs and timelines",
                "Organized submissions and revisions",
                "Budget-friendly creator options",
              ]}
              ctaHref="/signup"
              ctaText="Get Started as Startup"
            />
            <BigCard
              title="For Creators"
              subtitle="Get paid projects even as a small creator."
              bullets={[
                "Show your niche and sample videos",
                "Build trust with a clean profile",
                "Get projects that match your style",
                "Grow your portfolio with real clients",
              ]}
              ctaHref="/signup"
              ctaText="Get Started as Creator"
            />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-7xl mx-auto px-4 pb-20">
          <div className="animate-slide-up">
            <h2 className="text-2xl md:text-3xl font-bold text-white">FAQ</h2>
            <p className="text-slate-300 mt-2 max-w-2xl">
              Quick answers to the most common questions.
            </p>
          </div>

          <div className="mt-8 space-y-4 max-w-3xl">
            <Faq
              q="Is this platform only for big brands?"
              a="No. MediaMatrix is made for early-stage startups and small teams that want UGC without paying agency-level pricing."
            />
            <Faq
              q="Do creators need huge followers?"
              a="No. Small creators can get work based on skill, niche, and quality — not just followers."
            />
            <Faq
              q="What content types can be ordered?"
              a="UGC product videos, reels, edits, testimonials, app demos, voiceover videos, and more."
            />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="inline-flex justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-white to-slate-300 text-black font-semibold hover:opacity-95 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="inline-flex justify-center px-6 py-3 rounded-xl border border-white/15 text-white hover:bg-white/10 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Login
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8 text-sm text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} MEDIAMATRIX</p>
          <div className="flex gap-4">
            <Link className="hover:text-white transition" href="/login">
              Login
            </Link>
            <Link className="hover:text-white transition" href="/signup">
              Get Started
            </Link>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-14px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 7s ease-in-out infinite;
          animation-delay: 1.2s;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }

        @keyframes gradientX {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradientX 5s ease infinite;
        }
      `}</style>
    </div>
  );
}

function Stat({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition hover:scale-[1.02] active:scale-[0.99]">
      <p className="text-white font-bold text-lg">{title}</p>
      <p className="text-xs text-slate-300 mt-1">{sub}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition hover:scale-[1.01]">
      <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold">
        {number}
      </div>
      <div>
        <p className="text-white font-semibold">{title}</p>
        <p className="text-sm text-slate-300 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  points,
}: {
  title: string;
  points: string[];
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition hover:scale-[1.02]">
      <p className="text-white font-bold text-lg">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {points.map((p) => (
          <li key={p}>✅ {p}</li>
        ))}
      </ul>
    </div>
  );
}

function MiniFeature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition hover:scale-[1.02]">
      <p className="text-white font-semibold">{title}</p>
      <p className="text-sm text-slate-300 mt-2">{desc}</p>
    </div>
  );
}

function BigCard({
  title,
  subtitle,
  bullets,
  ctaHref,
  ctaText,
}: {
  title: string;
  subtitle: string;
  bullets: string[];
  ctaHref: string;
  ctaText: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-7 hover:bg-white/10 transition hover:scale-[1.01]">
      <p className="text-white font-extrabold text-xl">{title}</p>
      <p className="text-slate-300 mt-2">{subtitle}</p>

      <ul className="mt-5 space-y-2 text-sm text-slate-300">
        {bullets.map((b) => (
          <li key={b}>✅ {b}</li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className="mt-6 inline-flex w-full justify-center px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition hover:scale-[1.02] active:scale-[0.98]"
      >
        {ctaText}
      </Link>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition hover:scale-[1.01]">
      <p className="text-white font-semibold">{q}</p>
      <p className="text-sm text-slate-300 mt-2">{a}</p>
    </div>
  );
}