/* ==========================================
   PERSONAL JOB APPLICATION TRACKER - STORAGE ENGINE
   ========================================== */

const STORAGE_KEY = 'job_tracker_data_v1';
const THEME_KEY = 'job_tracker_theme';

// Default initial storage structure
const DEFAULT_STORAGE = {
  version: '1.0.0',
  applications: [],
  contacts: [],
  settings: {
    theme: 'light'
  }
};

/**
 * Storage Controller Object
 */
const Storage = {
  /**
   * Initialize storage if empty
   */
  init() {
    const data = this.loadData();
    if (!data) {
      this.saveData(DEFAULT_STORAGE);
    }
  },

  /**
   * Load entire application data structure
   */
  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading localStorage:', err);
      return null;
    }
  },

  /**
   * Save entire data structure to localStorage
   */
  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('Error saving to localStorage:', err);
      alert('Failed to save data to localStorage. Storage might be full.');
      return false;
    }
  },

  /**
   * Get all applications
   */
  getApplications() {
    const data = this.loadData() || DEFAULT_STORAGE;
    return data.applications || [];
  },

  /**
   * Get single application by ID
   */
  getApplicationById(id) {
    const apps = this.getApplications();
    return apps.find(app => app.id === id) || null;
  },

  /**
   * Save or Update an Application
   */
  saveApplication(appData) {
    const data = this.loadData() || DEFAULT_STORAGE;
    if (!data.applications) data.applications = [];

    const existingIndex = data.applications.findIndex(a => a.id === appData.id);

    if (existingIndex >= 0) {
      // Preserve timeline if not passed
      if (!appData.timeline) {
        appData.timeline = data.applications[existingIndex].timeline || [];
      }
      data.applications[existingIndex] = appData;
    } else {
      // New Application
      if (!appData.id) {
        appData.id = 'J' + Date.now().toString(36).toUpperCase();
      }
      if (!appData.timeline) {
        appData.timeline = [
          {
            id: 'TL_' + Date.now(),
            date: appData.dateFound || new Date().toISOString().split('T')[0],
            title: 'Job Found',
            note: 'Added to job tracker'
          }
        ];
        if (appData.dateApplied) {
          appData.timeline.push({
            id: 'TL_' + (Date.now() + 1),
            date: appData.dateApplied,
            title: 'Application Submitted',
            note: `Applied via ${appData.source || 'Direct'}`
          });
        }
      }
      data.applications.push(appData);
    }

    // Auto-sync contact if provided in application form
    if (appData.contactPerson && appData.contactPerson.trim()) {
      this.syncContactFromApp(data, appData);
    }

    this.saveData(data);
    // Background Google Sheets Sync
    this.syncToGoogleSheets(appData);
    return appData;
  },

  /**
   * Delete application by ID
   */
  deleteApplication(id) {
    const data = this.loadData() || DEFAULT_STORAGE;
    data.applications = (data.applications || []).filter(a => a.id !== id);
    this.saveData(data);
  },

  /**
   * Add a timeline event to an application
   */
  addTimelineEvent(appId, eventTitle, eventNote, eventDate) {
    const data = this.loadData() || DEFAULT_STORAGE;
    const app = (data.applications || []).find(a => a.id === appId);
    if (app) {
      if (!app.timeline) app.timeline = [];
      app.timeline.push({
        id: 'TL_' + Date.now(),
        date: eventDate || new Date().toISOString().split('T')[0],
        title: eventTitle,
        note: eventNote || ''
      });
      // Sort timeline chronological
      app.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
      this.saveData(data);
      return app;
    }
    return null;
  },

  /**
   * Get all standalone contacts
   */
  getContacts() {
    const data = this.loadData() || DEFAULT_STORAGE;
    return data.contacts || [];
  },

  /**
   * Save / Update Contact
   */
  saveContact(contactData) {
    const data = this.loadData() || DEFAULT_STORAGE;
    if (!data.contacts) data.contacts = [];

    if (!contactData.id) {
      contactData.id = 'C' + Date.now().toString(36).toUpperCase();
      data.contacts.push(contactData);
    } else {
      const idx = data.contacts.findIndex(c => c.id === contactData.id);
      if (idx >= 0) {
        data.contacts[idx] = contactData;
      } else {
        data.contacts.push(contactData);
      }
    }
    this.saveData(data);
    return contactData;
  },

  /**
   * Delete Contact
   */
  deleteContact(id) {
    const data = this.loadData() || DEFAULT_STORAGE;
    data.contacts = (data.contacts || []).filter(c => c.id !== id);
    this.saveData(data);
  },

  /**
   * Sync recruiter contact into standalone contacts list
   */
  syncContactFromApp(data, appData) {
    if (!data.contacts) data.contacts = [];
    const existing = data.contacts.find(
      c => c.name.toLowerCase() === appData.contactPerson.toLowerCase() && c.company.toLowerCase() === appData.company.toLowerCase()
    );
    if (!existing) {
      data.contacts.push({
        id: 'C' + Date.now().toString(36).toUpperCase(),
        name: appData.contactPerson,
        company: appData.company,
        role: appData.contactRole || 'Recruiter / Contact',
        email: appData.contactEmail || '',
        linkedIn: appData.contactLinkedIn || '',
        type: 'Recruiter',
        notes: appData.contactNotes || `Contact for ${appData.jobTitle}`
      });
    }
  },

  /**
   * Theme preferences
   */
  getTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
  },

  setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  /**
   * Export all data as formatted JSON
   */
  exportJSON() {
    const data = this.loadData() || DEFAULT_STORAGE;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `job_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Export applications data as CSV
   */
  exportCSV() {
    const apps = this.getApplications();
    if (apps.length === 0) {
      alert('No application data to export!');
      return;
    }

    const headers = [
      'ID', 'Company', 'Job Title', 'Job Type', 'Location', 'Work Mode', 
      'Status', 'Priority', 'Source', 'CV Version', 'Date Found', 'Date Applied', 
      'Deadline', 'Follow-up Date', 'Last Action', 'Next Action', 
      'Contact Person', 'Contact Email', 'Salary', 'Notes'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = apps.map(app => [
      escapeCsv(app.id),
      escapeCsv(app.company),
      escapeCsv(app.jobTitle),
      escapeCsv(app.jobType),
      escapeCsv(app.location),
      escapeCsv(app.workMode),
      escapeCsv(app.status),
      escapeCsv(app.priority),
      escapeCsv(app.source),
      escapeCsv(app.cvVersion),
      escapeCsv(app.dateFound),
      escapeCsv(app.dateApplied),
      escapeCsv(app.deadline),
      escapeCsv(app.followUpDate),
      escapeCsv(app.lastAction),
      escapeCsv(app.nextAction),
      escapeCsv(app.contactPerson),
      escapeCsv(app.contactEmail),
      escapeCsv(app.salary),
      escapeCsv(app.notes)
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `job_applications_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Import data from JSON backup file
   */
  importJSON(jsonText) {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      // Basic schema verification
      if (!Array.isArray(parsed.applications)) {
        throw new Error('Missing "applications" array in JSON file');
      }
      this.saveData(parsed);
      return { success: true, count: parsed.applications.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Clear all application data
   */
  clearAll() {
    this.saveData(DEFAULT_STORAGE);
  },

  /**
   * Google Sheets Cloud Sync Settings & Integration
   */
  getGoogleSheetsUrl() {
    const data = this.loadData() || DEFAULT_STORAGE;
    return (data.settings && data.settings.googleSheetsUrl) || '';
  },

  setGoogleSheetsUrl(url) {
    const data = this.loadData() || DEFAULT_STORAGE;
    if (!data.settings) data.settings = {};
    data.settings.googleSheetsUrl = url ? url.trim() : '';
    this.saveData(data);
  },

  /**
   * Sync single application or array of applications to Google Sheets Web App
   */
  syncToGoogleSheets(payload) {
    const url = this.getGoogleSheetsUrl();
    if (!url) return Promise.resolve({ success: false, reason: 'No Google Sheets URL configured' });

    return fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    })
    .then(() => ({ success: true }))
    .catch(err => {
      console.warn('Google Sheets sync notice:', err);
      return { success: false, error: err.message };
    });
  },

  /**
   * Sync all stored applications to Google Sheets
   */
  syncAllToGoogleSheets() {
    const apps = this.getApplications();
    if (apps.length === 0) return Promise.resolve({ success: false, reason: 'No applications to sync' });
    return this.syncToGoogleSheets(apps);
  },

  /**
   * Reset to completely empty storage for clean personal use
   */
  loadDemoData() {
    const emptyData = {
      version: '1.0.0',
      applications: [],
      contacts: [],
      settings: {
        theme: this.getTheme(),
        googleSheetsUrl: this.getGoogleSheetsUrl()
      }
    };
    this.saveData(emptyData);
    return emptyData;
  }
};

// Auto initialize on load
Storage.init();
