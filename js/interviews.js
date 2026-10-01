/* ==========================================
   PERSONAL JOB APPLICATION TRACKER - INTERVIEWS MANAGEMENT
   ========================================== */

const Interviews = {
  /**
   * Render dedicated Interviews view
   */
  render() {
    const container = document.getElementById('interviews-container');
    if (!container) return;

    const apps = Storage.getApplications();
    const todayStr = new Date().toISOString().split('T')[0];

    // Filter applications that have interview details or interview status
    const interviewApps = apps.filter(app => {
      return app.interviewDate || app.status === 'Interview' || app.status === 'Final Round';
    });

    const upcoming = [];
    const previous = [];

    interviewApps.forEach(app => {
      if (app.interviewDate >= todayStr) {
        upcoming.push(app);
      } else {
        previous.push(app);
      }
    });

    if (interviewApps.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          <h3>No interview records yet</h3>
          <p>Add interview dates and rounds to your job applications to track them here.</p>
        </div>
      `;
      return;
    }

    let html = '';

    // 1. Upcoming Interviews
    html += `
      <div style="margin-bottom: 2rem;">
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">
          📅 Upcoming Interviews (${upcoming.length})
        </h3>
    `;

    if (upcoming.length === 0) {
      html += '<p style="color: var(--text-muted); font-size: 0.875rem;">No upcoming interviews scheduled.</p>';
    } else {
      html += '<div class="action-items-grid">';
      upcoming.forEach(app => {
        html += this.renderInterviewCard(app, true);
      });
      html += '</div>';
    }

    html += '</div>';

    // 2. Previous Interviews
    html += `
      <div>
        <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary);">
          📜 Past Interviews (${previous.length})
        </h3>
    `;

    if (previous.length === 0) {
      html += '<p style="color: var(--text-muted); font-size: 0.875rem;">No previous interviews logged.</p>';
    } else {
      html += '<div class="action-items-grid">';
      previous.forEach(app => {
        html += this.renderInterviewCard(app, false);
      });
      html += '</div>';
    }

    html += '</div>';

    container.innerHTML = html;
  },

  renderInterviewCard(app, isUpcoming) {
    return `
      <div class="action-card ${isUpcoming ? 'interview-today' : ''}">
        <div class="action-header">
          <span class="action-company">${this.escape(app.company)}</span>
          <span class="badge badge-interview">${this.escape(app.interviewRound || 'Interview')}</span>
        </div>
        <div class="action-title">${this.escape(app.jobTitle)}</div>

        <div style="font-size: 0.85rem; color: var(--text-primary); margin-top: 0.25rem;">
          📅 <strong>Date & Time:</strong> ${app.interviewDate || 'Date TBD'} ${app.interviewTime ? 'at ' + app.interviewTime : ''}
        </div>

        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
          👤 <strong>Interviewer:</strong> ${this.escape(app.interviewer || 'Not specified')}
        </div>

        ${app.questionsAsked ? `
          <div class="action-detail" style="margin-top: 0.4rem;">
            <strong>Questions Asked:</strong> ${this.escape(app.questionsAsked)}
          </div>
        ` : ''}

        ${app.prepNotes ? `
          <div class="action-detail" style="margin-top: 0.4rem;">
            <strong>Prep / Performance Notes:</strong> ${this.escape(app.prepNotes)}
          </div>
        ` : ''}

        <div class="action-footer" style="margin-top: 0.75rem; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-sm btn-primary" onclick="Interviews.openRecordModal('${app.id}')">✏️ Log Performance Notes</button>
          <a href="${App.getInterviewCalendarUrl(app)}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary" style="text-decoration: none;">📅 Sync Calendar</a>
          <button class="btn btn-sm btn-secondary" onclick="App.openViewModal('${app.id}')">Full App</button>
        </div>
      </div>
    `;
  },

  /**
   * Open modal to quickly record interview performance notes
   */
  openRecordModal(appId) {
    const app = Storage.getApplicationById(appId);
    if (!app) return;

    const modalBackdrop = document.getElementById('interview-notes-modal');
    if (!modalBackdrop) return;

    document.getElementById('interview-notes-app-id').value = app.id;
    document.getElementById('interview-notes-company').textContent = app.company + ' — ' + app.jobTitle;

    document.getElementById('modal-questions-asked').value = app.questionsAsked || '';
    document.getElementById('modal-prep-notes').value = app.prepNotes || '';
    document.getElementById('modal-interview-notes').value = app.interviewNotes || '';
    document.getElementById('modal-interview-status').value = app.interviewStatus || 'Scheduled';

    modalBackdrop.classList.add('active');
  },

  /**
   * Save recorded interview performance notes
   */
  saveRecordModal() {
    const appId = document.getElementById('interview-notes-app-id').value;
    const app = Storage.getApplicationById(appId);
    if (!app) return;

    app.questionsAsked = document.getElementById('modal-questions-asked').value;
    app.prepNotes = document.getElementById('modal-prep-notes').value;
    app.interviewNotes = document.getElementById('modal-interview-notes').value;
    app.interviewStatus = document.getElementById('modal-interview-status').value;

    Storage.saveApplication(app);
    Storage.addTimelineEvent(app.id, `Interview Notes Updated (${app.interviewRound || 'Round'})`, app.questionsAsked ? `Questions logged: ${app.questionsAsked}` : 'Performance notes updated');

    document.getElementById('interview-notes-modal').classList.remove('active');
    App.showToast('Interview notes saved!');
    this.render();
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
