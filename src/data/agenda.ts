/**
 * RABAT CO 26.2 — "AVENGERS ASSEMBLE"
 * Master Agenda Data (Typed Module)
 */

export type SessionStatus = 'scheduled' | 'starting-soon' | 'live' | 'delayed' | 'completed' | 'cancelled';

export type TrackType = 'all' | 'newbies' | 'igv' | 'mms';

export interface SessionResource {
  title: string;
  url: string;
  type?: string;
}

export interface Session {
  id: string;
  time?: string; // HH:mm format (original planned start, if verified)
  startTime?: string;
  endTime?: string; // HH:mm format (original planned end, if verified)
  duration?: number | string; // in minutes or text e.g. "45 min"
  adjustedTime?: string; // HH:mm format (revised start)
  adjustedEndTime?: string; // HH:mm format (revised end)
  delayMinutes?: number;
  status?: SessionStatus;
  type: 'session' | 'break' | 'logistics' | 'party' | string;
  title: string;
  room?: string;
  location?: string; // alias for room
  essence?: string;
  description?: string; // alias for essence
  facilitator?: string;
  responsible?: string; // alias for facilitator
  badge?: 'Director' | 'S.H.I.E.L.D. Agent' | 'Tower Commander' | 'Ops Crew' | string;
  track?: 'all' | 'newbies' | 'igv' | 'mms' | string;
  concreteObjective?: string;
  emotionalObjective?: string;
  learningObjectives?: string[];
  resources?: SessionResource[];
  updatedAt?: string;
}

export function normalizeSession(s: Partial<Session> & Record<string, any>, defaultId: string): Session {
  const room = s.room || s.location || '';
  const facilitator = s.facilitator || s.responsible || '';
  const essence = s.essence || s.description || '';
  const title = s.title || s.name || 'Session';
  const time = s.time || s.startTime || '';
  const endTime = s.endTime || '';

  const objectives = Array.isArray(s.learningObjectives) ? [...s.learningObjectives] : [];
  if (objectives.length === 0) {
    if (s.concreteObjective) objectives.push(`🎯 Concrete: ${s.concreteObjective}`);
    if (s.emotionalObjective) objectives.push(`💖 Emotional: ${s.emotionalObjective}`);
  }

  return {
    id: s.id || defaultId,
    time,
    startTime: time,
    endTime,
    duration: s.duration || '',
    adjustedTime: s.adjustedTime,
    adjustedEndTime: s.adjustedEndTime,
    delayMinutes: s.delayMinutes || 0,
    status: (s.status as SessionStatus) || 'scheduled',
    type: s.type || 'session',
    title,
    room,
    location: room,
    essence,
    description: s.description || essence,
    facilitator,
    responsible: facilitator,
    badge: s.badge,
    track: s.track || 'all',
    concreteObjective: s.concreteObjective || '',
    emotionalObjective: s.emotionalObjective || '',
    learningObjectives: objectives,
    resources: s.resources || [],
    updatedAt: s.updatedAt
  };
}

export interface DaySchedule {
  id: string;
  dayNumber: number;
  date: string; // YYYY-MM-DD (Africa/Casablanca)
  dayOfWeek: string;
  codename: string;
  pillar: string; // From visual identity doc
  tagline: string;
  themeDesc: string;
  accent: 'red' | 'purple' | 'blend';
  track_split: boolean;
  sessions: Session[];
}

export interface ConferenceMeta {
  title: string;
  subtitle: string;
  tagline: string;
  edition: string;
  entity: string;
  datesText: string;
  timezone: string;
  openingDateTime: string; // ISO format
  closingDateTime: string;
  mediaDriveUrl?: string;
  location: string;
  themeStory: string;
  lastUpdated?: string;
  version?: number;
}

export interface ConferenceAgenda {
  meta: ConferenceMeta;
  days: {
    day1: DaySchedule;
    day2: DaySchedule;
    day3: DaySchedule;
  };
}

/**
 * Preserves the exact session title and subtitle
 */
export function formatSessionTitle(title: string): string {
  return title ? title.trim() : '';
}

export const AGENDA_DATA: ConferenceAgenda = {
  meta: {
    title: "Rabat CO 26.2",
    subtitle: "Avengers Assemble",
    tagline: "Different powers. Different perspectives. One team. One mission.",
    edition: "26.2",
    entity: "AIESEC in Rabat",
    datesText: "October 16–18, 2026",
    timezone: "Africa/Casablanca",
    openingDateTime: "2026-10-16T17:00:00",
    closingDateTime: "2026-10-18T17:00:00",
    mediaDriveUrl: "https://drive.google.com/drive/folders/1rabat-co26-2-vault?usp=sharing",
    location: "Rabat, Morocco",
    themeStory: `AIESEC Rabat has spent the last six months in its own kind of Civil War. Not because we lacked talented people — but because our strengths weren't always connected by one common mission. Just like the Avengers, we learned that powerful individuals don't automatically make a powerful team.

This conference is our Endgame moment: not to erase what happened, but to face it — to rebuild trust, reconnect the team, and develop the next generation of Avengers who won't repeat the mistakes of the last one.

Different powers. Different perspectives. One team. One mission.
Avengers, Assemble.`,
    lastUpdated: "2026-10-13T02:30:00Z",
    version: 2
  },
  days: {
    day1: {
      id: "day1",
      dayNumber: 1,
      date: "2026-10-16",
      dayOfWeek: "Friday",
      codename: "Civil War",
      pillar: "CONFLICT • CHOICES • LEADERSHIP",
      tagline: "Facing the fractures & rebuilding trust",
      themeDesc: "Facing the fractures, uncovering lost trust, and discovering what it truly means to assemble.",
      accent: "red",
      track_split: false,
      sessions: [
        {
          id: "d1-s0",
          time: "08:00",
          startTime: "08:00",
          endTime: "17:00",
          duration: "540 min",
          type: "logistics",
          title: "Check In & Credential Briefing",
          room: "Registration Gate • Bifrost Foyer",
          location: "Registration Gate • Bifrost Foyer",
          facilitator: "Command Center",
          responsible: "Command Center",
          track: "all",
          status: "scheduled",
          essence: "Arrival, credential verification, mission pack collection, and operative quarter check-in.",
          concreteObjective: "Complete operational identity verification & receive security credentials",
          emotionalObjective: "Welcome and anticipation"
        },
        {
          id: "d1-s1",
          time: "17:00",
          startTime: "17:00",
          endTime: "18:30",
          duration: "90 min",
          type: "session",
          title: "Opening – Avengers, Assemble",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "The iconic opening moment where all operatives officially convene under one shield.",
          concreteObjective: "Align on conference culture and non-negotiable standards",
          emotionalObjective: "Excitement, energy, and belonging"
        },
        {
          id: "d1-s2",
          time: "18:30",
          startTime: "18:30",
          endTime: "19:15",
          duration: "45 min",
          type: "session",
          title: "AIESEC 101 – The Avengers Initiative",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Wadii",
          responsible: "Wadii",
          track: "all",
          status: "scheduled",
          essence: "Foundational briefing unpacking organizational purpose, leadership development model, and strategic roadmap.",
          concreteObjective: "Understand AIESEC purpose and leadership development model",
          emotionalObjective: "Curiosity, discovery, and pride"
        },
        {
          id: "d1-s3",
          time: "19:15",
          startTime: "19:15",
          endTime: "19:45",
          duration: "30 min",
          type: "break",
          title: "Break – Bifrost Recharge",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Tactical pause, refreshments, and dinner convening before evening operations.",
          concreteObjective: "Recharge energy and bond with fellow operatives",
          emotionalObjective: "Warmth and camaraderie"
        },
        {
          id: "d1-s4",
          time: "19:45",
          startTime: "19:45",
          endTime: "20:45",
          duration: "60 min",
          type: "session",
          title: "What Is Not a Team? – Not Every Hero Is an Avenger",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Soukaina",
          responsible: "Soukaina",
          track: "all",
          status: "scheduled",
          essence: "Deep-dive into team dysfunction, ego traps, and collective synergy.",
          concreteObjective: "Distinguish between an isolated group and a high-performing team",
          emotionalObjective: "Reflection, vulnerability, and trust"
        },
        {
          id: "d1-s5",
          time: "20:45",
          startTime: "20:45",
          endTime: "21:30",
          duration: "45 min",
          type: "session",
          title: "Evening Plenary – The Battle Debrief",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "Day 1 tactical reflection and personal leadership pledges.",
          concreteObjective: "Synthesize key learnings and reflect on day choices",
          emotionalObjective: "Honesty, gratitude, and connection"
        },
        {
          id: "d1-s6",
          time: "21:30",
          startTime: "21:30",
          endTime: "23:45",
          duration: "135 min",
          type: "party",
          title: "Party D1 : Welcome to Asgard",
          room: "Grand Hall • Asgardian Terrace",
          location: "Grand Hall • Asgardian Terrace",
          facilitator: "OC Team",
          responsible: "OC Team",
          track: "all",
          status: "scheduled",
          essence: "First night icebreaking celebration and convening festivities.",
          concreteObjective: "Celebrate community bonds and welcome new operatives",
          emotionalObjective: "High energy, laughter, and unity"
        }
      ]
    },
    day2: {
      id: "day2",
      dayNumber: 2,
      date: "2026-10-17",
      dayOfWeek: "Saturday",
      codename: "Infinity War",
      pillar: "THREAT • SACRIFICE • UNITY",
      tagline: "Mastering specialization & the battle formation",
      themeDesc: "Testing our limits, mastering specialized disciplines, and forging an unbreakable battle formation.",
      accent: "purple",
      track_split: true,
      sessions: [
        {
          id: "d2-s0",
          time: "08:00",
          startTime: "08:00",
          endTime: "09:00",
          duration: "60 min",
          type: "break",
          title: "Morning Energy & Breakfast",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Tactical nutrition and breakfast convening.",
          concreteObjective: "Recharge operatives for full-day mission operations",
          emotionalObjective: "High energy and readiness"
        },
        {
          id: "d2-s1",
          time: "09:00",
          startTime: "09:00",
          endTime: "09:45",
          duration: "45 min",
          type: "session",
          title: "Morning Plenary – Rise of the Avengers",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "Morning keynote re-grounding operatives in the conference mission.",
          concreteObjective: "Set high operational tone and clarify priorities",
          emotionalObjective: "Optimism, clarity, and determination"
        },
        {
          id: "d2-s2",
          time: "09:45",
          startTime: "09:45",
          endTime: "10:30",
          duration: "45 min",
          type: "session",
          title: "Coach Session – The Ancient One",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Imane",
          responsible: "Imane",
          track: "all",
          status: "scheduled",
          essence: "MC national synergy and alignment on organizational trajectory.",
          concreteObjective: "Align LC priorities with national Moroccan direction",
          emotionalObjective: "Trust, inspiration, and unified vision"
        },
        {
          id: "d2-s3",
          time: "10:30",
          startTime: "10:30",
          endTime: "11:45",
          duration: "75 min",
          type: "session",
          title: "Functional Spaces – The Avengers Tower",
          room: "Breakout Rooms • The Avengers Tower",
          location: "Breakout Rooms • The Avengers Tower",
          facilitator: "LCVPs (Soukaina, Wadii, Oussama, Imane)",
          responsible: "LCVPs",
          track: "all",
          status: "scheduled",
          essence: "Specialized functional tracks across all portfolios.",
          concreteObjective: "Master departmental execution strategies and customer journeys",
          emotionalObjective: "Professional mastery and belonging"
        },
        {
          id: "d2-s4a",
          time: "11:45",
          startTime: "11:45",
          endTime: "13:00",
          duration: "75 min",
          type: "session",
          title: "Synergy – The Battle Formation",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Soukaina",
          responsible: "Soukaina",
          track: "newbies",
          status: "scheduled",
          essence: "Cross-functional simulation breaking silos and demonstrating mutual reliance.",
          concreteObjective: "Experience the real cost of operational misalignment",
          emotionalObjective: "Empathy, collaboration, and shared responsibility"
        },
        {
          id: "d2-s4b",
          time: "11:45",
          startTime: "11:45",
          endTime: "13:00",
          duration: "75 min",
          type: "session",
          title: "The Power of the Pitch",
          room: "Wakanda Tech Lab • Executive Board Room",
          location: "Wakanda Tech Lab • Executive Board Room",
          facilitator: "Wadii",
          responsible: "Wadii",
          track: "igv",
          status: "scheduled",
          essence: "High-stakes persuasive communication and pitch simulation for incoming exchange.",
          concreteObjective: "Master the 3-minute pitch structure and handling corporate objections",
          emotionalObjective: "Courage, confidence, and conviction"
        },
        {
          id: "d2-s5",
          time: "13:00",
          startTime: "13:00",
          endTime: "14:15",
          duration: "75 min",
          type: "break",
          title: "Lunch & Tactical Recharge",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Midday meal and team informal discussions.",
          concreteObjective: "Refresh physical energy and network across departments",
          emotionalObjective: "Relaxation and bonding"
        },
        {
          id: "d2-s6",
          time: "14:15",
          startTime: "14:15",
          endTime: "15:30",
          duration: "75 min",
          type: "session",
          title: "The Power of the Pitch – Plenary Synthesis",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Wadii",
          responsible: "Wadii",
          track: "all",
          status: "scheduled",
          essence: "Mastering persuasive communication, storytelling, and stage delivery.",
          concreteObjective: "Deliver effective value propositions to diverse audiences",
          emotionalObjective: "Inspiration and empowerment"
        },
        {
          id: "d2-s7",
          time: "15:30",
          startTime: "15:30",
          endTime: "16:15",
          duration: "45 min",
          type: "session",
          title: "Types of Cultures – The Multiverse",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Oussama",
          responsible: "Oussama",
          track: "all",
          status: "scheduled",
          essence: "Deconstruction of team cultures and behavioral norms.",
          concreteObjective: "Identify productive vs toxic cultural traits in local committees",
          emotionalObjective: "Awareness, responsibility, and cultural pride"
        },
        {
          id: "d2-s8",
          time: "16:15",
          startTime: "16:15",
          endTime: "17:00",
          duration: "45 min",
          type: "session",
          title: "Hackathon – Stark Industries Innovation Lab",
          room: "Creative Labs • Stark Tower",
          location: "Creative Labs • Stark Tower",
          facilitator: "OC & Faci Team",
          responsible: "OC & Faci Team",
          track: "all",
          status: "scheduled",
          essence: "Rapid problem solving sprint addressing LC challenges.",
          concreteObjective: "Develop feasible MVP solutions for member retention and operations",
          emotionalObjective: "Creativity, urgency, and pride in innovation"
        },
        {
          id: "d2-s9",
          time: "17:00",
          startTime: "17:00",
          endTime: "17:45",
          duration: "45 min",
          type: "session",
          title: "Evening Plenary – The Sokovia Accords",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "Confronting accountability, standards, and consequences of choices.",
          concreteObjective: "Commit to non-negotiables and mutual accountability",
          emotionalObjective: "Maturity, respect, and shared resolve"
        },
        {
          id: "d2-s10",
          time: "17:45",
          startTime: "17:45",
          endTime: "21:00",
          duration: "195 min",
          type: "logistics",
          title: "Gala Preparation & Roll Call",
          room: "Operative Quarters",
          location: "Operative Quarters",
          facilitator: "OC Team",
          responsible: "OC Team",
          track: "all",
          status: "scheduled",
          essence: "Wardrobe change, mission readiness check, and gala assembly.",
          concreteObjective: "Prepare for evening gala and formal recognition",
          emotionalObjective: "Elegance, celebration, and anticipation"
        },
        {
          id: "d2-s11",
          time: "21:00",
          startTime: "21:00",
          endTime: "23:30",
          duration: "150 min",
          type: "party",
          title: "Avengers Night – The Asgardian Gala (LCP 27.28 announcement)",
          room: "Grand Hall • Bifrost Terrace",
          location: "Grand Hall • Bifrost Terrace",
          facilitator: "OC Team",
          responsible: "OC Team",
          track: "all",
          status: "scheduled",
          essence: "Conference thematic celebration, awards ceremony, and LCP announcement.",
          concreteObjective: "Celebrate community bonds and shared milestones",
          emotionalObjective: "Pure joy, celebration, and unity"
        },
        {
          id: "d2-s12",
          time: "23:30",
          startTime: "23:30",
          endTime: "02:00",
          duration: "150 min",
          type: "party",
          title: "Party D2 : Infinity Celebration",
          room: "Grand Hall",
          location: "Grand Hall",
          facilitator: "OC Team",
          responsible: "OC Team",
          track: "all",
          status: "scheduled",
          essence: "Late night community celebration and dancing.",
          concreteObjective: "Unwind and celebrate collective achievements",
          emotionalObjective: "Euphoria and connection"
        }
      ]
    },
    day3: {
      id: "day3",
      dayNumber: 3,
      date: "2026-10-18",
      dayOfWeek: "Sunday",
      codename: "Endgame",
      pillar: "LEGACY • REDEMPTION • THE FINAL STAND",
      tagline: "Whatever it takes — our ultimate legacy",
      themeDesc: "Whatever it takes: individual accountability, collective legacy, and sealing our pledge.",
      accent: "blend",
      track_split: true,
      sessions: [
        {
          id: "d3-s0",
          time: "08:30",
          startTime: "08:30",
          endTime: "09:15",
          duration: "45 min",
          type: "break",
          title: "Breakfast & Morning Briefing",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Final day nutritional intake and morning briefing assembly.",
          concreteObjective: "Energize operatives for the climactic conference day",
          emotionalObjective: "Focus and camaraderie"
        },
        {
          id: "d3-s1",
          time: "09:15",
          startTime: "09:15",
          endTime: "10:00",
          duration: "45 min",
          type: "session",
          title: "Morning Plenary – The Final Battle",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "Morning opening framing the transition from learning to action.",
          concreteObjective: "Translate insight into measurable post-conference execution",
          emotionalObjective: "Urgency, courage, and collective momentum"
        },
        {
          id: "d3-s2",
          time: "10:00",
          startTime: "10:00",
          endTime: "10:45",
          duration: "45 min",
          type: "session",
          title: "Emotional Intelligence – The Black Widow Protocol",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Wadii",
          responsible: "Wadii",
          track: "all",
          status: "scheduled",
          essence: "Personal self-awareness, active listening, and emotional regulation.",
          concreteObjective: "Develop actionable empathy in high-pressure leadership moments",
          emotionalObjective: "Self-awareness, compassion, and maturity"
        },
        {
          id: "d3-s3",
          time: "10:45",
          startTime: "10:45",
          endTime: "11:30",
          duration: "45 min",
          type: "session",
          title: "The Hierarchy & Accountability",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Imane",
          responsible: "Imane",
          track: "all",
          status: "scheduled",
          essence: "Organizational chain of command, mentorship, and ownership.",
          concreteObjective: "Clarify reporting expectations and support structures",
          emotionalObjective: "Clarity, confidence, and respect for process"
        },
        {
          id: "d3-s4",
          time: "11:30",
          startTime: "11:30",
          endTime: "12:45",
          duration: "75 min",
          type: "session",
          title: "Individual Spaces – With Great Power Comes Great Responsibility",
          room: "Quiet Reflection Zones • Asgardian Sanctuary",
          location: "Quiet Reflection Zones • Asgardian Sanctuary",
          facilitator: "Oussama",
          responsible: "Oussama",
          track: "all",
          status: "scheduled",
          essence: "Individual introspection and personal leadership commitment letter.",
          concreteObjective: "Formulate 6-month personal leadership pledge",
          emotionalObjective: "Introspection, vulnerability, and deep resolve"
        },
        {
          id: "d3-s5",
          time: "12:45",
          startTime: "12:45",
          endTime: "13:45",
          duration: "60 min",
          type: "break",
          title: "Lunch – Valhalla Banquet",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Farewell lunch with team reflections.",
          concreteObjective: "Celebrate operational milestones",
          emotionalObjective: "Gratitude and affection"
        },
        {
          id: "d3-s6",
          time: "13:45",
          startTime: "13:45",
          endTime: "15:30",
          duration: "105 min",
          type: "session",
          title: "Closing – The Endgame",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "The grand emotional finale, leadership pass-on, and assembly pledge.",
          concreteObjective: "Commit to post-conference impact and local committee victory",
          emotionalObjective: "Transcendence, emotional climax, and eternal unity"
        }
      ]
    }
  }
};
