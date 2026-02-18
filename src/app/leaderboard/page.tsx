"use client";

import { useState, useEffect } from "react";
import LeaderboardComponent from "@/components/Leaderboard";
import { clsx } from "clsx";

type Tab = "reps" | "level" | "wins" | "mojo";
type PizzaState = "idle" | "open" | "placing" | "done";

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
  const [pizzaState, setPizzaState] = useState<PizzaState>("idle");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

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

  const winner = entries[0];

  function placeOrder() {
    if (!deliveryAddress.trim() || !name.trim()) return;
    setPizzaState("placing");
    setTimeout(() => {
      setPizzaState("done");
    }, 1800);
  }

  function closeModal() {
    setPizzaState("idle");
    setDeliveryAddress("");
    setName("");
    setPhone("");
    setNotes("");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-wii-ink mb-8">Leaderboard</h1>

      <div className="flex items-center gap-2 mb-6">
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

        <div className="ml-auto flex items-center gap-2">
          {pizzaState === "done" ? (
            <span className="text-xs font-medium text-wii-muted bg-wii-mist border border-wii-glass px-3 py-1.5 rounded-full">
              🍕 Order on the way!
            </span>
          ) : (
            <button
              onClick={() => setPizzaState("open")}
              className="text-xs font-medium text-white bg-ring-orange hover:bg-ring-orange/90 transition-colors px-3 py-1.5 rounded-full"
            >
              🍕 Send pizza to winner
            </button>
          )}
        </div>
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

      {/* Pizza modal */}
      {(pizzaState === "open" || pizzaState === "placing") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-wii-ink">🍕 Send Pizza to Winner</h2>
                {winner && (
                  <p className="text-xs text-wii-muted mt-0.5">
                    Delivering to {winner.address.slice(0, 6)}...{winner.address.slice(-4)}
                  </p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="text-wii-muted hover:text-wii-ink transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-wii-muted mb-1">Your name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 bg-wii-mist border border-wii-glass rounded-xl text-wii-ink text-sm focus:outline-none focus:border-studio-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-wii-muted mb-1">Delivery address</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="123 Main St, City, State"
                  className="w-full px-3 py-2 bg-wii-mist border border-wii-glass rounded-xl text-wii-ink text-sm focus:outline-none focus:border-studio-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-wii-muted mb-1">Phone number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-wii-mist border border-wii-glass rounded-xl text-wii-ink text-sm focus:outline-none focus:border-studio-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-wii-muted mb-1">Order notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Extra cheese, no olives..."
                  rows={2}
                  className="w-full px-3 py-2 bg-wii-mist border border-wii-glass rounded-xl text-wii-ink text-sm focus:outline-none focus:border-studio-blue resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={placeOrder}
                disabled={!deliveryAddress.trim() || !name.trim() || pizzaState === "placing"}
                className="flex-1 py-2 bg-ring-orange hover:bg-ring-orange/90 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {pizzaState === "placing" ? "Placing order..." : "Order from Papa John's"}
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-wii-mist hover:bg-wii-glass rounded-xl text-wii-muted text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
