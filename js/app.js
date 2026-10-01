/* ==========================================
   PERSONAL JOB APPLICATION TRACKER - MAIN CONTROLLER
   ========================================== */

const App = {
  activeView: 'dashboard',

  init() {
    // 1. Storage init
    Storage.init();

    // 2. Initialize Theme
    const currentTheme = Storage.getTheme();
    Storage.setTheme(currentTheme);

    // 3. Routing & Navigation
    this.initRouting();

    // 4. Application Module Init
    Applications.init();

    // 5. Global Search Listener
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const query = e.target.value;
        if (this.activeView !== 'applications') {
          this.navigateTo('applications');
        }
        Applications.setSearch(query);
      });
    }

    // Initial view render
    this.handleRoute();
  },

  /**
   * Routing Management
   */
  initRouting() {
    window.addEventListener('hashchange', () => this.handleRoute());
  },

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigateTo(hash, false);
  },

  navigateTo(viewId, updateHash = true) {
    const validViews = ['dashboard', 'applications', 'followups', 'interviews', 'contacts', 'analytics', 'settings'];
    if (!validViews.includes(viewId)) viewId = 'dashboard';

    this.activeView = viewId;

    if (updateHash && window.location.hash !== '#' + viewId) {
      window.location.hash = viewId;
    }

    // Toggle active view section
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    const targetSec = document.getElementById(`view-${viewId}`);
    if (targetSec) targetSec.classList.add('active');

    // Update navigation sidebar active class
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${viewId}`) {
        item.classList.add('active');
      }
    });

    // Render corresponding view module
    if (viewId === 'dashboard') Dashboard.render();
    if (viewId === 'applications') Applications.render();
    if (viewId === 'followups') Followups.render();
    if (viewId === 'interviews') Interviews.render();
    if (viewId === 'contacts') Contacts.render();
    if (viewId === 'analytics') Analytics.render();
    if (viewId === 'settings') this.renderSettings();

    // Scroll to top
    window.scrollTo(0, 0);

    // Close mobile menu if open
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('open');
  },

  toggleTheme() {
    const current = Storage.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    Storage.setTheme(next);
    this.showToast(`Switched to ${next} mode`);
  },

  toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  },

  /**
   * Add / Edit Application Form Modal
   */
  openAddModal() {
    const modal = document.getElementById('application-form-modal');
    if (!modal) return;

    document.getElementById('app-modal-title').textContent = 'Add New Job Application';
    document.getElementById('app-form-id').value = '';

    // Set Sensible Defaults
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('app-company').value = '';
    document.getElementById('app-jobTitle').value = '';
    document.getElementById('app-jobType').value = 'Full-time';
    document.getElementById('app-location').value = '';
    document.getElementById('app-workMode').value = 'On-site';
    document.getElementById('app-jobUrl').value = '';
    document.getElementById('app-companyCareerUrl').value = '';
    document.getElementById('app-dateApplied').value = today;
    
    document.getElementById('app-status').value = 'Applied';
    document.getElementById('app-source').value = 'LinkedIn';
    document.getElementById('app-cvVersion').value = 'General-01';
    document.getElementById('app-coverLetterUsed').value = 'No';
    document.getElementById('app-referral').value = 'No';
    document.getElementById('app-referralPerson').value = '';

    document.getElementById('app-lastAction').value = 'Application submitted';
    document.getElementById('app-lastActionDate').value = today;
    document.getElementById('app-nextAction').value = 'Wait for recruiter response';
    document.getElementById('app-followUpDate').value = '';

    document.getElementById('app-contactPerson').value = '';
    document.getElementById('app-contactRole').value = '';
    document.getElementById('app-contactEmail').value = '';
    document.getElementById('app-contactLinkedIn').value = '';

    document.getElementById('app-assessmentRequired').value = 'No';
    document.getElementById('app-assessmentDate').value = '';
    document.getElementById('app-assessmentDeadline').value = '';
    document.getElementById('app-assessmentStatus').value = 'Pending';
    document.getElementById('app-assessmentNotes').value = '';

    document.getElementById('app-interviewDate').value = '';
    document.getElementById('app-interviewTime').value = '';
    document.getElementById('app-interviewRound').value = 'Technical';
    document.getElementById('app-interviewStatus').value = 'Scheduled';
    document.getElementById('app-interviewer').value = '';
    document.getElementById('app-prepNotes').value = '';

    document.getElementById('app-fit').value = 'Good Fit';
    document.getElementById('app-whyApplied').value = '';
    document.getElementById('app-keyRequirements').value = '';
    document.getElementById('app-metRequirements').value = '';
    document.getElementById('app-unmetRequirements').value = '';

    document.getElementById('app-salary').value = '';
    document.getElementById('app-jobDescription').value = '';
    document.getElementById('app-notes').value = '';

    modal.classList.add('active');
  },

  openEditModal(id) {
    const app = Storage.getApplicationById(id);
    if (!app) return;

    const modal = document.getElementById('application-form-modal');
    if (!modal) return;

    document.getElementById('app-modal-title').textContent = `Edit Application: ${app.company}`;
    document.getElementById('app-form-id').value = app.id;

    document.getElementById('app-company').value = app.company || '';
    document.getElementById('app-jobTitle').value = app.jobTitle || '';
    document.getElementById('app-jobType').value = app.jobType || 'Full-time';
    document.getElementById('app-location').value = app.location || '';
    document.getElementById('app-workMode').value = app.workMode || 'On-site';
    document.getElementById('app-jobUrl').value = app.jobUrl || '';
    document.getElementById('app-companyCareerUrl').value = app.companyCareerUrl || '';
    document.getElementById('app-dateApplied').value = app.dateApplied || '';

    document.getElementById('app-status').value = app.status || 'Saved';
    document.getElementById('app-source').value = app.source || 'LinkedIn';
    document.getElementById('app-cvVersion').value = app.cvVersion || '';
    document.getElementById('app-coverLetterUsed').value = app.coverLetterUsed || 'No';
    document.getElementById('app-referral').value = app.referral || 'No';
    document.getElementById('app-referralPerson').value = app.referralPerson || '';

    document.getElementById('app-lastAction').value = app.lastAction || '';
    document.getElementById('app-lastActionDate').value = app.lastActionDate || '';
    document.getElementById('app-nextAction').value = app.nextAction || '';
    document.getElementById('app-followUpDate').value = app.followUpDate || '';

    document.getElementById('app-contactPerson').value = app.contactPerson || '';
    document.getElementById('app-contactRole').value = app.contactRole || '';
    document.getElementById('app-contactEmail').value = app.contactEmail || '';
    document.getElementById('app-contactLinkedIn').value = app.contactLinkedIn || '';

    document.getElementById('app-assessmentRequired').value = app.assessmentRequired || 'No';
    document.getElementById('app-assessmentDate').value = app.assessmentDate || '';
    document.getElementById('app-assessmentDeadline').value = app.assessmentDeadline || '';
    document.getElementById('app-assessmentStatus').value = app.assessmentStatus || 'Pending';
    document.getElementById('app-assessmentNotes').value = app.assessmentNotes || '';

    document.getElementById('app-interviewDate').value = app.interviewDate || '';
    document.getElementById('app-interviewTime').value = app.interviewTime || '';
    document.getElementById('app-interviewRound').value = app.interviewRound || 'Technical';
    document.getElementById('app-interviewStatus').value = app.interviewStatus || 'Scheduled';
    document.getElementById('app-interviewer').value = app.interviewer || '';
    document.getElementById('app-prepNotes').value = app.prepNotes || '';

    document.getElementById('app-fit').value = app.fit || 'Good Fit';
    document.getElementById('app-whyApplied').value = app.whyApplied || '';
    document.getElementById('app-keyRequirements').value = app.keyRequirements || '';
    document.getElementById('app-metRequirements').value = app.metRequirements || '';
    document.getElementById('app-unmetRequirements').value = app.unmetRequirements || '';

    document.getElementById('app-salary').value = app.salary || '';
    document.getElementById('app-jobDescription').value = app.jobDescription || '';
    document.getElementById('app-notes').value = app.notes || '';

    modal.classList.add('active');
  },

  saveApplicationForm() {
    const company = document.getElementById('app-company').value.trim();
    const jobTitle = document.getElementById('app-jobTitle').value.trim();

    if (!company || !jobTitle) {
      alert('Please fill in Company Name and Job Title.');
      return;
    }

    const appData = {
      id: document.getElementById('app-form-id').value,
      company: company,
      jobTitle: jobTitle,
      jobType: document.getElementById('app-jobType').value,
      location: document.getElementById('app-location').value.trim(),
      workMode: document.getElementById('app-workMode').value,
      jobUrl: document.getElementById('app-jobUrl').value.trim(),
      companyCareerUrl: document.getElementById('app-companyCareerUrl').value.trim(),
      dateApplied: document.getElementById('app-dateApplied').value,

      status: document.getElementById('app-status').value,
      source: document.getElementById('app-source').value,
      cvVersion: document.getElementById('app-cvVersion').value.trim(),
      coverLetterUsed: document.getElementById('app-coverLetterUsed').value,
      referral: document.getElementById('app-referral').value,
      referralPerson: document.getElementById('app-referralPerson').value.trim(),

      lastAction: document.getElementById('app-lastAction').value.trim(),
      lastActionDate: document.getElementById('app-lastActionDate').value,
      nextAction: document.getElementById('app-nextAction').value.trim(),
      followUpDate: document.getElementById('app-followUpDate').value,

      contactPerson: document.getElementById('app-contactPerson').value.trim(),
      contactRole: document.getElementById('app-contactRole').value.trim(),
      contactEmail: document.getElementById('app-contactEmail').value.trim(),
      contactLinkedIn: document.getElementById('app-contactLinkedIn').value.trim(),

      assessmentRequired: document.getElementById('app-assessmentRequired').value,
      assessmentDate: document.getElementById('app-assessmentDate').value,
      assessmentDeadline: document.getElementById('app-assessmentDeadline').value,
      assessmentStatus: document.getElementById('app-assessmentStatus').value,
      assessmentNotes: document.getElementById('app-assessmentNotes').value.trim(),

      interviewDate: document.getElementById('app-interviewDate').value,
      interviewTime: document.getElementById('app-interviewTime').value,
      interviewRound: document.getElementById('app-interviewRound').value,
      interviewStatus: document.getElementById('app-interviewStatus').value,
      interviewer: document.getElementById('app-interviewer').value.trim(),
      prepNotes: document.getElementById('app-prepNotes').value.trim(),

      fit: document.getElementById('app-fit').value,
      whyApplied: document.getElementById('app-whyApplied').value.trim(),
      keyRequirements: document.getElementById('app-keyRequirements').value.trim(),
      metRequirements: document.getElementById('app-metRequirements').value.trim(),
      unmetRequirements: document.getElementById('app-unmetRequirements').value.trim(),

      salary: document.getElementById('app-salary').value.trim(),
      jobDescription: document.getElementById('app-jobDescription').value.trim(),
      notes: document.getElementById('app-notes').value.trim()
    };

    Storage.saveApplication(appData);
    document.getElementById('application-form-modal').classList.remove('active');
    this.showToast(`Application saved for ${company}!`);

    // Refresh active view
    if (this.activeView === 'dashboard') Dashboard.render();
    if (this.activeView === 'applications') Applications.render();
    if (this.activeView === 'followups') Followups.render();
    if (this.activeView === 'interviews') Interviews.render();
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  confirmDelete(id) {
    const app = Storage.getApplicationById(id);
    if (!app) return;

    if (confirm(`Are you sure you want to delete application for "${app.company}"?`)) {
      Storage.deleteApplication(id);
      this.showToast(`Deleted application for ${app.company}`);
      if (this.activeView === 'dashboard') Dashboard.render();
      if (this.activeView === 'applications') Applications.render();
    }
  },

  /**
   * Application View Details Modal + Timeline
   */
  openViewModal(id) {
    const app = Storage.getApplicationById(id);
    if (!app) return;

    const modal = document.getElementById('view-details-modal');
    if (!modal) return;

    document.getElementById('view-modal-company').textContent = app.company;
    document.getElementById('view-modal-title').textContent = app.jobTitle;
    document.getElementById('view-modal-app-id').value = app.id;

    let html = `
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
        ${Applications.getStatusBadge(app.status)}
        <span class="badge badge-saved">📍 ${this.escape(app.location || 'N/A')} (${this.escape(app.workMode)})</span>
        <span class="badge badge-saved">📄 CV: ${this.escape(app.cvVersion || 'Default')}</span>
      </div>

      <div class="form-grid" style="margin-bottom: 1.5rem;">
        <div><strong>Date Applied:</strong> ${app.dateApplied || 'N/A'}</div>
        <div><strong>Salary/CTC:</strong> ${this.escape(app.salary || 'Not specified')}</div>
        <div><strong>Job Source:</strong> ${this.escape(app.source || 'N/A')}</div>
        <div><strong>Cover Letter Used:</strong> ${app.coverLetterUsed || 'No'}</div>
        <div><strong>Referral:</strong> ${app.referral === 'Yes' ? 'Yes (' + this.escape(app.referralPerson) + ')' : 'No'}</div>
        <div><strong>Fit Assessment:</strong> ${this.escape(app.fit || 'Good Fit')}</div>
      </div>

      ${app.jobUrl ? `<div style="margin-bottom: 1rem;">🔗 <strong>Job Posting URL:</strong> <a href="${this.escape(app.jobUrl)}" target="_blank" rel="noopener" style="color: var(--primary);">${this.escape(app.jobUrl)}</a></div>` : ''}

      <!-- Contact Info -->
      ${app.contactPerson ? `
        <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color);">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem;">Recruiter / Contact</h4>
          <div><strong>Name:</strong> ${this.escape(app.contactPerson)} (${this.escape(app.contactRole || 'Contact')})</div>
          ${app.contactEmail ? `<div><strong>Email:</strong> ${this.escape(app.contactEmail)}</div>` : ''}
          ${app.contactLinkedIn ? `<div><strong>LinkedIn:</strong> <a href="${this.escape(app.contactLinkedIn)}" target="_blank" rel="noopener" style="color: var(--primary);">View LinkedIn</a></div>` : ''}
        </div>
      ` : ''}

      <!-- Assessment Info -->
      ${app.assessmentRequired === 'Yes' ? `
        <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color);">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem;">Online Assessment</h4>
          <div><strong>Status:</strong> ${this.escape(app.assessmentStatus)}</div>
          <div><strong>Date / Deadline:</strong> ${app.assessmentDate || app.assessmentDeadline || 'N/A'}</div>
          <div><strong>Notes:</strong> ${this.escape(app.assessmentNotes || 'None')}</div>
        </div>
      ` : ''}

      <!-- Interview Info -->
      ${app.interviewDate ? `
        <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700;">Interview Details</h4>
            <a href="${this.getInterviewCalendarUrl(app)}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary" style="text-decoration: none;">📅 Add to Google Calendar</a>
          </div>
          <div><strong>Round:</strong> ${this.escape(app.interviewRound)} on ${app.interviewDate} ${app.interviewTime ? 'at ' + app.interviewTime : ''}</div>
          <div><strong>Interviewer:</strong> ${this.escape(app.interviewer || 'TBD')}</div>
          ${app.questionsAsked ? `<div><strong>Questions Asked:</strong> ${this.escape(app.questionsAsked)}</div>` : ''}
          ${app.prepNotes ? `<div><strong>Prep / Performance:</strong> ${this.escape(app.prepNotes)}</div>` : ''}
        </div>
      ` : ''}

      ${app.followUpDate ? `
        <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700;">Follow-up Date</h4>
              <div style="font-size: 0.85rem;">📅 <strong>Date:</strong> ${app.followUpDate} (${this.escape(app.nextAction || 'Outreach')})</div>
            </div>
            <a href="${this.getFollowupCalendarUrl(app)}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary" style="text-decoration: none;">📅 Add to Google Calendar</a>
          </div>
        </div>
      ` : ''}

      <!-- Screening / Requirements Fit -->
      ${app.whyApplied || app.keyRequirements ? `
        <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color);">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.4rem;">Job Screening & Requirements</h4>
          ${app.whyApplied ? `<div style="margin-bottom: 0.4rem;"><strong>Why I Applied:</strong> ${this.escape(app.whyApplied)}</div>` : ''}
          ${app.keyRequirements ? `<div style="margin-bottom: 0.4rem;"><strong>Key Requirements:</strong> ${this.escape(app.keyRequirements)}</div>` : ''}
          ${app.metRequirements ? `<div style="margin-bottom: 0.4rem; color: var(--success);"><strong>Requirements I Meet:</strong> ${this.escape(app.metRequirements)}</div>` : ''}
          ${app.unmetRequirements ? `<div style="margin-bottom: 0.4rem; color: var(--danger);"><strong>Requirements I Don't Meet:</strong> ${this.escape(app.unmetRequirements)}</div>` : ''}
        </div>
      ` : ''}

      <!-- Notes & Job Description -->
      ${app.notes ? `
        <div style="margin-bottom: 1rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.3rem;">Notes</h4>
          <p style="white-space: pre-wrap; font-size: 0.875rem; background: var(--bg-primary); padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">${this.escape(app.notes)}</p>
        </div>
      ` : ''}

      ${app.jobDescription ? `
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.3rem;">Job Description</h4>
          <div style="max-height: 150px; overflow-y: auto; white-space: pre-wrap; font-size: 0.825rem; background: var(--bg-primary); padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); color: var(--text-secondary);">${this.escape(app.jobDescription)}</div>
        </div>
      ` : ''}

      <!-- Timeline Section -->
      <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h4 style="font-size: 1.05rem; font-weight: 700;">Application Timeline</h4>
          <button class="btn btn-sm btn-secondary" onclick="App.toggleTimelineAddForm()">+ Add Timeline Event</button>
        </div>

        <!-- Inline Timeline Add Form -->
        <div id="timeline-add-form" style="display: none; background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1rem;">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Event Date</label>
              <input type="date" id="new-timeline-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label class="form-label">Event Title</label>
              <input type="text" id="new-timeline-title" class="form-input" placeholder="e.g. Recruiter Call / Follow-up Sent">
            </div>
            <div class="form-group full-width">
              <label class="form-label">Event Notes / Details</label>
              <input type="text" id="new-timeline-note" class="form-input" placeholder="Details of what happened...">
            </div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.75rem;">
            <button class="btn btn-sm btn-secondary" onclick="App.toggleTimelineAddForm()">Cancel</button>
            <button class="btn btn-sm btn-primary" onclick="App.saveTimelineEvent()">Save Event</button>
          </div>
        </div>

        <div class="timeline">
    `;

    const timeline = app.timeline || [];
    if (timeline.length === 0) {
      html += '<p style="font-size: 0.85rem; color: var(--text-muted);">No timeline events recorded yet.</p>';
    } else {
      timeline.forEach(event => {
        html += `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-date">${event.date}</div>
            <div class="timeline-content">
              <strong>${this.escape(event.title)}</strong>
              ${event.note ? `<div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.1rem;">${this.escape(event.note)}</div>` : ''}
            </div>
          </div>
        `;
      });
    }

    html += `
        </div>
      </div>
    `;

    document.getElementById('view-modal-body-content').innerHTML = html;
    modal.classList.add('active');
  },

  toggleTimelineAddForm() {
    const form = document.getElementById('timeline-add-form');
    if (form) {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
  },

  saveTimelineEvent() {
    const appId = document.getElementById('view-modal-app-id').value;
    const title = document.getElementById('new-timeline-title').value.trim();
    const date = document.getElementById('new-timeline-date').value;
    const note = document.getElementById('new-timeline-note').value.trim();

    if (!title) {
      alert('Event title is required');
      return;
    }

    Storage.addTimelineEvent(appId, title, note, date);
    this.showToast('Timeline event added!');
    this.openViewModal(appId); // Refresh view modal
  },

  /**
   * Filter by status shortcut (e.g. from pipeline card)
   */
  filterByStatus(status) {
    this.navigateTo('applications');
    Applications.setFilterStatus(status);
  },

  /**
   * Settings Page Functions
   */
  renderSettings() {
    const data = Storage.loadData() || {};
    const appCount = (data.applications || []).length;
    const contactCount = (data.contacts || []).length;

    const countEl = document.getElementById('settings-stored-apps-count');
    if (countEl) countEl.textContent = `${appCount} applications, ${contactCount} contacts stored`;

    const urlInput = document.getElementById('settings-sheets-url');
    if (urlInput) urlInput.value = Storage.getGoogleSheetsUrl();
  },

  saveGoogleSheetsUrl() {
    const urlInput = document.getElementById('settings-sheets-url');
    if (urlInput) {
      const url = urlInput.value.trim();
      Storage.setGoogleSheetsUrl(url);
      this.showToast(url ? 'Google Sheets Web App URL saved!' : 'Google Sheets URL cleared.');
    }
  },

  syncAllToGoogleSheets() {
    const url = Storage.getGoogleSheetsUrl();
    if (!url) {
      alert('Please save your Google Sheets Web App URL first!');
      return;
    }
    Storage.syncAllToGoogleSheets()
      .then(res => {
        if (res.success) {
          this.showToast('All applications synced to Google Sheets!');
        } else {
          alert('Sync Warning: ' + (res.reason || res.error || 'Failed to sync'));
        }
      });
  },

  openSheetsGuideModal() {
    const modal = document.getElementById('sheets-guide-modal');
    if (modal) modal.classList.add('active');
  },

  handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = Storage.importJSON(e.target.result);
      if (result.success) {
        App.showToast(`Successfully imported ${result.count} applications!`);
        App.navigateTo('dashboard');
      } else {
        alert('Import Failed: ' + result.error);
      }
    };
    reader.readAsText(file);
  },

  confirmClearAll() {
    if (confirm('⚠️ ARE YOU SURE? This will permanently delete ALL job applications, contacts, and timeline data stored in your browser local storage!')) {
      Storage.clearAll();
      this.showToast('All data cleared.');
      this.navigateTo('dashboard');
    }
  },

  /**
   * Toast notification helper
   */
  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>${this.escape(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => container.removeChild(toast), 300);
    }, 3000);
  },

  /**
   * Calendar Sync URL Helpers (Google Calendar)
   */
  createGoogleCalendarUrl({ title, details, location, startDate, startTime }) {
    if (!startDate) return '#';
    const dateClean = startDate.replace(/-/g, '');
    let datesParam = `${dateClean}/${dateClean}`;

    if (startTime && startTime.includes(':')) {
      const [h, m] = startTime.split(':').map(Number);
      const timeStart = `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
      const endH = String((h + 1) % 24).padStart(2, '0');
      const timeEnd = `${endH}${String(m).padStart(2, '0')}00`;
      datesParam = `${dateClean}T${timeStart}/${dateClean}T${timeEnd}`;
    }

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', title);
    if (details) url.searchParams.set('details', details);
    if (location) url.searchParams.set('location', location);
    url.searchParams.set('dates', datesParam);

    return url.toString();
  },

  getFollowupCalendarUrl(app) {
    if (!app || !app.followUpDate) return '#';
    return this.createGoogleCalendarUrl({
      title: `Follow-up: ${app.company} (${app.jobTitle})`,
      details: `Next Action: ${app.nextAction || 'Send follow-up outreach'}\nRecruiter Contact: ${app.contactPerson || 'N/A'} (${app.contactEmail || ''})\nJob Tracker Record: ${app.id}`,
      location: app.location || '',
      startDate: app.followUpDate
    });
  },

  getInterviewCalendarUrl(app) {
    if (!app || !app.interviewDate) return '#';
    return this.createGoogleCalendarUrl({
      title: `Interview (${app.interviewRound || 'Round'}): ${app.company} - ${app.jobTitle}`,
      details: `Interviewer: ${app.interviewer || 'TBD'}\nPrep Notes: ${app.prepNotes || 'Review job description & coding topics'}\nJob Tracker Record: ${app.id}`,
      location: app.location || app.workMode || '',
      startDate: app.interviewDate,
      startTime: app.interviewTime
    });
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

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
