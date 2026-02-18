"use client";

import { useState, useEffect } from "react";

interface LeaderboardEntry {
  rank: number;
  address: string;
  value: string;
  label: string;
}

type OrderState = "idle" | "placing" | "confirmed";

function fakeOrderNumber() {
  return "PJ-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function PizzaOrder() {
  const [leader, setLeader] = useState<LeaderboardEntry | null>(null);
  const [address, setAddress] = useState("");
  const [orderState, setOrderState] = useState<OrderState>("idle");
  const [orderNum, setOrderNum] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard?sort=totalReps&limit=1")
      .then((r) => r.json())
      .then((data: LeaderboardEntry[]) => {
        if (data.length > 0) setLeader(data[0]);
      })
      .catch(() => {});
  }, []);

  function handleOrder() {
    if (!address.trim()) return;
    setOrderState("placing");
    const num = fakeOrderNumber();
    setTimeout(() => {
      setOrderNum(num);
      setOrderState("confirmed");
    }, 1800);
  }

  if (orderState === "confirmed") {
    return (
      <div className="glass-card p-5 text-center space-y-2">
        <div className="text-2xl">🍕</div>
        <div className="font-semibold text-wii-ink">Order placed!</div>
        <div className="text-sm text-wii-muted">
          Papa John's order <span className="font-mono text-wii-ink">{orderNum}</span> is on its way to:
        </div>
        <div className="text-sm font-medium text-wii-ink">{address}</div>
        <div className="text-xs text-wii-muted pt-1">Est. 30–45 min · Congrats to {leader ? `${leader.address.slice(0, 6)}...${leader.address.slice(-4)}` : "the champ"}</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-wii-ink">Send pizza to the champ</div>
          {leader && (
            <div className="text-xs text-wii-muted">
              #1 right now: {leader.address.slice(0, 6)}...{leader.address.slice(-4)} · {leader.value} {leader.label}
            </div>
          )}
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-studio-blue hover:underline"
        >
          {open ? "Cancel" : "Order"}
        </button>
      </div>

      {open && (
        <div className="space-y-2 pt-1">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Delivery address..."
            className="w-full px-3 py-2 bg-wii-mist border border-wii-glass rounded-xl text-wii-ink text-sm focus:outline-none focus:border-studio-blue"
          />
          <button
            onClick={handleOrder}
            disabled={!address.trim() || orderState === "placing"}
            className="w-full py-2 bg-ring-orange hover:bg-ring-orange/90 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {orderState === "placing" ? "Placing order..." : "Order from Papa John's"}
          </button>
        </div>
      )}
    </div>
  );
}
