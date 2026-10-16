import React from 'react';
import { motion } from 'framer-motion';
import { DaySchedule } from '../data/agenda';
import { Shield, Users } from 'lucide-react';

interface DayTabsProps {
  days: Record<string, DaySchedule>;
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({ days, activeDayId, onSelectDay }) => {
  // Primary 3 conference days
  const mainDayKeys = ['day1', 'day2', 'day3'];
  const mainDays = mainDayKeys
    .map((k) => days[k])
    .filter(Boolean);

  // Auxiliary tracks/days
  const auxDayKeys = ['day0', 'lcm'];
  const auxDays = auxDayKeys
    .map((k) => days[k])
    .filter(Boolean);

  const getDayDateLabel = (id: string, dayNumber: number) => {
    if (id === 'day0') return 'Thu Oct 15';
    if (id === 'lcm') return 'Sun Oct 18 · 16:00';
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

  const getDayTabStyle = (dayNumber: number, id: string, isActive: boolean) => {
    if (!isActive) return '';
    if (id === 'day0') {
      return 'bg-gradient-to-b from-stark-red/25 to-stark-red/10 border-stark-red/50 shadow-[0_4px_20px_rgba(183,28,28,0.25)] text-off-white';
    }
    if (id === 'lcm') {
      return 'bg-gradient-to-b from-cosmic-blue/30 to-endgame-gold/15 border-arc-blue/50 shadow-[0_4px_20px_rgba(0,180,216,0.25)] text-off-white';
    }
    switch (dayNumber) {
      case 1:
        return 'bg-gradient-to-b from-stark-red/25 to-stark-red/10 border-stark-red/50 shadow-[0_4px_20px_rgba(183,28,28,0.25)] text-off-white';
      case 2:
        return 'bg-gradient-to-b from-infinity-purple/30 to-infinity-purple/10 border-infinity-purple/50 shadow-[0_4px_20px_rgba(106,27,154,0.25)] text-off-white';
      case 3:
      default:
        return 'bg-gradient-to-b from-endgame-gold/25 to-endgame-gold/10 border-endgame-gold/50 shadow-[0_4px_20px_rgba(212,175,55,0.25)] text-off-white';
    }
  };

  const getDayDotColor = (dayNumber: number, id: string) => {
    if (id === 'day0') return 'bg-stark-red shadow-[0_0_8px_rgba(183,28,28,0.8)]';
    if (id === 'lcm') return 'bg-arc-blue shadow-[0_0_8px_rgba(0,180,216,0.8)]';
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
    <div className="space-y-1.5 mb-4 select-none font-sans">
      {/* Primary 3-Day Grid */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl glass-card border border-white/10">
        {mainDays.map((day) => {
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
                  className={`absolute inset-0 border rounded-xl -z-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] ${getDayTabStyle(day.dayNumber, day.id, true)}`}
                  transition={{ type: 'spring', stiffness: 450, damping: 34 }}
                />
              )}
              
              <div className="flex items-center gap-1.5 leading-tight">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform ${getDayDotColor(day.dayNumber, day.id)} ${isActive ? 'scale-125' : 'opacity-40'}`} />
                <span className="font-display text-base sm:text-lg tracking-wide uppercase">
                  Day {day.dayNumber}
                </span>
              </div>
              
              <span className="font-label text-[10px] sm:text-xs tracking-wider opacity-90 uppercase truncate max-w-full mt-0.5 font-semibold">
                {day.codename}
              </span>

              <span className="font-label text-[9px] text-muted-text/70 tracking-tight mt-0.5 tabular-nums">
                {getDayDateLabel(day.id, day.dayNumber)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Auxiliary Tabs for Day 0 & LCM Parents Track */}
      {auxDays.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 px-1 font-label">
          {auxDays.map((aux) => {
            const isActive = aux.id === activeDayId;
            const isDay0 = aux.id === 'day0';

            return (
              <button
                key={aux.id}
                onClick={() => onSelectDay(aux.id)}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all border ${
                  isActive
                    ? isDay0
                      ? 'bg-stark-red/20 text-stark-red border-stark-red/50 shadow-sm'
                      : 'bg-arc-blue/20 text-arc-blue border-arc-blue/50 shadow-sm'
                    : 'bg-white/[0.03] text-muted-text hover:text-off-white border-white/8 hover:bg-white/[0.06]'
                }`}
              >
                {isDay0 ? (
                  <Shield className="w-3 h-3 shrink-0" />
                ) : (
                  <Users className="w-3 h-3 shrink-0" />
                )}
                <span>{isDay0 ? 'Day 0 : Team Pre-Meetings' : 'LCM : Cocktail des Parents'}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
