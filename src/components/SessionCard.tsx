import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  User, 
  Star, 
  AlertTriangle, 
  CheckCircle2, 
  Utensils, 
  Coffee, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Session, DaySchedule, formatSessionTitle } from '../data/agenda';
import { useAgenda } from '../context/AgendaContext';

interface SessionCardProps {
  session: Session;
  day: DaySchedule;
  isLive: boolean;
  index: number;
  onSelect?: (session: Session) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  day: _day, 
  isLive, 
  index,
  onSelect 
}) => {
  const { isFavorite, toggleFavorite, setSelectedSession } = useAgenda();
  const favorited = isFavorite(session.id);

  const handleClick = () => {
    if (onSelect) {
      onSelect(session);
    } else {
      setSelectedSession(session);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(session.id);
  };

  const isDelayed = Boolean(session.delayMinutes && session.delayMinutes > 0);
  const effectiveStart = session.adjustedTime || session.time;
  const effectiveEnd = session.adjustedEndTime || session.endTime || '';

  // Light collapsed row for simple breaks without facilitators
  if (session.type === 'break') {
    const isMeal =
      session.title.toLowerCase().includes('lunch') ||
      session.title.toLowerCase().includes('dinner') ||
      session.title.toLowerCase().includes('breakfast');

    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: Math.min(0.2, index * 0.02) }}
        id={`session-${session.id}`}
        onClick={handleClick}
        className={`flex items-center justify-between py-2.5 px-3.5 sm:px-4 rounded-xl border text-xs cursor-pointer transition-all duration-200 active:scale-[0.99] ${
          isLive
            ? 'bg-emerald-950/40 border-emerald-500/60 text-off-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            : isDelayed
            ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
            : 'bg-white/[0.02] border-white/6 text-muted-text hover:bg-white/[0.04] hover:border-white/12'
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {isMeal ? (
            <Utensils className="w-3.5 h-3.5 shrink-0 text-endgame-gold" />
          ) : (
            <Coffee className="w-3.5 h-3.5 shrink-0 text-stark-red" />
          )}

          <div className="flex items-center gap-2 tabular-nums font-mono font-bold text-off-white/90 shrink-0">
            {effectiveStart ? (
              <>
                {isDelayed && (
                  <span className="line-through text-muted-text/60 text-[10px]">
                    {session.time}
                  </span>
                )}
                <span className={isDelayed ? 'text-amber-400' : ''}>
                  {effectiveStart}
                  {effectiveEnd ? ` – ${effectiveEnd}` : ''}
                </span>
              </>
            ) : (
              <span className="text-[10px] text-muted-text/60 font-mono">#{index + 1}</span>
            )}
          </div>

          <span className="font-medium text-off-white/90 truncate">
            {formatSessionTitle(session.title)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {session.room && (
            <span className="text-[10px] text-muted-text/70 hidden sm:inline truncate max-w-[140px]">
              {session.room}
            </span>
          )}
          {isDelayed && (
            <span className="text-[10px] font-mono text-amber-400 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/25">
              +{session.delayMinutes}m
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  // Visual status stylings
  const getCardBorderAndBg = () => {
    if (session.status === 'cancelled') {
      return 'border-red-900/60 bg-red-950/15 opacity-70';
    }
    if (isLive || session.status === 'live') {
      return 'border-emerald-500/80 bg-gradient-to-br from-emerald-950/30 to-[#070A10] shadow-[0_0_24px_rgba(16,185,129,0.22)]';
    }
    if (isDelayed || session.status === 'delayed') {
      return 'border-amber-500/50 bg-gradient-to-br from-amber-950/20 to-[#070A10] shadow-[0_0_18px_rgba(245,158,11,0.15)]';
    }
    if (session.status === 'starting-soon') {
      return 'border-amber-400/60 bg-gradient-to-br from-amber-900/20 to-[#070A10]';
    }
    if (session.status === 'completed') {
      return 'border-white/5 bg-white/[0.015] opacity-65';
    }

    // Default scheduled
    return 'border-white/10 hover:border-white/25 hover:bg-white/[0.03]';
  };

  const getStatusBadge = () => {
    if (isLive || session.status === 'live') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-[#070A10] shadow-[0_0_10px_rgba(16,185,129,0.5)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#070A10] animate-ping" />
          LIVE NOW
        </span>
      );
    }
    if (isDelayed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
          <AlertTriangle className="w-2.5 h-2.5" />
          +{session.delayMinutes}M DELAY
        </span>
      );
    }
    if (session.status === 'starting-soon') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-300 border border-amber-400/30 animate-pulse">
          STARTING SOON
        </span>
      );
    }
    if (session.status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-white/5 text-muted-text border border-white/5">
          <CheckCircle2 className="w-2.5 h-2.5" />
          DONE
        </span>
      );
    }
    if (session.status === 'cancelled') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
          CANCELLED
        </span>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(0.25, index * 0.02) }}
      id={`session-${session.id}`}
      onClick={handleClick}
      className={`relative group rounded-2xl glass-card p-3.5 sm:p-4 border cursor-pointer transition-all duration-200 active:scale-[0.995] ${getCardBorderAndBg()}`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2 font-label">
        <div className="flex items-center gap-2">
          {/* Time Marker */}
          {effectiveStart ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-off-white tabular-nums flex-wrap">
              <Clock className="w-3.5 h-3.5 text-endgame-gold shrink-0" />
              {isDelayed && (
                <span className="line-through text-muted-text/60 text-[11px] font-normal">
                  {session.time}
                </span>
              )}
              {effectiveEnd ? (
                <span className={isDelayed ? 'text-amber-400 font-extrabold' : ''}>
                  {effectiveStart} – {effectiveEnd}
                </span>
              ) : (
                <span className={isDelayed ? 'text-amber-400 font-extrabold' : ''}>
                  Starts at {effectiveStart} <span className="text-muted-text font-normal">· End time TBD</span>
                </span>
              )}
              {session.duration && effectiveEnd && (
                <span className="text-[10px] font-mono text-muted-text/80 px-1.5 py-0.5 rounded bg-white/5 border border-white/5 shrink-0">
                  {typeof session.duration === 'number' ? `${session.duration}m` : session.duration}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-text tabular-nums">
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/8 text-muted-text/90">
                Time TBD · Session {index + 1}
              </span>
            </div>
          )}

          {/* Status Badge */}
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-1.5">
          {session.track && (
            <span
              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                session.track === 'newbies'
                  ? 'bg-infinity-purple/20 text-purple-300 border-infinity-purple/40'
                  : session.track === 'igv'
                  ? 'bg-arc-blue/20 text-arc-blue border-arc-blue/40'
                  : session.track === 'mms'
                  ? 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/40'
                  : 'bg-white/10 text-off-white/80 border-white/10'
              }`}
            >
              {session.track === 'newbies'
                ? 'Newbies'
                : session.track === 'igv'
                ? 'iGV Members'
                : session.track === 'mms'
                ? 'MMs & Oldies'
                : session.track === 'all'
                ? 'All Membership'
                : session.track}
            </span>
          )}

          {session.isOvernight && (
            <span className="px-2 py-0.5 rounded-full bg-infinity-purple/20 text-purple-300 border border-infinity-purple/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
              <span>Overnight</span>
            </span>
          )}

          {session.type === 'party' && (
            <span className="px-2 py-0.5 rounded-full bg-energy-orange/20 text-energy-orange border border-energy-orange/40 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Celebration
            </span>
          )}

          {/* Favorite Star Icon */}
          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-full transition-all active:scale-90 ${
              favorited
                ? 'text-endgame-gold hover:text-endgame-gold/80'
                : 'text-muted-text/50 hover:text-endgame-gold'
            }`}
            title={favorited ? 'Remove favorite' : 'Bookmark session'}
            aria-label="Bookmark session"
          >
            <Star className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Session Title */}
      <h4 className={`text-base sm:text-lg font-bold text-off-white leading-snug tracking-tight mb-2 group-hover:text-endgame-gold transition-colors ${
        session.status === 'cancelled' ? 'line-through text-muted-text' : ''
      }`}>
        {formatSessionTitle(session.title)}
      </h4>

      {/* Essence preview */}
      {session.essence && (
        <p className="text-xs text-muted-text leading-relaxed line-clamp-1 mb-2.5 font-sans">
          {session.essence}
        </p>
      )}

      {/* Bottom Row: Room Location, Speaker, Chevron */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-muted-text font-label">
        <div className="flex items-center gap-3 truncate">
          {session.room && (
            <div className="flex items-center gap-1 truncate text-off-white/80">
              <MapPin className="w-3 h-3 text-arc-blue shrink-0" />
              <span className="truncate">{session.room}</span>
            </div>
          )}

          {session.facilitator && (
            <div className="flex items-center gap-1 truncate">
              <User className="w-3 h-3 text-stark-red shrink-0" />
              <span className="truncate">{session.facilitator}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 text-[11px] text-muted-text group-hover:text-off-white font-medium shrink-0 transition-colors">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};
