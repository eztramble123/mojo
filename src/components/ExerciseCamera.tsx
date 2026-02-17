"use client";

import { useRef, useEffect, useCallback } from "react";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { Keypoint, ExerciseType } from "@/types";
import { drawSkeleton } from "@/lib/poseUtils";

interface Props {
  exerciseType: ExerciseType;
  onKeypoints: (keypoints: Keypoint[]) => void;
  onStreamReady?: (stream: MediaStream) => void;
  isActive: boolean;
}

export default function ExerciseCamera({ exerciseType, onKeypoints, onStreamReady, isActive }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isLoading, error, keypoints, loadModel, startDetection, stopDetection } = usePoseDetection();

  useEffect(() => {
    if (!isActive) return;
    let stream: MediaStream | null = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          onStreamReady?.(stream);
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }

    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [isActive, onStreamReady]);

  useEffect(() => {
    if (!isActive) return;
    loadModel();
  }, [isActive, loadModel]);

  useEffect(() => {
    if (!isLoading && !error && videoRef.current && isActive) {
      startDetection(videoRef.current);
    }
    return () => stopDetection();
  }, [isLoading, error, isActive, startDetection, stopDetection]);

  useEffect(() => {
    if (keypoints.length > 0) {
      onKeypoints(keypoints);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          drawSkeleton(ctx, keypoints, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  }, [keypoints, onKeypoints]);

  return (
    <div className="relative rounded-glass overflow-hidden bg-wii-ink shadow-glass">
      <video
        ref={videoRef}
        className="w-full h-auto mirror"
        style={{ transform: "scaleX(-1)" }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: "scaleX(-1)" }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-wii-ink/70">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-studio-blue border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-wii-mist text-sm">Loading pose detection...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-wii-ink/70">
          <p className="text-mojo-red text-sm">Error: {error}</p>
        </div>
      )}
    </div>
  );
}
