"use client";

interface LoadingStateProps {
  label: string;
  sublabel?: string;
}

export default function LoadingState({ label, sublabel }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-purple-500/10 border-b-purple-500/50 animate-spin [animation-duration:1.5s]" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white/80">{label}</p>
        {sublabel && (
          <p className="text-xs text-white/40 mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

export function AssetLoadingPulse({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col items-center justify-center min-h-[200px] gap-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse [animation-delay:150ms]" />
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse [animation-delay:300ms]" />
      </div>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}
