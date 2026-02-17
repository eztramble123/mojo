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
    <div className="bg-mojo-card border border-mojo-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No data yet</p>
        )}
        {entries.map((entry, i) => (
          <div
            key={entry.address}
            className={clsx(
              "flex items-center justify-between p-3 rounded-lg",
              i < 3 ? "bg-mojo-purple/10" : "bg-mojo-dark"
            )}
          >
            <div className="flex items-center gap-3">
              <span className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                i === 0 ? "bg-yellow-500/20 text-yellow-500" :
                i === 1 ? "bg-gray-400/20 text-gray-400" :
                i === 2 ? "bg-orange-600/20 text-orange-600" :
                "bg-mojo-dark text-gray-500"
              )}>
                {entry.rank}
              </span>
              <span className="text-white text-sm">
                {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
              </span>
            </div>
            <div className="text-right">
              <div className="text-white font-medium text-sm">{entry.value}</div>
              <div className="text-gray-400 text-xs">{entry.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
