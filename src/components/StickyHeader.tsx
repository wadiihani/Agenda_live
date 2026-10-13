import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, WifiOff, Zap, Download } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { useTimeSim } from '../context/TimeSimContext';

export const StickyHeader: React.FC = () => {
  const { agenda, syncStatus, lastSyncedAt, syncNow, selectedDayId, setSelectedDayId } = useAgenda();
  const { setIsSimModalOpen, simulatedTime } = useTimeSim();
  const location = useLocation();
  const navigate = useNavigate();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Listen for PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install Rabat CO 26.2:\n• On iOS Safari: Tap Share → Add to Home Screen\n• On Android Chrome: Tap Menu (⋮) → Install app');
    }
  };

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await syncNow();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleDayClick = (dayId: string) => {
    setSelectedDayId(dayId);
    // If not on agenda or home, navigate to agenda with selected day
    if (location.pathname !== '/agenda' && location.pathname !== '/') {
      navigate(`/agenda?day=${dayId}`);
    } else if (location.pathname === '/agenda') {
      navigate(`/agenda?day=${dayId}`, { replace: true });
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Cached';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#070A10]/95 backdrop-blur-xl border-b border-white/8 transition-all">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-2.5 pb-2">
        {/* Top Tier: Brand Identity + Live Connection Badge + Utility Buttons */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Visual Mark */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group text-left transition-transform active:scale-95"
            aria-label="Go to Home"
          >
            {/* Asgardian & Avengers Geometric Crest */}
            <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-stark-red/25 via-infinity-purple/20 to-endgame-gold/30 border border-endgame-gold/40 flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.2)]">
              <span className="font-display font-black text-xs text-endgame-gold tracking-tighter">A</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-stark-red border border-[#070A10]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-display font-extrabold text-sm sm:text-base tracking-wider text-off-white uppercase">
                  RABAT CO 26.2
                </span>
                <span className="text-[10px] font-mono text-endgame-gold px-1 py-0.2 rounded bg-endgame-gold/10 border border-endgame-gold/25 font-bold hidden xs:inline">
                  LIVE
                </span>
              </div>
              <div className="text-[10px] text-muted-text/80 font-label tracking-wider flex items-center gap-1 mt-0.5">
                <span>{agenda?.meta?.datesText?.replace('October ', 'Oct ') || 'Oct 16–18'}</span>
                <span>•</span>
                <span className="text-off-white/70">AIESEC in Rabat</span>
              </div>
            </div>
          </button>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Truthful Connection & Sync Badge */}
            <button
              onClick={handleManualSync}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider transition-all border active:scale-95 ${
                syncStatus === 'live'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : syncStatus === 'reconnecting'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-red-950/60 text-red-300 border-red-500/40'
              }`}
              title={`Status: ${syncStatus.toUpperCase()} (Synced: ${formatLastSync(lastSyncedAt)}). Tap to sync now.`}
            >
              {syncStatus === 'live' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden xs:inline">LIVE SYNC</span>
                  <span className="xs:hidden">SYNC</span>
                </>
              ) : syncStatus === 'reconnecting' ? (
                <>
                  <RefreshCw className={`w-3 h-3 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>RECONNECTING</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-400" />
                  <span>OFFLINE</span>
                </>
              )}
            </button>

            {/* Time Simulator Trigger */}
            <button
              onClick={() => setIsSimModalOpen(true)}
              className={`p-1.5 rounded-full border text-xs transition-all active:scale-90 ${
                simulatedTime
                  ? 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/60 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                  : 'bg-white/5 text-muted-text hover:text-off-white border-white/10 hover:border-white/20'
              }`}
              title="Time Simulator — Travel through conference timeline"
              aria-label="Open Time Simulator"
            >
              <Zap className={`w-3.5 h-3.5 ${simulatedTime ? 'fill-endgame-gold' : ''}`} />
            </button>

            {/* PWA Install Trigger */}
            {!isInstalled && (
              <button
                onClick={handleInstallClick}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-endgame-gold/40 text-[10px] font-label font-semibold text-off-white transition-all active:scale-95"
                title="Install Rabat CO App on your phone"
              >
                <Download className="w-3 h-3 text-endgame-gold" />
                <span>Install</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Tier: Horizontally Scrollable Day Selector */}
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar font-label">
          {agenda?.days &&
            Object.values(agenda.days).map((day: any) => {
              const isSelected = selectedDayId === day.id;
              const isDay1 = day.dayNumber === 1;
              const isDay2 = day.dayNumber === 2;

              const activeStyles = isDay1
                ? 'bg-stark-red/20 text-white border-stark-red shadow-[0_0_12px_rgba(183,28,28,0.35)]'
                : isDay2
                ? 'bg-infinity-purple/25 text-white border-infinity-purple shadow-[0_0_12px_rgba(106,27,154,0.35)]'
                : 'bg-endgame-gold/25 text-white border-endgame-gold shadow-[0_0_12px_rgba(212,175,55,0.35)]';

              const dotColor = isDay1
                ? 'bg-stark-red'
                : isDay2
                ? 'bg-infinity-purple'
                : 'bg-endgame-gold';

              return (
                <button
                  key={day.id}
                  onClick={() => handleDayClick(day.id)}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-xs font-semibold transition-all select-none border active:scale-95 ${
                    isSelected
                      ? activeStyles
                      : 'bg-white/[0.03] text-muted-text hover:text-off-white border-white/5 hover:border-white/15'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                  <span className="font-display tracking-wider uppercase text-[11px] sm:text-xs">
                    DAY {day.dayNumber}: {day.codename}
                  </span>
                </button>
              );
            })}
        </div>
      </div>
    </header>
  );
};
