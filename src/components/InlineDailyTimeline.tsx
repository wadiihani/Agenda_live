import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MapPin, 
  User, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  Utensils, 
  Coffee, 
  ChevronRight,
  Navigation
} from 'lucide-react';
import { Session, DaySchedule, formatSessionTitle } from '../data/agenda';
import { useAgenda } from '../context/AgendaContext';
import { useConferenceTimelineState, parseDualRoom } from '../hooks/useConferenceLiveState';

interface InlineDailyTimelineProps {
  dayId: string;
  onSelectSession: (session: Session) => void;
}

export const InlineDailyTimeline: React.FC<InlineDailyTimelineProps> = ({ dayId, onSelectSession }) => {
  const { agenda, favorites, toggleFavorite, isFavorite } = useAgenda();
  const { currentSessionId, activeDayId, delayMinutes, manualActiveSessionId, casablancaMinuteStr } = useConferenceTimelineState();

  const [activeTrack, setActiveTrack] = useState<string>('all');
  const [filterSavedOnly, setFilterSavedOnly] = useState(false);
  const activeSessionRef = useRef<HTMLDivElement | null>(null);

  const selectedDay: DaySchedule =
    agenda?.days?.[dayId as keyof typeof agenda.days] ||
    agenda?.days?.day1 ||
    ({ id: 'day1', dayNumber: 1, codename: 'Civil War', sessions: [] } as any);

  // Reset track filter if switched to day without splits
  useEffect(() => {
    if (dayId === 'day1') {
      setActiveTrack('all');
    }
  }, [dayId]);

  // Day theme accents
  const getTheme = (dayNumber: number) => {
    switch (dayNumber) {
      case 1:
        return {
          accentColor: 'text-stark-red',
          bgActive: 'bg-stark-red/10 border-stark-red/60 shadow-[0_0_20px_rgba(183,28,28,0.25)]',
          badge: 'bg-stark-red text-white',
          dot: 'bg-stark-red',
          borderAccent: 'border-stark-red/40',
          timelineLine: 'from-stark-red/40 via-stark-red/20 to-transparent'
        };
      case 2:
        return {
          accentColor: 'text-purple-300',
          bgActive: 'bg-infinity-purple/15 border-infinity-purple/60 shadow-[0_0_20px_rgba(106,27,154,0.25)]',
          badge: 'bg-infinity-purple text-white',
          dot: 'bg-infinity-purple',
          borderAccent: 'border-infinity-purple/40',
          timelineLine: 'from-infinity-purple/40 via-infinity-purple/20 to-transparent'
        };
      case 3:
      default:
        return {
          accentColor: 'text-endgame-gold',
          bgActive: 'bg-endgame-gold/15 border-endgame-gold/60 shadow-[0_0_20px_rgba(212,175,55,0.25)]',
          badge: 'bg-endgame-gold text-charcoal-black',
          dot: 'bg-endgame-gold',
          borderAccent: 'border-endgame-gold/40',
          timelineLine: 'from-endgame-gold/40 via-endgame-gold/20 to-transparent'
        };
    }
  };

  const theme = getTheme(selectedDay.dayNumber || 1);

  // Available tracks for this day
  const availableTracks = useMemo(() => {
    if (dayId === 'day0') {
      return [
        { id: 'all', label: 'All Operations' },
        { id: 'mms', label: 'MMs Calibration' },
        { id: 'newbies', label: 'New Members' }
      ];
    }
    if (dayId === 'lcm') {
      return [
        { id: 'all', label: 'All Parents & Members' }
      ];
    }
    if (selectedDay.dayNumber === 1) {
      return [{ id: 'all', label: 'All Membership' }];
    }
    if (selectedDay.dayNumber === 2) {
      return [
        { id: 'all', label: 'All Membership' },
        { id: 'newbies', label: 'Newbies' },
        { id: 'igv', label: 'iGV Members' }
      ];
    }
    return [
      { id: 'all', label: 'All Membership' },
      { id: 'newbies', label: 'Newbies' },
      { id: 'mms', label: 'MMs & Oldies' }
    ];
  }, [selectedDay.dayNumber, dayId]);

  // Determine if a session is currently live
  const isSessionLive = (s: Session): boolean => {
    if (manualActiveSessionId) {
      return manualActiveSessionId === s.id;
    }
    if (activeDayId !== dayId) return false;
    return currentSessionId === s.id;
  };

  // Determine if session is completed (minute-level precision to eliminate continuous rerenders)
  const isSessionCompleted = (s: Session): boolean => {
    if (s.status === 'completed') return true;
    if (activeDayId !== dayId) {
      // If we are on day 2 and viewing day 1, all day 1 sessions are completed
      const activeNum = activeDayId === 'day1' ? 1 : activeDayId === 'day2' ? 2 : 3;
      if (selectedDay.dayNumber < activeNum) return true;
      if (selectedDay.dayNumber > activeNum) return false;
    }
    // Same day: check end time vs casablanca time
    const endStr = s.adjustedEndTime || s.endTime;
    if (!endStr) return false;
    const [h, m] = endStr.split(':').map(Number);
    const endSecs = (h || 0) * 3600 + (m || 0) * 60 + (delayMinutes || 0) * 60;
    const [curH, curM] = (casablancaMinuteStr || '00:00').split(':').map(Number);
    const curSecs = (curH || 0) * 3600 + (curM || 0) * 60;
    return curSecs >= endSecs;
  };

  // Group parallel sessions by start time
  const timeSlotGroups = useMemo(() => {
    let list: Session[] = [...(selectedDay.sessions || [])];

    // Filter by track
    if (activeTrack !== 'all') {
      list = list.filter((s) => !s.track || s.track === 'all' || s.track === activeTrack);
    }

    // Filter by saved favorites
    if (filterSavedOnly) {
      list = list.filter((s) => favorites.includes(s.id));
    }

    // Sort chronologically by start time
    list.sort((a, b) => {
      const timeA = a.adjustedTime || a.time || '';
      const timeB = b.adjustedTime || b.time || '';
      return timeA.localeCompare(timeB);
    });

    // Group items that share the exact same start time
    const groups: { time: string; sessions: Session[] }[] = [];
    list.forEach((s) => {
      const t = s.adjustedTime || s.time || 'TBD';
      const existing = groups.find((g) => g.time === t);
      if (existing) {
        existing.sessions.push(s);
      } else {
        groups.push({ time: t, sessions: [s] });
      }
    });

    return groups;
  }, [selectedDay, activeTrack, filterSavedOnly, favorites]);

  // Jump to active session helper (manual only on user tap)
  const handleJumpToNow = () => {
    if (activeSessionRef.current) {
      activeSessionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="w-full space-y-3 font-sans select-none">
      {/* Track & Saved Filter Pills (Requirement 4) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar font-label pb-1">
        <div className="flex items-center gap-1.5 shrink-0">
          {availableTracks.map((trk) => {
            const isActive = activeTrack === trk.id && !filterSavedOnly;
            return (
              <button
                key={trk.id}
                onClick={() => {
                  setActiveTrack(trk.id);
                  setFilterSavedOnly(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border active:scale-95 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white/15 text-white border-white/40 shadow-sm'
                    : 'bg-white/[0.03] text-muted-text hover:text-off-white border-white/6 hover:border-white/15'
                }`}
              >
                <span>{trk.label}</span>
              </button>
            );
          })}

          {/* Saved Filter Pill */}
          <button
            onClick={() => setFilterSavedOnly(!filterSavedOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border active:scale-95 flex items-center gap-1.5 ${
              filterSavedOnly
                ? 'bg-endgame-gold/25 text-endgame-gold border-endgame-gold/60 shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                : 'bg-white/[0.03] text-muted-text hover:text-off-white border-white/6 hover:border-white/15'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterSavedOnly ? 'fill-endgame-gold text-endgame-gold' : 'text-muted-text'}`} />
            <span>Saved</span>
            {favorites.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-off-white font-mono">
                {favorites.length}
              </span>
            )}
          </button>
        </div>

        {/* Jump to Now Chip if viewing active day and live session underway */}
        {activeDayId === dayId && currentSessionId && (
          <button
            onClick={handleJumpToNow}
            className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
            title="Jump to the active live session"
          >
            <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Jump to Now</span>
          </button>
        )}
      </div>

      {/* Empty State if filter yields no sessions */}
      {timeSlotGroups.length === 0 && (
        <div className="p-6 rounded-2xl glass-card border border-white/8 text-center text-xs text-muted-text space-y-2">
          {activeTrack === 'mms' && selectedDay.dayNumber === 3 ? (
            <div className="max-w-sm mx-auto">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-endgame-gold/15 text-endgame-gold border border-endgame-gold/30 mb-2">
                MMs & Oldies Track · Schedule Pending
              </span>
              <p className="font-semibold text-off-white text-sm">Dedicated MMs & Oldies schedule not yet published</p>
              <p className="mt-1 leading-relaxed text-muted-text">
                Detailed specialized sessions for this track are awaiting official confirmation from conference organizers. Switch to <strong>All Membership</strong> to see shared plenaries and spaces.
              </p>
              <button
                type="button"
                onClick={() => setActiveTrack('all')}
                className="mt-3 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-off-white font-semibold text-xs transition-colors"
              >
                View All Membership Plenaries
              </button>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-off-white">No sessions match your active filter.</p>
              <p className="mt-1">Try switching to "All Tracks" or clearing the Saved filter.</p>
            </div>
          )}
        </div>
      )}

      {/* Chronological Vertical Stepper & Timeline */}
      <div className="relative pl-6 sm:pl-7 space-y-3 font-sans">
        {/* Continuous Stepper Line */}
        <div 
          className="absolute left-[11px] sm:left-[13px] top-2 bottom-3 w-[2px] bg-gradient-to-b from-white/20 via-white/10 to-transparent pointer-events-none" 
          aria-hidden="true" 
        />

        {timeSlotGroups.map((group, groupIdx) => {
          const isParallel = group.sessions.length > 1;

          return (
            <div key={`slot-${group.time}-${groupIdx}`} className="relative space-y-2">
              {/* Stepper Node Icon on timeline line */}
              <div 
                className="absolute -left-[19px] sm:-left-[21px] top-3 w-4 h-4 rounded-full bg-[#070A10] border-2 border-white/30 flex items-center justify-center z-10"
                aria-hidden="true"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
              </div>

              {/* Shared Time Slot Header */}
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-muted-text">
                <span className="text-off-white/90">{group.time}</span>
                {group.sessions[0].endTime && (
                  <span className="text-muted-text/60">
                    – {group.sessions[0].adjustedEndTime || group.sessions[0].endTime}
                  </span>
                )}
                {isParallel && (
                  <span className="px-1.5 py-0.2 rounded bg-infinity-purple/20 text-purple-300 text-[9px] font-mono border border-infinity-purple/30 uppercase">
                    Parallel Tracks ({group.sessions.length})
                  </span>
                )}
              </div>

              {/* Session Cards (Grid if parallel, or single) */}
              <div className={`grid gap-2 ${isParallel ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {group.sessions.map((session) => {
                  const isLive = isSessionLive(session);
                  const isCompleted = !isLive && isSessionCompleted(session);
                  const favorited = isFavorite(session.id);
                  const dual = parseDualRoom(session.room || session.location);
                  const isBreak = session.type === 'break';
                  const isMeal = session.title.toLowerCase().includes('lunch') || 
                                 session.title.toLowerCase().includes('dinner') || 
                                 session.title.toLowerCase().includes('breakfast');

                  // 1. COMPLETED SESSION ROW (Compact dimmed row per Requirement 4)
                  if (isCompleted) {
                    return (
                      <div
                        key={session.id}
                        onClick={() => onSelectSession(session)}
                        className="py-2 px-3 rounded-xl bg-white/[0.015] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 text-muted-text/75 transition-all cursor-pointer flex items-center justify-between gap-3 text-xs opacity-70 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500/70 shrink-0" />
                          <span className="line-through decoration-muted-text/40 truncate font-medium text-off-white/70 group-hover:text-off-white">
                            {formatSessionTitle(session.title)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 text-[10px] text-muted-text/60 font-mono">
                          {session.duration && <span>{session.duration}</span>}
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  }

                  // 2. ACTIVE LIVE SESSION CARD (Accent-highlighted card with 'Jump to Now' chip)
                  if (isLive) {
                    return (
                      <div
                        key={session.id}
                        ref={activeSessionRef}
                        onClick={() => onSelectSession(session)}
                        className={`p-3.5 sm:p-4 rounded-2xl glass-card border ${theme.bgActive} cursor-pointer transition-all active:scale-[0.99] relative overflow-hidden group`}
                      >
                        {/* Status Header */}
                        <div className="flex items-center justify-between gap-2 mb-1.5 font-label">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${theme.badge}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              NOW LIVE
                            </span>
                            {session.track && session.track !== 'all' && (
                              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/10 text-off-white">
                                {session.track.toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* 1-Tap Star Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(session.id);
                            }}
                            className="p-1 rounded-full hover:bg-white/10 transition-colors"
                            aria-label={favorited ? 'Remove saved session' : 'Save session'}
                          >
                            <Star className={`w-4 h-4 ${favorited ? 'fill-endgame-gold text-endgame-gold' : 'text-muted-text'}`} />
                          </button>
                        </div>

                        {/* Title & Essence */}
                        <h4 className="font-display font-black text-base sm:text-lg text-off-white uppercase tracking-wide group-hover:text-endgame-gold transition-colors">
                          {formatSessionTitle(session.title)}
                        </h4>
                        {session.essence && (
                          <p className="text-xs text-muted-text line-clamp-2 mt-0.5 leading-relaxed">
                            {session.essence}
                          </p>
                        )}

                        {/* Dual Room Badge & Facilitator */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs font-label text-muted-text">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-arc-blue shrink-0" />
                            <span className="text-off-white font-medium">{dual.thematic}</span>
                            <span className="text-muted-text/80 text-[11px]">({dual.physical})</span>
                          </div>

                          {session.facilitator && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-endgame-gold shrink-0" />
                              <span className="text-off-white">{session.facilitator}</span>
                            </div>
                          )}
                        </div>

                        {/* Delay notice if delayed */}
                        {session.delayMinutes && session.delayMinutes > 0 && (
                          <div className="mt-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Shifted +{session.delayMinutes}m from planned start</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // 3. UPCOMING SESSION CARD (Full card with 1-tap Star button)
                  return (
                    <div
                      key={session.id}
                      onClick={() => onSelectSession(session)}
                      className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/8 hover:border-white/20 transition-all cursor-pointer active:scale-[0.99] group flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Meta & Star Trigger */}
                        <div className="flex items-center justify-between gap-2 mb-1 text-[11px] font-label text-muted-text">
                          <div className="flex items-center gap-1.5">
                            {isBreak ? (
                              isMeal ? (
                                <Utensils className="w-3.5 h-3.5 text-endgame-gold shrink-0" />
                              ) : (
                                <Coffee className="w-3.5 h-3.5 text-stark-red shrink-0" />
                              )
                            ) : null}
                            <span className="font-mono font-bold text-off-white">
                              {session.adjustedTime || session.time}
                              {(session.adjustedEndTime || session.endTime) ? ` – ${session.adjustedEndTime || session.endTime}` : ''}
                            </span>
                            {session.duration && (session.adjustedEndTime || session.endTime) && (
                              <span className="text-muted-text/60">({session.duration})</span>
                            )}
                            {!(session.adjustedEndTime || session.endTime) && (
                              <span className="text-[10px] text-muted-text/70 italic">(End TBD)</span>
                            )}
                            {session.track && session.track !== 'all' && (
                              <span className="px-1.5 py-0.2 rounded bg-infinity-purple/20 text-purple-300 text-[9px] font-mono border border-infinity-purple/30 uppercase">
                                {session.track.toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* 1-Tap Star Button (Requirement 4) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(session.id);
                            }}
                            className="p-1 rounded-full hover:bg-white/10 transition-colors"
                            title={favorited ? 'Remove saved session' : 'Save session'}
                            aria-label={favorited ? 'Remove saved session' : 'Save session'}
                          >
                            <Star className={`w-4 h-4 ${favorited ? 'fill-endgame-gold text-endgame-gold' : 'text-muted-text hover:text-off-white'}`} />
                          </button>
                        </div>

                        {/* Title */}
                        <h4 className="font-display font-bold text-sm sm:text-base text-off-white uppercase tracking-wide group-hover:text-endgame-gold transition-colors leading-snug">
                          {formatSessionTitle(session.title)}
                        </h4>

                        {/* Essence Preview if available */}
                        {session.essence && (
                          <p className="text-xs text-muted-text/80 line-clamp-1 mt-0.5 leading-relaxed font-sans">
                            {session.essence}
                          </p>
                        )}
                      </div>

                      {/* Location & Speaker Footer */}
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-[11px] font-label text-muted-text">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 text-arc-blue shrink-0" />
                          <span className="text-off-white font-medium truncate">{dual.thematic}</span>
                          <span className="text-muted-text/70 truncate hidden xs:inline">({dual.physical})</span>
                        </div>

                        {session.facilitator && (
                          <span className="text-muted-text truncate shrink-0 max-w-[120px]">
                            {session.facilitator}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InlineDailyTimeline;
