"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { mojoFighterConfig, mojoSessionConfig } from "@/lib/contracts";
import { Fighter, Challenge } from "@/types";

export function useFighter(address?: `0x${string}`) {
  const { data: fighter, refetch } = useReadContract({
    ...mojoFighterConfig,
    functionName: "getFighter",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    fighter: fighter as Fighter | undefined,
    refetch,
  };
}

export function useMyFighter() {
  const { address } = useAccount();
  return useFighter(address);
}

export function useCreateFighter() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createFighter = () => {
    writeContract({
      ...mojoFighterConfig,
      functionName: "createFighter",
    });
  };

  return { createFighter, isPending, isConfirming, isSuccess, hash };
}

export function useSyncStats() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const syncStats = (sessionId: bigint) => {
    writeContract({
      ...mojoFighterConfig,
      functionName: "syncStats",
      args: [sessionId],
    });
  };

  return { syncStats, isPending, isConfirming, isSuccess, hash };
}

export function useChallenge() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const challengeFighter = (opponent: `0x${string}`, wagerEth: string) => {
    writeContract({
      ...mojoFighterConfig,
      functionName: "challenge",
      args: [opponent],
      value: parseEther(wagerEth),
    });
  };

  return { challengeFighter, isPending, isConfirming, isSuccess, hash };
}

export function useAcceptChallenge() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const acceptChallenge = (challengeId: bigint, wagerEth: string) => {
    writeContract({
      ...mojoFighterConfig,
      functionName: "acceptChallenge",
      args: [challengeId],
      value: parseEther(wagerEth),
    });
  };

  return { acceptChallenge, isPending, isConfirming, isSuccess, hash };
}

export function useResolveBattle() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const resolveBattle = (challengeId: bigint) => {
    writeContract({
      ...mojoFighterConfig,
      functionName: "resolveBattle",
      args: [challengeId],
    });
  };

  return { resolveBattle, isPending, isConfirming, isSuccess, hash };
}

export function useChallengeInfo(challengeId?: bigint) {
  const { data: challenge, refetch } = useReadContract({
    ...mojoFighterConfig,
    functionName: "getChallenge",
    args: challengeId !== undefined ? [challengeId] : undefined,
    query: { enabled: challengeId !== undefined },
  });

  return {
    challenge: challenge as Challenge | undefined,
    refetch,
  };
}
