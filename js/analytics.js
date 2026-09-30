/* ==========================================
   PERSONAL JOB APPLICATION TRACKER - ANALYTICS
   ========================================== */

const Analytics = {
  /**
   * Render Analytics View
   */
  render() {
    const container = document.getElementById('analytics-content-container');
    if (!container) return;

    const apps = Storage.getApplications();
    const totalApps = apps.length;

    if (totalApps === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          <h3>No Analytics Available Yet</h3>
          <p>Add applications to generate conversion metrics and search insights.</p>
        </div>
      `;
      return;
    }

    // Conversion Calculations
    let interviewsCount = 0;
    let assessmentsCount = 0;
    let offersCount = 0;

    apps.forEach(app => {
      // If application reached interview stage or final round or offer
      if (['Interview', 'Final Round', 'Offer'].includes(app.status) || app.interviewDate) {
        interviewsCount++;
      }
      if (['Assessment', 'Interview', 'Final Round', 'Offer'].includes(app.status) || app.assessmentStatus === 'Passed' || app.assessmentStatus === 'Completed') {
        assessmentsCount++;
      }
      if (app.status === 'Offer') {
        offersCount++;
      }
    });

    const interviewRate = totalApps > 0 ? ((interviewsCount / totalApps) * 100).toFixed(1) : 0;
    const assessmentRate = totalApps > 0 ? ((assessmentsCount / totalApps) * 100).toFixed(1) : 0;
    const offerRate = totalApps > 0 ? ((offersCount / totalApps) * 100).toFixed(1) : 0;

    let html = `
      <!-- Personal Conversion Metrics Header -->
      <div style="margin-bottom: 1.5rem; background: var(--bg-surface); padding: 1.25rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem;">Personal Conversion Rates</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">Note: These are personal job search tracking metrics, not predictions.</p>
        
        <div class="stats-grid" style="margin-bottom: 0;">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(8, 145, 178, 0.15); color: #0891b2;">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">${interviewRate}%</span>
              <span class="stat-label">Interview Conversion Rate</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(147, 51, 234, 0.15); color: #9333ea;">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">${assessmentRate}%</span>
              <span class="stat-label">Assessment Rate</span>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(5, 150, 105, 0.15); color: #059669;">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">${offerRate}%</span>
              <span class="stat-label">Offer Rate</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Breakdown Grid -->
      <div class="charts-grid">
        <!-- Status Breakdown -->
        <div class="chart-card">
          <div class="chart-header">Applications by Pipeline Status</div>
          ${this.renderBreakdownBar(apps, 'status')}
        </div>

        <!-- Job Type Breakdown -->
        <div class="chart-card">
          <div class="chart-header">Applications by Job Type</div>
          ${this.renderBreakdownBar(apps, 'jobType')}
        </div>

        <!-- Source Breakdown -->
        <div class="chart-card">
          <div class="chart-header">Applications by Source</div>
          ${this.renderBreakdownBar(apps, 'source')}
        </div>

        <!-- Work Mode Breakdown -->
        <div class="chart-card">
          <div class="chart-header">Applications by Work Mode</div>
          ${this.renderBreakdownBar(apps, 'workMode')}
        </div>
      </div>
    `;

    container.innerHTML = html;
  },

  renderBreakdownBar(apps, field) {
    const counts = {};
    apps.forEach(a => {
      const val = a[field] || 'Unspecified';
      counts[val] = (counts[val] || 0) + 1;
    });

    const total = apps.length || 1;
    const sortedKeys = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
    sortedKeys.forEach(key => {
      const cnt = counts[key];
      const pct = Math.round((cnt / total) * 100);
      html += `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.2rem;">
            <span style="font-weight: 600;">${key}</span>
            <span style="color: var(--text-secondary);">${cnt} (${pct}%)</span>
          </div>
          <div style="background-color: var(--bg-primary); height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background-color: var(--primary); width: ${pct}%; height: 100%; border-radius: 4px; transition: width 0.3s ease;"></div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }
};
