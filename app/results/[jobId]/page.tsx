"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import type { CreativePlan, JobAssets } from "@/lib/types";
import LoadingState from "@/components/LoadingState";
import StoryboardCard from "@/components/StoryboardCard";
import PosterCard from "@/components/PosterCard";
import ReelCard from "@/components/ReelCard";
import VoiceCard from "@/components/VoiceCard";

type GenerationStage =
  | "loading"
  | "planning"
  | "generating"
  | "done"
  | "error";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [stage, setStage] = useState<GenerationStage>("loading");
  const [plan, setPlan] = useState<CreativePlan | null>(null);
  const [assets, setAssets] = useState<JobAssets>({});
  const [error, setError] = useState<string | null>(null);

  const [posterLoading, setPosterLoading] = useState(false);
  const [reelLoading, setReelLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);

  const generatePoster = useCallback(async () => {
    setPosterLoading(true);
    try {
      const res = await fetch("/api/poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error("Poster generation failed");
      const data = await res.json();
      setAssets((prev) => ({ ...prev, posterUrl: data.posterUrl }));
    } catch {
      console.error("Poster generation error");
    } finally {
      setPosterLoading(false);
    }
  }, [jobId]);

  const generateReel = useCallback(async () => {
    setReelLoading(true);
    try {
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error("Reel generation failed");
      const data = await res.json();
      setAssets((prev) => ({ ...prev, reelUrl: data.reelUrl }));
    } catch {
      console.error("Reel generation error");
    } finally {
      setReelLoading(false);
    }
  }, [jobId]);

  const generateVoice = useCallback(async () => {
    setVoiceLoading(true);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error("Voice generation failed");
      const data = await res.json();
      setAssets((prev) => ({ ...prev, voiceUrl: data.voiceUrl }));
    } catch {
      console.error("Voice generation error");
    } finally {
      setVoiceLoading(false);
    }
  }, [jobId]);

  const generateMusic = useCallback(async () => {
    setMusicLoading(true);
    try {
      const res = await fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error("Music generation failed");
      const data = await res.json();
      setAssets((prev) => ({ ...prev, musicUrl: data.musicUrl }));
    } catch {
      console.error("Music generation error");
    } finally {
      setMusicLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    let cancelled = false;

    async function loadAndGenerate() {
      try {
        const res = await fetch(`/api/plan?jobId=${jobId}`);

        if (!res.ok) {
          setError("Could not load job data");
          setStage("error");
          return;
        }

        const data = await res.json();

        if (cancelled) return;

        if (data.plan) {
          setPlan(data.plan);
          setStage("generating");

          setPosterLoading(true);
          setReelLoading(true);
          setVoiceLoading(true);
          setMusicLoading(true);

          const posterPromise = fetch("/api/poster", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (!cancelled)
                setAssets((prev) => ({ ...prev, posterUrl: d.posterUrl }));
            })
            .catch(() => {})
            .finally(() => {
              if (!cancelled) setPosterLoading(false);
            });

          const reelPromise = fetch("/api/video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (!cancelled)
                setAssets((prev) => ({ ...prev, reelUrl: d.reelUrl }));
            })
            .catch(() => {})
            .finally(() => {
              if (!cancelled) setReelLoading(false);
            });

          const voicePromise = fetch("/api/voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (!cancelled)
                setAssets((prev) => ({ ...prev, voiceUrl: d.voiceUrl }));
            })
            .catch(() => {})
            .finally(() => {
              if (!cancelled) setVoiceLoading(false);
            });

          const musicPromise = fetch("/api/music", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobId }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (!cancelled)
                setAssets((prev) => ({ ...prev, musicUrl: d.musicUrl }));
            })
            .catch(() => {})
            .finally(() => {
              if (!cancelled) setMusicLoading(false);
            });

          await Promise.all([
            posterPromise,
            reelPromise,
            voicePromise,
            musicPromise,
          ]);
          if (!cancelled) setStage("done");
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong loading your promo kit");
          setStage("error");
        }
      }
    }

    loadAndGenerate();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (stage === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <LoadingState
          label="Loading your creative plan..."
          sublabel="Hang tight while we set things up"
        />
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-12">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-white/40 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            ← Start over
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-8"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        New brief
      </Link>

      {/* Title + Tagline */}
      {plan && (
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">
              {stage === "done" ? "Promo Kit Ready" : "Generating Assets..."}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
            {plan.title}
          </h1>
          <p className="text-lg text-indigo-400/70 font-medium">
            {plan.tagline}
          </p>
          <p className="text-sm text-white/30 mt-2">{plan.visualStyle}</p>
        </div>
      )}

      {/* Voiceover Script */}
      {plan?.voiceoverScript && (
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Voiceover Script
            </span>
          </div>
          <p className="text-sm text-white/60 italic leading-relaxed">
            &ldquo;{plan.voiceoverScript}&rdquo;
          </p>
        </div>
      )}

      {/* Storyboard */}
      {plan?.scenes && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
            Storyboard
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {plan.scenes.map((scene) => (
              <StoryboardCard key={scene.id} scene={scene} />
            ))}
          </div>
        </div>
      )}

      {/* Asset Grid */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
          Generated Assets
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <PosterCard
            posterUrl={assets.posterUrl}
            isLoading={posterLoading}
            onRegenerate={generatePoster}
          />
          <ReelCard
            reelUrl={assets.reelUrl}
            isLoading={reelLoading}
            onRegenerate={generateReel}
          />
        </div>
      </div>

      {/* Audio Assets */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">
          Audio
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <VoiceCard
            voiceUrl={assets.voiceUrl}
            musicUrl={assets.musicUrl}
            isVoiceLoading={voiceLoading}
            isMusicLoading={musicLoading}
            onRegenerateVoice={generateVoice}
            onRegenerateMusic={generateMusic}
          />

          {/* Music regenerate if failed */}
          {!assets.musicUrl && !musicLoading && stage === "done" && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 flex flex-col items-center justify-center min-h-[120px] gap-3">
              <span className="text-xs text-white/30">Music generation failed</span>
              <button
                onClick={generateMusic}
                className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Retry Background Music →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Job ID footer */}
      <div className="text-center text-xs text-white/15 font-mono pt-8 border-t border-white/5">
        Job ID: {jobId}
      </div>
    </div>
  );
}
