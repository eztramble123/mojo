import { ExerciseType, Keypoint, ExercisePhase } from "@/types";
import { calculateAngle, getKeypoint, isKeypointValid } from "./poseUtils";

const MIN_CONFIDENCE = 0.5;
const STABLE_FRAMES_REQUIRED = 5;
const MIN_REP_INTERVAL_MS = 800;

interface ExerciseCheck {
  phase: ExercisePhase | null;
}

/**
 * Detect pushup phase from keypoints.
 * Requires plank position (body horizontal) and both arms visible.
 * Down: avg elbow angle < 90°, Up: avg elbow angle > 160°
 */
function detectPushups(keypoints: Keypoint[]): ExerciseCheck {
  const lShoulder = getKeypoint(keypoints, "left_shoulder");
  const rShoulder = getKeypoint(keypoints, "right_shoulder");
  const lElbow = getKeypoint(keypoints, "left_elbow");
  const rElbow = getKeypoint(keypoints, "right_elbow");
  const lWrist = getKeypoint(keypoints, "left_wrist");
  const rWrist = getKeypoint(keypoints, "right_wrist");
  const hip = getKeypoint(keypoints, "left_hip") || getKeypoint(keypoints, "right_hip");

  // Require ALL keypoints at high confidence
  const allPoints = [lShoulder, rShoulder, lElbow, rElbow, lWrist, rWrist, hip];
  if (allPoints.some((kp) => !isKeypointValid(kp, MIN_CONFIDENCE))) {
    return { phase: null };
  }

  // Plank position check: shoulder and hip Y should be close (body horizontal)
  // Standing person: shoulder.y << hip.y; plank person: similar Y values
  const avgShoulderY = (lShoulder!.y + rShoulder!.y) / 2;
  if (Math.abs(avgShoulderY - hip!.y) / Math.max(avgShoulderY, hip!.y, 1) > 0.3) {
    return { phase: null };
  }

  // Average both elbow angles
  const leftAngle = calculateAngle(lShoulder!, lElbow!, lWrist!);
  const rightAngle = calculateAngle(rShoulder!, rElbow!, rWrist!);
  const avgAngle = (leftAngle + rightAngle) / 2;

  if (avgAngle < 90) return { phase: "down" };
  if (avgAngle > 160) return { phase: "up" };
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
 * Requires both arms AND legs to agree on phase.
 * Up: arms raised (>140°) + legs apart (>1.5x hip width)
 * Down: arms at sides (<50°) + legs together (<1.0x hip width)
 */
function detectJumpingJacks(keypoints: Keypoint[]): ExerciseCheck {
  const lHip = getKeypoint(keypoints, "left_hip");
  const rHip = getKeypoint(keypoints, "right_hip");
  const lShoulder = getKeypoint(keypoints, "left_shoulder");
  const rShoulder = getKeypoint(keypoints, "right_shoulder");
  const lWrist = getKeypoint(keypoints, "left_wrist");
  const rWrist = getKeypoint(keypoints, "right_wrist");
  const lAnkle = getKeypoint(keypoints, "left_ankle");
  const rAnkle = getKeypoint(keypoints, "right_ankle");

  // Require ALL keypoints at high confidence
  const allPoints = [lHip, rHip, lShoulder, rShoulder, lWrist, rWrist, lAnkle, rAnkle];
  if (allPoints.some((kp) => !isKeypointValid(kp, MIN_CONFIDENCE))) {
    return { phase: null };
  }

  // Arm angle (average both sides)
  const leftArmAngle = calculateAngle(lHip!, lShoulder!, lWrist!);
  const rightArmAngle = calculateAngle(rHip!, rShoulder!, rWrist!);
  const avgArmAngle = (leftArmAngle + rightArmAngle) / 2;

  // Leg spread ratio
  const hipWidth = Math.abs(lHip!.x - rHip!.x);
  const ankleSpread = Math.abs(lAnkle!.x - rAnkle!.x);
  const spreadRatio = ankleSpread / Math.max(hipWidth, 1);

  // Both arms AND legs must agree on phase
  const armsUp = avgArmAngle > 140;
  const armsDown = avgArmAngle < 50;
  const legsApart = spreadRatio > 1.5;
  const legsTogether = spreadRatio < 1.0;

  if (armsUp && legsApart) return { phase: "up" };
  if (armsDown && legsTogether) return { phase: "down" };
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
