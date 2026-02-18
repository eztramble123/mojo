"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import {
  useMyFighter,
  useCreateFighter,
  useChallenge,
  useAcceptChallenge,
  useResolveBattle,
} from "@/hooks/useFighter";
import FighterCard from "@/components/FighterCard";
import BattleArena from "@/components/BattleArena";
import AgentPanel from "@/components/AgentPanel";
import Link from "next/link";

interface PendingChallenge {
  id: number;
  challenger: string;
  opponent: string;
  wager: string;
  status: number;
}

export default function ArenaPage() {
  const { address, isConnected } = useAccount();
  const { fighter: myFighter } = useMyFighter();
  const { createFighter, isPending: isCreatingFighter } = useCreateFighter();
  const { challengeFighter, isPending: isChallenging } = useChallenge();
  const { acceptChallenge, isPending: isAccepting } = useAcceptChallenge();
  const { resolveBattle, isPending: isResolving } = useResolveBattle();

  const [challengeAddr, setChallengeAddr] = useState("");
  const [wagerAmount, setWagerAmount] = useState("0.01");
  const [challengeIdInput, setChallengeIdInput] = useState("");
  const [pendingChallenges, setPendingChallenges] = useState<PendingChallenge[]>([]);
  const [battleView, setBattleView] = useState<{
    challengeId: bigint;
    challenger: { address: string; fighter: any };
    defender: { address: string; fighter: any };
    winner: string;
  } | null>(null);

  useEffect(() => {
    if (!address) return;
    fetch(`/api/challenges?opponent=${address}&status=0`)
      .then((r) => r.json())
      .then((data) => setPendingChallenges(data))
      .catch(() => setPendingChallenges([]));
  }, [address]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-card p-12 text-center">
          <h2 className="text-2xl font-semibold text-wii-ink mb-4">Connect Wallet to Enter the Arena</h2>
          <p className="text-wii-muted">You need a connected wallet and a MojoFighter to battle.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold text-wii-ink mb-8">Fighter Arena</h1>

      {/* Pending Challenges */}
      {pendingChallenges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-wii-ink mb-4">
            Pending Challenges
            <span className="text-sm text-ring-orange font-normal ml-2">
              ({pendingChallenges.length} waiting)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingChallenges.map((c) => (
              <div
                key={c.id}
                className="glass-card border-t-4 border-t-ring-orange/40 p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-wii-muted">Challenge #{c.id}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-ring-orange/10 text-ring-orange border border-ring-orange/30">
                    PENDING
                  </span>
                </div>
                <div className="text-sm text-wii-muted mb-1">
                  From: {c.challenger.slice(0, 6)}...{c.challenger.slice(-4)}
                </div>
                <div className="text-sm text-wii-ink font-semibold mb-3">
                  Wager: {formatEther(BigInt(c.wager))} MON
                </div>
                <button
                  onClick={() => {
                    setChallengeIdInput(String(c.id));
                    setWagerAmount(formatEther(BigInt(c.wager)));
                    acceptChallenge(BigInt(c.id), formatEther(BigInt(c.wager)));
                  }}
                  disabled={isAccepting}
                  className="w-full py-2 bg-mojo-green hover:bg-mojo-green/90 rounded-xl font-medium text-white text-sm transition-colors disabled:opacity-50"
                >
                  {isAccepting ? "Accepting..." : "Accept Challenge"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Your Fighter */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-wii-ink">Your Fighter</h2>

          {!myFighter?.exists ? (
            <div className="glass-card p-8 text-center">
              <p className="text-wii-muted mb-4">You don&apos;t have a fighter yet.</p>
              <p className="text-sm text-wii-muted/70 mb-6">
                Create one and level it up by completing exercise sessions!
              </p>
              <button
                onClick={() => createFighter()}
                disabled={isCreatingFighter}
                className="px-6 py-2 bg-studio-blue hover:bg-studio-blue/90 rounded-full font-medium text-white transition-colors disabled:opacity-50"
              >
                {isCreatingFighter ? "Creating..." : "Create Fighter"}
              </button>
            </div>
          ) : (
            <>
              <FighterCard address={address!} fighter={myFighter} />
              <div className="text-sm text-wii-muted text-center">
                <Link href="/exercise" className="text-studio-blue hover:underline">
                  Exercise to level up your fighter
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          {/* Challenge someone */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-wii-ink">Challenge a Fighter</h3>
            <div>
              <label className="block text-xs text-wii-muted mb-1 font-medium uppercase tracking-wide">Opponent Address</label>
              <input
                type="text"
                value={challengeAddr}
                onChange={(e) => setChallengeAddr(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 bg-wii-mist border border-wii-glass rounded-xl text-wii-ink text-sm focus:outline-none focus:border-studio-blue transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-wii-muted mb-1 font-medium uppercase tracking-wide">Wager (MON)</label>
              <input
                type="number"
                value={wagerAmount}
                onChange={(e) => setWagerAmount(e.target.value)}
                className="w-full px-3 py-2 bg-wii-mist border border-wii-glass rounded-xl text-wii-ink text-sm focus:outline-none focus:border-studio-blue transition-colors"
                min="0.001"
                step="0.01"
              />
            </div>
            <button
              onClick={() => challengeFighter(challengeAddr as `0x${string}`, wagerAmount)}
              disabled={isChallenging || !challengeAddr || !myFighter?.exists}
              className="w-full py-2.5 bg-ring-orange hover:bg-ring-orange/90 rounded-xl font-medium text-white transition-colors disabled:opacity-50"
            >
              {isChallenging ? "Sending Challenge..." : "Send Challenge"}
            </button>
          </div>

          {/* Accept a challenge */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-semibold text-wii-ink">Accept a Challenge</h3>
            <div>
              <label className="block text-xs text-wii-muted mb-1 font-medium uppercase tracking-wide">Challenge ID</label>
              <input
                type="number"
                value={challengeIdInput}
                onChange={(e) => setChallengeIdInput(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-wii-mist border border-wii-glass rounded-xl text-wii-ink text-sm focus:outline-none focus:border-studio-blue transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => acceptChallenge(BigInt(challengeIdInput), wagerAmount)}
                disabled={isAccepting || !challengeIdInput}
                className="py-2.5 bg-mojo-green hover:bg-mojo-green/90 rounded-xl font-medium text-white transition-colors disabled:opacity-50"
              >
                {isAccepting ? "Accepting..." : "Accept"}
              </button>
              <button
                onClick={() => resolveBattle(BigInt(challengeIdInput))}
                disabled={isResolving || !challengeIdInput}
                className="py-2.5 bg-ring-pink hover:bg-ring-pink/90 rounded-xl font-medium text-white transition-colors disabled:opacity-50"
              >
                {isResolving ? "Fighting..." : "Resolve Battle"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {battleView && (
        <div className="mt-8">
          <BattleArena
            challenger={battleView.challenger}
            defender={battleView.defender}
            winner={battleView.winner}
          />
        </div>
      )}

      <div className="mt-12">
        <AgentPanel address={address} fighter={myFighter} />
      </div>
    </div>
  );
}
