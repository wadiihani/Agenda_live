import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Trash2, 
  Send, 
  RefreshCw 
} from 'lucide-react';

interface AdminAnnouncementsManagerProps {
  adminPassword: string;
}

export const AdminAnnouncementsManager: React.FC<AdminAnnouncementsManagerProps> = ({ adminPassword }) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'info'>('normal');
  const [category, setCategory] = useState<'general' | 'schedule_change' | 'urgent' | 'room_change' | 'cancellation'>('general');
  const [targetRoom, setTargetRoom] = useState('');
  const [targetTrack, setTargetTrack] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.announcements)) {
          setAnnouncements(data.announcements);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Announcement',
          message: message.trim(),
          priority,
          category,
          targetRoom: targetRoom.trim() || undefined,
          targetTrack: targetTrack !== 'all' ? targetTrack : undefined,
          password: adminPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ text: 'Announcement broadcasted successfully to all devices.', type: 'success' });
        setTitle('');
        setMessage('');
        setTargetRoom('');
        fetchAnnouncements();
        setTimeout(() => setStatusMsg(null), 3000);
      } else {
        setStatusMsg({ text: data.error || 'Failed to publish announcement.', type: 'error' });
      }
    } catch {
      setStatusMsg({ text: 'Network error creating announcement.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;

    try {
      const res = await fetch('/api/announcements/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: adminPassword })
      });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {}
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Compose Announcement Form Card */}
      <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-endgame-gold/20 text-endgame-gold">
              <Megaphone className="w-4 h-4" />
            </span>
            <h3 className="font-display font-extrabold text-xl text-off-white uppercase tracking-wide">
              Broadcast Live Announcement
            </h3>
          </div>

          <button
            type="button"
            onClick={fetchAnnouncements}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-text hover:text-off-white"
            title="Refresh announcements"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {statusMsg && (
          <div className={`p-3 rounded-xl text-xs font-semibold ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-950/50 text-red-300 border border-red-500/30'
          }`}>
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-3 font-label text-xs">
          <div>
            <label className="text-muted-text block mb-1">Title / Headline:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Plenary Convening in 5 Minutes"
              className="w-full px-3 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none"
            />
          </div>

          <div>
            <label className="text-muted-text block mb-1">Message Body (Required):</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter announcement instructions for delegates..."
              rows={3}
              required
              className="w-full px-3 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none font-sans"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="text-muted-text block mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none"
              >
                <option value="general">General Notice</option>
                <option value="schedule_change">Schedule Change</option>
                <option value="room_change">Room Change</option>
                <option value="urgent">Urgent</option>
                <option value="cancellation">Cancellation</option>
              </select>
            </div>

            <div>
              <label className="text-muted-text block mb-1">Severity / Priority:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent Alert</option>
                <option value="info">Informational</option>
              </select>
            </div>

            <div>
              <label className="text-muted-text block mb-1">Target Room (Optional):</label>
              <input
                type="text"
                value={targetRoom}
                onChange={(e) => setTargetRoom(e.target.value)}
                placeholder="e.g. Plenary Hall"
                className="w-full px-2.5 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none"
              />
            </div>

            <div>
              <label className="text-muted-text block mb-1">Target Track:</label>
              <select
                value={targetTrack}
                onChange={(e) => setTargetTrack(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl bg-surface-card border border-white/15 text-off-white outline-none"
              >
                <option value="all">All Tracks</option>
                <option value="newbies">Newbies Track</option>
                <option value="mms">MMs & Oldies</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-stark-red to-infinity-purple text-off-white font-bold text-xs uppercase tracking-wider shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Broadcasting...' : 'Broadcast to All Operatives'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Announcements List */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-text font-bold px-1">
          PUBLISHED ANNOUNCEMENTS ({announcements.length})
        </div>

        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-3.5 rounded-2xl glass-card border border-white/8 flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1 font-label">
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    ann.priority === 'urgent'
                      ? 'bg-stark-red/20 text-stark-red border-stark-red/40'
                      : 'bg-endgame-gold/15 text-endgame-gold border-endgame-gold/30'
                  }`}>
                    {ann.category || ann.priority}
                  </span>
                  {ann.targetRoom && (
                    <span className="text-[10px] text-arc-blue font-mono">
                      📍 {ann.targetRoom}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-text font-mono">
                    {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="font-bold text-sm text-off-white font-display uppercase tracking-wide">
                  {ann.title}
                </div>
                <p className="text-xs text-muted-text mt-0.5 leading-relaxed font-sans">
                  {ann.message}
                </p>
              </div>

              <button
                onClick={() => handleDelete(ann.id)}
                className="p-1.5 rounded-lg bg-red-950/20 text-red-400 hover:bg-red-900/40 transition-colors shrink-0"
                title="Delete announcement"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="p-6 rounded-2xl glass-card border border-white/5 text-center text-xs text-muted-text">
            No active announcements recorded.
          </div>
        )}
      </div>
    </div>
  );
};
