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

  const isSvg = reelUrl.endsWith(".svg");

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden group">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-indigo-400"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white/70">Promo Reel</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={onRegenerate}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            title="Regenerate"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
          </button>
          <a
            href={reelUrl}
            download
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors"
            title="Download"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        </div>
      </div>
      <div className="p-4 flex justify-center bg-black/20">
        {isSvg ? (
          <img
            src={reelUrl}
            alt="Promo reel preview"
            className="max-h-[350px] w-auto rounded-lg"
          />
        ) : (
          <video
            src={reelUrl}
            controls
            className="max-h-[350px] w-auto rounded-lg"
            playsInline
          />
        )}
      </div>
    </div>
  );
}
