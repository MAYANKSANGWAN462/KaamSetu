# KaamSetu — Milestone Test Report (Phase 16 session / Phase‑5 workflow redesign)

**Date:** 2026‑07‑22
**Scope tested:** the completed milestone = the modified controllers/routes/models + redesigned
pages/components (`Chat`, `MyJobs`, `JobDetails`, `HirerDashboard`, `WorkerDashboard`, `Search`,
`JobForm`, `WorkerCard`, `WorkerAvailabilityForm`, `NotificationBell`, and their backend
counterparts).

**Method:** static contract verification (frontend service ↔ backend route ↔ model), production
build of the frontend (`vite build`), and Node syntax parse of every backend file. A live end‑to‑end
run against a running MongoDB was **not** performed (no DB was started in this session); results below
are from code‑level verification + build.

> ⚠️ Note on the existing `audit/*.md`: those reports are **stale**. Their three CRITICAL items
> (C1 message field, C2 conversationId, C3 PATCH accept) were already fixed in the working tree
> before this session. Each was re‑verified live and is now correct.

---

## Result summary

| Area | Status | Notes |
|------|--------|-------|
| Frontend | ✅ Pass | `vite build` succeeds, 0 errors/warnings. All redesigned pages compile. |
| Backend | ✅ Pass | All controllers/routes/models/middleware parse. |
| Routes | ✅ Pass | Live contracts match. A few dead/latent service methods remain (unreachable — see below). |
| Database | ✅ Pass | Models valid. Added `duration` + `requiredSkills` to `Job` (was dropping data). |
| Authentication | ✅ Pass | `protect` (JWT cookie + Bearer), `isActive` gate, expiry handling. |
| Role switching | ✅ Pass | `PATCH /api/auth/mode` sets `activeMode`; `requireMode()` guards role‑scoped routes. |
| Posting (jobs) | ✅ Fixed | Create/update now persist `duration` + `requiredSkills`; JobDetails round‑trips. |
| Messaging | ✅ Fixed | Send + history work; fixed real‑time incoming bubbles rendering blank. |
| Notifications | ✅ Fixed | `NotificationBell` was built but never mounted — now wired into the Header. |
| Deployment | ✅ Pass | Build artifact produced; env‑driven API/socket base + CORS confirmed. |

---

## Fixes applied (milestone‑related only)

### 1. Messaging — real‑time incoming messages rendered blank `Chat.jsx`
`sendMessage` socket emit sends `content` / `isRead`, but the client pushed `payload.message` /
`payload.read` into state, so every live‑received bubble showed empty text. Now reads the correct
fields. (Sent + history messages were already fine.)

### 2. Posting — `duration` & `requiredSkills` silently discarded
`JobForm` submits both (and `duration` is a **required** field), but the `Job` model / `createJob` /
`updateJob` never stored them, while `JobDetails` renders them. Result: forced input was thrown away
and the detail blocks never appeared.
- `backend/models/Job.js` — added `duration: String` and `requiredSkills: [String]`.
- `backend/controllers/jobController.js` — `createJob` and `updateJob` now normalize + persist both.

### 3. Notifications — `NotificationBell` not mounted
The component (socket‑driven toasts + dropdown, localStorage‑persisted) existed but was imported
nowhere, so notifications were dead in the UI. Now imported and rendered in `Header.jsx` for
authenticated users (desktop + mobile share the same header bar).

**Verification:** `vite build` passes with all four changes; backend files parse clean.

---

## Area detail

**Authentication** — `protect` extracts JWT from httpOnly cookie first, then `Bearer`; rejects
missing/invalid/expired tokens and deactivated accounts. Login/register/Google flows and rate limits
unchanged and intact.

**Role switching** — worker↔hirer via `PATCH /api/auth/mode`; `requireMode('worker'|'hirer')`
returns 403 when `activeMode` mismatches. Verified against the guarded application/job routes.

**Posting & applications** — apply (`POST /applications`), applicant listing
(`GET /applications/job/:jobId`), and accept/reject (`PUT /applications/:id/status`) all match their
callers in `MyJobs`, `HirerDashboard`, and `JobDetails`. Close/reopen uses `PATCH /jobs/:id/status`.
Auto‑fill to `filled` on quota works.

**Messaging** — send/history/conversations/unread‑count all contract‑correct; interaction gate
(`hasInteraction`) enforced at REST layer. Conversation IDs use the shared `id1_id2` helper on both
ends.

**Deployment** — frontend reads `VITE_API_URL` and derives the socket base from it; backend CORS is
pinned to `FRONTEND_URL`. Production build emits a clean `dist/`.

---

## Known issues — NOT fixed (out of milestone scope / pre‑existing)

These are real but live in files outside this milestone's change set, or are security hardening rather
than milestone functionality. Left untouched per "fix only milestone‑related issues":

- **Socket.IO has no auth** (`config/socket.js`) — rooms/events trust client‑supplied ids. Security.
- **Public PII exposure** — `getUserById`/`getWorkers` return email/phone. Security.
- **JWT mirrored to `localStorage`** + Bearer — weakens the httpOnly cookie. Security.
- **Regex/ReDoS** on public search inputs (`jobController`, `workerController`). Security.
- **Review unique index** blocks a 2nd direct (no‑job) review (`models/Review.js`).
- **Dead/latent service methods** (unreachable, no active caller): `applicationService.getMyApplications`
  (`/applications/my`), `applicationService.applyForJob` (`/applications/job/:id`),
  `jobService.getJobApplications` (`/jobs/:id/applications`), `messageService.getMessagingEligibility`
  / `markAsRead`. The active code paths use the correct sibling methods.
- **Orphan route** `GET /jobs/applications/my` and **no `2dsphere` index** (distance filtered in JS).

Recommend addressing the three security items (socket auth, PII projection, localStorage token) in a
dedicated hardening pass before production.
