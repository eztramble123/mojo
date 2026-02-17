import { Keypoint } from "@/types";

/**
 * Calculate angle between three keypoints (in degrees).
 * The angle is at the middle point (b).
 */
export function calculateAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

/**
 * Get a keypoint by name from the pose detection result.
 */
export function getKeypoint(
  keypoints: Keypoint[],
  name: string
): Keypoint | undefined {
  return keypoints.find((kp) => kp.name === name);
}

/**
 * Check if a keypoint has sufficient confidence.
 */
export function isKeypointValid(kp: Keypoint | undefined, minScore = 0.3): boolean {
  return kp !== undefined && (kp.score === undefined || kp.score >= minScore);
}

/**
 * Draw skeleton overlay on canvas.
 */
export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  width: number,
  height: number
): void {
  ctx.clearRect(0, 0, width, height);

  // Draw connections
  const connections: [string, string][] = [
    ["left_shoulder", "right_shoulder"],
    ["left_shoulder", "left_elbow"],
    ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"],
    ["right_elbow", "right_wrist"],
    ["left_shoulder", "left_hip"],
    ["right_shoulder", "right_hip"],
    ["left_hip", "right_hip"],
    ["left_hip", "left_knee"],
    ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"],
    ["right_knee", "right_ankle"],
  ];

  ctx.strokeStyle = "#7C3AED";
  ctx.lineWidth = 3;

  for (const [nameA, nameB] of connections) {
    const a = getKeypoint(keypoints, nameA);
    const b = getKeypoint(keypoints, nameB);
    if (isKeypointValid(a) && isKeypointValid(b)) {
      ctx.beginPath();
      ctx.moveTo(a!.x, a!.y);
      ctx.lineTo(b!.x, b!.y);
      ctx.stroke();
    }
  }

  // Draw keypoints
  for (const kp of keypoints) {
    if (isKeypointValid(kp)) {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#10B981";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
