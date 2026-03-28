"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">
              LaunchLoop
            </span>
            <span className="hidden sm:inline text-xs text-indigo-400/70 ml-2 font-medium">
              From brief to buzz
            </span>
          </div>
        </Link>
        <div className="text-xs text-white/30 font-mono">MVP</div>
      </div>
    </header>
  );
}
