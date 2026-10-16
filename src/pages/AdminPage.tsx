import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { AdminAgendaManager } from '../components/admin/AdminAgendaManager';
import { AdminAnnouncementsManager } from '../components/admin/AdminAnnouncementsManager';
import { 
  Download, 
  Check, 
  Copy, 
  RefreshCw, 
  FileSpreadsheet, 
  Star, 
  Utensils, 
  Layers, 
  Sparkles, 
  ThumbsUp, 
  ThumbsDown, 
  Wifi, 
  ShieldCheck, 
  ShieldAlert,
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Trash2,
  UploadCloud,
  Search,
  ArrowRight,
  Radio,
  Calendar,
  Megaphone,
  Settings,
  FolderOpen,
  Save,
  ExternalLink
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  dayId: string;
  dayNumber: number;
  dayName: string;
  memberName: string;
  clientIp: string;
  overallRating: number;
  sessionRating: number;
  foodRating: number;
  foodComment?: string;
  wentWell: string;
  wentBad: string;
  improvement: string;
  submittedAt: string;
}

const ADMIN_PASS = 'wydadac37';

export const AdminPage: React.FC = () => {
  const { isAdmin, loginAdmin, logoutAdmin } = useAdmin();

  // Navigation / Section State
  const [adminSection, setAdminSection] = useState<'agenda' | 'announcements' | 'debriefs' | 'config'>('agenda');

  // Authentication State
  const [enteredPass, setEnteredPass] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Dashboard Data State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [activeDayFilter, setActiveDayFilter] = useState<'all' | number>('all');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'low' | 'high'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Daily Debrief Form Status State (Open/Close per day)
  const [formsStatus, setFormsStatus] = useState<Record<string, boolean>>({
    day1: true,
    day2: false,
    day3: false
  });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  // Google Sheets Webhook State
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isSavingUrl, setIsSavingUrl] = useState<boolean>(false);
  const [isTestingUrl, setIsTestingUrl] = useState<boolean>(false);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'tested' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Google Drive Media Vault State
  const [driveUrl, setDriveUrl] = useState<string>('https://drive.google.com/drive/folders/1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX?usp=drive_link');
  const [driveWebhookUrl, setDriveWebhookUrl] = useState<string>('');
  const [isSavingDriveUrl, setIsSavingDriveUrl] = useState<boolean>(false);
  const [isSavingDriveWebhook, setIsSavingDriveWebhook] = useState<boolean>(false);
  const [isTestingDrive, setIsTestingDrive] = useState<boolean>(false);
  const [showDriveInstructions, setShowDriveInstructions] = useState<boolean>(false);
  const [copiedDriveScript, setCopiedDriveScript] = useState<boolean>(false);

  // Check admin on mount or change
  useEffect(() => {
    if (isAdmin) {
      fetchFeedbacks();
      fetchConfig();
    }
  }, [isAdmin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(enteredPass)) {
      setAuthError('');
      fetchFeedbacks();
      fetchConfig();
    } else {
      setAuthError('Access Denied: Invalid Security Passcode');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setEnteredPass('');
  };

  const fetchFeedbacks = () => {
    setIsLoading(true);
    fetch('/api/feedback')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.feedbacks)) {
          setFeedbacks(data.feedbacks);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const fetchConfig = () => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        if (data.googleSheetWebhookUrl) {
          setWebhookUrl(data.googleSheetWebhookUrl);
        }
        if (data.googleDriveWebhookUrl !== undefined) {
          setDriveWebhookUrl(data.googleDriveWebhookUrl);
        }
        if (data.mediaDriveUrl) {
          setDriveUrl(data.mediaDriveUrl);
        }
        if (data.formsStatus) {
          setFormsStatus(data.formsStatus);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleSaveDriveUrl = async () => {
    setIsSavingDriveUrl(true);
    setStatusMessage('Saving Google Drive URL...');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaDriveUrl: driveUrl })
      });
      if (res.ok) {
        setStatusMessage('Google Drive Media Vault URL successfully updated!');
      } else {
        setStatusMessage('Failed to save Google Drive URL.');
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setIsSavingDriveUrl(false);
    }
  };

  const handleSaveDriveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDriveWebhook(true);
    setStatusMessage('Saving Google Drive Webhook URL...');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleDriveWebhookUrl: driveWebhookUrl })
      });
      if (res.ok) {
        setStatusMessage('Google Drive Upload Webhook URL saved successfully!');
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        setStatusMessage('Failed to save Google Drive Webhook URL.');
      }
    } catch (e: any) {
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setIsSavingDriveWebhook(false);
    }
  };

  const handleTestDriveWebhook = async () => {
    if (!driveWebhookUrl.trim()) {
      setStatusMessage('Please enter a Google Drive Webhook URL first.');
      return;
    }
    setIsTestingDrive(true);
    setStatusMessage('Pinging Google Drive Webhook with diagnostic image...');
    try {
      const res = await fetch('/api/test-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: driveWebhookUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage('Diagnostic Ping confirmed! Image uploaded directly to Google Drive folder.');
      } else {
        setStatusMessage(`Drive Diagnostic Error: ${data.error || 'Check that Web App access is set to Anyone'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Drive Connection Error: ${err.message}`);
    } finally {
      setIsTestingDrive(false);
    }
  };

  const handleToggleDayStatus = async (dayId: string, currentStatus: boolean) => {
    setIsUpdatingStatus(dayId);
    const newStatus = !currentStatus;
    // Optimistic UI update
    setFormsStatus((prev) => ({ ...prev, [dayId]: newStatus }));
    try {
      const res = await fetch('/api/config/form-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dayId, isOpen: newStatus })
      });
      const data = await res.json();
      if (data.formsStatus) {
        setFormsStatus(data.formsStatus);
      }
      const dayNames: Record<string, string> = {
        day1: 'Day 1 (Civil War)',
        day2: 'Day 2 (Infinity War)',
        day3: 'Day 3 (Endgame)'
      };
      setStatusMessage(`${dayNames[dayId] || dayId} debrief form is now ${newStatus ? 'OPEN' : 'CLOSED'}.`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to update form status.');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleSetAllDaysStatus = async (isOpen: boolean) => {
    setIsUpdatingStatus('all');
    const updated = { day1: isOpen, day2: isOpen, day3: isOpen };
    setFormsStatus(updated);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formsStatus: updated })
      });
      const data = await res.json();
      if (data.config?.formsStatus) {
        setFormsStatus(data.config.formsStatus);
      }
      setStatusMessage(`All daily debrief forms are now ${isOpen ? 'OPEN' : 'CLOSED'}.`);
      setTimeout(() => setStatusMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setStatusMessage('Failed to update all form statuses.');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingUrl(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleSheetWebhookUrl: webhookUrl })
      });
      if (res.ok) {
        setSaveStatus('saved');
        setStatusMessage('Google Sheet Webhook URL saved successfully!');
        setTimeout(() => setStatusMessage(''), 4000);
      }
    } catch {
      setSaveStatus('error');
      setStatusMessage('Failed to save Webhook URL.');
    } finally {
      setIsSavingUrl(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) {
      setStatusMessage('Please enter a Webhook URL first.');
      return;
    }
    setIsTestingUrl(true);
    setStatusMessage('Pinging Google Sheets Webhook with diagnostic row...');
    try {
      const res = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('tested');
        setStatusMessage('Diagnostic entry confirmed! Check your Google Sheet tabs (Day 1 - Civil War).');
      } else {
        setStatusMessage(`Diagnostic Error: ${data.error || 'Check that Web App access is set to Anyone'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Connection Error: ${err.message}`);
    } finally {
      setIsTestingUrl(false);
    }
  };

  const handleSyncAllToSheets = async () => {
    if (!webhookUrl.trim()) {
      setStatusMessage('Please configure the Google Sheet URL first.');
      return;
    }
    if (!feedbacks.length) {
      setStatusMessage('No debriefs recorded yet to sync.');
      return;
    }

    setIsSyncingAll(true);
    setStatusMessage(`Syncing ${feedbacks.length} debriefs to Google Sheets in batch...`);
    try {
      const res = await fetch('/api/sync-all-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage(`Successfully synchronized ${data.synced} debriefs to Google Sheets!`);
      } else {
        setStatusMessage(`Batch sync failed: ${data.error || 'Check Google Sheet permissions'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Sync error: ${err.message}`);
    } finally {
      setIsSyncingAll(false);
    }
  };

  const handleDeleteFeedback = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the debrief from ${name}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/feedback/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handlePurgeAll = async () => {
    const confirmText = prompt('Type "CONFIRM" to erase ALL recorded debriefs before conference start:');
    if (confirmText !== 'CONFIRM') return;

    try {
      const res = await fetch('/api/feedback/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: ADMIN_PASS })
      });
      if (res.ok) {
        setFeedbacks([]);
        setStatusMessage('All stored feedback data has been purged.');
      }
    } catch (err) {
      console.error('Purge error', err);
    }
  };

  // Filter feedbacks
  let filtered = [...feedbacks];

  if (activeDayFilter !== 'all') {
    filtered = filtered.filter((f) => f.dayNumber === activeDayFilter);
  }

  if (scoreFilter === 'low') {
    filtered = filtered.filter((f) => (f.overallRating || 0) <= 3 || (f.foodRating || 0) <= 3);
  } else if (scoreFilter === 'high') {
    filtered = filtered.filter((f) => (f.overallRating || 0) >= 4);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((f) => {
      return (
        f.memberName.toLowerCase().includes(q) ||
        f.clientIp.includes(q) ||
        (f.foodComment && f.foodComment.toLowerCase().includes(q)) ||
        (f.wentWell && f.wentWell.toLowerCase().includes(q)) ||
        (f.wentBad && f.wentBad.toLowerCase().includes(q)) ||
        (f.improvement && f.improvement.toLowerCase().includes(q))
      );
    });
  }

  // Stats calculation
  const totalCount = filtered.length;
  const avgOverall = totalCount
    ? (filtered.reduce((sum, f) => sum + (f.overallRating || 0), 0) / totalCount).toFixed(1)
    : '0.0';
  const avgSession = totalCount
    ? (filtered.reduce((sum, f) => sum + (f.sessionRating || 0), 0) / totalCount).toFixed(1)
    : '0.0';
  const avgFood = totalCount
    ? (filtered.reduce((sum, f) => sum + (f.foodRating || 0), 0) / totalCount).toFixed(1)
    : '0.0';

  const scriptCode = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);
  try {
    var data = null;
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch(err) { data = e.parameter; }
    } else if (e && e.parameter) { data = e.parameter; }
    if (!data) return ContentService.createTextOutput(JSON.stringify({status:'error'})).setMimeType(ContentService.MimeType.JSON);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var dayNumber = Number(data.dayNumber) || 1;
    var dayCodename = data.dayName || (dayNumber === 1 ? 'Civil War' : dayNumber === 2 ? 'Infinity War' : 'Endgame');
    var sheetName = 'Day ' + dayNumber + ' - ' + dayCodename;
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      var headers = ['Timestamp','Operative Name','Device IP','Overall Day Rating (1-5)','Sessions Rating (1-5)','Food Rating (1-5)','Food & Catering Notes','What Went Well','What Went Bad','What Can Be Improved'];
      sheet.appendRow(headers);
      var color = dayNumber === 1 ? '#B71C1C' : dayNumber === 2 ? '#6A1B9A' : '#D4AF37';
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setFontColor('#FFFFFF').setBackground(color).setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 170); sheet.setColumnWidth(2, 160); sheet.setColumnWidth(3, 130);
      sheet.setColumnWidth(7, 240); sheet.setColumnWidth(8, 280); sheet.setColumnWidth(9, 280); sheet.setColumnWidth(10, 280);
    }

    sheet.appendRow([data.submittedAt, data.memberName, data.clientIp, data.overallRating, data.sessionRating, data.foodRating, data.foodComment, data.wentWell, data.wentBad, data.improvement]);
    sheet.getRange(sheet.getLastRow(), 4, 1, 3).setHorizontalAlignment('center').setFontWeight('bold');
    return ContentService.createTextOutput(JSON.stringify({status:'success'})).setMimeType(ContentService.MimeType.JSON);
  } finally { lock.releaseLock(); }
}
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status:'online', message:'ASGARD\'CO 26 Webhook is active'})).setMimeType(ContentService.MimeType.JSON);
}`;

  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const driveScriptCode = `var TARGET_FOLDER_ID = "1I_K2CNDEx9i9tX3e14P85PJcXHfk0EIX";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);
  try {
    var data = null;
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch(err) { data = e.parameter; }
    } else if (e && e.parameter) { data = e.parameter; }
    if (!data) return createJsonResponse({ status: 'error', message: 'No payload data received' });

    var folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
    if (!folder) return createJsonResponse({ status: 'error', message: 'Target folder not found' });

    var imageData = data.imageData || data.base64 || '';
    if (!imageData) return createJsonResponse({ status: 'error', message: 'No image data provided' });

    var mimeType = 'image/jpeg';
    var base64Content = imageData;
    if (imageData.indexOf('data:') === 0 && imageData.indexOf(';base64,') > -1) {
      var parts = imageData.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      base64Content = parts[1];
    }

    var decoded = Utilities.base64Decode(base64Content);
    var uploader = (data.uploaderName || 'delegate').replace(/[^a-zA-Z0-9_-]/g, '_');
    var timestamp = Utilities.formatDate(new Date(), 'GMT', 'yyyyMMdd_HHmmss');
    var extension = mimeType.indexOf('png') > -1 ? '.png' : '.jpg';
    var fileName = 'asgard_' + uploader + '_' + timestamp + extension;

    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = folder.createFile(blob);

    if (data.caption) {
      file.setDescription('Caption: ' + data.caption + ' | Uploaded by: ' + (data.uploaderName || 'Delegate'));
    }

    return createJsonResponse({
      status: 'success',
      message: 'Photo uploaded directly into Google Drive folder!',
      fileId: file.getId(),
      fileName: fileName,
      fileUrl: file.getUrl()
    });
  } catch (err) {
    return createJsonResponse({ status: 'error', error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return createJsonResponse({ status: 'online', message: 'Asgard CO 26 Photo Uploader is ready.', folderId: TARGET_FOLDER_ID });
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}`;

  const copyDriveScriptToClipboard = () => {
    navigator.clipboard.writeText(driveScriptCode);
    setCopiedDriveScript(true);
    setTimeout(() => setCopiedDriveScript(false), 2500);
  };

  // --------------------------------------------------------------------------
  // PASSWORD GATE: If not authenticated, show security login
  // --------------------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl glass-card border border-white/15 p-6 sm:p-8 bg-[#080B12]/95 shadow-2xl relative overflow-hidden text-center">
          {/* Ambient Security Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-stark-red/25 rounded-full blur-3xl pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stark-red/30 to-infinity-purple/30 border border-white/15 flex items-center justify-center mx-auto mb-4 text-stark-red">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="font-label text-[11px] font-bold uppercase tracking-widest text-stark-red mb-1">
            Level 7 Security Clearance
          </div>
          <h3 className="font-display font-bold text-3xl uppercase tracking-wide text-off-white mb-2">
            Command Authorization
          </h3>
          <p className="text-xs text-muted-text mb-6 font-sans leading-relaxed">
            Enter the S.H.I.E.L.D. Command passcode to access live conference intelligence, Google Sheets synchronization, and operative feedback records.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 font-label text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-text mb-1.5">
                Admin Security Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={enteredPass}
                  onChange={(e) => {
                    setEnteredPass(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="Enter passcode"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-surface-card border border-white/15 focus:border-stark-red text-sm text-off-white placeholder:text-muted-text/40 outline-none transition-all font-mono"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text hover:text-off-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="text-xs text-stark-red font-medium py-2 px-3 rounded-xl bg-stark-red/10 border border-stark-red/30 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-stark-red to-infinity-purple text-off-white font-bold text-xs uppercase tracking-wider shadow-glow-combo hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Authorize Clearance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // AUTHENTICATED COMMAND DASHBOARD
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto font-sans">
      {/* Top Banner & Command Logout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl glass-card border border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-semibold text-emerald-400 mb-2 font-label">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="tracking-wider uppercase">S.H.I.E.L.D. COMMAND · LEVEL 7 AUTHORIZED</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-wide text-off-white leading-tight">
            Debrief Intelligence & Control Center
          </h2>
          <p className="text-xs sm:text-sm text-muted-text mt-0.5">
            Full oversight of daily ratings, catering feedback, and real-time Google Sheets synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2 font-label shrink-0">
          <a
            href="/api/export-csv"
            download="rabat-co26-2-debriefs.csv"
            className="px-3.5 py-2 rounded-xl bg-surface-card hover:bg-surface-hover border border-white/15 text-xs font-semibold text-off-white flex items-center gap-2 transition-all"
            title="Download CSV for Excel / Google Sheets"
          >
            <Download className="w-3.5 h-3.5 text-endgame-gold" />
            <span>Export CSV</span>
          </a>

          <button
            onClick={fetchFeedbacks}
            className="p-2 rounded-xl bg-surface-card hover:bg-surface-hover border border-white/15 text-muted-text hover:text-off-white transition-all"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl bg-stark-red/10 hover:bg-stark-red/20 border border-stark-red/30 text-xs font-semibold text-stark-red flex items-center gap-1.5 transition-all"
            title="Lock Command Station"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* COMMAND CENTER SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar font-label">
        <button
          type="button"
          onClick={() => setAdminSection('agenda')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
            adminSection === 'agenda'
              ? 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/50 shadow-sm'
              : 'bg-white/5 text-muted-text hover:text-off-white border-white/5'
          }`}
        >
          <Calendar className="w-4 h-4 text-endgame-gold" />
          <span>Live Agenda & Delays</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSection('announcements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
            adminSection === 'announcements'
              ? 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/50 shadow-sm'
              : 'bg-white/5 text-muted-text hover:text-off-white border-white/5'
          }`}
        >
          <Megaphone className="w-4 h-4 text-purple-300" />
          <span>Broadcasts & Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSection('debriefs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
            adminSection === 'debriefs'
              ? 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/50 shadow-sm'
              : 'bg-white/5 text-muted-text hover:text-off-white border-white/5'
          }`}
        >
          <ThumbsUp className="w-4 h-4 text-emerald-400" />
          <span>Debrief Intelligence</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminSection('config')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
            adminSection === 'config'
              ? 'bg-endgame-gold/20 text-endgame-gold border-endgame-gold/50 shadow-sm'
              : 'bg-white/5 text-muted-text hover:text-off-white border-white/5'
          }`}
        >
          <Settings className="w-4 h-4 text-arc-blue" />
          <span>Form Locks & Sync</span>
        </button>
      </div>

      {/* Render Agenda Command Center */}
      {adminSection === 'agenda' && <AdminAgendaManager adminPassword={ADMIN_PASS} />}

      {/* Render Announcements Command Center */}
      {adminSection === 'announcements' && <AdminAnnouncementsManager adminPassword={ADMIN_PASS} />}

      {/* Form Locks / Config */}
      {adminSection === 'config' && (
      <>
      <div className="p-5 rounded-2xl glass-card border border-white/10 bg-gradient-to-br from-[#12111E] via-[#0D101A] to-[#0A0D15] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arc-blue/20 via-infinity-purple/20 to-stark-red/20 border border-white/15 flex items-center justify-center text-off-white shrink-0">
              <Radio className="w-5 h-5 text-endgame-gold animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-display font-bold text-xl uppercase tracking-wide text-off-white">
                  Daily Debrief Form Gateways
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-arc-blue/20 text-arc-blue border border-arc-blue/30 font-label">
                  Live Window Control
                </span>
              </div>
              <p className="text-xs text-muted-text mt-0.5">
                Open or close operative feedback forms for each day. Operatives are blocked from submitting when a day is marked CLOSED.
              </p>
            </div>
          </div>

          {/* Quick Bulk Action Buttons */}
          <div className="flex items-center gap-2 font-label">
            <button
              type="button"
              onClick={() => handleSetAllDaysStatus(true)}
              disabled={isUpdatingStatus !== null}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40"
              title="Open debrief forms for all 3 days simultaneously"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Open All Days</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetAllDaysStatus(false)}
              disabled={isUpdatingStatus !== null}
              className="px-3 py-1.5 rounded-xl bg-stark-red/15 hover:bg-stark-red/25 border border-stark-red/30 text-stark-red text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-40"
              title="Close and lock debrief forms for all 3 days"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Close All Days</span>
            </button>
          </div>
        </div>

        {/* 3 Day Gateways Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 font-label">
          {/* Day 1 - Civil War */}
          {(() => {
            const isOpen = formsStatus.day1 !== false;
            const count = feedbacks.filter((f) => f.dayNumber === 1).length;
            const isBusy = isUpdatingStatus === 'day1' || isUpdatingStatus === 'all';
            return (
              <div
                className={`p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                  isOpen
                    ? 'bg-stark-red/10 border-stark-red/40 shadow-[0_0_15px_rgba(230,57,70,0.15)]'
                    : 'bg-surface-card/60 border-white/10 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stark-red">
                      Day 1 · October 16
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isOpen
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-stark-red/20 text-stark-red border border-stark-red/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-stark-red'}`} />
                      {isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>

                  <h5 className="font-display font-bold text-lg text-off-white uppercase tracking-wide">
                    Civil War
                  </h5>
                  <p className="text-[11px] text-muted-text mt-0.5 font-sans">
                    Kickoff, Leadership Transitions & First Debriefs.
                  </p>
                  <div className="text-[11px] text-muted-text/80 mt-1 font-mono">
                    {count} recorded response{count === 1 ? '' : 's'}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleToggleDayStatus('day1', isOpen)}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    isOpen
                      ? 'bg-stark-red/20 hover:bg-stark-red/30 text-stark-red border border-stark-red/40 hover:shadow-glow-red'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {isOpen ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isBusy ? 'Updating...' : 'Close Day 1 Form'}</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{isBusy ? 'Updating...' : 'Open Day 1 Form'}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Day 2 - Infinity War */}
          {(() => {
            const isOpen = formsStatus.day2 === true;
            const count = feedbacks.filter((f) => f.dayNumber === 2).length;
            const isBusy = isUpdatingStatus === 'day2' || isUpdatingStatus === 'all';
            return (
              <div
                className={`p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                  isOpen
                    ? 'bg-infinity-purple/10 border-infinity-purple/40 shadow-[0_0_15px_rgba(142,68,173,0.15)]'
                    : 'bg-surface-card/60 border-white/10 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-infinity-purple-light">
                      Day 2 · October 17
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isOpen
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-stark-red/20 text-stark-red border border-stark-red/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-stark-red'}`} />
                      {isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>

                  <h5 className="font-display font-bold text-lg text-off-white uppercase tracking-wide">
                    Infinity War
                  </h5>
                  <p className="text-[11px] text-muted-text mt-0.5 font-sans">
                    Plenaries, Global Village & Gala Night.
                  </p>
                  <div className="text-[11px] text-muted-text/80 mt-1 font-mono">
                    {count} recorded response{count === 1 ? '' : 's'}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleToggleDayStatus('day2', isOpen)}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    isOpen
                      ? 'bg-stark-red/20 hover:bg-stark-red/30 text-stark-red border border-stark-red/40 hover:shadow-glow-red'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {isOpen ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isBusy ? 'Updating...' : 'Close Day 2 Form'}</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{isBusy ? 'Updating...' : 'Open Day 2 Form'}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })()}

          {/* Day 3 - Endgame */}
          {(() => {
            const isOpen = formsStatus.day3 === true;
            const count = feedbacks.filter((f) => f.dayNumber === 3).length;
            const isBusy = isUpdatingStatus === 'day3' || isUpdatingStatus === 'all';
            return (
              <div
                className={`p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between gap-3 ${
                  isOpen
                    ? 'bg-endgame-gold/10 border-endgame-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                    : 'bg-surface-card/60 border-white/10 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-endgame-gold">
                      Day 3 · October 18
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isOpen
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-stark-red/20 text-stark-red border border-stark-red/30'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-ping' : 'bg-stark-red'}`} />
                      {isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>

                  <h5 className="font-display font-bold text-lg text-off-white uppercase tracking-wide">
                    Endgame
                  </h5>
                  <p className="text-[11px] text-muted-text mt-0.5 font-sans">
                    Strategy Synthesis, Final Closing & Wrap-up.
                  </p>
                  <div className="text-[11px] text-muted-text/80 mt-1 font-mono">
                    {count} recorded response{count === 1 ? '' : 's'}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleToggleDayStatus('day3', isOpen)}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 ${
                    isOpen
                      ? 'bg-stark-red/20 hover:bg-stark-red/30 text-stark-red border border-stark-red/40 hover:shadow-glow-red'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  }`}
                >
                  {isOpen ? (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isBusy ? 'Updating...' : 'Close Day 3 Form'}</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{isBusy ? 'Updating...' : 'Open Day 3 Form'}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Google Sheets Control Center Card */}
      <div className="p-5 rounded-2xl glass-card border border-white/10 bg-gradient-to-br from-[#121824] to-[#0A0D15] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xl uppercase tracking-wide text-off-white">
                Google Sheets Auto-Sync Engine
              </h4>
              <p className="text-xs text-muted-text">
                Every debrief automatically routes to its day tab (<code>Day 1 - Civil War</code>, <code>Day 2 - Infinity War</code>, <code>Day 3 - Endgame</code>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-label ${
              webhookUrl ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-muted-text border border-white/10'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${webhookUrl ? 'bg-emerald-400' : 'bg-dim-text'}`} />
              {webhookUrl ? 'Engine Active' : 'Not Linked'}
            </span>

            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-xs text-arc-blue hover:underline font-label flex items-center gap-1 ml-2"
            >
              <span>Setup Guide</span>
              {showInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Input & Action Buttons */}
        <form onSubmit={handleSaveWebhook} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 font-label">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="Paste Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec)"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-card border border-white/10 focus:border-arc-blue text-xs text-off-white placeholder:text-muted-text/50 outline-none transition-all font-mono"
          />

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSavingUrl}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-arc-blue to-infinity-purple text-off-white text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all shrink-0"
            >
              {isSavingUrl ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save URL'}
            </button>

            {webhookUrl && (
              <>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={isTestingUrl}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-off-white text-xs font-semibold hover:border-emerald-400 transition-all shrink-0 flex items-center gap-1.5"
                  title="Send a sample row to Google Sheets to verify connection"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingUrl ? 'animate-spin' : ''}`} />
                  <span>{isTestingUrl ? 'Testing...' : 'Test Ping'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncAllToSheets}
                  disabled={isSyncingAll || !feedbacks.length}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-40"
                  title="Push all stored debriefs to Google Sheets in batch"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{isSyncingAll ? 'Syncing...' : 'Push All Stored'}</span>
                </button>
              </>
            )}
          </div>
        </form>

        {statusMessage && (
          <div className="p-3 rounded-xl bg-surface-card border border-white/10 text-xs font-label text-off-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-arc-blue shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Step-by-Step Google Script Accordion */}
        {showInstructions && (
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3 font-sans text-xs text-muted-text leading-relaxed">
            <div className="flex items-center justify-between text-off-white font-bold font-label">
              <span>Google Spreadsheet Link Instructions:</span>
              <button
                onClick={copyScriptToClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-off-white text-xs font-label transition-colors"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied Code!' : 'Copy Script Code'}</span>
              </button>
            </div>
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>Open your Google Sheet (e.g. <em>"ASGARD'CO 26 Debriefs"</em>).</li>
              <li>Go to <strong>Extensions → Apps Script</strong> in the top Google menu.</li>
              <li>Delete all existing code, click <strong>"Copy Script Code"</strong> above, and paste it into the editor.</li>
              <li>Click <strong>Save</strong> (Ctrl+S).</li>
              <li>Click <strong>Deploy → New deployment</strong> (top-right).</li>
              <li>Select type <strong>Web app</strong>, and set <strong>"Who has access"</strong> to <strong>Anyone</strong> (crucial).</li>
              <li>Click <strong>Deploy</strong>, authorize permissions, and copy the Web App URL (ends in <code>/exec</code>).</li>
              <li>Paste the URL into the box above and click <strong>Test Ping</strong>!</li>
            </ol>
          </div>
        )}
      </div>

      {/* Google Drive Media Vault Card */}
      <div className="p-5 rounded-2xl glass-card border border-endgame-gold/30 bg-gradient-to-br from-[#181520] via-[#0D101A] to-[#0A0D15] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-endgame-gold/20 text-endgame-gold border border-endgame-gold/40 flex items-center justify-center shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-xl uppercase tracking-wide text-off-white">
                Conference Media Vault & Google Drive
              </h4>
              <p className="text-xs text-muted-text">
                Centralized Google Drive folder for delegate photo/video uploads, roll-call footage, and gala snapshots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-off-white font-semibold flex items-center gap-1.5 transition-all font-label"
            >
              <span>Open Drive</span>
              <ExternalLink className="w-3.5 h-3.5 text-endgame-gold" />
            </a>
          </div>
        </div>

        {/* 1. Shared Folder Link */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-off-white font-label">
            1. Shared Google Drive Folder Link (URL)
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="url"
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-surface-card border border-white/15 text-xs text-off-white placeholder:text-muted-text/50 font-mono outline-none focus:border-endgame-gold transition-colors"
            />
            <button
              onClick={handleSaveDriveUrl}
              disabled={isSavingDriveUrl}
              className="px-4 py-2 rounded-xl bg-endgame-gold hover:bg-amber-400 text-charcoal-black font-extrabold text-xs uppercase tracking-wider font-label flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSavingDriveUrl ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Drive Link</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-muted-text/80">
            This Drive folder is linked on the Home page, Photo Wall, and Media Vault. Make sure sharing is set to <strong>"Anyone with the link can edit/upload"</strong>.
          </p>
        </div>

        {/* 2. Automated Google Drive Upload Engine (Apps Script Webhook) */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <label className="block text-xs font-semibold text-off-white font-label">
                  2. Direct Google Drive Auto-Upload Webhook (Web App)
                </label>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-label ${
                  driveWebhookUrl ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-muted-text border border-white/10'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${driveWebhookUrl ? 'bg-emerald-400' : 'bg-dim-text'}`} />
                  {driveWebhookUrl ? 'Auto-Upload Active' : 'Not Linked'}
                </span>
              </div>
              <p className="text-[11px] text-muted-text mt-0.5">
                Allows delegates to upload photos directly from the app into the Drive folder without opening external tabs.
              </p>
            </div>

            <button
              onClick={() => setShowDriveInstructions(!showDriveInstructions)}
              className="text-xs text-endgame-gold hover:underline font-label flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Setup Guide</span>
              {showDriveInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <form onSubmit={handleSaveDriveWebhook} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 font-label">
            <input
              type="url"
              value={driveWebhookUrl}
              onChange={(e) => setDriveWebhookUrl(e.target.value)}
              placeholder="Paste Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec)"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-card border border-white/10 focus:border-endgame-gold text-xs text-off-white placeholder:text-muted-text/50 outline-none transition-all font-mono"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSavingDriveWebhook}
                className="px-4 py-2.5 rounded-xl bg-endgame-gold hover:bg-amber-400 text-charcoal-black font-extrabold text-xs uppercase tracking-wider transition-all shrink-0 active:scale-95 disabled:opacity-50"
              >
                {isSavingDriveWebhook ? 'Saving...' : 'Save Webhook'}
              </button>

              {driveWebhookUrl && (
                <button
                  type="button"
                  onClick={handleTestDriveWebhook}
                  disabled={isTestingDrive}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-off-white text-xs font-semibold hover:border-endgame-gold transition-all shrink-0 flex items-center gap-1.5"
                  title="Send a sample badge to Google Drive to verify connection"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingDrive ? 'animate-spin' : ''}`} />
                  <span>{isTestingDrive ? 'Testing...' : 'Test Drive Ping'}</span>
                </button>
              )}
            </div>
          </form>

          {/* Drive Setup Guide Accordion */}
          {showDriveInstructions && (
            <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3 font-sans text-xs text-muted-text leading-relaxed">
              <div className="flex items-center justify-between text-off-white font-bold font-label">
                <span>Google Drive Photo Uploader Setup (Takes ~1 min):</span>
                <button
                  onClick={copyDriveScriptToClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-off-white text-xs font-label transition-colors"
                >
                  {copiedDriveScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDriveScript ? 'Copied Code!' : 'Copy Script Code'}</span>
                </button>
              </div>
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Open Google Drive (<a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-endgame-gold underline">script.google.com</a>).</li>
                <li>Click <strong>+ New project</strong> and title it <em>"Asgard Photo Uploader"</em>.</li>
                <li>Delete existing code, click <strong>"Copy Script Code"</strong> above, and paste it.</li>
                <li>Click <strong>Save</strong> (Ctrl+S).</li>
                <li>Click <strong>Deploy → New deployment</strong> (top-right).</li>
                <li>Choose type <strong>Web app</strong>. Set:
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>Description: <em>"Asgard Photo Upload"</em></li>
                    <li>Execute as: <em>"Me"</em></li>
                    <li>Who has access: <strong>"Anyone"</strong> (crucial so delegates can upload).</li>
                  </ul>
                </li>
                <li>Click <strong>Deploy</strong>, grant permissions, and copy the Web App URL (ends in <code>/exec</code>).</li>
                <li>Paste the URL into the box above and click <strong>Test Drive Ping</strong>!</li>
              </ol>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* Debriefs Intelligence Section */}
      {adminSection === 'debriefs' && (
      <>
      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-label">
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <div className="text-[10px] uppercase font-bold text-muted-text tracking-wider">Total Debriefs</div>
          <div className="text-3xl font-display font-extrabold text-off-white mt-1">{totalCount}</div>
          <div className="text-[10px] text-muted-text mt-0.5">Operative responses</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <div className="text-[10px] uppercase font-bold text-endgame-gold tracking-wider flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            <span>Overall Score</span>
          </div>
          <div className="text-3xl font-display font-extrabold text-endgame-gold mt-1">
            {avgOverall} <span className="text-sm font-sans font-normal opacity-70">/ 5</span>
          </div>
          <div className="text-[10px] text-muted-text mt-0.5">Average day score</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <div className="text-[10px] uppercase font-bold text-arc-blue tracking-wider flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Sessions Rating</span>
          </div>
          <div className="text-3xl font-display font-extrabold text-arc-blue mt-1">
            {avgSession} <span className="text-sm font-sans font-normal opacity-70">/ 5</span>
          </div>
          <div className="text-[10px] text-muted-text mt-0.5">Plenary & tactical workshops</div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <div className="text-[10px] uppercase font-bold text-energy-orange tracking-wider flex items-center gap-1">
            <Utensils className="w-3 h-3" />
            <span>Food & Catering</span>
          </div>
          <div className="text-3xl font-display font-extrabold text-energy-orange mt-1">
            {avgFood} <span className="text-sm font-sans font-normal opacity-70">/ 5</span>
          </div>
          <div className="text-[10px] text-muted-text mt-0.5">Meals & coffee breaks</div>
        </div>
      </div>

      {/* Advanced Filter Toolbar: Days, Ratings, Search */}
      <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-3 font-label">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Day Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveDayFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeDayFilter === 'all'
                  ? 'bg-gradient-to-r from-stark-red via-infinity-purple to-endgame-gold text-off-white font-bold shadow-glow-combo'
                  : 'bg-white/5 text-muted-text hover:text-off-white'
              }`}
            >
              All Days ({feedbacks.length})
            </button>

            <button
              onClick={() => setActiveDayFilter(1)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeDayFilter === 1
                  ? 'bg-stark-red text-off-white font-bold shadow-glow-red'
                  : 'bg-white/5 text-muted-text hover:text-off-white'
              }`}
            >
              Day 1 ({feedbacks.filter((f) => f.dayNumber === 1).length})
            </button>

            <button
              onClick={() => setActiveDayFilter(2)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeDayFilter === 2
                  ? 'bg-infinity-purple text-off-white font-bold shadow-glow-purple'
                  : 'bg-white/5 text-muted-text hover:text-off-white'
              }`}
            >
              Day 2 ({feedbacks.filter((f) => f.dayNumber === 2).length})
            </button>

            <button
              onClick={() => setActiveDayFilter(3)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeDayFilter === 3
                  ? 'bg-endgame-gold text-midnight font-bold shadow-glow-gold'
                  : 'bg-white/5 text-muted-text hover:text-off-white'
              }`}
            >
              Day 3 ({feedbacks.filter((f) => f.dayNumber === 3).length})
            </button>
          </div>

          {/* Score Level Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-text text-[11px] mr-1">Rating Filter:</span>
            <button
              onClick={() => setScoreFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                scoreFilter === 'all' ? 'bg-white/20 text-off-white font-bold' : 'text-muted-text hover:text-off-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setScoreFilter('low')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                scoreFilter === 'low' ? 'bg-stark-red/25 text-stark-red font-bold border border-stark-red/40' : 'text-muted-text hover:text-off-white'
              }`}
            >
              Needs Attention (≤ 3★)
            </button>
            <button
              onClick={() => setScoreFilter('high')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                scoreFilter === 'high' ? 'bg-emerald-500/25 text-emerald-400 font-bold border border-emerald-500/40' : 'text-muted-text hover:text-off-white'
              }`}
            >
              Top Rated (4–5★)
            </button>
          </div>
        </div>

        {/* Search Bar & Purge Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments, operative names, or IP..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-card border border-white/10 focus:border-arc-blue text-xs text-off-white placeholder:text-muted-text/50 outline-none"
            />
          </div>

          {feedbacks.length > 0 && (
            <button
              onClick={handlePurgeAll}
              className="self-end sm:self-auto px-3 py-1.5 rounded-lg text-[11px] text-stark-red hover:bg-stark-red/10 border border-transparent hover:border-stark-red/30 transition-all flex items-center gap-1.5"
              title="Delete all test data before official conference launch"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Test Records</span>
            </button>
          )}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all space-y-3.5"
            >
              {/* Header: Operative & Day */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arc-blue/30 to-stark-red/30 font-display font-bold text-base text-off-white flex items-center justify-center border border-white/10">
                    {item.memberName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-off-white">{item.memberName}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-text font-label">
                      <span className="flex items-center gap-1 font-mono text-emerald-400">
                        <Wifi className="w-2.5 h-2.5" />
                        {item.clientIp}
                      </span>
                      <span>•</span>
                      <span>{new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{new Date(item.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-label">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.dayNumber === 1
                      ? 'bg-stark-red/20 text-stark-red border border-stark-red/30'
                      : item.dayNumber === 2
                      ? 'bg-infinity-purple/20 text-infinity-purple-light border border-infinity-purple/30'
                      : 'bg-endgame-gold/20 text-endgame-gold border border-endgame-gold/30'
                  }`}>
                    Day {item.dayNumber}: {item.dayName}
                  </span>

                  <button
                    onClick={() => handleDeleteFeedback(item.id, item.memberName)}
                    className="p-1 rounded-lg text-muted-text hover:text-stark-red hover:bg-stark-red/10 transition-colors"
                    title="Delete this record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Score Badges */}
              <div className="flex items-center gap-4 text-xs font-label">
                <div className="flex items-center gap-1 text-endgame-gold font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Overall: {item.overallRating}/5</span>
                </div>
                <div className="flex items-center gap-1 text-arc-blue font-bold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Sessions: {item.sessionRating}/5</span>
                </div>
                <div className="flex items-center gap-1 text-energy-orange font-bold">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Food: {item.foodRating}/5</span>
                </div>
              </div>

              {/* Food note if present */}
              {item.foodComment && (
                <div className="text-xs p-2.5 rounded-xl bg-black/40 border border-white/5 text-off-white/90">
                  <span className="font-bold text-energy-orange uppercase tracking-wider text-[10px] font-label mr-2">
                    Food Note:
                  </span>
                  <span>{item.foodComment}</span>
                </div>
              )}

              {/* Detailed Qualitative answers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                {/* Went well */}
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="font-label text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 mb-1">
                    <ThumbsUp className="w-3 h-3" />
                    <span>What Went Well</span>
                  </div>
                  <p className="text-off-white/90 leading-relaxed font-sans">
                    {item.wentWell || <span className="text-muted-text/50 italic">No comments</span>}
                  </p>
                </div>

                {/* Went bad */}
                <div className="p-3 rounded-xl bg-stark-red/5 border border-stark-red/20">
                  <div className="font-label text-[10px] font-bold uppercase tracking-wider text-stark-red flex items-center gap-1 mb-1">
                    <ThumbsDown className="w-3 h-3" />
                    <span>What Went Bad</span>
                  </div>
                  <p className="text-off-white/90 leading-relaxed font-sans">
                    {item.wentBad || <span className="text-muted-text/50 italic">No comments</span>}
                  </p>
                </div>

                {/* Can improve */}
                <div className="p-3 rounded-xl bg-endgame-gold/5 border border-endgame-gold/20">
                  <div className="font-label text-[10px] font-bold uppercase tracking-wider text-endgame-gold flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Suggestions / Improvements</span>
                  </div>
                  <p className="text-off-white/90 leading-relaxed font-sans">
                    {item.improvement || <span className="text-muted-text/50 italic">No comments</span>}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 rounded-2xl glass-card border border-white/5 text-center text-muted-text">
            <FileSpreadsheet className="w-8 h-8 mx-auto text-muted-text/40 mb-2" />
            <h4 className="text-sm font-semibold text-off-white">No debrief records found</h4>
            <p className="text-xs text-muted-text mt-1">
              Try adjusting your search query, selecting another day filter, or submit a test debrief from the app.
            </p>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default AdminPage;
