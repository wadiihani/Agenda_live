import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Heart, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  User, 
  Clock, 
  Maximize2, 
  Send, 
  FolderOpen, 
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Info,
  AlertCircle
} from 'lucide-react';
import { useMember } from '../context/MemberContext';
import { useAgenda } from '../context/AgendaContext';

export const OFFICIAL_DRIVE_URL = 'https://drive.google.com/drive/folders/1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX?usp=drive_link';

interface Photo {
  id: string;
  imageData: string;
  caption: string;
  uploaderName: string;
  uploadedAt: string;
  likes: number;
  likedBy?: string[];
}

const LOCAL_PHOTOS_KEY = 'rabat_photo_wall_local_v1';

export const PhotoWallPage: React.FC = () => {
  const { member, setIsAuthModalOpen } = useMember();
  const { agenda } = useAgenda();
  const driveUrl = (agenda?.meta?.mediaDriveUrl && !agenda.meta.mediaDriveUrl.includes('vault'))
    ? agenda.meta.mediaDriveUrl
    : OFFICIAL_DRIVE_URL;

  const [photos, setPhotos] = useState<Photo[]>(() => {
    try {
      const local = localStorage.getItem(LOCAL_PHOTOS_KEY);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveWebhookUrl, setDriveWebhookUrl] = useState<string>('');
  const [driveUploadStatus, setDriveUploadStatus] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Fetch photos from server, merging with local storage
  const fetchPhotos = useCallback(() => {
    fetch('/api/photos')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.photos) && data.photos.length > 0) {
          setPhotos((prev) => {
            const combined = [...data.photos];
            for (const p of prev) {
              if (!combined.some((item) => item.id === p.id)) {
                combined.push(p);
              }
            }
            combined.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            return combined;
          });
        }
      })
      .catch(() => {
        // Fallback already populated from localStorage
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPhotos();
    const interval = setInterval(fetchPhotos, 15000);
    return () => clearInterval(interval);
  }, [fetchPhotos]);

  // Fetch config for Google Drive Webhook URL
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.googleDriveWebhookUrl) {
          setDriveWebhookUrl(data.googleDriveWebhookUrl);
        }
      })
      .catch(() => {});
  }, []);

  // Direct upload to Google Drive folder via Google Apps Script Webhook
  const handleDirectDriveUpload = async () => {
    if (!selectedImage) return;
    if (!member) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsUploadingToDrive(true);
    setDriveUploadStatus({ text: 'Sending photo directly to Google Drive folder...', type: 'info' });

    try {
      // 1. Try server proxy endpoint first
      const res = await fetch('/api/photos/upload-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: selectedImage,
          caption: caption.trim(),
          uploaderName: member.name || 'Operative'
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setDriveUploadStatus({
          text: 'Photo successfully uploaded into official Google Drive folder!',
          type: 'success'
        });
        handleUpload();
        return;
      }

      // 2. Direct client fallback if client has direct webhook URL
      if (driveWebhookUrl && driveWebhookUrl.startsWith('http')) {
        await fetch(driveWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            imageData: selectedImage,
            caption: caption.trim(),
            uploaderName: member.name || 'Operative'
          }),
          mode: 'no-cors'
        });
        setDriveUploadStatus({
          text: 'Photo transmitted to Google Drive! Processing into folder.',
          type: 'success'
        });
        handleUpload();
        return;
      }

      // 3. Fallback notice
      setDriveUploadStatus({
        text: data?.error || 'Google Drive automatic upload script is not configured yet in Admin. You can post to Live Wall feed or use the Open Drive link to drop your photo.',
        type: 'error'
      });
    } catch (err: any) {
      setDriveUploadStatus({
        text: 'Direct upload error: ' + (err.message || 'Network issue') + '. You can still open the Google Drive folder to upload.',
        type: 'error'
      });
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // Handle file selection (from gallery or camera)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i)) {
      alert('Please select an image file from your gallery.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('Image file is too large. Please select a photo under 20MB.');
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // Compress via canvas for fast in-app uploads & local storage limits
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        const maxH = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxW) { h = (maxW / w) * h; w = maxW; }
        if (h > maxH) { h = (maxH / h) * w; h = maxH; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setSelectedImage(compressed);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload photo to in-app Live Wall with local resilience
  const handleUpload = async () => {
    if (!selectedImage) return;
    if (!member) {
      setIsAuthModalOpen(true);
      return;
    }

    setUploading(true);
    const newPhoto: Photo = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      imageData: selectedImage,
      caption: caption.trim(),
      uploaderName: member.name || 'Operative',
      uploadedAt: new Date().toISOString(),
      likes: 0
    };

    // Save to local state & localStorage immediately
    setPhotos((prev) => {
      const updated = [newPhoto, ...prev.filter((p) => p.id !== newPhoto.id)];
      try {
        localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(updated.slice(0, 30)));
      } catch {}
      return updated;
    });

    try {
      await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: selectedImage,
          caption: caption.trim(),
          uploaderName: member.name
        })
      });
    } catch (err) {
      // Local fallback handled gracefully
    } finally {
      setUploading(false);
      setShowUploadModal(false);
      setSelectedImage(null);
      setCaption('');
      setSelectedFileName('');
      setUploadSuccessMsg('Snapshot posted to Live Wall! You can also upload your full-res original to Google Drive.');
      setTimeout(() => setUploadSuccessMsg(null), 10000);
    }
  };

  // Like/Unlike
  const handleLike = async (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          return { ...p, likes: (p.likes || 0) + 1 };
        }
        return p;
      })
    );

    try {
      const local = photos.map((p) => (p.id === photoId ? { ...p, likes: (p.likes || 0) + 1 } : p));
      localStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(local.slice(0, 30)));
      await fetch('/api/photos/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      });
    } catch {}
  };

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-4 pb-16 font-sans">
      {/* 1. OFFICIAL GOOGLE DRIVE VAULT BANNER (Prominent & Clear) */}
      <div className="rounded-2xl glass-card p-4 sm:p-5 border border-endgame-gold/50 bg-gradient-to-r from-endgame-gold/20 via-[#070A10] to-infinity-purple/15 shadow-[0_8px_32px_rgba(212,175,55,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-endgame-gold/20 border border-endgame-gold/40 flex items-center justify-center shrink-0 shadow-inner">
            <FolderOpen className="w-6 h-6 text-endgame-gold" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-off-white uppercase tracking-wider font-label flex items-center gap-1.5 flex-wrap">
              <span className="text-endgame-gold">Official Google Drive Vault</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-endgame-gold/20 text-endgame-gold font-mono border border-endgame-gold/40 font-bold">
                SHARED ASGARD ARCHIVE
              </span>
            </div>
            <div className="text-xs text-muted-text mt-0.5 line-clamp-2">
              Upload original high-res plenary photos, roll-call clips & memories directly into Google Drive for all delegates.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 font-label">
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-endgame-gold hover:bg-amber-400 text-charcoal-black font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-endgame-gold/20"
          >
            <FolderOpen className="w-4 h-4 text-charcoal-black" />
            <span>Upload to Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5 text-charcoal-black" />
          </a>
        </div>
      </div>

      {/* Success Notification Bar */}
      {uploadSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-300 shadow-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{uploadSuccessMsg}</span>
          </div>
          <a
            href={driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-endgame-gold text-charcoal-black font-bold uppercase tracking-wider text-[11px] font-label shrink-0 shadow-sm hover:bg-amber-400"
          >
            <FolderOpen className="w-3.5 h-3.5 text-charcoal-black" />
            <span>Open Google Drive ↗</span>
          </a>
        </motion.div>
      )}

      {/* 2. Photo Wall Header */}
      <div className="rounded-2xl glass-card p-5 sm:p-6 border border-white/10 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-infinity-purple/20 via-stark-red/15 to-endgame-gold/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-muted-text mb-3 font-label">
              <Camera className="w-3.5 h-3.5 text-infinity-purple" />
              <span className="tracking-wider uppercase">PHOTO WALL · LIVE STREAM</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-wide text-off-white">
              PHOTO WALL
            </h2>
            <p className="text-xs sm:text-sm text-muted-text mt-1.5 max-w-lg leading-relaxed">
              Snapshots from operatives. Drop full-res photos into Google Drive or share a quick snapshot directly on this live feed.
            </p>
          </div>

          {/* Action Buttons: 1. Drive Upload (Gold) & 2. Post Snapshot (Purple) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-label">
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-endgame-gold hover:bg-amber-400 text-charcoal-black text-xs font-extrabold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
            >
              <FolderOpen className="w-4 h-4 text-charcoal-black" />
              <span>Upload to Drive</span>
              <ExternalLink className="w-3.5 h-3.5 text-charcoal-black/70" />
            </a>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!member) {
                  setIsAuthModalOpen(true);
                  return;
                }
                setShowUploadModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-infinity-purple/30 to-stark-red/30 hover:from-infinity-purple/45 hover:to-stark-red/45 border border-infinity-purple/50 text-off-white text-xs font-bold uppercase tracking-wider transition-all shadow-glow-purple"
            >
              <Upload className="w-4 h-4 text-purple-300" />
              <span>Post Snapshot</span>
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/8">
          <div className="flex items-center gap-1.5 text-xs text-muted-text font-label">
            <ImageIcon className="w-3.5 h-3.5 text-arc-blue" />
            <span>{photos.length} photo{photos.length !== 1 ? 's' : ''} on wall</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-text font-label">
            <Heart className="w-3.5 h-3.5 text-stark-red" />
            <span>{photos.reduce((sum, p) => sum + (p.likes || 0), 0)} total likes</span>
          </div>
        </div>
      </div>

      {/* 3. Photo Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-text">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-infinity-purple" />
          <span className="text-xs font-label uppercase tracking-wider">Loading gallery…</span>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-14 px-4 rounded-2xl glass-card border border-white/5 space-y-3">
          <Camera className="w-12 h-12 mx-auto text-muted-text/30 mb-2" />
          <h4 className="text-sm font-semibold text-off-white font-display uppercase tracking-wide">No Live Wall Photos Yet</h4>
          <p className="text-xs text-muted-text max-w-sm mx-auto">
            Upload your memories directly into the official Google Drive folder or share a quick snapshot here.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-endgame-gold hover:bg-amber-400 text-charcoal-black text-xs font-extrabold uppercase tracking-wider transition-all font-label shadow-sm"
            >
              <FolderOpen className="w-4 h-4 text-charcoal-black" />
              <span>Upload to Google Drive Folder</span>
              <ExternalLink className="w-3.5 h-3.5 text-charcoal-black" />
            </a>
            <button
              onClick={() => {
                if (!member) { setIsAuthModalOpen(true); return; }
                setShowUploadModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-off-white text-xs font-bold uppercase tracking-wider transition-all font-label"
            >
              <Upload className="w-3.5 h-3.5 text-purple-300" />
              <span>Share Snapshot to Live Wall</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 gap-3 space-y-3">
          {photos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="break-inside-avoid"
            >
              <div className="rounded-2xl glass-card border border-white/8 overflow-hidden group relative bg-black/40">
                {/* Image */}
                <div 
                  className="relative cursor-pointer"
                  onClick={() => setPreviewPhoto(photo)}
                >
                  <img
                    src={photo.imageData}
                    alt={photo.caption || 'Conference photo'}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <Maximize2 className="w-4 h-4 text-white/80" />
                  </div>
                </div>

                {/* Info bar */}
                <div className="px-3 py-2.5">
                  {photo.caption && (
                    <p className="text-xs text-off-white/90 leading-relaxed mb-1.5 line-clamp-2">
                      {photo.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <User className="w-3 h-3 text-muted-text/60 shrink-0" />
                      <span className="text-[10px] text-muted-text truncate font-label">{photo.uploaderName}</span>
                      <span className="text-muted-text/30">·</span>
                      <Clock className="w-3 h-3 text-muted-text/40 shrink-0" />
                      <span className="text-[10px] text-muted-text/60 font-label shrink-0">{timeSince(photo.uploadedAt)}</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLike(photo.id); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-stark-red/10 transition-colors group/like"
                    >
                      <Heart className={`w-3.5 h-3.5 transition-colors ${(photo.likes || 0) > 0 ? 'text-stark-red fill-stark-red' : 'text-muted-text/60 group-hover/like:text-stark-red'}`} />
                      {(photo.likes || 0) > 0 && (
                        <span className="text-[10px] text-stark-red font-bold font-label">{photo.likes}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 4. Upload Modal with Direct Google Drive Option + Gallery Selection */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-2xl glass-card border border-white/15 p-5 sm:p-6 relative bg-[#090D18] my-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-muted-text hover:text-off-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-endgame-gold" />
                <h3 className="font-display font-bold text-xl sm:text-2xl uppercase tracking-wide text-off-white">
                  UPLOAD & SHARE PHOTOS
                </h3>
              </div>
              <p className="text-xs text-muted-text mb-4">
                Upload to Google Drive for permanent full-res archive, or post a snapshot to this live wall.
              </p>

              {/* PRIMARY OPTION 1: Upload directly to official Google Drive */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-endgame-gold/20 via-endgame-gold/10 to-amber-500/10 border border-endgame-gold/50 mb-4 font-label">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-endgame-gold" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-endgame-gold">
                      Official Google Drive Folder
                    </span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-endgame-gold/20 text-endgame-gold font-mono font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-muted-text leading-relaxed mb-3 font-sans">
                  Best for original full-resolution photos, plenary videos & batch gallery uploads directly into the shared folder.
                </p>
                <a
                  href={driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-endgame-gold hover:bg-amber-400 text-charcoal-black font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-md"
                >
                  <FolderOpen className="w-4 h-4 text-charcoal-black" />
                  <span>Open Drive Folder to Upload ↗</span>
                </a>
                <div className="mt-2 text-[10px] text-muted-text/80 flex items-start gap-1 font-sans">
                  <Info className="w-3.5 h-3.5 text-endgame-gold shrink-0 mt-0.5" />
                  <span>In Google Drive, tap <strong>"+"</strong> (on phone) or drag & drop files (on PC) to upload any photos.</span>
                </div>
              </div>

              {/* DIVIDER */}
              <div className="relative flex py-2 items-center mb-3">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono text-muted-text uppercase tracking-widest font-bold">
                  OR POST TO IN-APP LIVE WALL FEED
                </span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              {/* Hidden File Select Inputs: Gallery & Camera */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*,image/heic,image/heif,image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedImage ? (
                <div className="space-y-3 mb-4">
                  <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <img src={selectedImage} alt="Preview" className="w-full h-48 object-contain" />
                    <button
                      type="button"
                      onClick={() => { setSelectedImage(null); setSelectedFileName(''); }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 text-[10px] text-white/90 bg-black/60 px-2.5 py-1 rounded-full font-label truncate max-w-[80%]">
                      {selectedFileName}
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="relative">
                    <input
                      type="text"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a caption... (optional)"
                      maxLength={120}
                      className="w-full px-3.5 py-2 rounded-xl bg-surface-card border border-white/10 focus:border-infinity-purple/50 text-xs text-off-white placeholder:text-muted-text/60 outline-none transition-all font-sans"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-text/50 font-label">
                      {caption.length}/120
                    </span>
                  </div>

                  {/* Actions for Selected Image */}
                  <div className="space-y-2 pt-1 font-label">
                    {/* Primary Button 1: Send directly to Google Drive */}
                    <button
                      type="button"
                      onClick={handleDirectDriveUpload}
                      disabled={isUploadingToDrive || uploading}
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm ${
                        isUploadingToDrive
                          ? 'bg-amber-400/50 text-charcoal-black cursor-wait'
                          : 'bg-endgame-gold hover:bg-amber-400 text-charcoal-black'
                      }`}
                    >
                      {isUploadingToDrive ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-charcoal-black" />
                          <span>Uploading directly to Google Drive…</span>
                        </>
                      ) : (
                        <>
                          <FolderOpen className="w-4 h-4 text-charcoal-black" />
                          <span>Upload Directly to Google Drive</span>
                        </>
                      )}
                    </button>

                    {/* Button 2: Post to Live Wall Feed */}
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading || isUploadingToDrive}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                        uploading
                          ? 'bg-white/5 text-muted-text/40 cursor-not-allowed'
                          : 'bg-gradient-to-r from-infinity-purple/30 to-stark-red/30 hover:from-infinity-purple/45 hover:to-stark-red/45 border border-infinity-purple/40 text-off-white shadow-glow-purple active:scale-[0.98]'
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Posting to Live Wall…</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Post to Website Live Wall Feed</span>
                        </>
                      )}
                    </button>

                    {/* Secondary link: Open Folder in Google Drive */}
                    <a
                      href={driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-muted-text hover:text-off-white text-[11px] font-semibold transition-all"
                    >
                      <span>Open Drive Folder to Drop Files Manually ↗</span>
                    </a>
                  </div>

                  {driveUploadStatus && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-sans flex items-start gap-2 ${
                        driveUploadStatus.type === 'success'
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                          : driveUploadStatus.type === 'error'
                          ? 'bg-stark-red/15 border border-stark-red/30 text-rose-300'
                          : 'bg-arc-blue/15 border border-arc-blue/30 text-sky-300'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-snug">{driveUploadStatus.text}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 mb-4">
                  {/* Select from Gallery */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full py-5 px-3 rounded-xl border-2 border-dashed border-infinity-purple/40 hover:border-infinity-purple bg-infinity-purple/5 hover:bg-infinity-purple/10 flex flex-col items-center justify-center gap-1.5 transition-all group active:scale-[0.99]"
                  >
                    <div className="w-10 h-10 rounded-full bg-infinity-purple/20 border border-infinity-purple/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5 text-purple-300" />
                    </div>
                    <span className="text-xs font-bold text-off-white font-label uppercase tracking-wider">
                      Select from Photo Gallery
                    </span>
                    <span className="text-[10px] text-muted-text font-mono">
                      Pick any photo from your phone or device
                    </span>
                  </button>

                  {/* Or Take a Photo with Camera */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center gap-2 text-xs font-semibold text-muted-text hover:text-off-white transition-all font-label"
                  >
                    <Camera className="w-3.5 h-3.5 text-arc-blue" />
                    <span>Or Take a Photo with Camera</span>
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setPreviewPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative max-w-2xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute -top-10 right-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={previewPhoto.imageData}
                alt={previewPhoto.caption || 'Full view'}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-white/10"
              />

              {/* Caption & Info */}
              <div className="w-full mt-3 p-3.5 rounded-xl glass-card border border-white/10 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  {previewPhoto.caption && (
                    <p className="text-off-white font-medium mb-1 leading-relaxed">{previewPhoto.caption}</p>
                  )}
                  <span className="text-muted-text font-label text-[11px]">
                    By {previewPhoto.uploaderName} · {timeSince(previewPhoto.uploadedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-endgame-gold hover:bg-amber-400 text-charcoal-black font-extrabold text-[11px] uppercase tracking-wider font-label"
                    title="Open Google Drive folder"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-charcoal-black" />
                    <span>Drive</span>
                  </a>

                  <button
                    onClick={() => handleLike(previewPhoto.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-stark-red/15 text-off-white transition-colors font-label"
                  >
                    <Heart className={`w-4 h-4 ${(previewPhoto.likes || 0) > 0 ? 'text-stark-red fill-stark-red' : 'text-muted-text'}`} />
                    <span>{previewPhoto.likes || 0}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoWallPage;
