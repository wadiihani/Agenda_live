import React from 'react';
import { motion } from 'framer-motion';
import { DaySchedule } from '../data/agenda';

interface DayTabsProps {
  days: Record<string, DaySchedule>;
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({ days, activeDayId, onSelectDay }) => {
  // Day-specific dates
  const getDayDateLabel = (dayNumber: number) => {
    switch (dayNumber) {
      case 1:
        return 'Fri Oct 16';
      case 2:
        return 'Sat Oct 17';
      case 3:
      default:
        return 'Sun Oct 18';
    }
  };

  // Day-specific active glow and gradient based on the visual identity document
  const getDayTabStyle = (dayNumber: number, isActive: boolean) => {
    if (!isActive) return '';
    switch (dayNumber) {
      case 1:
        // Day 1: Civil War Red (#B71C1C)
        return 'bg-gradient-to-b from-stark-red/25 to-stark-red/10 border-stark-red/50 shadow-[0_4px_20px_rgba(183,28,28,0.25)] text-off-white';
      case 2:
        // Day 2: Infinity Purple (#6A1B9A)
        return 'bg-gradient-to-b from-infinity-purple/30 to-infinity-purple/10 border-infinity-purple/50 shadow-[0_4px_20px_rgba(106,27,154,0.25)] text-off-white';
      case 3:
      default:
        // Day 3: Endgame Gold (#D4AF37)
        return 'bg-gradient-to-b from-endgame-gold/25 to-endgame-gold/10 border-endgame-gold/50 shadow-[0_4px_20px_rgba(212,175,55,0.25)] text-off-white';
    }
  };

  const getDayDotColor = (dayNumber: number) => {
    switch (dayNumber) {
      case 1:
        return 'bg-stark-red shadow-[0_0_8px_rgba(183,28,28,0.8)]';
      case 2:
        return 'bg-purple-400 shadow-[0_0_8px_rgba(156,39,176,0.8)]';
      case 3:
      default:
        return 'bg-endgame-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]';
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl glass-card border border-white/10 mb-4 select-none">
      {Object.values(days).map((day) => {
        const isActive = day.id === activeDayId;

        return (
          <button
            key={day.id}
            onClick={() => onSelectDay(day.id)}
            className={`relative flex flex-col items-center justify-center py-2 sm:py-2.5 px-2 rounded-xl text-center transition-all duration-200 active:scale-[0.98] ${
              isActive
                ? 'font-bold'
                : 'text-muted-text hover:text-off-white font-medium hover:bg-white/[0.03]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeDayTab"
                className={`absolute inset-0 border rounded-xl -z-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] ${getDayTabStyle(day.dayNumber, true)}`}
                transition={{ type: 'spring', stiffness: 450, damping: 34 }}
              />
            )}
            
            <div className="flex items-center gap-1.5 leading-tight">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform ${getDayDotColor(day.dayNumber)} ${isActive ? 'scale-125' : 'opacity-40'}`} />
              <span className="font-display text-base sm:text-lg tracking-wide uppercase">
                Day {day.dayNumber}
              </span>
            </div>
            
            <span className="font-label text-[10px] sm:text-xs tracking-wider opacity-90 uppercase truncate max-w-full mt-0.5 font-semibold">
              {day.codename}
            </span>

            <span className="font-label text-[9px] text-muted-text/70 tracking-tight mt-0.5 tabular-nums">
              {getDayDateLabel(day.dayNumber)}
            </span>
          </button>
        );
      })}
    </div>
  );
};

