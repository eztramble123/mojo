import Link from "next/link";
import SessionCard from "@/components/SessionCard";
import Leaderboard from "@/components/Leaderboard";
import { SessionStatus } from "@/types";

interface ApiSession {
  id: number;
  exerciser: string;
  exerciseType: number;
  targetReps: number;
  actualReps: number;
  startTime: number;
  status: number;
  totalUpBets: string;
  totalDownBets: string;
  targetMet: boolean;
}

interface LeaderboardEntry {
  rank: number;
  address: string;
  value: string;
  label: string;
}

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/leaderboard?sort=totalReps&limit=5`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getActiveSessions(): Promise<ApiSession[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const res = await fetch(`${baseUrl}/api/sessions?status=0&limit=12`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [sessions, leaderboard] = await Promise.all([
    getActiveSessions(),
    getLeaderboard(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-20">
        <h1 className="text-5xl sm:text-7xl font-semibold mb-5 text-wii-ink tracking-tight">
          Bet on your{" "}
          <span className="text-studio-blue italic" style={{ fontFamily: 'var(--font-cursive)' }}>best self.</span>
        </h1>
        <p className="text-lg text-wii-muted max-w-xl mx-auto mb-10">
          Stake on workouts, compete with friends, track streaks.
          AI-verified reps on Monad.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/exercise"
            className="px-8 py-3 bg-studio-blue hover:bg-studio-blue/90 rounded-full font-semibold text-white transition-colors text-base shadow-glass"
          >
            Start Exercising
          </Link>
          <Link
            href="/arena"
            className="px-8 py-3 bg-white border border-wii-glass hover:border-studio-blue rounded-full font-semibold text-wii-ink transition-colors text-base shadow-float"
          >
            Enter the Arena
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          {
            ring: "ring-orange",
            color: "border-ring-orange/40",
            title: "Exercise",
            desc: "Do pushups, squats, or jumping jacks on camera. TF.js verifies your reps.",
          },
          {
            ring: "ring-blue",
            color: "border-ring-blue/40",
            title: "Stake & Compete",
            desc: "Pick your challenge, lock in your commitment, and let viewers bet on your success.",
          },
          {
            ring: "ring-pink",
            color: "border-ring-pink/40",
            title: "Train & Battle",
            desc: "Level up your on-chain fighter with every rep. Challenge others in the arena.",
          },
        ].map((step) => (
          <div
            key={step.title}
            className={`glass-card p-8 text-center border-t-4 ${step.color}`}
          >
            <div className={`w-14 h-14 rounded-full border-[3px] ${step.color} mx-auto mb-5 flex items-center justify-center`}>
              <div className={`w-4 h-4 rounded-full bg-${step.ring.replace('ring-', 'ring-')}/30`} />
            </div>
            <h3 className="text-lg font-semibold text-wii-ink mb-2">{step.title}</h3>
            <p className="text-sm text-wii-muted leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Active Sessions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-wii-ink">
            Live Challenges
            {sessions.length > 0 && (
              <span className="text-sm text-wii-muted font-normal ml-2">
                ({sessions.length} active)
              </span>
            )}
          </h2>
        </div>
        {sessions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-wii-muted mb-4">No active sessions right now. Be the first!</p>
            <Link
              href="/exercise"
              className="inline-block px-6 py-2 bg-studio-blue hover:bg-studio-blue/90 rounded-full font-medium text-white transition-colors text-sm"
            >
              Start a Session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((s) => (
              <SessionCard
                key={s.id}
                sessionId={s.id}
                exerciser={s.exerciser}
                exerciseType={s.exerciseType}
                targetReps={BigInt(s.targetReps)}
                status={s.status as SessionStatus}
                totalUpBets={BigInt(s.totalUpBets)}
                totalDownBets={BigInt(s.totalDownBets)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top Movers */}
      <div className="mt-20 max-w-md mx-auto">
        <Leaderboard entries={leaderboard} title="Top Movers" />
        <div className="text-center mt-4">
          <Link
            href="/leaderboard"
            className="text-sm text-studio-blue hover:underline font-medium"
          >
            View full leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
