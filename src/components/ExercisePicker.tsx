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
    <div className="bg-mojo-card border border-mojo-border rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-bold text-white">Choose Your Exercise</h2>

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(EXERCISE_LABELS).map(([type, label]) => (
          <button
            key={type}
            onClick={() => setExerciseType(Number(type) as ExerciseType)}
            className={clsx(
              "p-4 rounded-lg border-2 transition-all text-center",
              Number(type) === exerciseType
                ? "border-mojo-purple bg-mojo-purple/20 text-white"
                : "border-mojo-border bg-mojo-dark text-gray-400 hover:border-gray-500"
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
        <label className="block text-sm text-gray-400 mb-2">Target Reps</label>
        <div className="flex items-center gap-3">
          {[5, 10, 15, 20, 25].map((n) => (
            <button
              key={n}
              onClick={() => setTargetReps(n)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                targetReps === n
                  ? "bg-mojo-purple text-white"
                  : "bg-mojo-dark text-gray-400 hover:text-white border border-mojo-border"
              )}
            >
              {n}
            </button>
          ))}
          <input
            type="number"
            value={targetReps}
            onChange={(e) => setTargetReps(Math.max(1, Number(e.target.value)))}
            className="w-20 px-3 py-2 bg-mojo-dark border border-mojo-border rounded-lg text-white text-sm"
            min={1}
          />
        </div>
      </div>

      <button
        onClick={() => onStart(exerciseType, targetReps)}
        disabled={disabled}
        className="w-full py-3 bg-gradient-to-r from-mojo-purple to-mojo-blue rounded-lg font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {disabled ? "Creating Session..." : "Start Session"}
      </button>
    </div>
  );
}
