"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { JobAssets, CreativePlan } from "@/lib/types";

interface DownloadKitProps {
  assets: JobAssets;
  plan: CreativePlan;
  jobId: string;
}

export default function DownloadKit({ assets, plan, jobId }: DownloadKitProps) {
  const [downloading, setDownloading] = useState(false);

  const finalVideo = assets.finalNarratedUrl || assets.reelUrl;

  const assetList = [
    { label: "Poster", url: assets.posterUrl },
    { label: "Story", url: assets.storyPosterUrl },
    { label: "Video", url: finalVideo },
    { label: "Voice", url: assets.voiceUrl },
    { label: "Music", url: assets.musicUrl },
  ];

  const readyCount = assetList.filter((a) => a.url).length;
  const totalDuration = plan.scenes.reduce((sum, s) => sum + (Number(s.durationSec) || 0), 0);

  async function handleDownloadAll() {
    setDownloading(true);
    try {
      const a = document.createElement("a");
      a.href = `/api/download?jobId=${jobId}`;
      a.download = `launchloop-promo-kit.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => setDownloading(false), 2000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-medium text-zinc-300">Download</h3>
        <span className="text-[11px] text-zinc-600">{readyCount}/{assetList.length} ready</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
          <div className="text-sm font-semibold text-zinc-200">{plan.scenes.length}</div>
          <div className="text-[9px] text-zinc-600">Scenes</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
          <div className="text-sm font-semibold text-zinc-200">{totalDuration}s</div>
          <div className="text-[9px] text-zinc-600">Duration</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2.5 text-center">
          <div className="text-sm font-semibold text-zinc-200">{plan.voiceoverScript.split(/\s+/).length}</div>
          <div className="text-[9px] text-zinc-600">Words</div>
        </div>
      </div>

      <button
        onClick={handleDownloadAll}
        disabled={readyCount === 0 || downloading}
        className="w-full py-2.5 rounded-lg font-medium text-[14px] text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {downloading ? (
          <>
            <div className="w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download all
          </>
        )}
      </button>
    </motion.div>
  );
}
