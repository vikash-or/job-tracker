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
   * Load rich realistic sample demo data for immediate testing
   */
  loadDemoData() {
    const today = new Date();
    const formatDate = (daysOffset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysOffset);
      return d.toISOString().split('T')[0];
    };

    const demoApplications = [
      {
        id: 'J001',
        company: 'Zepto Labs',
        jobTitle: 'Operations Research Analyst',
        jobType: 'Full-time',
        location: 'Gurugram',
        workMode: 'Hybrid',
        jobUrl: 'https://careers.zeptonow.com/jobs/or-analyst',
        companyCareerUrl: 'https://careers.zeptonow.com',
        dateFound: formatDate(-15),
        dateApplied: formatDate(-14),
        deadline: formatDate(3),
        status: 'Interview',
        priority: 'High',
        cvVersion: 'OR-01',
        coverLetterUsed: 'Yes',
        referral: 'Yes',
        referralPerson: 'Rahul Sharma (SDE-2)',
        source: 'Referral',
        lastAction: 'Completed Technical Round 1',
        lastActionDate: formatDate(-2),
        nextAction: 'Attend System Design & MILP Round',
        followUpDate: formatDate(0), // Today!
        followUpCount: 1,
        contactPerson: 'Ananya Gupta',
        contactRole: 'Technical Recruiter',
        contactEmail: 'ananya.g@zepto.in',
        contactLinkedIn: 'https://linkedin.com/in/ananyaguptarecruiter',
        contactNotes: 'Responded quickly on LinkedIn. Emphasized linear programming experience.',
        assessmentRequired: 'Yes',
        assessmentDate: formatDate(-8),
        assessmentDeadline: formatDate(-6),
        assessmentStatus: 'Passed',
        assessmentNotes: 'Scored 92% on optimization algorithms hackerrank test.',
        interviewDate: formatDate(0), // Today!
        interviewTime: '15:00',
        interviewRound: 'Technical',
        interviewStatus: 'Scheduled',
        interviewer: 'Vikramaditya (Senior Lead Analyst)',
        interviewNotes: 'Prepare Python pulp / scipy optimization models & vehicle routing problem cases.',
        questionsAsked: 'Formulate supply chain node allocation under capacity constraints.',
        prepNotes: 'Revise Simplex algorithm, Duality theorem, and Python PuLP solver.',
        salary: '14 - 18 LPA',
        jobDescription: 'Seeking an Operations Research Analyst to optimize dark store replenishment, route planning, and inventory placement algorithms.',
        notes: 'Target role! Great growth trajectory in quick-commerce optimization.',
        fit: 'Strong Fit',
        whyApplied: 'Perfect match for my B.Tech OR & Supply Chain optimization skills.',
        keyRequirements: 'Python, PuLP/Gurobi, Linear Programming, SQL, Supply Chain Logic',
        metRequirements: 'Solid LP modeling in Python, strong SQL skills, internship projects.',
        unmetRequirements: 'Limited Gurobi commercial license exposure.',
        timeline: [
          { id: 'TL1', date: formatDate(-15), title: 'Job Saved', note: 'Discovered on LinkedIn via referral post' },
          { id: 'TL2', date: formatDate(-14), title: 'Applied', note: 'Referred by Rahul Sharma' },
          { id: 'TL3', date: formatDate(-8), title: 'Online Assessment Sent', note: 'Received HackerRank link' },
          { id: 'TL4', date: formatDate(-6), title: 'Assessment Passed', note: 'Cleared OA with top score' },
          { id: 'TL5', date: formatDate(-2), title: 'Interview Scheduled', note: 'Technical Round scheduled for today 3:00 PM' }
        ]
      },
      {
        id: 'J002',
        company: 'Air India',
        jobTitle: 'Data Analyst - Operations',
        jobType: 'Full-time',
        location: 'Gurugram',
        workMode: 'On-site',
        jobUrl: 'https://airindia.in/careers',
        companyCareerUrl: 'https://airindia.in/careers',
        dateFound: formatDate(-20),
        dateApplied: formatDate(-18),
        deadline: formatDate(-5),
        status: 'Assessment',
        priority: 'High',
        cvVersion: 'Data-01',
        coverLetterUsed: 'Yes',
        referral: 'No',
        referralPerson: '',
        source: 'Naukri',
        lastAction: 'Submitted Online Assessment',
        lastActionDate: formatDate(-1),
        nextAction: 'Follow up on OA results',
        followUpDate: formatDate(0), // Today!
        followUpCount: 0,
        contactPerson: 'Rohan Mehta',
        contactRole: 'HR Executive',
        contactEmail: 'rohan.mehta@airindia.in',
        contactLinkedIn: '',
        contactNotes: 'Contacted via campus drive email.',
        assessmentRequired: 'Yes',
        assessmentDate: formatDate(-1),
        assessmentDeadline: formatDate(0), // Today!
        assessmentStatus: 'Completed',
        assessmentNotes: 'SQL window functions & Tableau dashboard case study.',
        interviewDate: '',
        interviewTime: '',
        interviewRound: '',
        interviewStatus: '',
        interviewer: '',
        interviewNotes: '',
        questionsAsked: '',
        prepNotes: 'Flight delay prediction datasets & SQL joins.',
        salary: '10 - 12 LPA',
        jobDescription: 'Analyze flight performance data, fuel consumption, and crew scheduling metrics.',
        notes: 'Aviation domain interest. Need to check status by end of week.',
        fit: 'Good Fit',
        whyApplied: 'Strong interest in flight operations data.',
        keyRequirements: 'SQL, PowerBI/Tableau, Python, Excel',
        metRequirements: 'Excel & SQL certified, built flight delay analysis project.',
        unmetRequirements: 'Airline domain data tools.',
        timeline: [
          { id: 'TL6', date: formatDate(-20), title: 'Job Saved', note: 'Found on Naukri.com' },
          { id: 'TL7', date: formatDate(-18), title: 'Application Submitted', note: 'Applied via company portal' },
          { id: 'TL8', date: formatDate(-1), title: 'Assessment Completed', note: 'Submitted SQL test case' }
        ]
      },
      {
        id: 'J003',
        company: 'Deloitte India',
        jobTitle: 'Business Analyst - Risk Advisory',
        jobType: 'Full-time',
        location: 'Bengaluru',
        workMode: 'Hybrid',
        jobUrl: 'https://jobs2.deloitte.com/in',
        companyCareerUrl: 'https://jobs2.deloitte.com',
        dateFound: formatDate(-10),
        dateApplied: formatDate(-9),
        deadline: formatDate(2),
        status: 'Follow-up Due',
        priority: 'Medium',
        cvVersion: 'Analytics-01',
        coverLetterUsed: 'No',
        referral: 'No',
        referralPerson: '',
        source: 'LinkedIn',
        lastAction: 'Applied via LinkedIn Easy Apply',
        lastActionDate: formatDate(-9),
        nextAction: 'Send follow-up email to talent recruiter',
        followUpDate: formatDate(0), // Today!
        followUpCount: 1,
        contactPerson: 'Siddharth Rao',
        contactRole: 'Campus Hiring Lead',
        contactEmail: 'siddharthrao@deloitte.com',
        contactLinkedIn: 'https://linkedin.com/in/siddharthraodeloitte',
        contactNotes: 'Reached out after applying.',
        assessmentRequired: 'No',
        assessmentDate: '',
        assessmentDeadline: '',
        assessmentStatus: '',
        assessmentNotes: '',
        interviewDate: '',
        interviewTime: '',
        interviewRound: '',
        interviewStatus: '',
        interviewer: '',
        interviewNotes: '',
        questionsAsked: '',
        prepNotes: '',
        salary: '9 - 11 LPA',
        jobDescription: 'Consulting role helping enterprise clients evaluate risk, compliance, and process analytics.',
        notes: 'Follow up today as 7 business days have elapsed.',
        fit: 'Good Fit',
        whyApplied: 'Reputable brand and structured fresher training program.',
        keyRequirements: 'Business requirements gathering, SQL, Excel modeling',
        metRequirements: 'Strong communication, case study problem solving.',
        unmetRequirements: 'Prior consulting internship.',
        timeline: [
          { id: 'TL9', date: formatDate(-10), title: 'Job Found', note: 'Saved from LinkedIn' },
          { id: 'TL10', date: formatDate(-9), title: 'Applied', note: 'LinkedIn Easy Apply' }
        ]
      },
      {
        id: 'J004',
        company: 'Swiggy',
        jobTitle: 'Associate Business Analyst',
        jobType: 'Full-time',
        location: 'Bengaluru',
        workMode: 'On-site',
        jobUrl: 'https://careers.swiggy.com',
        companyCareerUrl: 'https://careers.swiggy.com',
        dateFound: formatDate(-25),
        dateApplied: formatDate(-24),
        deadline: formatDate(-10),
        status: 'Final Round',
        priority: 'High',
        cvVersion: 'Analytics-01',
        coverLetterUsed: 'Yes',
        referral: 'Yes',
        referralPerson: 'Priya Nair',
        source: 'Referral',
        lastAction: 'Completed Managerial Interview Round',
        lastActionDate: formatDate(-3),
        nextAction: 'Awaiting HR Offer decision',
        followUpDate: formatDate(2),
        followUpCount: 2,
        contactPerson: 'Karan Malhotra',
        contactRole: 'HR Manager',
        contactEmail: 'karan.m@swiggy.in',
        contactLinkedIn: 'https://linkedin.com/in/karanmalhotrahr',
        contactNotes: 'Very encouraging feedback after Round 2.',
        assessmentRequired: 'Yes',
        assessmentDate: formatDate(-18),
        assessmentDeadline: formatDate(-16),
        assessmentStatus: 'Passed',
        assessmentNotes: 'Analytical case study on driver payout structures.',
        interviewDate: formatDate(2),
        interviewTime: '11:30',
        interviewRound: 'Final',
        interviewStatus: 'Scheduled',
        interviewer: 'Director of Analytics',
        interviewNotes: 'Final culture fit and salary expectations discussion.',
        questionsAsked: 'Walk me through a time when data contradicted your hypothesis.',
        prepNotes: 'Review Swiggy core values and recent product launches.',
        salary: '12 - 15 LPA',
        jobDescription: 'Work closely with product managers and ops leads to analyze user retention and order density.',
        notes: 'Top prospect! HR indicated positive movement.',
        fit: 'Strong Fit',
        whyApplied: 'Love foodtech logistics and fast-paced product environment.',
        keyRequirements: 'SQL, Python, Product Analytics, Problem Solving',
        metRequirements: 'Full match across technical & case study skills.',
        unmetRequirements: 'None.',
        timeline: [
          { id: 'TL11', date: formatDate(-25), title: 'Job Saved', note: 'Referred by Priya' },
          { id: 'TL12', date: formatDate(-24), title: 'Applied', note: 'Portal application' },
          { id: 'TL13', date: formatDate(-18), title: 'Case Study Assigned', note: 'Driver payout case study' },
          { id: 'TL14', date: formatDate(-10), title: 'Technical Interview', note: 'Passed Tech Round' },
          { id: 'TL15', date: formatDate(-3), title: 'Managerial Round', note: 'Passed Managerial Round' }
        ]
      },
      {
        id: 'J005',
        company: 'McKinsey & Company',
        jobTitle: 'Junior Data Scientist',
        jobType: 'Full-time',
        location: 'Gurugram',
        workMode: 'Hybrid',
        jobUrl: 'https://mckinsey.com/careers',
        companyCareerUrl: 'https://mckinsey.com/careers',
        dateFound: formatDate(-2),
        dateApplied: '',
        deadline: formatDate(1), // Deadline in 1 day!
        status: 'Saved',
        priority: 'High',
        cvVersion: 'Data-01',
        coverLetterUsed: 'No',
        referral: 'No',
        referralPerson: '',
        source: 'Company Website',
        lastAction: 'Saved job details',
        lastActionDate: formatDate(-2),
        nextAction: 'Tailor resume and submit before deadline tomorrow',
        followUpDate: formatDate(1),
        followUpCount: 0,
        contactPerson: '',
        contactRole: '',
        contactEmail: '',
        contactLinkedIn: '',
        contactNotes: '',
        assessmentRequired: 'No',
        assessmentDate: '',
        assessmentDeadline: '',
        assessmentStatus: '',
        assessmentNotes: '',
        interviewDate: '',
        interviewTime: '',
        interviewRound: '',
        interviewStatus: '',
        interviewer: '',
        interviewNotes: '',
        questionsAsked: '',
        prepNotes: '',
        salary: '16 - 20 LPA',
        jobDescription: 'Build statistical models and advanced machine learning analytics for global client engagements.',
        notes: 'Need to complete cover letter tonight!',
        fit: 'Strong Fit',
        whyApplied: 'Premier consulting firm.',
        keyRequirements: 'Python, ML, Scikit-learn, SQL, Problem Solving',
        metRequirements: 'Strong Python & ML projects.',
        unmetRequirements: 'None.',
        timeline: [
          { id: 'TL16', date: formatDate(-2), title: 'Job Saved', note: 'Found on McKinsey careers page' }
        ]
      },
      {
        id: 'J006',
        company: 'Flipkart',
        jobTitle: 'Supply Chain Analyst',
        jobType: 'Full-time',
        location: 'Bengaluru',
        workMode: 'Hybrid',
        jobUrl: 'https://flipkartcareers.com',
        companyCareerUrl: 'https://flipkartcareers.com',
        dateFound: formatDate(-30),
        dateApplied: formatDate(-28),
        deadline: formatDate(-20),
        status: 'Rejected',
        priority: 'Medium',
        cvVersion: 'OR-01',
        coverLetterUsed: 'Yes',
        referral: 'No',
        referralPerson: '',
        source: 'Company Website',
        lastAction: 'Received rejection email',
        lastActionDate: formatDate(-15),
        nextAction: 'None',
        followUpDate: '',
        followUpCount: 1,
        contactPerson: 'Amitabh Sen',
        contactRole: 'Recruiter',
        contactEmail: '',
        contactLinkedIn: '',
        contactNotes: 'Automated rejection email after OA.',
        assessmentRequired: 'Yes',
        assessmentDate: formatDate(-22),
        assessmentDeadline: formatDate(-20),
        assessmentStatus: 'Failed',
        assessmentNotes: 'Time limit was extremely tight.',
        interviewDate: '',
        interviewTime: '',
        interviewRound: '',
        interviewStatus: '',
        interviewer: '',
        interviewNotes: '',
        questionsAsked: '',
        prepNotes: '',
        salary: '12 - 14 LPA',
        jobDescription: 'Inventory allocation & fulfillment center throughput optimization.',
        notes: 'Reapplied next cycle. Practice timed coding questions.',
        fit: 'Good Fit',
        whyApplied: 'Leading e-commerce player.',
        keyRequirements: 'Optimization, SQL, Python',
        metRequirements: 'Good foundation.',
        unmetRequirements: 'Speed on hard OA algorithms.',
        timeline: [
          { id: 'TL17', date: formatDate(-30), title: 'Job Saved', note: 'Careers site' },
          { id: 'TL18', date: formatDate(-28), title: 'Applied', note: 'Submitted CV' },
          { id: 'TL19', date: formatDate(-15), title: 'Rejected', note: 'Automated email after OA' }
        ]
      }
    ];

    const demoContacts = [
      {
        id: 'C001',
        name: 'Ananya Gupta',
        company: 'Zepto Labs',
        role: 'Technical Recruiter',
        email: 'ananya.g@zepto.in',
        linkedIn: 'https://linkedin.com/in/ananyaguptarecruiter',
        type: 'Recruiter',
        notes: 'Very responsive on LinkedIn. Reach out for interview status update.'
      },
      {
        id: 'C002',
        name: 'Rahul Sharma',
        company: 'Zepto Labs',
        role: 'SDE-2 (Operations Tech)',
        email: 'rahul.sharma@zepto.in',
        linkedIn: 'https://linkedin.com/in/rahulsharma-zepto',
        type: 'Referral',
        notes: 'College alumnus who referred me for the OR Analyst position.'
      },
      {
        id: 'C003',
        name: 'Siddharth Rao',
        company: 'Deloitte India',
        role: 'Campus Hiring Lead',
        email: 'siddharthrao@deloitte.com',
        linkedIn: 'https://linkedin.com/in/siddharthraodeloitte',
        type: 'Recruiter',
        notes: 'Met during college webinar on Risk Advisory.'
      },
      {
        id: 'C004',
        name: 'Karan Malhotra',
        company: 'Swiggy',
        role: 'HR Manager',
        email: 'karan.m@swiggy.in',
        linkedIn: 'https://linkedin.com/in/karanmalhotrahr',
        type: 'Hiring Manager',
        notes: 'Point of contact for Swiggy final round interviews.'
      }
    ];

    const demoData = {
      version: '1.0.0',
      applications: demoApplications,
      contacts: demoContacts,
      settings: {
        theme: this.getTheme()
      }
    };

    this.saveData(demoData);
    return demoData;
  }
};

// Auto initialize on load
Storage.init();
