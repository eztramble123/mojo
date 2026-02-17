"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import ExercisePicker from "@/components/ExercisePicker";
import ExerciseCamera from "@/components/ExerciseCamera";
import RepCounter from "@/components/RepCounter";
import { useExerciseCounter } from "@/hooks/useExerciseCounter";
import { useCreateSession, useResolveSession } from "@/hooks/useSession";
import { useSyncStats, useMyFighter, useCreateFighter } from "@/hooks/useFighter";
import { useBroadcaster } from "@/hooks/useWebRTC";
import { ExerciseType, EXERCISE_LABELS, Keypoint } from "@/types";

type Stage = "pick" | "exercising" | "done";

export default function ExercisePage() {
  const { address, isConnected } = useAccount();
  const [stage, setStage] = useState<Stage>("pick");
  const [exerciseType, setExerciseType] = useState<ExerciseType>(ExerciseType.Pushups);
  const [targetReps, setTargetReps] = useState(10);
  const [sessionId, setSessionId] = useState<bigint | null>(null);

  const { reps, phase, processKeypoints, reset } = useExerciseCounter(exerciseType);
  const { createSession, isPending: isCreating, isSuccess: sessionCreated, hash: createHash } = useCreateSession();
  const { resolveSession, isPending: isResolving, isSuccess: sessionResolved } = useResolveSession();
  const { syncStats } = useSyncStats();
  const { fighter } = useMyFighter();
  const { createFighter } = useCreateFighter();
  const { isStreaming, viewerCount, startBroadcasting, sendRepUpdate, stopBroadcasting } = useBroadcaster(
    sessionId !== null ? sessionId.toString() : null
  );

  const prevReps = useRef(0);

  // Send rep updates to viewers
  useEffect(() => {
    if (reps !== prevReps.current) {
      prevReps.current = reps;
      sendRepUpdate(reps);
    }
  }, [reps, sendRepUpdate]);

  const handleStart = useCallback(
    (type: ExerciseType, target: number) => {
      setExerciseType(type);
      setTargetReps(target);
      reset();

      // For demo: use a mock session ID if not connected
      if (!isConnected) {
        setSessionId(BigInt(Date.now()));
        setStage("exercising");
        return;
      }

      createSession(type, BigInt(target));
    },
    [isConnected, createSession, reset]
  );

  // When session is created on chain, start exercising
  useEffect(() => {
    if (sessionCreated && stage === "pick") {
      // In a real app, we'd parse the session ID from the tx receipt
      setSessionId(BigInt(0));
      setStage("exercising");
    }
  }, [sessionCreated, stage]);

  const handleStreamReady = useCallback(
    (stream: MediaStream) => {
      startBroadcasting(stream);
    },
    [startBroadcasting]
  );

  const handleStop = useCallback(() => {
    stopBroadcasting();
    if (sessionId !== null && isConnected) {
      resolveSession(sessionId, BigInt(reps));
    }
    setStage("done");
  }, [sessionId, reps, isConnected, resolveSession, stopBroadcasting]);

  const handleSyncFighter = useCallback(() => {
    if (sessionId !== null) {
      if (!fighter?.exists) {
        createFighter();
      } else {
        syncStats(sessionId);
      }
    }
  }, [sessionId, fighter, createFighter, syncStats]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-mojo-card border border-mojo-border rounded-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-2">Connect your wallet to start an exercise session on Monad.</p>
          <p className="text-gray-500 text-sm">Or just try the exercise detection below without wallet!</p>
        </div>

        <div className="mt-8">
          {stage === "pick" && <ExercisePicker onStart={handleStart} />}
          {stage === "exercising" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">{EXERCISE_LABELS[exerciseType]} (Demo)</h2>
                <button
                  onClick={handleStop}
                  className="px-4 py-2 bg-mojo-red hover:bg-mojo-red/80 rounded-lg font-medium text-white transition-colors"
                >
                  Stop
                </button>
              </div>
              <ExerciseCamera
                exerciseType={exerciseType}
                onKeypoints={processKeypoints}
                isActive={true}
              />
              <RepCounter reps={reps} target={targetReps} phase={phase} />
            </div>
          )}
          {stage === "done" && (
            <ResultsScreen
              reps={reps}
              targetReps={targetReps}
              exerciseType={exerciseType}
              onRestart={() => { setStage("pick"); reset(); }}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Exercise Session</h1>

      {stage === "pick" && (
        <ExercisePicker onStart={handleStart} disabled={isCreating} />
      )}

      {stage === "exercising" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{EXERCISE_LABELS[exerciseType]}</h2>
              {isStreaming && (
                <p className="text-sm text-mojo-green">{viewerCount} viewer{viewerCount !== 1 ? "s" : ""} watching</p>
              )}
            </div>
            <button
              onClick={handleStop}
              disabled={isResolving}
              className="px-6 py-2 bg-mojo-red hover:bg-mojo-red/80 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
            >
              {isResolving ? "Resolving..." : "Stop & Submit"}
            </button>
          </div>
          <ExerciseCamera
            exerciseType={exerciseType}
            onKeypoints={processKeypoints}
            onStreamReady={handleStreamReady}
            isActive={true}
          />
          <RepCounter reps={reps} target={targetReps} phase={phase} />
        </div>
      )}

      {stage === "done" && (
        <ResultsScreen
          reps={reps}
          targetReps={targetReps}
          exerciseType={exerciseType}
          onRestart={() => { setStage("pick"); reset(); }}
          onSyncFighter={handleSyncFighter}
          showSync={isConnected}
        />
      )}
    </div>
  );
}

function ResultsScreen({
  reps,
  targetReps,
  exerciseType,
  onRestart,
  onSyncFighter,
  showSync,
}: {
  reps: number;
  targetReps: number;
  exerciseType: ExerciseType;
  onRestart: () => void;
  onSyncFighter?: () => void;
  showSync?: boolean;
}) {
  const targetMet = reps >= targetReps;
  const mojoEarned = reps * 10;

  return (
    <div className="bg-mojo-card border border-mojo-border rounded-xl p-8 text-center space-y-6">
      <div className={`text-4xl font-bold ${targetMet ? "text-mojo-green" : "text-mojo-orange"}`}>
        {targetMet ? "Target Met!" : "Session Complete"}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-mojo-dark rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{reps}</div>
          <div className="text-sm text-gray-400">Reps Done</div>
        </div>
        <div className="bg-mojo-dark rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{targetReps}</div>
          <div className="text-sm text-gray-400">Target</div>
        </div>
        <div className="bg-mojo-dark rounded-lg p-4">
          <div className="text-2xl font-bold text-mojo-purple">{mojoEarned}</div>
          <div className="text-sm text-gray-400">MOJO Earned</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={onRestart}
          className="px-6 py-2 bg-mojo-purple hover:bg-mojo-purple/80 rounded-lg font-medium text-white transition-colors"
        >
          New Session
        </button>
        {showSync && onSyncFighter && (
          <button
            onClick={onSyncFighter}
            className="px-6 py-2 bg-mojo-blue hover:bg-mojo-blue/80 rounded-lg font-medium text-white transition-colors"
          >
            Sync to Fighter
          </button>
        )}
      </div>
    </div>
  );
}
