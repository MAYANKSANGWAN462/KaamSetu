# API Documentation

**Base URL**: `http://localhost:5000/api` (development)  
**Authentication**: JWT via `Authorization: Bearer <token>` header **or** `kaamsetu_token` httpOnly cookie.  
**Response format**: All responses follow `{ success: boolean, message?: string, data?: any }`.

---

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | Returns `{ success: true, message: "KaamSetu API is running" }` |
| GET | `/health` | — | Returns status + timestamp |
| GET | `/api/test` | — | Lists available endpoints |

---

## Authentication — `/api/auth`

Rate limits (production): Login 5/15min, Register 3/hour, Google 20/15min.

### POST `/api/auth/register`

Creates a new user account.

**Body**:
```json
{
  "name": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "password": "SecurePass1!",
  "phone": "9876543210",
  "location": { "city": "Delhi", "area": "Dwarka", "lat": 28.58, "lng": 77.04 }
}
```

**Response `201`**:
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "token": "<jwt>",
  "data": { "_id": "...", "name": "Ramesh Kumar", "email": "...", "activeMode": null }
}
```

**Notes**: In `NODE_ENV=development`, email verification is skipped and the account is immediately verified.

---

### POST `/api/auth/login`

**Body**: `{ "email": "...", "password": "..." }`

**Response `200`**: Same shape as register. Sets `kaamsetu_token` cookie.

**Errors**: `401` for invalid credentials, `403` for unverified email (production), `401` for deactivated account.

---

### POST `/api/auth/google`

**Body**: `{ "credential": "<Google ID Token>" }`  
**Alternative body**: `{ "email": "...", "googleId": "..." }` (legacy).

Creates account if email doesn't exist; links Google ID if email matches an existing account.

---

### GET `/api/auth/verify-email`

**Query**: `?token=<hex-token>`

Verifies email address. Token expires after 24 hours.

---

### POST `/api/auth/logout`

Clears the `kaamsetu_token` cookie.

---

### GET `/api/auth/me` _(protected)_

Returns the authenticated user's profile.

---

### PUT `/api/auth/profile` _(protected)_

Update name, phone, location, profilePhoto. Email and role are not updatable here.

**Body**: `{ "name": "...", "phone": "...", "location": {...}, "profilePhoto": "<url>" }`

---

### PATCH `/api/auth/mode` _(protected)_

Switch the user's active mode.

**Body**: `{ "mode": "worker" }` or `{ "mode": "hirer" }`

---

### PUT `/api/auth/change-password` _(protected)_

**Body**: `{ "currentPassword": "...", "newPassword": "..." }`

---

## Workers — `/api/workers`

### GET `/api/workers`

List and search worker profiles. Publicly accessible.

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string | Filter by category slug |
| `skill` | string | Regex match against skills array |
| `isAvailable` | boolean | `true` or `false` |
| `minRating` | number | Minimum average rating (0–5) |
| `minWage` | number | Minimum wage amount |
| `maxWage` | number | Maximum wage amount |
| `lat` | number | Searcher's latitude |
| `lng` | number | Searcher's longitude |
| `radiusKm` | number | Search radius (default: 50, max: 200) |
| `sort` | string | `distance` \| `wage` \| `rating` \| `recent` |
| `page` | number | Default: 1 |
| `limit` | number | Default: 10, max: 50 |

**Response**: `{ data: { workers: [...], pagination: { page, limit, total, totalPages } } }`

Each worker object includes `distanceKm` and `smartScore` enrichment fields.

---

### GET `/api/workers/:id`

Get a single worker profile by user ID. Includes last 10 reviews and rating breakdown by star.

---

### GET `/api/workers/profile/me` _(protected)_

Returns the authenticated user's own worker profile.

---

### POST `/api/workers/profile` _(protected, worker mode)_

Create or update a worker profile (upsert behaviour).

**Body**:
```json
{
  "category": "Construction",
  "subCategory": "Mason",
  "skills": ["bricklaying", "plastering"],
  "bio": "10 years experience in residential construction",
  "yearsOfExperience": 10,
  "wage": { "amount": 800, "unit": "daily" },
  "availabilityDays": ["Monday", "Tuesday", "Wednesday"],
  "availabilityNote": "Available after 8am",
  "location": { "address": "Rohini, Delhi", "lat": 28.73, "lng": 77.07 }
}
```

---

### PUT `/api/workers/profile` _(protected, worker mode)_

Alias for POST profile (same upsert behaviour).

---

### PATCH `/api/workers/availability` _(protected, worker mode)_

Toggle availability status.

**Body**: `{ "isAvailable": true }`

---

### POST `/api/workers/portfolio` _(protected, worker mode)_

Upload portfolio images (max 5 total). Accepts `multipart/form-data` with field `images`.

---

### DELETE `/api/workers/portfolio` _(protected, worker mode)_

Remove a portfolio image.

**Body**: `{ "url": "<cloudinary-url>" }` or query `?url=<url>`

---

## Jobs — `/api/jobs`

### GET `/api/jobs`

List open jobs with filtering, sorting, distance ranking. Publicly accessible.

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Keyword search (title + description, regex) |
| `category` | string | Filter by category |
| `status` | string | Default: `open`; use `all` to include all statuses |
| `lat` / `lng` | number | Searcher coordinates |
| `radiusKm` | number | Default: 50, max: 200 |
| `minWage` | number | |
| `maxWage` | number | |
| `sort` | string | `distance` \| `wage` \| `rating` \| `recent` |
| `page` | number | Default: 1 |
| `limit` | number | Default: 10, max: 50 |

---

### POST `/api/jobs` _(protected, hirer mode)_

Create a job posting.

**Body**:
```json
{
  "title": "Need 3 masons for house construction",
  "category": "Construction",
  "description": "3-day work in Rohini sector 15",
  "wage": { "amount": 900, "unit": "daily" },
  "workersRequired": 3,
  "location": { "address": "Rohini Sector 15, Delhi", "lat": 28.73, "lng": 77.05 },
  "startDate": "2026-08-01"
}
```

**Response `201`**: Full job document.

---

### GET `/api/jobs/mine` _(protected, hirer mode)_

Returns the authenticated hirer's job postings, each enriched with `applicationCount`.

---

### GET `/api/jobs/:id`

Get a single job by ID. Publicly accessible. Returns `applicationCount` but not the applicant list.

---

### PUT `/api/jobs/:id` _(protected, hirer mode)_

Update a job. Only allowed when `status === "open"`. Updatable fields: title, description, category, workersRequired, location, wage, startDate.

---

### DELETE `/api/jobs/:id` _(protected, hirer mode)_

Soft-delete (sets `status: "cancelled"`). Emits `jobCancelled` socket event to the hirer's room.

---

### PATCH `/api/jobs/:id/status` _(protected, hirer mode)_

Explicitly set status to `"open"` or `"cancelled"`.

---

## Applications — `/api/applications`

All routes require authentication.

### POST `/api/applications` _(worker mode)_

Worker applies to a job.

**Body**: `{ "jobId": "<id>" }`

**Validations**: Job must be `open`; worker cannot apply to own job; no duplicate applications. Emits `newApplication` socket event to hirer.

---

### POST `/api/applications/contact` _(hirer mode)_

Hirer contacts a worker directly (no job required). Creates an `Application` with `jobId: null`. Emits `hirerContact` socket event. Returns `conversationId` for immediate messaging.

**Body**: `{ "workerId": "<id>" }`

---

### GET `/api/applications/mine` _(worker mode)_

Returns the worker's own applications, populated with job and hirer details.

---

### GET `/api/applications/job/:jobId` _(hirer mode)_

Returns all applicants for a specific job (hirer must own the job). Each applicant is enriched with their `WorkerProfile` data.

---

### GET `/api/applications/check`

Check if an interaction exists. Used by the frontend to decide whether to show a Message button.

**Query**: `?jobId=<id>` (worker checking their own application) or `?workerId=<id>` (hirer checking interaction with worker).

**Response**:
```json
{
  "data": {
    "hasInteraction": true,
    "application": { ... },
    "conversationId": "abc_xyz"
  }
}
```

---

### PUT `/api/applications/:id` _(hirer mode)_

Accept or reject an application.

**Body**: `{ "status": "accepted" }` or `{ "status": "rejected" }`

Accepting auto-fills the job when the accepted count reaches `workersRequired`. Emits `applicationStatusUpdate` socket event to the worker.

---

### PUT `/api/applications/:id/status` _(hirer mode)_

Alias for the above.

---

## Messages — `/api/messages`

All routes require authentication.

### POST `/api/messages`

Send a message.

**Body**: `{ "receiverId": "<id>", "content": "Hello, are you available?" }`

**Guard**: An `Application` record must exist between sender and receiver. Emits `receiveMessage` to the conversation's Socket.IO room.

---

### GET `/api/messages/conversations`

List all conversation threads for the authenticated user. Returns last message preview and unread count per thread.

---

### GET `/api/messages/unread/count`

Returns `{ data: { unreadCount: N } }`.

---

### GET `/api/messages/:conversationId`

Fetch paginated messages for a conversation. Marks received messages as read.

**Query**: `?page=1&limit=50`

---

### DELETE `/api/messages/:messageId`

Delete a message. Only sender or receiver can delete.

---

## Reviews — `/api/reviews`

### POST `/api/reviews` _(protected)_

Submit a review for a worker.

**Body**:
```json
{
  "workerId": "<user-id>",
  "rating": 5,
  "comment": "Excellent work, very punctual",
  "jobId": "<job-id>"
}
```

If `jobId` is provided: job must be `filled` and the worker must have an `accepted` application for that job. One review per job per reviewer.  
If `jobId` is omitted: reviewer must have any `Application` interaction with the worker.

---

### GET `/api/reviews/worker/:workerId`

List paginated reviews for a worker, with rating breakdown and average.

---

### PUT `/api/reviews/:id` _(protected)_

Update your own review's rating or comment.

---

### DELETE `/api/reviews/:id` _(protected)_

Delete a review. Admins can delete any review.

---

## Rate Limits

| Route | Limit (Production) | Window |
|-------|--------------------|--------|
| `POST /api/auth/login` | 5 requests | 15 minutes |
| `POST /api/auth/register` | 3 requests | 1 hour |
| `POST /api/auth/google` | 20 requests | 15 minutes |
| All other routes | 100 requests | 15 minutes |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

Common HTTP status codes used:
- `400` — Validation error or bad input
- `401` — Not authenticated (no or invalid token)
- `403` — Authenticated but not authorized (wrong mode, not owner)
- `404` — Resource not found
- `409` — Conflict (duplicate application, existing account)
- `429` — Rate limit exceeded
- `500` — Internal server error
