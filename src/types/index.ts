export enum ExerciseType {
  Pushups = 0,
  Squats = 1,
  JumpingJacks = 2,
}

export const EXERCISE_LABELS: Record<ExerciseType, string> = {
  [ExerciseType.Pushups]: "Pushups",
  [ExerciseType.Squats]: "Squats",
  [ExerciseType.JumpingJacks]: "Jumping Jacks",
};

export const EXERCISE_STAT: Record<ExerciseType, string> = {
  [ExerciseType.Pushups]: "Strength",
  [ExerciseType.Squats]: "Endurance",
  [ExerciseType.JumpingJacks]: "Agility",
};

export enum SessionStatus {
  Active = 0,
  Resolved = 1,
  Expired = 2,
}

export interface Session {
  exerciser: `0x${string}`;
  exerciseType: ExerciseType;
  targetReps: bigint;
  actualReps: bigint;
  startTime: bigint;
  status: SessionStatus;
  totalUpBets: bigint;
  totalDownBets: bigint;
}

export interface Fighter {
  strength: bigint;
  agility: bigint;
  endurance: bigint;
  totalReps: bigint;
  level: bigint;
  wins: bigint;
  losses: bigint;
  exists: boolean;
}

export interface Challenge {
  challenger: `0x${string}`;
  opponent: `0x${string}`;
  wager: bigint;
  status: number; // 0=Pending, 1=Accepted, 2=Resolved, 3=Cancelled
  winner: `0x${string}`;
}

export type ExercisePhase = "up" | "down";

export interface RepState {
  phase: ExercisePhase;
  reps: number;
  stableFrames: number;
  lastRepTime: number;
}

export interface Keypoint {
  x: number;
  y: number;
  score?: number;
  name?: string;
}
