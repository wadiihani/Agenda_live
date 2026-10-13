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
          time: "",
          type: "logistics",
          title: "Check In",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d1-s1",
          time: "",
          type: "session",
          title: "Opening – Avengers, Assemble",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d1-s2",
          time: "",
          type: "session",
          title: "ESSENCE",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d1-s3",
          time: "",
          type: "break",
          title: "Break",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d1-s4",
          time: "",
          type: "session",
          title: "AIESEC 101 – The Avengers Initiative",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d1-s5",
          time: "",
          type: "session",
          title: "What Is Not a Team? – Not Every Hero Is an Avenger",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d1-s6",
          time: "",
          type: "break",
          title: "Dinner",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d1-s7",
          time: "",
          type: "session",
          title: "Evening Plenary",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d1-s8",
          time: "",
          type: "party",
          title: "Party D1 : XXXX",
          track: "all",
          status: "scheduled"
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
          time: "",
          type: "break",
          title: "Breakfast",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d2-s1",
          time: "",
          type: "session",
          title: "Morning Plenary",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d2-s2",
          time: "",
          type: "session",
          title: "Coach Session – The Ancient One",
          track: "newbies",
          status: "scheduled"
        },
        {
          id: "d2-s3",
          time: "",
          type: "break",
          title: "Break",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d2-s4",
          time: "",
          type: "session",
          title: "Functional Spaces – The Avengers Tower",
          track: "newbies",
          status: "scheduled"
        },
        {
          id: "d2-s5a",
          time: "",
          type: "session",
          title: "Synergy – The Battle Formation",
          track: "newbies",
          status: "scheduled"
        },
        {
          id: "d2-s5b",
          time: "",
          type: "session",
          title: "The Power of the Pitch",
          track: "igv",
          status: "scheduled"
        },
        {
          id: "d2-s6",
          time: "",
          type: "break",
          title: "Lunch",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d2-s7",
          time: "",
          type: "session",
          title: "Types of Cultures – The Multiverse",
          track: "newbies",
          status: "scheduled"
        },
        {
          id: "d2-s8",
          time: "",
          type: "break",
          title: "Break",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d2-s9",
          time: "",
          type: "session",
          title: "Hackathon – Stark Industries: Innovation Lab",
          track: "newbies",
          status: "scheduled"
        },
        {
          id: "d2-s10",
          time: "",
          type: "break",
          title: "Dinner",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d2-s11",
          time: "",
          type: "session",
          title: "Evening Plenary",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d2-s12",
          time: "",
          type: "logistics",
          title: "Gala Preparation",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d2-s13",
          time: "",
          type: "party",
          title: "Gala Night (LCP 27.28 announcement)",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d2-s14",
          time: "",
          type: "party",
          title: "Party D2 : XXXX",
          track: "all",
          status: "scheduled"
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
          time: "",
          type: "break",
          title: "Breakfast",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d3-s1",
          time: "",
          type: "session",
          title: "Morning Plenary",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d3-s2",
          time: "",
          type: "session",
          title: "History of AIESEC – The Avengers Legacy",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d3-s3",
          time: "",
          type: "break",
          title: "Break",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d3-s4",
          time: "",
          type: "session",
          title: "Emotional Intelligence – The BLACK WIDOW Protocol",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d3-s5",
          time: "",
          type: "session",
          title: "The Hierarchy",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d3-s6",
          time: "",
          type: "session",
          title: "Individual Spaces – With Great Responsibilities Come Great Power",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d3-s7",
          time: "",
          type: "break",
          title: "Lunch",
          track: "all",
          status: "scheduled"
        },
        {
          id: "d3-s8",
          time: "",
          type: "session",
          title: "Closing Plenary",
          track: "all",
          status: "scheduled"
        }
      ]
    }
  }
};
