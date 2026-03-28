"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#09090b]/85 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(99,102,241,0.45)] transition-transform group-hover:scale-105">
            <Image
              src="/launchloop-logo.svg"
              alt="LaunchLoop logo"
              width={32}
              height={32}
              className="h-full w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-zinc-100">
              LaunchLoop
            </span>
            <span className="text-[10px] text-indigo-200 border border-indigo-300/25 bg-indigo-400/10 px-1.5 py-0.5 rounded-md">
              beta
            </span>
          </div>
        </Link>
        <span className="hidden sm:inline text-[12px] text-zinc-500">
          From brief to campaign kit
        </span>
      </div>
    </header>
  );
}
