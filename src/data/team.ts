/**
 * RABAT CO 26.2 — "AVENGERS ASSEMBLE"
 * Master S.H.I.E.L.D. Team & Operations Roster (Typed Module)
 */

export type RoleBadgeType = 'director' | 'agent' | 'commander' | 'ops';

export interface TeamMember {
  id: string;
  name: string;
  callsign: string;
  role: string;
  badge: 'Director' | 'S.H.I.E.L.D. Agent' | 'Tower Commander' | 'Ops Crew';
  badgeType: RoleBadgeType;
  bio: string;
  status?: string;
  assignedSessions: string[];
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "chair",
    name: "Conference Chair",
    callsign: "Nick Fury",
    role: "Conference Chair & Head of Plenary",
    badge: "Director",
    badgeType: "director",
    bio: "Overseeing the overarching mission arc, guiding plenaries, and holding the delegation accountable to the Endgame vision.",
    assignedSessions: [
      "Avengers, Assemble! (Day 1)",
      "The Battle Debrief (Day 1)",
      "Rise of the Avengers (Day 2)",
      "The Sokovia Accords (Day 2)",
      "The Final Battle (Day 3)",
      "The Endgame (Day 3)"
    ]
  },
  {
    id: "soukaina",
    name: "Soukaina",
    callsign: "Valkyrie",
    role: "LCVP & S.H.I.E.L.D. Committee",
    badge: "S.H.I.E.L.D. Agent",
    badgeType: "agent",
    bio: "Specializing in trust reconstruction, cross-functional synergy, and cultivating unshakeable resilience under adversity.",
    assignedSessions: [
      "The Broken Shield (Day 1)",
      "The Battle Formation (Day 2)",
      "The Phoenix Protocol (Day 3)",
      "The Avengers Tower (Day 2)"
    ]
  },
  {
    id: "wadii",
    name: "Wadii",
    callsign: "Hawkeye / Visionary",
    role: "LCVP & S.H.I.E.L.D. Committee",
    badge: "S.H.I.E.L.D. Agent",
    badgeType: "agent",
    bio: "Specializing in organizational identity, emotional intelligence, and anchoring core values through deep reflection.",
    assignedSessions: [
      "The Avengers Initiative (Day 1)",
      "Black Widow Protocol (Day 3)",
      "The Avengers Tower (Day 2)"
    ]
  },
  {
    id: "oussama",
    name: "Oussama",
    callsign: "Doctor Strange",
    role: "LCVP & S.H.I.E.L.D. Committee",
    badge: "S.H.I.E.L.D. Agent",
    badgeType: "agent",
    bio: "Analyzing team dynamics, cross-cultural multiverses, and individual accountability with surgical clarity.",
    assignedSessions: [
      "Not Every Hero Is an Avenger (Day 1)",
      "The Multiverse (Day 2)",
      "With Great Responsibilities Come Great Power (Day 3)",
      "The Avengers Tower (Day 2)"
    ]
  },
  {
    id: "imane",
    name: "Imane",
    callsign: "The Ancient One / Scarlet Witch",
    role: "LCVP & S.H.I.E.L.D. Committee",
    badge: "S.H.I.E.L.D. Agent",
    badgeType: "agent",
    bio: "Driving frontline leadership accountability, heritage preservation, wisdom, and guiding delegates through foundational mindset shifts.",
    assignedSessions: [
      "The Captain's Shield (Day 1)",
      "The Ancient One (Day 2)",
      "The Avengers Legacy (Day 3)",
      "The Avengers Tower (Day 2)"
    ]
  },
  {
    id: "ops-registration",
    name: "Registration Desk",
    callsign: "Clearance Gate",
    role: "Credentials, Delegate Check-In & Pack Logistics",
    badge: "Ops Crew",
    badgeType: "ops",
    status: "TBD / Ready to Deploy",
    bio: "Ensuring smooth arrival, credential verification, and mission kit handover for every delegate entering the compound.",
    assignedSessions: ["Check In (Day 1)"]
  },
  {
    id: "ops-tech",
    name: "AV & Tech Unit",
    callsign: "J.A.R.V.I.S. Audio-Visual",
    role: "Sound, Visuals, Lighting & Plenary Stage Support",
    badge: "Ops Crew",
    badgeType: "ops",
    status: "TBD / Ready to Deploy",
    bio: "Powering plenary multimedia, microphone feeds, presentation synchronization, and ambient stage energy.",
    assignedSessions: ["All Plenaries & Stage Sessions"]
  },
  {
    id: "ops-ushers",
    name: "Ushers & Wayfinding",
    callsign: "Perimeter Guides",
    role: "Crowd Flow, Room Transitions & Punctuality",
    badge: "Ops Crew",
    badgeType: "ops",
    status: "TBD / Ready to Deploy",
    bio: "Maintaining punctual rotations between plenaries, workshops, and mess halls across the venue grounds.",
    assignedSessions: ["Transitions & Room Breakouts"]
  },
  {
    id: "ops-photo",
    name: "Media & Photography",
    callsign: "Archival Eye",
    role: "Conference Photo, Video & Social Media Documentation",
    badge: "Ops Crew",
    badgeType: "ops",
    status: "TBD / Ready to Deploy",
    bio: "Capturing key milestones, team memories, and the historic Endgame moments across all three days.",
    assignedSessions: ["Full Conference Documentation"]
  }
];
