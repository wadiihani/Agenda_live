import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ConferenceAgenda, AGENDA_DATA, Session, DaySchedule } from '../data/agenda';

export type SyncStatus = 'live' | 'reconnecting' | 'offline';

export interface FavoriteAlert {
  sessionId: string;
  sessionTitle: string;
  changeType: 'delay' | 'room' | 'status';
  message: string;
}

interface AgendaContextType {
  agenda: ConferenceAgenda;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  syncNow: () => Promise<void>;
  favorites: string[];
  toggleFavorite: (sessionId: string) => void;
  isFavorite: (sessionId: string) => boolean;
  favoriteAlerts: FavoriteAlert[];
  dismissAlert: (sessionId: string) => void;
  selectedDayId: string;
  setSelectedDayId: (dayId: string) => void;
  selectedSession: Session | null;
  setSelectedSession: (session: Session | null) => void;
  delayMinutes: number;
  setDelayMinutes: (mins: number) => void;
  manualActiveSessionId: string | null;
  setManualActiveSessionId: (id: string | null) => void;
  isDelayActive: boolean;
  applyDelay: (params: {
    dayId: string;
    sessionId: string;
    delayMinutes: number;
    propagate?: boolean;
    bufferCompression?: number;
    dryRun?: boolean;
    password?: string;
  }) => Promise<{ success: boolean; affectedSessions?: Session[]; error?: string }>;
  updateSessionStatus: (params: {
    dayId: string;
    sessionId: string;
    status: string;
    password?: string;
  }) => Promise<boolean>;
}

const AgendaContext = createContext<AgendaContextType | null>(null);

const CACHE_KEY = 'rabat_agenda_cache_v6';
const FAVORITES_KEY = 'rabat_agenda_favorites_v2';
const DISMISSED_ALERTS_KEY = 'rabat_dismissed_alerts_v2';
const DELAY_KEY = 'rabat_delay_minutes';
const MANUAL_ACTIVE_KEY = 'rabat_manual_active_session';

export const AgendaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initial agenda from local storage cache or fallback to AGENDA_DATA
  const [agenda, setAgenda] = useState<ConferenceAgenda>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Ensure cache matches official October 16-18 conference dates
        if (parsed?.agenda?.days?.day1?.date === '2026-10-16') {
          return parsed.agenda;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached agenda:', e);
    }
    return AGENDA_DATA;
  });

  // Global Delay & Manual Session Override
  const [delayMinutes, setDelayMinutesState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(DELAY_KEY);
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const setDelayMinutes = useCallback((mins: number) => {
    const safeMins = Math.max(0, mins || 0);
    setDelayMinutesState(safeMins);
    try {
      localStorage.setItem(DELAY_KEY, String(safeMins));
    } catch {}
  }, []);

  const [manualActiveSessionId, setManualActiveSessionIdState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(MANUAL_ACTIVE_KEY) || null;
    } catch {
      return null;
    }
  });

  const setManualActiveSessionId = useCallback((id: string | null) => {
    setManualActiveSessionIdState(id);
    try {
      if (id) {
        localStorage.setItem(MANUAL_ACTIVE_KEY, id);
      } else {
        localStorage.removeItem(MANUAL_ACTIVE_KEY);
      }
    } catch {}
  }, []);

  // Safe fallback to 'live' when online (prevents permanent RECONNECTING loop)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(navigator.onLine ? 'live' : 'offline');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.timestamp) return new Date(parsed.timestamp);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [selectedDayId, setSelectedDayId] = useState<string>('day1');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_ALERTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toggle favorite
  const toggleFavorite = useCallback((sessionId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(sessionId)
        ? prev.filter((id) => id !== sessionId)
        : [...prev, sessionId];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save favorites:', e);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (sessionId: string) => favorites.includes(sessionId),
    [favorites]
  );

  const dismissAlert = useCallback((sessionId: string) => {
    setDismissedAlerts((prev) => {
      const next = [...prev, sessionId];
      try {
        localStorage.setItem(DISMISSED_ALERTS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  // Fetch agenda from server with graceful local fallback
  const fetchAgenda = useCallback(async () => {
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    try {
      const res = await fetch('/api/agenda', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.agenda) {
          setAgenda(data.agenda);
          const now = new Date();
          setLastSyncedAt(now);
          setSyncStatus('live');
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ agenda: data.agenda, timestamp: now.toISOString() })
            );
          } catch (e) {
            console.warn('Storage quota exceeded for agenda cache', e);
          }
          return;
        }
      }
    } catch (err) {
      // In static preview, production or when API is idle, gracefully fall back to local schedule data
    }

    // Resolves the stuck RECONNECTING loop: delegate has valid schedule data
    if (!navigator.onLine) {
      setSyncStatus('offline');
    } else {
      setSyncStatus('live');
      setLastSyncedAt((prev) => prev || new Date());
    }
  }, []);

  // Apply delay via API
  const applyDelay = useCallback(
    async (params: {
      dayId: string;
      sessionId: string;
      delayMinutes: number;
      propagate?: boolean;
      bufferCompression?: number;
      dryRun?: boolean;
      password?: string;
    }) => {
      if (params.propagate && params.delayMinutes !== undefined) {
        setDelayMinutes(params.delayMinutes);
      }
      try {
        const res = await fetch('/api/agenda/delay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        const data = await res.json();
        if (data.success) {
          if (!params.dryRun && data.agenda) {
            setAgenda(data.agenda);
            setLastSyncedAt(new Date());
          }
          return { success: true, affectedSessions: data.affectedSessions };
        }
        return { success: false, error: data.error || 'Failed to apply delay' };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    },
    [setDelayMinutes]
  );

  // Update session status via API
  const updateSessionStatus = useCallback(
    async (params: {
      dayId: string;
      sessionId: string;
      status: string;
      password?: string;
    }) => {
      try {
        const res = await fetch('/api/agenda/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        const data = await res.json();
        if (data.success && data.agenda) {
          setAgenda(data.agenda);
          setLastSyncedAt(new Date());
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  // Online / offline listeners & polling
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus('live');
      fetchAgenda();
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchAgenda();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    fetchAgenda();

    // High reliability live polling interval (every 10s during conference)
    const interval = setInterval(fetchAgenda, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [fetchAgenda]);

  // Compute alerts for favorited sessions with confirmed delays or status changes
  const favoriteAlerts = useMemo(() => {
    if (!agenda?.days || favorites.length === 0) return [];
    const alerts: FavoriteAlert[] = [];

    for (const day of Object.values(agenda.days) as DaySchedule[]) {
      for (const session of day.sessions) {
        if (favorites.includes(session.id) && !dismissedAlerts.includes(session.id)) {
          if (session.delayMinutes && session.delayMinutes > 0) {
            alerts.push({
              sessionId: session.id,
              sessionTitle: session.title,
              changeType: 'delay',
              message: `Delayed by +${session.delayMinutes}m. Revised start: ${session.adjustedTime || session.time} (${session.room || 'Plenary'})`
            });
          } else if (session.status === 'cancelled') {
            alerts.push({
              sessionId: session.id,
              sessionTitle: session.title,
              changeType: 'status',
              message: `This session has been marked cancelled by Command.`
            });
          }
        }
      }
    }

    return alerts;
  }, [agenda, favorites, dismissedAlerts]);

  const isDelayActive = delayMinutes > 0;

  const value = useMemo(
    () => ({
      agenda,
      syncStatus,
      lastSyncedAt,
      syncNow: fetchAgenda,
      favorites,
      toggleFavorite,
      isFavorite,
      favoriteAlerts,
      dismissAlert,
      selectedDayId,
      setSelectedDayId,
      selectedSession,
      setSelectedSession,
      delayMinutes,
      setDelayMinutes,
      manualActiveSessionId,
      setManualActiveSessionId,
      isDelayActive,
      applyDelay,
      updateSessionStatus
    }),
    [
      agenda,
      syncStatus,
      lastSyncedAt,
      fetchAgenda,
      favorites,
      toggleFavorite,
      isFavorite,
      favoriteAlerts,
      dismissAlert,
      selectedDayId,
      selectedSession,
      delayMinutes,
      setDelayMinutes,
      manualActiveSessionId,
      setManualActiveSessionId,
      isDelayActive,
      applyDelay,
      updateSessionStatus
    ]
  );

  return <AgendaContext.Provider value={value}>{children}</AgendaContext.Provider>;
};

export const useAgenda = (): AgendaContextType => {
  const context = useContext(AgendaContext);
  if (!context) {
    throw new Error('useAgenda must be used within an AgendaProvider');
  }
  return context;
};
