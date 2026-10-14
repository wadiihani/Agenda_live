import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Zap } from 'lucide-react';
import { useLiveSession } from '../hooks/useLiveSession';
import { useTimeSim } from '../context/TimeSimContext';
import { formatSessionTitle } from '../data/agenda';

export const DockedLiveBar: React.FC = () => {
  const { status, current, countdown } = useLiveSession();
  const { setIsSimModalOpen, simulatedTime } = useTimeSim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="w-full max-w-md mx-auto px-4 pointer-events-auto flex items-center gap-2 font-label"
    >
      <Link
        to="/agenda"
        className="group flex-1 flex items-center justify-between py-1.5 px-3.5 rounded-full bg-[#080B12]/95 hover:bg-[#121824] border border-white/10 hover:border-white/20 backdrop-blur-xl shadow-lg transition-all"
      >
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          {status === 'live' && current ? (
            <>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-stark-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-stark-red" />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-stark-red shrink-0">
                LIVE NOW
              </span>
              <span className="text-xs text-off-white font-medium truncate font-sans">
                {formatSessionTitle(current.title)}
              </span>
            </>
          ) : status === 'before' && countdown ? (
            <>
              <Clock className="w-3 h-3 text-endgame-gold shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-endgame-gold shrink-0">
                T-MINUS
              </span>
              <span className="text-xs text-off-white/90 font-mono truncate">
                {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
              </span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-endgame-gold shrink-0" />
              <span className="text-xs text-muted-text font-medium truncate">
                ASGARD'CO 26 · Oct 16–18, 2026
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-text group-hover:text-off-white shrink-0 transition-colors">
          <span className="uppercase tracking-wider">Agenda</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-endgame-gold" />
        </div>
      </Link>

      {/* Discreet Time Sim trigger button */}
      <button
        onClick={() => setIsSimModalOpen(true)}
        className="p-2 rounded-full bg-[#080B12]/95 hover:bg-[#121824] border border-white/10 hover:border-endgame-gold/40 backdrop-blur-xl shadow-lg text-muted-text hover:text-off-white transition-all shrink-0"
        title="Time Simulator"
        aria-label="Open Time Simulator"
      >
        <Zap className={`w-3.5 h-3.5 ${simulatedTime ? 'text-endgame-gold fill-endgame-gold' : ''}`} />
      </button>
    </motion.div>
  );
};
