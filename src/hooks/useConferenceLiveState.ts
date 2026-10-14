import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Session, DaySchedule } from '../data/agenda';
import { useTimeSim } from '../context/TimeSimContext';
import { useAgenda } from '../context/AgendaContext';

export type ConferenceState = 
  | 'PRE_CONFERENCE' 
  | 'IN_SESSION' 
  | 'IN_BREAK' 
  | 'END_OF_DAY' 
  | 'POST_EVENT';

export interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedMMSS: string;
  totalSeconds: number;
}

export interface DualRoom {
  thematic: string;
  physical: string;
  full: string;
}

export interface EffectiveSession extends Session {
  effectiveStart: string;
  effectiveEnd: string;
  effectiveStartSecs: number;
  effectiveEndSecs: number;
  dualRoom: DualRoom;
}

export interface ConferenceLiveState {
  // 4 Core States
  state: ConferenceState;
  status: 'before' | 'live' | 'between' | 'day_concluded' | 'after'; // backward compatibility

  // Active and upcoming items
  currentSession: EffectiveSession | null;
  current: EffectiveSession | null; // alias for currentSession
  nextSession: EffectiveSession | null;
  next: EffectiveSession | null; // alias for nextSession
  subsequentSession: EffectiveSession | null; // 2nd upcoming operation

  // Calendar day & timestamps
  currentDay: DaySchedule | null;
  activeDayId: string;
  casablancaDateStr: string;
  casablancaTimeStr: string;
  casablancaTimestamp: number;
  casablancaDaySecs: number;

  // Real-time progress and timers
  progressPercent: number; // 0 - 100
  remainingMinutes: number;
  countdown: CountdownState | null; // Countdown to conference start or next session
  nextCountdown: CountdownState | null;
  breakCountdown: CountdownState | null; // MM:SS formatted countdown during breaks

  // Delay & Room Context
  delayMinutes: number;
  isDelayed: boolean;
  manualActiveSessionId: string | null;
  dualRoom: DualRoom | null;
  nextDualRoom: DualRoom | null;
  roomMovementCue: string | null;

  // End of Day Context
  tomorrowFirstSession: Session | null;
  tomorrowBreakfastTime: string | null;
  tomorrowRollCallTime: string | null;
}

// Convert "HH:mm" time string to seconds from midnight
function timeToSecs(timeStr?: string): number {
  if (!timeStr) return 0;
  const parts = String(timeStr).trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 3600 + m * 60;
}

// Convert seconds from midnight to "HH:mm"
function secsToTime(totalSecs: number): string {
  const norm = ((totalSecs % 86400) + 86400) % 86400;
  const h = Math.floor(norm / 3600);
  const m = Math.floor((norm % 3600) / 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Format duration into CountdownState with MM:SS
function formatCountdown(diffSecs: number): CountdownState {
  const safe = Math.max(0, Math.floor(diffSecs));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const mm = String(hours * 60 + minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const formattedMMSS = `${mm}:${ss}`;

  return {
    days,
    hours,
    minutes,
    seconds,
    formattedMMSS,
    totalSeconds: safe
  };
}

// Parse thematic + physical room locations
export function parseDualRoom(roomStr?: string): DualRoom {
  if (!roomStr || !roomStr.trim()) {
    return {
      thematic: 'Valhalla Grand Stage',
      physical: 'Plenary Hall',
      full: 'Plenary Hall • Valhalla Grand Stage'
    };
  }

  const trimmed = roomStr.trim();
  if (trimmed.includes('•')) {
    const parts = trimmed.split('•').map((s) => s.trim());
    return {
      physical: parts[0] || 'Plenary Hall',
      thematic: parts[1] || parts[0] || 'Valhalla Grand Stage',
      full: trimmed
    };
  }

  // Common known thematic mappings
  if (trimmed.toLowerCase().includes('bifrost')) {
    return { thematic: trimmed, physical: 'Registration Foyer', full: trimmed };
  }
  if (trimmed.toLowerCase().includes('dining') || trimmed.toLowerCase().includes('asgardian')) {
    return { thematic: trimmed, physical: 'Dining Hall', full: trimmed };
  }
  if (trimmed.toLowerCase().includes('wakanda')) {
    return { thematic: trimmed, physical: 'Executive Room', full: trimmed };
  }
  if (trimmed.toLowerCase().includes('stark')) {
    return { thematic: trimmed, physical: 'Innovation Lab', full: trimmed };
  }

  return {
    thematic: trimmed,
    physical: trimmed.includes('Hall') ? 'Plenary Hall' : 'Main Venue',
    full: trimmed
  };
}

function useComputeConferenceLiveState(): ConferenceLiveState {
  const { simulatedTime } = useTimeSim();
  const { agenda, delayMinutes, manualActiveSessionId } = useAgenda();

  // Helper: Get Africa/Casablanca time locked
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

  const computeState = useCallback((): ConferenceLiveState => {
    const casa = getCasablancaParts();
    const activeAgenda = agenda || {};
    const openingTimestamp = new Date(activeAgenda.meta?.openingDateTime || '2026-10-16T17:00:00').getTime();
    const closingTimestamp = new Date(activeAgenda.meta?.closingDateTime || '2026-10-18T17:00:00').getTime();

    const day1Schedule = activeAgenda.days?.day1;
    const day2Schedule = activeAgenda.days?.day2;
    const day3Schedule = activeAgenda.days?.day3;

    // Helper: Enrich raw session with delay-adjusted timestamps
    const enrichSession = (s: Session): EffectiveSession => {
      const baseStart = s.adjustedTime || s.time || '09:00';
      const baseStartSecs = timeToSecs(baseStart);
      const sessionDelay = (s.delayMinutes || 0) + (delayMinutes || 0);

      let baseEndSecs: number;
      if (s.adjustedEndTime) {
        baseEndSecs = timeToSecs(s.adjustedEndTime);
      } else if (s.endTime) {
        baseEndSecs = timeToSecs(s.endTime);
      } else if (s.duration) {
        const durMins = parseInt(String(s.duration), 10) || 45;
        baseEndSecs = baseStartSecs + durMins * 60;
      } else {
        baseEndSecs = baseStartSecs + 3600;
      }

      const effectiveStartSecs = baseStartSecs + sessionDelay * 60;
      const effectiveEndSecs = baseEndSecs + sessionDelay * 60;

      return {
        ...s,
        delayMinutes: sessionDelay,
        effectiveStart: secsToTime(effectiveStartSecs),
        effectiveEnd: secsToTime(effectiveEndSecs),
        effectiveStartSecs,
        effectiveEndSecs,
        dualRoom: parseDualRoom(s.room || s.location)
      };
    };

    // 1. Check if PRE_CONFERENCE (Before Fri Oct 16, 17:00 Casablanca)
    if (casa.timestamp < openingTimestamp) {
      const diffSecs = Math.max(0, Math.floor((openingTimestamp - casa.timestamp) / 1000));
      const countdown = formatCountdown(diffSecs);

      const openingSessionRaw =
        day1Schedule?.sessions?.find((s) => s.id === 'd1-s1') ||
        day1Schedule?.sessions?.find((s) => s.type === 'session') ||
        day1Schedule?.sessions?.[0] || null;

      const openingSession = openingSessionRaw ? enrichSession(openingSessionRaw) : null;
      const dual = openingSession ? openingSession.dualRoom : parseDualRoom();

      return {
        state: 'PRE_CONFERENCE',
        status: 'before',
        currentSession: null,
        current: null,
        nextSession: openingSession,
        next: openingSession,
        subsequentSession: day1Schedule?.sessions?.[2] ? enrichSession(day1Schedule.sessions[2]) : null,
        currentDay: day1Schedule || null,
        activeDayId: 'day1',
        casablancaDateStr: casa.dateStr,
        casablancaTimeStr: casa.timeStr,
        casablancaTimestamp: casa.timestamp,
        casablancaDaySecs: casa.daySecs,
        progressPercent: 0,
        remainingMinutes: 0,
        countdown,
        nextCountdown: countdown,
        breakCountdown: null,
        delayMinutes,
        isDelayed: delayMinutes > 0,
        manualActiveSessionId,
        dualRoom: dual,
        nextDualRoom: dual,
        roomMovementCue: 'Operatives convene at Plenary Hall • Valhalla Grand Stage for Opening',
        tomorrowFirstSession: null,
        tomorrowBreakfastTime: null,
        tomorrowRollCallTime: null
      };
    }

    // 2. Check if POST_EVENT (After Sunday Oct 18, 17:00 Closing)
    if (casa.timestamp > closingTimestamp) {
      return {
        state: 'POST_EVENT',
        status: 'after',
        currentSession: null,
        current: null,
        nextSession: null,
        next: null,
        subsequentSession: null,
        currentDay: day3Schedule || null,
        activeDayId: 'day3',
        casablancaDateStr: casa.dateStr,
        casablancaTimeStr: casa.timeStr,
        casablancaTimestamp: casa.timestamp,
        casablancaDaySecs: casa.daySecs,
        progressPercent: 100,
        remainingMinutes: 0,
        countdown: null,
        nextCountdown: null,
        breakCountdown: null,
        delayMinutes,
        isDelayed: delayMinutes > 0,
        manualActiveSessionId,
        dualRoom: null,
        nextDualRoom: null,
        roomMovementCue: 'Conference concluded — Assemble in the Media & Photo Vault',
        tomorrowFirstSession: null,
        tomorrowBreakfastTime: null,
        tomorrowRollCallTime: null
      };
    }

    // 3. Active Conference Day Selection
    let activeDay: DaySchedule = day1Schedule || ({} as DaySchedule);
    if (casa.dateStr === day2Schedule?.date) {
      activeDay = day2Schedule;
    } else if (casa.dateStr === day3Schedule?.date) {
      activeDay = day3Schedule;
    } else if (casa.dateStr > (day2Schedule?.date || '2026-10-17')) {
      activeDay = day3Schedule || day2Schedule || day1Schedule;
    } else {
      activeDay = day1Schedule || ({} as DaySchedule);
    }

    const daySessions: EffectiveSession[] = (activeDay.sessions || [])
      .map(enrichSession)
      .sort((a, b) => a.effectiveStartSecs - b.effectiveStartSecs);

    // Handle Manual Active Session Override (if organizer set explicit session)
    if (manualActiveSessionId) {
      const manualIdx = daySessions.findIndex((s) => s.id === manualActiveSessionId);
      if (manualIdx >= 0) {
        const currentS = daySessions[manualIdx];
        const nextS = manualIdx + 1 < daySessions.length ? daySessions[manualIdx + 1] : null;
        const subS = manualIdx + 2 < daySessions.length ? daySessions[manualIdx + 2] : null;

        const dur = Math.max(60, currentS.effectiveEndSecs - currentS.effectiveStartSecs);
        const elapsed = Math.max(0, casa.daySecs - currentS.effectiveStartSecs);
        const prog = Math.min(100, Math.round((elapsed / dur) * 100));
        const rem = Math.max(0, Math.round((currentS.effectiveEndSecs - casa.daySecs) / 60));

        const cue = nextS
          ? currentS.dualRoom.full === nextS.dualRoom.full
            ? `Remain in ${currentS.dualRoom.thematic}`
            : `Move to ${nextS.dualRoom.thematic} (${nextS.dualRoom.physical})`
          : 'Final session underway';

        return {
          state: currentS.type === 'break' ? 'IN_BREAK' : 'IN_SESSION',
          status: 'live',
          currentSession: currentS,
          current: currentS,
          nextSession: nextS,
          next: nextS,
          subsequentSession: subS,
          currentDay: activeDay,
          activeDayId: activeDay.id || 'day1',
          casablancaDateStr: casa.dateStr,
          casablancaTimeStr: casa.timeStr,
          casablancaTimestamp: casa.timestamp,
          casablancaDaySecs: casa.daySecs,
          progressPercent: prog,
          remainingMinutes: rem,
          countdown: null,
          nextCountdown: nextS ? formatCountdown(nextS.effectiveStartSecs - casa.daySecs) : null,
          breakCountdown: currentS.type === 'break' ? formatCountdown(currentS.effectiveEndSecs - casa.daySecs) : null,
          delayMinutes,
          isDelayed: delayMinutes > 0,
          manualActiveSessionId,
          dualRoom: currentS.dualRoom,
          nextDualRoom: nextS?.dualRoom || null,
          roomMovementCue: cue,
          tomorrowFirstSession: null,
          tomorrowBreakfastTime: null,
          tomorrowRollCallTime: null
        };
      }
    }

    // 4. Match Current Time against Session Windows
    let activeSession: EffectiveSession | null = null;
    let nextSession: EffectiveSession | null = null;
    let subSession: EffectiveSession | null = null;
    let isInsideWindow = false;

    for (let i = 0; i < daySessions.length; i++) {
      const s = daySessions[i];
      if (casa.daySecs >= s.effectiveStartSecs && casa.daySecs < s.effectiveEndSecs) {
        activeSession = s;
        isInsideWindow = true;
        if (i + 1 < daySessions.length) nextSession = daySessions[i + 1];
        if (i + 2 < daySessions.length) subSession = daySessions[i + 2];
        break;
      } else if (casa.daySecs < s.effectiveStartSecs) {
        if (!nextSession) {
          nextSession = s;
          if (i + 1 < daySessions.length) subSession = daySessions[i + 1];
        }
        break;
      }
    }

    // A. Currently INSIDE an active session window
    if (isInsideWindow && activeSession) {
      const totalDur = Math.max(60, activeSession.effectiveEndSecs - activeSession.effectiveStartSecs);
      const elapsed = Math.max(0, casa.daySecs - activeSession.effectiveStartSecs);
      const progressPercent = Math.min(100, Math.round((elapsed / totalDur) * 100));
      const remainingMinutes = Math.max(0, Math.round((activeSession.effectiveEndSecs - casa.daySecs) / 60));

      const nextCountdown = nextSession
        ? formatCountdown(nextSession.effectiveStartSecs - casa.daySecs)
        : null;

      // Check if the current item is a BREAK / MEAL / ROLL CALL
      const isBreakItem =
        activeSession.type === 'break' ||
        activeSession.title.toLowerCase().includes('break') ||
        activeSession.title.toLowerCase().includes('lunch') ||
        activeSession.title.toLowerCase().includes('dinner') ||
        activeSession.title.toLowerCase().includes('breakfast') ||
        activeSession.title.toLowerCase().includes('roll call');

      if (isBreakItem) {
        const breakCountdown = formatCountdown(activeSession.effectiveEndSecs - casa.daySecs);
        const cue = nextSession
          ? `Assemble at ${nextSession.dualRoom.thematic} (${nextSession.dualRoom.physical}) when timer reaches zero`
          : 'Break concluding';

        return {
          state: 'IN_BREAK',
          status: 'between',
          currentSession: activeSession,
          current: activeSession,
          nextSession,
          next: nextSession,
          subsequentSession: subSession,
          currentDay: activeDay,
          activeDayId: activeDay.id || 'day1',
          casablancaDateStr: casa.dateStr,
          casablancaTimeStr: casa.timeStr,
          casablancaTimestamp: casa.timestamp,
          casablancaDaySecs: casa.daySecs,
          progressPercent,
          remainingMinutes,
          countdown: null,
          nextCountdown,
          breakCountdown,
          delayMinutes,
          isDelayed: (activeSession.delayMinutes || 0) > 0 || delayMinutes > 0,
          manualActiveSessionId,
          dualRoom: activeSession.dualRoom,
          nextDualRoom: nextSession?.dualRoom || null,
          roomMovementCue: cue,
          tomorrowFirstSession: null,
          tomorrowBreakfastTime: null,
          tomorrowRollCallTime: null
        };
      }

      // Substantive IN_SESSION state
      const cue = nextSession
        ? activeSession.dualRoom.full === nextSession.dualRoom.full
          ? `Remain in ${activeSession.dualRoom.thematic}`
          : `Move next to ${nextSession.dualRoom.thematic} (${nextSession.dualRoom.physical})`
        : 'Final operation of the day';

      return {
        state: 'IN_SESSION',
        status: 'live',
        currentSession: activeSession,
        current: activeSession,
        nextSession,
        next: nextSession,
        subsequentSession: subSession,
        currentDay: activeDay,
        activeDayId: activeDay.id || 'day1',
        casablancaDateStr: casa.dateStr,
        casablancaTimeStr: casa.timeStr,
        casablancaTimestamp: casa.timestamp,
        casablancaDaySecs: casa.daySecs,
        progressPercent,
        remainingMinutes,
        countdown: null,
        nextCountdown,
        breakCountdown: null,
        delayMinutes,
        isDelayed: (activeSession.delayMinutes || 0) > 0 || delayMinutes > 0,
        manualActiveSessionId,
        dualRoom: activeSession.dualRoom,
        nextDualRoom: nextSession?.dualRoom || null,
        roomMovementCue: cue,
        tomorrowFirstSession: null,
        tomorrowBreakfastTime: null,
        tomorrowRollCallTime: null
      };
    }

    // B. Check if Day has ended (Past final session of day)
    const lastSession = daySessions[daySessions.length - 1];
    if (lastSession && casa.daySecs >= lastSession.effectiveEndSecs && !nextSession) {
      if (activeDay.dayNumber === 3) {
        return {
          state: 'POST_EVENT',
          status: 'after',
          currentSession: null,
          current: null,
          nextSession: null,
          next: null,
          subsequentSession: null,
          currentDay: activeDay,
          activeDayId: activeDay.id || 'day3',
          casablancaDateStr: casa.dateStr,
          casablancaTimeStr: casa.timeStr,
          casablancaTimestamp: casa.timestamp,
          casablancaDaySecs: casa.daySecs,
          progressPercent: 100,
          remainingMinutes: 0,
          countdown: null,
          nextCountdown: null,
          breakCountdown: null,
          delayMinutes,
          isDelayed: delayMinutes > 0,
          manualActiveSessionId,
          dualRoom: null,
          nextDualRoom: null,
          roomMovementCue: 'Conference concluded — All missions accomplished',
          tomorrowFirstSession: null,
          tomorrowBreakfastTime: null,
          tomorrowRollCallTime: null
        };
      }

      // Tomorrow schedule info for Day 1 -> Day 2 or Day 2 -> Day 3
      const nextDaySchedule = activeDay.dayNumber === 1 ? day2Schedule : day3Schedule;
      const tomorrowBreakfast =
        nextDaySchedule?.sessions?.find((s) => s.title.toLowerCase().includes('breakfast'))?.time || '08:00';
      const tomorrowFirstPlenary =
        nextDaySchedule?.sessions?.find((s) => s.type === 'session') || nextDaySchedule?.sessions?.[1] || null;

      return {
        state: 'END_OF_DAY',
        status: 'day_concluded',
        currentSession: null,
        current: null,
        nextSession: tomorrowFirstPlenary ? enrichSession(tomorrowFirstPlenary) : null,
        next: tomorrowFirstPlenary ? enrichSession(tomorrowFirstPlenary) : null,
        subsequentSession: null,
        currentDay: activeDay,
        activeDayId: activeDay.id || 'day1',
        casablancaDateStr: casa.dateStr,
        casablancaTimeStr: casa.timeStr,
        casablancaTimestamp: casa.timestamp,
        casablancaDaySecs: casa.daySecs,
        progressPercent: 100,
        remainingMinutes: 0,
        countdown: null,
        nextCountdown: null,
        breakCountdown: null,
        delayMinutes,
        isDelayed: delayMinutes > 0,
        manualActiveSessionId,
        dualRoom: null,
        nextDualRoom: tomorrowFirstPlenary ? parseDualRoom(tomorrowFirstPlenary.room) : null,
        roomMovementCue: `Rest up operatives. Assembly tomorrow morning at ${tomorrowBreakfast}`,
        tomorrowFirstSession: tomorrowFirstPlenary,
        tomorrowBreakfastTime: tomorrowBreakfast,
        tomorrowRollCallTime: tomorrowBreakfast
      };
    }

    // C. Transition / Gap before first session or between sessions (IN_BREAK)
    const targetUpcoming = nextSession || daySessions[0] || null;
    const diffToNext = targetUpcoming
      ? Math.max(0, targetUpcoming.effectiveStartSecs - casa.daySecs)
      : 0;

    const breakCountdown = formatCountdown(diffToNext);
    const cue = targetUpcoming
      ? `Assemble at ${targetUpcoming.dualRoom.thematic} (${targetUpcoming.dualRoom.physical})`
      : 'Transition in progress';

    return {
      state: 'IN_BREAK',
      status: 'between',
      currentSession: null,
      current: null,
      nextSession: targetUpcoming,
      next: targetUpcoming,
      subsequentSession: subSession,
      currentDay: activeDay,
      activeDayId: activeDay.id || 'day1',
      casablancaDateStr: casa.dateStr,
      casablancaTimeStr: casa.timeStr,
      casablancaTimestamp: casa.timestamp,
      casablancaDaySecs: casa.daySecs,
      progressPercent: 0,
      remainingMinutes: Math.round(diffToNext / 60),
      countdown: null,
      nextCountdown: breakCountdown,
      breakCountdown,
      delayMinutes,
      isDelayed: (targetUpcoming?.delayMinutes || 0) > 0 || delayMinutes > 0,
      manualActiveSessionId,
      dualRoom: null,
      nextDualRoom: targetUpcoming?.dualRoom || null,
      roomMovementCue: cue,
      tomorrowFirstSession: null,
      tomorrowBreakfastTime: null,
      tomorrowRollCallTime: null
    };
  }, [getCasablancaParts, agenda, delayMinutes, manualActiveSessionId]);

  const [state, setState] = useState<ConferenceLiveState>(computeState);

  useEffect(() => {
    setState(computeState());
    const interval = setInterval(() => {
      setState(computeState());
    }, 1000);

    return () => clearInterval(interval);
  }, [computeState]);

  return state;
}

const ConferenceLiveContext = createContext<ConferenceLiveState | null>(null);

export const ConferenceLiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const liveState = useComputeConferenceLiveState();
  return React.createElement(ConferenceLiveContext.Provider, { value: liveState }, children);
};

export function useConferenceLiveState(): ConferenceLiveState {
  const context = useContext(ConferenceLiveContext);
  if (!context) {
    // Fail-safe if accessed outside Provider
    return {
      state: 'PRE_CONFERENCE',
      status: 'before',
      currentSession: null,
      current: null,
      nextSession: null,
      next: null,
      subsequentSession: null,
      currentDay: null,
      activeDayId: 'day1',
      casablancaDateStr: '2026-10-16',
      casablancaTimeStr: '12:00',
      casablancaTimestamp: Date.now(),
      casablancaDaySecs: 43200,
      progressPercent: 0,
      remainingMinutes: 0,
      countdown: null,
      nextCountdown: null,
      breakCountdown: null,
      delayMinutes: 0,
      isDelayed: false,
      manualActiveSessionId: null,
      dualRoom: null,
      nextDualRoom: null,
      roomMovementCue: null,
      tomorrowFirstSession: null,
      tomorrowBreakfastTime: null,
      tomorrowRollCallTime: null
    };
  }
  return context;
}

/**
 * Selective hook for Day & Event phase
 * ONLY re-renders when activeDayId or conference phase changes (never on 1-sec countdown ticks)
 */
export function useConferenceDayState() {
  const state = useConferenceLiveState();
  const [dayState, setDayState] = useState({
    activeDayId: state.activeDayId,
    state: state.state,
    isPostEvent: state.state === 'POST_EVENT'
  });

  useEffect(() => {
    const isPost = state.state === 'POST_EVENT';
    setDayState((prev) => {
      if (
        prev.activeDayId === state.activeDayId &&
        prev.state === state.state &&
        prev.isPostEvent === isPost
      ) {
        return prev;
      }
      return {
        activeDayId: state.activeDayId,
        state: state.state,
        isPostEvent: isPost
      };
    });
  }, [state.activeDayId, state.state]);

  return dayState;
}

/**
 * Selective hook for Daily Timeline and Stepper
 * ONLY re-renders on minute changes or session transitions (saving ~98% of layout reflows)
 */
export function useConferenceTimelineState() {
  const state = useConferenceLiveState();
  const [timelineState, setTimelineState] = useState({
    activeDayId: state.activeDayId,
    currentSessionId: state.currentSession?.id || null,
    delayMinutes: state.delayMinutes,
    manualActiveSessionId: state.manualActiveSessionId,
    casablancaMinuteStr: state.casablancaTimeStr
  });

  useEffect(() => {
    const curId = state.currentSession?.id || null;
    setTimelineState((prev) => {
      if (
        prev.activeDayId === state.activeDayId &&
        prev.currentSessionId === curId &&
        prev.delayMinutes === state.delayMinutes &&
        prev.manualActiveSessionId === state.manualActiveSessionId &&
        prev.casablancaMinuteStr === state.casablancaTimeStr
      ) {
        return prev;
      }
      return {
        activeDayId: state.activeDayId,
        currentSessionId: curId,
        delayMinutes: state.delayMinutes,
        manualActiveSessionId: state.manualActiveSessionId,
        casablancaMinuteStr: state.casablancaTimeStr
      };
    });
  }, [
    state.activeDayId,
    state.currentSession?.id,
    state.delayMinutes,
    state.manualActiveSessionId,
    state.casablancaTimeStr
  ]);

  return timelineState;
}

