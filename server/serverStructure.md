server/
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection via Mongoose
│   │   ├── redis.js            # Redis client setup (ioredis)
│   │   └── cloudinary.js       # Cloudinary SDK config
│   │
│   ├── models/
│   │   ├── User.js             # Module 1
│   │   ├── Resume.js           # Module 2
│   │   ├── Job.js              # Module 3
│   │   ├── MatchResult.js      # Module 6 (serving results)
│   │   └── JobListing.js       # Module 6
│   │
│   ├── middleware/
│   │   ├── auth.js             # JWT verifyToken middleware
│   │   ├── rateLimit.js        # Redis-backed rate limiter
│   │   └── errorHandler.js     # Global error handler
│   │
│   ├── routes/
│   │   ├── auth.js             # Module 1 — /api/auth/*
│   │   ├── users.js            # Module 1 — /api/user/*
│   │   ├── resumes.js          # Module 2 — /api/resumes/*
│   │   ├── jobs.js             # Module 3 — /api/jobs/*
│   │   ├── agent.js            # Module 4 proxy — /api/agent/*
│   │   └── discover.js         # Module 6 — /api/jobs/discover
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── resume.controller.js
│   │   ├── job.controller.js
│   │   └── discover.controller.js
│   │
│   └── utils/
│       ├── agentClient.js      # axios instance pointing to FastAPI
│       ├── generateTokens.js   # sign access + refresh JWT
│       └── asyncHandler.js     # wraps async route handlers, eliminates try/catch
│
├── app.js                      # Express app setup, mounts all routers
├── server.js                   # Entry point — calls app.listen()
├── .env.example
├── .gitignore
├── package.json
└── Dockerfile