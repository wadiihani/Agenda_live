import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  MapPin, 
  User, 
  Star, 
  CalendarPlus, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  BookOpen,
  Share2,
  Target,
  Heart
} from 'lucide-react';
import { Session, formatSessionTitle } from '../data/agenda';
import { useAgenda } from '../context/AgendaContext';

interface SessionDetailModalProps {
  session: Session | null;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ session, onClose }) => {
  const { isFavorite, toggleFavorite, agenda } = useAgenda();

  // Escape key listener for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (session) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [session, onClose]);

  if (!session) return null;

  const favorited = isFavorite(session.id);
  const isDelayed = Boolean(session.delayMinutes && session.delayMinutes > 0);
  const effectiveStart = session.adjustedTime || session.time;
  const effectiveEnd = session.adjustedEndTime || session.endTime || '';

  // Export .ics calendar event
  const handleDownloadIcs = () => {
    // Find date for session
    let sessionDate = '2026-10-16';
    if (agenda?.days) {
      for (const d of Object.values(agenda.days) as any[]) {
        if (d.sessions?.some((s: Session) => s.id === session.id)) {
          sessionDate = d.date;
          break;
        }
      }
    }

    const dateFormatted = sessionDate.replace(/-/g, '');
    const startTimeVal = effectiveStart || '09:00';
    const [startH, startM] = startTimeVal.split(':');
    const startStr = `${dateFormatted}T${(startH || '09').padStart(2, '0')}${(startM || '00').padStart(2, '0')}00`;

    let [endH, endM] = (effectiveEnd || '10:00').split(':');
    if (!endH) endH = String(parseInt(startH || '9', 10) + 1);
    const endStr = `${dateFormatted}T${String(endH).padStart(2, '0')}${(endM || '00').padStart(2, '0')}00`;

    const title = `[Rabat CO 26.2] ${session.title}`;
    const description = `${session.essence || ''}\\nFacilitator: ${session.facilitator || 'AIESEC in Rabat'}\\nRoom: ${session.room || 'Plenary'}`;
    const location = `${session.room || 'Conference Center'}, Rabat, Morocco`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AIESEC in Rabat//Rabat CO 26.2//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${session.id}-rabatco@aiesec.org`,
      `DTSTAMP:${dateFormatted}T000000Z`,
      `DTSTART;TZID=Africa/Casablanca:${startStr}`,
      `DTEND;TZID=Africa/Casablanca:${endStr}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${session.id}-${session.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Rabat CO 26.2: ${session.title}`,
          text: `${session.title} at ${effectiveStart} (${session.room || 'Plenary'})`,
          url: window.location.href
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/agenda?session=${session.id}`);
      alert('Session link copied to clipboard!');
    }
  };

  const getStatusBadge = () => {
    switch (session.status) {
      case 'live':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            LIVE NOW
          </span>
        );
      case 'delayed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <AlertTriangle className="w-3.5 h-3.5" />
            DELAYED (+{session.delayMinutes}M)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-muted-text border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
            CANCELLED
          </span>
        );
      case 'starting-soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
            STARTING SOON
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-arc-blue/15 text-blue-300 border border-arc-blue/30">
            SCHEDULED
          </span>
        );
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-detail-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="relative w-full max-w-xl max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#090D18] border border-white/15 shadow-[0_-12px_60px_rgba(0,0,0,0.85)] text-off-white font-sans flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Asgardian Star Header Background Glow */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-endgame-gold/15 via-infinity-purple/10 to-transparent pointer-events-none" />

          {/* Drag Handle on Mobile */}
          <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mt-3 mb-1 sm:hidden" />

          {/* Header Bar */}
          <div className="relative px-5 pt-4 pb-3 flex items-start justify-between gap-3 border-b border-white/8">
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge()}

              {session.track && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-off-white border border-white/10 font-label">
                  {session.track === 'mms' ? 'MMs & Oldies' : session.track}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Favorite Action Button */}
              <button
                onClick={() => toggleFavorite(session.id)}
                className={`p-2 rounded-full border transition-all active:scale-90 ${
                  favorited
                    ? 'bg-endgame-gold text-[#070A10] border-endgame-gold shadow-[0_0_14px_rgba(212,175,55,0.6)]'
                    : 'bg-white/5 text-muted-text hover:text-endgame-gold border-white/10 hover:border-white/20'
                }`}
                title={favorited ? 'Remove from My Agenda' : 'Save to My Agenda'}
                aria-label="Toggle favorite"
              >
                <Star className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted-text hover:text-off-white border border-white/10 transition-colors active:scale-90"
                aria-label="Close session details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="px-5 py-4 space-y-4 overflow-y-auto">
            {/* Title */}
            <div>
              <h2 id="session-detail-title" className="font-display font-extrabold text-2xl sm:text-3xl text-off-white uppercase tracking-wide leading-tight">
                {formatSessionTitle(session.title)}
              </h2>
            </div>

            {/* Time & Location Information Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 font-label">
              {/* Time */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-muted-text">
                  <Clock className="w-4 h-4 text-endgame-gold shrink-0" />
                  <span>Time:</span>
                </div>
                <div className="text-right">
                  {effectiveStart ? (
                    <>
                      {isDelayed && (
                        <span className="line-through text-muted-text/70 mr-2 text-xs tabular-nums">
                          {session.time} {session.endTime ? `– ${session.endTime}` : ''}
                        </span>
                      )}
                      <span className={`font-bold tabular-nums ${isDelayed ? 'text-amber-400 font-extrabold' : 'text-off-white'}`}>
                        {effectiveStart} {effectiveEnd ? `– ${effectiveEnd}` : ''}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-text font-medium italic">
                      Official time TBA
                    </span>
                  )}
                </div>
              </div>

              {/* Confirmed Delay Notice */}
              {isDelayed && (
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    Schedule adjusted: <strong>+{session.delayMinutes} min delay</strong> confirmed by Command Center.
                  </span>
                </div>
              )}

              {/* Duration */}
              {session.duration && (
                <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 text-muted-text">
                    <Clock className="w-4 h-4 text-endgame-gold shrink-0" />
                    <span>Duration:</span>
                  </div>
                  <span className="font-semibold text-off-white text-right">
                    {session.duration}
                  </span>
                </div>
              )}

              {/* Room / Location */}
              {(session.room || session.location) && (
                <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 text-muted-text">
                    <MapPin className="w-4 h-4 text-arc-blue shrink-0" />
                    <span>Location:</span>
                  </div>
                  <span className="font-semibold text-off-white text-right">
                    {session.room || session.location}
                  </span>
                </div>
              )}

              {/* Facilitator / Responsible */}
              {(session.facilitator || session.responsible) && (
                <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 text-muted-text">
                    <User className="w-4 h-4 text-stark-red shrink-0" />
                    <span>Responsible / Lead:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-off-white">{session.facilitator || session.responsible}</span>
                    {session.badge && (
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stark-red/15 text-stark-red border border-stark-red/30">
                        {session.badge}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Description / Tactical Briefing */}
            {(session.description || session.essence) && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-text font-label mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-endgame-gold" />
                  <span>Session Description & Briefing</span>
                </h4>
                <p className="text-xs sm:text-sm text-off-white/90 leading-relaxed font-sans bg-black/30 p-3.5 rounded-2xl border border-white/5">
                  {session.description || session.essence}
                </p>
              </div>
            )}

            {/* Concrete Objective */}
            {session.concreteObjective && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-arc-blue font-label mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-arc-blue" />
                  <span>Concrete Objective</span>
                </h4>
                <div className="text-xs sm:text-sm text-off-white/95 leading-relaxed font-sans bg-arc-blue/10 p-3.5 rounded-2xl border border-arc-blue/30">
                  {session.concreteObjective}
                </div>
              </div>
            )}

            {/* Emotional Objective */}
            {session.emotionalObjective && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-purple-300 font-label mb-1.5 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-purple-400" />
                  <span>Emotional Objective</span>
                </h4>
                <div className="text-xs sm:text-sm text-off-white/95 leading-relaxed font-sans bg-infinity-purple/15 p-3.5 rounded-2xl border border-infinity-purple/35">
                  {session.emotionalObjective}
                </div>
              </div>
            )}

            {/* Learning Objectives */}
            {session.learningObjectives && session.learningObjectives.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-text font-label mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-arc-blue" />
                  <span>Mission Objectives & Takeaways</span>
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-off-white/90">
                  {session.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5 bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-endgame-gold mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources / Links */}
            {session.resources && session.resources.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-text font-label mb-2">
                  Mission Resources & Slides
                </h4>
                <div className="space-y-1.5">
                  {session.resources.map((res, i) => (
                    <a
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-off-white transition-all group"
                    >
                      <span className="group-hover:text-endgame-gold transition-colors">{res.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-muted-text group-hover:text-endgame-gold" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Bar */}
          <div className="p-4 border-t border-white/10 bg-[#060911]/90 flex items-center justify-between gap-3 font-label">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-off-white transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-muted-text" />
              <span>Share</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadIcs}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-stark-red/25 to-infinity-purple/25 hover:from-stark-red/35 hover:to-infinity-purple/35 border border-white/15 text-xs font-bold uppercase tracking-wider text-off-white transition-all active:scale-95 shadow-sm"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-endgame-gold" />
                <span>Add to Calendar</span>
              </button>

              <button
                onClick={() => toggleFavorite(session.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                  favorited
                    ? 'bg-endgame-gold text-[#070A10] font-black shadow-[0_0_16px_rgba(212,175,55,0.5)]'
                    : 'bg-white/10 hover:bg-white/15 border border-white/15 text-off-white'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
                <span>{favorited ? 'Saved in Agenda' : 'Save Session'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
