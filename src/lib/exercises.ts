import { ExerciseType, Keypoint, ExercisePhase } from "@/types";
import { calculateAngle, getKeypoint, isKeypointValid } from "./poseUtils";

const MIN_CONFIDENCE = 0.3;
const STABLE_FRAMES_REQUIRED = 3;
const MIN_REP_INTERVAL_MS = 600;

interface ExerciseCheck {
  phase: ExercisePhase | null;
}

/**
 * Detect pushup phase from keypoints.
 * Uses elbow angle — checks whichever side has better confidence.
 * Down: avg elbow angle < 120°, Up: avg elbow angle > 145°
 */
function detectPushups(keypoints: Keypoint[]): ExerciseCheck {
  const lShoulder = getKeypoint(keypoints, "left_shoulder");
  const rShoulder = getKeypoint(keypoints, "right_shoulder");
  const lElbow = getKeypoint(keypoints, "left_elbow");
  const rElbow = getKeypoint(keypoints, "right_elbow");
  const lWrist = getKeypoint(keypoints, "left_wrist");
  const rWrist = getKeypoint(keypoints, "right_wrist");

  // Try to get at least one valid arm
  const leftValid =
    isKeypointValid(lShoulder, MIN_CONFIDENCE) &&
    isKeypointValid(lElbow, MIN_CONFIDENCE) &&
    isKeypointValid(lWrist, MIN_CONFIDENCE);
  const rightValid =
    isKeypointValid(rShoulder, MIN_CONFIDENCE) &&
    isKeypointValid(rElbow, MIN_CONFIDENCE) &&
    isKeypointValid(rWrist, MIN_CONFIDENCE);

  if (!leftValid && !rightValid) {
    return { phase: null };
  }

  // Use whichever arm(s) are visible
  let angle: number;
  if (leftValid && rightValid) {
    const leftAngle = calculateAngle(lShoulder!, lElbow!, lWrist!);
    const rightAngle = calculateAngle(rShoulder!, rElbow!, rWrist!);
    angle = (leftAngle + rightAngle) / 2;
  } else if (leftValid) {
    angle = calculateAngle(lShoulder!, lElbow!, lWrist!);
  } else {
    angle = calculateAngle(rShoulder!, rElbow!, rWrist!);
  }

  if (angle < 120) return { phase: "down" };
  if (angle > 145) return { phase: "up" };
  return { phase: null };
}

/**
 * Detect squat phase from keypoints.
 * Tracks knee angle (hip-knee-ankle) on whichever side is visible.
 * Down: < 130 degrees, Up: > 155 degrees
 */
function detectSquats(keypoints: Keypoint[]): ExerciseCheck {
  const lHip = getKeypoint(keypoints, "left_hip");
  const rHip = getKeypoint(keypoints, "right_hip");
  const lKnee = getKeypoint(keypoints, "left_knee");
  const rKnee = getKeypoint(keypoints, "right_knee");
  const lAnkle = getKeypoint(keypoints, "left_ankle");
  const rAnkle = getKeypoint(keypoints, "right_ankle");

  const leftValid =
    isKeypointValid(lHip, MIN_CONFIDENCE) &&
    isKeypointValid(lKnee, MIN_CONFIDENCE) &&
    isKeypointValid(lAnkle, MIN_CONFIDENCE);
  const rightValid =
    isKeypointValid(rHip, MIN_CONFIDENCE) &&
    isKeypointValid(rKnee, MIN_CONFIDENCE) &&
    isKeypointValid(rAnkle, MIN_CONFIDENCE);

  if (!leftValid && !rightValid) {
    return { phase: null };
  }

  let angle: number;
  if (leftValid && rightValid) {
    const leftAngle = calculateAngle(lHip!, lKnee!, lAnkle!);
    const rightAngle = calculateAngle(rHip!, rKnee!, rAnkle!);
    angle = (leftAngle + rightAngle) / 2;
  } else if (leftValid) {
    angle = calculateAngle(lHip!, lKnee!, lAnkle!);
  } else {
    angle = calculateAngle(rHip!, rKnee!, rAnkle!);
  }

  if (angle < 130) return { phase: "down" };
  if (angle > 155) return { phase: "up" };
  return { phase: null };
}

/**
 * Detect jumping jack phase from keypoints.
 * Arms OR legs can independently indicate phase (don't require both to agree).
 * Up: arms raised (>120°) OR legs apart (>1.2x hip width)
 * Down: arms at sides (<70°) AND legs together (<1.1x hip width)
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

  // Check arms — need at least one side
  let armAngle: number | null = null;
  const leftArmValid =
    isKeypointValid(lHip, MIN_CONFIDENCE) &&
    isKeypointValid(lShoulder, MIN_CONFIDENCE) &&
    isKeypointValid(lWrist, MIN_CONFIDENCE);
  const rightArmValid =
    isKeypointValid(rHip, MIN_CONFIDENCE) &&
    isKeypointValid(rShoulder, MIN_CONFIDENCE) &&
    isKeypointValid(rWrist, MIN_CONFIDENCE);

  if (leftArmValid && rightArmValid) {
    const la = calculateAngle(lHip!, lShoulder!, lWrist!);
    const ra = calculateAngle(rHip!, rShoulder!, rWrist!);
    armAngle = (la + ra) / 2;
  } else if (leftArmValid) {
    armAngle = calculateAngle(lHip!, lShoulder!, lWrist!);
  } else if (rightArmValid) {
    armAngle = calculateAngle(rHip!, rShoulder!, rWrist!);
  }

  // Check legs
  let spreadRatio: number | null = null;
  if (
    isKeypointValid(lHip, MIN_CONFIDENCE) &&
    isKeypointValid(rHip, MIN_CONFIDENCE) &&
    isKeypointValid(lAnkle, MIN_CONFIDENCE) &&
    isKeypointValid(rAnkle, MIN_CONFIDENCE)
  ) {
    const hipWidth = Math.abs(lHip!.x - rHip!.x);
    const ankleSpread = Math.abs(lAnkle!.x - rAnkle!.x);
    spreadRatio = ankleSpread / Math.max(hipWidth, 1);
  }

  if (armAngle === null && spreadRatio === null) {
    return { phase: null };
  }

  const armsUp = armAngle !== null && armAngle > 120;
  const armsDown = armAngle !== null && armAngle < 70;
  const legsApart = spreadRatio !== null && spreadRatio > 1.2;
  const legsTogether = spreadRatio !== null && spreadRatio < 1.1;

  // Up: either arms up or legs apart (more forgiving)
  if (armsUp || legsApart) return { phase: "up" };
  // Down: arms down (if visible) or legs together (if visible)
  if (armsDown || legsTogether) return { phase: "down" };
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
 * A rep is counted on a complete down->up cycle.
 */
export function processFrame(
  state: CounterState,
  keypoints: Keypoint[],
  exerciseType: ExerciseType
): CounterState {
  const detector = detectors[exerciseType];
  const check = detector(keypoints);

  if (check.phase === null) {
    // No valid detection — don't reset stable counter, just skip
    return state;
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
    // Down -> Up = completed rep
    if (now - state.lastRepTime >= MIN_REP_INTERVAL_MS) {
      return {
        phase: "up",
        reps: state.reps + 1,
        stableFrames: 0,
        lastRepTime: now,
      };
    }
  }

  // Up -> Down or timing too fast
  return {
    ...state,
    phase: check.phase,
    stableFrames: 0,
  };
}
