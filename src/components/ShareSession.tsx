"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  sessionId: string;
}

export default function ShareSession({ sessionId }: Props) {
  const [copied, setCopied] = useState(false);
  const watchUrl = typeof window !== "undefined"
    ? `${window.location.origin}/watch/${sessionId}`
    : `/watch/${sessionId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(watchUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-4">
        <div className="bg-white p-2 rounded-lg shrink-0">
          <QRCodeSVG value={watchUrl} size={96} level="M" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-wii-ink mb-1">Share this session</p>
          <p className="text-xs text-wii-muted mb-3 truncate">{watchUrl}</p>
          <button
            onClick={handleCopy}
            className="px-4 py-1.5 bg-studio-blue/10 hover:bg-studio-blue/20 text-studio-blue border border-studio-blue/20 rounded-lg text-xs font-medium transition-colors"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
