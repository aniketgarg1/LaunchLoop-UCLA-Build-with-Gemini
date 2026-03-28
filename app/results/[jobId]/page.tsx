"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { CreativePlan, JobAssets } from "@/lib/types";
import LoadingState from "@/components/LoadingState";
import StoryboardCard from "@/components/StoryboardCard";
import PosterCard from "@/components/PosterCard";
import ReelCard from "@/components/ReelCard";
import VoiceCard from "@/components/VoiceCard";
import GenerationPipeline from "@/components/GenerationPipeline";
import PhoneMockup from "@/components/PhoneMockup";
import DownloadKit from "@/components/DownloadKit";
import Confetti from "@/components/Confetti";

type GenerationStage =
  | "loading"
  | "planning"
  | "generating"
  | "stitching"
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
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiFired = useRef(false);

  const [posterLoading, setPosterLoading] = useState(false);
  const [reelLoading, setReelLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);
  const [stitchLoading, setStitchLoading] = useState(false);

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
      setAssets((prev) => ({
        ...prev,
        posterUrl: data.posterUrl,
        storyPosterUrl: data.storyPosterUrl,
      }));
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
      setAssets((prev) => ({
        ...prev,
        reelUrl: data.reelUrl,
      }));
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

  const runStitch = useCallback(async () => {
    setStitchLoading(true);
    try {
      const res = await fetch("/api/stitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!res.ok) throw new Error("Stitch failed");
      const data = await res.json();
      setAssets((prev) => ({
        ...prev,
        reelMusicUrl: data.reelMusicUrl,
        finalNarratedUrl: data.finalNarratedUrl,
        finalMusicUrl: data.finalMusicUrl,
      }));
    } catch {
      console.error("Stitch error");
    } finally {
      setStitchLoading(false);
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

          const makeOne = (url: string, key: keyof JobAssets) =>
            fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jobId }),
            })
              .then((r) => r.json())
              .then((d) => {
                if (!cancelled) setAssets((prev) => ({ ...prev, [key]: d[key] }));
              })
              .catch(() => {});

          const makePoster = () =>
            fetch("/api/poster", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jobId }),
            })
              .then((r) => r.json())
              .then((d) => {
                if (!cancelled)
                  setAssets((prev) => ({
                    ...prev,
                    posterUrl: d.posterUrl,
                    storyPosterUrl: d.storyPosterUrl,
                  }));
              })
              .catch(() => {});

          const makeVideo = () =>
            fetch("/api/video", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jobId }),
            })
              .then((r) => r.json())
              .then((d) => {
                if (!cancelled)
                  setAssets((prev) => ({
                    ...prev,
                    reelUrl: d.reelUrl,
                  }));
              })
              .catch(() => {});

          const posterP = makePoster().finally(() => {
            if (!cancelled) setPosterLoading(false);
          });
          const reelP = makeVideo().finally(() => {
            if (!cancelled) setReelLoading(false);
          });
          const voiceP = makeOne("/api/voice", "voiceUrl").finally(() => {
            if (!cancelled) setVoiceLoading(false);
          });
          const musicP = makeOne("/api/music", "musicUrl").finally(() => {
            if (!cancelled) setMusicLoading(false);
          });

          await Promise.all([posterP, reelP, voiceP, musicP]);

          if (cancelled) return;

          setStage("stitching");
          setStitchLoading(true);

          try {
            const stitchRes = await fetch("/api/stitch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jobId }),
            });
            if (stitchRes.ok) {
              const stitchData = await stitchRes.json();
              if (!cancelled) {
                setAssets((prev) => ({
                  ...prev,
                  reelMusicUrl: stitchData.reelMusicUrl,
                  finalNarratedUrl: stitchData.finalNarratedUrl,
                  finalMusicUrl: stitchData.finalMusicUrl,
                }));
              }
            }
          } catch {
            console.error("Stitch step failed");
          } finally {
            if (!cancelled) setStitchLoading(false);
          }

          if (!cancelled) {
            setStage("done");
            if (!confettiFired.current) {
              confettiFired.current = true;
              setShowConfetti(true);
            }
          }
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong loading your promo kit");
          setStage("error");
        }
      }
    }

    loadAndGenerate();
    return () => { cancelled = true; };
  }, [jobId]);

  if (stage === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <LoadingState
          label="Initializing creative pipeline..."
          sublabel="Our AI creative director is reviewing your brief"
        />
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-12"
        >
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-white/40 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white/70 px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            ← Start over
          </Link>
        </motion.div>
      </div>
    );
  }

  const rawNarrated = assets.finalNarratedUrl || assets.reelUrl;
  const toVideo = (url?: string) => (url && !url.endsWith(".svg") ? url : undefined);
  const finalNarrated = toVideo(rawNarrated);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <Confetti active={showConfetti} />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>

        {stage === "done" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] text-emerald-500">Ready</span>
          </motion.div>
        )}
      </div>

      {/* Title */}
      <AnimatePresence>
        {plan && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
              {plan.title}
            </h1>
            <p className="text-[15px] text-zinc-500">{plan.tagline}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generation Pipeline */}
      <GenerationPipeline
        posterDone={!!assets.posterUrl}
        reelDone={!!assets.reelUrl}
        voiceDone={!!assets.voiceUrl}
        musicDone={!!assets.musicUrl}
        stitchDone={!!assets.finalNarratedUrl || !!assets.finalMusicUrl}
        posterLoading={posterLoading}
        reelLoading={reelLoading}
        voiceLoading={voiceLoading}
        musicLoading={musicLoading}
        stitchLoading={stitchLoading}
      />

      {/* Voiceover Script */}
      {plan?.voiceoverScript && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-6"
        >
          <span className="text-[11px] text-zinc-500">Script</span>
          <p className="text-[13px] text-zinc-400 italic leading-relaxed mt-1.5">
            &ldquo;{plan.voiceoverScript}&rdquo;
          </p>
        </motion.div>
      )}

      {/* Storyboard */}
      {plan?.scenes && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-[12px] text-zinc-500 mb-3">
            Storyboard &middot; {plan.scenes.length} scenes &middot; {plan.scenes.reduce((s, sc) => s + (Number(sc.durationSec) || 0), 0)}s
          </h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {plan.scenes.map((scene, i) => (
              <motion.div
                key={scene.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <StoryboardCard scene={scene} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Assets grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-[12px] text-zinc-500">Assets</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <PosterCard posterUrl={assets.posterUrl} storyPosterUrl={assets.storyPosterUrl} isLoading={posterLoading} onRegenerate={generatePoster} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <ReelCard
                reelUrl={rawNarrated}
                isLoading={reelLoading}
                onRegenerate={generateReel}
              />
            </motion.div>
          </div>

          <h2 className="text-[12px] text-zinc-500 pt-1">Audio</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <VoiceCard
              voiceUrl={assets.voiceUrl}
              musicUrl={assets.musicUrl}
              isVoiceLoading={voiceLoading}
              isMusicLoading={musicLoading}
              onRegenerateVoice={generateVoice}
              onRegenerateMusic={generateMusic}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="text-[11px] text-zinc-500 mb-3 text-center">Preview</h3>
            <div className="flex justify-center gap-3">
              <PhoneMockup
                type="instagram"
                imageUrl={assets.storyPosterUrl || assets.posterUrl}
                isLoading={posterLoading}
              />
              <PhoneMockup
                type="tiktok"
                videoUrl={finalNarrated}
                imageUrl={!finalNarrated ? assets.posterUrl : undefined}
                isLoading={reelLoading}
              />
            </div>
          </div>

          {plan && (
            <DownloadKit assets={assets} plan={plan} jobId={jobId} />
          )}
        </div>
      </div>
    </div>
  );
}
