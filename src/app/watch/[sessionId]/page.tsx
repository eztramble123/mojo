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

  // Refetch session data periodically
  useEffect(() => {
    const interval = setInterval(refetch, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-mojo-card border border-mojo-border rounded-xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-mojo-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {EXERCISE_LABELS[session.exerciseType]} Session
          </h1>
          <p className="text-sm text-gray-400">
            by {session.exerciser.slice(0, 6)}...{session.exerciser.slice(-4)}
            {" | "}Target: {session.targetReps.toString()} reps
          </p>
        </div>
        {session.status === SessionStatus.Active && (
          <div className="px-3 py-1 bg-mojo-green/20 text-mojo-green rounded-full text-sm font-medium animate-pulse">
            LIVE
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ViewerStream stream={remoteStream} isConnected={isConnected} />

          {/* Live rep counter */}
          <div className="bg-mojo-card border border-mojo-border rounded-xl p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Live Rep Count</div>
            <div className="text-4xl font-bold text-white">
              {liveReps}
              <span className="text-xl text-gray-500">/{session.targetReps.toString()}</span>
            </div>
            <div className="w-full bg-mojo-dark rounded-full h-2 mt-3">
              <div
                className="bg-gradient-to-r from-mojo-purple to-mojo-blue h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (liveReps / Number(session.targetReps)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {session.status === SessionStatus.Resolved && (
            <div className="bg-mojo-card border border-mojo-border rounded-xl p-6 text-center">
              <div className={`text-2xl font-bold mb-2 ${
                session.actualReps >= session.targetReps ? "text-mojo-green" : "text-mojo-red"
              }`}>
                {session.actualReps >= session.targetReps ? "TARGET MET!" : "TARGET MISSED"}
              </div>
              <p className="text-gray-400">
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
