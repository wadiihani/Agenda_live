import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Radio, 
  Calendar, 
  Star, 
  Bell, 
  MoreHorizontal, 
  Camera, 
  Users, 
  ShieldAlert, 
  Shield, 
  MessageSquareHeart, 
  LogOut 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../context/AdminContext';
import { useAgenda } from '../context/AgendaContext';

export const BottomNav: React.FC = () => {
  const [showMore, setShowMore] = useState(false);
  const { isAdmin, logoutAdmin } = useAdmin();
  const { favorites } = useAgenda();
  const location = useLocation();

  // Announcement unread counter
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

  useEffect(() => {
    const checkUnread = async () => {
      try {
        const res = await fetch('/api/announcements');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.announcements)) {
            const saved = localStorage.getItem('rabat_read_announcements_v2');
            const readIds = saved ? JSON.parse(saved) : [];
            const unread = data.announcements.filter((a: any) => !readIds.includes(a.id)).length;
            setUnreadAnnouncements(unread);
          }
        }
      } catch {}
    };

    checkUnread();
    const interval = setInterval(checkUnread, 15000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // 4 Primary destinations per Master Prompt Section 5 E:
  const primaryNavItems = [
    { to: '/', label: 'Live', icon: Radio, exact: true },
    { to: '/agenda', label: 'Agenda', icon: Calendar },
    { 
      to: '/my-agenda', 
      label: 'My Agenda', 
      icon: Star, 
      badge: favorites.length > 0 ? favorites.length : null 
    },
    { 
      to: '/updates', 
      label: 'Updates', 
      icon: Bell, 
      badge: unreadAnnouncements > 0 ? unreadAnnouncements : null 
    },
  ];

  const moreMenuItems = [
    { to: '/feedback', label: 'Debrief Forms', icon: MessageSquareHeart },
    { to: '/photos', label: 'Photo Wall', icon: Camera },
    { to: '/attendees', label: 'Delegation Directory', icon: Users },
    { to: '/team', label: 'S.H.I.E.L.D. Committee', icon: Shield },
  ];

  return (
    <>
      {/* Admin Status Pill when logged in (Clean top or floating pill, non-overlapping) */}
      {isAdmin && (
        <div className="fixed top-14 right-3 z-40 pointer-events-auto">
          <NavLink
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#050810]/95 border border-endgame-gold/50 shadow-[0_0_16px_rgba(212,175,55,0.4)] text-[10px] font-mono font-bold tracking-wider text-endgame-gold uppercase backdrop-blur-xl transition-all active:scale-95"
            title="Open Admin Control Center"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-endgame-gold animate-pulse" />
            <span>COMMAND LVL 7</span>
          </NavLink>
        </div>
      )}

      {/* More Menu Backdrop */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />
        )}
      </AnimatePresence>

      {/* More Menu Drawer */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[76px] right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-50 w-64 rounded-3xl border border-white/12 bg-[#090D18]/95 shadow-[0_-8px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl font-label overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <div className="px-4 py-2.5 border-b border-white/8 bg-white/[0.02] flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-muted-text uppercase font-bold">
                TACTICAL SPACES
              </span>
              <span className="text-[10px] text-endgame-gold font-mono">Rabat CO 26.2</span>
            </div>

            <div className="p-1 space-y-0.5">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setShowMore(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all min-h-[44px] ${
                        isActive
                          ? 'text-endgame-gold bg-endgame-gold/15'
                          : 'text-muted-text hover:text-off-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-endgame-gold shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {isAdmin && (
                <>
                  <div className="my-1 border-t border-white/8" />
                  <NavLink
                    to="/admin"
                    onClick={() => setShowMore(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-endgame-gold bg-endgame-gold/10 hover:bg-endgame-gold/20 min-h-[44px]"
                  >
                    <ShieldAlert className="w-4 h-4 text-endgame-gold shrink-0" />
                    <span>Admin Control Center</span>
                  </NavLink>
                  <button
                    type="button"
                    onClick={() => {
                      logoutAdmin();
                      setShowMore(false);
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-stark-red hover:bg-stark-red/10 min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Exit Admin Mode</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Mobile Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-1 pointer-events-none"
        aria-label="Main Navigation"
      >
        <div className="relative max-w-sm sm:max-w-md mx-auto">
          <div className="flex items-center justify-around px-2 py-1 rounded-full backdrop-blur-2xl pointer-events-auto font-label border border-white/12 bg-[#080B14]/90 shadow-[0_12px_36px_rgba(0,0,0,0.75)] transition-all">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-xs font-semibold transition-all select-none active:scale-90 min-w-[52px] min-h-[46px] ${
                      isActive ? 'text-off-white' : 'text-muted-text hover:text-off-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="bottomNavGlowV2"
                          className="absolute inset-0 rounded-full -z-10 border bg-white/10 border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                          transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}

                      <div className="relative">
                        <Icon
                          className={`w-4.5 h-4.5 transition-transform duration-200 ${
                            isActive
                              ? 'scale-110 text-endgame-gold filter drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                              : 'opacity-75'
                          }`}
                        />
                        {/* Numerical Badge for Unread / Favorites */}
                        {item.badge !== null && item.badge !== undefined && (
                          <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-stark-red text-white text-[9px] font-mono font-bold flex items-center justify-center border border-[#080B14]">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[9px] uppercase tracking-wider mt-0.5 ${
                          isActive ? 'font-bold text-off-white' : 'font-medium'
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* More Menu Button */}
            <button
              onClick={() => setShowMore((prev) => !prev)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full text-xs font-semibold transition-all select-none active:scale-90 min-w-[52px] min-h-[46px] ${
                showMore ? 'text-off-white' : 'text-muted-text hover:text-off-white'
              }`}
              aria-label="Open More Menu"
            >
              {showMore && (
                <motion.div
                  layoutId="bottomNavGlowMoreV2"
                  className="absolute inset-0 rounded-full -z-10 border bg-white/10 border-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                />
              )}
              <MoreHorizontal
                className={`w-4.5 h-4.5 transition-transform duration-200 ${
                  showMore
                    ? 'scale-110 text-endgame-gold filter drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]'
                    : 'opacity-75'
                }`}
              />
              <span className={`text-[9px] uppercase tracking-wider mt-0.5 ${showMore ? 'font-bold text-off-white' : 'font-medium'}`}>
                More
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};
