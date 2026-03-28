"use client";

import { useState } from "react";
import { AssetLoadingPulse } from "./LoadingState";

interface PosterCardProps {
  posterUrl?: string;
  storyPosterUrl?: string;
  isLoading: boolean;
  onRegenerate?: () => void;
}

type PosterTab = "square" | "story";

export default function PosterCard({
  posterUrl,
  storyPosterUrl,
  isLoading,
  onRegenerate,
}: PosterCardProps) {
  const [activeTab, setActiveTab] = useState<PosterTab>("square");

  if (isLoading) {
    return <AssetLoadingPulse label="Generating posters..." />;
  }

  if (!posterUrl && !storyPosterUrl) return null;

  const currentUrl = activeTab === "square" ? posterUrl : storyPosterUrl;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex bg-white/[0.04] rounded-md p-0.5">
            <button
              onClick={() => setActiveTab("square")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                activeTab === "square" ? "bg-white/[0.08] text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Square
            </button>
            <button
              onClick={() => setActiveTab("story")}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                activeTab === "story" ? "bg-white/[0.08] text-zinc-200" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Story
            </button>
          </div>
        </div>

        <div className="flex gap-1">
          <button onClick={onRegenerate} className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors" title="Regenerate">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
          </button>
          {currentUrl && (
            <a href={currentUrl} download className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors" title="Download">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="p-4 flex justify-center bg-black/20">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={`${activeTab === "square" ? "Square" : "Story"} poster`}
            className={`rounded-lg ${activeTab === "story" ? "max-h-[400px] w-auto" : "max-h-[350px] w-auto"}`}
          />
        ) : (
          <div className="h-[200px] flex items-center justify-center text-zinc-600 text-[13px]">Not available</div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-white/[0.04] text-[11px] text-zinc-600 text-center">
        {activeTab === "square" ? "1080 x 1080" : "1080 x 1920"}
      </div>
    </div>
  );
}
