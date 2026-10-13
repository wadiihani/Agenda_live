/**
 * RABAT CO 26.2 — "AVENGERS ASSEMBLE"
 * Master Conference Data & Configuration
 * 
 * Edit this file to update sessions, times, facilitators, or team members
 * without touching layout or application logic.
 */

window.CONFERENCE_DATA = {
  meta: {
    title: "Rabat CO 26.2",
    subtitle: "Avengers Assemble",
    tagline: "Different powers. Different perspectives. One team. One mission.",
    edition: "26.2",
    entity: "AIESEC in Rabat",
    datesText: "October 9–11, 2026",
    timezone: "Africa/Casablanca",
    openingDateTime: "2026-10-09T17:00:00", // Fri Oct 9, 17:00 Casablanca time
    closingDateTime: "2026-10-11T17:00:00", // Sun Oct 11, ~17:00 Casablanca time
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
      date: "2026-10-09",
      dayOfWeek: "Friday",
      codename: "Civil War",
      pillar: "CONFLICT • CHOICES • LEADERSHIP",
      themeDesc: "Facing the fractures, uncovering lost trust, and discovering what it truly means to assemble.",
      colorAccent: "#B71C1C", // Stark / Civil War Red
      secondaryColor: "#607D8B", // Steel Grey
      lightColor: "#ECEFF1",
      badgeClass: "badge-day1",
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
          essence: "Quick tactical recharge and hall discussions."
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
          essence: "Mess Hall Refuel & Informal Networking."
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
      date: "2026-10-10",
      dayOfWeek: "Saturday",
      codename: "Infinity War",
      pillar: "THREAT • SACRIFICE • UNITY",
      themeDesc: "Testing our limits, mastering specialized disciplines, and forging an unbreakable battle formation.",
      colorAccent: "#6A1B9A", // Infinity Purple
      secondaryColor: "#283593", // Cosmic Deep Blue
      lightColor: "#FF6F00", // Energy Orange
      badgeClass: "badge-day2",
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
          facilitator: "Iman",
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
          facilitator: "LCVPs",
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
          essence: "Evening feast before the grand accords and gala."
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
          essence: "Suiting up for the flagship evening."
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
      date: "2026-10-11",
      dayOfWeek: "Sunday",
      codename: "Endgame",
      pillar: "LEGACY • REDEMPTION • THE FINAL STAND",
      themeDesc: "Whatever it takes: individual accountability, collective legacy, and sealing our pledge.",
      colorAccent: "#D4AF37", // Endgame Gold
      secondaryColor: "#6D4C41", // Worn-Earth Brown
      lightColor: "#FAFAFA",
      badgeClass: "badge-day3",
      track_split: false,
      sessions: [
        {
          id: "d3-s0",
          time: "08:15",
          type: "break",
          title: "Breakfast",
          essence: "Last morning briefing refuel."
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
  },

  shieldTeam: [
    {
      id: "chair",
      name: "Conference Chair",
      callsign: "Nick Fury",
      role: "Conference Chair & Head of Plenary",
      badge: "Director",
      badgeType: "director",
      bio: "Overseeing the overarching mission arc, guiding plenaries, and holding the team accountable to the Endgame vision.",
      assignedSessions: [
        "Avengers, Assemble! (D1)",
        "The Battle Debrief (D1)",
        "Rise of the Avengers (D2)",
        "The Sokovia Accords (D2)",
        "The Final Battle (D3)",
        "The Endgame (D3)"
      ]
    },
    {
      id: "wadii",
      name: "Wadii",
      callsign: "Hawkeye / Visionary",
      role: "Facilitator & Culture Lead",
      badge: "S.H.I.E.L.D. Agent",
      badgeType: "agent",
      bio: "Specializing in organizational identity, emotional intelligence, and anchoring core values.",
      assignedSessions: [
        "The Avengers Initiative (D1)",
        "Black Widow Protocol (D3)"
      ]
    },
    {
      id: "soukaina",
      name: "Soukaina",
      callsign: "Valkyrie",
      role: "Lead Facilitator & Synergy Architect",
      badge: "S.H.I.E.L.D. Agent",
      badgeType: "agent",
      bio: "Specializing in trust reconstruction, cross-functional synergy, and resilience under adversity.",
      assignedSessions: [
        "The Broken Shield (D1)",
        "The Battle Formation (D2)",
        "The Phoenix Protocol (D3)"
      ]
    },
    {
      id: "meryem",
      name: "Meryem",
      callsign: "Captain Marvel",
      role: "Facilitator & Leadership Development",
      badge: "S.H.I.E.L.D. Agent",
      badgeType: "agent",
      bio: "Driving leadership accountability, heritage preservation, and empowering frontline members to step forward.",
      assignedSessions: [
        "The Captain's Shield (D1)",
        "The Avengers Legacy (D3)"
      ]
    },
    {
      id: "oussama",
      name: "Oussama",
      callsign: "Doctor Strange",
      role: "Facilitator & Mindset Strategist",
      badge: "S.H.I.E.L.D. Agent",
      badgeType: "agent",
      bio: "Exploring team dynamics, diverse subcultures, and individual accountability with surgical clarity.",
      assignedSessions: [
        "Not Every Hero Is an Avenger (D1)",
        "The Multiverse (D2)",
        "With Great Responsibilities Come Great Power (D3)"
      ]
    },
    {
      id: "iman",
      name: "Iman",
      callsign: "The Ancient One",
      role: "Facilitator & Newbie Mentor",
      badge: "S.H.I.E.L.D. Agent",
      badgeType: "agent",
      bio: "Guiding first-time delegates through the foundational shifts of their leadership journey.",
      assignedSessions: [
        "The Ancient One (D2)"
      ]
    },
    {
      id: "lcvps",
      name: "LCVPs",
      callsign: "Commanding Officers",
      role: "Vice Presidents / Department Commanders",
      badge: "Tower Commander",
      badgeType: "commander",
      bio: "Directing functional breakouts across iCX, oCX, TM, BD, MKT, and Finance from the central headquarters.",
      assignedSessions: [
        "The Avengers Tower (D2)"
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
      bio: "Ensuring smooth arrival, credential verification, and kit handover for every delegate entering the compound.",
      assignedSessions: ["Check In (D1)"]
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
      role: "Crowd Flow, Room Transitions & Time Management",
      badge: "Ops Crew",
      badgeType: "ops",
      status: "TBD / Ready to Deploy",
      bio: "Maintaining punctual rotations between plenaries, workshops, and mess halls across the venue.",
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
      bio: "Capturing key milestones, team memories, and the historic Endgame moments across all 3 days.",
      assignedSessions: ["Full Conference Documentation"]
    }
  ]
};
