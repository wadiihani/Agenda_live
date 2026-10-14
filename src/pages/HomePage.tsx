import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderOpen, ExternalLink, Camera } from 'lucide-react';
import { LiveBanner } from '../components/LiveBanner';
import { PinnedAnnouncementBanner } from '../components/PinnedAnnouncementBanner';
import { DayTabs } from '../components/DayTabs';
import { InlineDailyTimeline } from '../components/InlineDailyTimeline';
import { SessionDetailModal } from '../components/SessionDetailModal';
import { Session } from '../data/agenda';
import { useAgenda } from '../context/AgendaContext';
import { useConferenceLiveState } from '../hooks/useConferenceLiveState';

export const HomePage: React.FC = () => {
  const [activeModalSession, setActiveModalSession] = useState<Session | null>(null);
  const { agenda, selectedDayId, setSelectedDayId } = useAgenda();
  const liveState = useConferenceLiveState();
  const driveUrl = agenda?.meta?.mediaDriveUrl || 'https://drive.google.com/drive/folders/1rabat-co26-2-vault?usp=sharing';

  // Auto-select active conference day by default (Requirement 4)
  const [timelineDayId, setTimelineDayId] = useState<string>(() => {
    return liveState.activeDayId || selectedDayId || 'day1';
  });

  // Sync timelineDayId when conference day changes (e.g. simulated time travels across days)
  useEffect(() => {
    if (liveState.activeDayId) {
      setTimelineDayId(liveState.activeDayId);
    }
  }, [liveState.activeDayId]);

  const handleSelectDayTab = (dayId: string) => {
    setTimelineDayId(dayId);
    setSelectedDayId(dayId);
  };

  return (
    <div className="relative flex-1 flex flex-col justify-start items-center w-full min-h-[calc(100dvh-5rem)] select-none space-y-3.5 sm:space-y-4">
      {/* Cinematic Road to Endgame Ambient Glow Mesh */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] bg-gradient-to-tr from-stark-red/15 via-infinity-purple/15 to-endgame-gold/15 rounded-full blur-[100px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      {/* 1. CINEMATIC BRAND HERO (Clean & Non-Repetitive per Requirement 6) */}
      <div className="w-full text-center pt-0.5 pb-0.5">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center justify-center"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/[0.04] border border-white/10 mb-1 font-label">
            <span className="w-1.5 h-1.5 rounded-full bg-stark-red animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-off-white/90 font-bold">
              CONFERENCE COMMAND CENTER
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-endgame-gold" />
          </div>
          <div className="mt-0.5">
            <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tight leading-[0.9] text-metallic-gold filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)]">
              AVENGERS ASSEMBLE
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs text-muted-text/85 font-sans mt-1 max-w-sm mx-auto leading-tight">
            Different powers. Different perspectives. One team. One mission.
          </p>
        </motion.div>
      </div>

      {/* 2. PINNED LIVE SCHEDULE ANNOUNCEMENT (Requirement 5) */}
      <PinnedAnnouncementBanner />

      {/* 3. 4-STATE TIME-AWARE COMMAND CENTER (Happening Now / Up Next / Break / Day Complete) */}
      <div className="w-full max-w-xl mx-auto">
        <LiveBanner onSelectSession={(s) => setActiveModalSession(s)} />
      </div>

      {/* 4. 3-DAY SELECTOR TABS RELOCATED DIRECTLY ABOVE TIMELINE (Requirement 4) */}
      <div className="w-full max-w-xl mx-auto pt-2">
        <div className="flex items-center justify-between gap-2 mb-2 px-1 font-label">
          <span className="text-[11px] font-mono uppercase tracking-widest text-muted-text font-bold">
            CONFERENCE TIMELINE
          </span>
          {timelineDayId !== liveState.activeDayId && (
            <button
              onClick={() => handleSelectDayTab(liveState.activeDayId)}
              className="text-[10px] font-mono text-endgame-gold hover:underline flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Back to Active Day</span>
            </button>
          )}
        </div>

        {agenda?.days && (
          <DayTabs
            days={agenda.days}
            activeDayId={timelineDayId}
            onSelectDay={handleSelectDayTab}
          />
        )}
      </div>

      {/* 5. INLINE DAILY TIMELINE (Vertical Stepper, Parallel Tracks, Active Highlight, 1-Tap Star) */}
      <div className="w-full max-w-xl mx-auto">
        <InlineDailyTimeline
          dayId={timelineDayId}
          onSelectSession={(s) => setActiveModalSession(s)}
        />
      </div>

      {/* 6. PHOTO & VIDEO MEDIA VAULT (Repositioned BELOW Timeline per Requirement 5) */}
      {liveState.state !== 'POST_EVENT' && (
        <div className="w-full max-w-xl mx-auto p-3.5 sm:p-4 rounded-2xl glass-card border border-endgame-gold/30 bg-gradient-to-r from-endgame-gold/10 via-black/40 to-cosmic-blue/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-endgame-gold/20 border border-endgame-gold/40 flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5 text-endgame-gold" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-off-white uppercase tracking-wider font-label flex items-center gap-1.5">
                <span>Photo & Video Vault</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-endgame-gold/20 text-endgame-gold font-mono border border-endgame-gold/30">DRIVE</span>
              </div>
              <div className="text-[11px] text-muted-text font-sans mt-0.5">
                Drop plenary photos, roll-call clips & memories to Google Drive
              </div>
            </div>
          </div>

          {/* Clear, unified CTA buttons (Requirement 5) */}
          <div className="flex items-center gap-2 shrink-0 font-label">
            <Link
              to="/photos"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-off-white text-xs font-semibold transition-all active:scale-95"
              title="Live Photo Wall"
            >
              <Camera className="w-3.5 h-3.5 text-arc-blue" />
              <span>Photo Wall</span>
            </Link>
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-endgame-gold hover:bg-amber-400 text-charcoal-black font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm"
            >
              <span>Open Drive Vault</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Accessible Session Details Bottom Sheet Modal */}
      <SessionDetailModal
        session={activeModalSession}
        onClose={() => setActiveModalSession(null)}
      />
    </div>
  );
};

export default HomePage;
