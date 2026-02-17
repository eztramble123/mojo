"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Keypoint } from "@/types";

export function usePoseDetection() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const detectorRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const loadModel = useCallback(async () => {
    try {
      setIsLoading(true);
      // Dynamic imports to avoid SSR issues
      const tf = await import("@tensorflow/tfjs-core");
      await import("@tensorflow/tfjs-backend-webgl");
      await tf.setBackend("webgl");
      await tf.ready();

      const poseDetection = await import("@tensorflow-models/pose-detection");
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        }
      );
      detectorRef.current = detector;
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load model");
      setIsLoading(false);
    }
  }, []);

  const detectPose = useCallback(async (video: HTMLVideoElement) => {
    if (!detectorRef.current || !video || video.readyState < 2) return;

    try {
      const poses = await detectorRef.current.estimatePoses(video);
      if (poses.length > 0 && poses[0].keypoints) {
        setKeypoints(poses[0].keypoints as Keypoint[]);
      }
    } catch {
      // Skip frame on error
    }
  }, []);

  const startDetection = useCallback(
    (video: HTMLVideoElement) => {
      isRunningRef.current = true;
      const loop = async () => {
        if (!isRunningRef.current) return;
        await detectPose(video);
        animFrameRef.current = requestAnimationFrame(loop);
      };
      loop();
    },
    [detectPose]
  );

  const stopDetection = useCallback(() => {
    isRunningRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    isLoading,
    error,
    keypoints,
    loadModel,
    startDetection,
    stopDetection,
  };
}
