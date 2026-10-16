import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Filter, Star, Info } from 'lucide-react';
import { DaySchedule, Session, TrackType } from '../data/agenda';
import { SessionCard } from '../components/SessionCard';
import { SessionDetailModal } from '../components/SessionDetailModal';
import { DayTabs } from '../components/DayTabs';
import { useLiveSession } from '../hooks/useLiveSession';
import { useAgenda } from '../context/AgendaContext';

export const AgendaPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dayParam = searchParams.get('day');
  const sessionParam = searchParams.get('session');

  const { agenda, selectedDayId, setSelectedDayId, selectedSession, setSelectedSession, favorites } = useAgenda();
  const { status, current, currentDay } = useLiveSession();

  const [activeTrack, setActiveTrack] = useState<TrackType>('all');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync state if URL search param changes
  useEffect(() => {
    if (dayParam && agenda?.days && (agenda.days as any)[dayParam]) {
      setSelectedDayId(dayParam);
    }
  }, [dayParam, agenda, setSelectedDayId]);

  // Reset activeTrack to 'all' if track not applicable to current day
  useEffect(() => {
    if (selectedDayId === 'day1' && activeTrack !== 'all') {
      setActiveTrack('all');
    } else if (selectedDayId === 'day2' && activeTrack === 'mms') {
      setActiveTrack('all');
    } else if (selectedDayId === 'day3' && activeTrack === 'igv') {
      setActiveTrack('all');
    }
  }, [selectedDayId, activeTrack]);

  // Scroll to session if target sessionParam provided
  useEffect(() => {
    if (sessionParam) {
      setTimeout(() => {
        const el = document.getElementById(`session-${sessionParam}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [sessionParam, selectedDayId]);

  const activeDay: DaySchedule =
    agenda?.days?.[selectedDayId as keyof typeof agenda.days] ||
    agenda?.days?.day1 ||
    ({
      id: 'day1',
      dayNumber: 1,
      date: '2026-10-16',
      dayOfWeek: 'Friday',
      codename: 'Civil War',
      pillar: 'CONFLICT • CHOICES • LEADERSHIP',
      tagline: 'Facing the fractures & rebuilding trust',
      themeDesc: 'Facing the fractures, uncovering lost trust, and discovering what it truly means to assemble.',
      accent: 'red',
      track_split: false,
      sessions: []
    } as DaySchedule);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    let list: Session[] = [...(activeDay.sessions || [])];

    // Only sort by time if any sessions have times; otherwise preserve official sequence
    const hasTimes = list.some((s) => s.adjustedTime || s.time);
    if (hasTimes) {
      list.sort((a, b) => {
        const timeA = a.adjustedTime || a.time || '';
        const timeB = b.adjustedTime || b.time || '';
        if (!timeA && !timeB) return 0;
        if (!timeA) return 1;
        if (!timeB) return -1;
        return timeA.localeCompare(timeB);
      });
    }

    // Favorites only filter
    if (favoritesOnly) {
      list = list.filter((s) => favorites.includes(s.id));
    }

    // Track filter
    if (activeTrack !== 'all') {
      list = list.filter((s) => {
        // Specific track session must match activeTrack
        if (s.track && s.track !== 'all') {
          return s.track === activeTrack;
        }
        // Shared plenary, break, meal, or party session without track restriction
        return true;
      });
    }

    // Search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => {
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchEssence = (s.essence || s.description || '').toLowerCase().includes(q);
        const matchFacilitator = (s.facilitator || s.responsible || '').toLowerCase().includes(q);
        const matchRoom = (s.room || s.location || '').toLowerCase().includes(q);
        const matchConcrete = (s.concreteObjective || '').toLowerCase().includes(q);
        const matchEmotional = (s.emotionalObjective || '').toLowerCase().includes(q);
        const matchObjectives = s.learningObjectives?.some((obj) => obj.toLowerCase().includes(q));
        return matchTitle || matchEssence || matchFacilitator || matchRoom || matchConcrete || matchEmotional || matchObjectives;
      });
    }

    return list;
  }, [activeDay, favoritesOnly, activeTrack, searchQuery, favorites]);

  const liveSessionId =
    status === 'live' && currentDay?.id === activeDay.id && current
      ? current.id
      : null;

  // Day Theme Styles
  const getDayHeaderTheme = (dayNumber: number) => {
    switch (dayNumber) {
      case 1:
        return {
          badgeBg: 'bg-stark-red/15 text-stark-red border-stark-red/40',
          accentColor: 'text-stark-red',
          borderAccent: 'border-stark-red/30',
        };
      case 2:
        return {
          badgeBg: 'bg-infinity-purple/20 text-purple-300 border-infinity-purple/40',
          accentColor: 'text-purple-300',
          borderAccent: 'border-infinity-purple/30',
        };
      case 3:
      default:
        return {
          badgeBg: 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/40',
          accentColor: 'text-endgame-gold',
          borderAccent: 'border-endgame-gold/30',
        };
    }
  };

  const dayTheme = getDayHeaderTheme(activeDay.dayNumber);

  // Available tracks for current day
  const currentDayTracks: { id: TrackType; label: string; activeClass: string }[] = useMemo(() => {
    if (selectedDayId === 'day0') {
      return [
        {
          id: 'all',
          label: 'All Operations',
          activeClass: 'bg-white/20 text-white border-white/40 shadow-sm'
        },
        {
          id: 'mms',
          label: 'MMs Calibration',
          activeClass: 'bg-endgame-gold/30 text-endgame-gold border-endgame-gold/60 shadow-sm'
        },
        {
          id: 'newbies',
          label: 'New Members',
          activeClass: 'bg-stark-red/30 text-stark-red border-stark-red/60 shadow-sm'
        }
      ];
    }
    if (selectedDayId === 'lcm') {
      return [
        {
          id: 'all',
          label: 'All Parents & Members',
          activeClass: 'bg-arc-blue/30 text-arc-blue border-arc-blue/60 shadow-sm'
        }
      ];
    }
    if (activeDay.dayNumber === 1) {
      return [
        {
          id: 'all',
          label: 'All Membership',
          activeClass: 'bg-stark-red/30 text-stark-red border-stark-red/60 shadow-sm'
        }
      ];
    }
    if (activeDay.dayNumber === 2) {
      return [
        {
          id: 'all',
          label: 'All Membership',
          activeClass: 'bg-white/20 text-white border-white/40 shadow-sm'
        },
        {
          id: 'newbies',
          label: 'Newbies',
          activeClass: 'bg-infinity-purple/30 text-purple-300 border-infinity-purple shadow-sm'
        },
        {
          id: 'igv',
          label: 'iGV Members',
          activeClass: 'bg-arc-blue/30 text-arc-blue border-arc-blue shadow-sm'
        }
      ];
    }
    return [
      {
        id: 'all',
        label: 'All Membership',
        activeClass: 'bg-white/20 text-white border-white/40 shadow-sm'
      },
      {
        id: 'newbies',
        label: 'Newbies',
        activeClass: 'bg-infinity-purple/30 text-purple-300 border-infinity-purple shadow-sm'
      },
      {
        id: 'mms',
        label: 'MMs & Oldies',
        activeClass: 'bg-endgame-gold/30 text-endgame-gold border-endgame-gold shadow-sm'
      }
    ];
  }, [activeDay.dayNumber, selectedDayId]);

  return (
    <div className="space-y-4 pb-20 font-sans">
      {/* 3-Day Selector Tabs */}
      {agenda?.days && (
        <DayTabs
          days={agenda.days}
          activeDayId={selectedDayId}
          onSelectDay={(id) => {
            setSelectedDayId(id);
            setSearchParams({ day: id });
          }}
        />
      )}

      {/* Day Overview Tactical Card */}
      <div className="rounded-2xl glass-card p-4 sm:p-5 border border-white/10 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-label">
          <span className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full border ${dayTheme.badgeBg}`}>
            {activeDay.pillar}
          </span>
          <span className="text-xs text-muted-text font-medium">
            {activeDay.dayOfWeek}, {activeDay.date}
          </span>
        </div>

        <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-wide uppercase text-off-white">
          {activeDay.dayNumber > 0 && activeDay.dayNumber < 4 ? `DAY ${activeDay.dayNumber}: ` : ''}{activeDay.codename}
        </h2>

        {/* Daily Focus & Objective Badges */}
        {(activeDay.focus || activeDay.objective) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 font-label">
            {activeDay.focus && (
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-endgame-gold font-bold block mb-0.5">
                  MISSION FOCUS
                </span>
                <span className="font-semibold text-off-white/95">
                  {activeDay.focus}
                </span>
              </div>
            )}
            {activeDay.objective && (
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-arc-blue font-bold block mb-0.5">
                  CORE OBJECTIVE
                </span>
                <span className="font-semibold text-off-white/95">
                  {activeDay.objective}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="text-xs sm:text-sm text-muted-text mt-2.5 max-w-2xl leading-relaxed">
          {activeDay.themeDesc || activeDay.tagline}
        </p>

        {/* Live session jump shortcut */}
        {liveSessionId && (
          <div className="mt-3 pt-2.5 border-t border-white/8 flex items-center justify-between font-label">
            <span className="text-xs text-muted-text flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Live session underway now:</span>
            </span>
            <button
              onClick={() => {
                const el = document.getElementById(`session-${liveSessionId}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
            >
              <span>Jump to Live Session ↓</span>
            </button>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH BAR (Sticky on scroll) */}
      <div className="space-y-2 sticky top-[80px] z-20 bg-[#070A10]/95 backdrop-blur-xl py-2 px-1 border-b border-white/5">
        {/* Track & Favorites Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-label pb-1">
          {/* Day-specific Track Chips */}
          {currentDayTracks.map((trk) => {
            const isActive = activeTrack === trk.id;
            return (
              <button
                key={trk.id}
                onClick={() => setActiveTrack(trk.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border active:scale-95 ${
                  isActive
                    ? trk.activeClass
                    : 'bg-white/5 text-muted-text hover:text-off-white border-white/8'
                }`}
              >
                {trk.label}
              </button>
            );
          })}

          {/* Favorites Filter Chip */}
          <button
            onClick={() => setFavoritesOnly((prev) => !prev)}
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 active:scale-95 ${
              favoritesOnly
                ? 'bg-endgame-gold text-[#070A10] border-endgame-gold font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                : 'bg-white/5 text-muted-text hover:text-endgame-gold border-white/8'
            }`}
          >
            <Star className={`w-3 h-3 ${favoritesOnly ? 'fill-current' : ''}`} />
            <span>Saved ({favorites.length})</span>
          </button>

          {/* Clear Filters Button if any active */}
          {(activeTrack !== 'all' || favoritesOnly || searchQuery) && (
            <button
              onClick={() => {
                setActiveTrack('all');
                setFavoritesOnly(false);
                setSearchQuery('');
              }}
              className="px-2.5 py-1 rounded-full text-xs text-stark-red hover:underline whitespace-nowrap font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-text/80 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions, topics, tracks..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-surface-card border border-white/10 focus:border-endgame-gold/60 text-xs text-off-white placeholder:text-muted-text/60 outline-none transition-all shadow-sm font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-off-white p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Track Status Context Notices */}
      {activeDay.dayNumber === 2 && activeTrack === 'igv' && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-arc-blue/10 border border-arc-blue/30 text-xs text-arc-blue font-sans">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-arc-blue" />
          <div>
            <span className="font-bold">iGV Members Track:</span> Parallel session <strong>The Power of the Pitch</strong> confirmed. Remaining track sessions are unassigned in official schedule and pending confirmation.
          </div>
        </div>
      )}

      {activeDay.dayNumber === 3 && activeTrack === 'mms' && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-endgame-gold/10 border border-endgame-gold/30 text-xs text-endgame-gold font-sans">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-endgame-gold" />
          <div>
            <span className="font-bold">MMs & Oldies Track:</span> Shared plenaries and spaces displayed. Specialized parallel sessions for MMs & Oldies are pending official confirmation.
          </div>
        </div>
      )}

      {/* SESSIONS TIMELINE */}
      <div className="space-y-2.5 pt-1">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session, idx) => (
            <SessionCard
              key={session.id}
              session={session}
              day={activeDay}
              isLive={session.id === liveSessionId}
              index={idx}
              onSelect={(s) => setSelectedSession(s)}
            />
          ))
        ) : (
          <div className="text-center py-14 px-4 rounded-2xl glass-card border border-white/5">
            <Filter className="w-8 h-8 mx-auto text-muted-text/40 mb-2" />
            <h4 className="text-sm font-semibold text-off-white">No sessions match your filter</h4>
            <p className="text-xs text-muted-text mt-1 max-w-xs mx-auto">
              {favoritesOnly
                ? 'You have not favorited any sessions for this day yet. Tap the star icon on any session to save it.'
                : 'Try clearing your search query or switching tracks.'}
            </p>
            <button
              onClick={() => {
                setActiveTrack('all');
                setFavoritesOnly(false);
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-off-white font-label"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Accessible Session Details Bottom Sheet */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
};

export default AgendaPage;
