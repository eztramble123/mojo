"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { ActivityEvent } from "@/components/ActivityFeed";

export type DataMessage =
  | { type: "repUpdate"; reps: number }
  | { type: "reaction"; emoji: string; from: string }
  | { type: "betPlaced"; bettor: string; amount: string; isUp: boolean }
  | { type: "viewerJoined"; address: string };

function getPeerConfig(): { host: string; port: number; path: string; secure: boolean } | undefined {
  const url = process.env.NEXT_PUBLIC_PEER_SERVER_URL;
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? Number(parsed.port) : parsed.protocol === "https:" ? 443 : 80,
      path: parsed.pathname === "/" ? "/myapp" : parsed.pathname,
      secure: parsed.protocol === "https:",
    };
  } catch {
    return undefined;
  }
}

export function useBroadcaster(sessionId: string | null) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dataConnsRef = useRef<any[]>([]);

  const sendActivity = useCallback((msg: DataMessage) => {
    for (const conn of dataConnsRef.current) {
      try {
        conn.send(msg);
      } catch {
        // Connection may have closed
      }
    }
  }, []);

  const startBroadcasting = useCallback(
    async (stream: MediaStream) => {
      if (!sessionId) return;
      streamRef.current = stream;

      const { default: Peer } = await import("peerjs");
      const peerOpts = getPeerConfig();
      const peer = new Peer(`mojo-session-${sessionId}`, peerOpts ?? {});
      peerRef.current = peer;

      peer.on("open", () => {
        setIsStreaming(true);
      });

      peer.on("call", (call: any) => {
        call.answer(stream);
        setViewerCount((c) => c + 1);
        call.on("close", () => setViewerCount((c) => Math.max(0, c - 1)));
      });

      peer.on("connection", (conn: any) => {
        dataConnsRef.current.push(conn);

        conn.on("open", () => {
          // Relay viewerJoined to all existing connections
          const joinMsg: DataMessage = { type: "viewerJoined", address: "anonymous" };
          for (const c of dataConnsRef.current) {
            try {
              c.send(joinMsg);
            } catch {
              // ignore
            }
          }
        });

        conn.on("close", () => {
          dataConnsRef.current = dataConnsRef.current.filter((c) => c !== conn);
        });
      });
    },
    [sessionId]
  );

  const sendRepUpdate = useCallback((reps: number) => {
    for (const conn of dataConnsRef.current) {
      try {
        conn.send({ type: "repUpdate", reps });
      } catch {
        // Connection may have closed
      }
    }
  }, []);

  const stopBroadcasting = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    dataConnsRef.current = [];
    setIsStreaming(false);
    setViewerCount(0);
  }, []);

  useEffect(() => {
    return () => {
      stopBroadcasting();
    };
  }, [stopBroadcasting]);

  return { isStreaming, viewerCount, startBroadcasting, sendRepUpdate, sendActivity, stopBroadcasting };
}

let eventIdCounter = 0;
function makeEventId() {
  return `evt-${Date.now()}-${++eventIdCounter}`;
}

export function useViewer(sessionId: string | null) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [liveReps, setLiveReps] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const peerRef = useRef<any>(null);
  const dataConnRef = useRef<any>(null);

  const addActivity = useCallback((type: ActivityEvent["type"], message: string) => {
    setActivityFeed((prev) => {
      const next = [...prev, { id: makeEventId(), type, message, timestamp: Date.now() }];
      return next.slice(-50);
    });
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    if (dataConnRef.current) {
      try {
        const msg: DataMessage = { type: "reaction", emoji, from: "you" };
        dataConnRef.current.send(msg);
      } catch {
        // ignore
      }
    }
    addActivity("reaction", `You reacted ${emoji}`);
  }, [addActivity]);

  const connect = useCallback(async () => {
    if (!sessionId) return;

    const { default: Peer } = await import("peerjs");
    const peerOpts = getPeerConfig();
    const peer = new Peer(peerOpts ?? {});
    peerRef.current = peer;

    peer.on("open", () => {
      // Request video stream
      const call = peer.call(`mojo-session-${sessionId}`, new MediaStream());
      call.on("stream", (stream: MediaStream) => {
        setRemoteStream(stream);
        setIsConnected(true);
      });

      // Data channel for rep updates + activity
      const conn = peer.connect(`mojo-session-${sessionId}`);
      dataConnRef.current = conn;

      conn.on("data", (data: any) => {
        if (!data || !data.type) return;

        switch (data.type) {
          case "repUpdate":
            setLiveReps(data.reps);
            break;
          case "reaction":
            addActivity("reaction", `${data.from} reacted ${data.emoji}`);
            break;
          case "betPlaced":
            addActivity("betPlaced", `${data.bettor.slice(0, 6)}... bet ${data.amount} MON ${data.isUp ? "UP" : "DOWN"}`);
            break;
          case "viewerJoined":
            addActivity("viewerJoined", "A new viewer joined!");
            break;
        }
      });
    });
  }, [sessionId, addActivity]);

  const disconnect = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    dataConnRef.current = null;
    setRemoteStream(null);
    setIsConnected(false);
    setLiveReps(0);
    setActivityFeed([]);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { remoteStream, liveReps, isConnected, activityFeed, connect, disconnect, sendReaction, addActivity };
}
