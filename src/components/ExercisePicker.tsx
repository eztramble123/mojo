"use client";

import { useState } from "react";
import { ExerciseType, EXERCISE_LABELS } from "@/types";
import { clsx } from "clsx";

interface Props {
  onStart: (exerciseType: ExerciseType, targetReps: number) => void;
  disabled?: boolean;
}

export default function ExercisePicker({ onStart, disabled }: Props) {
  const [exerciseType, setExerciseType] = useState<ExerciseType>(ExerciseType.Pushups);
  const [targetReps, setTargetReps] = useState(10);

  return (
    <div className="glass-card p-6 space-y-6">
      <h2 className="text-xl font-semibold text-wii-ink">Choose Your Exercise</h2>

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(EXERCISE_LABELS).map(([type, label]) => (
          <button
            key={type}
            onClick={() => setExerciseType(Number(type) as ExerciseType)}
            className={clsx(
              "p-4 rounded-xl border-2 transition-all text-center",
              Number(type) === exerciseType
                ? "border-studio-blue bg-studio-blue/10 text-wii-ink"
                : "border-wii-glass bg-white text-wii-muted hover:border-studio-blue/40"
            )}
          >
            <div className="text-2xl mb-1">
              {Number(type) === 0 ? "\u{1F4AA}" : Number(type) === 1 ? "\u{1F9B5}" : "\u2B50"}
            </div>
            <div className="text-sm font-medium">{label}</div>
          </button>
        ))}
      </div>

      <div>
        <label className="block text-xs text-wii-muted mb-2 font-medium uppercase tracking-wide">Target Reps</label>
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
    </div>
  );
}
