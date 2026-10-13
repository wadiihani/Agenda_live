import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TEAM_MEMBERS, RoleBadgeType } from '../data/team';
import { TeamCard } from './TeamCard';

export const RosterGrid: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | RoleBadgeType>('all');

  const filters: { id: 'all' | RoleBadgeType; label: string }[] = [
    { id: 'all', label: 'All Personnel' },
    { id: 'director', label: 'Directors' },
    { id: 'agent', label: 'S.H.I.E.L.D. Agents' },
    { id: 'commander', label: 'Tower Commanders' },
    { id: 'ops', label: 'Ops Crew' },
  ];

  const filteredMembers =
    activeFilter === 'all'
      ? TEAM_MEMBERS
      : TEAM_MEMBERS.filter((m) => m.badgeType === activeFilter);

  return (
    <div className="w-full">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none font-label select-none">
        {filters.map((f) => {
          const isActive = activeFilter === f.id;

          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`relative px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-off-white font-bold'
                  : 'text-muted-text hover:text-off-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeRosterFilter"
                  className="absolute inset-0 bg-white/12 border border-white/25 rounded-full -z-10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.4)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredMembers.map((member, index) => (
          <TeamCard key={member.id} member={member} index={index} />
        ))}
      </div>
    </div>
  );
};
