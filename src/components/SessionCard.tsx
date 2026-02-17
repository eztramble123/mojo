"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { EXERCISE_LABELS, ExerciseType, SessionStatus } from "@/types";

interface Props {
  sessionId: number;
  exerciser: string;
  exerciseType: ExerciseType;
  targetReps: bigint;
  status: SessionStatus;
  totalUpBets: bigint;
  totalDownBets: bigint;
}

export default function SessionCard({
  sessionId,
  exerciser,
  exerciseType,
  targetReps,
  status,
  totalUpBets,
  totalDownBets,
}: Props) {
  const totalPool = totalUpBets + totalDownBets;
  const isActive = status === SessionStatus.Active;

  return (
    <div className="bg-mojo-card border border-mojo-border rounded-xl p-5 hover:border-mojo-purple/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-lg font-bold text-white">
            {EXERCISE_LABELS[exerciseType]}
          </div>
          <div className="text-sm text-gray-400">
            Target: {targetReps.toString()} reps
          </div>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          isActive ? "bg-mojo-green/20 text-mojo-green" : "bg-gray-600/20 text-gray-400"
        }`}>
          {isActive ? "LIVE" : "ENDED"}
        </div>
      </div>

      <div className="text-sm text-gray-400 mb-3">
        by {exerciser.slice(0, 6)}...{exerciser.slice(-4)}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm">
          <span className="text-gray-400">Pool: </span>
          <span className="text-white font-medium">{formatEther(totalPool)} MON</span>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-mojo-green">{formatEther(totalUpBets)} Up</span>
          <span className="text-mojo-red">{formatEther(totalDownBets)} Down</span>
        </div>
      </div>

      {isActive && (
        <Link
          href={`/watch/${sessionId}`}
          className="block text-center py-2 bg-mojo-purple/20 hover:bg-mojo-purple/30 text-mojo-purple rounded-lg text-sm font-medium transition-colors"
        >
          Watch & Bet
        </Link>
      )}
    </div>
  );
}
