"use client";

import type { ScenePlan } from "@/lib/types";

interface StoryboardCardProps {
  scene: ScenePlan;
}

export default function StoryboardCard({ scene }: StoryboardCardProps) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.1] transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-indigo-600/20 flex items-center justify-center text-[10px] font-medium text-indigo-400">
            {scene.id}
          </span>
          <h4 className="text-[13px] font-medium text-zinc-300">{scene.title}</h4>
        </div>
        <span className="text-[10px] text-zinc-600 font-mono">{Number(scene.durationSec) || 0}s</span>
      </div>
      <p className="text-[12px] text-zinc-500 leading-relaxed">{scene.prompt}</p>
    </div>
  );
}
