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
    <div className="glass-card p-5">
      {title && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-wii-muted">{title}</h3>
        </div>
      )}

      <div className="space-y-1">
        {entries.map((entry) => (
          <div
            key={entry.address}
            className="flex items-center justify-between py-2.5 border-b border-wii-glass/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-wii-muted w-5 text-right">{entry.rank}</span>
              <span className="text-sm font-medium text-wii-ink">
                {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-wii-ink">{entry.value}</div>
              <div className="text-xs text-wii-muted">{entry.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
