"use client";

import { useState, useEffect } from "react";
import { Fighter } from "@/types";
import { BattleResult, simulateBattle } from "@/lib/battleSim";
import FighterCard from "./FighterCard";

interface Props {
  challenger: { address: string; fighter: Fighter };
  defender: { address: string; fighter: Fighter };
  winner: string;
  onComplete?: () => void;
}

export default function BattleArena({ challenger, defender, winner, onComplete }: Props) {
  const [currentRound, setCurrentRound] = useState(0);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const winSide = winner.toLowerCase() === challenger.address.toLowerCase() ? "challenger" : "defender";
    const sim = simulateBattle(challenger.fighter, defender.fighter, winSide);
    setResult(sim);

    let round = 0;
    const interval = setInterval(() => {
      round++;
      setCurrentRound(round);
      if (round >= sim.rounds.length) {
        clearInterval(interval);
        setTimeout(() => {
          setShowResult(true);
          onComplete?.();
        }, 1000);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [challenger, defender, winner, onComplete]);

  return (
    <div className="glass-card p-6">
      <h3 className="text-xl font-semibold text-wii-ink text-center mb-6">BATTLE!</h3>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className={showResult && winner.toLowerCase() === challenger.address.toLowerCase() ? "ring-2 ring-mojo-green rounded-glass" : ""}>
          <FighterCard address={challenger.address} fighter={challenger.fighter} />
        </div>
        <div className={showResult && winner.toLowerCase() === defender.address.toLowerCase() ? "ring-2 ring-mojo-green rounded-glass" : ""}>
          <FighterCard address={defender.address} fighter={defender.fighter} />
        </div>
      </div>

      {result && (
        <div className="space-y-2 mb-4">
          {result.rounds.slice(0, currentRound).map((round, i) => (
            <div key={i} className="bg-wii-mist rounded-xl p-3 text-sm text-wii-muted animate-slide-up">
              <span className="text-ring-orange font-medium">Round {i + 1}:</span> {round.description}
            </div>
          ))}
        </div>
      )}

      {showResult && (
        <div className="text-center py-4 bg-mojo-green/10 border border-mojo-green/20 rounded-xl animate-slide-up">
          <div className="text-2xl font-bold text-mojo-green mb-1">WINNER!</div>
          <div className="text-wii-ink font-medium">
            {winner.slice(0, 6)}...{winner.slice(-4)}
          </div>
        </div>
      )}
    </div>
  );
}
