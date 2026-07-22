# Current Architecture

## High-Level Overview

KaamSetu is a full-stack web application using a classic client-server architecture with a real-time layer added via WebSockets.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│   React 18 + Vite  │  Tailwind CSS  │  Framer Motion        │
│   Socket.IO Client │  Axios         │  react-router-dom v6   │
└────────────────────────────┬────────────────────────────────┘
                             │  HTTPS + WSS
                             │
┌────────────────────────────▼────────────────────────────────┐
│                        SERVER (Node.js)                      │
│   Express 4  │  Socket.IO 4  │  JWT + HttpOnly Cookie Auth   │
│   Helmet │ Compression │ express-rate-limit                   │
└──────────────────┬─────────────────────────────────────────-┘
                   │  Mongoose ODM
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                    MongoDB (Atlas or local)                   │
│  Collections: users, workerprofiles, jobs, applications,     │
│               messages, reviews                              │
└─────────────────────────────────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │     Cloudinary CDN   │
        │  (portfolio images)  │
        └──────────────────────┘
```

---

## Directory Structure

```
KaamSetu/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js         # Cloudinary SDK init + upload helper
│   │   ├── database.js           # Mongoose connect
│   │   └── socket.js             # Socket.IO init, event handlers
│   ├── constants/
│   │   └── categories.js         # Master category/skill lists
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   ├── workerController.js
│   │   ├── messageController.js
│   │   ├── reviewController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # protect / requireMode / optionalAuth
│   │   ├── errorMiddleware.js     # global error handler
│   │   └── uploadMiddleware.js    # multer (memory storage)
│   ├── models/
│   │   ├── User.js
│   │   ├── WorkerProfile.js
│   │   ├── Job.js
│   │   ├── Application.js
│   │   ├── Message.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── workerRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── messageRoutes.js
│   │   └── reviewRoutes.js
│   ├── utils/
│   │   ├── conversationId.js      # deterministic conversation ID
│   │   ├── generateToken.js       # JWT sign + cookie helpers
│   │   ├── helpers.js             # Haversine, smartScore, formatting
│   │   └── sanitizeUser.js        # strips sensitive fields from user doc
│   ├── server.js                  # entry point
│   └── .env                       # environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/              # LoginForm, RegisterForm
│   │   │   ├── chat/              # ChatInput, ChatWindow, MessageBubble
│   │   │   ├── common/            # Header, Footer, Loader, ThemeToggle, etc.
│   │   │   ├── hirer/             # ApplicationCard, JobCard, JobForm
│   │   │   ├── reviews/           # RatingStars, ReviewForm
│   │   │   └── worker/            # AvailabilityToggle, PortfolioUpload,
│   │   │                          #   ProfileForm, WorkerCard, WorkerAvailabilityForm
│   │   ├── context/
│   │   │   ├── AuthContext.jsx    # global auth state + actions
│   │   │   ├── LanguageContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useGeolocation.js
│   │   │   ├── useLocalStorage.js
│   │   │   ├── useSocket.js
│   │   │   ├── useTheme.js
│   │   │   └── useTranslation.js
│   │   ├── pages/
│   │   │   ├── admin/             # AdminDashboard, ManageJobs, ManageUsers
│   │   │   ├── Chat.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── HirerDashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── JobDetails.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Messages.jsx
│   │   │   ├── MyApplications.jsx
│   │   │   ├── MyJobs.jsx
│   │   │   ├── PostJob.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── WorkerDashboard.jsx
│   │   │   ├── WorkerProfile.jsx
│   │   │   └── WorkerSetup.jsx
│   │   ├── routes/
│   │   │   ├── index.jsx          # route path constants
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   ├── api.js             # Axios instance + interceptors
│   │   │   ├── authService.js
│   │   │   ├── applicationService.js
│   │   │   ├── jobService.js
│   │   │   ├── messageService.js
│   │   │   ├── reviewService.js
│   │   │   ├── userService.js
│   │   │   ├── workerService.js
│   │   │   └── index.js           # barrel export
│   │   ├── translations/
│   │   │   ├── en.js, hi.js, bn.js, pa.js, ta.js
│   │   │   └── index.js
│   │   ├── utils/
│   │   │   ├── constants.js       # JOB_CATEGORIES, SKILL_LIST, etc.
│   │   │   ├── conversationId.js  # mirrors backend util
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── package.json                   # root-level (workspace scripts)
```

---

## Key Architectural Decisions

### Dual-Mode User Model
Rather than separate "worker" and "hirer" accounts, every user has a single account with an `activeMode` field (`"worker"` | `"hirer"` | `null`). The mode is set at login or switched at any time. All role-gated API endpoints check `req.user.activeMode` via the `requireMode` middleware, not a static role.

### Interaction-Gated Messaging
Users can only send messages to someone they have a job interaction with — either the worker applied to the hirer's job, or the hirer initiated direct contact. An `Application` record (even with `jobId: null`) is the gate. This prevents cold-contact spam.

### Conversation ID
Conversations are identified by a deterministic, sorted string: `[smallerId]_[largerId]`. This ensures both parties always compute the same ID without a separate conversation collection.

### Smart Ranking
Search results are ranked by a composite score:
- **40%** distance (closer = higher)
- **25%** wage (perspective-aware: higher pay = better for worker browsing jobs; lower wage demand = better for hirer browsing workers)
- **25%** rating average
- **10%** recency

### Soft Delete on Jobs
Jobs are never hard-deleted from the database. A `DELETE /api/jobs/:id` request sets `status: "cancelled"`. This preserves application history and audit trails.

### Token Strategy
JWT is issued in two forms simultaneously: as a `Set-Cookie` (httpOnly, secure in production) and returned in the response body. The frontend stores the body token in `localStorage` and attaches it as a Bearer header. This supports both cookie-based browser auth and programmatic API access.
