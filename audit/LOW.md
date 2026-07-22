# 🟢 LOW — Dead code, cleanup, minor UX / correctness nits

Safe to defer; addressing them reduces noise and future confusion.

---

## Dead / unused code

### L1. `Search.jsx` carries ~874 lines of commented-out old implementation
- `frontend/src/pages/Search.jsx` is 1386 lines; lines **1–874 are an entire old
  version commented out**. The real component's imports restart at line 875. Delete
  the corpse.

### L2. `NotificationBell` is fully built but never rendered
- `components/common/NotificationBell.jsx` (288 lines) is imported **nowhere**
  (verified: no import outside its own file; `Header.jsx` does not use it). Dead
  until wired in. (See also L8 — even if mounted, some of its listeners don't match
  what the backend emits.)

### L3. Admin `ManageJobs` / `ManageUsers` pages are unrouted and unimported
- `pages/admin/ManageJobs.jsx` and `pages/admin/ManageUsers.jsx` are referenced
  only by themselves — never imported or routed (`App.jsx` only wires
  `/admin` → `AdminDashboard`). Dead pages.

### L4. Unused / broken custom hooks
- `hooks/useSocket.js` is imported nowhere **and** is broken: it does
  `import { useAuth } from './useAuth'` (named) but `useAuth.js` is a **default**
  export → `useAuth` is `undefined` at runtime.
- `hooks/useAuth.js`, `hooks/useTheme.js`, `hooks/useTranslation.js`,
  `hooks/useLocalStorage.js` are all unused (components import `useAuth`/`useTheme`
  from their contexts directly). Only `useGeolocation` is actually used.

### L5. Unused backend exports
- `middleware/authMiddleware.js` exports `optionalAuth` — referenced nowhere.
- `utils/helpers.js` exports `calculateAge`, `generateOTP`, `formatResponse`,
  `paginate`, `sanitizeInput`, `formatIndianCurrency`, `validateIndianPhone` — none
  are used by controllers (no DOB/OTP features exist). Dead surface.

### L6. Commented-out blocks left in source
- `services/jobService.js:1-36` (old commented service), `routes/userRoutes.js:1-24`
  (old commented router), `authService.js:21-22` (commented alt register path).

### L7. `Message.getConversation` ignores its first two params
- `models/Message.js:41-47` signature is `(_userId, _peerId, conversationId, …)` but
  only uses `conversationId`; `messageController.js:124-130` still passes all four.
  Vestigial args.

---

## Minor bugs / UX / correctness

### L8. NotificationBell listens for events the backend never sends (as coded)
- `newApplication` handler reads `payload.workerName` (`NotificationBell.jsx:83`),
  but the backend emits only `workerId`/`jobTitle` (no `workerName`)
  (`applicationController.js:66-72`) → always shows the generic "A worker".
- It also registers a `newMessage` icon/type, but the backend never emits a
  user-targeted message notification — `sendMessage` emits `receiveMessage` to the
  **conversation** room only (`messageController.js:76-84`). So the bell would never
  notify about messages even if it were mounted.

### L9. `MyJobs.jsx:260` builds a conversationId from a non-existent key
- Uses `localStorage.getItem('userId')` — that key is never set (only `user` and
  `token` exist). The resulting `convId` is dead (the working one is recomputed at
  `:298` from `user._id`), but it's misleading.

### L10. `Messages.jsx` reads `conv.userId` but backend returns `otherUserId`
- `Messages.jsx:134-136` reference `conv.userId` (undefined); it falls back to
  `conv.conversationId`, so it works today but is fragile
  (`messageController.js:208-215` returns `otherUserId`, not `userId`).

### L11. `/chat/:userId` route is latently broken (param name mismatch)
- `App.jsx:179` defines `/chat/:userId`, but `Chat.jsx:37` reads
  `const { conversationId } = useParams()` → `undefined` on that route → renders
  "Invalid conversation". Nothing currently links to `/chat/:userId` (all nav uses
  `/messages/:conversationId`), so it's dormant — but it's a broken route.

### L12. `PostJob` / `/post-job` is not mode-guarded
- Route is only `ProtectedRoute` (`App.jsx:114-121`); a user in worker mode can open
  the form and only discovers the failure as a **403** on submit (`createJob`
  requires hirer mode).

### L13. PII written to console on every auth call
- `authService.js:17-19,38-40` log email/phone on register/login;
  `AuthContext`/controllers also `console.log` response payloads. Remove before prod.

### L14. Diagnostic endpoint enumerates the API
- `GET /api/test` (`server.js:89-105`) advertises the route list; harmless but
  unnecessary in production.

### L15. Suspicious dependency versions
- `backend/package.json` pins `nodemailer: ^8.0.4` (no such major exists; nodemailer
  is 6.x) and the root `package.json` pins `mongodb: ^7.1.0` (npm `mongodb` is 6.x).
  Both look like typos that would fail a clean install / resolve unexpectedly.

---

## Housekeeping already in progress (from git status)
- `playground-1.mongodb.js` and `tempCodeRunnerFile.js` are staged for deletion —
  good (`tempCodeRunnerFile.js` is also gitignored).
- `frontend/dist/` is untracked (correct).
- `.env` files exist on disk but are correctly gitignored and untracked (no secret
  leakage in the repo).
