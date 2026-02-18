"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useViewer } from "@/hooks/useWebRTC";
import ViewerStream from "@/components/ViewerStream";
import BettingPanel from "@/components/BettingPanel";
import ActivityFeed from "@/components/ActivityFeed";
import { EXERCISE_LABELS, SessionStatus, Session } from "@/types";

export default function WatchPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  // Try parsing as BigInt for on-chain reads (only works for numeric IDs)
  let sessionBigInt: bigint | undefined;
  try {
    sessionBigInt = BigInt(sessionId);
  } catch {
    // Could be a tx hash or invalid — skip on-chain read
  }

  const { session: onChainSession, refetch } = useSession(sessionBigInt);
  const [dbSession, setDbSession] = useState<Session | null>(null);
  const { remoteStream, liveReps, isConnected, activityFeed, connect, disconnect, sendReaction, addActivity } = useViewer(sessionId);

  // Use whichever session source loads first
  const session = onChainSession || dbSession;

  // Track milestones
  const milestonesHit = useRef(new Set<number>());

  // Connect to broadcaster
  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  // Poll session from DB as fast fallback
  useEffect(() => {
    if (!sessionBigInt) return;

    async function fetchSession() {
      try {
        const res = await fetch(`/api/sessions?status=&limit=100`);
        const sessions = await res.json();
        const match = sessions.find((s: { id: number }) => s.id === Number(sessionBigInt));
        if (match) {
          setDbSession({
            exerciser: match.exerciser,
            exerciseType: match.exerciseType,
            targetReps: BigInt(match.targetReps),
            actualReps: BigInt(match.actualReps),
            startTime: BigInt(match.startTime),
            status: match.status,
            totalUpBets: BigInt(match.totalUpBets || "0"),
            totalDownBets: BigInt(match.totalDownBets || "0"),
          });
        }
      } catch {
        // API not available
      }
    }

    fetchSession();
  }, [sessionBigInt]);

  // Poll on-chain data every 1s while live, every 5s otherwise
  useEffect(() => {
    const isLive = session?.status === SessionStatus.Active;
    const interval = setInterval(refetch, isLive ? 1000 : 5000);
    return () => clearInterval(interval);
  }, [refetch, session?.status]);

  // Generate milestone events
  useEffect(() => {
    if (!session) return;
    const target = Number(session.targetReps);
    if (target <= 0) return;

    for (const pct of [25, 50, 75, 100]) {
      const threshold = Math.ceil((pct / 100) * target);
      if (liveReps >= threshold && !milestonesHit.current.has(pct)) {
        milestonesHit.current.add(pct);
        addActivity("milestone", `${pct}% complete! (${liveReps}/${target} reps)`);
      }
    }
  }, [liveReps, session, addActivity]);

  const handleBetPlaced = (amount: string, isUp: boolean) => {
    addActivity("betPlaced", `You bet ${amount} MON ${isUp ? "UP" : "DOWN"}`);
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-studio-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-wii-muted">Loading session...</p>
          <p className="text-wii-muted/50 text-xs mt-2">Session #{sessionId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-wii-ink">
            {EXERCISE_LABELS[session.exerciseType]} Session
          </h1>
          <p className="text-sm text-wii-muted">
            by {session.exerciser.slice(0, 6)}...{session.exerciser.slice(-4)}
            {" | "}Target: {session.targetReps.toString()} reps
          </p>
        </div>
        {session.status === SessionStatus.Active && (
          <div className="px-3 py-1 bg-studio-teal/10 text-studio-teal border border-studio-teal/30 rounded-full text-sm font-medium animate-pulse">
            LIVE
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ViewerStream stream={remoteStream} isConnected={isConnected} />

          {/* Live rep counter */}
          <div className="glass-card p-4 text-center">
            <div className="text-sm text-wii-muted mb-1">Live Rep Count</div>
            <div className="text-4xl font-bold text-wii-ink">
              {liveReps || Number(session.actualReps)}
              <span className="text-xl text-wii-muted">/{session.targetReps.toString()}</span>
            </div>
            <div className="w-full bg-wii-mist rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-studio-blue to-studio-teal h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, ((liveReps || Number(session.actualReps)) / Number(session.targetReps)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Connection status */}
          {!isConnected && session.status === SessionStatus.Active && (
            <div className="glass-card p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-studio-blue border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-wii-muted">Connecting to live stream...</p>
              </div>
            </div>
          )}

          {/* Activity Feed */}
          <ActivityFeed events={activityFeed} onReaction={sendReaction} />

          {session.status === SessionStatus.Resolved && (
            <div className="glass-card p-6 text-center">
              <div className={`text-2xl font-semibold mb-2 ${
                session.actualReps >= session.targetReps ? "text-mojo-green" : "text-mojo-red"
              }`}>
                {session.actualReps >= session.targetReps ? "TARGET MET!" : "TARGET MISSED"}
              </div>
              <p className="text-wii-muted">
                {session.actualReps.toString()} / {session.targetReps.toString()} reps completed
              </p>
            </div>
          )}
        </div>

        <div>
          {sessionBigInt !== undefined && (
            <BettingPanel sessionId={sessionBigInt} session={session} onBetPlaced={handleBetPlaced} />
          )}
        </div>
      </div>
    </div>
  );
}
