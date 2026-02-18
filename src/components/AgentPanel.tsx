"use client";

import { Fighter } from "@/types";

interface Props {
  address?: string;
  fighter?: Fighter;
}

const INTEGRATIONS = [
  { name: "Apple Health", icon: "\u{2764}\u{FE0F}" },
  { name: "Strava", icon: "\u{1F3C3}" },
  { name: "Garmin", icon: "\u{231A}" },
  { name: "Manual Tracking", icon: "\u{1F4DD}" },
];

export default function AgentPanel({ address, fighter }: Props) {
  return (
    <div className="glass-card p-6 space-y-6 relative overflow-hidden">
      {/* Animated gradient border at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ring-blue via-ring-pink to-ring-orange animate-gradient-x" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ring-blue to-ring-pink flex items-center justify-center text-xl">
          {"\u{1F916}"}
        </div>
        <div>
          <h3 className="text-lg font-bold text-wii-ink">MojoAgent</h3>
          <p className="text-xs text-wii-muted">Your AI-powered training partner</p>
        </div>
        <span className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-ring-pink/10 text-ring-pink border border-ring-pink/30">
          Coming Soon
        </span>
      </div>

      {/* Agent Identity Card */}
      <div className="bg-wii-mist/50 border border-wii-glass rounded-xl p-4 opacity-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-wii-muted uppercase tracking-wide">Agent Identity</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-wii-mist text-wii-muted border border-wii-glass">
            Dormant
          </span>
        </div>
        {fighter?.exists ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm font-bold text-wii-ink">{fighter.strength.toString()}</div>
              <div className="text-[10px] text-wii-muted">STR</div>
            </div>
            <div>
              <div className="text-sm font-bold text-wii-ink">{fighter.agility.toString()}</div>
              <div className="text-[10px] text-wii-muted">AGI</div>
            </div>
            <div>
              <div className="text-sm font-bold text-wii-ink">{fighter.endurance.toString()}</div>
              <div className="text-[10px] text-wii-muted">END</div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-wii-muted text-center">No fighter data linked</p>
        )}
        {address && (
          <p className="text-[10px] text-wii-muted mt-2 font-mono truncate">{address}</p>
        )}
      </div>

      {/* Integration Grid */}
      <div>
        <h4 className="text-sm font-semibold text-wii-ink mb-3">Data Integrations</h4>
        <div className="grid grid-cols-2 gap-3">
          {INTEGRATIONS.map((integration) => (
            <div
              key={integration.name}
              className="relative bg-wii-mist/50 border border-wii-glass rounded-xl p-4 text-center opacity-50 grayscale pointer-events-none"
            >
              {/* Lock overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-6 h-6 rounded-full bg-wii-glass/80 flex items-center justify-center text-xs">
                  {"\u{1F512}"}
                </div>
              </div>
              <div className="text-2xl mb-1">{integration.icon}</div>
              <div className="text-xs font-medium text-wii-muted">{integration.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Battle */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-wii-ink">Agent Battle Mode</h4>
        <p className="text-xs text-wii-muted">
          Let your MojoAgent compete autonomously using your fitness data and on-chain fighter stats.
        </p>
        <button
          disabled
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-ring-blue to-ring-pink opacity-50 pointer-events-none flex items-center justify-center gap-2"
        >
          <span>{"\u{1F512}"}</span>
          Activate Agent
        </button>
      </div>

      {/* Season 2 banner */}
      <div className="relative rounded-xl p-4 text-center overflow-hidden">
        <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-ring-blue via-ring-pink to-ring-orange bg-clip-border animate-gradient-x" style={{ padding: "2px" }}>
          <div className="w-full h-full rounded-[10px] bg-white" />
        </div>
        <div className="relative">
          <p className="text-sm font-bold text-transparent bg-gradient-to-r from-ring-blue via-ring-pink to-ring-orange bg-clip-text">
            Coming in Season 2
          </p>
          <p className="text-xs text-wii-muted mt-1">
            AI agents that train, compete, and evolve on-chain
          </p>
        </div>
      </div>

      {/* CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
