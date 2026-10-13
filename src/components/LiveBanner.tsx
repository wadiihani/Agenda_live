import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Copy,
  Check,
  Camera
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLiveSession } from '../hooks/useLiveSession';
import { useAgenda } from '../context/AgendaContext';
import { formatSessionTitle, Session } from '../data/agenda';

interface LiveBannerProps {
  onSelectSession?: (session: Session) => void;
}

export const LiveBanner: React.FC<LiveBannerProps> = ({ onSelectSession }) => {
  const { 
    status, 
    current, 
    next, 
    currentDay, 
    countdown, 
    nextCountdown, 
    progressPercent, 
    remainingMinutes,
    casablancaTimeStr 
  } = useLiveSession();
  const { agenda, setSelectedSession } = useAgenda();
  const [copiedDrive, setCopiedDrive] = useState(false);
  const driveUrl = agenda?.meta?.mediaDriveUrl || 'https://drive.google.com/drive/folders/1rabat-co26-2-vault?usp=sharing';

  const handleOpenSession = (s: Session) => {
    if (onSelectSession) {
      onSelectSession(s);
    } else {
      setSelectedSession(s);
    }
  };

  // 1. BEFORE CONFERENCE OPENING
  if (status === 'before' && countdown) {
    return (
      <div className="w-full space-y-3 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl glass-card p-4 sm:p-5 border border-endgame-gold/30 shadow-[0_8px_32px_rgba(212,175,55,0.15)]"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-endgame-gold/15 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest text-endgame-gold bg-endgame-gold/15 border border-endgame-gold/30 uppercase">
              <Hourglass className="w-3 h-3 animate-spin" />
              T-MINUS OPENING
            </span>
            <span className="text-[11px] font-mono text-muted-text">
              {casablancaTimeStr} Casablanca
            </span>
          </div>

          <h3 className="font-display font-black text-xl sm:text-2xl text-off-white uppercase tracking-wide">
            Countdown to Assembling
          </h3>
          <p className="text-xs text-muted-text mt-0.5">
            Rabat CO 26.2 convenes Friday, October 16 at 17:00.
          </p>

          {/* High-Impact Tabular Countdown Numbers */}
          <div className="grid grid-cols-4 gap-2 mt-4 text-center font-display">
            <div className="p-2 sm:p-3 rounded-xl bg-black/40 border border-white/8">
              <div className="text-2xl sm:text-3xl font-extrabold text-off-white tabular-nums">{countdown.days}</div>
              <div className="text-[9px] uppercase tracking-wider text-muted-text font-label mt-0.5">Days</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-black/40 border border-white/8">
              <div className="text-2xl sm:text-3xl font-extrabold text-off-white tabular-nums">{countdown.hours}</div>
              <div className="text-[9px] uppercase tracking-wider text-muted-text font-label mt-0.5">Hours</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-black/40 border border-white/8">
              <div className="text-2xl sm:text-3xl font-extrabold text-off-white tabular-nums">{countdown.minutes}</div>
              <div className="text-[9px] uppercase tracking-wider text-muted-text font-label mt-0.5">Mins</div>
            </div>
            <div className="p-2 sm:p-3 rounded-xl bg-black/40 border border-white/8">
              <div className="text-2xl sm:text-3xl font-extrabold text-endgame-gold tabular-nums">{countdown.seconds}</div>
              <div className="text-[9px] uppercase tracking-wider text-endgame-gold/80 font-label mt-0.5">Secs</div>
            </div>
          </div>

          {/* Next Scheduled Session Preview */}
          {next && (
            <div 
              onClick={() => handleOpenSession(next)}
              className="mt-4 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0">
                <span className="text-[9px] font-mono uppercase tracking-widest text-endgame-gold font-bold block mb-0.5">
                  FIRST OPERATION · {next.adjustedTime || next.time}
                </span>
                <span className="font-bold text-off-white truncate block">
                  {formatSessionTitle(next.title)}
                </span>
                <span className="text-[11px] text-muted-text truncate block mt-0.5">
                  {next.room || 'Plenary Hall • Valhalla'}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-endgame-gold shrink-0" />
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // 2. DAY CONCLUDED
  if (status === 'day_concluded' && currentDay) {
    return (
      <div className="w-full space-y-3 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl glass-card p-5 border border-white/10 text-center relative overflow-hidden"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 mx-auto flex items-center justify-center mb-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="font-display font-bold text-lg sm:text-xl text-off-white uppercase tracking-wide">
            Day {currentDay.dayNumber} Operations Concluded
          </h3>
          <p className="text-xs text-muted-text max-w-sm mx-auto mt-1">
            All planned sessions for {currentDay.codename} are complete. Rest up and review today's learnings.
          </p>
          <div className="mt-3.5 flex items-center justify-center gap-2">
            <Link
              to={`/feedback?day=${currentDay.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-stark-red/20 to-endgame-gold/20 hover:from-stark-red/30 hover:to-endgame-gold/30 border border-endgame-gold/40 text-xs font-semibold text-off-white font-label transition-all active:scale-95"
            >
              <span>Submit Day {currentDay.dayNumber} Debrief</span>
              <ArrowRight className="w-3.5 h-3.5 text-endgame-gold" />
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. AFTER ENTIRE CONFERENCE -> MEDIA & MEMORY VAULT HUB (LINKED TO GOOGLE DRIVE)
  if (status === 'after') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl glass-card p-5 sm:p-7 border border-endgame-gold/40 text-center relative overflow-hidden shadow-[0_12px_40px_rgba(212,175,55,0.18)]"
      >
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-endgame-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-cosmic-blue/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-endgame-gold/15 border border-endgame-gold/30 text-endgame-gold text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CONFERENCE CONCLUDED · MEDIA VAULT OPEN</span>
        </div>

        <h3 className="font-display font-black text-2xl sm:text-3xl text-off-white uppercase tracking-wide">
          Drop Your Photos & Videos
        </h3>
        <p className="text-xs sm:text-sm text-muted-text max-w-md mx-auto mt-1.5 leading-relaxed font-sans">
          "Whatever it took." All missions completed! Drop your plenary memories, roll-call clips, gala night snapshots, and committee moments into the official Rabat CO 26.2 Google Drive vault.
        </p>

        {/* Primary CTA: Open Google Drive */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5 font-label">
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-endgame-gold to-amber-500 hover:from-amber-400 hover:to-endgame-gold text-charcoal-black font-extrabold text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(212,175,55,0.35)] transition-all active:scale-95 group"
          >
            <FolderOpen className="w-4 h-4 text-charcoal-black group-hover:scale-110 transition-transform" />
            <span>Upload to Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          <Link
            to="/photos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-off-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
          >
            <Camera className="w-4 h-4 text-blue-300" />
            <span>Live Photo Wall</span>
          </Link>
        </div>

        {/* Copy Link & Feedback */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 text-xs font-label">
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(driveUrl);
                setCopiedDrive(true);
                setTimeout(() => setCopiedDrive(false), 2500);
              }
            }}
            className="inline-flex items-center gap-1.5 text-muted-text hover:text-off-white transition-colors"
          >
            {copiedDrive ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Drive link copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-endgame-gold" />
                <span>Copy Drive Link</span>
              </>
            )}
          </button>

          <span className="text-white/20">•</span>

          <Link
            to="/feedback"
            className="inline-flex items-center gap-1 text-endgame-gold hover:underline font-semibold"
          >
            <span>Submit Mission Debrief</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>
    );
  }

  // 4. LIVE NOW & UP NEXT (ACTIVE LIVE EXPERIENCE)
  return (
    <div className="w-full space-y-3 font-sans">
      {/* CARD 1: LIVE NOW */}
      {current && currentDay ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => handleOpenSession(current)}
          className="relative overflow-hidden rounded-2xl glass-card p-4 sm:p-5 border border-stark-red/60 shadow-[0_8px_32px_rgba(183,28,28,0.22)] cursor-pointer transition-all hover:border-stark-red active:scale-[0.99]"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-stark-red/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status & Timestamp Header */}
          <div className="flex items-center justify-between gap-2 mb-2 font-label">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-stark-red text-white shadow-[0_0_12px_rgba(183,28,28,0.6)]">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                LIVE NOW
              </span>
              <span className="text-[10px] text-muted-text font-semibold uppercase tracking-wider">
                DAY {currentDay.dayNumber} · {currentDay.codename}
              </span>
            </div>

            <span className="text-xs font-mono text-muted-text tabular-nums">
              {casablancaTimeStr} Casa
            </span>
          </div>

          {/* Title & Track */}
          <div className="mt-1">
            <h3 className="font-display font-black text-xl sm:text-2xl text-off-white uppercase tracking-wide leading-tight">
              {formatSessionTitle(current.title)}
            </h3>

            {current.essence && (
              <p className="text-xs text-muted-text/90 line-clamp-2 mt-1 leading-relaxed">
                {current.essence}
              </p>
            )}
          </div>

          {/* Meta Details: Time, Room, Speaker */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-label text-muted-text">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-stark-red shrink-0" />
              <span className="tabular-nums font-semibold text-off-white truncate">
                {current.adjustedTime || current.time}
                {current.adjustedEndTime ? ` – ${current.adjustedEndTime}` : current.endTime ? ` – ${current.endTime}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-arc-blue shrink-0" />
              <span className="text-off-white truncate font-medium">
                {current.room || 'Plenary Hall • Valhalla'}
              </span>
            </div>

            {current.facilitator && (
              <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-endgame-gold shrink-0" />
                <span className="text-off-white truncate font-medium">
                  {current.facilitator}
                </span>
              </div>
            )}
          </div>

          {/* Real-Timestamp Progress Bar & Remaining Time */}
          <div className="mt-3.5 pt-3 border-t border-white/8">
            <div className="flex items-center justify-between text-[11px] font-label mb-1.5">
              <span className="text-muted-text font-medium">Session Progress</span>
              <span className="text-off-white font-bold tabular-nums">
                {remainingMinutes > 0 ? `${remainingMinutes}m remaining` : 'Ending soon'} ({progressPercent}%)
              </span>
            </div>

            {/* Calculated Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-stark-red via-infinity-purple to-endgame-gold rounded-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(183,28,28,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Confirmed Delay Flag if Delayed */}
          {current.delayMinutes && current.delayMinutes > 0 && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                Delayed by +{current.delayMinutes}m (Originally {current.time}).
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
            Intermission • Tactical Transition
          </div>
          <h4 className="font-display font-bold text-lg text-off-white uppercase">
            No Active Session Underway
          </h4>
          <p className="text-xs text-muted-text mt-0.5">
            Operatives are regrouping for the next scheduled briefing.
          </p>
        </motion.div>
      )}

      {/* CARD 2: UP NEXT */}
      {next && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => handleOpenSession(next)}
          className="relative overflow-hidden rounded-2xl glass-card p-3.5 sm:p-4 border border-white/10 hover:border-endgame-gold/50 cursor-pointer transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center justify-between gap-2 mb-2 font-label">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-endgame-gold px-2 py-0.5 rounded-full bg-endgame-gold/15 border border-endgame-gold/30">
                UP NEXT
              </span>
              <span className="text-xs font-bold text-off-white tabular-nums">
                {next.adjustedTime || next.time}
              </span>
            </div>

            {/* Live Countdown to Next Session */}
            {nextCountdown && (
              <span className="text-xs font-mono font-bold text-endgame-gold tabular-nums flex items-center gap-1">
                <Clock className="w-3 h-3 text-endgame-gold" />
                <span>
                  {nextCountdown.hours > 0 ? `${nextCountdown.hours}h ` : ''}
                  {nextCountdown.minutes}m {nextCountdown.seconds}s
                </span>
              </span>
            )}
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-display font-bold text-base sm:text-lg text-off-white uppercase tracking-wide group-hover:text-endgame-gold transition-colors truncate">
                {formatSessionTitle(next.title)}
              </h4>
              <div className="flex items-center gap-3 text-xs text-muted-text mt-1 font-label">
                <span className="truncate">{next.room || 'Plenary Hall • Valhalla'}</span>
                {next.facilitator && (
                  <>
                    <span>•</span>
                    <span className="truncate">{next.facilitator}</span>
                  </>
                )}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-text group-hover:text-endgame-gold group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </div>

          {/* Delay warning on next session if affected */}
          {next.delayMinutes && next.delayMinutes > 0 && (
            <div className="mt-2 text-[10px] text-amber-400 font-label flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3" />
              <span>Shifted +{next.delayMinutes}m from planned time</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
