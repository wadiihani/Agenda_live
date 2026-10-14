import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  User, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Hourglass,
  FolderOpen,
  ExternalLink,
  Coffee,
  Utensils,
  Compass
} from 'lucide-react';
import { useConferenceLiveState } from '../hooks/useConferenceLiveState';
import { useAgenda } from '../context/AgendaContext';
import { formatSessionTitle, Session } from '../data/agenda';

interface LiveBannerProps {
  onSelectSession?: (session: Session) => void;
}

export const LiveBanner: React.FC<LiveBannerProps> = ({ onSelectSession }) => {
  const liveState = useConferenceLiveState();
  const { 
    state, 
    currentSession, 
    nextSession, 
    subsequentSession,
    currentDay, 
    countdown, 
    nextCountdown, 
    breakCountdown,
    progressPercent, 
    remainingMinutes,
    casablancaTimeStr,
    roomMovementCue,
    tomorrowFirstSession,
    tomorrowBreakfastTime
  } = liveState;

  const { agenda, setSelectedSession } = useAgenda();
  const driveUrl = agenda?.meta?.mediaDriveUrl || 'https://drive.google.com/drive/folders/1rabat-co26-2-vault?usp=sharing';

  const handleOpenSession = (s: Session) => {
    if (onSelectSession) {
      onSelectSession(s);
    } else {
      setSelectedSession(s);
    }
  };

  // Day theme accents based on current conference day
  const getDayAccent = (dayNum?: number) => {
    switch (dayNum) {
      case 1:
        return {
          glow: 'from-stark-red/25 via-stark-red/10 to-transparent',
          border: 'border-stark-red/50 hover:border-stark-red',
          badge: 'bg-stark-red text-white shadow-[0_0_12px_rgba(183,28,28,0.6)]',
          dot: 'bg-stark-red',
          text: 'text-stark-red',
          barGradient: 'from-stark-red via-rose-500 to-amber-500'
        };
      case 2:
        return {
          glow: 'from-infinity-purple/30 via-infinity-purple/10 to-transparent',
          border: 'border-infinity-purple/50 hover:border-infinity-purple',
          badge: 'bg-infinity-purple text-white shadow-[0_0_12px_rgba(106,27,154,0.6)]',
          dot: 'bg-infinity-purple',
          text: 'text-purple-300',
          barGradient: 'from-infinity-purple via-fuchsia-500 to-arc-blue'
        };
      case 3:
      default:
        return {
          glow: 'from-endgame-gold/25 via-endgame-gold/10 to-transparent',
          border: 'border-endgame-gold/50 hover:border-endgame-gold',
          badge: 'bg-endgame-gold text-charcoal-black shadow-[0_0_12px_rgba(212,175,55,0.6)]',
          dot: 'bg-endgame-gold',
          text: 'text-endgame-gold',
          barGradient: 'from-endgame-gold via-amber-400 to-yellow-200'
        };
    }
  };

  const accent = getDayAccent(currentDay?.dayNumber || 1);

  // =========================================================================
  // STATE 1: PRE_CONFERENCE (Before Fri Oct 16, 17:00 Casablanca)
  // =========================================================================
  if (state === 'PRE_CONFERENCE' && countdown) {
    const firstOp = nextSession;
    return (
      <div className="w-full space-y-3 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl glass-card p-4 sm:p-5 border border-endgame-gold/30 shadow-[0_8px_32px_rgba(212,175,55,0.15)] bg-gradient-to-br from-black/60 via-[#070A10] to-black/80"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-endgame-gold/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status Header */}
          <div className="flex items-center justify-between gap-2 mb-2 font-label">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest text-endgame-gold bg-endgame-gold/15 border border-endgame-gold/30 uppercase">
              <Hourglass className="w-3 h-3 animate-spin" />
              T-MINUS OPENING
            </span>
            <span className="text-xs font-mono text-muted-text tabular-nums">
              {casablancaTimeStr} Casablanca Time
            </span>
          </div>

          <h3 className="font-display font-black text-xl sm:text-2xl text-off-white uppercase tracking-wide">
            Countdown to Assembling
          </h3>
          <p className="text-xs text-muted-text mt-0.5">
            Rabat CO 26.2 convenes Friday, October 16 at 17:00 in Africa/Casablanca.
          </p>

          {/* High-Impact Tabular Countdown Numbers */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-center font-display">
            <div className="p-2 sm:p-3 rounded-xl bg-black/50 border border-white/8">
              <div className="text-2xl sm:text-3xl font-extrabold text-off-white tabular-nums">{countdown.days}</div>
              <div className="text-[9px] uppercase tracking-wider text-muted-text font-label mt-0.5">Days</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-black/50 border border-white/8">
              <div className="text-2xl sm:text-3xl font-extrabold text-off-white tabular-nums">{countdown.hours}</div>
              <div className="text-[9px] uppercase tracking-wider text-muted-text font-label mt-0.5">Hours</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-black/50 border border-white/8">
              <div className="text-2xl sm:text-3xl font-extrabold text-off-white tabular-nums">{countdown.minutes}</div>
              <div className="text-[9px] uppercase tracking-wider text-muted-text font-label mt-0.5">Mins</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-black/50 border border-white/8">
              <div className="text-2xl sm:text-3xl font-extrabold text-endgame-gold tabular-nums">{countdown.seconds}</div>
              <div className="text-[9px] uppercase tracking-wider text-endgame-gold/80 font-label mt-0.5">Secs</div>
            </div>
          </div>

          {/* First Operation Card Preview */}
          {firstOp && (
            <div 
              onClick={() => handleOpenSession(firstOp)}
              className="mt-4 p-3 sm:p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-endgame-gold/40 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs group"
            >
              <div className="min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-widest text-endgame-gold font-bold block mb-0.5">
                  FIRST OPERATION · {firstOp.effectiveStart || firstOp.time || '17:00'}
                </span>
                <span className="font-bold text-sm text-off-white truncate block group-hover:text-endgame-gold transition-colors">
                  {formatSessionTitle(firstOp.title)}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-muted-text truncate mt-0.5 font-label">
                  <span className="text-arc-blue font-medium">{firstOp.dualRoom.thematic}</span>
                  <span>•</span>
                  <span>{firstOp.dualRoom.physical}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-endgame-gold group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          )}

          {/* Check-In & Venue Guide Notice (Requirement 3) */}
          <div className="mt-3 p-3 rounded-xl bg-cosmic-blue/10 border border-arc-blue/20 text-xs text-muted-text flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Compass className="w-4 h-4 text-arc-blue shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-off-white block text-[11px]">Venue Check-In & Bifrost Gate</span>
                <span className="text-[10px] text-muted-text block truncate">
                  Registration Gate open from 08:00 to 17:00 for security credential verification & mission packs.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // STATE 3: IN_BREAK / TRANSITION (Between sessions, meals, coffee breaks)
  // =========================================================================
  if (state === 'IN_BREAK') {
    const isMeal = currentSession?.title.toLowerCase().includes('lunch') || 
                   currentSession?.title.toLowerCase().includes('dinner') ||
                   currentSession?.title.toLowerCase().includes('breakfast');

    return (
      <div className="w-full space-y-3 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl glass-card p-4 sm:p-5 border border-amber-500/50 shadow-[0_8px_32px_rgba(245,158,11,0.2)] bg-gradient-to-br from-amber-950/20 via-[#070A10] to-black/80"
        >
          {/* Subtle Ambient Amber Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Status Header */}
          <div className="flex items-center justify-between gap-2 mb-2 font-label">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-charcoal-black shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                {isMeal ? <Utensils className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
                <span>{currentSession ? 'BREAK IN PROGRESS' : 'TACTICAL TRANSITION'}</span>
              </span>
              <span className="text-[10px] text-muted-text font-semibold uppercase tracking-wider hidden xs:inline">
                DAY {currentDay?.dayNumber} · {currentDay?.codename}
              </span>
            </div>

            <span className="text-xs font-mono text-muted-text tabular-nums">
              {casablancaTimeStr} Casa
            </span>
          </div>

          {/* Break Details & Large MM:SS Countdown */}
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-off-white uppercase tracking-wide">
                {currentSession ? currentSession.title : 'Regrouping & Transition'}
              </h3>
              <p className="text-xs text-muted-text mt-0.5 max-w-sm leading-relaxed">
                {currentSession?.essence || 'Operatives are taking a tactical pause. Prepare for the next mission brief.'}
              </p>
            </div>

            {/* Large MM:SS Countdown Timer */}
            {breakCountdown && (
              <div className="shrink-0 p-3 rounded-xl bg-black/60 border border-amber-500/30 text-center sm:text-right">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400 block mb-0.5">
                  RECONVENE IN
                </span>
                <span className="font-display font-black text-3xl sm:text-4xl text-amber-300 tabular-nums tracking-tight">
                  {breakCountdown.formattedMMSS}
                </span>
              </div>
            )}
          </div>

          {/* Assembly Cue Banner (Requirement 3) */}
          {nextSession && (
            <div 
              onClick={() => handleOpenSession(nextSession)}
              className="mt-4 p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-endgame-gold/40 cursor-pointer transition-all flex items-center justify-between gap-3 text-xs group"
            >
              <div className="min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-widest text-endgame-gold font-bold block mb-0.5">
                  NEXT OPERATION · {nextSession.effectiveStart || nextSession.time}
                </span>
                <span className="font-bold text-sm text-off-white truncate block group-hover:text-endgame-gold transition-colors">
                  {formatSessionTitle(nextSession.title)}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-muted-text truncate mt-0.5 font-label">
                  <MapPin className="w-3.5 h-3.5 text-arc-blue shrink-0" />
                  <span className="text-off-white font-medium">{nextSession.dualRoom.thematic}</span>
                  <span>({nextSession.dualRoom.physical})</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-endgame-gold group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          )}

          {/* Movement Cue */}
          {roomMovementCue && (
            <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/6 text-[11px] text-muted-text flex items-center gap-1.5 font-label">
              <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{roomMovementCue}</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // STATE 4: END_OF_DAY / POST_EVENT
  // =========================================================================
  if (state === 'END_OF_DAY' && currentDay) {
    return (
      <div className="w-full space-y-3 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl glass-card p-5 border border-white/10 text-center relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-black/60"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 mx-auto flex items-center justify-center mb-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>

          <h3 className="font-display font-bold text-lg sm:text-xl text-off-white uppercase tracking-wide">
            Day {currentDay.dayNumber} Complete · {currentDay.codename}
          </h3>
          <p className="text-xs text-muted-text max-w-sm mx-auto mt-1">
            All planned missions for Day {currentDay.dayNumber} are concluded. Rest up, review today's learnings, and prepare for tomorrow's chapter.
          </p>

          {/* Tomorrow Assembly Preview (Requirement 3) */}
          <div className="mt-3.5 p-3 rounded-xl bg-white/[0.03] border border-white/8 max-w-md mx-auto text-left flex items-center justify-between gap-3 text-xs font-label">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-endgame-gold font-bold block mb-0.5">
                TOMORROW'S ASSEMBLY · DAY {currentDay.dayNumber + 1}
              </span>
              <span className="font-bold text-off-white block">
                Breakfast at {tomorrowBreakfastTime || '08:00'} • Asgardian Dining Hall
              </span>
              {tomorrowFirstSession && (
                <span className="text-[11px] text-muted-text block mt-0.5">
                  First Plenary: {tomorrowFirstSession.time || '09:00'} ({tomorrowFirstSession.title})
                </span>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-endgame-gold shrink-0" />
          </div>

          {/* Debrief Form CTA */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <Link
              to={`/feedback?day=${currentDay.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-stark-red/30 to-endgame-gold/30 hover:from-stark-red/40 hover:to-endgame-gold/40 border border-endgame-gold/50 text-xs font-bold text-off-white font-label transition-all active:scale-95 shadow-sm"
            >
              <span>Submit Day {currentDay.dayNumber} Debrief</span>
              <ArrowRight className="w-3.5 h-3.5 text-endgame-gold" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // STATE 4 (B): POST_EVENT (After Day 3 Endgame Concludes)
  // =========================================================================
  if (state === 'POST_EVENT') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl glass-card p-5 sm:p-7 border border-endgame-gold/40 text-center relative overflow-hidden shadow-[0_12px_40px_rgba(212,175,55,0.18)] bg-gradient-to-b from-black/80 via-[#070A10] to-black/90 font-sans"
      >
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-endgame-gold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-endgame-gold/15 border border-endgame-gold/30 text-endgame-gold text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CONFERENCE CONCLUDED · MEDIA VAULT OPEN</span>
        </div>

        <h3 className="font-display font-black text-2xl sm:text-3xl text-off-white uppercase tracking-wide">
          Mission Accomplished — Avengers Assemble
        </h3>
        <p className="text-xs sm:text-sm text-muted-text max-w-md mx-auto mt-1.5 leading-relaxed font-sans">
          "Whatever it took." All 3 chapters of Rabat CO 26.2 are concluded. Upload your plenary memories, gala night snapshots, and committee moments into the official Google Drive vault.
        </p>

        {/* CTAs */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5 font-label">
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-endgame-gold to-amber-500 hover:from-amber-400 hover:to-endgame-gold text-charcoal-black font-extrabold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-all active:scale-95 group"
          >
            <FolderOpen className="w-4 h-4 text-charcoal-black group-hover:scale-110 transition-transform" />
            <span>Open Photo & Video Drive Vault</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <Link
            to="/feedback"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-off-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
          >
            <span>Rate Today's Sessions</span>
            <ArrowRight className="w-3.5 h-3.5 text-endgame-gold" />
          </Link>
        </div>
      </motion.div>
    );
  }

  // =========================================================================
  // STATE 2: IN_SESSION (Happening Now + Up Next with dual room badges)
  // =========================================================================
  const curr = currentSession;
  const nxt = nextSession;

  return (
    <div className="w-full space-y-3 font-sans">
      {/* PRIMARY CARD: HAPPENING NOW */}
      {curr ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => handleOpenSession(curr)}
          className={`relative overflow-hidden rounded-2xl glass-card p-4 sm:p-5 border ${accent.border} shadow-[0_8px_32px_rgba(0,0,0,0.6)] cursor-pointer transition-all active:scale-[0.99] group bg-gradient-to-br from-black/60 via-[#070A10] to-black/80`}
        >
          {/* Ambient Glow */}
          <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-gradient-to-br ${accent.glow}`} />

          {/* Top Status & Timestamp Header */}
          <div className="flex items-center justify-between gap-2 mb-2 font-label">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${accent.badge}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                NOW LIVE
              </span>
              <span className="text-[10px] text-muted-text font-semibold uppercase tracking-wider">
                DAY {currentDay?.dayNumber} · {currentDay?.codename}
              </span>
            </div>

            <span className="text-xs font-mono text-muted-text tabular-nums">
              {casablancaTimeStr} Casa
            </span>
          </div>

          {/* Title & Essence */}
          <div className="mt-1">
            <h3 className="font-display font-black text-xl sm:text-2xl text-off-white uppercase tracking-wide leading-tight group-hover:text-metallic-gold transition-colors">
              {formatSessionTitle(curr.title)}
            </h3>

            {curr.essence && (
              <p className="text-xs text-muted-text/90 line-clamp-2 mt-1 leading-relaxed">
                {curr.essence}
              </p>
            )}
          </div>

          {/* Meta Details: Time, Dual Room Badges (Thematic + Physical), Speaker */}
          <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-label text-muted-text">
            {/* Effective Start - End */}
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-stark-red shrink-0" />
              <span className="tabular-nums font-semibold text-off-white truncate">
                {curr.effectiveStart} – {curr.effectiveEnd}
              </span>
            </div>

            {/* Dual Room Badge (Requirement 1 & 3) */}
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-arc-blue shrink-0" />
              <div className="truncate font-medium">
                <span className="text-off-white font-bold mr-1">{curr.dualRoom.thematic}</span>
                <span className="text-muted-text/80 text-[11px]">({curr.dualRoom.physical})</span>
              </div>
            </div>

            {/* Facilitator / Speaker */}
            {curr.facilitator && (
              <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-endgame-gold shrink-0" />
                <span className="text-off-white truncate font-medium">
                  {curr.facilitator}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar & Exact Minutes Remaining */}
          <div className="mt-3.5 pt-3 border-t border-white/8">
            <div className="flex items-center justify-between text-[11px] font-label mb-1.5">
              <span className="text-muted-text font-medium">Session Elapsed</span>
              <span className="text-off-white font-bold tabular-nums">
                {remainingMinutes > 0 ? `${remainingMinutes} mins remaining` : 'Concluding now'} ({progressPercent}%)
              </span>
            </div>

            {/* Calculated Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${accent.barGradient} rounded-full transition-all duration-1000 ease-linear`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Delay Notification Banner if Shifted */}
          {curr.delayMinutes && curr.delayMinutes > 0 && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Shifted +{curr.delayMinutes}m (Originally {curr.time || 'scheduled'}).
              </span>
            </div>
          )}
        </motion.div>
      ) : (
        /* Empty State between sessions */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl glass-card border border-white/10 text-center"
        >
          <div className="text-xs font-label uppercase tracking-widest text-muted-text font-semibold mb-1">
            Intermission • Transition
          </div>
          <h4 className="font-display font-bold text-lg text-off-white uppercase">
            No Active Session Underway
          </h4>
          <p className="text-xs text-muted-text mt-0.5">
            Operatives are regrouping for the next scheduled briefing.
          </p>
        </motion.div>
      )}

      {/* SECONDARY CARD: UP NEXT (Directly underneath with room movement cue) */}
      {nxt && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => handleOpenSession(nxt)}
          className="relative overflow-hidden rounded-2xl glass-card p-3.5 sm:p-4 border border-white/10 hover:border-endgame-gold/50 cursor-pointer transition-all active:scale-[0.99] group bg-gradient-to-br from-white/[0.02] to-black/40"
        >
          <div className="flex items-center justify-between gap-2 mb-2 font-label">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-endgame-gold px-2 py-0.5 rounded-full bg-endgame-gold/15 border border-endgame-gold/30">
                UP NEXT
              </span>
              <span className="text-xs font-bold text-off-white tabular-nums">
                {nxt.effectiveStart || nxt.time}
              </span>
            </div>

            {/* Countdown until start */}
            {nextCountdown && (
              <span className="text-xs font-mono font-bold text-endgame-gold tabular-nums flex items-center gap-1">
                <Clock className="w-3 h-3 text-endgame-gold" />
                <span>Starts in {nextCountdown.hours > 0 ? `${nextCountdown.hours}h ` : ''}{nextCountdown.minutes}m {nextCountdown.seconds}s</span>
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-display font-bold text-base sm:text-lg text-off-white uppercase tracking-wide group-hover:text-endgame-gold transition-colors truncate">
                {formatSessionTitle(nxt.title)}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-text mt-1 font-label truncate">
                <MapPin className="w-3.5 h-3.5 text-arc-blue shrink-0" />
                <span className="text-off-white truncate font-medium">{nxt.dualRoom.thematic}</span>
                <span className="text-muted-text/80 truncate">({nxt.dualRoom.physical})</span>
                {nxt.facilitator && (
                  <>
                    <span>•</span>
                    <span className="truncate">{nxt.facilitator}</span>
                  </>
                )}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-text group-hover:text-endgame-gold group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </div>

          {/* Room movement cue (Requirement 1 & 3) */}
          {roomMovementCue && (
            <div className="mt-2.5 pt-2 border-t border-white/6 flex items-center gap-1.5 text-[11px] font-label text-muted-text">
              <Compass className="w-3 h-3 text-endgame-gold shrink-0" />
              <span className="truncate">{roomMovementCue}</span>
            </div>
          )}

          {/* 2nd Upcoming Operation preview if available (Requirement 1) */}
          {subsequentSession && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenSession(subsequentSession);
              }}
              className="mt-2 pt-2 border-t border-white/6 flex items-center justify-between gap-2 text-[11px] font-label text-muted-text hover:text-off-white transition-colors"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-endgame-gold/90 px-1.5 py-0.2 rounded bg-endgame-gold/10 border border-endgame-gold/20">
                  THEN
                </span>
                <span className="font-mono text-off-white/90 font-semibold">{subsequentSession.effectiveStart || subsequentSession.time}</span>
                <span className="text-off-white/80 truncate">{formatSessionTitle(subsequentSession.title)}</span>
              </div>
              <span className="text-[10px] text-arc-blue truncate shrink-0 hidden xs:inline">{subsequentSession.dualRoom.thematic}</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LiveBanner;
