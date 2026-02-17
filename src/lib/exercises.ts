import { ExerciseType, Keypoint, ExercisePhase } from "@/types";
import { calculateAngle, getKeypoint, isKeypointValid } from "./poseUtils";

const MIN_CONFIDENCE = 0.3;
const STABLE_FRAMES_REQUIRED = 3;
const MIN_REP_INTERVAL_MS = 500;

interface ExerciseCheck {
  phase: ExercisePhase | null;
}

/**
 * Detect pushup phase from keypoints.
 * Tracks elbow angle (shoulder-elbow-wrist).
 * Down: < 90 degrees, Up: > 160 degrees
 */
function detectPushups(keypoints: Keypoint[]): ExerciseCheck {
  const shoulder = getKeypoint(keypoints, "left_shoulder") || getKeypoint(keypoints, "right_shoulder");
  const elbow = getKeypoint(keypoints, "left_elbow") || getKeypoint(keypoints, "right_elbow");
  const wrist = getKeypoint(keypoints, "left_wrist") || getKeypoint(keypoints, "right_wrist");

  if (!isKeypointValid(shoulder, MIN_CONFIDENCE) ||
      !isKeypointValid(elbow, MIN_CONFIDENCE) ||
      !isKeypointValid(wrist, MIN_CONFIDENCE)) {
    return { phase: null };
  }

  const angle = calculateAngle(shoulder!, elbow!, wrist!);

  if (angle < 90) return { phase: "down" };
  if (angle > 160) return { phase: "up" };
  return { phase: null };
}

/**
 * Detect squat phase from keypoints.
 * Tracks knee angle (hip-knee-ankle).
 * Down: < 100 degrees, Up: > 160 degrees
 */
function detectSquats(keypoints: Keypoint[]): ExerciseCheck {
  const hip = getKeypoint(keypoints, "left_hip") || getKeypoint(keypoints, "right_hip");
  const knee = getKeypoint(keypoints, "left_knee") || getKeypoint(keypoints, "right_knee");
  const ankle = getKeypoint(keypoints, "left_ankle") || getKeypoint(keypoints, "right_ankle");

  if (!isKeypointValid(hip, MIN_CONFIDENCE) ||
      !isKeypointValid(knee, MIN_CONFIDENCE) ||
      !isKeypointValid(ankle, MIN_CONFIDENCE)) {
    return { phase: null };
  }

  const angle = calculateAngle(hip!, knee!, ankle!);

  if (angle < 100) return { phase: "down" };
  if (angle > 160) return { phase: "up" };
  return { phase: null };
}

/**
 * Detect jumping jack phase from keypoints.
 * Tracks shoulder angle (hip-shoulder-wrist).
 * Down (arms at sides): < 50 degrees, Up (arms raised): > 140 degrees
 */
function detectJumpingJacks(keypoints: Keypoint[]): ExerciseCheck {
  const hip = getKeypoint(keypoints, "left_hip") || getKeypoint(keypoints, "right_hip");
  const shoulder = getKeypoint(keypoints, "left_shoulder") || getKeypoint(keypoints, "right_shoulder");
  const wrist = getKeypoint(keypoints, "left_wrist") || getKeypoint(keypoints, "right_wrist");

  if (!isKeypointValid(hip, MIN_CONFIDENCE) ||
      !isKeypointValid(shoulder, MIN_CONFIDENCE) ||
      !isKeypointValid(wrist, MIN_CONFIDENCE)) {
    return { phase: null };
  }

  const angle = calculateAngle(hip!, shoulder!, wrist!);

  if (angle < 50) return { phase: "down" };
  if (angle > 140) return { phase: "up" };
  return { phase: null };
}

const detectors: Record<ExerciseType, (keypoints: Keypoint[]) => ExerciseCheck> = {
  [ExerciseType.Pushups]: detectPushups,
  [ExerciseType.Squats]: detectSquats,
  [ExerciseType.JumpingJacks]: detectJumpingJacks,
};

export interface CounterState {
  phase: ExercisePhase;
  reps: number;
  stableFrames: number;
  lastRepTime: number;
}

export function createInitialState(): CounterState {
  return {
    phase: "up",
    reps: 0,
    stableFrames: 0,
    lastRepTime: 0,
  };
}

/**
 * Process a frame of keypoints and return updated counter state.
 * A rep is counted on a complete down→up cycle.
 */
export function processFrame(
  state: CounterState,
  keypoints: Keypoint[],
  exerciseType: ExerciseType
): CounterState {
  const detector = detectors[exerciseType];
  const check = detector(keypoints);

  if (check.phase === null) {
    // No valid detection, reset stable counter
    return { ...state, stableFrames: 0 };
  }

  if (check.phase === state.phase) {
    // Same phase, no transition
    return { ...state, stableFrames: 0 };
  }

  // Different phase detected - count stable frames
  const newStable = state.stableFrames + 1;

  if (newStable < STABLE_FRAMES_REQUIRED) {
    return { ...state, stableFrames: newStable };
  }

  // Stable transition confirmed
  const now = Date.now();

  if (check.phase === "up" && state.phase === "down") {
    // Down → Up = completed rep
    if (now - state.lastRepTime >= MIN_REP_INTERVAL_MS) {
      return {
        phase: "up",
        reps: state.reps + 1,
        stableFrames: 0,
        lastRepTime: now,
      };
    }
  }

  // Up → Down or timing too fast
  return {
    ...state,
    phase: check.phase,
    stableFrames: 0,
  };
}
