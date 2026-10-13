import { useState, useEffect, useCallback } from 'react';
import { Session, DaySchedule } from '../data/agenda';
import { useTimeSim } from '../context/TimeSimContext';
import { useAgenda } from '../context/AgendaContext';

export type LiveStatus = 'before' | 'live' | 'between' | 'day_concluded' | 'after';

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface LiveSessionState {
  status: LiveStatus;
  current: Session | null;
  next: Session | null;
  currentDay: DaySchedule | null;
  countdown: CountdownState | null;
  nextCountdown: CountdownState | null;
  progressPercent: number; // 0 - 100 based on actual timestamps
  remainingMinutes: number;
  casablancaDateStr: string;
  casablancaTimeStr: string;
}

function timeToSecs(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60;
}

export function useLiveSession(): LiveSessionState {
  const { simulatedTime } = useTimeSim();
  const { agenda } = useAgenda();

  // Helper: Get Africa/Casablanca time representation
  const getCasablancaParts = useCallback(() => {
    const baseDate = simulatedTime ? new Date(simulatedTime) : new Date();

    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Casablanca',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const parts = formatter.formatToParts(baseDate);
    const map: Record<string, string> = {};
    parts.forEach((p) => {
      map[p.type] = p.value;
    });

    const dateStr = `${map.year}-${map.month}-${map.day}`;
    const timeStr = `${map.hour}:${map.minute}`;
    const secondsNum = parseInt(map.second, 10) || 0;
    const isoString = `${dateStr}T${timeStr}:${map.second}`;
    const timestamp = new Date(isoString).getTime();
    const daySecs = parseInt(map.hour, 10) * 3600 + parseInt(map.minute, 10) * 60 + secondsNum;

    return {
      dateStr,
      timeStr,
      timestamp,
      seconds: secondsNum,
      daySecs
    };
  }, [simulatedTime]);

  const computeState = useCallback((): LiveSessionState => {
    const casa = getCasablancaParts();
    const activeAgenda = agenda || {};
    const openingTimestamp = new Date(activeAgenda.meta?.openingDateTime || '2026-10-16T17:00:00').getTime();
    const closingTimestamp = new Date(activeAgenda.meta?.closingDateTime || '2026-10-18T17:00:00').getTime();

    // 1. Before conference opening (Fri Oct 16, 17:00)
    if (casa.timestamp < openingTimestamp) {
      const diffMs = Math.max(0, openingTimestamp - casa.timestamp);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / 1000 / 60) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      const openingSession = activeAgenda.days?.day1?.sessions?.find((s) => s.id === 'd1-s1') || 
        activeAgenda.days?.day1?.sessions?.[0] || null;

      return {
        status: 'before',
        current: null,
        next: openingSession,
        currentDay: activeAgenda.days?.day1 || null,
        countdown: { days, hours, minutes, seconds },
        nextCountdown: { days, hours, minutes, seconds },
        progressPercent: 0,
        remainingMinutes: 0,
        casablancaDateStr: casa.dateStr,
        casablancaTimeStr: casa.timeStr
      };
    }

    // 2. After conference closing (Sun Oct 18, ~17:00)
    if (casa.timestamp > closingTimestamp) {
      return {
        status: 'after',
        current: null,
        next: null,
        currentDay: activeAgenda.days?.day3 || null,
        countdown: null,
        nextCountdown: null,
        progressPercent: 100,
        remainingMinutes: 0,
        casablancaDateStr: casa.dateStr,
        casablancaTimeStr: casa.timeStr
      };
    }

    // 3. During conference: find active calendar day
    let activeDay: DaySchedule | null = null;
    if (activeAgenda.days) {
      for (const d of Object.values(activeAgenda.days) as DaySchedule[]) {
        if (d.date === casa.dateStr) {
          activeDay = d;
          break;
        }
      }
    }

    // If exact date not matched (e.g. testing in other days), default to closest day
    if (!activeDay && activeAgenda.days) {
      if (casa.dateStr < (activeAgenda.days.day1?.date || '2026-10-09')) {
        activeDay = activeAgenda.days.day1;
      } else if (casa.dateStr > (activeAgenda.days.day3?.date || '2026-10-11')) {
        activeDay = activeAgenda.days.day3;
      } else {
        activeDay = activeAgenda.days.day2 || activeAgenda.days.day1;
      }
    }

    if (activeDay && activeDay.sessions?.length) {
      // Sort sessions by effective start time (adjustedTime || time)
      const sortedSessions = [...activeDay.sessions].sort((a, b) => {
        const timeA = a.adjustedTime || a.time;
        const timeB = b.adjustedTime || b.time;
        return timeA.localeCompare(timeB);
      });

      let currentSession: Session | null = null;
      let nextSession: Session | null = null;
      let currentProgress = 0;
      let remainingM = 0;

      for (let i = 0; i < sortedSessions.length; i++) {
        const s = sortedSessions[i];
        const sStart = s.adjustedTime || s.time;
        const sStartSecs = timeToSecs(sStart);

        // Calculate end secs: either adjustedEndTime || endTime || (start + 60m)
        let sEndSecs: number;
        if (s.adjustedEndTime) {
          sEndSecs = timeToSecs(s.adjustedEndTime);
        } else if (s.endTime) {
          sEndSecs = timeToSecs(s.endTime);
        } else if (i < sortedSessions.length - 1) {
          sEndSecs = timeToSecs(sortedSessions[i + 1].adjustedTime || sortedSessions[i + 1].time);
        } else {
          sEndSecs = sStartSecs + 3600;
        }

        // Handle midnight crossover if any
        if (sEndSecs < sStartSecs) {
          sEndSecs += 86400;
        }

        const nowSecs = casa.daySecs < sStartSecs && sEndSecs > 86400 ? casa.daySecs + 86400 : casa.daySecs;

        if (nowSecs >= sStartSecs && nowSecs < sEndSecs) {
          // It is currently live!
          currentSession = s;
          const totalDur = Math.max(60, sEndSecs - sStartSecs);
          const elapsed = nowSecs - sStartSecs;
          currentProgress = Math.min(100, Math.max(0, Math.round((elapsed / totalDur) * 100)));
          remainingM = Math.max(0, Math.round((sEndSecs - nowSecs) / 60));

          // Next session is next in array
          if (i + 1 < sortedSessions.length) {
            nextSession = sortedSessions[i + 1];
          }
          break;
        } else if (nowSecs < sStartSecs) {
          // Upcoming session before current is active
          if (!nextSession) {
            nextSession = s;
          }
          break;
        }
      }

      // Calculate countdown to next session
      let nextCountdown: CountdownState | null = null;
      if (nextSession) {
        const nextStart = nextSession.adjustedTime || nextSession.time;
        const nextStartSecs = timeToSecs(nextStart);
        let diffSecs = nextStartSecs - casa.daySecs;
        if (diffSecs < 0) diffSecs += 86400; // if wrap-around
        const hours = Math.floor(diffSecs / 3600);
        const minutes = Math.floor((diffSecs % 3600) / 60);
        const seconds = diffSecs % 60;
        nextCountdown = { days: 0, hours, minutes, seconds };
      }

      if (currentSession) {
        return {
          status: 'live',
          current: currentSession,
          next: nextSession,
          currentDay: activeDay,
          countdown: null,
          nextCountdown,
          progressPercent: currentProgress,
          remainingMinutes: remainingM,
          casablancaDateStr: casa.dateStr,
          casablancaTimeStr: casa.timeStr
        };
      }

      // Check if day is completed
      const lastSession = sortedSessions[sortedSessions.length - 1];
      const lastStart = lastSession.adjustedTime || lastSession.time;
      const lastStartSecs = timeToSecs(lastStart);
      const lastEndSecs = lastSession.adjustedEndTime ? timeToSecs(lastSession.adjustedEndTime) : lastStartSecs + 3600;

      if (casa.daySecs >= lastEndSecs && !nextSession) {
        return {
          status: 'day_concluded',
          current: null,
          next: null,
          currentDay: activeDay,
          countdown: null,
          nextCountdown: null,
          progressPercent: 100,
          remainingMinutes: 0,
          casablancaDateStr: casa.dateStr,
          casablancaTimeStr: casa.timeStr
        };
      }

      // Between sessions (before first session of day or during break gaps)
      return {
        status: 'between',
        current: null,
        next: nextSession || sortedSessions[0],
        currentDay: activeDay,
        countdown: null,
        nextCountdown,
        progressPercent: 0,
        remainingMinutes: 0,
        casablancaDateStr: casa.dateStr,
        casablancaTimeStr: casa.timeStr
      };
    }

    return {
      status: 'between',
      current: null,
      next: null,
      currentDay: null,
      countdown: null,
      nextCountdown: null,
      progressPercent: 0,
      remainingMinutes: 0,
      casablancaDateStr: casa.dateStr,
      casablancaTimeStr: casa.timeStr
    };
  }, [getCasablancaParts, agenda]);

  const [sessionState, setSessionState] = useState<LiveSessionState>(computeState);

  useEffect(() => {
    setSessionState(computeState());
    const interval = setInterval(() => {
      setSessionState(computeState());
    }, 1000);

    return () => clearInterval(interval);
  }, [computeState]);

  return sessionState;
}
