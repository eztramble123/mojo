"use client";

import { useParams } from "next/navigation";
import { useFighter } from "@/hooks/useFighter";
import FighterCard from "@/components/FighterCard";
import Link from "next/link";

export default function FighterProfilePage() {
  const params = useParams();
  const address = params.address as `0x${string}`;
  const { fighter } = useFighter(address);

  if (!fighter || !fighter.exists) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-card p-12 text-center">
          <h2 className="text-2xl font-semibold text-wii-ink mb-4">Fighter Not Found</h2>
          <p className="text-wii-muted mb-4">This address doesn&apos;t have a MojoFighter yet.</p>
          <Link href="/arena" className="text-studio-blue hover:underline">
            Back to Arena
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-wii-ink">Fighter Profile</h1>
        <Link href="/arena" className="text-studio-blue hover:underline text-sm">
          Back to Arena
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FighterCard address={address} fighter={fighter} />

        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-wii-ink mb-4">Detailed Stats</h3>
            <div className="space-y-3">
              <StatRow label="Strength (Pushups)" value={Number(fighter.strength)} color="text-ring-orange" />
              <StatRow label="Agility (Jumping Jacks)" value={Number(fighter.agility)} color="text-ring-blue" />
              <StatRow label="Endurance (Squats)" value={Number(fighter.endurance)} color="text-ring-pink" />
              <div className="border-t border-wii-glass pt-3">
                <StatRow label="Total Reps" value={Number(fighter.totalReps)} color="text-wii-ink" />
                <StatRow label="Level" value={Number(fighter.level)} color="text-studio-blue" />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-wii-ink mb-4">Battle Record</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-mojo-green">{fighter.wins.toString()}</div>
                <div className="text-sm text-wii-muted">Wins</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-mojo-red">{fighter.losses.toString()}</div>
                <div className="text-sm text-wii-muted">Losses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-wii-ink">
                  {Number(fighter.wins) + Number(fighter.losses) > 0
                    ? `${Math.round((Number(fighter.wins) / (Number(fighter.wins) + Number(fighter.losses))) * 100)}%`
                    : "N/A"}
                </div>
                <div className="text-sm text-wii-muted">Win Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-wii-muted">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}
