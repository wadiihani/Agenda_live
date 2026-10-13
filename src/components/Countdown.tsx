import React from 'react';
import { CountdownState } from '../hooks/useLiveSession';
import { Clock } from 'lucide-react';

interface CountdownProps {
  countdown: CountdownState;
  targetDateText?: string;
}

export const Countdown: React.FC<CountdownProps> = ({ countdown, targetDateText = 'Fri Oct 16, 17:00' }) => {
  const units = [
    { label: 'Days', value: countdown.days },
    { label: 'Hours', value: String(countdown.hours).padStart(2, '0') },
    { label: 'Mins', value: String(countdown.minutes).padStart(2, '0') },
    { label: 'Secs', value: String(countdown.seconds).padStart(2, '0') },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-muted-text mb-3 font-medium">
        <span className="flex items-center gap-1.5 text-off-white font-semibold">
          <Clock className="w-3.5 h-3.5 text-marvel-red" />
          Mission Commences
        </span>
        <span className="text-infinity-purple-light font-mono text-[11px]">
          {targetDateText} · Casablanca
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-surface/90 border border-white/10 shadow-inner group hover:border-infinity-purple/40 transition-colors"
          >
            <span className="font-display font-bold text-2xl sm:text-3xl text-gradient-marvel leading-none tracking-tight">
              {unit.value}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-text mt-1 font-semibold">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
