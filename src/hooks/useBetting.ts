"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther } from "viem";
import { mojoSessionConfig } from "@/lib/contracts";

export function usePlaceBet() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const placeBet = (sessionId: bigint, isUp: boolean, amountEth: string) => {
    writeContract({
      ...mojoSessionConfig,
      functionName: "placeBet",
      args: [sessionId, isUp],
      value: parseEther(amountEth),
    });
  };

  return { placeBet, isPending, isConfirming, isSuccess, hash };
}

export function useClaimBet() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimBet = (sessionId: bigint) => {
    writeContract({
      ...mojoSessionConfig,
      functionName: "claimBet",
      args: [sessionId],
    });
  };

  return { claimBet, isPending, isConfirming, isSuccess, hash };
}

export function useBetInfo(sessionId: bigint | undefined, address: `0x${string}` | undefined) {
  const { data: bet } = useReadContract({
    ...mojoSessionConfig,
    functionName: "bets",
    args: sessionId !== undefined && address ? [sessionId, address] : undefined,
    query: { enabled: sessionId !== undefined && !!address },
  });

  return {
    bet: bet as [bigint, boolean, boolean] | undefined,
  };
}
