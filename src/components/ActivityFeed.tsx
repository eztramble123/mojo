"use client";

import { useRef, useEffect } from "react";

export interface ActivityEvent {
  id: string;
  type: "reaction" | "betPlaced" | "viewerJoined" | "milestone";
  message: string;
  timestamp: number;
}

interface Props {
  events: ActivityEvent[];
  onReaction: (emoji: string) => void;
}

const TYPE_COLORS: Record<ActivityEvent["type"], string> = {
  reaction: "bg-ring-orange",
  betPlaced: "bg-studio-blue",
  viewerJoined: "bg-mojo-green",
  milestone: "bg-ring-pink",
};

const REACTION_EMOJIS = ["\u{1F525}", "\u{1F4AA}", "\u{1F44F}", "\u{1F624}"];

export default function ActivityFeed({ events, onReaction }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events.length]);

  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="text-sm font-semibold text-wii-ink">Live Activity</h3>

      <div ref={scrollRef} className="max-h-64 overflow-y-auto space-y-1.5 scrollbar-thin">
        {events.length === 0 && (
          <p className="text-xs text-wii-muted text-center py-4">No activity yet...</p>
        )}
        {events.map((event) => (
          <div key={event.id} className="flex items-center gap-2 text-xs">
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${TYPE_COLORS[event.type]}`} />
            <span className="text-wii-muted">{event.message}</span>
          </div>
        ))}
      </div>

      {/* Reaction bar */}
      <div className="flex items-center gap-2 pt-2 border-t border-wii-glass">
        <span className="text-xs text-wii-muted">React:</span>
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReaction(emoji)}
            className="text-lg hover:scale-125 active:scale-90 transition-transform"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
