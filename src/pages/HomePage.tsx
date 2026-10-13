import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Star, Bell, ChevronRight, MessageSquareHeart, FolderOpen, ExternalLink, Camera } from 'lucide-react';
import { LiveBanner } from '../components/LiveBanner';
import { SessionDetailModal } from '../components/SessionDetailModal';
import { Session } from '../data/agenda';
import { useAgenda } from '../context/AgendaContext';

export const HomePage: React.FC = () => {
  const [activeModalSession, setActiveModalSession] = useState<Session | null>(null);
  const { agenda, favorites } = useAgenda();
  const driveUrl = agenda?.meta?.mediaDriveUrl || 'https://drive.google.com/drive/folders/1rabat-co26-2-vault?usp=sharing';

  return (
    <div className="relative flex-1 flex flex-col justify-start items-center w-full min-h-[calc(100dvh-5rem)] select-none space-y-4 sm:space-y-6">
      {/* Cinematic Road to Endgame Ambient Glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] bg-gradient-to-tr from-stark-red/15 via-infinity-purple/15 to-endgame-gold/15 rounded-full blur-[100px] pointer-events-none -z-10" 
        aria-hidden="true" 
      />

      {/* COMPACT CINEMATIC BRAND HERO (Optimized for small screens) */}
      <div className="w-full text-center pt-1 pb-1">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-label text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-muted-text mb-1"
        >
          {agenda?.meta?.entity || 'AIESEC IN RABAT'} · {agenda?.meta?.datesText?.toUpperCase() || 'OCTOBER 16–18, 2026'}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center"
        >
          <div className="font-display font-extrabold text-2xl sm:text-3xl text-off-white tracking-[0.08em] uppercase leading-none text-metallic-silver">
            RABAT CO 26.2
          </div>
          <div className="mt-1">
            <span className="font-display font-black text-4xl sm:text-6xl tracking-tight leading-[0.88] text-metallic-gold filter drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)]">
              AVENGERS ASSEMBLE
            </span>
          </div>
        </motion.div>
      </div>

      {/* PRIMARY OPERATIONAL FOCUS: LIVE NOW & UP NEXT CARDS */}
      <div className="w-full max-w-xl mx-auto">
        <LiveBanner onSelectSession={(s) => setActiveModalSession(s)} />
      </div>

      {/* PHOTO & VIDEO MEDIA VAULT & DRIVE SUBMIT BANNER */}
      <div className="w-full max-w-xl mx-auto p-3.5 sm:p-4 rounded-2xl glass-card border border-endgame-gold/30 bg-gradient-to-r from-endgame-gold/10 via-black/40 to-cosmic-blue/10 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-endgame-gold/20 border border-endgame-gold/40 flex items-center justify-center shrink-0">
            <FolderOpen className="w-5 h-5 text-endgame-gold" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-off-white uppercase tracking-wider font-label truncate flex items-center gap-1.5">
              <span>Photo & Video Vault</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-endgame-gold/20 text-endgame-gold font-mono border border-endgame-gold/30">DRIVE</span>
            </div>
            <div className="text-[11px] text-muted-text truncate font-sans">
              Drop plenary photos, roll-call clips & memories to Google Drive
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 font-label">
          <Link
            to="/photos"
            className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-off-white transition-all active:scale-95"
            title="Live Photo Wall"
          >
            <Camera className="w-4 h-4 text-blue-300" />
          </Link>
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-endgame-gold hover:bg-amber-400 text-charcoal-black font-extrabold text-[11px] uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 shadow-sm"
          >
            <span>Drive</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* QUICK TACTICAL ACTION MATRIX */}
      <div className="w-full max-w-xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2 font-label">
        <Link
          to="/agenda"
          className="p-3 rounded-2xl glass-card hover:bg-white/[0.08] border border-white/10 flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
        >
          <div className="w-8 h-8 rounded-xl bg-stark-red/15 border border-stark-red/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Calendar className="w-4 h-4 text-stark-red" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-off-white">Full Agenda</span>
          <span className="text-[10px] text-muted-text">3-Day Timeline</span>
        </Link>

        <Link
          to="/my-agenda"
          className="p-3 rounded-2xl glass-card hover:bg-white/[0.08] border border-white/10 flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
        >
          <div className="w-8 h-8 rounded-xl bg-endgame-gold/15 border border-endgame-gold/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Star className="w-4 h-4 text-endgame-gold fill-endgame-gold/50" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-off-white">My Agenda</span>
          <span className="text-[10px] text-muted-text">{favorites.length} Saved</span>
        </Link>

        <Link
          to="/updates"
          className="p-3 rounded-2xl glass-card hover:bg-white/[0.08] border border-white/10 flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
        >
          <div className="w-8 h-8 rounded-xl bg-infinity-purple/20 border border-infinity-purple/35 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <Bell className="w-4 h-4 text-purple-300" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-off-white">Updates</span>
          <span className="text-[10px] text-muted-text">Live Changes</span>
        </Link>

        <Link
          to="/feedback"
          className="p-3 rounded-2xl glass-card hover:bg-white/[0.08] border border-white/10 flex flex-col items-center justify-center text-center transition-all active:scale-95 group"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <MessageSquareHeart className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-off-white">Debrief</span>
          <span className="text-[10px] text-muted-text">Rate Sessions</span>
        </Link>
      </div>

      {/* STORY ARC DAY SELECTORS */}
      <div className="w-full max-w-xl mx-auto p-4 rounded-2xl glass-card border border-white/8 space-y-2.5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-text font-semibold flex items-center justify-between">
          <span>CONFERENCE ARC & DAILY CHAPTERS</span>
          <span className="text-endgame-gold">RABAT 26.2</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-label">
          <Link
            to="/agenda?day=day1"
            className="p-2.5 rounded-xl bg-stark-red/10 hover:bg-stark-red/20 border border-stark-red/30 flex items-center justify-between transition-all active:scale-95 group"
          >
            <div>
              <div className="text-[10px] font-mono font-bold text-stark-red uppercase">DAY 1 · FRI OCT 16</div>
              <div className="font-display font-bold text-sm text-off-white uppercase">Civil War</div>
            </div>
            <ChevronRight className="w-4 h-4 text-stark-red group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/agenda?day=day2"
            className="p-2.5 rounded-xl bg-infinity-purple/10 hover:bg-infinity-purple/20 border border-infinity-purple/30 flex items-center justify-between transition-all active:scale-95 group"
          >
            <div>
              <div className="text-[10px] font-mono font-bold text-purple-300 uppercase">DAY 2 · SAT OCT 17</div>
              <div className="font-display font-bold text-sm text-off-white uppercase">Infinity War</div>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-300 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            to="/agenda?day=day3"
            className="p-2.5 rounded-xl bg-endgame-gold/10 hover:bg-endgame-gold/20 border border-endgame-gold/30 flex items-center justify-between transition-all active:scale-95 group"
          >
            <div>
              <div className="text-[10px] font-mono font-bold text-endgame-gold uppercase">DAY 3 · SUN OCT 18</div>
              <div className="font-display font-bold text-sm text-off-white uppercase">Endgame</div>
            </div>
            <ChevronRight className="w-4 h-4 text-endgame-gold group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Accessible Session Details Bottom Sheet */}
      <SessionDetailModal
        session={activeModalSession}
        onClose={() => setActiveModalSession(null)}
      />
    </div>
  );
};

export default HomePage;
