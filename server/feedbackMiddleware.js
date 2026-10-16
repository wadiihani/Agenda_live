import fs from 'fs';
import path from 'path';
import { importAgendaData, parseDelimitedText, convertRowsToAgendaDays } from '../scripts/importAgenda.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const AGENDA_FILE = path.join(DATA_DIR, 'agenda.json');

const ADMIN_PASSWORD = 'wydadac37';

function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(totalMinutes) {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(norm / 60);
  const m = norm % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MEMBERS_FILE)) {
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify({}, null, 2), 'utf-8');
  }
  if (!fs.existsSync(FEEDBACK_FILE)) {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(CONFIG_FILE)) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ 
      googleSheetWebhookUrl: '',
      formsStatus: {
        day1: true,
        day2: false,
        day3: false
      }
    }, null, 2), 'utf-8');
  }
  if (!fs.existsSync(ANNOUNCEMENTS_FILE)) {
    fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  if (!fs.existsSync(PHOTOS_FILE)) {
    fs.writeFileSync(PHOTOS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  let ip = '';
  if (typeof forwarded === 'string') {
    ip = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded)) {
    ip = forwarded[0].trim();
  } else {
    ip = req.socket?.remoteAddress || '127.0.0.1';
  }
  return ip.replace(/^.*:/, '');
}

function readJson(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Forward to Google Sheet Webhook with redirect: 'follow'
async function forwardToGoogleSheet(webhookUrl, payload) {
  if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('http')) {
    return { success: false, error: 'Invalid URL' };
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });
    const text = await response.text();
    return { success: true, response: text };
  } catch (err) {
    console.warn('Failed to forward debrief to Google Sheets:', err);
    return { success: false, error: err.toString() };
  }
}

export function handleFeedbackApi(req, res, next) {
  const url = req.url || '';
  if (!url.startsWith('/api/')) {
    return next();
  }

  initStorage();
  const clientIp = getClientIp(req);

  const sendJson = (status, data) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end(JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.end();
  }

  const parseBody = (cb) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        cb(parsed);
      } catch {
        sendJson(400, { error: 'Invalid JSON' });
      }
    });
  };

  // Route: Verify Admin Password
  if (url === '/api/admin/verify' && req.method === 'POST') {
    return parseBody((data) => {
      const isValid = (data.password || '').trim() === ADMIN_PASSWORD;
      if (isValid) {
        return sendJson(200, { success: true, message: 'Access Granted' });
      }
      return sendJson(401, { success: false, error: 'Invalid security passcode' });
    });
  }

  // Route: GET /api/me
  if (url === '/api/me' && req.method === 'GET') {
    const members = readJson(MEMBERS_FILE, {});
    const member = members[clientIp] || null;
    return sendJson(200, {
      ip: clientIp,
      member
    });
  }

  // Route: POST /api/register
  if (url === '/api/register' && req.method === 'POST') {
    return parseBody((data) => {
      if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        return sendJson(400, { error: 'Name is required' });
      }

      const members = readJson(MEMBERS_FILE, {});
      const member = {
        name: data.name.trim(),
        department: data.department ? data.department.trim() : '',
        ip: clientIp,
        registeredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      members[clientIp] = member;
      writeJson(MEMBERS_FILE, members);

      return sendJson(200, {
        success: true,
        member
      });
    });
  }

  // Route: POST /api/feedback (submit debrief + check open status + auto-forward to Google Sheets)
  if (url === '/api/feedback' && req.method === 'POST') {
    return parseBody(async (data) => {
      const {
        dayId,
        dayNumber,
        overallRating,
        sessionRating,
        foodRating,
        foodComment,
        wentWell,
        wentBad,
        improvement,
        memberName
      } = data;

      if (!dayId) {
        return sendJson(400, { error: 'dayId is required' });
      }

      const dayNames = { 1: 'Civil War', 2: 'Infinity War', 3: 'Endgame' };
      const dNum = Number(dayNumber) || 1;
      const dayName = dayNames[dNum] || 'Conference';

      // Check if this day's debrief form is open or closed
      const config = readJson(CONFIG_FILE, {
        googleSheetWebhookUrl: '',
        formsStatus: { day1: true, day2: false, day3: false }
      });

      if (config.formsStatus && config.formsStatus[dayId] === false) {
        return sendJson(403, { 
          error: `Day ${dNum} (${dayName}) Debrief is currently closed by Command.` 
        });
      }

      const feedbacks = readJson(FEEDBACK_FILE, []);
      const newFeedback = {
        id: `fb_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        dayId,
        dayNumber: dNum,
        dayName,
        memberName: (memberName || '').trim() || 'Anonymous Operative',
        clientIp,
        overallRating: Number(overallRating) || 0,
        sessionRating: Number(sessionRating) || 0,
        foodRating: Number(foodRating) || 0,
        foodComment: (foodComment || '').trim(),
        wentWell: (wentWell || '').trim(),
        wentBad: (wentBad || '').trim(),
        improvement: (improvement || '').trim(),
        submittedAt: new Date().toISOString()
      };

      feedbacks.push(newFeedback);
      writeJson(FEEDBACK_FILE, feedbacks);

      if (memberName) {
        const members = readJson(MEMBERS_FILE, {});
        if (!members[clientIp]) {
          members[clientIp] = {
            name: memberName.trim(),
            department: '',
            ip: clientIp,
            registeredAt: new Date().toISOString()
          };
          writeJson(MEMBERS_FILE, members);
        }
      }

      // Forward to Google Sheets Webhook asynchronously
      if (config.googleSheetWebhookUrl) {
        forwardToGoogleSheet(config.googleSheetWebhookUrl, newFeedback);
      }

      return sendJson(200, {
        success: true,
        id: newFeedback.id,
        feedback: newFeedback
      });
    });
  }

  // Route: GET /api/feedback
  if (url === '/api/feedback' && req.method === 'GET') {
    const feedbacks = readJson(FEEDBACK_FILE, []);
    return sendJson(200, {
      total: feedbacks.length,
      feedbacks
    });
  }

  // Route: DELETE /api/feedback (delete single debrief item)
  if (url.startsWith('/api/feedback/delete') && req.method === 'POST') {
    return parseBody((data) => {
      const { id } = data;
      if (!id) return sendJson(400, { error: 'ID is required' });

      let feedbacks = readJson(FEEDBACK_FILE, []);
      feedbacks = feedbacks.filter((f) => f.id !== id);
      writeJson(FEEDBACK_FILE, feedbacks);

      return sendJson(200, { success: true, count: feedbacks.length });
    });
  }

  // Route: Purge / Clear all debriefs
  if (url === '/api/feedback/clear' && req.method === 'POST') {
    return parseBody((data) => {
      if ((data.password || '').trim() !== ADMIN_PASSWORD) {
        return sendJson(401, { error: 'Unauthorized passcode' });
      }
      writeJson(FEEDBACK_FILE, []);
      return sendJson(200, { success: true, message: 'All feedback records cleared' });
    });
  }

  // Route: GET /api/config (retrieve config including formsStatus and mediaDriveUrl)
  if (url === '/api/config' && req.method === 'GET') {
    const config = readJson(CONFIG_FILE, { 
      googleSheetWebhookUrl: '',
      mediaDriveUrl: 'https://drive.google.com/drive/folders/1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX?usp=drive_link',
      formsStatus: { day1: true, day2: false, day3: false }
    });
    if (!config.formsStatus) {
      config.formsStatus = { day1: true, day2: false, day3: false };
    }
    if (!config.mediaDriveUrl) {
      config.mediaDriveUrl = 'https://drive.google.com/drive/folders/1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX?usp=drive_link';
    }
    return sendJson(200, config);
  }

  // Route: POST /api/config (save config, formsStatus & mediaDriveUrl)
  if (url === '/api/config' && req.method === 'POST') {
    return parseBody((data) => {
      const config = readJson(CONFIG_FILE, { 
        googleSheetWebhookUrl: '',
        mediaDriveUrl: 'https://drive.google.com/drive/folders/1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX?usp=drive_link',
        formsStatus: { day1: true, day2: false, day3: false }
      });
      if (typeof data.googleSheetWebhookUrl === 'string') {
        config.googleSheetWebhookUrl = data.googleSheetWebhookUrl.trim();
      }
      if (typeof data.mediaDriveUrl === 'string') {
        config.mediaDriveUrl = data.mediaDriveUrl.trim();
        const agenda = readJson(AGENDA_FILE, null);
        if (agenda && agenda.meta) {
          agenda.meta.mediaDriveUrl = config.mediaDriveUrl;
          agenda.meta.lastUpdated = new Date().toISOString();
          writeJson(AGENDA_FILE, agenda);
        }
      }
      if (data.formsStatus && typeof data.formsStatus === 'object') {
        config.formsStatus = {
          day1: Boolean(data.formsStatus.day1),
          day2: Boolean(data.formsStatus.day2),
          day3: Boolean(data.formsStatus.day3)
        };
      }
      writeJson(CONFIG_FILE, config);
      return sendJson(200, { success: true, config });
    });
  }

  // Route: POST /api/config/form-status (toggle open/closed for a specific day)
  if (url === '/api/config/form-status' && req.method === 'POST') {
    return parseBody((data) => {
      const { dayId, isOpen } = data;
      if (!dayId) return sendJson(400, { error: 'dayId is required' });

      const config = readJson(CONFIG_FILE, {
        googleSheetWebhookUrl: '',
        formsStatus: { day1: true, day2: false, day3: false }
      });
      if (!config.formsStatus) {
        config.formsStatus = { day1: true, day2: false, day3: false };
      }
      config.formsStatus[dayId] = Boolean(isOpen);
      writeJson(CONFIG_FILE, config);

      return sendJson(200, { success: true, formsStatus: config.formsStatus });
    });
  }

  // Route: POST /api/test-sheets (test Google Sheets Webhook with live diagnostics)
  if (url === '/api/test-sheets' && req.method === 'POST') {
    return parseBody(async (data) => {
      const targetUrl = data.url || readJson(CONFIG_FILE, {}).googleSheetWebhookUrl;
      if (!targetUrl || !targetUrl.startsWith('http')) {
        return sendJson(400, { error: 'Please enter a valid Google Apps Script Web App URL.' });
      }

      const testPayload = {
        id: 'test_' + Date.now(),
        dayNumber: 1,
        dayName: 'Civil War',
        memberName: 'S.H.I.E.L.D. Diagnostic Bot',
        clientIp: clientIp || '192.168.1.1',
        overallRating: 5,
        sessionRating: 5,
        foodRating: 5,
        foodComment: 'Test entry confirmed! Catering connection established.',
        wentWell: 'Google Sheet linked successfully with separate tabs per day.',
        wentBad: 'None - systems fully operational.',
        improvement: 'Ready for live conference debriefs.',
        submittedAt: new Date().toISOString()
      };

      try {
        const result = await forwardToGoogleSheet(targetUrl, testPayload);
        if (result.success) {
          return sendJson(200, { success: true, response: result.response });
        } else {
          return sendJson(500, { success: false, error: result.error });
        }
      } catch (err) {
        return sendJson(500, { success: false, error: err.toString() });
      }
    });
  }

  // Route: POST /api/sync-all-sheets (Push all stored records to Google Sheets in batch)
  if (url === '/api/sync-all-sheets' && req.method === 'POST') {
    return parseBody(async (data) => {
      const targetUrl = data.url || readJson(CONFIG_FILE, {}).googleSheetWebhookUrl;
      if (!targetUrl || !targetUrl.startsWith('http')) {
        return sendJson(400, { error: 'Please enter a valid Google Apps Script Web App URL.' });
      }

      const feedbacks = readJson(FEEDBACK_FILE, []);
      if (!feedbacks.length) {
        return sendJson(200, { success: true, synced: 0, message: 'No stored debriefs to sync.' });
      }

      let successCount = 0;
      for (const item of feedbacks) {
        try {
          await forwardToGoogleSheet(targetUrl, item);
          successCount++;
        } catch (e) {
          console.warn('Batch sync item error:', e);
        }
      }

      return sendJson(200, { success: true, synced: successCount, total: feedbacks.length });
    });
  }

  // Route: GET /api/export-csv
  if (url.startsWith('/api/export-csv') && req.method === 'GET') {
    const feedbacks = readJson(FEEDBACK_FILE, []);

    const headers = [
      'ID',
      'Day',
      'Day Codename',
      'Operative Name',
      'IP Address',
      'Overall Rating (1-5)',
      'Sessions Rating (1-5)',
      'Food Rating (1-5)',
      'Food Comments',
      'What Went Well',
      'What Went Bad',
      'What Can Be Improved',
      'Submitted At'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = feedbacks.map((f) => [
      escapeCsv(f.id),
      escapeCsv(`Day ${f.dayNumber}`),
      escapeCsv(f.dayName || ''),
      escapeCsv(f.memberName),
      escapeCsv(f.clientIp),
      escapeCsv(f.overallRating),
      escapeCsv(f.sessionRating),
      escapeCsv(f.foodRating),
      escapeCsv(f.foodComment || ''),
      escapeCsv(f.wentWell || ''),
      escapeCsv(f.wentBad || ''),
      escapeCsv(f.improvement || ''),
      escapeCsv(f.submittedAt)
    ].join(','));

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="rabat-co26-2-debriefs.csv"');
    return res.end(csvContent);
  }

  // Route: GET /api/members
  if (url === '/api/members' && req.method === 'GET') {
    const members = readJson(MEMBERS_FILE, {});
    return sendJson(200, {
      count: Object.keys(members).length,
      members: Object.values(members)
    });
  }

  // =============================================
  // ANNOUNCEMENTS API
  // =============================================

  // Route: GET /api/announcements
  if (url === '/api/announcements' && req.method === 'GET') {
    const announcements = readJson(ANNOUNCEMENTS_FILE, []);
    // Return sorted by most recent first
    announcements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sendJson(200, { announcements });
  }

  // Route: POST /api/announcements (admin-only: create new announcement)
  if (url === '/api/announcements' && req.method === 'POST') {
    return parseBody((data) => {
      const { title, message, priority, category, targetRoom, targetTrack, relatedSessionId, password } = data;
      if ((password || '').trim() !== ADMIN_PASSWORD) {
        return sendJson(401, { error: 'Unauthorized' });
      }
      if (!message || !message.trim()) {
        return sendJson(400, { error: 'Message is required' });
      }

      const announcements = readJson(ANNOUNCEMENTS_FILE, []);
      const newAnnouncement = {
        id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        title: (title || '').trim() || 'Announcement',
        message: message.trim(),
        priority: priority || 'normal', // 'urgent' | 'normal' | 'info'
        category: category || 'general', // 'general' | 'schedule_change' | 'urgent' | 'room_change' | 'cancellation'
        targetRoom: (targetRoom || '').trim() || undefined,
        targetTrack: (targetTrack || '').trim() || undefined,
        relatedSessionId: (relatedSessionId || '').trim() || undefined,
        createdAt: new Date().toISOString(),
        createdBy: 'Command Center'
      };

      announcements.push(newAnnouncement);
      writeJson(ANNOUNCEMENTS_FILE, announcements);

      return sendJson(200, { success: true, announcement: newAnnouncement });
    });
  }

  // Route: POST /api/announcements/delete (admin-only: delete announcement)
  if (url === '/api/announcements/delete' && req.method === 'POST') {
    return parseBody((data) => {
      const { id, password } = data;
      if ((password || '').trim() !== ADMIN_PASSWORD) {
        return sendJson(401, { error: 'Unauthorized' });
      }
      if (!id) return sendJson(400, { error: 'ID is required' });

      let announcements = readJson(ANNOUNCEMENTS_FILE, []);
      announcements = announcements.filter((a) => a.id !== id);
      writeJson(ANNOUNCEMENTS_FILE, announcements);

      return sendJson(200, { success: true, count: announcements.length });
    });
  }

  // =============================================
  // AGENDA & LIVE SCHEDULE API
  // =============================================

  // Route: GET /api/agenda
  if (url === '/api/agenda' && req.method === 'GET') {
    const agenda = readJson(AGENDA_FILE, null);
    if (!agenda) {
      return sendJson(500, { error: 'Agenda data not initialized' });
    }
    return sendJson(200, { 
      success: true, 
      agenda,
      lastUpdated: agenda.meta?.lastUpdated || new Date().toISOString(),
      version: agenda.meta?.version || 1
    });
  }

  // Route: POST /api/agenda/session (update or create session details)
  if (url === '/api/agenda/session' && req.method === 'POST') {
    return parseBody((data) => {
      const { dayId, session, password } = data;
      if ((password || '').trim() !== ADMIN_PASSWORD) {
        return sendJson(401, { error: 'Unauthorized: invalid security passcode' });
      }
      if (!dayId || !session || !session.id) {
        return sendJson(400, { error: 'dayId and session with id are required' });
      }

      const agenda = readJson(AGENDA_FILE, null);
      if (!agenda || !agenda.days[dayId]) {
        return sendJson(404, { error: 'Day not found' });
      }

      const daySchedule = agenda.days[dayId];
      const existingIdx = daySchedule.sessions.findIndex((s) => s.id === session.id);
      if (existingIdx >= 0) {
        daySchedule.sessions[existingIdx] = {
          ...daySchedule.sessions[existingIdx],
          ...session,
          updatedAt: new Date().toISOString()
        };
      } else {
        daySchedule.sessions.push({
          ...session,
          updatedAt: new Date().toISOString()
        });
      }

      agenda.meta.lastUpdated = new Date().toISOString();
      agenda.meta.version = (agenda.meta.version || 1) + 1;
      writeJson(AGENDA_FILE, agenda);

      return sendJson(200, { 
        success: true, 
        session: existingIdx >= 0 ? daySchedule.sessions[existingIdx] : session,
        agenda 
      });
    });
  }

  // Route: POST /api/agenda/delay (calculate propagation & apply delays)
  if (url === '/api/agenda/delay' && req.method === 'POST') {
    return parseBody((data) => {
      const { 
        dayId, 
        sessionId, 
        delayMinutes, 
        propagate = true, 
        bufferCompression = 5, 
        dryRun = false, 
        password 
      } = data;

      if (!dryRun && (password || '').trim() !== ADMIN_PASSWORD) {
        return sendJson(401, { error: 'Unauthorized: invalid security passcode' });
      }
      if (!dayId || !sessionId || typeof delayMinutes !== 'number') {
        return sendJson(400, { error: 'dayId, sessionId, and delayMinutes are required' });
      }

      const agenda = readJson(AGENDA_FILE, null);
      if (!agenda || !agenda.days[dayId]) {
        return sendJson(404, { error: 'Day not found' });
      }

      const daySchedule = agenda.days[dayId];
      const targetIdx = daySchedule.sessions.findIndex((s) => s.id === sessionId);
      if (targetIdx === -1) {
        return sendJson(404, { error: 'Session not found' });
      }

      const affectedSessions = [];
      const dMin = Number(delayMinutes);

      // Target session
      const targetSession = daySchedule.sessions[targetIdx];
      const startM = timeToMinutes(targetSession.time);
      const endM = timeToMinutes(targetSession.endTime || minutesToTime(startM + 60));
      const durationM = Math.max(15, endM - startM);

      if (dMin === 0) {
        delete targetSession.adjustedTime;
        delete targetSession.adjustedEndTime;
        targetSession.delayMinutes = 0;
        targetSession.status = 'scheduled';
      } else {
        const revStartM = startM + dMin;
        const revEndM = revStartM + durationM;
        targetSession.adjustedTime = minutesToTime(revStartM);
        targetSession.adjustedEndTime = minutesToTime(revEndM);
        targetSession.delayMinutes = dMin;
        targetSession.status = dMin > 0 ? 'delayed' : 'scheduled';
      }
      targetSession.updatedAt = new Date().toISOString();
      affectedSessions.push({ ...targetSession });

      // Propagation to subsequent sessions
      if (propagate) {
        let currentResidualDelay = dMin;

        for (let i = targetIdx + 1; i < daySchedule.sessions.length; i++) {
          const s = daySchedule.sessions[i];
          const sStartM = timeToMinutes(s.time);
          const sEndM = timeToMinutes(s.endTime || minutesToTime(sStartM + 60));
          const sDurationM = Math.max(15, sEndM - sStartM);

          if (dMin === 0) {
            delete s.adjustedTime;
            delete s.adjustedEndTime;
            s.delayMinutes = 0;
            s.status = 'scheduled';
            s.updatedAt = new Date().toISOString();
            affectedSessions.push({ ...s });
            continue;
          }

          // Buffer compression on breaks/meals
          if (s.type === 'break' && bufferCompression > 0) {
            const originalBreakDur = sEndM - sStartM;
            const maxAllowableCompress = Math.max(0, originalBreakDur - 10);
            const actualCompress = Math.min(bufferCompression, maxAllowableCompress);
            currentResidualDelay = Math.max(0, currentResidualDelay - actualCompress);
          }

          if (currentResidualDelay > 0) {
            const revSStartM = sStartM + currentResidualDelay;
            const revSEndM = revSStartM + sDurationM;
            s.adjustedTime = minutesToTime(revSStartM);
            s.adjustedEndTime = minutesToTime(revSEndM);
            s.delayMinutes = currentResidualDelay;
            s.status = 'delayed';
          } else {
            delete s.adjustedTime;
            delete s.adjustedEndTime;
            s.delayMinutes = 0;
            s.status = 'scheduled';
          }

          s.updatedAt = new Date().toISOString();
          affectedSessions.push({ ...s });
        }
      }

      if (dryRun) {
        return sendJson(200, {
          success: true,
          previewOnly: true,
          affectedCount: affectedSessions.length,
          affectedSessions
        });
      }

      agenda.meta.lastUpdated = new Date().toISOString();
      agenda.meta.version = (agenda.meta.version || 1) + 1;
      writeJson(AGENDA_FILE, agenda);

      // Auto-broadcast announcement for transparency
      const announcements = readJson(ANNOUNCEMENTS_FILE, []);
      const autoAnn = {
        id: `ann_sched_${Date.now()}`,
        title: dMin > 0 ? `Schedule Change: ${targetSession.title}` : `Schedule Reset: ${targetSession.title}`,
        message: dMin > 0 
          ? `Session "${targetSession.title}" delayed by +${dMin} min. Revised start: ${targetSession.adjustedTime}. Subsequent schedule adjusted accordingly.` 
          : `Schedule for "${targetSession.title}" restored to planned timetable.`,
        priority: dMin > 0 ? 'urgent' : 'normal',
        category: 'schedule_change',
        relatedSessionId: targetSession.id,
        createdAt: new Date().toISOString(),
        createdBy: 'Command Center (Auto-Propagation)'
      };
      announcements.unshift(autoAnn);
      writeJson(ANNOUNCEMENTS_FILE, announcements);

      return sendJson(200, {
        success: true,
        previewOnly: false,
        affectedCount: affectedSessions.length,
        affectedSessions,
        agenda
      });
    });
  }

  // Route: POST /api/agenda/status (change session status)
  if (url === '/api/agenda/status' && req.method === 'POST') {
    return parseBody((data) => {
      const { dayId, sessionId, status, password } = data;
      if ((password || '').trim() !== ADMIN_PASSWORD) {
        return sendJson(401, { error: 'Unauthorized: invalid security passcode' });
      }
      if (!dayId || !sessionId || !status) {
        return sendJson(400, { error: 'dayId, sessionId, and status are required' });
      }

      const agenda = readJson(AGENDA_FILE, null);
      if (!agenda || !agenda.days[dayId]) {
        return sendJson(404, { error: 'Day not found' });
      }

      const session = agenda.days[dayId].sessions.find((s) => s.id === sessionId);
      if (!session) {
        return sendJson(404, { error: 'Session not found' });
      }

      session.status = status;
      session.updatedAt = new Date().toISOString();
      agenda.meta.lastUpdated = new Date().toISOString();
      agenda.meta.version = (agenda.meta.version || 1) + 1;
      writeJson(AGENDA_FILE, agenda);

      return sendJson(200, { success: true, session, agenda });
    });
  }

  // Route: POST /api/agenda/import (bulk import or paste agenda)
  if (url === '/api/agenda/import' && req.method === 'POST') {
    return parseBody((data) => {
      const { rawData, dryRun = false, password } = data;
      if (!dryRun && (password || '').trim() !== ADMIN_PASSWORD) {
        return sendJson(401, { error: 'Unauthorized: invalid security passcode' });
      }
      if (!rawData) {
        return sendJson(400, { error: 'rawData is required (CSV, TSV, or JSON)' });
      }

      try {
        if (dryRun) {
          let parsedRows = [];
          if (typeof rawData === 'string' && rawData.trim().startsWith('{')) {
            const parsed = JSON.parse(rawData);
            const totalCount = Object.values(parsed.days || {}).reduce((acc, d) => acc + (d.sessions?.length || 0), 0);
            return sendJson(200, {
              success: true,
              previewOnly: true,
              totalCount,
              summary: {
                day1: parsed.days?.day1?.sessions?.length || 0,
                day2: parsed.days?.day2?.sessions?.length || 0,
                day3: parsed.days?.day3?.sessions?.length || 0
              },
              days: parsed.days || {}
            });
          }
          if (typeof rawData === 'string') {
            parsedRows = parseDelimitedText(rawData);
          } else if (Array.isArray(rawData)) {
            parsedRows = rawData;
          }
          const existingAgenda = readJson(AGENDA_FILE, null);
          const previewDays = convertRowsToAgendaDays(parsedRows, existingAgenda?.days);
          return sendJson(200, {
            success: true,
            previewOnly: true,
            totalCount: Object.values(previewDays).reduce((acc, d) => acc + (d.sessions?.length || 0), 0),
            summary: {
              day1: previewDays.day1.sessions.length,
              day2: previewDays.day2.sessions.length,
              day3: previewDays.day3.sessions.length
            },
            days: previewDays
          });
        }

        const updatedAgenda = importAgendaData(rawData);

        // Broadcast announcement of agenda import
        const announcements = readJson(ANNOUNCEMENTS_FILE, []);
        announcements.unshift({
          id: `ann_import_${Date.now()}`,
          title: 'Official Conference Agenda Synchronized',
          message: `The live conference agenda has been updated by the Command Center (v${updatedAgenda.meta.version}).`,
          priority: 'normal',
          category: 'schedule_change',
          createdAt: new Date().toISOString(),
          createdBy: 'Command Center (Agenda Importer)'
        });
        writeJson(ANNOUNCEMENTS_FILE, announcements);

        return sendJson(200, {
          success: true,
          previewOnly: false,
          agenda: updatedAgenda,
          version: updatedAgenda.meta.version,
          totalCount: Object.values(updatedAgenda.days).reduce((acc, d) => acc + (d.sessions?.length || 0), 0),
          summary: {
            day1: updatedAgenda.days.day1.sessions.length,
            day2: updatedAgenda.days.day2.sessions.length,
            day3: updatedAgenda.days.day3.sessions.length
          }
        });
      } catch (err) {
        return sendJson(400, { error: err.message || 'Failed to parse and import agenda data.' });
      }
    });
  }

  // =============================================
  // PHOTOS API
  // =============================================

  // Route: GET /api/photos
  if (url === '/api/photos' && req.method === 'GET') {
    const photos = readJson(PHOTOS_FILE, []);
    photos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    return sendJson(200, { photos });
  }

  // Route: POST /api/photos (upload photo as base64 data URL)
  if (url === '/api/photos' && req.method === 'POST') {
    return parseBody((data) => {
      const { imageData, caption, uploaderName } = data;
      if (!imageData || !imageData.startsWith('data:image/')) {
        return sendJson(400, { error: 'Valid image data is required' });
      }

      // Limit image size to ~5MB base64
      if (imageData.length > 7_000_000) {
        return sendJson(400, { error: 'Image too large. Max ~5MB.' });
      }

      const photos = readJson(PHOTOS_FILE, []);
      const newPhoto = {
        id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        imageData,
        caption: (caption || '').trim(),
        uploaderName: (uploaderName || '').trim() || 'Anonymous',
        uploaderIp: clientIp,
        uploadedAt: new Date().toISOString(),
        likes: 0,
        likedBy: []
      };

      photos.push(newPhoto);
      writeJson(PHOTOS_FILE, photos);

      return sendJson(200, { success: true, photo: { ...newPhoto, imageData: '[saved]' } });
    });
  }

  // Route: POST /api/photos/like (toggle like on a photo)
  if (url === '/api/photos/like' && req.method === 'POST') {
    return parseBody((data) => {
      const { photoId } = data;
      if (!photoId) return sendJson(400, { error: 'photoId is required' });

      const photos = readJson(PHOTOS_FILE, []);
      const photo = photos.find((p) => p.id === photoId);
      if (!photo) return sendJson(404, { error: 'Photo not found' });

      if (!photo.likedBy) photo.likedBy = [];
      const alreadyLiked = photo.likedBy.includes(clientIp);
      if (alreadyLiked) {
        photo.likedBy = photo.likedBy.filter((ip) => ip !== clientIp);
        photo.likes = Math.max(0, (photo.likes || 1) - 1);
      } else {
        photo.likedBy.push(clientIp);
        photo.likes = (photo.likes || 0) + 1;
      }

      writeJson(PHOTOS_FILE, photos);

      return sendJson(200, { success: true, liked: !alreadyLiked, likes: photo.likes });
    });
  }

  // Route: POST /api/photos/delete (admin-only: delete photo)
  if (url === '/api/photos/delete' && req.method === 'POST') {
    return parseBody((data) => {
      const { id, password } = data;
      if ((password || '').trim() !== ADMIN_PASSWORD) {
        return sendJson(401, { error: 'Unauthorized' });
      }
      if (!id) return sendJson(400, { error: 'ID is required' });

      let photos = readJson(PHOTOS_FILE, []);
      photos = photos.filter((p) => p.id !== id);
      writeJson(PHOTOS_FILE, photos);

      return sendJson(200, { success: true, count: photos.length });
    });
  }

  // =============================================
  // ATTENDEE DIRECTORY API (enhanced)
  // =============================================

  // Route: POST /api/members/update-profile (attendees update their own profile)
  if (url === '/api/members/update-profile' && req.method === 'POST') {
    return parseBody((data) => {
      const members = readJson(MEMBERS_FILE, {});
      const existing = members[clientIp];
      if (!existing) {
        return sendJson(404, { error: 'No profile found. Register first.' });
      }

      if (data.department !== undefined) existing.department = (data.department || '').trim();
      if (data.role !== undefined) existing.role = (data.role || '').trim();
      if (data.bio !== undefined) existing.bio = (data.bio || '').trim();
      if (data.emoji !== undefined) existing.emoji = (data.emoji || '').trim();
      existing.updatedAt = new Date().toISOString();

      members[clientIp] = existing;
      writeJson(MEMBERS_FILE, members);

      return sendJson(200, { success: true, member: existing });
    });
  }

  sendJson(404, { error: 'API route not found' });
}
