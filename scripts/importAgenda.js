/**
 * RABAT CO 26.2 — Master Agenda Importer
 * 
 * Supports:
 * - CSV files (e.g. data/agenda_input.csv or exported from Excel)
 * - JSON files (e.g. data/agenda_input.json)
 * - Excel copy-paste TSV / semicolon-separated files
 * - Direct extraction from Rabat'CO 26.2(2).xlsx with --from-excel flag
 * 
 * Usage:
 *   node scripts/importAgenda.js
 *   node scripts/importAgenda.js path/to/file.csv
 *   node scripts/importAgenda.js path/to/file.json
 *   node scripts/importAgenda.js --from-excel
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const AGENDA_FILE = path.join(DATA_DIR, 'agenda.json');

// Helper to convert time "HH:mm" to minutes from midnight
function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const parts = String(timeStr).trim().split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

// Helper to convert total minutes to "HH:mm"
function minutesToTime(totalMinutes) {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Format duration string nicely
function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hour${h > 1 ? 's' : ''}` : `${h}h ${m}m`;
}

// Normalize Day string (e.g. "Day 1", "D1", "1", "Friday", "2026-10-16") -> "day1" | "day2" | "day3"
export function normalizeDayKey(rawDay) {
  if (!rawDay) return 'day1';
  const clean = String(rawDay).trim().toLowerCase();
  if (clean.includes('1') || clean.includes('fri') || clean.includes('16') || clean.includes('civil')) return 'day1';
  if (clean.includes('2') || clean.includes('sat') || clean.includes('17') || clean.includes('infinity')) return 'day2';
  if (clean.includes('3') || clean.includes('sun') || clean.includes('18') || clean.includes('endgame')) return 'day3';
  return 'day1';
}

// Standardize time string into "HH:mm"
export function normalizeTime(rawTime) {
  if (!rawTime) return '';
  const str = String(rawTime).trim().replace('h', ':').replace('H', ':');
  // Check if decimal from Excel (e.g. 0.5 = 12:00)
  const num = parseFloat(str);
  if (!isNaN(num) && num > 0 && num < 1 && !str.includes(':')) {
    const totalMinutes = Math.round(num * 1440);
    return minutesToTime(totalMinutes);
  }
  const match = str.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const h = String(parseInt(match[1], 10)).padStart(2, '0');
    const m = match[2];
    return `${h}:${m}`;
  }
  return str;
}

// Normalize session type
function normalizeType(rawType, title = '') {
  const t = String(rawType || '').trim().toLowerCase();
  const lowerTitle = title.toLowerCase();

  if (t === 'break' || lowerTitle.includes('break') || lowerTitle.includes('lunch') || lowerTitle.includes('breakfast') || lowerTitle.includes('dinner')) {
    return 'break';
  }
  if (t === 'party' || lowerTitle.includes('party') || lowerTitle.includes('gala') || lowerTitle.includes('celebration')) {
    return 'party';
  }
  if (t === 'logistics' || lowerTitle.includes('check in') || lowerTitle.includes('registration') || lowerTitle.includes('arrival')) {
    return 'logistics';
  }
  return 'session';
}

// Robust CSV/TSV parser that handles quotes and delimiters
export function parseDelimitedText(text) {
  if (!text || !text.trim()) return [];

  // Detect delimiter: tab, comma, or semicolon
  const firstLine = text.trim().split(/\r?\n/)[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) {
    delimiter = '\t';
  } else if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  }

  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // Skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++; // CRLF
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '')
  );

  const parsedObjects = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const item = {};
    headers.forEach((h, colIdx) => {
      item[h] = row[colIdx] || '';
    });
    parsedObjects.push(item);
  }

  return parsedObjects;
}

// Map parsed raw row to standardized Session
export function mapRowToSession(row, index, dayId) {
  const getField = (keys) => {
    for (const k of keys) {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (row[cleanKey] !== undefined && row[cleanKey] !== '') {
        return row[cleanKey];
      }
    }
    return '';
  };

  const title = getField(['title', 'sessionname', 'session', 'name', 'session_name']) || `Session ${index + 1}`;
  const rawStart = getField(['starttime', 'time', 'start', 'heuredebut']);
  const rawEnd = getField(['endtime', 'end', 'heurefin']);
  const rawDur = getField(['duration', 'duree', 'durationmins']);

  const time = normalizeTime(rawStart) || '09:00';
  let endTime = normalizeTime(rawEnd);
  let duration = rawDur;

  const startM = timeToMinutes(time);
  let endM = endTime ? timeToMinutes(endTime) : 0;

  // Compute duration if missing
  if (!duration && startM && endM && endM > startM) {
    duration = formatDuration(endM - startM);
  }

  // Compute end time if missing but duration is available
  if (!endTime && duration) {
    const parsedDurMin = parseInt(String(duration).replace(/\D+/g, ''), 10);
    if (!isNaN(parsedDurMin) && parsedDurMin > 0) {
      endTime = minutesToTime(startM + parsedDurMin);
      duration = formatDuration(parsedDurMin);
    }
  }

  const rawType = getField(['type', 'sessiontype']);
  const type = normalizeType(rawType, title);

  const responsible = getField(['responsible', 'faci', 'facilitator', 'lead', 'facibuddy']);
  const location = getField(['location', 'room', 'salle', 'lieu']) || 'Plenary Hall • Valhalla Grand Stage';
  const description = getField(['description', 'essence', 'briefing', 'outline']);
  const concreteObjective = getField(['concreteobjective', 'objective', 'sessionobjective', 'concrete']);
  const emotionalObjective = getField(['emotionalobjective', 'emotions', 'feelings', 'feelingstodeliver', 'emotional']);
  const track = getField(['track', 'piste']) || 'all';

  const objectives = [];
  if (concreteObjective) objectives.push(`🎯 Concrete: ${concreteObjective}`);
  if (emotionalObjective) objectives.push(`💖 Emotional: ${emotionalObjective}`);

  return {
    id: `${dayId}-s${index}`,
    time,
    endTime: endTime || '',
    duration: duration || '',
    type,
    title,
    room: location,
    location,
    essence: description,
    description,
    facilitator: responsible,
    responsible,
    track: track.toLowerCase().includes('newbie') ? 'newbies' : track.toLowerCase().includes('mm') ? 'mms' : 'all',
    concreteObjective,
    emotionalObjective,
    learningObjectives: objectives,
    status: 'scheduled',
    updatedAt: new Date().toISOString()
  };
}

// Convert Array of Raw Rows into Structured Days
export function convertRowsToAgendaDays(rows, existingDays = null) {
  const days = {
    day1: {
      id: 'day1',
      dayNumber: 1,
      date: '2026-10-16',
      dayOfWeek: 'Friday',
      codename: 'Civil War',
      pillar: 'CONFLICT • CHOICES • LEADERSHIP',
      tagline: 'Facing the fractures & rebuilding trust',
      themeDesc: 'Facing the fractures, uncovering lost trust, and discovering what it truly means to assemble.',
      accent: 'red',
      track_split: false,
      sessions: []
    },
    day2: {
      id: 'day2',
      dayNumber: 2,
      date: '2026-10-17',
      dayOfWeek: 'Saturday',
      codename: 'Infinity War',
      pillar: 'EXECUTION • CRISIS • RESILIENCE',
      tagline: 'Facing the pressure & standing together',
      themeDesc: 'Embracing pressure, executing under fire, and proving resilience as a collective unit.',
      accent: 'purple',
      track_split: false,
      sessions: []
    },
    day3: {
      id: 'day3',
      dayNumber: 3,
      date: '2026-10-18',
      dayOfWeek: 'Sunday',
      codename: 'Endgame',
      pillar: 'SACRIFICE • REBUILDING • VICTORY',
      tagline: 'Whatever it takes — our defining moment',
      themeDesc: 'Leaving legacy, sealing ultimate unity, and stepping up as the next generation of leadership.',
      accent: 'blend',
      track_split: false,
      sessions: []
    }
  };

  if (existingDays) {
    ['day1', 'day2', 'day3'].forEach((dKey) => {
      if (existingDays[dKey]) {
        days[dKey] = { ...days[dKey], ...existingDays[dKey], sessions: [] };
      }
    });
  }

  // Group raw rows by day
  rows.forEach((row) => {
    const rawDay = row.day || row.d || row.jour || row.date || 'day1';
    const dayKey = normalizeDayKey(rawDay);
    if (days[dayKey]) {
      const idx = days[dayKey].sessions.length;
      const session = mapRowToSession(row, idx, dayKey);
      days[dayKey].sessions.push(session);
    }
  });

  // Sort each day chronologically by start time and reassign clean IDs
  ['day1', 'day2', 'day3'].forEach((dKey) => {
    days[dKey].sessions.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    days[dKey].sessions = days[dKey].sessions.map((s, idx) => ({
      ...s,
      id: `${dKey}-s${idx}`
    }));
  });

  return days;
}

// Master Import Function
export function importAgendaData(sourceData, format = 'auto') {
  let existingAgenda = null;
  if (fs.existsSync(AGENDA_FILE)) {
    try {
      existingAgenda = JSON.parse(fs.readFileSync(AGENDA_FILE, 'utf-8'));
    } catch {}
  }

  let newDays = null;

  // Case 1: sourceData is already full ConferenceAgenda JSON or has days
  if (typeof sourceData === 'object' && sourceData !== null && sourceData.days) {
    newDays = {
      day1: { ...(existingAgenda?.days?.day1 || {}), ...(sourceData.days.day1 || {}) },
      day2: { ...(existingAgenda?.days?.day2 || {}), ...(sourceData.days.day2 || {}) },
      day3: { ...(existingAgenda?.days?.day3 || {}), ...(sourceData.days.day3 || {}) }
    };
    // Ensure chronological sorting
    ['day1', 'day2', 'day3'].forEach((dKey) => {
      if (Array.isArray(newDays[dKey]?.sessions)) {
        newDays[dKey].sessions.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
      }
    });
  } 
  // Case 2: sourceData is an array of session objects
  else if (Array.isArray(sourceData)) {
    newDays = convertRowsToAgendaDays(sourceData, existingAgenda?.days);
  } 
  // Case 3: sourceData is CSV/TSV string
  else if (typeof sourceData === 'string') {
    const trimmed = sourceData.trim();
    if (trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed);
      return importAgendaData(parsed, 'json');
    }
    const rows = parseDelimitedText(trimmed);
    if (rows.length === 0) {
      throw new Error('No valid tabular rows found in input.');
    }
    newDays = convertRowsToAgendaDays(rows, existingAgenda?.days);
  } else {
    throw new Error('Unsupported agenda data format.');
  }

  const updatedAgenda = {
    meta: {
      title: 'Rabat CO 26.2',
      subtitle: 'Avengers Assemble',
      tagline: 'Different powers. Different perspectives. One team. One mission.',
      edition: '26.2',
      entity: 'AIESEC in Rabat',
      datesText: 'October 16–18, 2026',
      timezone: 'Africa/Casablanca',
      openingDateTime: '2026-10-16T17:00:00',
      closingDateTime: '2026-10-18T17:00:00',
      mediaDriveUrl: existingAgenda?.meta?.mediaDriveUrl || 'https://drive.google.com/drive/folders/1rabat-co26-2-vault?usp=sharing',
      location: 'Rabat, Morocco',
      themeStory: existingAgenda?.meta?.themeStory || '',
      lastUpdated: new Date().toISOString(),
      version: (existingAgenda?.meta?.version || 1) + 1
    },
    days: newDays
  };

  // Write to data/agenda.json
  fs.writeFileSync(AGENDA_FILE, JSON.stringify(updatedAgenda, null, 2), 'utf-8');

  return updatedAgenda;
}

// CLI Execution Entry Point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];

  console.log('🛡️  RABAT CO 26.2 — Master Agenda Importer');
  console.log('============================================');

  let targetPath = null;
  if (arg && !arg.startsWith('--')) {
    targetPath = path.resolve(process.cwd(), arg);
  } else {
    const csvInput = path.join(DATA_DIR, 'agenda_input.csv');
    const jsonInput = path.join(DATA_DIR, 'agenda_input.json');

    if (fs.existsSync(csvInput) && fs.statSync(csvInput).size > 10) {
      targetPath = csvInput;
    } else if (fs.existsSync(jsonInput) && fs.statSync(jsonInput).size > 10) {
      targetPath = jsonInput;
    }
  }

  if (!targetPath || !fs.existsSync(targetPath)) {
    console.log('ℹ️  No input file specified or found.');
    console.log('   Expected either:');
    console.log('   - data/agenda_input.csv');
    console.log('   - data/agenda_input.json');
    console.log('   - node scripts/importAgenda.js <path-to-file>');
    console.log('\n📄 A template has been prepared for you at: data/agenda_template.csv');
    process.exit(0);
  }

  console.log(`📂 Reading input from: ${targetPath}`);
  const content = fs.readFileSync(targetPath, 'utf-8');

  try {
    const updated = importAgendaData(content);
    console.log('\n✅ Agenda successfully updated and saved to data/agenda.json!');
    console.log(`   - Day 1 (${updated.days.day1.codename}): ${updated.days.day1.sessions.length} sessions`);
    console.log(`   - Day 2 (${updated.days.day2.codename}): ${updated.days.day2.sessions.length} sessions`);
    console.log(`   - Day 3 (${updated.days.day3.codename}): ${updated.days.day3.sessions.length} sessions`);
    console.log(`   - Version bumped to: v${updated.meta.version}`);
    console.log(`   - Last updated: ${updated.meta.lastUpdated}`);
    console.log('\n🌐 Live site updated. Refresh http://localhost:5173/agenda to verify.');
  } catch (err) {
    console.error('❌ Failed to import agenda:', err.message);
    process.exit(1);
  }
}
