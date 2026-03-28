"use client";

import { AssetLoadingPulse } from "./LoadingState";

interface VoiceCardProps {
  voiceUrl?: string;
  musicUrl?: string;
  isVoiceLoading: boolean;
  isMusicLoading?: boolean;
  onRegenerateVoice?: () => void;
  onRegenerateMusic?: () => void;
}

export default function VoiceCard({
  voiceUrl,
  musicUrl,
  isVoiceLoading,
  isMusicLoading,
  onRegenerateVoice,
  onRegenerateMusic,
}: VoiceCardProps) {
  return (
    <div className="space-y-4">
      {/* Voiceover */}
      {isVoiceLoading ? (
        <AssetLoadingPulse label="Generating voiceover..." />
      ) : voiceUrl ? (
        <AudioAssetCard
          label="Voiceover"
          url={voiceUrl}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-emerald-400"
            >
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          }
          iconBg="bg-emerald-500/10"
          onRegenerate={onRegenerateVoice}
        />
      ) : null}

      {/* Music (stretch goal) */}
      {isMusicLoading ? (
        <AssetLoadingPulse label="Generating music..." />
      ) : musicUrl ? (
        <AudioAssetCard
          label="Background Music"
          url={musicUrl}
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-amber-400"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          }
          iconBg="bg-amber-500/10"
          onRegenerate={onRegenerateMusic}
        />
      ) : null}
    </div>
  );
}

function AudioAssetCard({
  label,
  url,
  icon,
  iconBg,
  onRegenerate,
}: {
  label: string;
  url: string;
  icon: React.ReactNode;
  iconBg: string;
  onRegenerate?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-md ${iconBg} flex items-center justify-center`}
          >
            {icon}
          </div>
          <span className="text-sm font-medium text-white/70">{label}</span>
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
            href={url}
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
      <div className="p-4">
        <audio controls className="w-full" preload="metadata">
          <source src={url} />
        </audio>
      </div>
    </div>
  );
}
