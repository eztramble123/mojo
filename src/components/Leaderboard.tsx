"use client";

import { clsx } from "clsx";

interface LeaderboardEntry {
  rank: number;
  address: string;
  value: string;
  label: string;
}

interface Props {
  entries: LeaderboardEntry[];
  title: string;
}

export default function Leaderboard({ entries, title }: Props) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-wii-ink mb-4">{title}</h3>
      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-wii-muted text-sm text-center py-4">No data yet</p>
        )}
        {entries.map((entry, i) => (
          <div
            key={entry.address}
            className={clsx(
              "flex items-center justify-between p-3 rounded-xl transition-colors",
              i < 3 ? "bg-studio-blue/5" : "bg-wii-mist/50"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                i === 0 ? "bg-ring-orange/15 text-ring-orange" :
                i === 1 ? "bg-wii-glass/50 text-wii-muted" :
                i === 2 ? "bg-ring-pink/15 text-ring-pink" :
                "bg-wii-mist text-wii-muted"
              )}>
                {entry.rank}
              </span>
              <span className="text-wii-ink text-sm font-medium">
                {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-wii-ink font-semibold text-sm">{entry.value}</div>
              <div className="text-wii-muted text-xs">{entry.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
