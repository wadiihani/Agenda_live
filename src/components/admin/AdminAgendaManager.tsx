import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  User, 
  RefreshCw, 
  Edit3, 
  Check, 
  X, 
  ShieldAlert,
  UploadCloud,
  Eye,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAgenda } from '../../context/AgendaContext';
import { Session, DaySchedule, formatSessionTitle, SessionStatus } from '../../data/agenda';

interface AdminAgendaManagerProps {
  adminPassword: string;
}

export const AdminAgendaManager: React.FC<AdminAgendaManagerProps> = ({ adminPassword }) => {
  const { agenda, syncNow, applyDelay, updateSessionStatus } = useAgenda();

  const [activeDayId, setActiveDayId] = useState<string>('day1');
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  // Delay Propagation Modal State
  const [delayModalSession, setDelayModalSession] = useState<Session | null>(null);
  const [delayMinutes, setDelayMinutes] = useState<number>(15);
  const [propagateDelay, setPropagateDelay] = useState<boolean>(true);
  const [bufferCompression, setBufferCompression] = useState<number>(5);
  const [propagationPreview, setPropagationPreview] = useState<Session[] | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Agenda Importer Modal State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importInput, setImportInput] = useState<string>('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importPreview, setImportPreview] = useState<any>(null);
  const [isImportPreviewing, setIsImportPreviewing] = useState<boolean>(false);
  const [isImportApplying, setIsImportApplying] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Preview Imported Agenda
  const handlePreviewImport = async () => {
    if (!importInput.trim()) {
      setImportError('Please paste your agenda data first.');
      return;
    }
    setImportError(null);
    setIsImportPreviewing(true);
    setImportPreview(null);

    try {
      const res = await fetch('/api/agenda/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawData: importInput.trim(),
          dryRun: true,
          password: adminPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setImportPreview(data);
      } else {
        setImportError(data.error || 'Failed to parse agenda.');
      }
    } catch (e: any) {
      setImportError(e.message || 'Network error while previewing agenda.');
    } finally {
      setIsImportPreviewing(false);
    }
  };

  // Confirm and Apply Imported Agenda
  const handleApplyImport = async () => {
    if (!importInput.trim()) return;
    setImportError(null);
    setIsImportApplying(true);

    try {
      const res = await fetch('/api/agenda/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawData: importInput.trim(),
          dryRun: false,
          password: adminPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          text: `Agenda successfully updated! ${data.totalCount || 'All'} sessions imported across Day 1, Day 2, and Day 3.`,
          type: 'success'
        });
        setShowImportModal(false);
        setImportPreview(null);
        setImportInput('');
        syncNow();
        setTimeout(() => setFeedbackMessage(null), 5000);
      } else {
        setImportError(data.error || 'Failed to apply agenda.');
      }
    } catch (e: any) {
      setImportError(e.message || 'Network error while applying agenda.');
    } finally {
      setIsImportApplying(false);
    }
  };

  // Sample templates to load
  const loadSampleCSV = () => {
    const sample = `Day,Date,StartTime,EndTime,Duration,SessionName,SessionType,Responsible,Location,Description,ConcreteObjective,EmotionalObjective,Track
Day 1,2026-10-16,08:00,17:00,540 min,Check In,logistics,Command Center,Registration Gate • Bifrost Foyer,Arrival and credential verification.,Complete identity check,Anticipation,all
Day 1,2026-10-16,17:00,18:30,90 min,Avengers, Assemble!,session,Conference Chair,Plenary Hall • Valhalla Grand Stage,The iconic opening moment where all operatives convene.,Align on conference standards,Excitement and belonging,all
Day 1,2026-10-16,18:30,19:15,45 min,AIESEC 101 – The Avengers Initiative,session,Wadii,Plenary Hall • Valhalla Grand Stage,Foundational briefing unpacking organizational purpose.,Understand AIESEC purpose,Curiosity and pride,all
Day 2,2026-10-17,09:00,09:45,45 min,Morning Plenary – Rise of the Avengers,session,Conference Chair,Plenary Hall • Valhalla Grand Stage,Morning keynote re-grounding operatives.,Set operational priorities,Energy and motivation,all
Day 2,2026-10-17,10:30,11:45,75 min,Functional Spaces – The Avengers Tower,session,LCVPs (Soukaina, Wadii, Oussama, Imane),Breakout Rooms,Functional spaces across all portfolios.,Master departmental execution,Belonging and mastery,all
Day 3,2026-10-18,09:15,10:00,45 min,Morning Plenary – The Final Battle,session,Conference Chair,Plenary Hall • Valhalla Grand Stage,Morning opening framing action.,Translate learning into impact,Determination and focus,all
Day 3,2026-10-18,13:45,15:30,105 min,Closing – The Endgame,session,Conference Chair,Plenary Hall • Valhalla Grand Stage,The grand emotional finale and leadership pass-on.,Commit to post-conference victory,Pride and eternal unity,all`;
    setImportInput(sample);
    setImportFormat('csv');
    setImportError(null);
  };

  const activeDay: DaySchedule =
    agenda?.days?.[activeDayId as keyof typeof agenda.days] ||
    agenda?.days?.day1 ||
    ({ sessions: [] } as any);

  // Handle Quick Status Change
  const handleStatusChange = async (session: Session, newStatus: SessionStatus) => {
    const success = await updateSessionStatus({
      dayId: activeDayId,
      sessionId: session.id,
      status: newStatus,
      password: adminPassword
    });
    if (success) {
      setFeedbackMessage({ text: `Session "${session.title}" status set to ${newStatus.toUpperCase()}`, type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } else {
      setFeedbackMessage({ text: 'Failed to update status. Check password.', type: 'error' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  // Simulate Delay Propagation (dryRun = true)
  const handleSimulateDelay = async () => {
    if (!delayModalSession) return;
    setIsSimulating(true);
    setPropagationPreview(null);

    const result = await applyDelay({
      dayId: activeDayId,
      sessionId: delayModalSession.id,
      delayMinutes: Number(delayMinutes),
      propagate: propagateDelay,
      bufferCompression: Number(bufferCompression),
      dryRun: true,
      password: adminPassword
    });

    setIsSimulating(false);
    if (result.success && result.affectedSessions) {
      setPropagationPreview(result.affectedSessions);
    } else {
      alert(result.error || 'Failed to simulate delay propagation.');
    }
  };

  // Confirm and Publish Delay Propagation (dryRun = false)
  const handlePublishDelay = async () => {
    if (!delayModalSession) return;
    setIsPublishing(true);

    const result = await applyDelay({
      dayId: activeDayId,
      sessionId: delayModalSession.id,
      delayMinutes: Number(delayMinutes),
      propagate: propagateDelay,
      bufferCompression: Number(bufferCompression),
      dryRun: false,
      password: adminPassword
    });

    setIsPublishing(false);
    if (result.success) {
      setFeedbackMessage({
        text: `Schedule change confirmed and broadcasted! ${result.affectedSessions?.length || 1} session(s) updated.`,
        type: 'success'
      });
      setDelayModalSession(null);
      setPropagationPreview(null);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } else {
      alert(result.error || 'Failed to publish delay changes.');
    }
  };

  // Save session details edit
  const handleSaveSessionEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    try {
      const res = await fetch('/api/agenda/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId: activeDayId,
          session: editingSession,
          password: adminPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({ text: 'Session details updated successfully.', type: 'success' });
        setEditingSession(null);
        syncNow();
        setTimeout(() => setFeedbackMessage(null), 3000);
      } else {
        alert(data.error || 'Failed to update session.');
      }
    } catch (err) {
      alert('Network error saving session.');
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header & Status Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-card border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-stark-red/20 text-stark-red">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-stark-red font-bold">
              LIVE AGENDA & DELAY COMMAND
            </span>
          </div>
          <h3 className="font-display font-extrabold text-xl sm:text-2xl text-off-white uppercase tracking-wide">
            Schedule Timing & Delay Propagation
          </h3>
          <p className="text-xs text-muted-text mt-0.5">
            Adjust session times, calculate room schedule drift, and publish confirmed schedule changes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stark-red/20 hover:bg-stark-red/30 border border-stark-red/40 text-xs font-bold text-stark-red font-label transition-all active:scale-95 shrink-0"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import / Paste Agenda</span>
          </button>

          <button
            onClick={() => syncNow()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-off-white font-label transition-all active:scale-95 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-endgame-gold" />
            <span>Sync View</span>
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
            : 'bg-red-950/50 text-red-300 border border-red-500/30'
        }`}>
          <Check className="w-4 h-4 shrink-0" />
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar font-label">
        {[
          { id: 'day1', label: 'Day 1: Civil War (Fri Oct 16)' },
          { id: 'day2', label: 'Day 2: Infinity War (Sat Oct 17)' },
          { id: 'day3', label: 'Day 3: Endgame (Sun Oct 18)' }
        ].map((d) => (
          <button
            key={d.id}
            onClick={() => {
              setActiveDayId(d.id);
              setPropagationPreview(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
              activeDayId === d.id
                ? 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/50 shadow-sm'
                : 'bg-white/5 text-muted-text hover:text-off-white border-white/5'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Sessions Grid / Table */}
      <div className="space-y-2">
        {activeDay.sessions && activeDay.sessions.length > 0 ? (
          activeDay.sessions.map((session: Session) => {
            const isDelayed = Boolean(session.delayMinutes && session.delayMinutes > 0);
            const effectiveStart = session.adjustedTime || session.time;
            const effectiveEnd = session.adjustedEndTime || session.endTime || '';

            return (
              <div
                key={session.id}
                className={`p-3.5 rounded-2xl glass-card border transition-all ${
                  session.status === 'live'
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : isDelayed
                    ? 'border-amber-500/40 bg-amber-950/15'
                    : session.status === 'cancelled'
                    ? 'border-red-900/40 bg-red-950/15 opacity-70'
                    : 'border-white/8 hover:border-white/15'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Timing & Title */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 font-label text-xs">
                      <div className="flex items-center gap-1 font-mono font-bold text-off-white tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-endgame-gold shrink-0" />
                        {isDelayed && (
                          <span className="line-through text-muted-text/60 mr-1">
                            {session.time}
                          </span>
                        )}
                        <span className={isDelayed ? 'text-amber-400 font-extrabold' : ''}>
                          {effectiveStart} {effectiveEnd ? `– ${effectiveEnd}` : ''}
                        </span>
                      </div>

                      {isDelayed && (
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          +{session.delayMinutes}m DELAY
                        </span>
                      )}

                      {session.room && (
                        <span className="text-[11px] text-arc-blue font-medium flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{session.room}</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-display font-bold text-base sm:text-lg text-off-white uppercase tracking-wide truncate">
                      {formatSessionTitle(session.title)}
                    </h4>

                    {session.facilitator && (
                      <div className="text-xs text-muted-text flex items-center gap-1.5 mt-0.5 font-label">
                        <User className="w-3 h-3 text-stark-red" />
                        <span>{session.facilitator}</span>
                        {session.badge && (
                          <span className="text-[10px] text-muted-text/80">({session.badge})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Status Dropdown & Action Controls */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0 font-label">
                    {/* Status Select */}
                    <select
                      value={session.status || 'scheduled'}
                      onChange={(e) => handleStatusChange(session, e.target.value as SessionStatus)}
                      className="px-2.5 py-1.5 rounded-xl bg-surface-card border border-white/15 text-xs font-semibold text-off-white outline-none cursor-pointer"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="starting-soon">Starting Soon</option>
                      <option value="live">Live Now</option>
                      <option value="delayed">Delayed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Delay Propagator Button */}
                    <button
                      onClick={() => {
                        setDelayModalSession(session);
                        setDelayMinutes(session.delayMinutes || 15);
                        setPropagationPreview(null);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
                      title="Adjust timing and calculate delay propagation"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Adjust Time</span>
                    </button>

                    {/* Edit Details Button */}
                    <button
                      onClick={() => setEditingSession({ ...session })}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-muted-text hover:text-off-white transition-all active:scale-95"
                      title="Edit room, speaker, objectives"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-muted-text">
            No sessions available for this day.
          </div>
        )}
      </div>

      {/* DELAY PROPAGATION CALCULATOR MODAL */}
      {delayModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#0A0E1A] border border-amber-500/40 p-5 space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">
                  SCHEDULE DRIFT & PROPAGATION CALCULATOR
                </span>
                <h3 className="font-display font-bold text-xl text-off-white uppercase mt-0.5">
                  {delayModalSession.title}
                </h3>
                <p className="text-xs text-muted-text mt-0.5">
                  Original start: <strong className="text-off-white">{delayModalSession.time}</strong> • Current: <strong className="text-amber-300">{delayModalSession.adjustedTime || delayModalSession.time}</strong>
                </p>
              </div>

              <button
                onClick={() => setDelayModalSession(null)}
                className="p-1.5 rounded-full bg-white/5 text-muted-text hover:text-off-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inputs: Delay Minutes & Options */}
            <div className="space-y-3 font-label bg-white/[0.02] p-3.5 rounded-2xl border border-white/8">
              <div>
                <label className="text-xs font-semibold text-muted-text block mb-1">
                  Delay Duration (Minutes):
                </label>
                <div className="flex items-center gap-2">
                  {[5, 10, 15, 20, 30, 0].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDelayMinutes(mins)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                        delayMinutes === mins
                          ? 'bg-amber-500 text-[#070A10] border-amber-500'
                          : 'bg-white/5 text-off-white border-white/10 hover:border-white/20'
                      }`}
                    >
                      {mins === 0 ? 'Clear (0m)' : `+${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                <span className="text-muted-text">Propagate delay to subsequent sessions:</span>
                <input
                  type="checkbox"
                  checked={propagateDelay}
                  onChange={(e) => setPropagateDelay(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {propagateDelay && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                  <div>
                    <span className="text-muted-text block">Buffer compression on breaks:</span>
                    <span className="text-[10px] text-muted-text/70">Reduces residual delay by up to N mins per break</span>
                  </div>
                  <select
                    value={bufferCompression}
                    onChange={(e) => setBufferCompression(Number(e.target.value))}
                    className="px-2 py-1 rounded-lg bg-surface-card border border-white/15 text-xs text-off-white"
                  >
                    <option value={0}>None (0m)</option>
                    <option value={5}>5 mins per break</option>
                    <option value={10}>10 mins per break</option>
                  </select>
                </div>
              )}
            </div>

            {/* Simulation Preview Table */}
            {propagationPreview && (
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-xl bg-black/40 border border-white/8 text-xs font-label">
                <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold px-1">
                  PROPOSED SCHEDULE PREVIEW ({propagationPreview.length} sessions affected):
                </div>
                {propagationPreview.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-1.5 border-b border-white/5 last:border-b-0">
                    <span className="truncate max-w-[180px] font-medium text-off-white">{s.title}</span>
                    <div className="text-right tabular-nums">
                      <span className="line-through text-muted-text/60 mr-1.5">{s.time}</span>
                      <span className="font-bold text-amber-300">{s.adjustedTime || s.time}</span>
                      {s.delayMinutes ? <span className="text-[10px] text-amber-400 ml-1">(+{s.delayMinutes}m)</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10 font-label">
              <button
                type="button"
                onClick={handleSimulateDelay}
                disabled={isSimulating}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-off-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                {isSimulating ? 'Simulating...' : '1. Preview Propagation'}
              </button>

              <button
                type="button"
                onClick={handlePublishDelay}
                disabled={isPublishing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-[#070A10] font-black text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                {isPublishing ? 'Publishing...' : '2. Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SESSION DETAILS MODAL */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleSaveSessionEdit}
            className="w-full max-w-lg rounded-3xl bg-[#090D18] border border-white/20 p-5 space-y-3.5 shadow-2xl text-xs font-label"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-display font-bold text-xl text-off-white uppercase">
                Edit Session Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="p-1 rounded-full text-muted-text hover:text-off-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-muted-text block mb-1">Session Title:</label>
              <input
                type="text"
                value={editingSession.title}
                onChange={(e) => setEditingSession({ ...editingSession, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-muted-text block mb-1">Room / Location:</label>
                <input
                  type="text"
                  value={editingSession.room || ''}
                  onChange={(e) => setEditingSession({ ...editingSession, room: e.target.value })}
                  placeholder="e.g. Plenary Hall • Valhalla"
                  className="w-full px-3 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none"
                />
              </div>

              <div>
                <label className="text-muted-text block mb-1">Lead / Speaker:</label>
                <input
                  type="text"
                  value={editingSession.facilitator || ''}
                  onChange={(e) => setEditingSession({ ...editingSession, facilitator: e.target.value })}
                  placeholder="e.g. Soukaina"
                  className="w-full px-3 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-muted-text block mb-1">Participant Track:</label>
                <select
                  value={editingSession.track || 'all'}
                  onChange={(e) => setEditingSession({ ...editingSession, track: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none"
                >
                  <option value="all">All Membership</option>
                  <option value="newbies">Newbies</option>
                  <option value="igv">iGV Members</option>
                  <option value="mms">MMs & Oldies</option>
                </select>
              </div>
              <div>
                <label className="text-muted-text block mb-1">Session Type:</label>
                <select
                  value={editingSession.type || 'session'}
                  onChange={(e) => setEditingSession({ ...editingSession, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none"
                >
                  <option value="session">Session</option>
                  <option value="break">Break / Meal</option>
                  <option value="logistics">Logistics</option>
                  <option value="party">Party / Gala</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-muted-text block mb-1">Tactical Briefing / Essence:</label>
              <textarea
                value={editingSession.essence || ''}
                onChange={(e) => setEditingSession({ ...editingSession, essence: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingSession(null)}
                className="px-4 py-2 rounded-xl bg-white/10 text-off-white font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-endgame-gold text-[#070A10] font-bold uppercase tracking-wider"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Import / Paste Agenda Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090D16] border border-stark-red/30 shadow-[0_0_50px_rgba(230,36,41,0.25)] overflow-hidden font-sans my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-3 bg-gradient-to-r from-stark-red/15 via-white/[0.02] to-transparent shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-stark-red/20 text-stark-red border border-stark-red/30">
                  <UploadCloud className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-off-white uppercase tracking-wide">
                    Import & Update Conference Agenda
                  </h3>
                  <p className="text-xs text-muted-text mt-0.5">
                    Paste Excel rows or JSON to replace and synchronize the live conference agenda.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview(null);
                  setImportError(null);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-text hover:text-off-white border border-white/10 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Instructions Callout */}
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-muted-text space-y-1.5">
                <div className="flex items-center gap-2 text-endgame-gold font-bold uppercase tracking-wider font-label">
                  <Sparkles className="w-4 h-4 text-endgame-gold shrink-0" />
                  <span>How to Paste Your Excel Agenda</span>
                </div>
                <p className="text-off-white/90 leading-relaxed font-sans">
                  In Excel, select your agenda columns (or export as CSV), copy (Ctrl+C), and paste directly below. The system automatically detects comma or tab separators, calculates missing durations, orders sessions chronologically, and updates the live site.
                </p>
                <div className="text-[11px] font-mono text-muted-text/80 pt-1 border-t border-white/5 flex flex-wrap gap-1">
                  <span className="text-off-white/70">Expected columns:</span>
                  <span className="text-endgame-gold">Day, Date, StartTime, EndTime, Duration, SessionName, SessionType, Responsible, Location, Description, ConcreteObjective, EmotionalObjective, Track</span>
                </div>
              </div>

              {/* Format Switcher & Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-label">
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setImportFormat('csv')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      importFormat === 'csv'
                        ? 'bg-stark-red text-off-white shadow'
                        : 'text-muted-text hover:text-off-white'
                    }`}
                  >
                    CSV / Excel Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportFormat('json')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      importFormat === 'json'
                        ? 'bg-stark-red text-off-white shadow'
                        : 'text-muted-text hover:text-off-white'
                    }`}
                  >
                    JSON Object
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadSampleCSV}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-endgame-gold font-medium transition-all"
                  >
                    Load Sample Template
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImportInput('');
                      setImportPreview(null);
                      setImportError(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-muted-text hover:text-red-400 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Input Textarea */}
              <div>
                <textarea
                  value={importInput}
                  onChange={(e) => {
                    setImportInput(e.target.value);
                    setImportError(null);
                  }}
                  rows={8}
                  placeholder={
                    importFormat === 'csv'
                      ? 'Paste your CSV or copy-pasted Excel table here...\n\nDay,Date,StartTime,EndTime,Duration,SessionName,SessionType,Responsible,Location,Description,ConcreteObjective,EmotionalObjective,Track\nDay 1,2026-10-16,17:00,18:30,90 min,Avengers Assemble!,session,Conference Chair,Plenary Hall,Opening moment,Align culture,Energy and pride,all'
                      : '{\n  "days": {\n    "day1": { "sessions": [...] },\n    "day2": { "sessions": [...] },\n    "day3": { "sessions": [...] }\n  }\n}'
                  }
                  className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/15 text-off-white font-mono text-xs leading-relaxed outline-none focus:border-stark-red/60 focus:ring-1 focus:ring-stark-red/40 transition-all"
                />
              </div>

              {/* Error Message */}
              {importError && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Live Preview Display */}
              {importPreview && (
                <div className="p-4 rounded-2xl bg-surface-card border border-white/15 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 font-label">
                        Parsed Agenda Preview — {importPreview.totalCount || 0} Sessions Found
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-stark-red/20 text-stark-red border border-stark-red/30">
                        Day 1: {importPreview.summary?.day1 ?? 0}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-infinity-purple/20 text-purple-300 border border-infinity-purple/30">
                        Day 2: {importPreview.summary?.day2 ?? 0}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-endgame-gold/20 text-endgame-gold border border-endgame-gold/30">
                        Day 3: {importPreview.summary?.day3 ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Preview session list */}
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {['day1', 'day2', 'day3'].map((dKey) => {
                      const dayObj = importPreview.days?.[dKey];
                      if (!dayObj || !dayObj.sessions || dayObj.sessions.length === 0) return null;
                      return (
                        <div key={dKey} className="space-y-1.5">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-text font-label">
                            {dayObj.codename || dKey} ({dayObj.date || ''}) — {dayObj.sessions.length} sessions
                          </div>
                          {dayObj.sessions.map((s: any, sIdx: number) => (
                            <div
                              key={s.id || sIdx}
                              className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-endgame-gold tabular-nums text-[11px]">
                                  {s.time} {s.endTime ? `– ${s.endTime}` : ''}
                                </span>
                                <span className="font-semibold text-off-white truncate max-w-xs">
                                  {s.title}
                                </span>
                                {s.duration && (
                                  <span className="text-[10px] text-muted-text font-mono bg-white/5 px-1.5 py-0.2 rounded">
                                    {s.duration}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-muted-text text-[11px] shrink-0">
                                {s.responsible && <span className="text-stark-red/90">{s.responsible}</span>}
                                {s.room && <span className="text-arc-blue/80 hidden sm:inline">• {s.room}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.01] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview(null);
                  setImportError(null);
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-text hover:text-off-white text-xs font-semibold font-label transition-all"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviewImport}
                  disabled={isImportPreviewing || !importInput.trim()}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-off-white text-xs font-bold font-label transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-arc-blue" />
                  <span>{isImportPreviewing ? 'Validating...' : 'Validate & Preview'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleApplyImport}
                  disabled={isImportApplying || !importInput.trim()}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-endgame-gold via-amber-400 to-endgame-gold hover:brightness-110 text-[#070A10] text-xs font-black uppercase tracking-wider font-label transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50 inline-flex items-center gap-1.5 active:scale-95"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isImportApplying ? 'Applying...' : 'Confirm & Apply Agenda'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
