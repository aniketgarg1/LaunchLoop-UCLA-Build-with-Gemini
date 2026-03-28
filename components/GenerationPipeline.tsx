"use client";

import { motion } from "framer-motion";

type PipelineStep = {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
};

interface GenerationPipelineProps {
  posterDone: boolean;
  reelDone: boolean;
  voiceDone: boolean;
  musicDone: boolean;
  stitchDone: boolean;
  posterLoading: boolean;
  reelLoading: boolean;
  voiceLoading: boolean;
  musicLoading: boolean;
  stitchLoading: boolean;
}

export default function GenerationPipeline({
  posterDone,
  reelDone,
  voiceDone,
  musicDone,
  stitchDone,
  posterLoading,
  reelLoading,
  voiceLoading,
  musicLoading,
  stitchLoading,
}: GenerationPipelineProps) {
  const steps: PipelineStep[] = [
    { id: "plan", label: "Plan", status: "done" },
    { id: "poster", label: "Poster", status: posterDone ? "done" : posterLoading ? "active" : "pending" },
    { id: "reel", label: "Video", status: reelDone ? "done" : reelLoading ? "active" : "pending" },
    { id: "voice", label: "Voice", status: voiceDone ? "done" : voiceLoading ? "active" : "pending" },
    { id: "music", label: "Music", status: musicDone ? "done" : musicLoading ? "active" : "pending" },
    { id: "stitch", label: "Stitch", status: stitchDone ? "done" : stitchLoading ? "active" : "pending" },
  ];

  const allDone = steps.every((s) => s.status === "done");

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[12px] text-zinc-500">Pipeline</span>
        {allDone && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] font-medium text-emerald-500">
            Complete
          </motion.span>
        )}
      </div>

      <div className="flex items-center gap-0.5">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all ${
                step.status === "done"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : step.status === "active"
                  ? "bg-indigo-500/10 text-indigo-400 pipeline-active"
                  : "bg-white/[0.04] text-zinc-600"
              }`}>
                {step.status === "done" ? (
                  <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                ) : step.status === "active" ? (
                  <div className="w-3 h-3 border-[1.5px] border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className={`text-[9px] ${
                step.status === "done" ? "text-emerald-500/60" : step.status === "active" ? "text-indigo-400/70" : "text-zinc-600"
              }`}>
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className="w-full h-px mx-0.5 mb-4 bg-white/[0.05] relative overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: step.status === "done" ? "100%" : step.status === "active" ? "50%" : "0%" }}
                  transition={{ duration: 0.5 }}
                  className={`absolute inset-y-0 left-0 ${step.status === "done" ? "bg-emerald-500/30" : "bg-indigo-500/30"}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
