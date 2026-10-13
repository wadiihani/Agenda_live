import React from 'react';
import { X, Zap, Check } from 'lucide-react';
import { useTimeSim } from '../context/TimeSimContext';

export const TimeSimModal: React.FC = () => {
  const { simulatedTime, setSimulatedTime, isSimModalOpen, setIsSimModalOpen } = useTimeSim();

  if (!isSimModalOpen) return null;

  const presets = [
    {
      label: 'Live Real-Time Clock',
      sub: 'Real Africa/Casablanca clock (Countdown to Oct 16)',
      value: null,
      day: 0
    },
    {
      label: 'Day 1: Fri Oct 16 · 19:40',
      sub: 'Civil War · Live: "The Broken Shield"',
      value: '2026-10-16T19:40:00',
      day: 1
    },
    {
      label: 'Day 2: Sat Oct 17 · 11:45',
      sub: 'Infinity War · Live: "The Avengers Tower"',
      value: '2026-10-17T11:45:00',
      day: 2
    },
    {
      label: 'Day 2: Sat Oct 17 · 21:15',
      sub: 'Infinity War · Live: "Gala Night"',
      value: '2026-10-17T21:15:00',
      day: 2
    },
    {
      label: 'Day 3: Sun Oct 18 · 12:00',
      sub: 'Endgame · Live: "Black Widow Protocol"',
      value: '2026-10-18T12:00:00',
      day: 3
    },
    {
      label: 'Post-Conference: Mon Oct 19',
      sub: 'State: "Mission Accomplished — That\'s a wrap"',
      value: '2026-10-19T09:00:00',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="w-full max-w-md rounded-2xl glass-card border border-white/10 p-5 sm:p-6 shadow-2xl relative bg-[#080B12]/95">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-off-white font-bold text-base font-label">
            <Zap className="w-4 h-4 text-endgame-gold" />
            <span>Time Machine Simulator</span>
          </div>

          <button
            onClick={() => setIsSimModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-text hover:text-off-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-text mb-4 leading-relaxed font-sans">
          The conference runs <strong>Oct 16–18, 2026</strong> in <code>Africa/Casablanca</code>. Select any milestone below to immediately test the Live Now banner, up next indicators, and agenda highlights:
        </p>

        <div className="space-y-2 font-label">
          {presets.map((preset, idx) => {
            const isSelected = simulatedTime === preset.value;

            return (
              <button
                key={idx}
                onClick={() => {
                  setSimulatedTime(preset.value);
                  setIsSimModalOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-gradient-to-r from-stark-red/20 via-infinity-purple/20 to-endgame-gold/20 border-endgame-gold/50 shadow-glow-combo text-off-white'
                    : 'bg-surface/70 border-white/5 hover:border-white/15 hover:bg-surface-hover text-muted-text hover:text-off-white'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${getDayDot(preset.day)}`} />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-off-white font-sans">
                      {preset.label}
                    </div>
                    <div className="text-[11px] text-muted-text mt-0.5">
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
