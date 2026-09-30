/* ==========================================
   PERSONAL JOB APPLICATION TRACKER - FOLLOW-UPS MANAGEMENT
   ========================================== */

const Followups = {
  /**
   * Render the dedicated Follow-ups management view
   */
  render() {
    const container = document.getElementById('followups-container');
    if (!container) return;

    const apps = Storage.getApplications();
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter active applications with a set follow-up date
    const followupApps = apps.filter(app => {
      return app.followUpDate && !['Rejected', 'Withdrawn'].includes(app.status);
    });

    const dueToday = [];
    const overdue = [];
    const dueThisWeek = [];
    const upcoming = [];

    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 7);
    const weekLaterStr = weekLater.toISOString().split('T')[0];

    followupApps.forEach(app => {
      if (app.followUpDate === todayStr) {
        dueToday.push(app);
      } else if (app.followUpDate < todayStr) {
        overdue.push(app);
      } else if (app.followUpDate > todayStr && app.followUpDate <= weekLaterStr) {
        dueThisWeek.push(app);
      } else {
        upcoming.push(app);
      }
    });

    if (followupApps.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h3>No follow-ups scheduled</h3>
          <p>Add a follow-up date to any job application to track recruiter outreach here.</p>
        </div>
      `;
      return;
    }

    let html = '';

    // 1. Overdue Section
    if (overdue.length > 0) {
      html += this.renderGroup('🔴 Overdue Follow-ups', overdue, 'overdue');
    }

    // 2. Due Today Section
    if (dueToday.length > 0) {
      html += this.renderGroup('🟠 Due Today', dueToday, 'due-today');
    }

    // 3. Due This Week Section
    if (dueThisWeek.length > 0) {
      html += this.renderGroup('🟡 Due This Week', dueThisWeek, 'this-week');
    }

    // 4. Upcoming Section
    if (upcoming.length > 0) {
      html += this.renderGroup('🔵 Upcoming Follow-ups', upcoming, 'upcoming');
    }

    container.innerHTML = html;
  },

  /**
   * Render group of follow-up cards
   */
  renderGroup(title, appsGroup, groupClass) {
    let html = `
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary); flex-items: center; gap: 0.5rem;">
          ${title} (${appsGroup.length})
        </h3>
        <div class="action-items-grid">
    `;

    appsGroup.forEach(app => {
      html += `
        <div class="action-card ${groupClass}">
          <div class="action-header">
            <span class="action-company">${this.escape(app.company)}</span>
            <span class="badge ${Applications.getStatusBadge(app.status).match(/badge-\w+/)[0]}">${this.escape(app.status)}</span>
          </div>
          <div class="action-title">${this.escape(app.jobTitle)}</div>
          
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">
            👤 <strong>Contact:</strong> ${this.escape(app.contactPerson || 'Not specified')} ${app.contactEmail ? `(${this.escape(app.contactEmail)})` : ''}
          </div>

          <div class="action-detail">
            <div><strong>Last Action:</strong> ${this.escape(app.lastAction || 'Applied')} (${app.lastActionDate || app.dateApplied || 'N/A'})</div>
            <div style="margin-top: 0.2rem;"><strong>Next Action:</strong> ${this.escape(app.nextAction || 'Send follow-up message')}</div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
            <span>Follow-up Date: <strong style="color: var(--text-primary);">${app.followUpDate}</strong></span>
            <span>Follow-ups done: <strong>${app.followUpCount || 0}</strong></span>
          </div>

          <div class="action-footer" style="margin-top: 0.75rem; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-sm btn-primary" onclick="Followups.markCompleted('${app.id}')">✓ Mark Done</button>
            <button class="btn btn-sm btn-secondary" onclick="Followups.reschedule('${app.id}')">📅 Reschedule</button>
            <button class="btn btn-sm btn-secondary" onclick="App.openViewModal('${app.id}')">Open App</button>
          </div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  },

  /**
   * Mark follow-up as completed
   */
  markCompleted(appId) {
    const app = Storage.getApplicationById(appId);
    if (!app) return;

    const count = (app.followUpCount || 0) + 1;
    app.followUpCount = count;
    app.lastAction = `Sent Follow-up #${count}`;
    app.lastActionDate = new Date().toISOString().split('T')[0];

    // Ask if user wants to schedule next follow up date
    const nextDate = prompt(`Follow-up #${count} completed! Enter next follow-up date (YYYY-MM-DD) or leave empty if no further follow-up required:`);
    if (nextDate !== null) {
      app.followUpDate = nextDate.trim();
    }

    Storage.saveApplication(app);
    Storage.addTimelineEvent(app.id, `Follow-up #${count} Completed`, `Follow-up outreach performed. Next follow up: ${app.followUpDate || 'None'}`);

    App.showToast(`Follow-up #${count} marked as completed!`);
    this.render();
    Dashboard.render();
  },

  /**
   * Reschedule follow-up
   */
  reschedule(appId) {
    const app = Storage.getApplicationById(appId);
    if (!app) return;

    const newDate = prompt(`Reschedule follow-up for ${app.company}:`, app.followUpDate || new Date().toISOString().split('T')[0]);
    if (newDate) {
      app.followUpDate = newDate.trim();
      Storage.saveApplication(app);
      App.showToast('Follow-up rescheduled to ' + app.followUpDate);
      this.render();
      Dashboard.render();
    }
  },

  escape(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
};
