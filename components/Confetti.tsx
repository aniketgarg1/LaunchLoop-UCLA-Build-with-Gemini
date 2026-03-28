"use client";

import { useEffect, useState } from "react";

const COLORS = ["#a1a1aa", "#71717a", "#d4d4d8", "#52525b", "#e4e4e7", "#3f3f46"];

interface Particle {
  id: number;
  left: string;
  color: string;
  delay: string;
  size: number;
  shape: "square" | "circle";
}

export default function Confetti({ active }: { active: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const pieces: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: `${Math.random() * 2}s`,
      size: 4 + Math.random() * 6,
      shape: Math.random() > 0.5 ? "square" : "circle",
    }));
    setParticles(pieces);
    const timer = setTimeout(() => setParticles([]), 4000);
    return () => clearTimeout(timer);
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            width: p.size,
            height: p.size,
            borderRadius: p.shape === "circle" ? "50%" : "1px",
          }}
        />
      ))}
    </>
  );
}
