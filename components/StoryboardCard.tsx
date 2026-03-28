"use client";

import type { ScenePlan } from "@/lib/types";

interface StoryboardCardProps {
  scene: ScenePlan;
}

export default function StoryboardCard({ scene }: StoryboardCardProps) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 hover:border-indigo-500/20 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">
            {scene.id}
          </div>
          <h4 className="text-sm font-semibold text-white/90">{scene.title}</h4>
        </div>
        <span className="text-[11px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-md">
          {scene.durationSec}s
        </span>
      </div>
      <p className="text-xs text-white/40 leading-relaxed">{scene.prompt}</p>
    </div>
  );
}
