/* ==========================================
   PERSONAL JOB APPLICATION TRACKER - APPLICATIONS MANAGEMENT
   ========================================== */

const Applications = {
  currentSortField: 'dateApplied',
  currentSortAsc: false,
  filters: {
    status: '',
    jobType: '',
    workMode: '',
    source: '',
    search: ''
  },

  /**
   * Initialize applications view & event listeners
   */
  init() {
    this.bindEvents();
  },

  bindEvents() {
    const searchInput = document.getElementById('app-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value;
        this.render();
      });
    }

    const filterStatus = document.getElementById('filter-status');
    if (filterStatus) {
      filterStatus.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.render();
      });
    }

    const filterJobType = document.getElementById('filter-job-type');
    if (filterJobType) {
      filterJobType.addEventListener('change', (e) => {
        this.filters.jobType = e.target.value;
        this.render();
      });
    }

    const filterWorkMode = document.getElementById('filter-work-mode');
    if (filterWorkMode) {
      filterWorkMode.addEventListener('change', (e) => {
        this.filters.workMode = e.target.value;
        this.render();
      });
    }

    const filterSource = document.getElementById('filter-source');
    if (filterSource) {
      filterSource.addEventListener('change', (e) => {
        this.filters.source = e.target.value;
        this.render();
      });
    }
  },

  /**
   * Set status filter programmatically (e.g. from pipeline click)
   */
  setFilterStatus(status) {
    this.filters.status = status;
    const filterStatus = document.getElementById('filter-status');
    if (filterStatus) filterStatus.value = status;
    this.render();
  },

  /**
   * Set global search query
   */
  setSearch(query) {
    this.filters.search = query;
    const searchInput = document.getElementById('app-search-input');
    if (searchInput) searchInput.value = query;
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) globalSearch.value = query;
    this.render();
  },

  /**
   * Render Applications Table
   */
  render() {
    const container = document.getElementById('applications-table-container');
    if (!container) return;

    let apps = Storage.getApplications();

    // 1. Apply Filters & Search
    apps = apps.filter(app => {
      if (this.filters.status && app.status !== this.filters.status) return false;
      if (this.filters.jobType && app.jobType !== this.filters.jobType) return false;
      if (this.filters.workMode && app.workMode !== this.filters.workMode) return false;
      if (this.filters.source && app.source !== this.filters.source) return false;

      if (this.filters.search && this.filters.search.trim() !== '') {
        const q = this.filters.search.toLowerCase();
        const matchCompany = (app.company || '').toLowerCase().includes(q);
        const matchTitle = (app.jobTitle || '').toLowerCase().includes(q);
        const matchLocation = (app.location || '').toLowerCase().includes(q);
        const matchNotes = (app.notes || '').toLowerCase().includes(q);
        const matchStatus = (app.status || '').toLowerCase().includes(q);
        if (!matchCompany && !matchTitle && !matchLocation && !matchNotes && !matchStatus) {
          return false;
        }
      }

      return true;
    });

    // 2. Apply Sorting
    apps.sort((a, b) => {
      let valA = a[this.currentSortField] || '';
      let valB = b[this.currentSortField] || '';

      if (valA < valB) return this.currentSortAsc ? -1 : 1;
      if (valA > valB) return this.currentSortAsc ? 1 : -1;
      return 0;
    });

    // Update count badge
    const countBadge = document.getElementById('applications-count-badge');
    if (countBadge) countBadge.textContent = `${apps.length} items`;

    if (apps.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <h3>No applications found</h3>
          <p>Try adjusting your search or filters, or add a new job application.</p>
          <button class="btn btn-primary" onclick="App.openAddModal()">+ Add New Application</button>
        </div>
      `;
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th onclick="Applications.sort('company')">Company ${this.getSortIcon('company')}</th>
            <th onclick="Applications.sort('jobTitle')">Job Title ${this.getSortIcon('jobTitle')}</th>
            <th>Location</th>
            <th onclick="Applications.sort('dateApplied')">Applied Date ${this.getSortIcon('dateApplied')}</th>
            <th onclick="Applications.sort('status')">Status ${this.getSortIcon('status')}</th>
            <th onclick="Applications.sort('followUpDate')">Follow-up ${this.getSortIcon('followUpDate')}</th>
            <th>Interview</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
    `;

    apps.forEach(app => {
      const statusBadge = this.getStatusBadge(app.status);

      html += `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${this.escape(app.company)}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${this.escape(app.source || 'Direct')}</div>
          </td>
          <td>
            <div style="font-weight: 600;">${this.escape(app.jobTitle)}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">${this.escape(app.jobType || 'Full-time')} • ${this.escape(app.workMode || 'On-site')}</div>
          </td>
          <td>${this.escape(app.location || '—')}</td>
          <td>${app.dateApplied || 'Not Applied'}</td>
          <td>${statusBadge}</td>
          <td>
            ${app.followUpDate ? `
              <span style="font-size: 0.8rem; font-weight: 600; color: ${app.followUpDate <= new Date().toISOString().split('T')[0] ? '#d97706' : 'inherit'};">
                ${app.followUpDate}
              </span>
            ` : '—'}
          </td>
          <td>
            ${app.interviewDate ? `
              <div style="font-size: 0.8rem; font-weight: 600; color: #0891b2;">${app.interviewDate}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${this.escape(app.interviewRound || '')}</div>
            ` : '—'}
          </td>
          <td style="text-align: right; white-space: nowrap;">
            <button class="btn-icon" onclick="App.openViewModal('${app.id}')" title="View Application Details">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </button>
            <button class="btn-icon" onclick="App.openEditModal('${app.id}')" title="Edit Application">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </button>
            <button class="btn-icon" onclick="App.confirmDelete('${app.id}')" title="Delete Application" style="color: var(--danger);">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  },

  /**
   * Sort handler
   */
  sort(field) {
    if (this.currentSortField === field) {
      this.currentSortAsc = !this.currentSortAsc;
    } else {
      this.currentSortField = field;
      this.currentSortAsc = true;
    }
    this.render();
  },

  getSortIcon(field) {
    if (this.currentSortField !== field) return '';
    return this.currentSortAsc ? '↑' : '↓';
  },

  /**
   * Status Badge Helper
   */
  getStatusBadge(status) {
    const statusClasses = {
      'Saved': 'badge-saved',
      'Applied': 'badge-applied',
      'Follow-up Due': 'badge-followup',
      'Assessment': 'badge-assessment',
      'Interview': 'badge-interview',
      'Final Round': 'badge-final',
      'Offer': 'badge-offer',
      'Rejected': 'badge-rejected',
      'Withdrawn': 'badge-withdrawn',
      'No Response': 'badge-noresponse'
    };
    const cls = statusClasses[status] || 'badge-saved';
    return `<span class="badge ${cls}">${this.escape(status || 'Saved')}</span>`;
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
