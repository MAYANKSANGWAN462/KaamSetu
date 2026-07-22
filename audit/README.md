# KaamSetu — Repository Audit (Phase 5)

Read-only audit of the full stack. **No code was changed.** Every finding was
re-verified against the current working tree (including the phase-5 modified/new
files). Findings are split by priority:

| Report | Focus | Count |
|--------|-------|-------|
| [CRITICAL.md](./CRITICAL.md) | App-breaking core flows | 3 |
| [HIGH.md](./HIGH.md) | Security exposure + broken endpoints | 10 |
| [MEDIUM.md](./MEDIUM.md) | Performance, validation, duplication, inconsistency | 15 |
| [LOW.md](./LOW.md) | Dead code, cleanup, minor UX/correctness nits | 15 |

## Headline
The three most damaging issues are all **frontend↔backend API-contract mismatches**
that break the marketplace's core loops, and they are *still live* despite in-code
`// FIX:` comments claiming otherwise:
1. **Sending a chat message** — client posts `message`, backend reads `content` → 400.
2. **Loading chat history** — client passes a userId where a `id1_id2` conversationId
   is required → 400.
3. **Accepting/rejecting applicants** — every hirer surface calls `PATCH
   /applications/:id`, which doesn't exist → 404. There is no working accept path.

Several of these fail silently behind empty `catch {}` blocks, so they present as
"nothing happens" rather than as errors.

The most serious *security* item is **H1: the Socket.io layer has no
authentication** — any client can join any user's room (leaking their real-time
notifications) and spoof message/typing events, using the userIds that public
endpoints already expose (H3).

## Cross-cutting themes
- **Contract drift:** services, routes, and models disagree on field names, HTTP
  verbs, mount points, and payload shapes (C1–C3, H6–H10, M11).
- **Decorative safety:** express-validator chains that never run (M4), rate limiters
  stacked 3-deep (M13), a sanitizer that doesn't strip PII (H3).
- **Dead weight:** ~874 commented lines in `Search.jsx`, unused hooks/pages/components
  and helper exports (L1–L7).

## Scope covered
Backend: server, config (db/socket/cloudinary), models, controllers, routes,
middleware, utils, constants. Frontend: app/routes, services, contexts, hooks,
pages, and the phase-5 modified/new components (`Chat`, `MyJobs`, `JobDetails`,
`HirerDashboard`, `WorkerDashboard`, `Search`, `JobForm`, `WorkerCard`,
`WorkerAvailabilityForm`, `NotificationBell`).
