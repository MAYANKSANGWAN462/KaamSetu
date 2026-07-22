# Known Issues

This document catalogs confirmed bugs, design gaps, and technical debt present in the current codebase.

---

## Critical Issues

### 1. In-Memory Pagination Does Not Scale

**Files**: `backend/controllers/jobController.js:137`, `backend/controllers/workerController.js:92`

**Problem**: Both `getJobs` and `getWorkers` fetch **all matching documents** from MongoDB into memory, apply post-processing (distance calculation, scoring), and then call JavaScript `.slice()` for pagination. For a database with thousands of workers or jobs, this will cause high memory usage and slow response times.

**Root cause**: Distance filtering requires Haversine math that MongoDB cannot perform without a `2dsphere` index and `$geoNear`. The current schema stores lat/lng as plain Numbers, not GeoJSON.

**Impact**: Performance degrades linearly with collection size. Not a problem today with a small dataset, but blocks production scaling.

**Suggested fix**: Add `2dsphere` index on `location` field (stored as GeoJSON Point), use `$geoNear` in an aggregation pipeline, then apply `.skip()/.limit()` at the DB layer.

---

### 2. Dead Code in `Search.jsx`

**File**: `frontend/src/pages/Search.jsx:1–861`

**Problem**: The entire previous version of the `Search` component (860 lines) is commented out at the top of the file. The active implementation begins at line 865. This makes the file ~1700 lines long, doubles memory footprint when the file is parsed, and confuses anyone reading the file.

**Impact**: Developer experience / readability. No runtime impact since the code is commented out.

**Fix**: Delete lines 1–862 (everything up to the `import React...` of the active version).

---

### 3. Cloudinary Images Not Deleted on Portfolio Removal

**File**: `backend/controllers/workerController.js:490–531`

**Problem**: `deletePortfolioImage` removes the URL from the `portfolio` array in MongoDB but does **not** call the Cloudinary SDK to delete the actual image file. The image remains stored on Cloudinary, consuming storage quota and potentially being accessible via the original URL.

**Fix**: Extract the Cloudinary `public_id` from the URL and call `cloudinary.uploader.destroy(public_id)` before updating the database.

---

### 4. Applicants Not Notified When Job is Cancelled

**File**: `backend/controllers/jobController.js:348–396`

**Problem**: When a hirer cancels a job (`DELETE /api/jobs/:id`), a socket event is emitted only to the hirer's own room. Workers who had applied to the job receive no notification and their application records remain with `status: "pending"` for a `cancelled` job.

**Impact**: Workers may not know a job they applied to has been cancelled. Their `MyApplications` page will show pending applications for cancelled jobs.

**Fix**: After cancellation, fetch all `pending` applications for the job and either update their status or emit a `jobCancelled` event to each worker's room.

---

## Significant Issues

### 5. Token Stored in `localStorage` (XSS Risk)

**File**: `frontend/src/context/AuthContext.jsx:129`

**Problem**: The JWT is stored in `localStorage` in addition to being set as an httpOnly cookie. `localStorage` is accessible to JavaScript and vulnerable to XSS attacks. If any script injection were possible, the token could be exfiltrated.

**Mitigation**: The backend also sets an httpOnly cookie. The Axios instance sends `withCredentials: true`. In principle, the `localStorage` token is redundant.

**Ideal fix**: Rely solely on the httpOnly cookie. Remove `localStorage` token storage. The cookie is already sent with every request.

---

### 6. No Geospatial Index on Location Fields

**Files**: `backend/models/WorkerProfile.js`, `backend/models/Job.js`

**Problem**: `location.lat` and `location.lng` are stored as plain `Number` fields with no index. MongoDB cannot use these fields for geospatial queries without a `2dsphere` index on a GeoJSON field.

**Impact**: No efficient "find workers within Xkm" query. Distance filtering happens after loading all records. Related to Issue #1.

---

### 7. Untracked Files Not Committed

**Files**: `frontend/src/components/common/NotificationBell.jsx`, `frontend/src/components/worker/WorkerAvailabilityForm.jsx`

**Problem**: These two new components exist in the working directory but have never been committed to git. If the repository is cloned fresh or changes are stashed/cleaned, these files will be lost.

**Fix**: Commit these files (after completing their implementation).

---

### 8. `WorkerDashboard.jsx` Modified but Not Committed

**File**: `frontend/src/pages/WorkerDashboard.jsx`

**Problem**: This file is modified in the working tree but not staged or committed. Its relationship with `WorkerSetup.jsx` (which currently handles the worker dashboard route) is unclear. The routing in `App.jsx` routes `/worker-dashboard` to `WorkerSetup`, not `WorkerDashboard`.

**Fix**: Decide whether `WorkerDashboard` replaces or supplements `WorkerSetup` and update routing accordingly. Commit the result.

---

### 9. i18n Translation Files Incomplete

**Files**: `frontend/src/translations/hi.js`, `bn.js`, `pa.js`, `ta.js`

**Problem**: Only `en.js` is confirmed complete. The other language files have not been audited for missing keys. Missing keys will silently fall back to the key string (e.g., `"auth.login"` instead of the translated text).

**Fix**: Audit all translation files against `en.js` as the source of truth and fill in missing keys.

---

### 10. Password Reset Flow Missing

**Problem**: There is no "Forgot Password" endpoint or UI. Users who forget their password and did not use Google OAuth cannot recover their account.

**Fix**: Implement `POST /api/auth/forgot-password` (sends reset email with time-limited token) and `POST /api/auth/reset-password` (validates token, sets new password).

---

## Minor Issues

### 11. `ModeSelectionModal` in Worker Dashboard Path

**Problem**: When a logged-in user with `activeMode: null` visits `/dashboard`, they should be prompted to select a mode. The flow for this prompt (via `ModeSelectionModal`) may not redirect correctly based on the selected mode if the Dashboard component does not re-evaluate routing after mode selection.

---

### 12. HirerDashboard Silently Swallows Errors

**File**: `frontend/src/pages/HirerDashboard.jsx:82–100` (applicant loading), lines with `catch { /* silent */ }`

**Problem**: Several `try/catch` blocks in `HirerDashboard` catch errors silently (no toast, no log). If applicant loading or accept/reject calls fail, the user gets no feedback.

**Fix**: At minimum, log to console in catch blocks. Ideally show a toast or inline error.

---

### 13. `WorkerCard.jsx` Modified — Unknown Diff

**File**: `frontend/src/components/worker/WorkerCard.jsx`

**Status**: Modified in the working tree. The nature of the change is unknown without reviewing the diff. This should be reviewed before the next commit to ensure the card renders correctly in both the Search and HirerDashboard contexts.

---

### 14. Double Rate Limiter on Login Route

**File**: `backend/server.js:110`

**Problem**: `app.use('/api/auth/login', authLimiter)` is applied in `server.js`, and a separate `loginLimiter` is also applied in `authRoutes.js` on `router.post('/login', loginLimiter, ...)`. The request goes through two separate rate limiters. In practice this means the effective limit is whichever is more restrictive, but the duplication is confusing and could lead to unexpected behaviour.

**Fix**: Remove the global rate limiter application from `server.js` for the login route and rely only on the per-route limiter in `authRoutes.js`.
