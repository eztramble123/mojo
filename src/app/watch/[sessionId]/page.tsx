"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useViewer } from "@/hooks/useWebRTC";
import ViewerStream from "@/components/ViewerStream";
import BettingPanel from "@/components/BettingPanel";
import { EXERCISE_LABELS, SessionStatus } from "@/types";

export default function WatchPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const sessionBigInt = BigInt(sessionId);

  const { session, refetch } = useSession(sessionBigInt);
  const { remoteStream, liveReps, isConnected, connect, disconnect } = useViewer(sessionId);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    const interval = setInterval(refetch, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-studio-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-wii-muted">Loading session...</p>
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
              {liveReps}
              <span className="text-xl text-wii-muted">/{session.targetReps.toString()}</span>
            </div>
            <div className="w-full bg-wii-mist rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-studio-blue to-studio-teal h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (liveReps / Number(session.targetReps)) * 100)}%`,
                }}
              />
            </div>
          </div>

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
          <BettingPanel sessionId={sessionBigInt} session={session} />
        </div>
      </div>
    </div>
  );
}
