import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, AlertTriangle, Info, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'urgent' | 'normal' | 'info';
  createdAt: string;
  createdBy: string;
}

const DISMISSED_KEY = 'rabat_dismissed_announcements';

export const AnnouncementsBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(DISMISSED_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Fetch announcements periodically
  useEffect(() => {
    const fetchAnnouncements = () => {
      fetch('/api/announcements')
        .then((r) => r.json())
        .then((data) => {
          if (data.announcements) {
            setAnnouncements(data.announcements);
          }
        })
        .catch(() => {});
    };

    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  // Filter out dismissed announcements
  const visibleAnnouncements = announcements.filter((a) => !dismissed.has(a.id));

  if (visibleAnnouncements.length === 0) return null;

  const safeIndex = Math.min(currentIndex, visibleAnnouncements.length - 1);
  const current = visibleAnnouncements[safeIndex];

  const priorityConfig = {
    urgent: {
      icon: AlertTriangle,
      bg: 'bg-gradient-to-r from-stark-red/25 via-stark-red/15 to-transparent',
      border: 'border-stark-red/40',
      iconColor: 'text-stark-red',
      badge: 'bg-stark-red/20 text-stark-red border-stark-red/40',
      glow: 'shadow-[0_0_30px_rgba(183,28,28,0.15)]',
      pulse: true,
    },
    normal: {
      icon: Megaphone,
      bg: 'bg-gradient-to-r from-endgame-gold/15 via-endgame-gold/8 to-transparent',
      border: 'border-endgame-gold/30',
      iconColor: 'text-endgame-gold',
      badge: 'bg-endgame-gold/15 text-endgame-gold border-endgame-gold/30',
      glow: 'shadow-[0_0_20px_rgba(212,175,55,0.1)]',
      pulse: false,
    },
    info: {
      icon: Info,
      bg: 'bg-gradient-to-r from-arc-blue/15 via-arc-blue/8 to-transparent',
      border: 'border-arc-blue/30',
      iconColor: 'text-arc-blue',
      badge: 'bg-arc-blue/15 text-arc-blue border-arc-blue/30',
      glow: '',
      pulse: false,
    },
  };

  const config = priorityConfig[current.priority] || priorityConfig.normal;
  const Icon = config.icon;

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`relative rounded-2xl ${config.bg} ${config.glow} border ${config.border} backdrop-blur-xl overflow-hidden`}
      >
        <div className="px-4 py-3 sm:px-5 sm:py-3.5">
          <div className="flex items-start gap-3">
            {/* Icon + Pulse */}
            <div className="relative mt-0.5 shrink-0">
              <Icon className={`w-4.5 h-4.5 ${config.iconColor}`} />
              {config.pulse && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-stark-red animate-ping" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${config.badge} font-label`}>
                  {current.priority === 'urgent' ? '⚡ Urgent' : current.priority === 'info' ? 'ℹ Info' : '📣 Update'}
                </span>
                <span className="text-[10px] text-muted-text font-label">
                  {timeSince(current.createdAt)}
                </span>
              </div>

              {current.title && current.title !== 'Announcement' && (
                <h4 className="text-sm font-bold text-off-white tracking-wide font-display uppercase">
                  {current.title}
                </h4>
              )}
              <p className="text-xs sm:text-[13px] text-off-white/85 leading-relaxed mt-0.5">
                {current.message}
              </p>
            </div>

            {/* Navigation + Dismiss */}
            <div className="flex items-center gap-1 shrink-0">
              {visibleAnnouncements.length > 1 && (
                <div className="flex items-center gap-0.5 mr-1">
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + visibleAnnouncements.length) % visibleAnnouncements.length)}
                    className="p-1 rounded-full hover:bg-white/10 text-muted-text hover:text-off-white transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-muted-text font-label tabular-nums">
                    {safeIndex + 1}/{visibleAnnouncements.length}
                  </span>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % visibleAnnouncements.length)}
                    className="p-1 rounded-full hover:bg-white/10 text-muted-text hover:text-off-white transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setDismissed((prev) => {
                    const next = new Set([...prev, current.id]);
                    try {
                      localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(next)));
                    } catch {}
                    return next;
                  });
                  if (safeIndex >= visibleAnnouncements.length - 1) {
                    setCurrentIndex(0);
                  }
                }}
                className="p-1 rounded-full hover:bg-white/10 text-muted-text hover:text-off-white transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
