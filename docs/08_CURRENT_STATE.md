# Current State

This document describes what is implemented and working as of the Phase 2 codebase (July 2026).

---

## Implemented and Functional

### Authentication
- Email/password registration with bcrypt hashing (salt rounds: 12)
- Email verification flow (nodemailer; auto-bypassed in development)
- Email/password login
- Google OAuth login via `@react-oauth/google` (frontend) and `google-auth-library` (backend)
- JWT issued as both Bearer token and httpOnly cookie
- Session restoration from `localStorage` on page load
- Mode switching (`worker` ↔ `hirer`) with optimistic UI update
- Password change endpoint with current-password verification
- Account deactivation guard (deactivated accounts cannot log in)
- Rate limiting on login (5/15min), register (3/hour), Google (20/15min)

### Worker Profiles
- Full CRUD via upsert POST/PUT `/api/workers/profile`
- Category + subcategory from platform-defined list
- Skills array (multi-select, up to 30 tags)
- Bio, years of experience, wage (amount + unit)
- Availability: days of week (Mon–Sun) + free-text note
- Location (coordinates + address)
- Portfolio image upload to Cloudinary (max 5 images, graceful fallback to placeholder)
- Portfolio image deletion
- `isAvailable` toggle
- Worker profile appears in public search with distance + smart score

### Job Postings
- Create, read, update, (soft) delete
- Category validation against master list
- Wage, workersRequired, location, startDate fields
- Status management: open → filled (auto) / cancelled (manual)
- Application count visible on job detail
- Hirer's job list with per-job application counts

### Applications
- Worker applies to job (prevents duplicate, self-apply, closed job)
- Hirer accepts/rejects with socket notification to worker
- Auto-fill: job status becomes `filled` when accepted count = `workersRequired`
- Hirer can initiate direct contact with a worker (no job required)
- Interaction check endpoint for frontend button visibility logic

### Messaging
- Gated behind interaction (Application record required)
- Real-time message delivery via Socket.IO
- Read receipts (messages marked read when receiver fetches conversation)
- Unread count endpoint for notification badge
- Typing indicator (socket-level only)
- Conversation list with last message preview and unread counts
- Message deletion (sender or receiver)

### Reviews
- Hirer submits review for worker after job is filled
- Direct review (no job) if interaction exists
- Duplicate review prevention per job
- Automatic rating recalculation on WorkerProfile after create/update/delete
- Paginated review list with rating breakdown (per star count) and average

### Search and Discovery
- Mode-aware search: worker mode → browse jobs; hirer mode → browse workers
- Keyword search (regex on title + description for jobs)
- Category and skill filters
- Distance-based filtering with radius (Haversine formula)
- Smart composite ranking (40% distance, 25% wage, 25% rating, 10% recency)
- Wage range filter
- Minimum rating filter (workers only)
- Availability filter (workers only)
- Sort options: distance / wage / rating / recent
- Pagination (server-side for workers/jobs; client-side "Load More")
- URL sync for keyword, category, sort params
- Browser geolocation for distance calculation

### Real-time (Socket.IO)
- User joins personal room on connect
- Conversation rooms for live chat
- Events: newApplication, applicationStatusUpdate, hirerContact, jobCancelled, receiveMessage, messageRead, userTyping, userOnline/Offline

### Frontend
- All listed pages rendered and routed
- Protected route guards
- Dark/light theme with persistence
- Multi-language support (EN, HI, BN, PA, TA) via i18next
- Responsive design (mobile + desktop)
- Framer Motion page transitions and card animations
- Custom cursor (desktop)
- Skeleton loading states
- Toast notifications
- Error boundary

### Security
- Helmet HTTP headers
- CORS restricted to `FRONTEND_URL`
- General rate limit: 100 req / 15 min
- JWT expiry (configurable, default 30 days)
- httpOnly cookie in production
- `isActive` account gate
- Ownership checks on all mutation endpoints
- Mode checks on role-sensitive endpoints

---

## In Progress / Partially Implemented

### WorkerDashboard (`WorkerDashboard.jsx`)
The file exists in `src/pages/` but is untracked in git (marked `??` in git status). It has not been committed. Its integration into the routing is present via `WorkerSetup.jsx` aliasing but the dedicated `WorkerDashboard` page is not yet finalised.

### WorkerAvailabilityForm (`WorkerAvailabilityForm.jsx`)
Also untracked in git. A standalone component for the availability form, likely extracted from `WorkerSetup.jsx` for reuse. Not yet integrated.

### NotificationBell (`NotificationBell.jsx`)
Also untracked. A UI component for showing unread notification count. Not yet wired into the Header or a real notification data source.

### Search.jsx — Dead Code
The first ~860 lines of `Search.jsx` are the entire previous version of the component, commented out. The active implementation starts at line 865. The commented block needs to be removed.

---

## Not Yet Implemented

### Worker-to-Hirer Reviews
The review model only supports hirer-reviewing-worker. Workers cannot currently leave reviews for hirers.

### Push Notifications
There is no push notification system. The `NotificationBell` component exists in the file system but has not been integrated. In-app notifications are real-time socket events only.

### Forgot Password / Password Reset
No forgot-password email or reset-token flow exists. The `changePassword` endpoint requires the current password.

### Admin Panel Features
`ManageJobs` and `ManageUsers` pages exist in `src/pages/admin/` but are minimally implemented placeholders. The admin API layer (bulk user management, platform stats) is not built.

### Job Cancellation Refund / Notification to Applicants
When a job is cancelled, applicants are not notified. Only the hirer receives a socket event.

### Geospatial Index
Worker and job locations are stored as flat lat/lng fields. Distance filtering is done in JavaScript (post-fetch). A MongoDB `2dsphere` index has not been added, which means all workers/jobs are loaded into memory before filtering. This will not scale well.

### Pagination — Workers and Jobs (Backend)
The backend fetches all matching documents and then paginates in JavaScript (`.slice()`). For large datasets this is inefficient. Database-level pagination via `.skip()/.limit()` on the initial query has not been implemented.

### Image Deletion from Cloudinary
When a portfolio image is removed from the `portfolio` array, the image is not deleted from Cloudinary storage. The URL is removed from the database, but the file remains on the CDN.

### Translation Coverage
The translation files (`hi.js`, `bn.js`, `pa.js`, `ta.js`) have not been verified for completeness. Many keys may fall back to English.

---

## Git Status Summary

As of the last commit:

- **Modified but uncommitted**: `applicationController.js`, `jobController.js`, `workerController.js`, `WorkerProfile.js`, `applicationRoutes.js`, `jobRoutes.js`, `JobForm.jsx`, `WorkerCard.jsx`, `Chat.jsx`, `HirerDashboard.jsx`, `JobDetails.jsx`, `MyJobs.jsx`, `Search.jsx`, `WorkerDashboard.jsx`, `jobService.js`
- **Untracked (new, not committed)**: `NotificationBell.jsx`, `WorkerAvailabilityForm.jsx`
- **Deleted**: `playground-1.mongodb.js`, `tempCodeRunnerFile.js`

All changes are staged in the working tree. Nothing has been pushed since the initial commit series.
