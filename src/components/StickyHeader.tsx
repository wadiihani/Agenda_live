import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, WifiOff, Zap, Download, X, Share, PlusSquare } from 'lucide-react';
import { useAgenda } from '../context/AgendaContext';
import { useTimeSim } from '../context/TimeSimContext';

export const StickyHeader: React.FC = () => {
  const { syncStatus, lastSyncedAt, syncNow, delayMinutes, isDelayActive } = useAgenda();
  const { setIsSimModalOpen, simulatedTime } = useTimeSim();
  const navigate = useNavigate();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Platform detection
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Standalone display mode check
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
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
      setShowInstallGuide(true);
    }
  };

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await syncNow();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Cached';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // 3 Confidence Badge States per requirement 2:
  // 1. OFFLINE • CACHED (when !navigator.onLine)
  // 2. LIVE • +[X]M DELAY (when schedule offset active)
  // 3. LIVE • ON TIME (when synced & on schedule)
  const renderConfidenceBadge = () => {
    if (!isOnline || syncStatus === 'offline') {
      return (
        <button
          onClick={handleManualSync}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider transition-all border active:scale-95 bg-red-950/60 text-red-300 border-red-500/40"
          title={`Status: OFFLINE • CACHED (Last seen: ${formatLastSync(lastSyncedAt)}). Tap to retry connection.`}
          aria-label="Offline Mode. Schedule served from local cache. Tap to retry connection."
        >
          <WifiOff className="w-3 h-3 text-red-400" />
          <span>OFFLINE • CACHED</span>
        </button>
      );
    }

    if (isDelayActive && delayMinutes > 0) {
      return (
        <button
          onClick={handleManualSync}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider transition-all border active:scale-95 bg-amber-950/70 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
          title={`Status: LIVE • +${delayMinutes}M DELAY (Synced: ${formatLastSync(lastSyncedAt)}). Tap to refresh schedule.`}
          aria-label={`Live schedule active with +${delayMinutes} minutes delay offset. Tap to sync.`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="tabular-nums">LIVE • +{delayMinutes}M DELAY</span>
          {isRefreshing && <RefreshCw className="w-3 h-3 text-amber-300 animate-spin ml-0.5" />}
        </button>
      );
    }

    return (
      <button
        onClick={handleManualSync}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold tracking-wider transition-all border active:scale-95 bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
        title={`Status: LIVE • ON TIME (Synced: ${formatLastSync(lastSyncedAt)}). Tap to sync schedule.`}
        aria-label="Live connection synced and on time. Tap to sync schedule now."
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="whitespace-nowrap font-bold">LIVE • ON TIME</span>
        {isRefreshing && <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin ml-0.5" />}
      </button>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-[#070A10]/95 backdrop-blur-xl border-b border-white/8 transition-all">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Brand Visual Mark & Single Concise Date String */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group text-left transition-transform active:scale-95"
              aria-label="ASGARD'CO 26 Home"
            >
              {/* Asgard'CO 26 Official Logo */}
              <div className="relative w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center p-0.5 shadow-[0_0_12px_rgba(212,175,55,0.25)] group-hover:border-endgame-gold/50 transition-all overflow-hidden shrink-0">
                <img
                  src="/asgard-logo.png"
                  alt="ASGARD'CO 26 Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-display font-extrabold text-sm sm:text-base tracking-wider text-off-white uppercase">
                    ASGARD'CO 26
                  </span>
                  <span className="text-[10px] text-muted-text/80 font-mono tracking-tight hidden sm:inline">
                    • Oct 16–18, 2026
                  </span>
                </div>
                <div className="text-[10px] text-muted-text/80 font-label tracking-wider flex items-center gap-1 mt-0.5 sm:hidden">
                  <span>Oct 16–18, 2026</span>
                </div>
              </div>
            </button>

            {/* Right Action Cluster: Confidence Badge + Time Machine + PWA Install */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Truthful Live Confidence Badge */}
              {renderConfidenceBadge()}

              {/* Time Simulator Trigger */}
              <button
                onClick={() => setIsSimModalOpen(true)}
                className={`p-1.5 rounded-full border text-xs transition-all active:scale-90 ${
                  simulatedTime
                    ? 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/60 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                    : 'bg-white/5 text-muted-text hover:text-off-white border-white/10 hover:border-white/20'
                }`}
                title="Time Machine Simulator — Travel through conference timeline & test states"
                aria-label="Open Time Machine Simulator"
              >
                <Zap className={`w-3.5 h-3.5 ${simulatedTime ? 'fill-endgame-gold text-endgame-gold' : ''}`} />
              </button>

              {/* Platform-Aware PWA Install Trigger (hidden when running in standalone mode) */}
              {!isInstalled && (
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-endgame-gold/40 text-[10px] font-label font-semibold text-off-white transition-all active:scale-95"
                  title="Install ASGARD'CO 26 App on your phone"
                  aria-label="Install ASGARD'CO 26 App"
                >
                  <Download className="w-3 h-3 text-endgame-gold" />
                  <span className="hidden xs:inline">Install</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Accessible iOS & Platform Install Instruction Popover Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
          <div className="w-full max-w-sm rounded-2xl glass-card border border-endgame-gold/40 p-5 shadow-2xl relative bg-[#080B12]/95 text-off-white">
            <div className="flex items-center justify-between mb-3 font-label">
              <div className="flex items-center gap-2 font-bold text-sm text-endgame-gold uppercase tracking-wider">
                <Download className="w-4 h-4 text-endgame-gold" />
                <span>Install Conference App</span>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-text hover:text-off-white transition-colors"
                aria-label="Close Install Guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-text mb-4 leading-relaxed">
              Install <strong>ASGARD'CO 26</strong> on your device for instant offline access and real-time live agenda tracking during the conference.
            </p>

            {isIOS ? (
              <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-sans">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-endgame-gold/15 border border-endgame-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Share className="w-3.5 h-3.5 text-endgame-gold" />
                  </div>
                  <div>
                    <span className="font-bold text-off-white">1. Tap the Share button</span>
                    <p className="text-[11px] text-muted-text mt-0.5">Located at the bottom of Safari.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-endgame-gold/15 border border-endgame-gold/30 flex items-center justify-center shrink-0 mt-0.5">
                    <PlusSquare className="w-3.5 h-3.5 text-endgame-gold" />
                  </div>
                  <div>
                    <span className="font-bold text-off-white">2. Select "Add to Home Screen"</span>
                    <p className="text-[11px] text-muted-text mt-0.5">Scroll down in the share sheet.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs text-emerald-400">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-off-white">3. Tap "Add" in the top right</span>
                    <p className="text-[11px] text-muted-text mt-0.5">Launch directly from your home screen.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                <p>1. Tap the browser menu (<strong>⋮</strong> in Chrome).</p>
                <p>2. Tap <strong>"Install App"</strong> or <strong>"Add to Home Screen"</strong>.</p>
                <p>3. Confirm to launch the app in full-screen standalone mode.</p>
              </div>
            )}

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-endgame-gold hover:bg-amber-400 text-charcoal-black font-extrabold text-xs uppercase tracking-wider font-label transition-all active:scale-95 shadow-sm"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StickyHeader;
