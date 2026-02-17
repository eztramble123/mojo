"use client";

import { Fighter } from "@/types";
import { clsx } from "clsx";

interface Props {
  address: string;
  fighter: Fighter;
  compact?: boolean;
  onClick?: () => void;
}

export default function FighterCard({ address, fighter, compact, onClick }: Props) {
  const maxStat = Math.max(Number(fighter.strength), Number(fighter.agility), Number(fighter.endurance), 1);

  return (
    <div
      onClick={onClick}
      className={clsx(
        "glass-card transition-all",
        onClick && "cursor-pointer hover:shadow-glass-hover hover:-translate-y-0.5",
        compact ? "p-4" : "p-6"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-wii-muted">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <div className="text-lg font-semibold text-wii-ink">
            Level {fighter.level.toString()}
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-mojo-green font-medium">{fighter.wins.toString()}W</div>
          <div className="text-mojo-red font-medium">{fighter.losses.toString()}L</div>
        </div>
      </div>

      {!compact && (
        <div className="space-y-2">
          <StatBar label="STR" value={Number(fighter.strength)} max={maxStat} color="bg-ring-orange" />
          <StatBar label="AGI" value={Number(fighter.agility)} max={maxStat} color="bg-ring-blue" />
          <StatBar label="END" value={Number(fighter.endurance)} max={maxStat} color="bg-ring-pink" />
        </div>
      )}

      {compact && (
        <div className="text-xs text-wii-muted">
          Total Reps: {fighter.totalReps.toString()}
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-wii-muted w-8 font-medium uppercase tracking-wide">{label}</span>
      <div className="flex-1 bg-wii-mist rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-wii-ink w-8 text-right font-medium">{value}</span>
    </div>
  );
}
