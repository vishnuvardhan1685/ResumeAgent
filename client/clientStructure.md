client/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.jsx                    # ReactDOM.createRoot entry
│   ├── App.jsx                     # Router root, lazy-loads all pages
│   │
│   ├── pages/                      # Route-level components (one per URL)
│   │   ├── LoginPage.jsx           # Google OAuth landing
│   │   ├── DashboardPage.jsx       # Overview / home after login
│   │   ├── ResumesPage.jsx         # Module 2 — upload + list resumes
│   │   ├── JobsPage.jsx            # Module 3 — paste + list JDs
│   │   ├── AnalyzePage.jsx         # Module 4+5 — trigger pipeline + live results
│   │   └── DiscoverPage.jsx        # Module 7 — job discovery UI
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.jsx        # Sidebar + topbar wrapper
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── GoogleLoginButton.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── resume/
│   │   │   ├── ResumeUpload.jsx    # Drag-drop PDF upload
│   │   │   ├── ResumeCard.jsx      # Single resume in list
│   │   │   └── ResumeList.jsx
│   │   │
│   │   ├── job/
│   │   │   ├── JDForm.jsx          # Paste job description form
│   │   │   ├── JobCard.jsx
│   │   │   └── JobList.jsx
│   │   │
│   │   ├── pipeline/
│   │   │   ├── PipelineSelector.jsx   # Pick resume + JD, hit Analyze
│   │   │   └── AgentProgressBar.jsx   # SSE live status — "Extractor ✓ → Matcher..."
│   │   │
│   │   ├── match-report/
│   │   │   ├── ScoreGauge.jsx         # Arc/gauge chart — overall score
│   │   │   ├── SkillRadarChart.jsx    # Recharts RadarChart
│   │   │   ├── SkillBadges.jsx        # Matched / Missing / Bonus chips
│   │   │   ├── StrengthGapPanel.jsx   # Strength areas vs gap areas
│   │   │   └── MatchReportPanel.jsx   # Composes all of the above
│   │   │
│   │   ├── interview/
│   │   │   ├── QuestionCard.jsx       # Single question + type badge + why_asked
│   │   │   ├── QuestionFilter.jsx     # technical / behavioral / system_design tabs
│   │   │   └── InterviewPanel.jsx
│   │   │
│   │   ├── suggestions/
│   │   │   ├── DiffView.jsx           # original vs rewritten side-by-side
│   │   │   ├── SuggestionCard.jsx     # one bullet rewrite + reason
│   │   │   ├── MissingSectionsAlert.jsx
│   │   │   ├── CopyResumeButton.jsx   # assembles full updated resume text
│   │   │   └── SuggestionsPanel.jsx
│   │   │
│   │   ├── discovery/
│   │   │   ├── JobListingCard.jsx     # title, company, score badge, apply link
│   │   │   ├── DiscoveryFilters.jsx   # source (Google/Internshala), location, score
│   │   │   └── DiscoveryGrid.jsx
│   │   │
│   │   └── ui/                        # Reusable design-system primitives
│   │       ├── Button.jsx
│   │       ├── Badge.jsx              # Skill chips, score badges
│   │       ├── Card.jsx
│   │       ├── Spinner.jsx
│   │       ├── Modal.jsx
│   │       ├── Tabs.jsx
│   │       └── EmptyState.jsx
│   │
│   ├── store/                         # Zustand slices
│   │   ├── authStore.js               # user, token, logout
│   │   ├── resumeStore.js             # resumes[], selectedResumeId
│   │   ├── jobStore.js                # jobs[], selectedJobId
│   │   ├── pipelineStore.js           # status, agentProgress[], matchResult
│   │   └── discoveryStore.js          # jobListings[], filters
│   │
│   ├── api/                           # All network calls — one file per resource
│   │   ├── axiosInstance.js           # base URL, auth interceptor, token refresh
│   │   ├── auth.api.js                # googleLogin, refresh
│   │   ├── resumes.api.js             # uploadResume, listResumes, deleteResume
│   │   ├── jobs.api.js                # saveJob, listJobs, deleteJob
│   │   ├── agent.api.js               # triggerAnalyze (returns SSE URL)
│   │   └── discover.api.js            # discoverJobs
│   │
│   ├── hooks/
│   │   ├── useSSE.js                  # EventSource wrapper — streams agent progress
│   │   ├── useAuth.js                 # reads authStore, exposes login/logout
│   │   ├── useResumeUpload.js         # handles file state + upload mutation
│   │   └── useMatchResult.js          # polls or receives final result after SSE ends
│   │
│   └── utils/
│       ├── formatScore.js             # 74.3 → "74%" with color thresholds
│       ├── assembleFinalResume.js     # merges original text + suggestions → clipboard
│       └── constants.js              # API base URL, score color bands, etc.
│
├── .env.example                       # VITE_API_BASE_URL=http://localhost:5000
├── index.html
├── vite.config.js
├── tailwind.config.js
├── Dockerfile
└── package.json