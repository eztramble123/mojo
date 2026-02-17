"use client";

import { useRef, useState, useCallback, useEffect } from "react";

export function useBroadcaster(sessionId: string | null) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const peerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dataConnsRef = useRef<any[]>([]);

  const startBroadcasting = useCallback(
    async (stream: MediaStream) => {
      if (!sessionId) return;
      streamRef.current = stream;

      const { default: Peer } = await import("peerjs");
      const peer = new Peer(`mojo-session-${sessionId}`);
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

  return { isStreaming, viewerCount, startBroadcasting, sendRepUpdate, stopBroadcasting };
}

export function useViewer(sessionId: string | null) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [liveReps, setLiveReps] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef<any>(null);

  const connect = useCallback(async () => {
    if (!sessionId) return;

    const { default: Peer } = await import("peerjs");
    const peer = new Peer();
    peerRef.current = peer;

    peer.on("open", () => {
      // Request video stream
      const call = peer.call(`mojo-session-${sessionId}`, new MediaStream());
      call.on("stream", (stream: MediaStream) => {
        setRemoteStream(stream);
        setIsConnected(true);
      });

      // Data channel for rep updates
      const conn = peer.connect(`mojo-session-${sessionId}`);
      conn.on("data", (data: any) => {
        if (data && data.type === "repUpdate") {
          setLiveReps(data.reps);
        }
      });
    });
  }, [sessionId]);

  const disconnect = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    setRemoteStream(null);
    setIsConnected(false);
    setLiveReps(0);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { remoteStream, liveReps, isConnected, connect, disconnect };
}
