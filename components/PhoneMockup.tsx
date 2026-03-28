"use client";

import { motion } from "framer-motion";

interface PhoneMockupProps {
  type: "instagram" | "tiktok";
  imageUrl?: string;
  videoUrl?: string;
  isLoading: boolean;
}

export default function PhoneMockup({
  type,
  imageUrl,
  videoUrl,
  isLoading,
}: PhoneMockupProps) {
  const mediaUrl = imageUrl || videoUrl;
  const isVideo = !!videoUrl;
  const label = type === "instagram" ? "IG" : "TikTok";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-col items-center gap-2"
    >
      <span className="text-[9px] text-zinc-600">{label}</span>

      <div className="relative w-[130px] h-[260px] rounded-[18px] border border-white/[0.08] bg-white/[0.02] p-[2px]">
        <div className="w-full h-full rounded-[16px] bg-black overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-black rounded-b-lg z-10" />

          <div className="w-full h-full flex items-center justify-center">
            {isLoading ? (
              <div className="w-full h-full shimmer-loading" />
            ) : mediaUrl ? (
              isVideo ? (
                <video src={mediaUrl} className="w-full h-full object-cover" muted loop playsInline autoPlay />
              ) : (
                <img src={mediaUrl} alt={`${label} preview`} className="w-full h-full object-cover" />
              )
            ) : (
              <div className="text-zinc-700 text-[10px]">No preview</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
