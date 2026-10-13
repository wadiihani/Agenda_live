import React from 'react';
import { Shield } from 'lucide-react';
import { RosterGrid } from '../components/RosterGrid';

export const TeamPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl glass-card p-6 border border-white/10 relative overflow-hidden">
        {/* Arc Reactor Blue / Stark Red / Infinity Purple glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-arc-blue/25 via-infinity-purple/20 to-stark-red/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-muted-text mb-3 font-label">
          <Shield className="w-3.5 h-3.5 text-arc-blue" />
          <span className="tracking-wider uppercase">DELIVERY EXPERIENCE · S.H.I.E.L.D. COMMAND</span>
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-wide text-off-white">
          THE S.H.I.E.L.D. COMMAND
        </h2>

        <p className="text-xs sm:text-sm text-muted-text mt-1.5 max-w-lg leading-relaxed">
          The plenary directors, tactical session facilitators, tower commanders, and operations crew guiding every phase of our three-day mission across the Road to Endgame.
        </p>
      </div>

      {/* Roster Grid with Category Filters */}
      <RosterGrid />
    </div>
  );
};
