import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Sparkles } from 'lucide-react';
import { useTimeSim } from '../context/TimeSimContext';
import { useLiveSession } from '../hooks/useLiveSession';
import { useAdmin } from '../context/AdminContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { simulatedTime, setIsSimModalOpen } = useTimeSim();
  const { status } = useLiveSession();
  const { isAdmin, logoutAdmin } = useAdmin();

  const isLive = status === 'live';

  // Desktop navigation links - for admin show only admin tools
  const baseLinks = [
    { to: '/', label: 'Home' },
    { to: '/agenda', label: 'Agenda' },
    { to: '/feedback', label: 'Debrief' },
    { to: '/team', label: 'S.H.I.E.L.D.' },
    { to: '/photos', label: 'Photos' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Tool' },
    { to: '/attendees', label: 'Attendees' },
    { to: '/', label: 'Main Site' },
  ];

  const navLinks = isAdmin ? adminLinks : baseLinks;

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl transition-all ${
      isAdmin 
        ? 'bg-[#070A12]/85 border-b border-endgame-gold/30 shadow-[0_4px_24px_rgba(212,175,55,0.08)]' 
        : 'bg-background/80 border-b border-white/10'
    }`}>
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Link */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl p-0.5 shadow-glow-combo transition-transform group-hover:scale-105 bg-white/[0.06] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <img src="/asgard-logo.png" alt="ASGARD'CO 26" className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-display font-extrabold text-lg leading-tight tracking-wider text-off-white">
              <span>ASGARD'CO</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-sans font-bold border ${
                isAdmin 
                  ? 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/40' 
                  : 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/40'
              }`}>
                26
              </span>
            </div>
            <span className="text-[10px] tracking-widest text-muted-text font-semibold uppercase">
              {isAdmin ? 'ADMIN COMMAND CENTER' : 'AVENGERS ASSEMBLE'}
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                (link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to))
                  ? (isAdmin 
                      ? 'bg-endgame-gold/15 text-endgame-gold font-semibold shadow-sm border border-endgame-gold/30' 
                      : 'bg-white/10 text-off-white shadow-sm')
                  : 'text-muted-text hover:text-off-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action: Admin indicator & Time Sim & Live Status */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex items-center gap-1.5">
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-endgame-gold/15 border border-endgame-gold/35 text-[10px] font-mono font-bold tracking-wider text-endgame-gold uppercase hover:bg-endgame-gold/25 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-endgame-gold animate-pulse" />
                <span>ADMIN LVL 7</span>
              </Link>
              <button
                type="button"
                onClick={logoutAdmin}
                className="hidden sm:inline-flex items-center px-2 py-1 rounded-full bg-marvel-red/15 hover:bg-marvel-red/25 border border-marvel-red/30 text-[10px] font-bold uppercase tracking-wider text-marvel-red transition-all"
                title="Exit Admin Mode"
              >
                Exit
              </button>
            </div>
          )}

          {isLive && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-marvel-red/20 border border-marvel-red/40 text-[11px] font-bold tracking-wider text-marvel-red uppercase">
              <span className="w-2 h-2 rounded-full bg-marvel-red animate-pulse shadow-glow-red" />
              LIVE
            </div>
          )}

          <button
            onClick={() => setIsSimModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-surface-card hover:bg-surface-hover border border-white/10 hover:border-infinity-purple/50 text-off-white transition-all shadow-sm"
            title="Time Machine Simulator"
          >
            <Zap className={`w-3.5 h-3.5 ${simulatedTime ? 'text-infinity-purple-light fill-infinity-purple-light' : 'text-muted-text'}`} />
            <span className="hidden xs:inline">
              {simulatedTime ? 'Simulated' : 'Time Sim'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
