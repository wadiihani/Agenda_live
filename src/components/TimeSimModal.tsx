import React from 'react';
import { X, Zap, Check, AlertTriangle } from 'lucide-react';
import { useTimeSim } from '../context/TimeSimContext';
import { useAgenda } from '../context/AgendaContext';

export const TimeSimModal: React.FC = () => {
  const { simulatedTime, setSimulatedTime, isSimModalOpen, setIsSimModalOpen } = useTimeSim();
  const { delayMinutes, setDelayMinutes } = useAgenda();

  if (!isSimModalOpen) return null;

  const presets = [
    {
      label: 'Live Real-Time Clock (Africa/Casablanca)',
      sub: 'State 1: PRE_CONFERENCE · Live countdown to Oct 16 Assembling',
      value: null,
      day: 0
    },
    {
      label: 'Day 1: Fri Oct 16 · 17:30 (Opening)',
      sub: 'State 2: IN_SESSION · Live: "Opening – Avengers, Assemble"',
      value: '2026-10-16T17:30:00',
      day: 1
    },
    {
      label: 'Day 1: Fri Oct 16 · 19:25 (Break Window)',
      sub: 'State 3: IN_BREAK · Live MM:SS Countdown: "Break – Bifrost Recharge"',
      value: '2026-10-16T19:25:00',
      day: 1
    },
    {
      label: 'Day 1: Fri Oct 16 · 23:55 (Day 1 Complete)',
      sub: 'State 4: END_OF_DAY · Wrap-up card, tomorrow preview & debrief',
      value: '2026-10-16T23:55:00',
      day: 1
    },
    {
      label: 'Day 2: Sat Oct 17 · 11:45 (Parallel Tracks)',
      sub: 'State 2: IN_SESSION · "Synergy" (Newbies) vs "Power of Pitch" (iGV)',
      value: '2026-10-17T11:45:00',
      day: 2
    },
    {
      label: 'Day 2: Sat Oct 17 · 21:15 (Gala Night)',
      sub: 'State 2: IN_SESSION · "Avengers Night – The Asgardian Gala"',
      value: '2026-10-17T21:15:00',
      day: 2
    },
    {
      label: 'Day 3: Sun Oct 18 · 10:15 (Endgame)',
      sub: 'State 2: IN_SESSION · "Emotional Intelligence – Black Widow Protocol"',
      value: '2026-10-18T10:15:00',
      day: 3
    },
    {
      label: 'Day 3: Sun Oct 18 · 18:00 (Post-Conference)',
      sub: 'State 4: POST_EVENT · Mission Accomplished & Photo Vault Open',
      value: '2026-10-18T18:00:00',
      day: 4
    },
  ];

  const getDayDot = (day: number) => {
    switch (day) {
      case 1:
        return 'bg-stark-red';
      case 2:
        return 'bg-infinity-purple';
      case 3:
        return 'bg-endgame-gold';
      default:
        return 'bg-arc-blue';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="w-full max-w-lg rounded-2xl glass-card border border-white/10 p-4 sm:p-5 shadow-2xl relative bg-[#080B12]/95 text-off-white max-h-[92vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between gap-2 mb-2 font-label">
          <div className="flex items-center gap-2 font-bold text-base text-off-white">
            <Zap className="w-4 h-4 text-endgame-gold" />
            <span>Time Machine & Delay Simulator</span>
          </div>

          <button
            onClick={() => setIsSimModalOpen(false)}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-text hover:text-off-white transition-colors"
            aria-label="Close Time Simulator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-text mb-3 leading-relaxed">
          Simulate Africa/Casablanca conference milestones to immediately test the 4-state Command Center, inline timeline highlights, and delay offsets:
        </p>

        {/* Global Delay Offset Simulator (Requirement 2) */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/8 mb-3 font-label">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Schedule Delay Offset:</span>
            </span>
            <span className="font-mono font-bold text-xs text-endgame-gold">
              {delayMinutes > 0 ? `+${delayMinutes} mins delay` : 'On Time (0 mins)'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-xs">
            {[0, 10, 15, 30].map((mins) => {
              const isActive = delayMinutes === mins;
              return (
                <button
                  key={mins}
                  onClick={() => setDelayMinutes(mins)}
                  className={`py-1.5 rounded-lg border font-mono font-bold transition-all active:scale-95 ${
                    isActive
                      ? 'bg-amber-500/25 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                      : 'bg-white/5 border-white/10 text-muted-text hover:text-off-white hover:bg-white/10'
                  }`}
                >
                  {mins === 0 ? 'On Time' : `+${mins}m`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Presets */}
        <div className="space-y-1.5 font-label">
          {presets.map((preset, idx) => {
            const isSelected = simulatedTime === preset.value;

            return (
              <button
                key={idx}
                onClick={() => {
                  setSimulatedTime(preset.value);
                  setIsSimModalOpen(false);
                }}
                className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${
                  isSelected
                    ? 'bg-gradient-to-r from-stark-red/20 via-infinity-purple/20 to-endgame-gold/20 border-endgame-gold/60 shadow-glow-combo text-off-white'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04] text-muted-text hover:text-off-white'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getDayDot(preset.day)}`} />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-off-white truncate font-sans">
                      {preset.label}
                    </div>
                    <div className="text-[11px] text-muted-text truncate mt-0.5">
                      {preset.sub}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-endgame-gold flex items-center justify-center text-midnight font-bold shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimeSimModal;
