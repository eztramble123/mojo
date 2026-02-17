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
}

export default function BettingPanel({ sessionId, session }: Props) {
  const { address } = useAccount();
  const [betAmount, setBetAmount] = useState("0.01");
  const { placeBet, isPending: isBetting } = usePlaceBet();
  const { claimBet, isPending: isClaiming } = useClaimBet();
  const { bet } = useBetInfo(sessionId, address);

  const hasBet = bet && bet[0] > 0n;
  const totalPool = session.totalUpBets + session.totalDownBets;
  const isResolved = session.status === SessionStatus.Resolved;
  const targetMet = session.actualReps >= session.targetReps;

  return (
    <div className="bg-mojo-card border border-mojo-border rounded-xl p-5 space-y-4">
      <h3 className="text-lg font-bold text-white">Betting Pool</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-mojo-green/10 border border-mojo-green/30 rounded-lg p-3 text-center">
          <div className="text-xs text-mojo-green mb-1">MAKES IT</div>
          <div className="text-lg font-bold text-white">{formatEther(session.totalUpBets)} MON</div>
        </div>
        <div className="bg-mojo-red/10 border border-mojo-red/30 rounded-lg p-3 text-center">
          <div className="text-xs text-mojo-red mb-1">MISSES</div>
          <div className="text-lg font-bold text-white">{formatEther(session.totalDownBets)} MON</div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-400">
        Total Pool: <span className="text-white font-medium">{formatEther(totalPool)} MON</span>
      </div>

      {!hasBet && session.status === SessionStatus.Active && address && (
        <>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bet Amount (MON)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full px-3 py-2 bg-mojo-dark border border-mojo-border rounded-lg text-white text-sm"
              min="0.001"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => placeBet(sessionId, true, betAmount)}
              disabled={isBetting}
              className="py-2 bg-mojo-green hover:bg-mojo-green/80 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isBetting ? "..." : "Bet They Make It"}
            </button>
            <button
              onClick={() => placeBet(sessionId, false, betAmount)}
              disabled={isBetting}
              className="py-2 bg-mojo-red hover:bg-mojo-red/80 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isBetting ? "..." : "Bet They Miss"}
            </button>
          </div>
        </>
      )}

      {hasBet && (
        <div className="text-center text-sm">
          <span className="text-gray-400">Your bet: </span>
          <span className={clsx("font-medium", bet![1] ? "text-mojo-green" : "text-mojo-red")}>
            {formatEther(bet![0])} MON {bet![1] ? "UP" : "DOWN"}
          </span>
        </div>
      )}

      {isResolved && hasBet && !bet![2] && (
        <button
          onClick={() => claimBet(sessionId)}
          disabled={isClaiming}
          className="w-full py-2 bg-mojo-orange hover:bg-mojo-orange/80 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
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
