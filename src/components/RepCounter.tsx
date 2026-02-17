"use client";

import { clsx } from "clsx";

interface Props {
  reps: number;
  target: number;
  phase: "up" | "down";
}

export default function RepCounter({ reps, target, phase }: Props) {
  const progress = Math.min(100, (reps / target) * 100);
  const completed = reps >= target;

  return (
    <div className="bg-mojo-card border border-mojo-border rounded-xl p-6 text-center">
      <div className="text-6xl font-bold text-white mb-2">
        {reps}
        <span className="text-2xl text-gray-500">/{target}</span>
      </div>

      <div className="w-full bg-mojo-dark rounded-full h-3 mb-4">
        <div
          className={clsx(
            "h-3 rounded-full transition-all duration-300",
            completed ? "bg-mojo-green" : "bg-gradient-to-r from-mojo-purple to-mojo-blue"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        <div
          className={clsx(
            "px-3 py-1 rounded-full text-xs font-medium",
            phase === "down"
              ? "bg-mojo-orange/20 text-mojo-orange"
              : "bg-mojo-green/20 text-mojo-green"
          )}
        >
          {phase === "down" ? "DOWN" : "UP"}
        </div>
        {completed && (
          <div className="px-3 py-1 rounded-full text-xs font-medium bg-mojo-green/20 text-mojo-green">
            TARGET MET!
          </div>
        )}
      </div>
    </div>
  );
}
