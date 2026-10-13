import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X, Wifi, UserCheck, ArrowRight } from 'lucide-react';
import { useMember } from '../context/MemberContext';

export const OperativeAuthModal: React.FC = () => {
  const { member, clientIp, isAuthModalOpen, setIsAuthModalOpen, registerOperative } = useMember();
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setName(member.name);
      setDepartment(member.department || '');
    }
  }, [member, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name to authenticate.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await registerOperative(name, department);
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md rounded-2xl glass-card border border-white/15 p-5 sm:p-6 shadow-2xl relative bg-[#080B12]/95 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-arc-blue/30 to-stark-red/25 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-text hover:text-off-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arc-blue/30 to-stark-red/30 border border-white/10 flex items-center justify-center text-arc-blue shrink-0">
              <Shield className="w-5 h-5 text-arc-blue" />
            </div>
            <div>
              <div className="font-label text-[10px] font-bold uppercase tracking-widest text-arc-blue">
                S.H.I.E.L.D. Operative Check-In
              </div>
              <h3 className="font-display font-bold text-2xl uppercase tracking-wide text-off-white leading-none mt-0.5">
                {member ? 'Update Operative Profile' : 'Authenticate Your Device'}
              </h3>
            </div>
          </div>

          {/* Detected Device Connection Info (IP-based) */}
          <div className="mb-4 p-3 rounded-xl bg-surface-card border border-white/10 flex items-center justify-between text-xs font-label">
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-muted-text">Device Network IP:</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{clientIp || '192.168.1.x'}</span>
            </div>
          </div>

          <p className="text-xs text-muted-text mb-4 leading-relaxed font-sans">
            Identify yourself to unlock daily mission debriefs, submit session and food ratings, and connect your phone to Rabat CO 26.2.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5 font-label">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-off-white/90 mb-1.5">
                Full Name <span className="text-stark-red">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Sarah Mansouri"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-hover/80 border border-white/15 focus:border-arc-blue text-sm text-off-white placeholder:text-muted-text/50 outline-none transition-all font-sans"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-1.5">
                AIESEC Department / Role <span className="text-[10px] lowercase font-normal opacity-70">(optional)</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. oGX / iCX / TM / F&L / BD / EB"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-hover/80 border border-white/15 focus:border-arc-blue text-sm text-off-white placeholder:text-muted-text/50 outline-none transition-all font-sans"
              />
            </div>

            {error && (
              <div className="text-xs text-stark-red font-medium py-1 px-2 rounded-lg bg-stark-red/10 border border-stark-red/30">
                {error}
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-stark-red via-infinity-purple to-endgame-gold text-off-white font-bold text-xs uppercase tracking-wider shadow-glow-combo hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>{member ? 'Save Profile' : 'Authenticate Device'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
