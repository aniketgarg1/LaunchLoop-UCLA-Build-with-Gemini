"use client";

import { AssetLoadingPulse } from "./LoadingState";

interface ReelCardProps {
  reelUrl?: string;
  isLoading: boolean;
  onRegenerate?: () => void;
}

export default function ReelCard({
  reelUrl,
  isLoading,
  onRegenerate,
}: ReelCardProps) {
  if (isLoading) {
    return <AssetLoadingPulse label="Generating promo reel..." />;
  }

  if (!reelUrl) return null;

  const isRealVideo = reelUrl && !reelUrl.endsWith(".svg");

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
        <span className="text-[13px] font-medium text-zinc-300">Promo Reel</span>
        <div className="flex gap-1">
          <button onClick={onRegenerate} className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors" title="Regenerate">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
          </button>
          {isRealVideo && (
            <a href={reelUrl} download className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors" title="Download">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          )}
        </div>
      </div>

      <div className="p-4 flex justify-center bg-black/20">
        {isRealVideo ? (
          <video key={reelUrl} src={reelUrl} controls className="max-h-[360px] w-auto rounded-lg" playsInline />
        ) : (
          <div className="h-[200px] flex flex-col items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <p className="text-zinc-600 text-[13px]">Video pending</p>
            {onRegenerate && (
              <button onClick={onRegenerate} className="text-[12px] text-indigo-400 hover:text-indigo-300 transition-colors">Regenerate</button>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-white/[0.04] text-[11px] text-zinc-600 text-center">
        16s — voiceover + music
      </div>
    </div>
  );
}
