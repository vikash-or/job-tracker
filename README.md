# Personal Job Application Tracker

A simple, clean, fast, and responsive **Personal Job Application Tracker** web application designed specifically for freshers and job seekers actively applying for jobs.

Built using 100% vanilla web technologies (**HTML5**, **CSS3**, and **Vanilla JavaScript**), it runs entirely in your browser with zero backend or external service dependencies. All application data is stored privately in your browser's `localStorage`.

---

## 🌟 Key Features

- **Personal Search Dashboard**: Instantly see key metric cards, application pipeline flow, job search stats, and visual breakdowns.
- **⚡ Today's Actions**: Automatically highlights urgent tasks due today:
  - Overdue & Due-Today Follow-ups
  - Scheduled Interviews Today
  - Online Assessment Deadlines Today
  - Application Deadlines (Urgent warnings for deadlines within 3 to 7 days)
- **Comprehensive Application Pipeline**:
  - Saved ➔ Applied ➔ Assessment ➔ Interview ➔ Final Round ➔ Offer / Rejected / Withdrawn / No Response
- **Interactive Application Details & Timelines**: Full record breakdown with custom date-stamped timeline events.
- **Follow-up & Interview Management**: Dedicated views to manage recruiter outreach and log interview questions & performance notes.
- **Networking & Contacts Directory**: Store recruiters, referral employees, hiring managers, and alumni contacts.
- **Conversion Analytics**: Track your personal Interview Rate (`Interviews / Applications × 100`), Assessment Rate, and Offer Rate.
- **Data Backup & Privacy**:
  - Export data as **JSON Backup** or **CSV Spreadsheet**.
  - Import previously exported JSON backup to restore your data seamlessly.
  - "Clear All Data" with modal confirmation safety.
- **Dark / Light Mode**: Seamless theme switching with saved browser preference.
- **Demo Data Loader**: Test drive the app immediately with 1 click using realistic fictional sample applications.

---

## 🛠️ Technologies Used

- **HTML5**: Semantic markup & SEO optimized layout.
- **CSS3**: Modern CSS custom properties (variables), responsive layout grids/flexbox, glassmorphic card design system.
- **Vanilla JavaScript**: Pure ES6+ JavaScript without frameworks (No React, Vue, Angular, Node.js, Express, or external backends required).
- **LocalStorage**: Browser-native persistent storage engine.

---

## 📁 Project Structure

```text
job-tracker/
│
├── index.html          # Main Single Page Application (SPA) entry point
├── css/
│   └── style.css       # Design system, themes (Light/Dark), components & layout styles
├── js/
│   ├── app.js          # Main SPA controller, routing, modals & event handlers
│   ├── storage.js      # LocalStorage manager, JSON/CSV export, JSON import & demo data
│   ├── dashboard.js    # Dashboard stats calculation, Today's Actions & charts
│   ├── applications.js # Application table view, search, multi-field filtering & sorting
│   ├── followups.js    # Dedicated follow-up management (Overdue, Due today, Upcoming)
│   ├── interviews.js   # Interview schedule & performance notes recorder
│   ├── contacts.js     # Recruiter & networking contact directory
│   └── analytics.js    # Personal conversion rate metrics & breakdown distribution
├── assets/             # Project assets
└── README.md           # Documentation & deployment guide
```

---

## 🚀 How to Run Locally

Because the application is 100% static with no build step required:

### Method 1: Double-Click Direct Launch
1. Clone or download this project folder.
2. Double-click `index.html` to open it directly in any modern browser (Chrome, Edge, Firefox, Safari).

### Method 2: Local HTTP Server (Optional)
If you prefer running via a local server:
- **VS Code**: Install the "Live Server" extension and click **"Go Live"**.
- **Python**: Run `python -m http.server 8000` inside the `job-tracker` directory and open `http://localhost:8000`.

---

## 🌐 How to Deploy to GitHub Pages (Free Hosting)

Deploying this application to GitHub Pages takes less than 2 minutes:

### Step 1: Create a GitHub Repository
1. Log in to your [GitHub account](https://github.com).
2. Click **New Repository** (or visit `https://github.com/new`).
3. Set **Repository Name** to `job-tracker` (or any preferred name).
4. Set visibility to **Public** (or **Private** if using GitHub Pro).
5. Click **Create repository**.

### Step 2: Push / Upload Code Files
Run the following commands in your command prompt/terminal inside your `job-tracker` project folder:

```bash
git init
git add .
git commit -m "Initial commit - Personal Job Tracker app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/job-tracker.git
git push -u origin main
```

*(Alternatively, you can click "Upload files" on the GitHub website and drag & drop all files directly).*

### Step 3: Enable GitHub Pages
1. Go to your repository **Settings** tab on GitHub.
2. In the left sidebar, click **Pages** (under Code and automation).
3. Under **Build and deployment** -> **Branch**:
   - Select **Branch**: `main`
   - Select **Folder**: `/ (root)`
4. Click **Save**.

### Step 4: Access Your Live Application
- After 1–2 minutes, GitHub Pages will display your live site URL:
  `https://YOUR-USERNAME.github.io/job-tracker/`
- Bookmark this URL on your browser/phone to access your job application tracker anywhere!

---

## 💾 Data Backup & Restore

### How Browser LocalStorage Works
- All job applications, contacts, and timeline events are stored directly inside your web browser's `localStorage` under the key `job_tracker_data_v1`.
- Your data **never** leaves your computer or browser.
- **Important**: Clearing browser cache/cookies or using Incognito/Private mode may clear `localStorage`.

### Regular Data Backup Recommendation
To ensure you never lose your job search records:
1. Navigate to **Settings** in the app.
2. Click **📥 Export JSON Backup** periodically to download a timestamped backup file (`job_tracker_backup_YYYY-MM-DD.json`).
3. Click **📊 Export CSV Spreadsheet** if you wish to analyze your application data in Excel or Google Sheets.

### How to Restore Data
If you switch laptops or clear your browser:
1. Open the app and navigate to **Settings**.
2. Click **📤 Import JSON Backup File**.
3. Select your saved `.json` backup file. All your applications, timeline events, and contacts will be restored instantly!

---

## 📊 Single Data Model Schema

For reference, each job application record adheres to the following unified schema:

```javascript
{
  id: "J001",
  company: "Zepto Labs",
  jobTitle: "Operations Research Analyst",
  jobType: "Full-time",
  location: "Gurugram",
  workMode: "Hybrid",
  jobUrl: "https://careers.company.com/job/123",
  companyCareerUrl: "https://careers.company.com",
  dateFound: "2026-09-15",
  dateApplied: "2026-09-16",
  deadline: "2026-10-05",
  status: "Interview",
  priority: "High",
  cvVersion: "OR-01",
  coverLetterUsed: "Yes",
  referral: "Yes",
  referralPerson: "Rahul Sharma",
  source: "Referral",
  lastAction: "Completed Technical Round 1",
  lastActionDate: "2026-09-28",
  nextAction: "Attend System Design & MILP Round",
  followUpDate: "2026-09-30",
  followUpCount: 1,
  contactPerson: "Ananya Gupta",
  contactRole: "Technical Recruiter",
  contactEmail: "ananya.g@zepto.in",
  contactLinkedIn: "https://linkedin.com/in/ananyagupta",
  assessmentRequired: "Yes",
  assessmentDate: "2026-09-22",
  assessmentDeadline: "2026-09-24",
  assessmentStatus: "Passed",
  assessmentNotes: "Scored 92% on optimization algorithms hackerrank test.",
  interviewDate: "2026-09-30",
  interviewTime: "15:00",
  interviewRound: "Technical",
  interviewStatus: "Scheduled",
  interviewer: "Vikramaditya (Senior Lead Analyst)",
  prepNotes: "Prepare Python pulp / scipy optimization models.",
  questionsAsked: "Formulate supply chain node allocation under capacity constraints.",
  salary: "14 - 18 LPA",
  jobDescription: "Seeking an Operations Research Analyst...",
  notes: "Target role! Great growth trajectory.",
  fit: "Strong Fit",
  whyApplied: "Perfect match for optimization skills.",
  keyRequirements: "Python, PuLP, LP, SQL",
  metRequirements: "Solid LP modeling in Python, strong SQL.",
  unmetRequirements: "Limited Gurobi commercial license exposure.",
  timeline: [
    { id: "TL1", date: "2026-09-15", title: "Job Saved", note: "Discovered on LinkedIn" },
    { id: "TL2", date: "2026-09-16", title: "Applied", note: "Referred by Rahul Sharma" }
  ]
}
```

---

## 🔒 Privacy & Safety

- 100% Client-Side. No telemetry, tracking scripts, or analytics servers.
- No user account creation or passwords needed.
- Complete data control is in your hands.

---

## 📄 License

MIT License — Free to use, modify, and distribute for personal job search tracking.
