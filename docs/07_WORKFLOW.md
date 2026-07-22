# Workflow

This document describes the end-to-end user journeys supported by the platform.

---

## 1. Account Registration and Setup

```
User visits /register
      │
      ├─ Fills name, email, phone, password
      │        OR
      ├─ Clicks "Sign in with Google"
      │
      ▼
Backend creates User document
      │
      ├─ Production: sends verification email → user clicks link → isVerified = true
      └─ Development: isVerified = true immediately
      │
      ▼
JWT issued → stored in localStorage + httpOnly cookie
      │
      ▼
User lands on /dashboard
      │
      ▼
ModeSelectionModal prompts: "I want to work" | "I want to hire"
      │
      ├─ Selects "worker" → PATCH /api/auth/mode { mode: "worker" }
      │         → Redirected to /worker/setup (WorkerSetup page)
      │
      └─ Selects "hirer"  → PATCH /api/auth/mode { mode: "hirer" }
                → Lands on HirerDashboard
```

---

## 2. Worker Onboarding

```
WorkerSetup page (/worker/setup)
      │
      ├─ Step 1: Choose category (Construction / Agriculture / Household / Technical / Other)
      ├─ Step 2: Choose subcategory / role (e.g., Mason)
      ├─ Step 3: Add skills (multi-select from platform list)
      ├─ Step 4: Set bio (max 500 chars)
      ├─ Step 5: Set years of experience
      ├─ Step 6: Set wage (amount + unit: hourly/daily/job)
      ├─ Step 7: Set availability (days of week + optional note)
      ├─ Step 8: Set location (address or browser geolocation)
      │
      ▼
POST /api/workers/profile
      │
      ▼
WorkerProfile created → worker appears in search results
      │
      ▼ (optional)
Upload portfolio photos → POST /api/workers/portfolio (Cloudinary)
```

The worker can return to this setup at any time to update their profile. The endpoint is an upsert: if a profile already exists, it updates instead of creating.

---

## 3. Hirer Posts a Job

```
Hirer navigates to /post-job (or clicks "Post Job" in HirerDashboard)
      │
      ├─ Fills job title, category, description
      ├─ Sets wage (amount + unit)
      ├─ Sets number of workers required
      ├─ Sets location (text or coordinates)
      ├─ Optionally sets start date
      │
      ▼
POST /api/jobs
      │
      ▼
Job document created with status: "open"
      │
      ▼
Job appears in public /search results for workers browsing
```

---

## 4. Worker Applies to a Job

```
Worker browses /search (sees jobs, filtered by mode)
      │
      ▼
Worker opens job detail (/jobs/:id)
      │
      ├─ Sees job details: title, category, wage, location, description
      ├─ Sees application count
      │
      ▼
Clicks "Apply"
      │
      ▼
POST /api/applications { jobId }
      │
      ├─ Validated: job is open, worker ≠ hirer, no duplicate
      │
      ▼
Application created (status: "pending")
      │
      ▼
Socket event "newApplication" emitted to hirer's room
      │
      ▼
Hirer sees notification in HirerDashboard
```

---

## 5. Hirer Reviews and Responds to Applications

```
HirerDashboard → My Jobs section → Click "View Applicants" on a job
      │
      ▼
GET /api/applications/job/:jobId
      │
      ▼
Hirer sees applicant cards (name, skills, wage, availability, rating)
      │
      ├─ Clicks "Accept" → PUT /api/applications/:id { status: "accepted" }
      │         │
      │         ├─ If accepted count = workersRequired → job.status = "filled"
      │         │
      │         └─ Socket event "applicationStatusUpdate" → worker notified
      │
      └─ Clicks "Reject" → PUT /api/applications/:id { status: "rejected" }
                │
                └─ Socket event "applicationStatusUpdate" → worker notified
```

---

## 6. Hirer Contacts a Worker Directly

```
Hirer browses /search (sees workers, filtered by mode)
      │
      ▼
Opens WorkerProfile (/worker/:id)
      │
      ▼
Clicks "Contact" button
      │
      ▼
POST /api/applications/contact { workerId }
      │
      ├─ Creates Application with jobId: null, status: "pending"
      ├─ Socket event "hirerContact" → worker notified
      │
      ▼
Returns conversationId → frontend navigates to /messages/:conversationId
      │
      ▼
Chat is immediately available
```

---

## 7. Messaging

```
Prerequisite: Application record exists (either worker applied or hirer contacted)
      │
      ▼
User opens /messages → GET /api/messages/conversations (list of threads)
      │
      ▼
User opens a conversation /messages/:conversationId or /chat/:userId
      │
      ├─ Frontend joins Socket.IO room: "joinConversation"
      ├─ Loads message history: GET /api/messages/:conversationId
      │   (also marks received messages as read)
      │
      ▼
User types and sends message
      │
      ├─ POST /api/messages { receiverId, content }
      │         │
      │         └─ Socket emits "receiveMessage" to conversation room
      │
      ▼
Receiver sees message in real-time without page refresh

Typing indicators:
      ├─ Sender emits "typing" { receiverId, isTyping: true }
      └─ Receiver's UI shows "typing..." indicator via "userTyping" event
```

---

## 8. Worker Leaves a Review (reverse flow note)

Currently the platform supports hirer-to-worker reviews only.

```
After job is filled (status: "filled"):
      │
      ▼
Hirer navigates to worker's profile
      │
      ▼
POST /api/reviews { workerId, jobId, rating, comment }
      │
      ├─ Validates: job is "filled", worker was accepted for job, no duplicate
      │
      ▼
Review created → refreshWorkerRating() recalculates WorkerProfile.rating
      │
      ▼
Worker's average rating updates on their public profile
```

---

## 9. Mode Switching

```
User clicks mode toggle in Header (HeaderModeToggle component)
      │
      ▼
ModeSelectionModal or direct toggle
      │
      ▼
PATCH /api/auth/mode { mode: "worker" | "hirer" }
      │
      ├─ Optimistic update: state is updated immediately
      ├─ On success: full profile re-fetched (loadUser())
      └─ On failure: previous mode restored, toast error shown
      │
      ▼
UI re-renders:
      ├─ Search shows workers (hirer mode) or jobs (worker mode)
      ├─ Dashboard shows HirerDashboard or WorkerDashboard
      └─ Navigation links update (My Jobs vs My Applications)
```

---

## 10. Admin Workflow

```
User with role: "admin" accesses /admin
      │
      ├─ AdminDashboard: platform overview
      ├─ ManageUsers (/admin/users): view, deactivate/reactivate accounts
      └─ ManageJobs (/admin/jobs): view, cancel any job listing
```

Admins can also delete any review via the review API.

---

## Data State Machine: Job Lifecycle

```
POST /api/jobs
      │
      ▼
   [open]
      │
      ├── accepted count reaches workersRequired ──► [filled]
      │
      └── hirer cancels (DELETE /api/jobs/:id)   ──► [cancelled]

[filled] and [cancelled] are terminal states.
A [filled] job can have reviews submitted against it.
```

## Data State Machine: Application Lifecycle

```
POST /api/applications
      │
      ▼
  [pending]
      │
      ├── hirer accepts ──► [accepted]
      │
      └── hirer rejects ──► [rejected]

[accepted] and [rejected] are terminal states.
An Application record (any status) enables messaging between hirer and worker.
```
