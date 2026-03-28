import BriefForm from "@/components/BriefForm";

export default function HomePage() {
  const outputs = [
    {
      icon: "🎨",
      label: "Event poster",
      desc: "Square and story formats with your branding",
    },
    {
      icon: "🎬",
      label: "16s promo reel",
      desc: "Live-action video cut with tempo and motion",
    },
    {
      icon: "🎙️",
      label: "Voiceover",
      desc: "AI narration tuned to your event tone",
    },
    {
      icon: "🎵",
      label: "Background music",
      desc: "Original soundtrack for reels and stories",
    },
    {
      icon: "🔗",
      label: "Registration-ready assets",
      desc: "QR support in poster and video",
    },
  ];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-[420px] bg-[radial-gradient(circle_at_18%_10%,rgba(99,102,241,0.32),transparent_42%),radial-gradient(circle_at_82%_8%,rgba(16,185,129,0.18),transparent_35%)]" />

      <div className="relative max-w-6xl mx-auto px-6 py-10 md:py-14">
        <div className="max-w-2xl mb-8 md:mb-10 mx-auto text-center">
          <div className="inline-flex items-center gap-2">
            <span className="text-[28px] sm:text-[36px] font-semibold tracking-tight bg-gradient-to-r from-indigo-200 via-violet-100 to-emerald-200 bg-clip-text text-transparent drop-shadow-[0_0_22px_rgba(129,140,248,0.35)]">
              LaunchLoop
            </span>
            <span className="text-lg sm:text-xl opacity-90">✨</span>
          </div>
          <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-zinc-100">
            Ship a{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-emerald-200 bg-clip-text text-transparent">
              winner-grade
            </span>{" "}
            promo kit in minutes
          </h1>
          <p className="mt-3 text-[15px] sm:text-base text-zinc-400 max-w-xl mx-auto">
            Drop in your event details once. LaunchLoop generates posters,
            video, voiceover, and soundtrack with one clean workflow.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-10 items-start">
          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-zinc-100">
                Create your promo kit
              </h2>
              <p className="mt-1 text-[13px] text-zinc-500">
                Fill in your brief and generate the full campaign instantly.
              </p>
              <div className="mt-5">
                <BriefForm />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 lg:pt-1 space-y-4">
            <div className="glass-card rounded-2xl p-5 overflow-hidden relative">
              <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl" />
              <h3 className="text-[13px] font-medium text-zinc-200 mb-1">
                What you get
              </h3>
              <p className="text-[12px] text-zinc-500 mb-4">
                Complete campaign kit, ready to publish.
              </p>
              <div className="space-y-2.5">
                {outputs.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.1] bg-gradient-to-r from-white/[0.04] to-white/[0.015] px-3 py-2.5"
                  >
                    <div className="mt-[1px] h-7 w-7 rounded-lg border border-white/10 bg-white/[0.04] text-sm flex items-center justify-center shadow-[0_8px_18px_rgba(0,0,0,0.35)]">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-zinc-100">
                        {item.label}
                      </p>
                      <p className="text-[12px] text-zinc-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
