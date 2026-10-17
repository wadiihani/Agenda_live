/**
 * RABAT CO 26.2 (v2 — Avengers Theme)
 * Master Agenda Data (Typed Module)
 * Authoritative Timetable & Session Metadata
 */

export type SessionStatus = 'scheduled' | 'starting-soon' | 'live' | 'delayed' | 'completed' | 'cancelled';

export type TrackType = 'all' | 'newbies' | 'igv' | 'mms' | 'day0' | 'parents' | string;

export interface SessionResource {
  title: string;
  url: string;
  type?: string;
}

export interface Session {
  id: string;
  time?: string; // HH:mm format (original planned start)
  startTime?: string;
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
  sessionOverview?: string;
  outline?: string[];
  facilitator?: string;
  responsible?: string; // alias for facilitator
  badge?: 'Director' | 'S.H.I.E.L.D. Agent' | 'Tower Commander' | 'Ops Crew' | string;
  track?: TrackType;
  isOvernight?: boolean;
  day?: string | number;
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
    sessionOverview: s.sessionOverview || '',
    outline: Array.isArray(s.outline) ? s.outline : [],
    facilitator,
    responsible: facilitator,
    badge: s.badge,
    track: (s.track as TrackType) || 'all',
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
  focus?: string;
  objective?: string;
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
  themeTitle: string;
  themeStory: string;
  internalObjectives: string[];
  lastUpdated?: string;
  version?: number;
}

export interface ConferenceAgenda {
  meta: ConferenceMeta;
  days: {
    day1: DaySchedule;
    day2: DaySchedule;
    day3: DaySchedule;
    day0?: DaySchedule;
    lcm?: DaySchedule;
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
    title: "ASGARD'CO 26",
    subtitle: "Rabat'CO 26.2 — Avengers Theme",
    tagline: "Different powers. Different perspectives. One team. One mission.",
    edition: "26.2 (v2)",
    entity: "AIESEC in Rabat",
    datesText: "October 16–18, 2026",
    timezone: "Africa/Casablanca",
    openingDateTime: "2026-10-16T17:00:00",
    closingDateTime: "2026-10-18T17:00:00",
    mediaDriveUrl: "https://drive.google.com/drive/folders/1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX?usp=drive_link",
    location: "Rabat, Morocco",
    themeTitle: "AVENGERS (Rabat'CO 26.2 / ASGARD'CO 26)",
    themeStory: `AIESEC Rabat has spent the last six months in its own kind of Civil War. Not because we lacked talented people. Not because we lacked potential. But because our strengths were not always connected by one common mission. Leadership became disconnected. Conflicts created distance. Departments became more siloed. Functional capacity was not always strong enough to execute. Marketing struggled to create intentional attraction, while OPEX faced conversion and execution challenges. IR and ER connections were not strong enough, and the LC gradually lost some of the unity and accountability needed to move as one team.

Just like the Avengers, we discovered that having powerful individuals does not automatically create a powerful team. Iron Man has his strengths. Captain America has his strengths. But when the Avengers stop trusting, communicating and aligning, their powers become useless against the real threat.

This conference is our Avengers: Endgame moment. We are not here to erase what happened. We are here to face it. To understand the conflicts. To take accountability. To reconnect the team. To rebuild leadership. To strengthen our functional capacity. And most importantly, to develop the next generation of Avengers who will not repeat the mistakes of the previous one.

Because the goal is not to create one hero who saves Rabat. The goal is to build a team capable of saving itself. Different powers. Different perspectives. One team. One mission. Avengers, Assemble.`,
    internalObjectives: [
      "Unity & Connection",
      "Leadership Development",
      "Functional Capacity",
      "Cross-Functional Collaboration",
      "Member Engagement",
      "Ownership & Accountability",
      "Succession & Legacy",
      "LC Alignment",
      "Action & Commitment"
    ],
    lastUpdated: "2026-10-16T17:00:00Z",
    version: 5
  },
  days: {
    day1: {
      id: "day1",
      dayNumber: 1,
      date: "2026-10-16",
      dayOfWeek: "Friday",
      codename: "Civil War",
      pillar: "CONFLICT • CHOICES • LEADERSHIP",
      tagline: "Understand the Power of Unity",
      focus: "Understand the Power of Unity",
      objective: "Recognize what makes a team strong or divided",
      themeDesc: "Explore how communication, trust, leadership and alignment shape a team. Use the Avengers story and LC reality as context to understand the consequences of division, without focusing on blame or past failures.",
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
          title: "Check In",
          room: "Registration Gate • Bifrost Foyer",
          location: "Registration Gate • Bifrost Foyer",
          facilitator: "Command Center",
          responsible: "Command Center",
          track: "all",
          status: "completed",
          essence: "Registration Gate open from 08:00 to 17:00 for security credential verification & mission packs.",
          concreteObjective: "Complete operational identity verification & receive security credentials.",
          emotionalObjective: "Welcome and anticipation."
        },
        {
          id: "d1-s1",
          time: "17:00",
          startTime: "17:00",
          endTime: "18:30",
          duration: "90 min",
          type: "session",
          title: "Opening – Avengers, Assemble!",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "The iconic opening moment officially convening all operatives under one vision.",
          concreteObjective: "Officially launch the conference by establishing its purpose, objectives, expectations, culture, and shared vision.",
          emotionalObjective: "Excitement, energy, belonging, pride."
        },
        {
          id: "d1-s2",
          time: "18:30",
          startTime: "18:30",
          endTime: "19:30",
          duration: "60 min",
          type: "session",
          title: "ESSENCE",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Meryem",
          responsible: "Meryem",
          badge: "Director",
          track: "all",
          status: "scheduled",
          sessionOverview: "Reflective space + guiding the thinking process emphasizing the formation of the WHY. Explain the core value of AIESEC and connect the members with that core.",
          essence: "Reflective space + guiding the thinking process emphasizing the formation of the WHY. Explain the core value of AIESEC and connect the members with that core.",
          concreteObjective: "Develop delegates' understanding of effective leadership, focusing on responsibility, influence, self-awareness, decision-making, and impact.",
          emotionalObjective: "Empowerment, self-awareness, responsibility, inspiration."
        },
        {
          id: "d1-s3",
          time: "19:30",
          startTime: "19:30",
          endTime: "19:45",
          duration: "15 min",
          type: "break",
          title: "Break",
          room: "Asgardian Dining Hall / Foyer",
          location: "Asgardian Dining Hall / Foyer",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Tactical pause, refreshments, and informal networking.",
          concreteObjective: "Recharge energy and connect with peers.",
          emotionalObjective: "Relaxation and camaraderie."
        },
        {
          id: "d1-s4",
          time: "19:45",
          startTime: "19:45",
          endTime: "20:45",
          duration: "60 min",
          type: "session",
          title: "AIESEC 101 – The Avengers Initiative",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Wadii Hani",
          responsible: "Wadii Hani",
          badge: "Director",
          track: "all",
          status: "scheduled",
          essence: "Foundational briefing unpacking organizational purpose, structure, identity, leadership model, and strategic roadmap.",
          concreteObjective: "Ensure delegates understand AIESEC's purpose, structure, identity, leadership model, and how their role contributes to the organization.",
          emotionalObjective: "Curiosity, discovery, connection, pride."
        },
        {
          id: "d1-s5",
          time: "20:45",
          startTime: "20:45",
          endTime: "21:15",
          duration: "30 min",
          type: "break",
          title: "Break",
          room: "Asgardian Dining Hall / Foyer",
          location: "Asgardian Dining Hall / Foyer",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Tactical pause and refreshments before evening operations.",
          concreteObjective: "Recharge energy and bond with fellow operatives.",
          emotionalObjective: "Warmth and camaraderie."
        },
        {
          id: "d1-s6",
          time: "21:15",
          startTime: "21:15",
          endTime: "23:00",
          duration: "105 min",
          type: "session",
          title: "What Is Not a Team? – Not Every Hero Is an Avenger",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Soukaina",
          responsible: "Soukaina",
          badge: "Director",
          track: "all",
          status: "scheduled",
          sessionOverview: "Personal storytelling, reflection, and audience interaction.",
          essence: "Personal storytelling, reflection, and audience interaction examining teamwork, accountability, and the cost of division.",
          concreteObjective: "Enable delegates to distinguish between a group and a high-performing team and identify the elements required for effective teamwork.",
          emotionalObjective: "Reflection, realization, vulnerability, connection.",
          outline: [
            "The Hero Before AIESEC: Being part of a team doesn't automatically mean working as a team — Your personality before joining AIESEC and your journey outside your comfort zone.",
            "Discovering AIESEC: Joining AIESEC and expecting to experience connection and teamwork.",
            "A Team in Name Only: Your first team experience, lack of participation and accountability, and how this made you feel like you were working alone.",
            "The Impact We Have on Others: Your actions affect other people's experiences. Accountability and participation help teammates feel supported; failing to communicate or fulfill responsibilities can create additional burdens for others.",
            "The People Who Showed Up: A strong team requires more than individual talent. It needs trust, communication, reliability, shared responsibility, and a common purpose.",
            "From Member to EB: Your decision to take on greater responsibility and move directly from member to EB.",
            "From Individuals to One Team: How your EB evolved from seven members with different backgrounds into a more united team of four.",
            "From My Story to Our LC: Unity doesn't mean everyone is the same. Different roles and strengths must contribute to one shared vision.",
            "Closing: Not Every Hero Is an Avenger: One LC, one vision, one team. Every member and department has a role in the LC's collective success. Personal reflection and one commitment each delegate will make to improve their team's experience."
          ]
        },
        {
          id: "d1-s7",
          time: "23:00",
          startTime: "23:00",
          endTime: "00:00",
          duration: "60 min",
          type: "break",
          title: "Dinner",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Dinner convening and informal delegation debriefing.",
          concreteObjective: "Recharge physical stamina and connect across functions.",
          emotionalObjective: "Warmth, camaraderie, and belonging."
        },
        {
          id: "d1-s8",
          time: "00:00",
          startTime: "00:00",
          endTime: "01:15",
          duration: "75 min",
          type: "session",
          title: "Evening Plenary – The Battle Debrief",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "Day 1 tactical reflection, lessons learned, and personal team commitments.",
          concreteObjective: "Allow delegates to reflect on the day, identify key learnings and challenges, and connect their experiences to their personal and team development.",
          emotionalObjective: "Reflection, honesty, gratitude, connection."
        },
        {
          id: "d1-s9",
          time: "01:15",
          startTime: "01:15",
          endTime: "04:00",
          duration: "165 min",
          type: "party",
          title: "Party – Day 1",
          room: "Grand Hall • Asgardian Terrace",
          location: "Grand Hall • Asgardian Terrace",
          facilitator: "OC Team",
          responsible: "OC Team",
          track: "all",
          isOvernight: true,
          day: 1,
          status: "scheduled",
          essence: "First night icebreaking celebration, festive music, and social connection following Day 1 evening activities.",
          concreteObjective: "Celebrate community bonds and welcome operatives into the Avengers cohort.",
          emotionalObjective: "High energy, laughter, and unity."
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
      tagline: "Discover Your Power inside the Unity",
      focus: "Discover Your Power inside the Unity",
      objective: "Build individual and collective capacity",
      themeDesc: "Just as every Avenger brings a different power to the battlefield, every new member brings different talents, perspectives and potential. Participants discover their role, develop essential leadership and functional skills, and experience how different functions work together. The goal is to transform a group of new recruits into a team that understands its power and knows how to use it together.",
      accent: "purple",
      track_split: true,
      sessions: [
        {
          id: "d2-s0",
          time: "08:00",
          startTime: "08:00",
          endTime: "09:30",
          duration: "90 min",
          type: "break",
          title: "Breakfast",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Nutritional intake and morning energy recharge before intensive operations.",
          concreteObjective: "Recharge operatives for full-day mission operations.",
          emotionalObjective: "High energy and readiness."
        },
        {
          id: "d2-s1",
          time: "09:30",
          startTime: "09:30",
          endTime: "10:30",
          duration: "60 min",
          type: "session",
          title: "Morning Plenary – Rise of the Avengers",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "Morning opening aligning priorities, inspiring high energy, and framing Day 2 objectives.",
          concreteObjective: "Reconnect delegates with the conference purpose, communicate the day's priorities, and motivate them to actively participate.",
          emotionalObjective: "Energy, motivation, optimism, readiness."
        },
        {
          id: "d2-s2",
          time: "10:30",
          startTime: "10:30",
          endTime: "11:45",
          duration: "75 min",
          type: "session",
          title: "Coach Session – The Ancient One",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Iman",
          responsible: "Iman",
          badge: "Director",
          track: "all",
          status: "scheduled",
          essence: "National MC alignment establishing national vision, priorities, and LC Moroccan trajectory.",
          concreteObjective: "Connect the LC with the MC by creating alignment around the national vision, priorities, and direction, ensuring delegates understand how their LC objectives and actions contribute to the broader AIESEC Morocco vision.",
          emotionalObjective: "Alignment, connection, trust, inspiration."
        },
        {
          id: "d2-s3",
          time: "11:45",
          startTime: "11:45",
          endTime: "12:45",
          duration: "60 min",
          type: "session",
          title: "Types of Cultures – The Multiverse",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Oussama",
          responsible: "Oussama",
          badge: "Director",
          track: "all",
          status: "scheduled",
          essence: "Organizational culture deconstruction, behavior impact analysis, and culture building.",
          concreteObjective: "Enable delegates to identify different organizational cultures, understand their impact on behavior and performance, and assess their own LC culture.",
          emotionalObjective: "Curiosity, awareness, reflection, responsibility.",
          outline: [
            "What is a culture (10m): Culture is the unwritten rules that shape how people behave (Secret instruction cards interactive activity & debrief).",
            "Why Culture Matters (5m): Culture shapes behavior, performance, belonging, and accountability (Comparison of two fictional LCs: perfect strategy/poor culture vs. average strategy/strong ownership).",
            "The Multiverse (15m): Different cultures prioritize different values and ways of working — Clan (Collaborate), Adhocracy (Create), Market (Compete), and Hierarchy (Control) four-corners exploration.",
            "Same Challenge, Different Universes (5m): 5-minute freestanding playing-card tower challenge under secret cultural rules.",
            "The Culture We Want to Create (5m): Identifying one concrete behavior delegates want to bring into their teams.",
            "Choose Your Universe: Framing the Hackathon as the first battlefield to turn chosen culture into action."
          ]
        },
        {
          id: "d2-s4",
          time: "12:45",
          startTime: "12:45",
          endTime: "13:30",
          duration: "45 min",
          type: "break",
          title: "Lunch",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Midday lunch break and informal networking.",
          concreteObjective: "Recharge physical energy and connect with team members.",
          emotionalObjective: "Relaxation and connection."
        },
        {
          id: "d2-s5",
          time: "13:30",
          startTime: "13:30",
          endTime: "15:30",
          duration: "120 min",
          type: "session",
          title: "Functional Spaces – The Avengers Tower",
          room: "Breakout Rooms • The Avengers Tower",
          location: "Breakout Rooms • The Avengers Tower",
          facilitator: "LCVPs (including Oussama for [oGT])",
          responsible: "LCVPs",
          badge: "Tower Commander",
          track: "all",
          status: "scheduled",
          essence: "Departmental functional breakouts across all portfolios examining operational pipelines and responsibilities.",
          concreteObjective: "Enable delegates to understand AIESEC functions, their responsibilities, and how each function contributes to overall organizational performance.",
          emotionalObjective: "Curiosity, clarity, appreciation, belonging.",
          outline: [
            "The Call to Assemble (7m): Every hero needs to understand the mission before taking action — Avengers Tower scenario helping a young Moroccan access an international opportunity.",
            "Discover Your Powers: oGTa and oGTe create opportunities for people to develop through international professional and teaching experiences (exploring two fictional candidate profiles).",
            "Inside the Mission Pipeline: Every stage of the journey contributes to delivering a successful experience."
          ]
        },
        {
          id: "d2-s6a",
          time: "15:30",
          startTime: "15:30",
          endTime: "17:15",
          duration: "105 min",
          type: "session",
          title: "Synergy – The Battle Formation",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Soukaina",
          responsible: "Soukaina",
          badge: "Director",
          track: "newbies",
          status: "scheduled",
          essence: "Cross-functional collaborative simulation breaking silos and demonstrating mutual dependence across departments.",
          concreteObjective: "Demonstrate the importance of cross-functional collaboration and help delegates understand how functions depend on one another to achieve results.",
          emotionalObjective: "Connection, cooperation, trust, collective motivation."
        },
        {
          id: "d2-s6b",
          time: "15:30",
          startTime: "15:30",
          endTime: "17:15",
          duration: "105 min",
          type: "session",
          title: "The Power of the Pitch",
          room: "Wakanda Tech Lab • Executive Board Room",
          location: "Wakanda Tech Lab • Executive Board Room",
          facilitator: "Wadii",
          responsible: "Wadii",
          badge: "Director",
          track: "igv",
          status: "scheduled",
          essence: "High-impact persuasive pitch training, objection handling, and executive communication.",
          concreteObjective: "Develop delegates' ability to communicate ideas clearly, confidently, and persuasively while adapting their message to their audience.",
          emotionalObjective: "Courage, confidence, challenge, accomplishment."
        },
        {
          id: "d2-s7",
          time: "17:15",
          startTime: "17:15",
          endTime: "17:30",
          duration: "15 min",
          type: "break",
          title: "Break",
          room: "Asgardian Dining Hall / Foyer",
          location: "Asgardian Dining Hall / Foyer",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Brief intermission before the innovation hackathon.",
          concreteObjective: "Rest and gather materials for the hackathon.",
          emotionalObjective: "Readiness and focus."
        },
        {
          id: "d2-s8",
          time: "17:30",
          startTime: "17:30",
          endTime: "20:00",
          duration: "150 min",
          type: "session",
          title: "Hackathon – Stark Industries: Innovation Lab",
          room: "Creative Labs • Stark Tower",
          location: "Creative Labs • Stark Tower",
          facilitator: "OC & Faci Team",
          responsible: "OC & Faci Team",
          track: "all",
          status: "scheduled",
          essence: "High-intensity innovation sprint tackling real Local Committee operational challenges with cross-functional teams.",
          concreteObjective: "Enable delegates to identify a real organizational problem, analyze its causes, develop an innovative solution, and present a feasible implementation plan.",
          emotionalObjective: "Creativity, excitement, competition, ownership."
        },
        {
          id: "d2-s9",
          time: "20:00",
          startTime: "20:00",
          endTime: "21:00",
          duration: "60 min",
          type: "break",
          title: "Dinner",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Dinner convening before the evening plenary.",
          concreteObjective: "Recharge energy and celebrate hackathon submissions.",
          emotionalObjective: "Pride, warmth, and relief."
        },
        {
          id: "d2-s10",
          time: "21:00",
          startTime: "21:00",
          endTime: "22:00",
          duration: "60 min",
          type: "session",
          title: "Evening Plenary – The Sokovia Accords",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "Deep debrief on accountability, team alignment, tough decisions, and the consequences of individual vs collective choices.",
          concreteObjective: "Develop delegates' ability to reflect on decision-making, responsibility, disagreement, and the consequences of individual versus collective choices.",
          emotionalObjective: "Reflection, tension, critical thinking, maturity."
        },
        {
          id: "d2-s11",
          time: "22:00",
          startTime: "22:00",
          endTime: "22:45",
          duration: "45 min",
          type: "logistics",
          title: "Gala Preparation",
          room: "Operative Quarters",
          location: "Operative Quarters",
          facilitator: "OC Team",
          responsible: "OC Team",
          track: "all",
          status: "scheduled",
          essence: "Wardrobe change into formal gala attire and assembly readiness check.",
          concreteObjective: "Prepare for evening gala and formal recognition.",
          emotionalObjective: "Elegance, celebration, and anticipation."
        },
        {
          id: "d2-s12",
          time: "22:45",
          startTime: "22:45",
          endTime: "01:15",
          duration: "150 min",
          type: "party",
          title: "Gala Night (LCP 27.28 Announcement)",
          room: "Grand Hall • Bifrost Pavilion",
          location: "Grand Hall • Bifrost Pavilion",
          facilitator: "OC Team",
          responsible: "OC Team",
          track: "all",
          status: "scheduled",
          essence: "Grand annual gala celebration, awards recognition, and the historic LCP 27.28 election announcement.",
          concreteObjective: "Celebrate community achievements, honor leadership legacy, and announce LCP 27.28.",
          emotionalObjective: "Pure joy, celebration, prestige, and unity."
        },
        {
          id: "d2-s13",
          time: "01:15",
          startTime: "01:15",
          endTime: "03:00",
          duration: "105 min",
          type: "party",
          title: "Party – Day 2",
          room: "Grand Hall • Asgardian Terrace",
          location: "Grand Hall • Asgardian Terrace",
          facilitator: "OC Team",
          responsible: "OC Team",
          track: "all",
          isOvernight: true,
          day: 2,
          status: "scheduled",
          essence: "Late-night celebration, music, and euphoria following the Day 2 Gala Night. (Overnight association with Day 2, occurring early Sunday morning 01:15).",
          concreteObjective: "Unwind and celebrate collective achievements.",
          emotionalObjective: "Euphoria, connection, and celebration."
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
      tagline: "Choose Your Contribution to the Unity",
      focus: "Choose Your Contribution to the Unity",
      objective: "Become part of the next generation",
      themeDesc: "This is not the end of someone else's story — it is the beginning of theirs. Participants reflect on what they discovered, the people they met and the kind of member and leader they want to become. They are given the opportunity to make their first commitment to AIESEC Rabat and to the people who will come after them. They are not here to repair the old Avengers; they are the new Avengers who will write the next chapter.",
      accent: "blend",
      track_split: true,
      sessions: [
        {
          id: "d3-s0",
          time: "08:00",
          startTime: "08:00",
          endTime: "09:30",
          duration: "90 min",
          type: "break",
          title: "Breakfast",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Final day breakfast convening and morning operational briefing.",
          concreteObjective: "Recharge physical stamina for the climactic final day.",
          emotionalObjective: "Focus, warmth, and camaraderie."
        },
        {
          id: "d3-s1",
          time: "09:30",
          startTime: "09:30",
          endTime: "10:30",
          duration: "60 min",
          type: "session",
          title: "Morning Plenary – The Final Battle",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "Morning opening translating conference learnings into post-conference local committee momentum.",
          concreteObjective: "Transform the conference's key learnings into concrete actions and prepare delegates to apply them within their LC after the conference.",
          emotionalObjective: "Determination, ambition, confidence, readiness."
        },
        {
          id: "d3-s2",
          time: "10:30",
          startTime: "10:30",
          endTime: "11:15",
          duration: "45 min",
          type: "session",
          title: "History of AIESEC – The Avengers Legacy",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Meryem",
          responsible: "Meryem",
          badge: "Director",
          track: "all",
          status: "scheduled",
          essence: "A journey through the historical origins, milestones, peace vision, and enduring legacy of AIESEC.",
          concreteObjective: "Help delegates understand AIESEC's history, evolution, milestones, and legacy and connect their current contribution to the organization's broader purpose.",
          emotionalObjective: "Pride, belonging, inspiration, responsibility."
        },
        {
          id: "d3-s3",
          time: "11:15",
          startTime: "11:15",
          endTime: "12:00",
          duration: "45 min",
          type: "session",
          title: "Emotional Intelligence – The BLACK WIDOW Protocol",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Wadii",
          responsible: "Wadii",
          badge: "Director",
          track: "all",
          status: "scheduled",
          essence: "Developing empathy, emotional regulation, vulnerability, and conscious leadership under pressure.",
          concreteObjective: "Develop delegates' ability to recognize and regulate their emotions, understand others, and use emotional awareness to improve communication and leadership.",
          emotionalObjective: "Self-awareness, empathy, vulnerability, understanding."
        },
        {
          id: "d3-s4",
          time: "12:00",
          startTime: "12:00",
          endTime: "12:45",
          duration: "45 min",
          type: "session",
          title: "The Hierarchy",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Iman",
          responsible: "Iman",
          badge: "Director",
          track: "all",
          status: "scheduled",
          essence: "Organizational governance, authority, reporting lines, accountability, and the distinction between hierarchy and genuine leadership.",
          concreteObjective: "Ensure delegates understand organizational hierarchy, authority, accountability, reporting lines, and the distinction between hierarchy and leadership.",
          emotionalObjective: "Clarity, awareness, responsibility, maturity."
        },
        {
          id: "d3-s5",
          time: "12:45",
          startTime: "12:45",
          endTime: "13:30",
          duration: "45 min",
          type: "break",
          title: "Lunch",
          room: "Asgardian Dining Hall",
          location: "Asgardian Dining Hall",
          facilitator: "Ops Crew",
          responsible: "Ops Crew",
          track: "all",
          status: "scheduled",
          essence: "Farewell banquet lunch with cross-team reflections.",
          concreteObjective: "Refresh energy and share memories.",
          emotionalObjective: "Gratitude, affection, and bonding."
        },
        {
          id: "d3-s6",
          time: "13:30",
          startTime: "13:30",
          endTime: "14:45",
          duration: "75 min",
          type: "session",
          title: "Individual Spaces – With Great Responsibilities Come Great Power",
          room: "Quiet Reflection Zones • Asgardian Sanctuary",
          location: "Quiet Reflection Zones • Asgardian Sanctuary",
          facilitator: "Oussama",
          responsible: "Oussama",
          badge: "Director",
          track: "all",
          status: "scheduled",
          essence: "Silent individual reflection space and writing of personal commitments and legacy letters to AIESEC Rabat.",
          concreteObjective: "Enable delegates to critically reflect on their experience, identify areas for personal growth, and define concrete individual commitments.",
          emotionalObjective: "Introspection, vulnerability, empowerment, determination."
        },
        {
          id: "d3-s7",
          time: "14:45",
          startTime: "14:45",
          endTime: "16:45",
          duration: "120 min",
          type: "session",
          title: "Closing Plenary – The Endgame",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Conference Chair",
          responsible: "Conference Chair",
          track: "all",
          status: "scheduled",
          essence: "The climactic final assembly, synthesis of learnings, leadership pledges, and official convening conclusion.",
          concreteObjective: "Consolidate the conference's key learnings, reinforce the delegates' sense of purpose and belonging, and translate the experience into concrete future commitments.",
          emotionalObjective: "Pride, gratitude, inspiration, belonging, determination."
        }
      ]
    },
    day0: {
      id: "day0",
      dayNumber: 0,
      date: "2026-10-15",
      dayOfWeek: "Thursday",
      codename: "Pre-Conference",
      pillar: "PREPARATION • ALIGNMENT • STANDARDS",
      tagline: "Conference Team Pre-Meetings",
      focus: "Prepare and align leadership & conference teams",
      objective: "Set operational, cultural, and role clarity before conference launch",
      themeDesc: "Pre-conference calibration and alignment meetings for Middle Managers, new members, and the Chair.",
      accent: "red",
      track_split: true,
      sessions: [
        {
          id: "d0-s1",
          time: "15:45",
          startTime: "15:45",
          endTime: "16:30",
          duration: "45 min",
          type: "session",
          title: "MM Calibration Meeting – The Avengers Initiative",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Meryem",
          responsible: "Meryem",
          badge: "Director",
          track: "mms",
          status: "scheduled",
          essence: "Middle Manager calibration on role responsibilities, KPIs, and standards.",
          concreteObjective: "Align all Middle Managers on their responsibilities, expectations, standards, KPIs, and ways of working, ensuring each MM understands what they are accountable for.",
          emotionalObjective: "Clarity, responsibility, confidence, commitment."
        },
        {
          id: "d0-s2",
          time: "16:30",
          startTime: "16:30",
          endTime: "17:15",
          duration: "45 min",
          type: "session",
          title: "New Member / MX Standards – The Code of the Avengers",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Meryem",
          responsible: "Meryem",
          badge: "Director",
          track: "newbies",
          status: "scheduled",
          essence: "Behavioral, professional, and cultural standards workshop for new members.",
          concreteObjective: "Ensure new members understand the behavioral, professional, and cultural standards expected within the LC, including communication, punctuality, ownership, accountability, and respect.",
          emotionalObjective: "Belonging, curiosity, motivation, pride."
        },
        {
          id: "d0-s3",
          time: "17:15",
          startTime: "17:15",
          endTime: "17:45",
          duration: "30 min",
          type: "session",
          title: "Meet the Chair – Meet the Nick Fury",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Meryem",
          responsible: "Meryem",
          badge: "Director",
          track: "all",
          status: "scheduled",
          essence: "Connecting delegates directly with the Conference Chair to align on vision and culture.",
          concreteObjective: "Create a connection between delegates and the Chair while communicating the conference vision, leadership expectations, and organizational direction.",
          emotionalObjective: "Connection, trust, inspiration, respect."
        },
        {
          id: "d0-s4",
          time: "17:45",
          startTime: "17:45",
          endTime: "18:45",
          duration: "60 min",
          type: "session",
          title: "Night Pre-Meeting – The War Room",
          room: "Plenary Hall • Valhalla Grand Stage",
          location: "Plenary Hall • Valhalla Grand Stage",
          facilitator: "Meryem",
          responsible: "Meryem",
          badge: "Director",
          track: "all",
          status: "scheduled",
          essence: "Final evening logistical readiness and briefing.",
          concreteObjective: "Prepare delegates for the conference by clarifying expectations, logistics, key information, and participation requirements.",
          emotionalObjective: "Anticipation, excitement, focus, readiness."
        }
      ]
    },
    lcm: {
      id: "lcm",
      dayNumber: 4,
      date: "2026-10-18",
      dayOfWeek: "Sunday",
      codename: "Cocktail des Parents",
      pillar: "COMMUNITY • LEGACY • IMPACT",
      tagline: "LCM | Cocktail des Parents (16:00 – 18:30)",
      focus: "Connect parents with the AIESEC journey and value proposition",
      objective: "Showcase member impact, leadership development, and alumni testimonials to parents",
      themeDesc: "Special parents engagement space, showcasing AIESEC history, youth leadership development, and alumni journeys.",
      accent: "blend",
      track_split: false,
      sessions: [
        {
          id: "lcm-s1",
          time: "16:00",
          startTime: "16:00",
          endTime: "16:30",
          duration: "30 min",
          type: "session",
          title: "Accueil & Ouverture",
          room: "Bifrost Pavilion • Parents Lounge",
          location: "Bifrost Pavilion • Parents Lounge",
          facilitator: "LCP",
          responsible: "LCP",
          track: "parents",
          status: "scheduled",
          essence: "Accueil chaleureux des parents et discours d'ouverture par la Présidente du Comité Local.",
          concreteObjective: "Accueillir les parents et présenter le cadre de l'événement.",
          emotionalObjective: "Chaleur, fierté et bienveillance."
        },
        {
          id: "lcm-s2",
          time: "16:30",
          startTime: "16:30",
          endTime: "16:35",
          duration: "5 min",
          type: "session",
          title: "Qu'est-ce qu'AIESEC ?",
          room: "Bifrost Pavilion • Parents Lounge",
          location: "Bifrost Pavilion • Parents Lounge",
          facilitator: "VP TM",
          responsible: "VP TM",
          track: "parents",
          status: "scheduled",
          essence: "Présentation claire de la vision, de la mission et des valeurs fondamentales d'AIESEC.",
          concreteObjective: "Expliquer l'impact mondial et local de l'organisation.",
          emotionalObjective: "Clarté et compréhension."
        },
        {
          id: "lcm-s3",
          time: "16:35",
          startTime: "16:35",
          endTime: "16:40",
          duration: "5 min",
          type: "session",
          title: "Compétences pour l'avenir (Routines)",
          room: "Bifrost Pavilion • Parents Lounge",
          location: "Bifrost Pavilion • Parents Lounge",
          facilitator: "VP TM",
          responsible: "VP TM",
          track: "parents",
          status: "scheduled",
          essence: "Comment AIESEC développe les compétences professionnelles, l'intelligence émotionnelle et la rigueur.",
          concreteObjective: "Démontrer la valeur ajoutée sur le plan académique et professionnel.",
          emotionalObjective: "Rassurance et conviction."
        },
        {
          id: "lcm-s4",
          time: "16:40",
          startTime: "16:40",
          endTime: "16:50",
          duration: "10 min",
          type: "session",
          title: "Histoires d'impact",
          room: "Bifrost Pavilion • Parents Lounge",
          location: "Bifrost Pavilion • Parents Lounge",
          facilitator: "VP TM",
          responsible: "VP TM",
          track: "parents",
          status: "scheduled",
          essence: "Témoignages vivants des membres sur leur transformation personnelle et professionnelle.",
          concreteObjective: "Partager des exemples concrets d'impact.",
          emotionalObjective: "Émotion et fierté parentale."
        },
        {
          id: "lcm-s5",
          time: "16:50",
          startTime: "16:50",
          endTime: "16:55",
          duration: "5 min",
          type: "session",
          title: "Le parcours AIESEC",
          room: "Bifrost Pavilion • Parents Lounge",
          location: "Bifrost Pavilion • Parents Lounge",
          facilitator: "VP TM",
          responsible: "VP TM",
          track: "parents",
          status: "scheduled",
          essence: "Les différentes étapes d'évolution d'un membre : du nouveau membre au leader d'équipe et au bureau exécutif.",
          concreteObjective: "Visualiser les opportunités de progression au sein de l'organisation.",
          emotionalObjective: "Ambition et perspective d'avenir."
        },
        {
          id: "lcm-s6",
          time: "16:55",
          startTime: "16:55",
          endTime: "17:25",
          duration: "30 min",
          type: "session",
          title: "Alumni Panel",
          room: "Bifrost Pavilion • Parents Lounge",
          location: "Bifrost Pavilion • Parents Lounge",
          facilitator: "LCP",
          responsible: "LCP",
          track: "parents",
          status: "scheduled",
          essence: "Panel d'échange avec des anciens membres AIESEC occupant aujourd'hui des postes clés dans diverses industries.",
          concreteObjective: "Démontrer la trajectoire de carrière post-AIESEC.",
          emotionalObjective: "Inspiration et confiance."
        },
        {
          id: "lcm-s7",
          time: "17:25",
          startTime: "17:25",
          endTime: "18:00",
          duration: "35 min",
          type: "session",
          title: "QnA Space",
          room: "Bifrost Pavilion • Parents Lounge",
          location: "Bifrost Pavilion • Parents Lounge",
          facilitator: "VPs",
          responsible: "VPs",
          track: "parents",
          status: "scheduled",
          essence: "Session ouverte de questions-réponses entre les parents et les membres du bureau exécutif.",
          concreteObjective: "Répondre en toute transparence aux interrogations des parents.",
          emotionalObjective: "Confiance, écoute et transparence."
        },
        {
          id: "lcm-s8",
          time: "18:00",
          startTime: "18:00",
          endTime: "18:15",
          duration: "15 min",
          type: "session",
          title: "Local'Co Registration",
          room: "Bifrost Pavilion • Parents Lounge",
          location: "Bifrost Pavilion • Parents Lounge",
          facilitator: "VP TM",
          responsible: "VP TM",
          track: "parents",
          status: "scheduled",
          essence: "Formalités d'inscription et confirmation de participation pour les prochaines étapes locales.",
          concreteObjective: "Accompagner les démarches administratives.",
          emotionalObjective: "Engagement et accompagnement."
        },
        {
          id: "lcm-s9",
          time: "18:15",
          startTime: "18:15",
          endTime: "18:30",
          duration: "15 min",
          type: "session",
          title: "Clôture",
          room: "Bifrost Pavilion • Parents Lounge",
          location: "Bifrost Pavilion • Parents Lounge",
          facilitator: "VP TM",
          responsible: "VP TM",
          track: "parents",
          status: "scheduled",
          essence: "Remerciements chaleureux et clôture officielle du Cocktail des Parents.",
          concreteObjective: "Clôturer la rencontre et réaffirmer le partenariat avec les familles.",
          emotionalObjective: "Gratitude et unité."
        }
      ]
    }
  }
};
