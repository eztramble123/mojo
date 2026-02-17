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
  const totalStats = Number(fighter.strength) + Number(fighter.agility) + Number(fighter.endurance);
  const maxStat = Math.max(Number(fighter.strength), Number(fighter.agility), Number(fighter.endurance), 1);

  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-mojo-card border border-mojo-border rounded-xl transition-all",
        onClick && "cursor-pointer hover:border-mojo-purple/50 hover:shadow-lg hover:shadow-mojo-purple/10",
        compact ? "p-4" : "p-6"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-400">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <div className="text-lg font-bold text-white">
            Level {fighter.level.toString()}
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-mojo-green">{fighter.wins.toString()}W</div>
          <div className="text-mojo-red">{fighter.losses.toString()}L</div>
        </div>
      </div>

      {!compact && (
        <div className="space-y-2">
          <StatBar label="STR" value={Number(fighter.strength)} max={maxStat} color="bg-mojo-red" />
          <StatBar label="AGI" value={Number(fighter.agility)} max={maxStat} color="bg-mojo-blue" />
          <StatBar label="END" value={Number(fighter.endurance)} max={maxStat} color="bg-mojo-green" />
        </div>
      )}

      {compact && (
        <div className="text-xs text-gray-400">
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
      <span className="text-xs text-gray-400 w-8">{label}</span>
      <div className="flex-1 bg-mojo-dark rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white w-8 text-right">{value}</span>
    </div>
  );
}
