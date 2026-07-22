# 🔴 CRITICAL — App-breaking / data-loss / serious security

These break primary user flows or expose the system. Fix first.
Re-verified against the current working tree (the phase-5 modified files). The
in-code `// FIX:` comments in `Chat.jsx` / `JobDetails.jsx` do **not** actually
fix these — the API contract is still mismatched.

---

### C1. Sending a chat message is 100% broken (`message` vs `content`)
- **Where:** `frontend/src/services/messageService.js:37-44` → `frontend/src/pages/Chat.jsx:136`
- **What:** `sendMessage(receiverId, message)` POSTs `{ receiverId, message }`.
  Backend `sendMessage` reads `const { receiverId, content } = req.body`
  (`backend/controllers/messageController.js:26`) and rejects empty `content`.
- **Effect:** Every send returns **400 "receiverId and content are required"**.
  The optimistic bubble is rolled back (`Chat.jsx:139-141`) and nothing is ever
  persisted. Messaging — a core marketplace feature — does not work at all.

### C2. Chat history never loads (userId passed where conversationId required)
- **Where:** `Chat.jsx:109` → `messageService.getMessages(otherUserId)` → `GET /messages/:otherUserId`
- **What:** Backend `getConversation` splits the param on `_` and requires exactly
  2 parts (`messageController.js:104-110`). A bare user ObjectId has no `_` →
  `parts.length !== 2` → **400 "Invalid conversationId format"**.
- **Effect:** Opening any chat shows an empty thread forever. The route expects
  the `id1_id2` conversationId, not a single userId. The `// FIX: pass otherUserId`
  comment is wrong — it reintroduced the bug.

### C3. Accept / Reject / Book applicant is broken on 3 of 4 surfaces (`PATCH /:id` 404)
- **Where:** `applicationService.updateApplication` → `PATCH /applications/:id`
  (`applicationService.js:32-41`), called by:
  - `MyJobs.jsx:87,97`
  - `HirerDashboard.jsx:85,97`
- **What:** `applicationRoutes.js` only defines `PUT /:id` and `PUT /:id/status`.
  There is **no `PATCH /:id`** → **404**.
- **Effect:** From My Jobs and the Hirer Dashboard, Accept/Reject fail. In
  `HirerDashboard` the errors are swallowed by empty `catch {}` (silent no-op);
  in `MyJobs` a toast fires but the action never lands.
- **Inconsistency:** `JobDetails.jsx:117` uses `jobService.acceptApplication` →
  `PUT /applications/:id/status` (the one path that works) — but it lives inside
  the always-empty `job.applications` panel (see HIGH H2), so it never runs either.
  Net result: **there is no working Accept/Reject surface in the app.**

---

## Why these are grouped as Critical
Messaging and applicant acceptance are the two core two-sided-marketplace loops.
All three fail at the API-contract level (field name / route shape / HTTP verb),
so they fail 100% of the time. Several callers hide the failure behind empty
`catch {}` blocks, so they present as "nothing happens" rather than as errors.
