"use client";

import { useEffect, useState } from "react";
import type { Reaction } from "@/hooks/useWebRTC";

interface Props {
  reactions: Reaction[];
}

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number; // percentage from left
  startTime: number;
}

export default function ReactionOverlay({ reactions }: Props) {
  const [floating, setFloating] = useState<FloatingEmoji[]>([]);

  // When new reactions arrive, add them as floating emojis
  useEffect(() => {
    if (reactions.length === 0) return;
    const latest = reactions[reactions.length - 1];

    setFloating((prev) => {
      // Prevent duplicates
      if (prev.some((f) => f.id === latest.id)) return prev;
      return [
        ...prev.slice(-15), // keep max 15 on screen
        {
          id: latest.id,
          emoji: latest.emoji,
          x: 10 + Math.random() * 80, // random horizontal position
          startTime: Date.now(),
        },
      ];
    });
  }, [reactions]);

  // Clean up old emojis after animation
  useEffect(() => {
    if (floating.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setFloating((prev) => prev.filter((f) => now - f.startTime < 2500));
    }, 500);
    return () => clearInterval(timer);
  }, [floating.length]);

  if (floating.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {floating.map((f) => (
        <span
          key={f.id}
          className="absolute text-3xl animate-float-up"
          style={{ left: `${f.x}%`, bottom: 0 }}
        >
          {f.emoji}
        </span>
      ))}
    </div>
  );
}
