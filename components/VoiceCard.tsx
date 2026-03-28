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
    <div className="space-y-3">
      {isVoiceLoading ? (
        <AssetLoadingPulse label="Generating voiceover..." />
      ) : voiceUrl ? (
        <AudioRow label="Voiceover" url={voiceUrl} onRegenerate={onRegenerateVoice} />
      ) : null}

      {isMusicLoading ? (
        <AssetLoadingPulse label="Generating music..." />
      ) : musicUrl ? (
        <AudioRow label="Music" url={musicUrl} onRegenerate={onRegenerateMusic} />
      ) : null}
    </div>
  );
}

function AudioRow({ label, url, onRegenerate }: { label: string; url: string; onRegenerate?: () => void }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
        <span className="text-[13px] font-medium text-zinc-300">{label}</span>
        <div className="flex gap-1">
          <button onClick={onRegenerate} className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors" title="Regenerate">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
            </svg>
          </button>
          <a href={url} download className="p-1.5 rounded-md hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors" title="Download">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        </div>
      </div>
      <div className="p-3">
        <audio controls className="w-full h-8" preload="metadata"><source src={url} /></audio>
      </div>
    </div>
  );
}
