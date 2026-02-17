import { Fighter } from "@/types";

export interface BattleResult {
  winner: "challenger" | "defender";
  challengerPower: number;
  defenderPower: number;
  rounds: BattleRound[];
}

export interface BattleRound {
  attackerHit: number;
  defenderHit: number;
  description: string;
}

/**
 * Client-side battle simulation for visualization purposes.
 * The actual outcome is determined on-chain, this is just for show.
 */
export function simulateBattle(
  challenger: Fighter,
  defender: Fighter,
  winner: "challenger" | "defender"
): BattleResult {
  const rounds: BattleRound[] = [];
  const totalRounds = 5;

  const cStats = {
    str: Number(challenger.strength),
    agi: Number(challenger.agility),
    end: Number(challenger.endurance),
  };

  const dStats = {
    str: Number(defender.strength),
    agi: Number(defender.agility),
    end: Number(defender.endurance),
  };

  let challengerScore = 0;
  let defenderScore = 0;

  for (let i = 0; i < totalRounds; i++) {
    const atkHit = Math.floor(Math.random() * (cStats.str + 1)) + cStats.agi;
    const defHit = Math.floor(Math.random() * (dStats.str + 1)) + dStats.agi;

    challengerScore += atkHit;
    defenderScore += defHit;

    const descriptions = [
      `A powerful strike lands for ${atkHit} damage!`,
      `Quick footwork leads to a ${defHit} counter!`,
      `An endurance test - both fighters hold strong!`,
      `A fierce exchange of blows!`,
      `The crowd roars as fighters clash!`,
    ];

    rounds.push({
      attackerHit: atkHit,
      defenderHit: defHit,
      description: descriptions[i % descriptions.length],
    });
  }

  return {
    winner,
    challengerPower: challengerScore,
    defenderPower: defenderScore,
    rounds,
  };
}
