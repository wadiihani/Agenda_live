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
  ExternalLink
} from 'lucide-react';
import { useMember } from '../context/MemberContext';
import { useAgenda } from '../context/AgendaContext';

interface Photo {
  id: string;
  imageData: string;
  caption: string;
  uploaderName: string;
  uploadedAt: string;
  likes: number;
  likedBy?: string[];
}

export const PhotoWallPage: React.FC = () => {
  const { member, setIsAuthModalOpen } = useMember();
  const { agenda } = useAgenda();
  const driveUrl = agenda?.meta?.mediaDriveUrl || 'https://drive.google.com/drive/folders/1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX?usp=drive_link';
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Fetch photos
  const fetchPhotos = useCallback(() => {
    fetch('/api/photos')
      .then((r) => r.json())
      .then((data) => {
        if (data.photos) setPhotos(data.photos);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchPhotos();
    const interval = setInterval(fetchPhotos, 15000);
    return () => clearInterval(interval);
  }, [fetchPhotos]);

  // Handle file selection (from gallery or camera)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|heic|heif)$/i)) {
      alert('Please select an image file from your gallery.');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      alert('Image file is too large. Please select a photo under 12MB.');
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      // Compress via canvas for fast uploads
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        const maxH = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxW) { h = (maxW / w) * h; w = maxW; }
        if (h > maxH) { w = (maxH / h) * w; h = maxH; }
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
    // Reset input value so re-selecting same photo works
    e.target.value = '';
  };

  // Upload photo
  const handleUpload = async () => {
    if (!selectedImage) return;
    if (!member) {
      setIsAuthModalOpen(true);
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: selectedImage,
          caption: caption.trim(),
          uploaderName: member.name
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowUploadModal(false);
        setSelectedImage(null);
        setCaption('');
        setSelectedFileName('');
        fetchPhotos();
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  // Like/Unlike
  const handleLike = async (photoId: string) => {
    try {
      const res = await fetch('/api/photos/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      });
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photoId ? { ...p, likes: data.likes } : p
          )
        );
      }
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
    <div className="space-y-5 pb-16">
      {/* Header */}
      <div className="rounded-2xl glass-card p-5 sm:p-6 border border-white/10 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-infinity-purple/20 via-stark-red/15 to-endgame-gold/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-muted-text mb-3 font-label">
              <Camera className="w-3.5 h-3.5 text-infinity-purple" />
              <span className="tracking-wider uppercase">PHOTO WALL · SHARED GALLERY</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-wide text-off-white">
              PHOTO WALL
            </h2>
            <p className="text-xs sm:text-sm text-muted-text mt-1.5 max-w-lg leading-relaxed">
              Share your conference moments! Upload photos and see what everyone is capturing.
            </p>
          </div>

          {/* Actions: Google Drive & In-App Upload */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-endgame-gold/15 hover:bg-endgame-gold/25 border border-endgame-gold/40 text-endgame-gold text-xs font-bold uppercase tracking-wider transition-all font-label"
              title="Open Official Google Drive Folder"
            >
              <FolderOpen className="w-4 h-4 text-endgame-gold" />
              <span className="hidden sm:inline">Google Drive</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-infinity-purple/20 to-stark-red/20 hover:from-infinity-purple/30 hover:to-stark-red/30 border border-infinity-purple/30 hover:border-infinity-purple/50 text-off-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm font-label"
            >
              <Upload className="w-4 h-4 text-infinity-purple" />
              <span className="hidden sm:inline">Upload</span>
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/8">
          <div className="flex items-center gap-1.5 text-xs text-muted-text font-label">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-text font-label">
            <Heart className="w-3.5 h-3.5 text-stark-red" />
            <span>{photos.reduce((sum, p) => sum + (p.likes || 0), 0)} total likes</span>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-text">
          <Loader2 className="w-8 h-8 animate-spin mb-2 text-infinity-purple" />
          <span className="text-xs font-label uppercase tracking-wider">Loading gallery…</span>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-2xl glass-card border border-white/5">
          <Camera className="w-12 h-12 mx-auto text-muted-text/30 mb-3" />
          <h4 className="text-sm font-semibold text-off-white font-display uppercase tracking-wide">No photos yet</h4>
          <p className="text-xs text-muted-text mt-1">
            Be the first to share a conference moment!
          </p>
          <button
            onClick={() => {
              if (!member) { setIsAuthModalOpen(true); return; }
              setShowUploadModal(true);
            }}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-infinity-purple/15 hover:bg-infinity-purple/25 border border-infinity-purple/30 text-infinity-purple-light text-xs font-bold uppercase tracking-wider transition-all font-label"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload First Photo
          </button>
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
              <div className="rounded-2xl glass-card border border-white/8 overflow-hidden group relative">
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

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-2xl glass-card border border-white/15 p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-muted-text hover:text-off-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display font-bold text-2xl uppercase tracking-wide text-off-white mb-1">
                UPLOAD PHOTO
              </h3>
              <p className="text-xs text-muted-text mb-5">
                Share a moment from the conference with everyone.
              </p>

              {/* Hidden File Select Inputs: Gallery (default) & Camera */}
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
                <div className="relative rounded-xl overflow-hidden border border-white/10 mb-4 bg-black/40">
                  <img src={selectedImage} alt="Preview" className="w-full h-52 object-contain" />
                  <button
                    onClick={() => { setSelectedImage(null); setSelectedFileName(''); }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 text-[10px] text-white/90 bg-black/60 px-2.5 py-1 rounded-full font-label truncate max-w-[80%]">
                    {selectedFileName}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 mb-4">
                  {/* Primary: Select from Photo Gallery */}
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="w-full py-8 px-4 rounded-xl border-2 border-dashed border-infinity-purple/40 hover:border-infinity-purple bg-infinity-purple/5 hover:bg-infinity-purple/10 flex flex-col items-center justify-center gap-2 transition-all group active:scale-[0.99]"
                  >
                    <div className="w-12 h-12 rounded-full bg-infinity-purple/20 border border-infinity-purple/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6 text-purple-300" />
                    </div>
                    <span className="text-sm font-bold text-off-white font-label uppercase tracking-wider">
                      Select from Photo Gallery
                    </span>
                    <span className="text-[11px] text-muted-text">
                      Choose any saved photo from your phone or device
                    </span>
                    <span className="text-[10px] text-muted-text/60 font-mono mt-0.5">
                      JPG, PNG, WebP, HEIC · Up to 12MB
                    </span>
                  </button>

                  {/* Secondary: Take Live Photo */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center gap-2 text-xs font-semibold text-muted-text hover:text-off-white transition-all font-label"
                  >
                    <Camera className="w-4 h-4 text-arc-blue" />
                    <span>Or Take a Photo with Camera</span>
                  </button>
                </div>
              )}

              {/* Caption */}
              <div className="relative mb-5">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption... (optional)"
                  maxLength={120}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface-card border border-white/10 focus:border-infinity-purple/50 text-sm text-off-white placeholder:text-muted-text/60 outline-none transition-all"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-text/50 font-label">
                  {caption.length}/120
                </span>
              </div>

              {/* Submit */}
              <button
                onClick={handleUpload}
                disabled={!selectedImage || uploading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all font-label ${
                  !selectedImage || uploading
                    ? 'bg-white/5 text-muted-text/40 cursor-not-allowed'
                    : 'bg-gradient-to-r from-infinity-purple/25 to-stark-red/25 hover:from-infinity-purple/40 hover:to-stark-red/40 border border-infinity-purple/30 text-off-white shadow-glow-purple active:scale-[0.98]'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Share Photo
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Preview Modal */}
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
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-2xl max-h-[85vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute -top-10 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={previewPhoto.imageData}
                alt={previewPhoto.caption || 'Photo preview'}
                className="w-full max-h-[75vh] object-contain rounded-2xl"
              />
              {previewPhoto.caption && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-off-white/90">{previewPhoto.caption}</p>
                  <p className="text-xs text-muted-text mt-1 font-label">
                    by {previewPhoto.uploaderName} · {timeSince(previewPhoto.uploadedAt)}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
