import { useConferenceLiveState, ConferenceLiveState, CountdownState, DualRoom, ConferenceState, EffectiveSession } from './useConferenceLiveState';
import { Session, DaySchedule } from '../data/agenda';

export type LiveStatus = 'before' | 'live' | 'between' | 'day_concluded' | 'after';
export type { CountdownState, DualRoom, ConferenceState, EffectiveSession };

export interface LiveSessionState {
  status: LiveStatus;
  state: ConferenceState;
  current: Session | null;
  next: Session | null;
  subsequentSession: Session | null;
  currentDay: DaySchedule | null;
  countdown: CountdownState | null;
  nextCountdown: CountdownState | null;
  breakCountdown: CountdownState | null;
  progressPercent: number;
  remainingMinutes: number;
  casablancaDateStr: string;
  casablancaTimeStr: string;
  delayMinutes: number;
  isDelayed: boolean;
  dualRoom: DualRoom | null;
  nextDualRoom: DualRoom | null;
  roomMovementCue: string | null;
  tomorrowFirstSession: Session | null;
  tomorrowBreakfastTime: string | null;
}

export function useLiveSession(): LiveSessionState & ConferenceLiveState {
  const confState = useConferenceLiveState();
  return {
    ...confState,
    current: confState.currentSession,
    next: confState.nextSession
  };
}

export default useLiveSession;
