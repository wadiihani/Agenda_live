/**
 * RABAT CO 26.2 — "AVENGERS ASSEMBLE"
 * Master Agenda Data (Typed Module)
 */

export type SessionStatus = 'scheduled' | 'starting-soon' | 'live' | 'delayed' | 'completed' | 'cancelled';

export interface SessionResource {
  title: string;
  url: string;
  type?: string;
}

export interface Session {
  id: string;
  time: string; // HH:mm format (original planned start)
  endTime?: string; // HH:mm format (original planned end)
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
  track?: 'all' | 'newbies' | 'mms' | string;
  concreteObjective?: string;
  emotionalObjective?: string;
  learningObjectives?: string[];
  resources?: SessionResource[];
  updatedAt?: string;
}

export function normalizeSession(s: Partial<Session> & Record<string, any>, defaultId: string): Session {
  const room = s.room || s.location || 'Plenary Hall • Valhalla Grand Stage';
  const facilitator = s.facilitator || s.responsible || '';
  const essence = s.essence || s.description || '';
  const title = s.title || s.name || 'Session';
  const time = s.time || s.startTime || '09:00';
  const endTime = s.endTime || '';

  const objectives = Array.isArray(s.learningObjectives) ? [...s.learningObjectives] : [];
  if (objectives.length === 0) {
    if (s.concreteObjective) objectives.push(`🎯 Concrete: ${s.concreteObjective}`);
    if (s.emotionalObjective) objectives.push(`💖 Emotional: ${s.emotionalObjective}`);
  }

  return {
    id: s.id || defaultId,
    time,
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
 * Returns only the name after "-" / "–" / "—" if present, otherwise returns original title
 */
export function formatSessionTitle(title: string): string {
  const match = title.match(/^[^–—-]*[–—-]\s*(.+)$/);
  return match ? match[1].trim() : title.trim();
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
Avengers, Assemble.`
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
          type: "logistics",
          title: "Check In",
          essence: "Arrival, credential verification, mission pack collection, and room allotment."
        },
        {
          id: "d1-s1",
          time: "17:00",
          type: "session",
          title: "Avengers, Assemble!",
          essence: "The iconic moment where everyone officially comes together.",
          facilitator: "Chair",
          badge: "Director"
        },
        {
          id: "d1-s2",
          time: "18:30",
          type: "session",
          title: "The Avengers Initiative",
          essence: "Understanding what brought the Avengers together and connecting it to AIESEC's purpose.",
          facilitator: "Wadii",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d1-s3",
          time: "19:15",
          type: "break",
          title: "Break",
          essence: "Tactical recharge and plenary hall transition."
        },
        {
          id: "d1-s4",
          time: "19:30",
          type: "session",
          title: "The Broken Shield",
          essence: "Captain America's shield as a symbol of trust, identity, and something that can be damaged and rebuilt.",
          facilitator: "Soukaina",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d1-s5",
          time: "20:15",
          type: "session",
          title: "The Captain's Shield",
          essence: "Leadership, responsibility, and stepping up when others need you.",
          facilitator: "Meryem",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d1-s6",
          time: "21:00",
          type: "break",
          title: "Dinner",
          essence: "Mess Hall Refuel & Squad Bonding."
        },
        {
          id: "d1-s7",
          time: "21:45",
          type: "session",
          title: "Not Every Hero Is an Avenger",
          essence: "Having powerful individuals does not automatically create a team.",
          facilitator: "Oussama",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d1-s8",
          time: "22:45",
          type: "session",
          title: "The Battle Debrief",
          essence: "Reflecting on what happened and preparing for the next mission.",
          facilitator: "Chair",
          badge: "Director"
        },
        {
          id: "d1-s9",
          time: "23:45",
          type: "party",
          title: "Stark Expo Nights",
          essence: "Unwind, celebrate day one breakthroughs, and bond with your fellow operatives."
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
      track_split: false,
      sessions: [
        {
          id: "d2-s0",
          time: "08:15",
          type: "break",
          title: "Breakfast",
          essence: "Fueling up for an intense day of tactical workshops."
        },
        {
          id: "d2-s1",
          time: "09:30",
          type: "session",
          track: "all",
          title: "Rise of the Avengers",
          essence: "Starting the next chapter with renewed energy.",
          facilitator: "Chair",
          badge: "Director"
        },
        {
          id: "d2-s2",
          time: "10:30",
          type: "session",
          track: "all",
          title: "The Ancient One",
          essence: "Wisdom, guidance, and helping others see beyond their current perspective.",
          facilitator: "Imane",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d2-s3",
          time: "11:15",
          type: "break",
          title: "Break",
          essence: "Transition to functional spaces."
        },
        {
          id: "d2-s4",
          time: "11:30",
          type: "session",
          track: "all",
          title: "The Avengers Tower",
          essence: "Different heroes have different specialties, but they operate from one headquarters.",
          facilitator: "LCVPs (Soukaina, Wadii, Oussama, Imane)",
          badge: "Tower Commander"
        },
        {
          id: "d2-s5",
          time: "12:30",
          type: "session",
          track: "all",
          title: "The Battle Formation",
          essence: "Heroes with different abilities become powerful when they work together.",
          facilitator: "Soukaina",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d2-s6",
          time: "14:00",
          type: "break",
          title: "Lunch",
          essence: "Squad recharge and fellowship."
        },
        {
          id: "d2-s7",
          time: "15:00",
          type: "session",
          track: "all",
          title: "The Multiverse",
          essence: "Different worlds have different cultures, values, and ways of operating.",
          facilitator: "Oussama",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d2-s8",
          time: "15:45",
          type: "break",
          title: "Break",
          essence: "Pre-hackathon setup and team assembling."
        },
        {
          id: "d2-s9",
          time: "16:00",
          type: "session",
          track: "all",
          title: "Stark Industries: Innovation Lab",
          essence: "A high-energy creation challenge where teams build something under pressure.",
          facilitator: "TBD",
          badge: "Ops Crew"
        },
        {
          id: "d2-s10",
          time: "18:45",
          type: "break",
          title: "Dinner",
          essence: "Evening refuel before the grand accords and gala."
        },
        {
          id: "d2-s11",
          time: "19:15",
          type: "session",
          track: "all",
          title: "The Sokovia Accords",
          essence: "Bringing everyone together to discuss what was created and align on what comes next.",
          facilitator: "Chair",
          badge: "Director"
        },
        {
          id: "d2-s12",
          time: "20:15",
          type: "logistics",
          title: "Gala Preparation",
          essence: "Suiting up for the flagship black-tie evening."
        },
        {
          id: "d2-s13",
          time: "21:00",
          type: "party",
          title: "Gala Night",
          essence: "Honoring achievements, celebrating our journey, and flagship black-tie evening."
        },
        {
          id: "d2-s14",
          time: "23:30",
          type: "party",
          title: "The Guardians' Groove",
          essence: "High-octane after-gala celebration."
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
      track_split: false,
      sessions: [
        {
          id: "d3-s0",
          time: "08:15",
          type: "break",
          title: "Breakfast",
          essence: "Final morning briefing refuel."
        },
        {
          id: "d3-s1",
          time: "09:30",
          type: "session",
          track: "all",
          title: "The Final Battle",
          essence: "The team enters its last major chapter together.",
          facilitator: "Chair",
          badge: "Director"
        },
        {
          id: "d3-s2",
          time: "10:30",
          type: "session",
          track: "all",
          title: "The Avengers Legacy",
          essence: "Looking back at where the movement came from and what previous generations built.",
          facilitator: "Meryem",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d3-s3",
          time: "11:15",
          type: "break",
          title: "Break",
          essence: "Plenary regrouping and room transition."
        },
        {
          id: "d3-s4",
          time: "11:45",
          type: "session",
          track: "all",
          title: "Black Widow Protocol",
          essence: "A reference to emotional awareness, reading people, empathy, and understanding complex situations.",
          facilitator: "Wadii",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d3-s5",
          time: "12:45",
          type: "session",
          track: "all",
          title: "The Phoenix Protocol",
          essence: "Falling, adapting, and coming back stronger.",
          facilitator: "Soukaina",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d3-s6",
          time: "13:45",
          type: "session",
          track: "all",
          title: "With Great Responsibilities Come Great Power",
          essence: "Moving away from the team and asking: Who am I as an individual?",
          facilitator: "Oussama",
          badge: "S.H.I.E.L.D. Agent"
        },
        {
          id: "d3-s7",
          time: "14:45",
          type: "break",
          title: "Lunch",
          essence: "Final conference luncheon."
        },
        {
          id: "d3-s8",
          time: "15:30",
          type: "session",
          track: "all",
          title: "The Endgame",
          essence: "Final reflection, commitments, and closing of the experience.",
          facilitator: "Chair",
          badge: "Director"
        }
      ]
    }
  }
};
