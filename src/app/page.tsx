"use client";

import Link from "next/link";
import { useReadContract } from "wagmi";
import { mojoSessionConfig } from "@/lib/contracts";
import { useSession } from "@/hooks/useSession";
import SessionCard from "@/components/SessionCard";
import { useState, useEffect } from "react";
import { Session, SessionStatus } from "@/types";

export default function HomePage() {
  const { data: nextSessionId } = useReadContract({
    ...mojoSessionConfig,
    functionName: "nextSessionId",
  });

  const totalSessions = nextSessionId ? Number(nextSessionId) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-5xl sm:text-7xl font-bold mb-4">
          <span className="bg-gradient-to-r from-mojo-purple via-mojo-blue to-mojo-green bg-clip-text text-transparent">
            Move to Earn.
          </span>
          <br />
          <span className="bg-gradient-to-r from-mojo-orange to-mojo-red bg-clip-text text-transparent">
            Fight to Win.
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Exercise on camera. TF.js verifies your reps. Viewers bet on your success.
          Train your on-chain AI fighter and battle in the arena.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/exercise"
            className="px-8 py-3 bg-gradient-to-r from-mojo-purple to-mojo-blue rounded-lg font-bold text-white hover:opacity-90 transition-opacity text-lg"
          >
            Start Exercising
          </Link>
          <Link
            href="/arena"
            className="px-8 py-3 bg-mojo-card border border-mojo-border hover:border-mojo-purple rounded-lg font-bold text-white transition-colors text-lg"
          >
            Enter the Arena
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        {[
          { icon: "💪", title: "Exercise", desc: "Do pushups, squats, or jumping jacks on camera" },
          { icon: "🤖", title: "AI Verified", desc: "TensorFlow.js tracks and verifies your reps" },
          { icon: "💰", title: "Bet & Earn", desc: "Viewers bet MON on your success, you earn MOJO" },
          { icon: "⚔️", title: "Battle", desc: "Train your fighter and battle in the arena" },
        ].map((step) => (
          <div key={step.title} className="bg-mojo-card border border-mojo-border rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">{step.icon}</div>
            <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-gray-400">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Active Sessions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          Active Sessions
          {totalSessions > 0 && (
            <span className="text-sm text-gray-400 font-normal ml-2">
              ({totalSessions} total)
            </span>
          )}
        </h2>
        {totalSessions === 0 ? (
          <div className="bg-mojo-card border border-mojo-border rounded-xl p-12 text-center">
            <p className="text-gray-400 mb-4">No sessions yet. Be the first!</p>
            <Link
              href="/exercise"
              className="px-6 py-2 bg-mojo-purple hover:bg-mojo-purple/80 rounded-lg font-medium text-white transition-colors"
            >
              Start a Session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActiveSessionsList count={Math.min(totalSessions, 12)} />
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveSessionsList({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => count - 1 - i).map((id) => (
        <SessionCardWrapper key={id} sessionId={id} />
      ))}
    </>
  );
}

function SessionCardWrapper({ sessionId }: { sessionId: number }) {
  const { session } = useSession(BigInt(sessionId));

  if (!session) return null;

  return (
    <SessionCard
      sessionId={sessionId}
      exerciser={session.exerciser}
      exerciseType={session.exerciseType}
      targetReps={session.targetReps}
      status={session.status}
      totalUpBets={session.totalUpBets}
      totalDownBets={session.totalDownBets}
    />
  );
}
