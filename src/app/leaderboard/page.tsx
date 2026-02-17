"use client";

import { useState, useEffect } from "react";
import LeaderboardComponent from "@/components/Leaderboard";
import { clsx } from "clsx";

type Tab = "reps" | "level" | "wins" | "mojo";

const TAB_TO_SORT: Record<Tab, string> = {
  reps: "totalReps",
  level: "level",
  wins: "wins",
  mojo: "totalReps",
};

interface LeaderboardEntry {
  rank: number;
  address: string;
  username?: string;
  value: string;
  label: string;
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reps");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?sort=${TAB_TO_SORT[activeTab]}&limit=20`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(
          data.map((d: LeaderboardEntry) => ({
            rank: d.rank,
            address: d.address,
            value: d.value,
            label: activeTab,
          }))
        );
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "reps", label: "Total Reps" },
    { id: "level", label: "Fighter Level" },
    { id: "wins", label: "Battle Wins" },
    { id: "mojo", label: "MOJO Earned" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-wii-ink mb-8">Leaderboard</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-studio-blue text-white shadow-glass"
                : "bg-white text-wii-muted hover:text-wii-ink border border-wii-glass"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-studio-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-wii-muted">Loading...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-wii-muted">No fighters ranked yet. Create a fighter and start exercising!</p>
        </div>
      ) : (
        <LeaderboardComponent
          title={tabs.find((t) => t.id === activeTab)?.label || ""}
          entries={entries}
        />
      )}
    </div>
  );
}
