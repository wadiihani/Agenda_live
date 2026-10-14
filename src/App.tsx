import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuroraBackground } from './components/AuroraBackground';
import { StickyHeader } from './components/StickyHeader';
import { BottomNav } from './components/BottomNav';
import { TimeSimModal } from './components/TimeSimModal';
import { OperativeAuthModal } from './components/OperativeAuthModal';
import { AnnouncementsBanner } from './components/AnnouncementsBanner';
import { MemberProvider } from './context/MemberContext';
import { AdminProvider } from './context/AdminContext';
import { AgendaProvider } from './context/AgendaContext';
import { ConferenceLiveProvider } from './hooks/useConferenceLiveState';
import { HomePage } from './pages/HomePage';
import { AgendaPage } from './pages/AgendaPage';
import { MyAgendaPage } from './pages/MyAgendaPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { TeamPage } from './pages/TeamPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { AdminPage } from './pages/AdminPage';
import { PhotoWallPage } from './pages/PhotoWallPage';
import { AttendeesPage } from './pages/AttendeesPage';

// Scroll to top helper on navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/live';

  return (
    <AdminProvider>
      <MemberProvider>
        <AgendaProvider>
          <ConferenceLiveProvider>
            <div className="relative min-h-[100dvh] flex flex-col bg-background text-off-white selection:bg-stark-red/40 selection:text-white overflow-x-hidden font-sans">
            {/* Subtle pure-CSS animated aurora gradient mesh */}
            <AuroraBackground />

            {/* Scroll restoration */}
            <ScrollToTop />

            {/* Global Sticky Header with Live Sync Status, Brand & Day Tabs */}
            <StickyHeader />

            {/* Global Announcements Banner (pinned below header) */}
            {!isHome && (
              <div className="relative z-20 max-w-3xl mx-auto w-full px-3 sm:px-4 pt-2">
                <AnnouncementsBanner />
              </div>
            )}

            {/* Main Content Area */}
            <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-3 sm:px-4 pt-3 pb-24 md:pb-20">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/live" element={<HomePage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/my-agenda" element={<MyAgendaPage />} />
                <Route path="/saved" element={<MyAgendaPage />} />
                <Route path="/updates" element={<UpdatesPage />} />
                <Route path="/announcements" element={<UpdatesPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/debrief" element={<FeedbackPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/intel" element={<AdminPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/photos" element={<PhotoWallPage />} />
                <Route path="/gallery" element={<PhotoWallPage />} />
                <Route path="/attendees" element={<AttendeesPage />} />
                <Route path="/network" element={<AttendeesPage />} />
                {/* Fallback */}
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>

            {/* Mobile Bottom Dock (4 primary destinations + more drawer) */}
            <BottomNav />

            {/* Operative Device Check-In / Auth Modal */}
            <OperativeAuthModal />

            {/* Interactive Time Simulator Modal */}
            <TimeSimModal />

            {/* Desktop Static Footer */}
            <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-muted-text hidden md:block">
              <div className="max-w-3xl mx-auto px-4 font-label">
                <p className="font-display font-bold tracking-wider text-off-white/90 uppercase text-sm">
                  AIESEC IN RABAT · RABAT CO 26.2
                </p>
                <p className="mt-1 text-[11px] text-muted-text/80">
                  October 16–18, 2026 · Rabat, Morocco
                </p>
                <p className="mt-1.5 text-gradient-marvel font-semibold font-display text-sm tracking-wider uppercase">
                  "Whatever it takes."
                </p>
              </div>
            </footer>
          </div>
        </ConferenceLiveProvider>
      </AgendaProvider>
      </MemberProvider>
    </AdminProvider>
  );
};

export default App;
