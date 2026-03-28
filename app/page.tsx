import BriefForm from "@/components/BriefForm";

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-medium text-indigo-400">
            Creative Studio
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4">
          From brief to{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            buzz
          </span>
        </h1>
        <p className="text-lg text-white/40 max-w-xl mx-auto">
          Upload your logo, describe your event, and get a complete promo kit —
          poster, reel, and voiceover — in seconds.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Brief Form */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-indigo-400"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Brief Builder</h2>
              <p className="text-xs text-white/30">
                Tell us about your event
              </p>
            </div>
          </div>
          <BriefForm />
        </div>

        {/* Right: Preview / Info */}
        <div className="space-y-6">
          {/* What you get */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">
              Your Promo Kit Includes
            </h3>
            <div className="space-y-4">
              {[
                {
                  icon: "🎨",
                  title: "Branded Poster",
                  desc: "Eye-catching event poster with your logo and branding",
                },
                {
                  icon: "🎬",
                  title: "Short Promo Reel",
                  desc: "10-15 second vertical video for social media",
                },
                {
                  icon: "📱",
                  title: "QR Code Integration",
                  desc: "Your QR code embedded in poster and video CTA",
                },
                {
                  icon: "🎙️",
                  title: "Voiceover Track",
                  desc: "Professional narration for your promo reel",
                },
                {
                  icon: "🎵",
                  title: "Background Music",
                  desc: "Genre-matched soundtrack for your promo",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0 group-hover:bg-white/10 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white/80">
                      {item.title}
                    </span>
                    <p className="text-xs text-white/30 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo seed */}
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 p-8">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">
              Try This Example
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-white/30">Event:</span>{" "}
                <span className="text-white/70">
                  LA Google DeepMind Hackathon
                </span>
              </div>
              <div>
                <span className="text-white/30">Date:</span>{" "}
                <span className="text-white/70">April 15, 2026 at 9:00 AM</span>
              </div>
              <div>
                <span className="text-white/30">Audience:</span>{" "}
                <span className="text-white/70">
                  College students interested in AI
                </span>
              </div>
              <div>
                <span className="text-white/30">Vibe:</span>{" "}
                <span className="text-white/70">
                  Futuristic, energetic, urgent
                </span>
              </div>
              <div>
                <span className="text-white/30">CTA:</span>{" "}
                <span className="text-white/70">Register now</span>
              </div>
            </div>
          </div>

          {/* Powered by */}
          <div className="flex items-center gap-3 justify-center opacity-40">
            <span className="text-[11px] text-white/50">Powered by</span>
            <div className="flex gap-2 text-[11px] text-white/30">
              <span className="bg-white/5 px-2 py-0.5 rounded">Gemini</span>
              <span className="bg-white/5 px-2 py-0.5 rounded">
                Nano Banana
              </span>
              <span className="bg-white/5 px-2 py-0.5 rounded">Veo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
