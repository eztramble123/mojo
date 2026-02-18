"use client";

import { useState } from "react";
import { ExerciseType, EXERCISE_LABELS, EXERCISE_STAT } from "@/types";
import { clsx } from "clsx";

interface Props {
  onStart: (exerciseType: ExerciseType, targetReps: number) => void;
  disabled?: boolean;
}

const EXERCISE_EMOJI: Record<ExerciseType, string> = {
  [ExerciseType.Pushups]: "\u{1F4AA}",
  [ExerciseType.Squats]: "\u{1F9B5}",
  [ExerciseType.JumpingJacks]: "\u2B50",
};

const EXERCISE_DIFFICULTY: Record<ExerciseType, { label: string; color: string }> = {
  [ExerciseType.Pushups]: { label: "Medium", color: "bg-ring-orange/15 text-ring-orange border-ring-orange/30" },
  [ExerciseType.Squats]: { label: "Easy", color: "bg-mojo-green/15 text-mojo-green border-mojo-green/30" },
  [ExerciseType.JumpingJacks]: { label: "Easy", color: "bg-mojo-green/15 text-mojo-green border-mojo-green/30" },
};

function estimateTime(reps: number): string {
  const seconds = reps * 4;
  if (seconds < 60) return `~${seconds}s`;
  const mins = Math.round(seconds / 60);
  return `~${mins} min`;
}

export default function ExercisePicker({ onStart, disabled }: Props) {
  const [exerciseType, setExerciseType] = useState<ExerciseType>(ExerciseType.Pushups);
  const [targetReps, setTargetReps] = useState(10);

  return (
    <div className="glass-card p-6 space-y-6">
      <h2 className="text-xl font-semibold text-wii-ink">Choose Your Exercise</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(EXERCISE_LABELS).map(([type, label]) => {
          const t = Number(type) as ExerciseType;
          const diff = EXERCISE_DIFFICULTY[t];
          return (
            <button
              key={type}
              onClick={() => setExerciseType(t)}
              className={clsx(
                "p-5 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-2",
                t === exerciseType
                  ? "border-studio-blue bg-studio-blue/10 text-wii-ink shadow-glass"
                  : "border-wii-glass bg-white text-wii-muted hover:border-studio-blue/40"
              )}
            >
              <div className="text-3xl">{EXERCISE_EMOJI[t]}</div>
              <div className="text-sm font-semibold text-wii-ink">{label}</div>
              <span className={clsx("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border", diff.color)}>
                {diff.label}
              </span>
              <div className="text-[11px] text-wii-muted">
                Trains: <span className="text-ring-blue font-medium">{EXERCISE_STAT[t]}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-wii-muted font-medium uppercase tracking-wide">Target Reps</label>
          <span className="text-xs text-wii-muted">{estimateTime(targetReps)}</span>
        </div>
        <div className="flex items-center gap-3">
          {[5, 10, 15, 20, 25].map((n) => (
            <button
              key={n}
              onClick={() => setTargetReps(n)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                targetReps === n
                  ? "bg-studio-blue text-white"
                  : "bg-white text-wii-muted hover:text-wii-ink border border-wii-glass"
              )}
            >
              {n}
            </button>
          ))}
          <input
            type="number"
            value={targetReps}
            onChange={(e) => setTargetReps(Math.max(1, Number(e.target.value)))}
            className="w-20 px-3 py-2 bg-wii-mist border border-wii-glass rounded-xl text-wii-ink text-sm focus:outline-none focus:border-studio-blue"
            min={1}
          />
        </div>
      </div>

      <button
        onClick={() => onStart(exerciseType, targetReps)}
        disabled={disabled}
        className="w-full py-3 bg-studio-blue hover:bg-studio-blue/90 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 shadow-glass"
      >
        {disabled ? "Creating Session..." : "Start Session"}
      </button>

      <p className="text-xs text-wii-muted/70 text-center">
        Tip: Make sure you have good lighting and your full body is in frame
      </p>
    </div>
  );
}
