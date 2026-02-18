"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog } from "viem";
import { mojoSessionConfig } from "@/lib/contracts";
import { Session } from "@/types";

export function useSession(sessionId?: bigint) {
  const { data: session, refetch } = useReadContract({
    ...mojoSessionConfig,
    functionName: "getSession",
    args: sessionId !== undefined ? [sessionId] : undefined,
    query: { enabled: sessionId !== undefined },
  });

  const { data: nextSessionId } = useReadContract({
    ...mojoSessionConfig,
    functionName: "nextSessionId",
  });

  return {
    session: session as Session | undefined,
    nextSessionId: nextSessionId as bigint | undefined,
    refetch,
  };
}

export function useCreateSession() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

  // Extract sessionId from SessionCreated event in transaction receipt
  let sessionId: bigint | undefined;
  if (receipt?.logs) {
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: mojoSessionConfig.abi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "SessionCreated") {
          sessionId = (decoded.args as unknown as { sessionId: bigint }).sessionId;
          break;
        }
      } catch {
        // Not our event, skip
      }
    }
  }

  const createSession = (exerciseType: number, targetReps: bigint) => {
    writeContract({
      ...mojoSessionConfig,
      functionName: "createSession",
      args: [exerciseType, targetReps],
    });
  };

  return { createSession, isPending, isConfirming, isSuccess, hash, sessionId };
}

export function useResolveSession() {
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const resolveSession = (sessionId: bigint, actualReps: bigint) => {
    writeContract({
      ...mojoSessionConfig,
      functionName: "resolveSession",
      args: [sessionId, actualReps],
    });
  };

  return { resolveSession, isPending, isConfirming, isSuccess, hash };
}
