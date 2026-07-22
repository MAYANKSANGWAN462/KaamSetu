# 🟠 HIGH — Broken endpoints, feature gaps, security exposure

Significant but either scoped to a surface, currently-unused, or a real security concern.

---

## Security

### H1. Socket.io has NO authentication — anyone can join any user's room & spoof events
- **Where:** `backend/config/socket.js:24-70`
- **What:** `handleSocketConnection` trusts client-supplied ids with zero verification:
  - `socket.on('join', userId)` joins the room named by a raw `userId` — no token
    check. Any client can `join` **any** user's room and receive that user's
    real-time events (`newApplication`, `hirerContact`, `applicationStatusUpdate`,
    `jobCancelled`, `receiveMessage`).
  - `socket.on('sendMessage', ...)` and `socket.on('typing', ...)` accept arbitrary
    `senderId`/`receiverId` and emit straight to the target — bypassing the
    `hasInteraction` guard the REST layer enforces (`messageController.js:49`).
- **Exploitability:** userIds are public (see H7 — `getUserById`, `getWorkers`
  expose `_id`), so an attacker can harvest a target id then subscribe to their
  notification stream or inject fake message/typing events into their UI.
- **Fix direction:** authenticate the socket handshake (JWT via `auth` payload or
  the httpOnly cookie), and derive `senderId`/room membership from the verified
  identity — never from client-supplied fields.

### H2. Regex injection / ReDoS on public, unauthenticated search
- **Where:** `jobController.js:130` (`new RegExp(String(q).trim(), 'i')`) and
  `workerController.js:86-89` (`$regex: String(skill).trim()`).
- **What:** Raw user input is compiled into a RegExp with no escaping or length cap
  on the public `GET /api/jobs` and `GET /api/workers`. A crafted pattern (e.g.
  catastrophic backtracking) can pin CPU; special chars break/abuse the query.
- **Fix direction:** escape input (or `$text` / anchored safe match) + length limit.

### H3. Public PII exposure (email / phone / googleId)
- **Where:** `userController.js:36-55` `getUserById` is a **public** route
  (`userRoutes.js:42`) and returns everything except password/verification secrets —
  `sanitizeUserDoc` (`utils/sanitizeUser.js`) does **not** strip `email`, `phone`,
  or `googleId`. `getWorkerById` (`workerController.js:210`) and `getWorkers`
  (`workerController.js:93`) also populate `userId` with `email phone`, both public.
- **Effect:** Anyone unauthenticated can harvest worker/user email + phone +
  googleId in bulk. Restrict the public projection to name/photo/city.

### H4. JWT mirrored into `localStorage` and auto-attached as Bearer
- **Where:** `frontend/src/services/api.js:20-24`, `context/AuthContext.jsx:129-131,160-164,193-195`
- **What:** The backend already sets an httpOnly cookie (`generateToken.js:38-48`),
  but the client **also** stores the token in `localStorage` and injects
  `Authorization: Bearer`. `localStorage` is readable by any XSS, which defeats the
  httpOnly protection entirely.
- **Fix direction:** rely on the httpOnly cookie only; stop persisting the token
  client-side.

---

## Broken / mismatched APIs

### H5. `JobDetails` owner applicant panel is always empty
- **Where:** `JobDetails.jsx:136,310,318` read `job.applications`.
- **What:** `getJobById` returns only `applicationCount`, never an `applications`
  array (`jobController.js:257-263`). So `job.applications` is always `undefined`.
- **Effect:** On the job page an owner always sees "No applications yet"; the
  Book/Message buttons never render even when applicants exist. (Applicants only
  load via `/applications/job/:jobId`, used by MyJobs/HirerDashboard — which then
  can't action them; see C3.)

### H6. `JobForm` submits fields the backend silently drops (incl. a *required* one)
- **Where:** `JobForm.jsx:80-96` sends `requiredSkills` and `duration`.
- **What:** The `Job` model / `createJob` / `updateJob` don't persist
  `requiredSkills` or `duration` (`models/Job.js`, `jobController.js:74-84`).
  `duration` is a **required** form field (`JobForm.jsx:350`, counted in the
  completion meter) — the hirer is forced to fill it, then it's thrown away.
  `JobDetails.jsx:290,399` then render `job.requiredSkills` / `job.duration`, which
  never exist.
- **Effect:** Data entered by hirers is lost; editing a job can't round-trip these.

### H7. Entire `workerService` write path hits the wrong mount point (`/worker` vs `/workers`)
- **Where:** `workerService.js:47,57,69,81`
- **What:** Calls `/worker/profile`, `/worker/portfolio`, `/worker/availability`
  (singular). Backend mounts under `/api/workers` (`server.js:115`). → **404** for
  `createWorkerProfile`, `updateWorkerProfile`, `uploadPortfolio`, `updateAvailability`.
- **Extra bug:** `updateAvailability` sends `{ availability }`, but the backend
  expects `{ isAvailable: boolean }` (`workerController.js:381`).
- **Why it "works" anyway:** `WorkerAvailabilityForm.jsx:80-84` bypasses the service
  and hits `/api/workers/profile` via raw axios. Anything relying on `workerService`
  for writes is dead.

### H8. Review unique index breaks direct (no-job) reviews after the first one
- **Where:** `models/Review.js:39` — `index({ jobId: 1, reviewerId: 1 }, { unique: true, sparse: true })`
- **What:** A sparse compound index still indexes a document as long as **any** key
  is present. `reviewerId` is always present, so a direct review (`jobId: null`,
  created via `reviewController.js:106-112`) is indexed as `(null, reviewerId)` and
  subject to the unique constraint. → a hirer can leave **at most one** direct
  review *ever, across all workers*; the second throws E11000, surfaced as the
  misleading **409 "You have already reviewed this job."** (`reviewController.js:119-123`).
- **Fix direction:** make the unique index partial on `jobId` existing/non-null, or
  key direct reviews on `(revieweeId, reviewerId)` separately.

### H9. Several service methods point at non-existent routes (latent 404/400 landmines)
- `applicationService.getMyApplications` → `GET /applications/my` — real route is
  `/applications/mine` → **404** (dead; `MyApplications` uses `jobService` instead).
- `applicationService.applyForJob` → `POST /applications/job/:jobId` — no such route
  (apply is `POST /applications` with `jobId` in body) → **404**.
- `jobService.getJobApplications` → `GET /jobs/:id/applications` — no such route →
  **404** (duplicate of the working `applicationService.getJobApplications`).
- `messageService.markAsRead` → `PUT /messages/:id/read` — no such route → **404**.
- `messageService.getMessagingEligibility` → `GET /messages/eligibility/:userId` —
  collides with `GET /:conversationId`, resolves to "Invalid conversationId" → **400**.
- `reviewService.getReviewStats` → `GET /reviews/worker/:id/stats` — no such route → **404**.
- **Effect:** Any feature wired to these fails; they also mislead future development.

### H10. Orphaned backend route with divergent behavior
- **Where:** `jobRoutes.js:12-23` defines `GET /jobs/applications/my` with its own
  inline handler (`.populate('jobId')` only, different shape).
- **What:** No frontend calls it; it duplicates `applicationController.getMyApplications`
  with different population/shape. Dead + inconsistent.

---

## Note on grouping
H1–H4 are genuine security concerns (H1 is arguably critical — unauthenticated
real-time PII/notification leakage + event spoofing). H5–H10 are contract/route
defects scoped to specific surfaces or currently latent.
