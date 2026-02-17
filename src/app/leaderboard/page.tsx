"use client";

import { useState } from "react";
import LeaderboardComponent from "@/components/Leaderboard";
import { clsx } from "clsx";

type Tab = "reps" | "level" | "wins" | "mojo";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("reps");

  // In a production app, you'd query contract events or use a subgraph for rankings.
  // For the hackathon, we show the UI with placeholder data.
  const placeholderEntries = [
    { rank: 1, address: "0x1234567890abcdef1234567890abcdef12345678", value: "450", label: "reps" },
    { rank: 2, address: "0xabcdef1234567890abcdef1234567890abcdef12", value: "320", label: "reps" },
    { rank: 3, address: "0x7890abcdef1234567890abcdef1234567890abcd", value: "280", label: "reps" },
    { rank: 4, address: "0xdef1234567890abcdef1234567890abcdef123456", value: "150", label: "reps" },
    { rank: 5, address: "0x567890abcdef1234567890abcdef1234567890ab", value: "95", label: "reps" },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "reps", label: "Total Reps" },
    { id: "level", label: "Fighter Level" },
    { id: "wins", label: "Battle Wins" },
    { id: "mojo", label: "MOJO Earned" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Leaderboard</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-mojo-purple text-white"
                : "bg-mojo-card text-gray-400 hover:text-white border border-mojo-border"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <LeaderboardComponent
        title={tabs.find((t) => t.id === activeTab)?.label || ""}
        entries={placeholderEntries.map((e) => ({
          ...e,
          label: activeTab,
        }))}
      />

      <div className="mt-8 bg-mojo-card border border-mojo-border rounded-xl p-6 text-center">
        <p className="text-gray-400 text-sm">
          Rankings are computed from on-chain data. In production, this would use an indexer or subgraph
          to aggregate fighter stats and session results across all users.
        </p>
      </div>
    </div>
  );
}
