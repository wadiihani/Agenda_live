/**
 * RABAT CO 26.2 — "AVENGERS ASSEMBLE"
 * Core Application Engine: Routing, Casablanca Time Engine, Agenda & Roster
 */

(function () {
  'use strict';

  // Global State
  const state = {
    currentRoute: 'home',
    activeDay: 'day1',
    activeTrack: 'all',
    searchQuery: '',
    rosterFilter: 'all',
    simulatedDate: null, // null = real time
    expandedSessions: new Set()
  };

  const DATA = window.CONFERENCE_DATA;

  // Cache DOM Elements
  const dom = {
    views: {
      home: document.getElementById('view-home'),
      agenda: document.getElementById('view-agenda'),
      shield: document.getElementById('view-shield')
    },
    navItems: document.querySelectorAll('.nav-item'),
    liveStatusContainer: document.getElementById('live-status-container'),
    agendaLiveBanner: document.getElementById('agenda-live-banner'),
    dayTabs: document.getElementById('day-tabs'),
    trackFilterGroup: document.getElementById('track-filter-group'),
    trackFilterWrapper: document.getElementById('track-filter-wrapper'),
    timelineList: document.getElementById('timeline-list'),
    searchInput: document.getElementById('agenda-search'),
    searchClearBtn: document.getElementById('search-clear'),
    rosterGrid: document.getElementById('roster-grid'),
    rosterFilterGroup: document.getElementById('roster-filter-group'),
    simModal: document.getElementById('time-machine-modal'),
    simToggleBtn: document.getElementById('open-time-machine'),
    simCloseBtn: document.getElementById('close-time-machine'),
    simPresetButtons: document.querySelectorAll('.sim-preset-btn'),
    simStatusText: document.getElementById('sim-status-indicator'),
    toast: document.getElementById('toast-notice')
  };

  // ==========================================================================
  // TIME ENGINE (Africa/Casablanca)
  // ==========================================================================

  /**
   * Returns current time decomposed in Africa/Casablanca timezone.
   * If a simulated time is set, it derives from that.
   */
  function getCasablancaTime() {
    const baseDate = state.simulatedDate ? new Date(state.simulatedDate) : new Date();

    const options = {
      timeZone: 'Africa/Casablanca',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const parts = formatter.formatToParts(baseDate);
    const map = {};
    parts.forEach(p => (map[p.type] = p.value));

    const dateStr = `${map.year}-${map.month}-${map.day}`;
    const timeStr = `${map.hour}:${map.minute}`;
    const isoString = `${dateStr}T${timeStr}:${map.second}`;

    return {
      dateObj: new Date(isoString),
      dateStr: dateStr,
      timeStr: timeStr,
      hour: parseInt(map.hour, 10),
      minute: parseInt(map.minute, 10),
      second: parseInt(map.second, 10),
      timestamp: new Date(isoString).getTime()
    };
  }

  /**
   * Analyzes conference live status (before / during / after)
   */
  function getLiveStatus() {
    const casa = getCasablancaTime();
    const openingTimestamp = new Date(DATA.meta.openingDateTime).getTime();
    const closingTimestamp = new Date(DATA.meta.closingDateTime).getTime();

    // Check if before conference opening (Fri Oct 9, 17:00)
    if (casa.timestamp < openingTimestamp) {
      const diffMs = openingTimestamp - casa.timestamp;
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / 1000 / 60) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);

      return {
        state: 'countdown',
        label: 'COUNTDOWN TO DAY 1',
        countdown: { days, hours, minutes, seconds },
        message: 'The mission begins Friday, Oct 9 at 17:00 (Casablanca)'
      };
    }

    // Check if after conference closing (Sun Oct 11, ~17:00)
    if (casa.timestamp > closingTimestamp) {
      return {
        state: 'ended',
        label: 'MISSION COMPLETE',
        message: "That's a wrap — see you at the next mission. Avengers, Assembled."
      };
    }

    // During conference dates: find which day matches
    let activeDayKey = null;
    let dayData = null;

    for (const [key, d] of Object.entries(DATA.days)) {
      if (d.date === casa.dateStr) {
        activeDayKey = key;
        dayData = d;
        break;
      }
    }

    // If on-site during event days
    if (dayData) {
      const sortedSessions = [...dayData.sessions].sort((a, b) => a.time.localeCompare(b.time));

      // Find sessions that have already started
      let currentSession = null;
      let currentIndex = -1;

      for (let i = 0; i < sortedSessions.length; i++) {
        if (sortedSessions[i].time <= casa.timeStr) {
          currentSession = sortedSessions[i];
          currentIndex = i;
        } else {
          break;
        }
      }

      const upNextSession = (currentIndex >= 0 && currentIndex < sortedSessions.length - 1)
        ? sortedSessions[currentIndex + 1]
        : (currentIndex === -1 ? sortedSessions[0] : null);

      if (currentSession) {
        return {
          state: 'live',
          dayId: activeDayKey,
          dayName: `Day ${dayData.dayNumber}: ${dayData.codename}`,
          currentSession: currentSession,
          upNextSession: upNextSession,
          timeStr: casa.timeStr
        };
      } else {
        // Earlier than first session today
        return {
          state: 'upcoming_today',
          dayId: activeDayKey,
          dayName: `Day ${dayData.dayNumber}: ${dayData.codename}`,
          upNextSession: upNextSession,
          timeStr: casa.timeStr,
          message: `Day ${dayData.dayNumber} begins at ${upNextSession ? upNextSession.time : '08:00'}`
        };
      }
    }

    // Fallback if between days late at night
    return {
      state: 'intermission',
      label: 'NIGHT INTERMISSION',
      message: 'Recharging for the next mission briefing.'
    };
  }

  // ==========================================================================
  // RENDER LIVE STATUS WIDGET (HOME & AGENDA)
  // ==========================================================================

  function renderLiveStatusWidget() {
    const live = getLiveStatus();
    const casa = getCasablancaTime();

    let html = '';

    if (live.state === 'countdown') {
      const { days, hours, minutes, seconds } = live.countdown;
      html = `
        <div class="live-status-card state-countdown">
          <div class="live-card-glow"></div>
          <div class="live-card-header">
            <span class="live-tag badge-waiting">
              <span class="live-pulse-dot" style="background: var(--gold-accent); box-shadow: 0 0 6px var(--gold-accent);"></span>
              T-MINUS MISSION OPENING
            </span>
            <span class="timezone-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Casablanca (UTC+1)
            </span>
          </div>

          <div class="countdown-grid">
            <div class="countdown-box">
              <div class="countdown-num">${days}</div>
              <div class="countdown-lbl">Days</div>
            </div>
            <div class="countdown-box">
              <div class="countdown-num">${String(hours).padStart(2, '0')}</div>
              <div class="countdown-lbl">Hours</div>
            </div>
            <div class="countdown-box">
              <div class="countdown-num">${String(minutes).padStart(2, '0')}</div>
              <div class="countdown-lbl">Mins</div>
            </div>
            <div class="countdown-box">
              <div class="countdown-num">${String(seconds).padStart(2, '0')}</div>
              <div class="countdown-lbl">Secs</div>
            </div>
          </div>

          <div class="live-session-meta" style="margin-top: 8px; justify-content: space-between;">
            <span>Fri, Oct 9 · 17:00 Opening Plenary</span>
            <a href="#agenda" class="btn btn-sm btn-secondary" onclick="window.appRouter('agenda', 'day1')">Explore Day 1 →</a>
          </div>
        </div>
      `;
    } else if (live.state === 'live') {
      const sess = live.currentSession;
      const isBreak = sess.type === 'break' || sess.type === 'logistics';
      const roleBadge = sess.badge ? getBadgeHtml(sess.badge) : '';

      html = `
        <div class="live-status-card state-live">
          <div class="live-card-glow"></div>
          <div class="live-card-header">
            <span class="live-tag badge-active">
              <span class="live-pulse-dot"></span>
              LIVE NOW · ${live.dayName}
            </span>
            <span class="timezone-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${casa.timeStr} Casablanca
            </span>
          </div>

          <div class="live-session-info">
            <div class="live-session-time">
              <span>STARTED AT ${sess.time}</span>
              ${sess.track ? `<span class="track-tag track-${sess.track}">${sess.track.toUpperCase()}</span>` : ''}
            </div>
            <div class="live-session-title">${escapeHtml(sess.title)}</div>
            ${sess.essence ? `<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">${escapeHtml(sess.essence)}</p>` : ''}
            <div class="live-session-meta">
              ${sess.facilitator ? `<span>Facilitator: <strong>${escapeHtml(sess.facilitator)}</strong></span>` : ''}
              ${roleBadge}
            </div>
          </div>

          ${live.upNextSession ? `
            <div class="live-up-next">
              <div>
                <span class="up-next-label">UP NEXT:</span>
                <span class="up-next-title">${escapeHtml(live.upNextSession.title)}</span>
              </div>
              <span style="font-family: var(--font-display); font-weight: 700; color: var(--gold-accent);">${live.upNextSession.time}</span>
            </div>
          ` : ''}

          <div style="margin-top: 14px; display: flex; gap: 8px;">
            <a href="#agenda" class="btn btn-sm btn-primary" onclick="window.appRouter('agenda', '${live.dayId}', '${sess.id}')" style="flex: 1;">
              Locate in Agenda
            </a>
          </div>
        </div>
      `;
    } else if (live.state === 'upcoming_today') {
      html = `
        <div class="live-status-card state-countdown">
          <div class="live-card-glow"></div>
          <div class="live-card-header">
            <span class="live-tag badge-waiting">
              <span class="live-pulse-dot" style="background: var(--gold-accent);"></span>
              ${live.dayName} · PRE-MISSION
            </span>
            <span class="timezone-pill">${casa.timeStr} Casablanca</span>
          </div>
          <div class="live-session-title" style="margin-top: 8px;">First briefing begins shortly</div>
          ${live.upNextSession ? `
            <div class="live-up-next" style="margin-top: 8px;">
              <div>
                <span class="up-next-label">OPENING WITH:</span>
                <span class="up-next-title">${escapeHtml(live.upNextSession.title)}</span>
              </div>
              <span style="font-weight: 700; color: var(--gold-accent);">${live.upNextSession.time}</span>
            </div>
          ` : ''}
          <div style="margin-top: 12px;">
            <a href="#agenda" class="btn btn-sm btn-secondary" onclick="window.appRouter('agenda', '${live.dayId}')">View Day Schedule →</a>
          </div>
        </div>
      `;
    } else if (live.state === 'ended') {
      html = `
        <div class="live-status-card">
          <div class="live-card-header">
            <span class="live-tag badge-ended">
              MISSION ACCOMPLISHED
            </span>
            <span class="timezone-pill">Rabat 2026</span>
          </div>
          <div class="live-session-title" style="font-size: 1.25rem;">That's a Wrap!</div>
          <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 4px;">
            ${escapeHtml(live.message)}
          </p>
          <div style="margin-top: 14px;">
            <a href="#shield" class="btn btn-sm btn-secondary" onclick="window.appRouter('shield')">
              Salute the S.H.I.E.L.D. Team
            </a>
          </div>
        </div>
      `;
    }

    if (dom.liveStatusContainer) {
      dom.liveStatusContainer.innerHTML = html;
    }
  }

  // ==========================================================================
  // AGENDA RENDERING & FILTERS
  // ==========================================================================

  function renderDayTabs() {
    const dayEntries = Object.values(DATA.days);
    dom.dayTabs.innerHTML = dayEntries.map(d => {
      const isActive = d.id === state.activeDay;
      return `
        <button class="day-tab-btn ${isActive ? 'active' : ''}" data-day="${d.id}" aria-label="Day ${d.dayNumber}">
          <span class="tab-num">DAY ${d.dayNumber}</span>
          <span class="tab-code">${d.codename}</span>
        </button>
      `;
    }).join('');

    // Attach click events
    dom.dayTabs.querySelectorAll('.day-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dayId = btn.getAttribute('data-day');
        setActiveDay(dayId);
      });
    });
  }

  function setActiveDay(dayId) {
    state.activeDay = dayId;
    renderDayTabs();

    const currentDay = DATA.days[dayId];
    // Track filter visibility: Day 1 has no track split (it's All Membership)
    if (currentDay && currentDay.track_split) {
      dom.trackFilterWrapper.style.display = 'flex';
    } else {
      dom.trackFilterWrapper.style.display = 'none';
      state.activeTrack = 'all'; // Reset track for Day 1
    }

    updateTrackFilterUI();
    renderTimeline();
  }

  function updateTrackFilterUI() {
    dom.trackFilterGroup.querySelectorAll('.track-filter-btn').forEach(btn => {
      const track = btn.getAttribute('data-track');
      if (track === state.activeTrack) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function renderTimeline(targetSessionIdToScroll = null) {
    const dayData = DATA.days[state.activeDay];
    if (!dayData) return;

    const live = getLiveStatus();
    const liveSessionId = (live.state === 'live' && live.dayId === state.activeDay)
      ? live.currentSession.id
      : null;

    // Filter sessions based on Track and Search Query
    let sessions = [...dayData.sessions].sort((a, b) => a.time.localeCompare(b.time));

    // Track Filter
    if (state.activeTrack !== 'all') {
      sessions = sessions.filter(s => {
        // Breaks and logistics show for all tracks so delegates have the full schedule context
        if (s.type === 'break' || s.type === 'logistics' || s.type === 'party') return true;
        if (!s.track || s.track === 'all') return true;
        return s.track === state.activeTrack;
      });
    }

    // Search Query Filter
    if (state.query && state.query.trim().length > 0) {
      const q = state.query.toLowerCase().trim();
      sessions = sessions.filter(s => {
        const titleMatch = s.title && s.title.toLowerCase().includes(q);
        const essenceMatch = s.essence && s.essence.toLowerCase().includes(q);
        const facMatch = s.facilitator && s.facilitator.toLowerCase().includes(q);
        const badgeMatch = s.badge && s.badge.toLowerCase().includes(q);
        return titleMatch || essenceMatch || facMatch || badgeMatch;
      });
    }

    if (sessions.length === 0) {
      dom.timelineList.innerHTML = `
        <div style="text-align: center; padding: 40px 16px; color: var(--text-dim);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; opacity: 0.5;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <div style="font-size: 1rem; color: var(--text-muted); font-weight: 600;">No sessions match your filter</div>
          <p style="font-size: 0.8rem; margin-top: 4px;">Try searching with another keyword or resetting the track filter.</p>
        </div>
      `;
      return;
    }

    const html = sessions.map(sess => {
      const isLiveNow = sess.id === liveSessionId;
      const isExpanded = state.expandedSessions.has(sess.id);

      // Light collapsed row for breaks and simple logistics
      if (sess.type === 'break' || (sess.type === 'logistics' && !sess.facilitator)) {
        const isMeal = sess.title.toLowerCase().includes('lunch') || sess.title.toLowerCase().includes('dinner') || sess.title.toLowerCase().includes('breakfast');
        const iconSvg = isMeal
          ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`
          : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

        return `
          <div class="break-row ${isLiveNow ? 'is-live' : ''}" id="session-${sess.id}">
            <div class="break-left">
              <span class="break-icon">${iconSvg}</span>
              <span class="break-time">${sess.time}</span>
              <span class="break-name">${escapeHtml(sess.title)}</span>
            </div>
            ${sess.essence ? `<span style="font-size: 0.72rem; color: var(--text-dim);">${escapeHtml(sess.essence)}</span>` : ''}
          </div>
        `;
      }

      // Party / Gala cards
      const isParty = sess.type === 'party';

      // Full Session Card
      return `
        <div class="session-card ${isLiveNow ? 'is-live' : ''} ${isExpanded ? 'expanded' : ''}" 
             id="session-${sess.id}" 
             data-id="${sess.id}"
             role="button"
             tabindex="0"
             aria-expanded="${isExpanded}">
          
          <div class="session-top-meta">
            <div class="session-time-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              ${sess.time}
            </div>

            <div class="session-tag-group">
              ${sess.track ? `<span class="track-tag track-${sess.track}">${sess.track === 'mms' ? 'MMs & Oldies' : sess.track.toUpperCase()}</span>` : ''}
              ${isParty ? `<span class="track-tag" style="background: rgba(237,29,36,0.18); color: #ff5e63; border: 1px solid rgba(237,29,36,0.4);">CELEBRATION</span>` : ''}
            </div>
          </div>

          <div class="session-title">${escapeHtml(sess.title)}</div>

          <div class="session-facilitator-row">
            <div class="facilitator-badge">
              ${sess.facilitator ? `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>${escapeHtml(sess.facilitator)}</span>
              ` : `<span>All Membership</span>`}
              ${sess.badge ? getBadgeHtml(sess.badge) : ''}
            </div>

            <span class="card-expand-hint">
              <span>${isExpanded ? 'Collapse' : 'Objective'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
          </div>

          <div class="session-details-pane">
            ${sess.essence ? `
              <div class="essence-box">
                <div class="essence-label">Mission Objective / Essence</div>
                <div class="essence-text">${escapeHtml(sess.essence)}</div>
              </div>
            ` : ''}

            <div class="session-action-footer">
              <button class="btn-cal" data-cal-id="${sess.id}" title="Download calendar invite">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Add to Calendar (.ics)
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    dom.timelineList.innerHTML = html;

    // Attach Card Expand Toggle
    dom.timelineList.querySelectorAll('.session-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Prevent toggle if clicking on the calendar button specifically
        if (e.target.closest('.btn-cal')) return;

        const id = card.getAttribute('data-id');
        if (state.expandedSessions.has(id)) {
          state.expandedSessions.delete(id);
          card.classList.remove('expanded');
          const hint = card.querySelector('.card-expand-hint span');
          if (hint) hint.textContent = 'Objective';
        } else {
          state.expandedSessions.add(id);
          card.classList.add('expanded');
          const hint = card.querySelector('.card-expand-hint span');
          if (hint) hint.textContent = 'Collapse';
        }
      });
    });

    // Attach Calendar Download Button Events
    dom.timelineList.querySelectorAll('.btn-cal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sessionId = btn.getAttribute('data-cal-id');
        downloadIcsFile(dayData, sessionId);
      });
    });

    // Auto-scroll to target session if requested
    if (targetSessionIdToScroll) {
      setTimeout(() => {
        const el = document.getElementById(`session-${targetSessionIdToScroll}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('expanded');
          state.expandedSessions.add(targetSessionIdToScroll);
        }
      }, 100);
    }
  }

  // ==========================================================================
  // S.H.I.E.L.D. TEAM / ROSTER RENDERING
  // ==========================================================================

  function renderRoster() {
    let team = DATA.shieldTeam || [];

    if (state.rosterFilter !== 'all') {
      team = team.filter(member => member.badgeType === state.rosterFilter);
    }

    dom.rosterGrid.innerHTML = team.map(member => {
      const isOps = member.badgeType === 'ops';
      const initials = member.name.split(' ').map(n => n[0]).slice(0, 2).join('');

      return `
        <div class="agent-card">
          <div>
            <div class="agent-card-top">
              <div class="agent-avatar">${initials}</div>
              <div class="agent-info">
                <div class="agent-name">${escapeHtml(member.name)}</div>
                <div class="agent-callsign">Codename: "${escapeHtml(member.callsign)}"</div>
                <div class="agent-role">${escapeHtml(member.role)}</div>
                <div style="margin-top: 6px;">
                  ${getBadgeHtml(member.badge)}
                  ${member.status ? `<span style="font-size: 0.68rem; color: var(--gold-accent); margin-left: 6px;">[${member.status}]</span>` : ''}
                </div>
              </div>
            </div>

            <p class="agent-bio">${escapeHtml(member.bio)}</p>
          </div>

          ${member.assignedSessions && member.assignedSessions.length > 0 ? `
            <div class="agent-missions-section">
              <div class="missions-label">Assigned Sessions / Operations</div>
              <div class="agent-session-list">
                ${member.assignedSessions.map(s => `
                  <div class="agent-session-item">
                    <span class="bullet"></span>
                    <span>${escapeHtml(s)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // ==========================================================================
  // ICS CALENDAR GENERATION
  // ==========================================================================

  function downloadIcsFile(dayData, sessionId) {
    const session = dayData.sessions.find(s => s.id === sessionId);
    if (!session) return;

    // Compute start and approximate end time
    const dateFormatted = dayData.date.replace(/-/g, ''); // 20261009
    const [startH, startM] = session.time.split(':');
    const startStr = `${dateFormatted}T${startH}${startM}00`;

    // Estimate end time: 1 hour default or next session start
    let endH = parseInt(startH, 10) + 1;
    let endM = startM;
    if (endH >= 24) endH = 23;
    const endStr = `${dateFormatted}T${String(endH).padStart(2, '0')}${endM}00`;

    const title = `[Rabat CO 26.2] ${session.title}`;
    const description = `${session.essence || ''}\nFacilitator: ${session.facilitator || 'AIESEC in Rabat'}\nTheme: ${dayData.codename}`;
    const location = "AIESEC in Rabat Conference Compound, Rabat, Morocco";

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AIESEC in Rabat//Rabat CO 26.2 Avengers//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${session.id}-rabatco26-2@aiesec.org`,
      `DTSTAMP:${dateFormatted}T000000Z`,
      `DTSTART;TZID=Africa/Casablanca:${startStr}`,
      `DTEND;TZID=Africa/Casablanca:${endStr}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${session.id}-${session.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Calendar invite downloaded: ${session.title}`);
  }

  // ==========================================================================
  // ROUTING & NAVIGATION
  // ==========================================================================

  function appRouter(targetRoute, targetDay = null, targetSession = null) {
    state.currentRoute = targetRoute;

    // Update view sections visibility
    Object.keys(dom.views).forEach(key => {
      if (dom.views[key]) {
        if (key === targetRoute) {
          dom.views[key].classList.add('active');
        } else {
          dom.views[key].classList.remove('active');
        }
      }
    });

    // Update active nav icons
    dom.navItems.forEach(item => {
      const route = item.getAttribute('data-route');
      if (route === targetRoute) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Handle Agenda route specific arguments
    if (targetRoute === 'agenda') {
      if (targetDay && DATA.days[targetDay]) {
        state.activeDay = targetDay;
        setActiveDay(targetDay);
      }
      renderTimeline(targetSession);
    }

    if (targetRoute === 'shield') {
      renderRoster();
    }

    // Scroll top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update URL Hash without reload
    window.location.hash = targetRoute + (targetDay ? `-${targetDay}` : '');
  }

  // Global window handle for inline HTML callbacks
  window.appRouter = appRouter;

  // Handle URL Hash on load
  function initRouteFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('agenda')) {
      const parts = hash.split('-');
      const day = parts[1] || 'day1';
      appRouter('agenda', day);
    } else if (hash === 'shield') {
      appRouter('shield');
    } else {
      appRouter('home');
    }
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  function getBadgeHtml(badgeName) {
    if (!badgeName) return '';
    let cls = 'role-agent';
    if (badgeName === 'Director') cls = 'role-director';
    else if (badgeName === 'Tower Commander') cls = 'role-commander';
    else if (badgeName === 'Ops Crew') cls = 'role-ops';

    return `<span class="shield-role-badge ${cls}">${escapeHtml(badgeName)}</span>`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(msg) {
    if (!dom.toast) return;
    dom.toast.textContent = msg;
    dom.toast.classList.add('visible');
    setTimeout(() => {
      dom.toast.classList.remove('visible');
    }, 2800);
  }

  // ==========================================================================
  // TIME MACHINE / SIMULATOR (FOR TESTING BEFORE & DURING)
  // ==========================================================================

  function setupTimeSimulator() {
    if (!dom.simToggleBtn || !dom.simModal) return;

    dom.simToggleBtn.addEventListener('click', () => {
      dom.simModal.classList.add('active');
    });

    dom.simCloseBtn.addEventListener('click', () => {
      dom.simModal.classList.remove('active');
    });

    dom.simModal.addEventListener('click', (e) => {
      if (e.target === dom.simModal) {
        dom.simModal.classList.remove('active');
      }
    });

    dom.simPresetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const simValue = btn.getAttribute('data-sim');

        dom.simPresetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (simValue === 'real') {
          state.simulatedDate = null;
          dom.simStatusText.textContent = 'Real Time (Casablanca)';
          showToast('Switched to Real Casablanca Time');
        } else {
          state.simulatedDate = simValue;
          dom.simStatusText.textContent = `⚡ Sim: ${simValue.replace('T', ' ')}`;
          showToast(`Time Machine jump to: ${simValue.replace('T', ' ')}`);
        }

        dom.simModal.classList.remove('active');

        // Immediately recompute live states across app
        renderLiveStatusWidget();
        if (state.currentRoute === 'agenda') {
          renderTimeline();
        }
      });
    });
  }

  // ==========================================================================
  // INITIALIZATION & EVENT LISTENERS
  // ==========================================================================

  function init() {
    renderLiveStatusWidget();
    renderDayTabs();
    updateTrackFilterUI();
    renderTimeline();
    renderRoster();
    setupTimeSimulator();

    // Nav click handlers
    dom.navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.getAttribute('data-route');
        appRouter(route);
      });
    });

    // Track filter clicks (Day 2 & Day 3)
    dom.trackFilterGroup.querySelectorAll('.track-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeTrack = btn.getAttribute('data-track');
        updateTrackFilterUI();
        renderTimeline();
      });
    });

    // Roster filter clicks
    dom.rosterFilterGroup.querySelectorAll('.roster-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        dom.rosterFilterGroup.querySelectorAll('.roster-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.rosterFilter = btn.getAttribute('data-roster-filter');
        renderRoster();
      });
    });

    // Search Input in Agenda
    if (dom.searchInput) {
      dom.searchInput.addEventListener('input', (e) => {
        state.query = e.target.value;
        if (state.query.length > 0) {
          dom.searchClearBtn.classList.add('visible');
        } else {
          dom.searchClearBtn.classList.remove('visible');
        }
        renderTimeline();
      });
    }

    if (dom.searchClearBtn) {
      dom.searchClearBtn.addEventListener('click', () => {
        dom.searchInput.value = '';
        state.query = '';
        dom.searchClearBtn.classList.remove('visible');
        renderTimeline();
      });
    }

    // Hash change event listener
    window.addEventListener('hashchange', () => {
      initRouteFromHash();
    });

    // Timer loop for countdown and live session update every second
    setInterval(() => {
      renderLiveStatusWidget();
    }, 1000);

    // Initial Route
    initRouteFromHash();
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
