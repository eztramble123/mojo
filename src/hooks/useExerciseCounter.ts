"use client";

import { useState, useCallback, useRef } from "react";
import { ExerciseType, Keypoint } from "@/types";
import { CounterState, createInitialState, processFrame } from "@/lib/exercises";

export function useExerciseCounter(exerciseType: ExerciseType) {
  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState<"up" | "down">("up");
  const stateRef = useRef<CounterState>(createInitialState());

  const processKeypoints = useCallback(
    (keypoints: Keypoint[]) => {
      const newState = processFrame(stateRef.current, keypoints, exerciseType);
      stateRef.current = newState;

      if (newState.reps !== stateRef.current.reps || newState.reps > reps) {
        setReps(newState.reps);
      }
      if (newState.phase !== phase) {
        setPhase(newState.phase);
      }
    },
    [exerciseType, reps, phase]
  );

  const reset = useCallback(() => {
    stateRef.current = createInitialState();
    setReps(0);
    setPhase("up");
  }, []);

  return { reps, phase, processKeypoints, reset };
}
