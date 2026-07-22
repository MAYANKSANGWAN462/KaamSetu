# 🟡 MEDIUM — Performance, duplication, inconsistency, missing validation

Not immediately breaking, but they degrade scale, correctness, and maintainability.

---

## Performance

### M1. List endpoints load whole collections into memory
- **Where:** `getJobs` (`jobController.js:137-140`) and `getWorkers`
  (`workerController.js:92-94`) do `.find(query).lean()` with **no DB limit**, then
  filter/score/sort/paginate in JS.
- **Effect:** Every jobs/workers request scans and materializes the full collection;
  memory + latency grow linearly with data. Pagination is cosmetic (applied after
  fetching everything).

### M2. No geospatial index; Haversine computed in JS per-document per-request
- **Where:** `workerController.js:112-121`, `jobController.js:153-172`.
- **What:** Location is a plain `{lat,lng}` subdoc (`models/Job.js`,
  `models/WorkerProfile.js`) — no `2dsphere` index, so distance can't be pushed to
  Mongo and radius filtering runs in JS after loading everything (compounds M1).

### M3. N+1 query patterns
- **Where:** `getMyJobs` runs one `countDocuments` per job
  (`jobController.js:231-236`); `getJobApplicants` runs one `WorkerProfile.findOne`
  per applicant (`applicationController.js:217-226`).
- **Effect:** Query count scales with result size instead of being constant.

---

## Missing / dead validation

### M4. express-validator chains are attached but never enforced
- **Where:** `authRoutes.js:47-65,84-86` attach `registerValidation` / `loginValidation`
  as middleware, but no handler ever calls `validationResult(req)`.
- **Effect:** The declared rules (email format, 10-digit phone, min password length)
  are **decorative** — they never reject anything. Validation only happens via each
  controller's own ad-hoc checks, so the express-validator layer is dead and
  misleading. Either wire a `validationResult` handler or remove the chains.

### M5. `updateReview` doesn't validate the rating range at the controller
- **Where:** `reviewController.js:199` sets `review.rating = Number(req.body.rating)`
  with no 1–5 / integer check (unlike `createReview`). An out-of-range value relies
  on the schema validator throwing, which is caught and returned as a generic
  **500** rather than a 400. Inconsistent + poor error surface.

---

## Duplication

### M6. Two frontend config modules with divergent values
- `frontend/src/config.js` (`apiUrl` = `…:5000`, **no** `/api`) vs
  `frontend/src/config/index.js` (`apiUrl` = `…:5000/api`, plus `socketUrl`, langs).
  Only `config.js` is imported (`Header.jsx:5`). `config/index.js` is unused and
  would produce a wrong base URL if adopted. Collapse to one.

### M7. Three different "accept application" code paths
- `jobService.acceptApplication` (`PUT /:id/status`, works),
  `applicationService.updateApplication` (`PATCH /:id`, 404 — see C3), plus the
  `JobDetails` "Book" flow. Consolidate to one service method.

### M8. `RatingStars` reimplemented inline instead of using the shared component
- Shared component exists at `components/reviews/RatingStars.jsx`, yet
  `WorkerCard.jsx:9`, `WorkerDashboard.jsx:46` each define their own copy.

### M9. `conversationId` built inline in ≥5 places
- `utils/conversationId.js` exports `makeConversationId`, but `WorkerDashboard.jsx:369`,
  `HirerDashboard.jsx:217`, `JobDetails.jsx:143`, `MyJobs.jsx:260,298`,
  `Messages.jsx:135`, `WorkerCard.jsx:65` all hand-roll `[a,b].sort().join('_')`.
  One source of truth would prevent drift (and would have caught L4).

### M10. Raw `axios` used instead of the configured `api` instance
- `WorkerAvailabilityForm.jsx:80`, `WorkerCard.jsx:60`, `MyJobs.jsx:58`,
  `WorkerDashboard.jsx:88`, `HirerDashboard.jsx:314` bypass `services/api.js`,
  re-reading the `localStorage` token manually and skipping the shared interceptors
  (401 handling, base URL, credentials). Inconsistent error handling + auth.

---

## Inconsistency

### M11. Category / skill / wage-unit taxonomies disagree across the stack
- Backend `constants/categories.js` has the full tree (Mason, Plumber, Painter,
  Carpenter, Welder, …). `frontend/utils/constants.js` `JOB_CATEGORY_GROUPS`
  exposes only a tiny subset (3 Construction, 2 Agriculture, 2 Household, 2
  Technical, 1 Other) → hirers/workers literally cannot pick most valid categories.
- `SKILL_LIST` is defined ≥3× with different contents (`utils/constants.js:63`,
  `WorkerAvailabilityForm.jsx:13`, `JobForm.jsx:421`, backend `SKILL_LIST`).
- `WAGE_UNITS` in `utils/constants.js:74` uses `'per job'`, but the backend enum is
  `'job'` (`models/Job.js:17`) → a "per job" value would be coerced to `daily`
  (`jobController.js:33`). (The forms happen to send `'job'`, so this bites anything
  that consumes `WAGE_UNITS`.)

### M12. Google-login route guard allows a path the controller rejects
- `authRoutes.js:74-81` `googleBodyGuard` accepts either `credential` **or**
  `email + googleId`. But `googleLogin` (`authController.js:247-254`) hard-requires
  `credential` and returns **400** otherwise. The `email + googleId` path passes the
  guard then dies in the controller — dead/contradictory contract.

### M13. Stacked/redundant rate limiters on the same paths
- `server.js:110-111` applies `authLimiter`/`registerLimiter` to
  `/api/auth/login|register`, **and** `authRoutes.js:84-85` applies its own
  `loginLimiter`/`registerLimiter`, **and** `generalLimiter` runs globally
  (`server.js:68`). Three overlapping layers with different thresholds on the same
  routes → hard to reason about lockouts.

### M14. Stray root-level Node project with unrelated deps
- Repo root `package.json` declares `mongodb`, `bcryptjs`, `google-auth-library`
  (plus a root `package-lock.json`/`node_modules`) — unrelated to the real backend,
  which has its own. Wrong placement / dependency confusion.

### M15. `HirerDashboard` "Contact" button doesn't contact
- `HirerDashboard.jsx:650-656` "Contact" navigates to `/worker/:id` (profile), not
  the contact/DM flow that `WorkerCard.handleContact` implements (`POST
  /applications/contact` → chat). Inconsistent affordance for the same label.
