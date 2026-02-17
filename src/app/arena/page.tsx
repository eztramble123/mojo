"use client";

import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import {
  useMyFighter,
  useCreateFighter,
  useFighter,
  useChallenge,
  useAcceptChallenge,
  useResolveBattle,
  useChallengeInfo,
} from "@/hooks/useFighter";
import FighterCard from "@/components/FighterCard";
import BattleArena from "@/components/BattleArena";
import Link from "next/link";

export default function ArenaPage() {
  const { address, isConnected } = useAccount();
  const { fighter: myFighter, refetch: refetchFighter } = useMyFighter();
  const { createFighter, isPending: isCreatingFighter } = useCreateFighter();
  const { challengeFighter, isPending: isChallenging } = useChallenge();
  const { acceptChallenge, isPending: isAccepting } = useAcceptChallenge();
  const { resolveBattle, isPending: isResolving } = useResolveBattle();

  const [challengeAddr, setChallengeAddr] = useState("");
  const [wagerAmount, setWagerAmount] = useState("0.01");
  const [challengeIdInput, setChallengeIdInput] = useState("");
  const [battleView, setBattleView] = useState<{
    challengeId: bigint;
    challenger: { address: string; fighter: any };
    defender: { address: string; fighter: any };
    winner: string;
  } | null>(null);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-mojo-card border border-mojo-border rounded-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet to Enter the Arena</h2>
          <p className="text-gray-400">You need a connected wallet and a MojoFighter to battle.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Fighter Arena</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Your Fighter */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Your Fighter</h2>

          {!myFighter?.exists ? (
            <div className="bg-mojo-card border border-mojo-border rounded-xl p-8 text-center">
              <p className="text-gray-400 mb-4">You don&apos;t have a fighter yet.</p>
              <p className="text-sm text-gray-500 mb-6">
                Create one and level it up by completing exercise sessions!
              </p>
              <button
                onClick={() => createFighter()}
                disabled={isCreatingFighter}
                className="px-6 py-2 bg-mojo-purple hover:bg-mojo-purple/80 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
              >
                {isCreatingFighter ? "Creating..." : "Create Fighter"}
              </button>
            </div>
          ) : (
            <>
              <FighterCard address={address!} fighter={myFighter} />
              <div className="text-sm text-gray-400 text-center">
                <Link href="/exercise" className="text-mojo-purple hover:underline">
                  Exercise to level up your fighter
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-6">
          {/* Challenge someone */}
          <div className="bg-mojo-card border border-mojo-border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Challenge a Fighter</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Opponent Address</label>
              <input
                type="text"
                value={challengeAddr}
                onChange={(e) => setChallengeAddr(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 bg-mojo-dark border border-mojo-border rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Wager (MON)</label>
              <input
                type="number"
                value={wagerAmount}
                onChange={(e) => setWagerAmount(e.target.value)}
                className="w-full px-3 py-2 bg-mojo-dark border border-mojo-border rounded-lg text-white text-sm"
                min="0.001"
                step="0.01"
              />
            </div>
            <button
              onClick={() => challengeFighter(challengeAddr as `0x${string}`, wagerAmount)}
              disabled={isChallenging || !challengeAddr || !myFighter?.exists}
              className="w-full py-2 bg-mojo-orange hover:bg-mojo-orange/80 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
            >
              {isChallenging ? "Sending Challenge..." : "Send Challenge"}
            </button>
          </div>

          {/* Accept a challenge */}
          <div className="bg-mojo-card border border-mojo-border rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Accept a Challenge</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Challenge ID</label>
              <input
                type="number"
                value={challengeIdInput}
                onChange={(e) => setChallengeIdInput(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-mojo-dark border border-mojo-border rounded-lg text-white text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => acceptChallenge(BigInt(challengeIdInput), wagerAmount)}
                disabled={isAccepting || !challengeIdInput}
                className="py-2 bg-mojo-green hover:bg-mojo-green/80 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
              >
                {isAccepting ? "Accepting..." : "Accept"}
              </button>
              <button
                onClick={() => resolveBattle(BigInt(challengeIdInput))}
                disabled={isResolving || !challengeIdInput}
                className="py-2 bg-mojo-red hover:bg-mojo-red/80 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
              >
                {isResolving ? "Fighting..." : "Resolve Battle"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Battle visualization */}
      {battleView && (
        <div className="mt-8">
          <BattleArena
            challenger={battleView.challenger}
            defender={battleView.defender}
            winner={battleView.winner}
          />
        </div>
      )}
    </div>
  );
}
