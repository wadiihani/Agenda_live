import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  BellRing, 
  AlertTriangle, 
  Megaphone, 
  MapPin, 
  Clock, 
  Check, 
  CheckCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'urgent' | 'normal' | 'info';
  category?: 'general' | 'schedule_change' | 'urgent' | 'room_change' | 'cancellation';
  targetRoom?: string;
  targetTrack?: string;
  relatedSessionId?: string;
  createdAt: string;
  createdBy: string;
}

const READ_ANNOUNCEMENTS_KEY = 'rabat_read_announcements_v2';

export const UpdatesPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  // Read IDs set
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(READ_ANNOUNCEMENTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch announcements:', e);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 12000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(READ_ANNOUNCEMENTS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const markAllAsRead = () => {
    const allIds = announcements.map((a) => a.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(READ_ANNOUNCEMENTS_KEY, JSON.stringify(allIds));
    } catch {}
  };

  // Push notification permission request
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support web push notifications. Announcements remain fully accessible inside this Updates feed.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('Rabat CO 26.2 Notifications Active', {
          body: 'You will receive real-time alerts for session delays and room reassignments.',
          icon: '/favicon.ico'
        });
      }
    } catch (e) {
      console.warn('Notification permission error:', e);
    }
  };

  // Filter announcements
  const filteredAnnouncements = useMemo(() => {
    if (activeCategory === 'all') return announcements;
    return announcements.filter((a) => (a.category || 'general') === activeCategory);
  }, [announcements, activeCategory]);

  const unreadCount = announcements.filter((a) => !readIds.includes(a.id)).length;

  const timeAgo = (dateStr: string) => {
    const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const getCategoryConfig = (category?: string, priority?: string) => {
    if (category === 'schedule_change' || priority === 'urgent') {
      return {
        badge: 'bg-stark-red/20 text-stark-red border-stark-red/40',
        border: 'border-stark-red/40',
        bg: 'bg-stark-red/[0.04]',
        label: 'Schedule Change',
        icon: Clock,
        iconColor: 'text-stark-red'
      };
    }
    if (category === 'room_change') {
      return {
        badge: 'bg-arc-blue/20 text-blue-300 border-arc-blue/40',
        border: 'border-arc-blue/40',
        bg: 'bg-arc-blue/[0.04]',
        label: 'Room Change',
        icon: MapPin,
        iconColor: 'text-arc-blue'
      };
    }
    if (category === 'cancellation') {
      return {
        badge: 'bg-red-500/20 text-red-400 border-red-500/40',
        border: 'border-red-500/40',
        bg: 'bg-red-500/[0.04]',
        label: 'Cancellation',
        icon: AlertTriangle,
        iconColor: 'text-red-400'
      };
    }
    return {
      badge: 'bg-endgame-gold/15 text-endgame-gold border-endgame-gold/30',
      border: 'border-white/10',
      bg: 'bg-white/[0.02]',
      label: 'General Notice',
      icon: Megaphone,
      iconColor: 'text-endgame-gold'
    };
  };

  return (
    <div className="space-y-4 pb-20 font-sans">
      {/* Header Banner */}
      <div className="rounded-2xl glass-card p-4 sm:p-5 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-lg bg-infinity-purple/20 text-purple-300">
                <Bell className="w-4 h-4" />
              </span>
              <span className="font-mono text-xs uppercase tracking-widest text-purple-300 font-bold">
                COMMUNICATIONS COMMAND
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-off-white uppercase tracking-wide">
              Official Conference Updates
            </h2>
            <p className="text-xs text-muted-text mt-0.5">
              Live notifications, timetable shifts, and urgent operational dispatches.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-off-white font-label transition-all active:scale-95 shrink-0"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>Mark All Read ({unreadCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* WEB PUSH PERMISSION OPT-IN CARD */}
      {notificationPermission !== 'granted' && (
        <div className="p-3.5 rounded-2xl glass-card border border-endgame-gold/30 bg-gradient-to-r from-endgame-gold/10 via-infinity-purple/10 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-endgame-gold/20 text-endgame-gold shrink-0 mt-0.5">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-off-white uppercase tracking-wide">
                Enable Instant Conference Notifications
              </h4>
              <p className="text-xs text-muted-text mt-0.5 max-w-md leading-relaxed">
                Receive vibration alerts when sessions shift or rooms change during Rabat CO 26.2. On iOS, install to Home Screen first.
              </p>
            </div>
          </div>

          <button
            onClick={requestNotificationPermission}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-endgame-gold text-[#070A10] font-bold text-xs uppercase tracking-wider font-label shadow-sm hover:brightness-110 transition-all shrink-0 active:scale-95"
          >
            Enable Alerts
          </button>
        </div>
      )}

      {/* CATEGORY FILTER CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-label pb-1">
        {[
          { id: 'all', label: 'All Updates' },
          { id: 'schedule_change', label: 'Schedule Changes' },
          { id: 'room_change', label: 'Room Changes' },
          { id: 'urgent', label: 'Urgent' },
          { id: 'general', label: 'General' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border active:scale-95 ${
              activeCategory === cat.id
                ? 'bg-white/20 text-white border-white/40 shadow-sm'
                : 'bg-white/5 text-muted-text hover:text-off-white border-white/8'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ANNOUNCEMENTS FEED */}
      <div className="space-y-3 pt-1">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((ann, idx) => {
            const isRead = readIds.includes(ann.id);
            const conf = getCategoryConfig(ann.category, ann.priority);
            const Icon = conf.icon;

            return (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(0.25, idx * 0.02) }}
                onClick={() => markAsRead(ann.id)}
                className={`p-4 rounded-2xl glass-card border transition-all cursor-pointer ${conf.border} ${conf.bg} ${
                  isRead ? 'opacity-85' : 'shadow-[0_0_20px_rgba(255,255,255,0.04)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2 font-label">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${conf.badge}`}>
                      <Icon className={`w-3 h-3 ${conf.iconColor}`} />
                      <span>{conf.label}</span>
                    </span>

                    {ann.targetRoom && (
                      <span className="text-[10px] font-mono text-arc-blue px-2 py-0.5 rounded-full bg-arc-blue/15 border border-arc-blue/30">
                        {ann.targetRoom}
                      </span>
                    )}

                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-stark-red animate-pulse" title="Unread" />
                    )}
                  </div>

                  <span className="text-[10px] text-muted-text font-mono shrink-0 tabular-nums">
                    {timeAgo(ann.createdAt)}
                  </span>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-off-white uppercase tracking-wide leading-snug">
                  {ann.title}
                </h3>

                <p className="text-xs sm:text-sm text-off-white/90 leading-relaxed mt-1 font-sans">
                  {ann.message}
                </p>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] font-label text-muted-text">
                  <span>Issued by: {ann.createdBy || 'Command Center'}</span>
                  {!isRead ? (
                    <span className="text-endgame-gold font-semibold">Tap to mark read</span>
                  ) : (
                    <span className="text-muted-text/60 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      Read
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-16 px-4 rounded-2xl glass-card border border-white/5 space-y-2">
            <Megaphone className="w-8 h-8 mx-auto text-muted-text/40 mb-2" />
            <h4 className="text-sm font-semibold text-off-white">No announcements in this category</h4>
            <p className="text-xs text-muted-text max-w-xs mx-auto">
              Any official conference updates and delay notifications will be broadcast here in real time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatesPage;
