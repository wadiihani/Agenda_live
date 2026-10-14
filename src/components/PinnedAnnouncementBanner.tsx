import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Megaphone, ArrowRight, X } from 'lucide-react';

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'urgent' | 'normal' | 'info';
  createdAt: string;
  createdBy?: string;
}

const PINNED_DISMISSED_KEY = 'rabat_pinned_dismissed_announcement_id';

export const PinnedAnnouncementBanner: React.FC = () => {
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/announcements', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.announcements) && data.announcements.length > 0) {
            // Find most recent urgent or normal announcement
            const sorted = [...data.announcements].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            const top = sorted[0];
            const dismissedId = localStorage.getItem(PINNED_DISMISSED_KEY);
            if (dismissedId !== top.id) {
              setLatestAnnouncement(top);
              setIsDismissed(false);
            }
          }
        }
      } catch {
        // In local/static mode, check if there's any cached notice or leave null
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (latestAnnouncement) {
      try {
        localStorage.setItem(PINNED_DISMISSED_KEY, latestAnnouncement.id);
      } catch {}
      setIsDismissed(true);
    }
  };

  if (!latestAnnouncement || isDismissed) return null;

  const isUrgent = latestAnnouncement.priority === 'urgent';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25 }}
        className={`w-full max-w-xl mx-auto rounded-xl p-2.5 sm:px-3 sm:py-2 border backdrop-blur-md flex items-center justify-between gap-2 shadow-md transition-all font-sans ${
          isUrgent
            ? 'bg-gradient-to-r from-stark-red/20 via-stark-red/10 to-black/40 border-stark-red/40 text-off-white shadow-[0_0_15px_rgba(183,28,28,0.2)]'
            : 'bg-gradient-to-r from-amber-950/30 via-amber-900/15 to-black/40 border-amber-500/35 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Pulsing indicator icon */}
          <div className="relative shrink-0">
            {isUrgent ? (
              <AlertTriangle className="w-4 h-4 text-stark-red animate-pulse" />
            ) : (
              <Megaphone className="w-4 h-4 text-amber-400" />
            )}
          </div>

          {/* Badge */}
          <span
            className={`text-[9px] font-bold font-mono uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 border ${
              isUrgent
                ? 'bg-stark-red/25 text-white border-stark-red/50'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {isUrgent ? 'URGENT' : 'UPDATE'}
          </span>

          {/* 1-line compact message */}
          <p className="text-xs text-off-white/90 truncate font-sans font-medium">
            <span className="font-bold mr-1">{latestAnnouncement.title}:</span>
            <span>{latestAnnouncement.message}</span>
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-1 shrink-0 font-label">
          <Link
            to="/updates"
            className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition-all active:scale-95 ${
              isUrgent
                ? 'text-stark-red hover:text-white hover:bg-stark-red/20'
                : 'text-endgame-gold hover:text-white hover:bg-endgame-gold/20'
            }`}
          >
            <span className="hidden xs:inline">View all updates</span>
            <span className="xs:hidden">Updates</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-muted-text hover:text-off-white transition-colors"
            title="Dismiss announcement banner"
            aria-label="Dismiss announcement banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PinnedAnnouncementBanner;
