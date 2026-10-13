import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, AlertTriangle, CalendarPlus, ArrowRight } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { SessionCard } from '../components/SessionCard';
import { SessionDetailModal } from '../components/SessionDetailModal';
import { Session, DaySchedule } from '../data/agenda';

export const MyAgendaPage: React.FC = () => {
  const { agenda, favorites, favoriteAlerts, dismissAlert, selectedSession, setSelectedSession } = useAgenda();

  // Group favorited sessions by day
  const favoritedByDay = useMemo(() => {
    if (!agenda?.days) return [];
    const result: Array<{ day: DaySchedule; sessions: Session[] }> = [];

    for (const day of Object.values(agenda.days) as DaySchedule[]) {
      const daySaved = day.sessions.filter((s) => favorites.includes(s.id));
      if (daySaved.length > 0) {
        // Sort by effective start time if available
        const hasTimes = daySaved.some((s) => s.adjustedTime || s.time);
        if (hasTimes) {
          daySaved.sort((a, b) => {
            const tA = a.adjustedTime || a.time || '';
            const tB = b.adjustedTime || b.time || '';
            if (!tA && !tB) return 0;
            if (!tA) return 1;
            if (!tB) return -1;
            return tA.localeCompare(tB);
          });
        }
        result.push({ day, sessions: daySaved });
      }
    }

    return result;
  }, [agenda, favorites]);

  // Export full personal itinerary as combined .ics
  const handleExportAllFavoritesIcs = () => {
    if (favoritedByDay.length === 0) return;

    const events: string[] = [];

    for (const { day, sessions } of favoritedByDay) {
      const dateFormatted = day.date.replace(/-/g, '');
      for (const s of sessions) {
        const start = s.adjustedTime || s.time || '09:00';
        const [sH, sM] = start.split(':');
        const startStr = `${dateFormatted}T${(sH || '09').padStart(2, '0')}${(sM || '00').padStart(2, '0')}00`;

        const end = s.adjustedEndTime || s.endTime || '';
        let [eH, eM] = end.split(':');
        if (!eH) eH = String(parseInt(sH || '9', 10) + 1);
        const endStr = `${dateFormatted}T${String(eH).padStart(2, '0')}${(eM || '00').padStart(2, '0')}00`;

        events.push([
          'BEGIN:VEVENT',
          `UID:${s.id}-personal@aiesec.org`,
          `DTSTAMP:${dateFormatted}T000000Z`,
          `DTSTART;TZID=Africa/Casablanca:${startStr}`,
          `DTEND;TZID=Africa/Casablanca:${endStr}`,
          `SUMMARY:[Rabat CO 26.2] ${s.title}`,
          `DESCRIPTION:${s.essence || ''}\\nFacilitator: ${s.facilitator || ''}\\nRoom: ${s.room || 'Plenary'}`,
          `LOCATION:${s.room || 'Conference Center'}, Rabat, Morocco`,
          'STATUS:CONFIRMED',
          'END:VEVENT'
        ].join('\r\n'));
      }
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AIESEC in Rabat//Personal Itinerary//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...events,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'Rabat-CO-26-2-My-Itinerary.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-20 font-sans">
      {/* Header Banner */}
      <div className="rounded-2xl glass-card p-4 sm:p-5 border border-endgame-gold/30 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-endgame-gold/20 text-endgame-gold">
                <Star className="w-4 h-4 fill-current" />
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-endgame-gold font-bold">
                PERSONAL ITINERARY
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-off-white uppercase tracking-wide">
              My Saved Sessions
            </h2>
            <p className="text-xs text-muted-text mt-0.5">
              {favorites.length} session{favorites.length === 1 ? '' : 's'} bookmarked across Rabat CO 26.2.
            </p>
          </div>

          {favorites.length > 0 && (
            <button
              onClick={handleExportAllFavoritesIcs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-off-white font-label transition-all active:scale-95 shrink-0"
              title="Export all your saved sessions to your calendar"
            >
              <CalendarPlus className="w-4 h-4 text-endgame-gold" />
              <span className="hidden sm:inline">Export Calendar</span>
            </button>
          )}
        </div>
      </div>

      {/* ALERT SECTION FOR SCHEDULE CHANGES ON SAVED SESSIONS */}
      {favoriteAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ALERTS ON YOUR SAVED SESSIONS</span>
          </div>

          {favoriteAlerts.map((alert) => (
            <div
              key={alert.sessionId}
              className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start justify-between gap-3"
            >
              <div>
                <div className="font-bold text-amber-300 font-display text-sm uppercase">
                  {alert.sessionTitle}
                </div>
                <div className="mt-0.5 text-xs text-amber-200/90 leading-relaxed font-sans">
                  {alert.message}
                </div>
              </div>
              <button
                onClick={() => dismissAlert(alert.sessionId)}
                className="text-amber-400/70 hover:text-amber-300 font-mono text-[10px] uppercase font-bold shrink-0 mt-0.5"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SAVED SESSIONS TIMELINE */}
      {favoritedByDay.length > 0 ? (
        <div className="space-y-6">
          {favoritedByDay.map(({ day, sessions }) => (
            <div key={day.id} className="space-y-2.5">
              <div className="flex items-center justify-between px-1 font-label">
                <span className="text-xs font-extrabold uppercase tracking-widest text-off-white font-display">
                  DAY {day.dayNumber}: {day.codename} ({day.dayOfWeek})
                </span>
                <span className="text-[11px] text-muted-text">
                  {sessions.length} saved
                </span>
              </div>

              <div className="space-y-2.5">
                {sessions.map((session, idx) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    day={day}
                    isLive={session.status === 'live'}
                    index={idx}
                    onSelect={(s) => setSelectedSession(s)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 rounded-2xl glass-card border border-white/5 space-y-3">
          <div className="w-12 h-12 rounded-full bg-endgame-gold/15 border border-endgame-gold/30 mx-auto flex items-center justify-center">
            <Star className="w-6 h-6 text-endgame-gold" />
          </div>
          <h3 className="font-display font-bold text-lg sm:text-xl text-off-white uppercase">
            No Bookmarked Sessions Yet
          </h3>
          <p className="text-xs text-muted-text max-w-sm mx-auto leading-relaxed">
            Star the sessions you want to attend in the Agenda to construct your personalized conference companion.
          </p>
          <div className="pt-2">
            <Link
              to="/agenda"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-stark-red/20 via-infinity-purple/20 to-endgame-gold/20 hover:from-stark-red/30 hover:to-endgame-gold/30 border border-endgame-gold/40 text-xs font-bold uppercase tracking-wider text-off-white font-label transition-all active:scale-95"
            >
              <span>Explore Conference Agenda</span>
              <ArrowRight className="w-4 h-4 text-endgame-gold" />
            </Link>
          </div>
        </div>
      )}

      {/* Detail Bottom Sheet */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
};

export default MyAgendaPage;
