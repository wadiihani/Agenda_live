import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Star, 
  Utensils, 
  CheckCircle2, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  User, 
  Send,
  Wifi,
  Calendar,
  Layers,
  ChevronRight,
  Lock
} from 'lucide-react';
import { useMember } from '../context/MemberContext';
import { useLiveSession } from '../hooks/useLiveSession';
import { AGENDA_DATA } from '../data/agenda';

export const FeedbackPage: React.FC = () => {
  const { member, clientIp, setIsAuthModalOpen } = useMember();
  const { currentDay } = useLiveSession();

  // Selected Day (defaults to active day or Day 1)
  const [selectedDayId, setSelectedDayId] = useState<string>(
    currentDay ? currentDay.id : 'day1'
  );

  // Forms status per day (Open / Closed)
  const [formsStatus, setFormsStatus] = useState<Record<string, boolean>>({
    day1: true,
    day2: false,
    day3: false
  });

  // Fetch form open/close status on mount
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.formsStatus) {
          setFormsStatus(data.formsStatus);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Form ratings
  const [overallRating, setOverallRating] = useState<number>(5);
  const [sessionRating, setSessionRating] = useState<number>(5);
  const [foodRating, setFoodRating] = useState<number>(5);
  const [foodComment, setFoodComment] = useState<string>('');

  // Qualitative questions
  const [wentWell, setWentWell] = useState<string>('');
  const [wentBad, setWentBad] = useState<string>('');
  const [improvement, setImprovement] = useState<string>('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const activeDaySchedule =
    AGENDA_DATA.days[selectedDayId as keyof typeof AGENDA_DATA.days] || AGENDA_DATA.days.day1;

  const isCurrentDayOpen = formsStatus[selectedDayId] !== false;

  // Star Rating Component helper
  const StarPicker = ({
    value,
    onChange,
    label,
    icon: Icon = Star,
    activeColor = 'text-endgame-gold'
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
    icon?: any;
    activeColor?: string;
  }) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-label">
        <span className="font-bold uppercase tracking-wider text-off-white/90">{label}</span>
        <span className="font-mono font-bold text-endgame-gold">{value} / 5</span>
      </div>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1.5 rounded-lg bg-surface-card hover:bg-surface-hover border border-white/10 transition-transform active:scale-95"
            aria-label={`${star} star`}
          >
            <Icon
              className={`w-6 h-6 transition-colors ${
                star <= value
                  ? `${activeColor} fill-current drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]`
                  : 'text-dim-text'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!member || !member.name.trim()) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!isCurrentDayOpen) {
      setErrorMsg(`Day ${activeDaySchedule.dayNumber} (${activeDaySchedule.codename}) debrief portal is currently closed by Command.`);
      return;
    }

    if (!wentWell.trim() && !wentBad.trim() && !improvement.trim()) {
      setErrorMsg('Please share at least a short comment on what went well or could be improved.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const payload = {
      dayId: selectedDayId,
      dayNumber: activeDaySchedule.dayNumber,
      overallRating,
      sessionRating,
      foodRating,
      foodComment,
      wentWell,
      wentBad,
      improvement,
      memberName: member.name
    };

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(resData.error || 'Server rejected submission');
      }

      setIsSuccess(true);
      // Save locally to localStorage as backup
      try {
        const saved = JSON.parse(localStorage.getItem('rabat_co_feedbacks') || '[]');
        saved.push({ ...payload, submittedAt: new Date().toISOString() });
        localStorage.setItem('rabat_co_feedbacks', JSON.stringify(saved));
      } catch {}
    } catch (err: any) {
      setErrorMsg(err.message || 'Error transmitting debrief. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setWentWell('');
    setWentBad('');
    setImprovement('');
    setFoodComment('');
    setIsSuccess(false);
  };

  return (
    <div className="space-y-6 pb-20 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-muted-text mb-2 font-label">
            <Calendar className="w-3.5 h-3.5 text-stark-red" />
            <span className="tracking-wider uppercase">END-OF-DAY MISSION DEBRIEF</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-wide text-off-white">
            Daily Debrief & Feedback
          </h2>
          <p className="text-xs sm:text-sm text-muted-text mt-1 leading-relaxed">
            Your mission debrief fuels continuous improvement for the conference. Rate sessions, catering, and share tactical observations.
          </p>
        </div>

        <Link
          to="/admin"
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-muted-text hover:text-off-white font-label flex items-center gap-1.5 transition-all"
        >
          <span>OC Intel & Google Sheets</span>
          <ChevronRight className="w-3.5 h-3.5 text-endgame-gold" />
        </Link>
      </div>

      {/* Operative Identity / Authentication Banner */}
      <div className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden font-label">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arc-blue/30 to-stark-red/30 border border-white/10 flex items-center justify-center text-off-white font-bold shrink-0">
            {member ? member.name.charAt(0) : <User className="w-5 h-5 text-muted-text" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-text">
                Operative Device
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                <Wifi className="w-3 h-3" />
                {clientIp || '192.168.1.x'}
              </span>
            </div>
            <div className="font-bold text-sm sm:text-base text-off-white">
              {member ? member.name : 'Unidentified Operative'}
              {member?.department && (
                <span className="text-xs font-normal text-muted-text ml-2">
                  ({member.department})
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-off-white transition-all"
        >
          {member ? 'Change Profile' : 'Authenticate Device →'}
        </button>
      </div>

      {/* Success Confirmation Card */}
      {isSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-500/10 text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl uppercase tracking-wide text-off-white">
              Mission Debrief Logged!
            </h3>
            <p className="text-xs sm:text-sm text-off-white/80 mt-1 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{member?.name || 'Operative'}</strong>. Your evaluation for{' '}
              <strong>Day {activeDaySchedule.dayNumber} ({activeDaySchedule.codename})</strong> has been saved directly to the command records.
            </p>
          </div>
          <button
            onClick={handleResetForm}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold uppercase tracking-wider text-off-white transition-all"
          >
            Submit Another Day / Update
          </button>
        </motion.div>
      ) : (
        /* The Feedback Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Day Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-2 font-label">
              Select Conference Day
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(AGENDA_DATA.days).map((day) => {
                const isSelected = day.id === selectedDayId;
                const isDayOpen = formsStatus[day.id] !== false;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => {
                      setSelectedDayId(day.id);
                      setErrorMsg('');
                    }}
                    className={`py-2.5 px-2 rounded-xl text-center border transition-all ${
                      isSelected
                        ? day.dayNumber === 1
                          ? 'bg-stark-red/25 border-stark-red text-off-white shadow-glow-red font-bold'
                          : day.dayNumber === 2
                          ? 'bg-infinity-purple/25 border-infinity-purple text-off-white shadow-glow-purple font-bold'
                          : 'bg-endgame-gold/25 border-endgame-gold text-off-white shadow-glow-gold font-bold'
                        : 'bg-surface-card border-white/10 text-muted-text hover:text-off-white'
                    }`}
                  >
                    <div className="font-display text-sm sm:text-base uppercase tracking-wide">
                      Day {day.dayNumber}
                    </div>
                    <div className="font-label text-[10px] tracking-wider uppercase opacity-80 truncate">
                      {day.codename}
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1 font-label text-[9px] font-bold">
                      {isDayOpen ? (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          OPEN
                        </span>
                      ) : (
                        <span className="text-stark-red flex items-center gap-0.5 opacity-90">
                          <Lock className="w-2.5 h-2.5" />
                          CLOSED
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Locked Notice Banner if selected day is currently closed */}
          {!isCurrentDayOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-stark-red/10 border border-stark-red/35 flex items-start gap-3 shadow-[0_0_20px_rgba(230,57,70,0.15)]"
            >
              <div className="w-9 h-9 rounded-xl bg-stark-red/20 text-stark-red border border-stark-red/30 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-sm sm:text-base uppercase tracking-wide text-off-white">
                    Day {activeDaySchedule.dayNumber} Debrief Window Closed
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stark-red/20 text-stark-red border border-stark-red/30 font-label">
                    Command Locked
                  </span>
                </div>
                <p className="text-xs text-muted-text font-sans leading-relaxed">
                  S.H.I.E.L.D. Command has closed evaluations for <strong>Day {activeDaySchedule.dayNumber} ({activeDaySchedule.codename})</strong>. 
                  Submissions will open when authorized by the Organizing Committee.
                </p>
              </div>
            </motion.div>
          )}

          {/* Section 1: Ratings */}
          <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Sparkles className="w-4 h-4 text-endgame-gold" />
              <h4 className="font-display font-bold text-lg uppercase tracking-wide text-off-white">
                Ratings & Evaluation
              </h4>
            </div>

            {/* Overall Day Rating */}
            <StarPicker
              value={overallRating}
              onChange={setOverallRating}
              label={`Overall Day ${activeDaySchedule.dayNumber} Experience`}
              activeColor="text-endgame-gold"
            />

            {/* Sessions Rating */}
            <StarPicker
              value={sessionRating}
              onChange={setSessionRating}
              label="Sessions & Plenaries Execution"
              activeColor="text-arc-blue"
            />

            {/* Food & Catering Rating */}
            <StarPicker
              value={foodRating}
              onChange={setFoodRating}
              label="Food, Refreshments & Catering"
              icon={Utensils}
              activeColor="text-energy-orange"
            />

            {/* Food comments */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-text mb-1.5 font-label">
                Food & Catering Feedback <span className="opacity-60 lowercase font-normal">(optional)</span>
              </label>
              <textarea
                value={foodComment}
                disabled={!isCurrentDayOpen}
                onChange={(e) => setFoodComment(e.target.value)}
                placeholder={isCurrentDayOpen ? "How was the meal quality, portion size, coffee break timing, or refreshments?" : "Debrief window closed."}
                rows={2}
                className="w-full p-3 rounded-xl bg-surface-card border border-white/10 focus:border-energy-orange text-xs text-off-white placeholder:text-muted-text/50 outline-none transition-all font-sans resize-none disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Section 2: Tactical Questions (Went Well, Went Bad, Improvements) */}
          <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Layers className="w-4 h-4 text-arc-blue" />
              <h4 className="font-display font-bold text-lg uppercase tracking-wide text-off-white">
                Tactical Insights
              </h4>
            </div>

            {/* What Went Well */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 font-label">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>What went well today?</span>
              </label>
              <textarea
                value={wentWell}
                disabled={!isCurrentDayOpen}
                onChange={(e) => setWentWell(e.target.value)}
                placeholder={isCurrentDayOpen ? "Highlight sessions that inspired you, great logistics, energizing moments, or team breakthroughs..." : "Debrief window closed."}
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-card border border-emerald-500/25 focus:border-emerald-400 text-xs text-off-white placeholder:text-muted-text/50 outline-none transition-all font-sans resize-none disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* What Went Bad */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stark-red font-label">
                <ThumbsDown className="w-3.5 h-3.5 text-stark-red" />
                <span>What went bad or needs attention?</span>
              </label>
              <textarea
                value={wentBad}
                disabled={!isCurrentDayOpen}
                onChange={(e) => setWentBad(e.target.value)}
                placeholder={isCurrentDayOpen ? "Mention delays, logistical bottlenecks, lack of clarity, fatigue, or frustrating elements..." : "Debrief window closed."}
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-card border border-stark-red/25 focus:border-stark-red text-xs text-off-white placeholder:text-muted-text/50 outline-none transition-all font-sans resize-none disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>

            {/* What Can Be Improved */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-endgame-gold font-label">
                <Sparkles className="w-3.5 h-3.5 text-endgame-gold" />
                <span>What can be improved for tomorrow?</span>
              </label>
              <textarea
                value={improvement}
                disabled={!isCurrentDayOpen}
                onChange={(e) => setImprovement(e.target.value)}
                placeholder={isCurrentDayOpen ? "Actionable suggestions for the organizing committee, room layout, schedule pacing, or activities..." : "Debrief window closed."}
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-card border border-endgame-gold/25 focus:border-endgame-gold text-xs text-off-white placeholder:text-muted-text/50 outline-none transition-all font-sans resize-none disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-stark-red/10 border border-stark-red/30 flex items-center gap-2 text-xs text-stark-red font-label">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button or Locked State Banner */}
          {!isCurrentDayOpen ? (
            <div className="w-full py-4 px-6 rounded-xl bg-surface-card/70 border border-stark-red/40 text-stark-red font-bold text-xs sm:text-sm uppercase tracking-wider text-center flex items-center justify-center gap-2.5 cursor-not-allowed font-label shadow-[0_0_15px_rgba(230,57,70,0.15)]">
              <Lock className="w-4 h-4" />
              <span>Day {activeDaySchedule.dayNumber} ({activeDaySchedule.codename}) Portal Locked by Command</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-stark-red via-infinity-purple to-endgame-gold text-off-white font-bold text-sm uppercase tracking-wider shadow-glow-combo hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-label"
            >
              {isSubmitting ? (
                <span>Transmitting Debrief...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Day {activeDaySchedule.dayNumber} Mission Debrief</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default FeedbackPage;
