import React from 'react';
import { motion } from 'framer-motion';

export type TrackType = 'all' | 'newbies' | 'mms';

interface TrackFilterProps {
  activeTrack: TrackType;
  onChangeTrack: (track: TrackType) => void;
  dayNumber?: number;
}

export const TrackFilter: React.FC<TrackFilterProps> = ({ activeTrack, onChangeTrack, dayNumber = 3 }) => {
  const tracks: { id: TrackType; label: string }[] = [
    { id: 'all', label: 'All Tracks' },
    { id: 'newbies', label: 'Newbies' },
    { id: 'mms', label: 'MMs & Oldies' },
  ];

  // Day-based gradient for track filter
  const getActivePillGradient = () => {
    switch (dayNumber) {
      case 1:
        return 'bg-gradient-to-r from-stark-red to-steel-grey shadow-glow-red';
      case 2:
        return 'bg-gradient-to-r from-infinity-purple to-cosmic-blue shadow-glow-purple';
      case 3:
      default:
        // Day 3 Endgame Gold
        return 'bg-gradient-to-r from-endgame-gold to-earth-brown shadow-glow-gold text-midnight';
    }
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-label">
      {tracks.map((track) => {
        const isActive = activeTrack === track.id;

        return (
          <button
            key={track.id}
            onClick={() => onChangeTrack(track.id)}
            className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              isActive 
                ? (dayNumber === 3 ? 'text-background font-bold' : 'text-off-white font-bold') 
                : 'text-muted-text hover:text-off-white bg-white/5'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTrackFilter"
                className={`absolute inset-0 rounded-full -z-10 ${getActivePillGradient()}`}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {track.label}
          </button>
        );
      })}
    </div>
  );
};
