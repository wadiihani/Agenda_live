import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Search, 
  X, 
  User, 
  Clock, 
  Building2, 
  Wifi,
  Shield,
  Loader2,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  Unlock,
  Sparkles,
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useMember } from '../context/MemberContext';
import { useAdmin } from '../context/AdminContext';

interface Attendee {
  name: string;
  department?: string;
  role?: string;
  bio?: string;
  emoji?: string;
  ip?: string;
  registeredAt?: string;
  updatedAt?: string;
}

// Department-based Avengers color mapping
const DEPT_COLORS: Record<string, { color: string; bg: string; border: string; emoji: string }> = {
  'oGV': { color: 'text-stark-red', bg: 'bg-stark-red/10', border: 'border-stark-red/30', emoji: '🔴' },
  'oGT': { color: 'text-arc-blue', bg: 'bg-arc-blue/10', border: 'border-arc-blue/30', emoji: '🔵' },
  'iGV': { color: 'text-endgame-gold', bg: 'bg-endgame-gold/10', border: 'border-endgame-gold/30', emoji: '🟡' },
  'iGT': { color: 'text-infinity-purple', bg: 'bg-infinity-purple/10', border: 'border-infinity-purple/30', emoji: '🟣' },
  'BD': { color: 'text-energy-orange', bg: 'bg-energy-orange/10', border: 'border-energy-orange/30', emoji: '🟠' },
  'MKT': { color: 'text-cosmic-blue', bg: 'bg-cosmic-blue/10', border: 'border-cosmic-blue/30', emoji: '💙' },
  'FnL': { color: 'text-steel-grey', bg: 'bg-steel-grey/10', border: 'border-steel-grey/30', emoji: '⚙️' },
  'PM': { color: 'text-off-white', bg: 'bg-white/8', border: 'border-white/20', emoji: '👑' },
  'TM': { color: 'text-off-white', bg: 'bg-white/8', border: 'border-white/20', emoji: '🌟' },
  'default': { color: 'text-muted-text', bg: 'bg-white/5', border: 'border-white/10', emoji: '🦸' }
};

function getDeptStyle(dept: string) {
  if (!dept) return DEPT_COLORS['default'];
  const upper = dept.toUpperCase();
  for (const [key, val] of Object.entries(DEPT_COLORS)) {
    if (key !== 'default' && upper.includes(key.toUpperCase())) return val;
  }
  return DEPT_COLORS['default'];
}

// Generate initials avatar color from name
function getAvatarGradient(name: string): string {
  const colors = [
    'from-stark-red/60 to-stark-red/30',
    'from-infinity-purple/60 to-infinity-purple/30',
    'from-endgame-gold/60 to-endgame-gold/30',
    'from-arc-blue/60 to-arc-blue/30',
    'from-energy-orange/60 to-energy-orange/30',
    'from-cosmic-blue/60 to-cosmic-blue/30',
    'from-steel-grey/60 to-steel-grey/30',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const AttendeesPage: React.FC = () => {
  const { member } = useMember();
  const { isAdmin, loginAdmin } = useAdmin();

  // Admin gate state
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gateError, setGateError] = useState('');

  // Attendee state
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDept, setActiveDept] = useState<string>('all');

  // Fetch attendees only when admin
  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchAttendees = () => {
      fetch('/api/members')
        .then((r) => r.json())
        .then((data) => {
          if (data.members) setAttendees(data.members);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    fetchAttendees();
    const interval = setInterval(fetchAttendees, 20000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleGateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(passcode)) {
      setGateError('');
      setPasscode('');
    } else {
      setGateError('Access Denied: Invalid S.H.I.E.L.D. Passcode');
    }
  };

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set<string>();
    attendees.forEach((a) => {
      if (a.department) depts.add(a.department);
    });
    return Array.from(depts).sort();
  }, [attendees]);

  // Filter attendees
  const filteredAttendees = useMemo(() => {
    let filtered = [...attendees];

    if (activeDept !== 'all') {
      filtered = filtered.filter((a) => a.department === activeDept);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((a) => {
        const matchName = a.name.toLowerCase().includes(q);
        const matchDept = a.department?.toLowerCase().includes(q);
        const matchRole = a.role?.toLowerCase().includes(q);
        return matchName || matchDept || matchRole;
      });
    }

    // Sort: most recent first
    filtered.sort((a, b) => {
      const dateA = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
      const dateB = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
      return dateB - dateA;
    });

    return filtered;
  }, [attendees, activeDept, searchQuery]);

  const timeSince = (dateStr?: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just joined';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // --------------------------------------------------------------------------
  // ADMIN-ONLY SECURITY GATE
  // --------------------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md rounded-2xl glass-card border border-endgame-gold/25 p-6 sm:p-8 bg-[#080B12]/95 shadow-[0_16px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-center"
        >
          {/* Ambient Security Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-endgame-gold/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-stark-red/20 rounded-full blur-3xl pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-endgame-gold/25 to-stark-red/20 border border-endgame-gold/30 flex items-center justify-center mx-auto mb-4 text-endgame-gold shadow-[0_0_24px_rgba(212,175,55,0.25)]">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-endgame-gold/10 border border-endgame-gold/30 text-endgame-gold text-[10px] font-mono font-bold tracking-widest uppercase mb-3">
            <Sparkles className="w-3 h-3 animate-pulse" />
            <span>LEVEL 7 CLASSIFIED INTEL</span>
          </div>

          <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-wide text-off-white mb-2">
            RESTRICTED TO COMMAND
          </h3>

          <p className="text-xs text-muted-text mb-6 font-sans leading-relaxed">
            The full Conference Operatives Roster and check-in logs are restricted to S.H.I.E.L.D. administrators. Enter the command passcode to unlock.
          </p>

          <form onSubmit={handleGateSubmit} className="space-y-4 font-label text-left">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-text mb-1.5">
                Admin Security Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setGateError('');
                  }}
                  placeholder="Enter passcode"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-card border border-white/15 focus:border-endgame-gold text-sm text-off-white placeholder:text-muted-text/40 outline-none transition-all font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-off-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {gateError && (
              <div className="text-xs text-stark-red font-medium py-2 px-3 rounded-xl bg-stark-red/10 border border-stark-red/30 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{gateError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-endgame-gold/90 via-stark-red to-infinity-purple text-off-white font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Verify Command Clearance</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-text hover:text-off-white transition-colors font-label uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Headquarters</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ADMIN UNLOCKED: Operative Directory View
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="rounded-2xl glass-card p-5 sm:p-6 border border-endgame-gold/30 bg-gradient-to-br from-[#12131F]/90 via-[#0A0D15]/95 to-[#080B12]/95 relative overflow-hidden shadow-[0_8px_30px_rgba(212,175,55,0.1)]">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-endgame-gold/20 via-arc-blue/15 to-infinity-purple/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-endgame-gold/15 border border-endgame-gold/30 text-xs font-semibold text-endgame-gold mb-3 font-label">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="tracking-wider uppercase">ADMIN COMMAND ROSTER · LEVEL 7</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-wide text-off-white">
              OPERATIVES DOSSIER
            </h2>
            <p className="text-xs sm:text-sm text-muted-text mt-1.5 max-w-lg leading-relaxed">
              Confidential conference delegate directory. Review operative registrations, departments, and device sessions.
            </p>
          </div>

          {/* Admin Tag */}
          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-endgame-gold/15 border border-endgame-gold/35 text-endgame-gold font-mono text-xs font-bold uppercase tracking-wider shadow-sm font-label">
            <Shield className="w-4 h-4 text-endgame-gold" />
            <span className="hidden sm:inline">ADMIN ACTIVE</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/8">
          <div className="flex items-center gap-1.5 text-xs text-muted-text font-label">
            <User className="w-3.5 h-3.5 text-endgame-gold" />
            <span className="font-semibold text-off-white">{attendees.length}</span>
            <span>registered</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-text font-label">
            <Building2 className="w-3.5 h-3.5 text-arc-blue" />
            <span className="font-semibold text-off-white">{departments.length}</span>
            <span>departments</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-text font-label">
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Sync</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text/80 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, department, or role..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-card border border-white/10 focus:border-endgame-gold/40 text-sm text-off-white placeholder:text-muted-text/60 outline-none transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-off-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Department Filter Chips */}
        {departments.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 font-label">
            <button
              onClick={() => setActiveDept('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border transition-all active:scale-95 ${
                activeDept === 'all'
                  ? 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/45 shadow-sm'
                  : 'bg-surface-card text-muted-text border-white/10 hover:border-white/20 hover:text-off-white'
              }`}
            >
              All ({attendees.length})
            </button>
            {departments.map((dept) => {
              const style = getDeptStyle(dept);
              const count = attendees.filter((a) => a.department === dept).length;
              return (
                <button
                  key={dept}
                  onClick={() => setActiveDept(dept === activeDept ? 'all' : dept)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border transition-all active:scale-95 ${
                    activeDept === dept
                      ? `${style.bg} ${style.color} ${style.border} shadow-sm font-bold`
                      : 'bg-surface-card text-muted-text border-white/10 hover:border-white/20 hover:text-off-white'
                  }`}
                >
                  <span>{style.emoji}</span>
                  <span>{dept}</span>
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Attendee Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-text">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-endgame-gold" />
          <span className="text-xs font-label uppercase tracking-wider">Accessing classified database…</span>
        </div>
      ) : filteredAttendees.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl glass-card border border-white/5">
          <Users className="w-10 h-10 mx-auto text-muted-text/30 mb-3" />
          <h4 className="text-sm font-semibold text-off-white font-display uppercase tracking-wide">
            {searchQuery || activeDept !== 'all' ? 'No operatives match query' : 'No operatives registered yet'}
          </h4>
          <p className="text-xs text-muted-text mt-1">
            {searchQuery || activeDept !== 'all'
              ? 'Try modifying your filter or clear search terms.'
              : 'Operatives will appear once they check in.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredAttendees.map((attendee, idx) => {
            const style = getDeptStyle(attendee.department || '');
            const gradient = getAvatarGradient(attendee.name);
            const isYou = member?.name === attendee.name && member?.ip === attendee.ip;

            return (
              <motion.div
                key={`${attendee.name}-${attendee.ip}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                className={`rounded-2xl glass-card glass-card-hover border p-4 relative ${
                  isYou ? 'border-endgame-gold/40 ring-1 ring-endgame-gold/20' : 'border-white/8'
                }`}
              >
                {/* You badge */}
                {isYou && (
                  <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-endgame-gold/15 text-endgame-gold border border-endgame-gold/30 font-label">
                    You
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 border border-white/10 shadow-lg`}>
                    {attendee.emoji ? (
                      <span className="text-lg">{attendee.emoji}</span>
                    ) : (
                      <span className="text-sm font-bold text-white font-display tracking-wider">
                        {getInitials(attendee.name)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-off-white truncate leading-tight">
                      {attendee.name}
                    </h4>

                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {attendee.department && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.bg} ${style.color} ${style.border} font-label flex items-center gap-1`}>
                          <span>{style.emoji}</span>
                          {attendee.department}
                        </span>
                      )}
                      {attendee.role && (
                        <span className="text-[10px] text-muted-text font-label">
                          {attendee.role}
                        </span>
                      )}
                    </div>

                    {attendee.bio && (
                      <p className="text-xs text-muted-text/80 mt-1.5 line-clamp-2 leading-relaxed">
                        {attendee.bio}
                      </p>
                    )}

                    {/* Metadata: device ip & registration timestamp for admin */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5 text-[10px] text-muted-text/60 font-label">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-text/40" />
                        <span>{timeSince(attendee.registeredAt)}</span>
                      </div>
                      {attendee.ip && (
                        <span className="font-mono text-[9px] text-muted-text/40">
                          IP: {attendee.ip}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Results Count */}
      {!loading && filteredAttendees.length > 0 && (
        <div className="text-center pt-2">
          <span className="text-[11px] text-muted-text/60 font-label uppercase tracking-wider">
            Showing {filteredAttendees.length} of {attendees.length} operatives
          </span>
        </div>
      )}
    </div>
  );
};
