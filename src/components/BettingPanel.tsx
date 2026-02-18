"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { usePlaceBet, useClaimBet, useBetInfo } from "@/hooks/useBetting";
import { Session, SessionStatus } from "@/types";
import { clsx } from "clsx";

interface Props {
  sessionId: bigint;
  session: Session;
  onBetPlaced?: (amount: string, isUp: boolean) => void;
}

export default function BettingPanel({ sessionId, session, onBetPlaced }: Props) {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState("0.01");
  const { placeBet, isPending: isBetting } = usePlaceBet();
  const { claimBet, isPending: isClaiming } = useClaimBet();
  const { bet } = useBetInfo(sessionId, address);

  const hasBet = bet && bet[0] > 0n;
  const totalPool = session.totalUpBets + session.totalDownBets;
  const isResolved = session.status === SessionStatus.Resolved;
  const targetMet = session.actualReps >= session.targetReps;

  const handleBet = (isUp: boolean) => {
    placeBet(sessionId, isUp, betAmount);
    onBetPlaced?.(betAmount, isUp);
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <h3 className="text-lg font-semibold text-wii-ink">Betting Pool</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-mojo-green/8 border border-mojo-green/20 rounded-xl p-3 text-center">
          <div className="text-xs text-mojo-green mb-1 font-medium uppercase tracking-wide">Makes it</div>
          <div className="text-lg font-bold text-wii-ink">{formatEther(session.totalUpBets)} MON</div>
        </div>
        <div className="bg-mojo-red/8 border border-mojo-red/20 rounded-xl p-3 text-center">
          <div className="text-xs text-mojo-red mb-1 font-medium uppercase tracking-wide">Misses</div>
          <div className="text-lg font-bold text-wii-ink">{formatEther(session.totalDownBets)} MON</div>
        </div>
      </div>

      <div className="text-center text-sm text-wii-muted">
        Total Pool: <span className="text-wii-ink font-semibold">{formatEther(totalPool)} MON</span>
      </div>

      {!hasBet && session.status === SessionStatus.Active && address && (
        <>
          <div>
            <label className="block text-xs text-wii-muted mb-1 font-medium uppercase tracking-wide">Bet Amount (MON)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full px-3 py-2 bg-wii-mist border border-wii-glass rounded-xl text-wii-ink text-sm focus:outline-none focus:border-studio-blue transition-colors"
              min="0.001"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleBet(true)}
              disabled={isBetting}
              className="py-2.5 bg-mojo-green hover:bg-mojo-green/90 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isBetting ? "..." : "Bet They Make It"}
            </button>
            <button
              onClick={() => handleBet(false)}
              disabled={isBetting}
              className="py-2.5 bg-mojo-red hover:bg-mojo-red/90 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isBetting ? "..." : "Bet They Miss"}
            </button>
          </div>
        </>
      )}

      {hasBet && (
        <div className="text-center text-sm">
          <span className="text-wii-muted">Your bet: </span>
          <span className={clsx("font-semibold", bet![1] ? "text-mojo-green" : "text-mojo-red")}>
            {formatEther(bet![0])} MON {bet![1] ? "UP" : "DOWN"}
          </span>
        </div>
      )}

      {isResolved && hasBet && !bet![2] && (
        <button
          onClick={() => claimBet(sessionId)}
          disabled={isClaiming}
          className="w-full py-2.5 bg-ring-orange hover:bg-ring-orange/90 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isClaiming ? "Claiming..." : "Claim Winnings"}
        </button>
      )}

      {isResolved && (
        <div className="text-center text-sm">
          <span className={clsx("font-bold", targetMet ? "text-mojo-green" : "text-mojo-red")}>
            {targetMet ? "TARGET MET!" : "TARGET MISSED"} ({session.actualReps.toString()} reps)
          </span>
        </div>
      )}
    </div>
  );
}
