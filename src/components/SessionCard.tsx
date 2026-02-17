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
    <div className="glass-card-hover p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-base font-semibold text-wii-ink">
            {EXERCISE_LABELS[exerciseType]}
          </div>
          <div className="text-sm text-wii-muted">
            Target: {targetReps.toString()} reps
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          isActive
            ? "bg-studio-teal/10 text-studio-teal border border-studio-teal/30"
            : "bg-wii-mist text-wii-muted border border-wii-glass"
        }`}>
          {isActive ? "LIVE" : "ENDED"}
        </div>
      </div>

      <div className="text-sm text-wii-muted mb-3">
        by {exerciser.slice(0, 6)}...{exerciser.slice(-4)}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm">
          <span className="text-wii-muted">Pool: </span>
          <span className="text-wii-ink font-medium">{formatEther(totalPool)} MON</span>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-mojo-green font-medium">{formatEther(totalUpBets)} Up</span>
          <span className="text-mojo-red font-medium">{formatEther(totalDownBets)} Down</span>
        </div>
      </div>

      {isActive && (
        <Link
          href={`/watch/${sessionId}`}
          className="block text-center py-2 bg-studio-blue/10 hover:bg-studio-blue/20 text-studio-blue rounded-xl text-sm font-medium transition-colors"
        >
          Watch & Bet
        </Link>
      )}
    </div>
  );
}
