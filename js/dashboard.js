/* ==========================================
   PERSONAL JOB APPLICATION TRACKER - DASHBOARD
   ========================================== */

const Dashboard = {
  /**
   * Render the entire dashboard view
   */
  render() {
    const apps = Storage.getApplications();
    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate Dashboard Stats
    const stats = this.calculateStats(apps, todayStr);

    // 1. Render Summary Cards
    this.renderStatCards(stats);

    // 2. Render Today's Actions Section
    this.renderTodaysActions(apps, todayStr);

    // 3. Render Application Pipeline Visual Flow
    this.renderPipeline(apps);

    // 4. Render Dashboard Charts (Sources & Monthly trend)
    this.renderCharts(apps);
  },

  /**
   * Calculate all quantitative metric counters
   */
  calculateStats(apps, todayStr) {
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

    let total = apps.length;
    let active = 0;
    let thisMonth = 0;
    let interviews = 0;
    let assessments = 0;
    let finalRounds = 0;
    let offers = 0;
    let rejections = 0;

    let followupsDueToday = 0;
    let upcomingInterviews = 0;
    let upcomingDeadlines = 0;

    apps.forEach(app => {
      const isInactive = ['Rejected', 'Withdrawn', 'Offer'].includes(app.status);
      if (!isInactive) active++;

      if (app.dateApplied && app.dateApplied.startsWith(currentMonth)) {
        thisMonth++;
      }

      if (app.status === 'Interview') interviews++;
      if (app.status === 'Assessment') assessments++;
      if (app.status === 'Final Round') finalRounds++;
      if (app.status === 'Offer') offers++;
      if (app.status === 'Rejected') rejections++;

      // Count follow-ups due today or overdue
      if (app.followUpDate && app.followUpDate <= todayStr && !isInactive) {
        followupsDueToday++;
      }

      // Count upcoming interviews
      if (app.interviewDate && app.interviewDate >= todayStr) {
        upcomingInterviews++;
      }

      // Count upcoming deadlines within 7 days
      if (app.deadline && app.deadline >= todayStr) {
        const diffDays = Math.ceil((new Date(app.deadline) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) upcomingDeadlines++;
      }
    });

    return {
      total,
      active,
      thisMonth,
      interviews,
      assessments,
      finalRounds,
      offers,
      rejections,
      followupsDueToday,
      upcomingInterviews,
      upcomingDeadlines
    };
  },

  /**
   * Render Top Stat Cards
   */
  renderStatCards(stats) {
    const grid = document.getElementById('dashboard-stats-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(79, 70, 229, 0.15); color: #4f46e5;">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${stats.total}</span>
          <span class="stat-label">Total Applications</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(37, 99, 235, 0.15); color: #2563eb;">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${stats.active}</span>
          <span class="stat-label">Active Applications</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(147, 51, 234, 0.15); color: #9333ea;">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${stats.thisMonth}</span>
          <span class="stat-label">Applied This Month</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(8, 145, 178, 0.15); color: #0891b2;">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">${stats.interviews}</span>
          <span class="stat-label">In Interview Stage</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(217, 119, 6, 0.15); color: #d97706;">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" style="color: ${stats.followupsDueToday > 0 ? '#d97706' : 'inherit'};">${stats.followupsDueToday}</span>
          <span class="stat-label">Follow-ups Due</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(5, 150, 105, 0.15); color: #059669;">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value" style="color: #059669;">${stats.offers}</span>
          <span class="stat-label">Job Offers</span>
        </div>
      </div>
    `;
  },

  /**
   * Render Today's Actions Section
   */
  renderTodaysActions(apps, todayStr) {
    const container = document.getElementById('todays-actions-container');
    if (!container) return;

    const followupsDue = [];
    const interviewsToday = [];
    const assessmentsDue = [];
    const deadlinesSoon = [];

    apps.forEach(app => {
      // 1. Follow-ups due today or overdue
      if (app.followUpDate && app.followUpDate <= todayStr && !['Rejected', 'Withdrawn', 'Offer'].includes(app.status)) {
        const isOverdue = app.followUpDate < todayStr;
        followupsDue.push({ app, isOverdue });
      }

      // 2. Interviews today
      if (app.interviewDate === todayStr) {
        interviewsToday.push(app);
      }

      // 3. Assessments due today
      if ((app.assessmentDeadline === todayStr || app.assessmentDate === todayStr) && app.assessmentStatus !== 'Passed' && app.assessmentStatus !== 'Completed') {
        assessmentsDue.push(app);
      }

      // 4. Application Deadlines (Today, 3 days, 7 days)
      if (app.deadline && app.deadline >= todayStr) {
        const diffDays = Math.ceil((new Date(app.deadline) - new Date(todayStr)) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7 && app.status === 'Saved') {
          deadlinesSoon.push({ app, diffDays });
        }
      }
    });

    const totalActionsCount = followupsDue.length + interviewsToday.length + assessmentsDue.length + deadlinesSoon.length;

    if (totalActionsCount === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem 1rem;">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h3>All Caught Up for Today!</h3>
          <p>No urgent follow-ups, interviews, or deadlines pending right now.</p>
        </div>
      `;
      return;
    }

    let html = '<div class="action-items-grid">';

    // Render Follow-ups
    followupsDue.forEach(({ app, isOverdue }) => {
      html += `
        <div class="action-card ${isOverdue ? 'overdue' : 'due-today'}">
          <div class="action-header">
            <span class="action-company">${this.escape(app.company)}</span>
            <span class="badge ${isOverdue ? 'badge-rejected' : 'badge-followup'}">${isOverdue ? 'OVERDUE' : 'DUE TODAY'}</span>
          </div>
          <div class="action-title">${this.escape(app.jobTitle)}</div>
          <div class="action-detail">
            <strong>Action:</strong> ${this.escape(app.nextAction || 'Send follow-up message to recruiter')}
          </div>
          <div class="action-footer">
            <span class="action-date-tag" style="color: ${isOverdue ? '#dc2626' : '#d97706'}">
              ${isOverdue ? '📅 Overdue since ' + app.followUpDate : '📅 Follow-up date: Today'}
            </span>
            <button class="btn btn-sm btn-secondary" onclick="App.openViewModal('${app.id}')">View</button>
          </div>
        </div>
      `;
    });

    // Render Interviews Today
    interviewsToday.forEach(app => {
      html += `
        <div class="action-card interview-today">
          <div class="action-header">
            <span class="action-company">${this.escape(app.company)}</span>
            <span class="badge badge-interview">INTERVIEW TODAY</span>
          </div>
          <div class="action-title">${this.escape(app.jobTitle)}</div>
          <div class="action-detail">
            <strong>Round:</strong> ${this.escape(app.interviewRound || 'Technical')} ${app.interviewTime ? 'at ' + app.interviewTime : ''}
          </div>
          <div class="action-footer">
            <span class="action-date-tag" style="color: #0891b2">👤 Interviewer: ${this.escape(app.interviewer || 'TBD')}</span>
            <button class="btn btn-sm btn-primary" onclick="App.openViewModal('${app.id}')">Prep Notes</button>
          </div>
        </div>
      `;
    });

    // Render Assessments Due Today
    assessmentsDue.forEach(app => {
      html += `
        <div class="action-card deadline-soon">
          <div class="action-header">
            <span class="action-company">${this.escape(app.company)}</span>
            <span class="badge badge-assessment">ASSESSMENT DUE</span>
          </div>
          <div class="action-title">${this.escape(app.jobTitle)}</div>
          <div class="action-detail">
            <strong>Assessment:</strong> ${this.escape(app.assessmentNotes || 'Online Test / Technical Task')}
          </div>
          <div class="action-footer">
            <span class="action-date-tag" style="color: #9333ea">⏳ Deadline: Today</span>
            <button class="btn btn-sm btn-secondary" onclick="App.openViewModal('${app.id}')">Details</button>
          </div>
        </div>
      `;
    });

    // Render Deadlines Soon
    deadlinesSoon.forEach(({ app, diffDays }) => {
      let badgeClass = 'badge-medium';
      let tagText = `Deadline in ${diffDays} days`;
      if (diffDays === 0) {
        badgeClass = 'badge-high';
        tagText = 'Deadline TODAY!';
      } else if (diffDays <= 3) {
        badgeClass = 'badge-high';
        tagText = `Deadline in ${diffDays} days ⚠️`;
      }

      html += `
        <div class="action-card deadline-soon">
          <div class="action-header">
            <span class="action-company">${this.escape(app.company)}</span>
            <span class="badge ${badgeClass}">${diffDays <= 3 ? 'URGENT DEADLINE' : 'DEADLINE SOON'}</span>
          </div>
          <div class="action-title">${this.escape(app.jobTitle)}</div>
          <div class="action-detail">
            <strong>Status:</strong> Saved (Not Applied Yet)
          </div>
          <div class="action-footer">
            <span class="action-date-tag" style="color: #dc2626">📅 ${tagText} (${app.deadline})</span>
            <button class="btn btn-sm btn-primary" onclick="App.openEditModal('${app.id}')">Apply Now</button>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  },

  /**
   * Render Pipeline Visual Diagram
   */
  renderPipeline(apps) {
    const container = document.getElementById('pipeline-flow-container');
    if (!container) return;

    const stages = [
      { key: 'Saved', label: 'Saved' },
      { key: 'Applied', label: 'Applied' },
      { key: 'Assessment', label: 'Assessment' },
      { key: 'Interview', label: 'Interview' },
      { key: 'Final Round', label: 'Final Round' },
      { key: 'Offer', label: 'Offer' }
    ];

    const counts = {};
    stages.forEach(s => counts[s.key] = 0);

    apps.forEach(app => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    let html = '<div class="pipeline-flow">';
    stages.forEach((stage, idx) => {
      html += `
        <div class="pipeline-stage" onclick="App.filterByStatus('${stage.key}')" style="cursor: pointer;" title="Click to view ${stage.label} applications">
          <div class="pipeline-stage-count">${counts[stage.key]}</div>
          <div class="pipeline-stage-label">${stage.label}</div>
        </div>
      `;
      if (idx < stages.length - 1) {
        html += '<div class="pipeline-arrow">➔</div>';
      }
    });
    html += '</div>';

    container.innerHTML = html;
  },

  /**
   * Render Charts (Fallback clean bars if Chart.js is not present)
   */
  renderCharts(apps) {
    this.renderSourcesChart(apps);
    this.renderMonthlyChart(apps);
  },

  renderSourcesChart(apps) {
    const container = document.getElementById('chart-sources-container');
    if (!container) return;

    const sources = {
      'LinkedIn': 0,
      'Naukri': 0,
      'Company Website': 0,
      'Referral': 0,
      'Indeed': 0,
      'Other': 0
    };

    apps.forEach(a => {
      const src = a.source || 'Other';
      if (sources[src] !== undefined) sources[src]++;
      else sources['Other']++;
    });

    const total = apps.length || 1;

    let html = '<div style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 0.5rem;">';
    Object.entries(sources).forEach(([src, count]) => {
      const pct = Math.round((count / total) * 100);
      html += `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.2rem;">
            <span>${src}</span>
            <span>${count} (${pct}%)</span>
          </div>
          <div style="background-color: var(--bg-primary); height: 10px; border-radius: 5px; overflow: hidden;">
            <div style="background-color: var(--primary); width: ${pct}%; height: 100%; border-radius: 5px; transition: width 0.4s ease;"></div>
          </div>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
  },

  renderMonthlyChart(apps) {
    const container = document.getElementById('chart-monthly-container');
    if (!container) return;

    // Group by Month (YYYY-MM)
    const monthlyMap = {};
    apps.forEach(a => {
      if (a.dateApplied) {
        const monthKey = a.dateApplied.substring(0, 7); // YYYY-MM
        monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + 1;
      }
    });

    const sortedMonths = Object.keys(monthlyMap).sort();

    if (sortedMonths.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <p>No monthly data available yet. Apply to jobs to see monthly application trends!</p>
        </div>
      `;
      return;
    }

    const maxCount = Math.max(...Object.values(monthlyMap), 1);

    let html = '<div style="display: flex; align-items: flex-end; gap: 1rem; height: 180px; padding-top: 1rem;">';
    sortedMonths.forEach(mKey => {
      const count = monthlyMap[mKey];
      const heightPct = Math.round((count / maxCount) * 100);
      const monthName = new Date(mKey + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      html += `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%;">
          <span style="font-size: 0.75rem; font-weight: 700; margin-bottom: 0.25rem;">${count}</span>
          <div style="flex: 1; width: 100%; max-width: 40px; display: flex; align-items: flex-end; background-color: var(--bg-primary); border-radius: 4px;">
            <div style="background: linear-gradient(180deg, #6366f1, #4f46e5); width: 100%; height: ${heightPct}%; border-radius: 4px; transition: height 0.4s ease;"></div>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.4rem;">${monthName}</span>
        </div>
      `;
    });
    html += '</div>';

    container.innerHTML = html;
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
