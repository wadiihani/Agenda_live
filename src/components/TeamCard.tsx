import React from 'react';
import { motion } from 'framer-motion';
import { TeamMember } from '../data/team';

interface TeamCardProps {
  member: TeamMember;
  index: number;
}

export const TeamCard: React.FC<TeamCardProps> = ({ member, index }) => {
  // Brand color badges
  const getBadgeClass = (type: string) => {
    switch (type) {
      case 'director':
        return 'bg-stark-red/20 text-stark-red border-stark-red/40 shadow-glow-red';
      case 'commander':
        return 'bg-cosmic-blue/20 text-blue-300 border-cosmic-blue/40 shadow-glow-blue';
      case 'ops':
        return 'bg-iron-grey text-off-white border-white/20';
      default: // agent
        return 'bg-arc-blue/20 text-blue-400 border-arc-blue/40';
    }
  };

  const getAvatarGradient = (type: string) => {
    switch (type) {
      case 'director':
        return 'from-stark-red/35 to-steel-grey/30 border-stark-red/30';
      case 'commander':
        return 'from-cosmic-blue/35 to-infinity-purple/30 border-cosmic-blue/30';
      case 'ops':
        return 'from-iron-grey to-white/10 border-white/20';
      default:
        return 'from-arc-blue/35 to-cosmic-blue/30 border-arc-blue/30';
    }
  };

  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="group rounded-2xl glass-card glass-card-hover p-5 border border-white/10 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start gap-3.5 mb-3.5">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(member.badgeType)} border flex items-center justify-center font-display font-bold text-xl text-off-white shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base text-off-white truncate leading-tight font-sans">
              {member.name}
            </h4>
            <div className="font-label text-xs font-semibold text-purple-300 mt-0.5 tracking-wide">
              "{member.callsign}"
            </div>
            <div className="text-[11px] text-muted-text mt-0.5 truncate font-sans">
              {member.role}
            </div>
          </div>
        </div>

        <div className="mb-3.5 font-label flex items-center gap-2">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeClass(member.badgeType)}`}>
            {member.badge}
          </span>
          {member.status && (
            <span className="text-[10px] text-stark-red font-semibold">
              [{member.status}]
            </span>
          )}
        </div>

        <p className="text-xs text-muted-text/90 leading-relaxed line-clamp-3 mb-4 font-sans">
          {member.bio}
        </p>
      </div>

      {member.assignedSessions && member.assignedSessions.length > 0 && (
        <div className="pt-3 border-t border-white/5 font-label">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-text mb-2">
            Assigned Operations
          </div>
          <div className="space-y-1.5">
            {member.assignedSessions.map((session, i) => (
              <div
                key={i}
                className="text-[11px] text-off-white/85 bg-black/40 px-2.5 py-1.5 rounded-lg flex items-center gap-2 border border-white/5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-arc-blue shrink-0" />
                <span className="truncate">{session}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
