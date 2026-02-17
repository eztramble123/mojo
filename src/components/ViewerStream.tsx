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
      <div className="glass-card aspect-video flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-studio-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-wii-muted text-sm">Connecting to stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-glass overflow-hidden bg-wii-ink shadow-glass">
      <video
        ref={videoRef}
        className="w-full h-auto"
        playsInline
        autoPlay
      />
      <div className="absolute top-3 left-3 px-2.5 py-1 bg-mojo-red rounded-full text-xs font-bold text-white animate-pulse">
        LIVE
      </div>
    </div>
  );
}
