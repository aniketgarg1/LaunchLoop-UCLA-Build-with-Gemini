"use client";

interface LoadingStateProps {
  label: string;
  sublabel?: string;
}

export default function LoadingState({ label, sublabel }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-8 h-8 rounded-full border-[1.5px] border-indigo-500/20 border-t-indigo-400 animate-spin" />
      <div className="text-center">
        <p className="text-[14px] text-zinc-300">{label}</p>
        {sublabel && <p className="text-[12px] text-zinc-500 mt-1">{sublabel}</p>}
      </div>
    </div>
  );
}

export function AssetLoadingPulse({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col items-center justify-center min-h-[200px] gap-3">
      <div className="flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse [animation-delay:150ms]" />
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse [animation-delay:300ms]" />
      </div>
      <p className="text-[12px] text-zinc-500">{label}</p>
    </div>
  );
}
