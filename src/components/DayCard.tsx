import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { DaySchedule } from '../data/agenda';

interface DayCardProps {
  day: DaySchedule;
  index: number;
}

export const DayCard: React.FC<DayCardProps> = ({ day, index }) => {
  // Color styling based on accent: Day 1 = red, Day 2 = purple, Day 3 = blend
  const borderClass =
    day.accent === 'red'
      ? 'border-marvel-red/30 hover:border-marvel-red/60 hover:shadow-glow-red'
      : day.accent === 'purple'
      ? 'border-infinity-purple/30 hover:border-infinity-purple/60 hover:shadow-glow-purple'
      : 'border-white/20 hover:border-white/40 hover:shadow-glow-combo';

  const badgeBg =
    day.accent === 'red'
      ? 'bg-marvel-red/20 text-marvel-red border-marvel-red/40'
      : day.accent === 'purple'
      ? 'bg-infinity-purple/20 text-infinity-purple-light border-infinity-purple/40'
      : 'bg-gradient-to-r from-marvel-red/20 to-infinity-purple/20 text-off-white border-white/20';

  const glowBlob =
    day.accent === 'red'
      ? 'bg-marvel-red/20'
      : day.accent === 'purple'
      ? 'bg-infinity-purple/20'
      : 'bg-gradient-to-br from-marvel-red/25 to-infinity-purple/25';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link
        to={`/agenda?day=${day.id}`}
        className={`group relative block overflow-hidden rounded-2xl glass-card p-5 sm:p-6 border ${borderClass} transition-all duration-300`}
      >
        {/* Ambient subtle corner glow */}
        <div
          className={`absolute -top-16 -right-16 w-36 h-36 ${glowBlob} rounded-full blur-2xl pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60`}
        />

        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeBg}`}>
              Day {day.dayNumber}
            </span>
            <span className="text-xs text-muted-text font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {day.dayOfWeek}, {day.date.split('-').slice(1).join('/')}
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-text group-hover:text-off-white group-hover:bg-white/10 transition-all">
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>

        <h3 className="font-display font-extrabold fluid-day-title tracking-tight text-off-white uppercase mb-2">
          {day.codename}
        </h3>

        <p className="text-xs sm:text-sm text-muted-text leading-relaxed line-clamp-2">
          {day.themeDesc}
        </p>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-muted-text font-medium">
          <span>{day.sessions.length} scheduled blocks</span>
          <span className="text-off-white/80 group-hover:text-off-white font-semibold inline-flex items-center gap-1">
            View Briefing →
          </span>
        </div>
      </Link>
    </motion.div>
  );
};
