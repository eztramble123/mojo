"use client";

import { useRef, useEffect } from "react";

interface Props {
  stream: MediaStream | null;
  isConnected: boolean;
}

export default function ViewerStream({ stream, isConnected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  if (!isConnected) {
    return (
      <div className="bg-mojo-card border border-mojo-border rounded-xl aspect-video flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-mojo-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Connecting to stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="w-full h-auto"
        playsInline
        autoPlay
      />
      <div className="absolute top-3 left-3 px-2 py-1 bg-mojo-red rounded text-xs font-bold text-white animate-pulse">
        LIVE
      </div>
    </div>
  );
}
