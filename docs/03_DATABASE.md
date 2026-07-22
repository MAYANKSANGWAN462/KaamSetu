# Database

## Technology

- **Database**: MongoDB (Atlas for production, local for development)
- **ODM**: Mongoose 7
- **Connection file**: `backend/config/database.js`

---

## Collections

### `users`

Stores all platform accounts regardless of role or mode.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Auto-generated |
| `name` | String | 2–80 chars, required |
| `email` | String | Unique, lowercase, required |
| `phone` | String | 10-digit Indian mobile, optional |
| `passwordHash` | String | bcrypt (salt rounds: 12), `select: false` |
| `googleId` | String | Sparse index; present only for Google OAuth users |
| `profilePhoto` | String | URL (Cloudinary or Google picture) |
| `isVerified` | Boolean | Email must be verified in production before login |
| `verificationToken` | String | Hex token, `select: false` |
| `verificationExpiry` | Date | 24-hour window, `select: false` |
| `activeMode` | String | `"worker"` \| `"hirer"` \| `null` |
| `location.lat` | Number | WGS84 latitude |
| `location.lng` | Number | WGS84 longitude |
| `location.city` | String | Display city name |
| `location.area` | String | Neighbourhood/area |
| `isActive` | Boolean | Soft-deactivated accounts cannot log in |
| `lastLogin` | Date | Updated on each successful login |
| `role` | String | `"user"` (default) \| `"admin"` |
| `createdAt` | Date | Mongoose timestamp |
| `updatedAt` | Date | Mongoose timestamp |

**Indexes**: `{ email: 1 }`, `{ googleId: 1 }` (sparse)

**Pre-save hook**: Hashes `passwordHash` if modified and not already bcrypt-hashed (detected by `$2` prefix).

---

### `workerprofiles`

One document per worker user. Created/updated via `POST /api/workers/profile`.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `userId` | ObjectId → User | Unique FK |
| `category` | String | Top-level category slug (e.g., `"Construction"`) |
| `subCategory` | String | Role within category (e.g., `"Mason"`) |
| `skills` | [String] | Up to 30 free-form skill tags |
| `bio` | String | Max 500 chars |
| `yearsOfExperience` | Number | 0–50, default 0 |
| `availability.days` | [String] | Subset of Mon–Sun |
| `availability.note` | String | Max 200 chars, e.g., "only mornings" |
| `wage.amount` | Number | ≥ 0 |
| `wage.unit` | String | `"hourly"` \| `"daily"` \| `"job"` |
| `isAvailable` | Boolean | Toggleable; used in search filters |
| `location.lat` | Number | |
| `location.lng` | Number | |
| `location.address` | String | Display address |
| `portfolio` | [String] | Cloudinary URLs, max 5 |
| `rating.avg` | Number | 0–5, maintained by `refreshWorkerRating()` |
| `rating.count` | Number | Total review count |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes**: `{ userId: 1 }`, `{ category: 1, isAvailable: 1 }`

---

### `jobs`

Each document represents a hirer's job posting.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `hirerId` | ObjectId → User | Required |
| `title` | String | Max 120 chars, required |
| `category` | String | Must pass `isValidCategory()` check |
| `description` | String | Max 500 chars, required |
| `wage.amount` | Number | ≥ 0 |
| `wage.unit` | String | `"hourly"` \| `"daily"` \| `"job"` |
| `workersRequired` | Number | Min 1, default 1 |
| `location.lat` | Number | |
| `location.lng` | Number | |
| `location.address` | String | |
| `status` | String | `"open"` \| `"filled"` \| `"cancelled"` |
| `startDate` | Date | Optional planned start |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes**: `{ hirerId: 1, status: 1 }`, `{ status: 1, createdAt: -1 }`, `{ category: 1 }`

**Status transitions**: `open → filled` (auto when accepted count = workersRequired), `open → cancelled` (hirer action, soft delete).

---

### `applications`

Records every interaction between a hirer and a worker — either a job application (worker applies to hirer's job) or a direct contact (hirer contacts worker without a job).

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `jobId` | ObjectId → Job \| null | `null` for direct contact interactions |
| `workerId` | ObjectId → User | Required |
| `hirerId` | ObjectId → User | Required |
| `status` | String | `"pending"` \| `"accepted"` \| `"rejected"` |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes**:
- `{ jobId: 1, workerId: 1 }` — unique where `jobId != null` (prevents duplicate applications)
- `{ hirerId: 1, workerId: 1 }`
- `{ workerId: 1, status: 1 }`
- `{ hirerId: 1, status: 1 }`

**Dual purpose**: This collection also acts as the messaging permission gate. Any `Application` record (regardless of `status`) between two users allows them to message each other.

---

### `messages`

Stores individual chat messages.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `conversationId` | String | `"[smallerId]_[largerId]"` — deterministic |
| `senderId` | ObjectId → User | Required |
| `receiverId` | ObjectId → User | Required |
| `content` | String | Max 5000 chars |
| `isRead` | Boolean | Set to `true` when receiver fetches conversation |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes**: `{ conversationId: 1, createdAt: -1 }`, `{ receiverId: 1, isRead: 1 }`, `{ senderId: 1, receiverId: 1 }`

**Static method**: `Message.getConversation(userId, peerId, conversationId, limit, skip)` — fetches messages with sender/receiver populated.

---

### `reviews`

Hirer-to-worker ratings submitted after a job is filled or after a direct interaction.

| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | |
| `reviewerId` | ObjectId → User | The hirer who left the review |
| `revieweeId` | ObjectId → User | The worker being reviewed |
| `jobId` | ObjectId → Job \| null | If job-linked, must be `filled` |
| `rating` | Number | Integer 1–5, required |
| `comment` | String | Max 2000 chars |
| `createdAt` | Date | |
| `updatedAt` | Date | |

**Indexes**: `{ revieweeId: 1, createdAt: -1 }`, `{ jobId: 1, reviewerId: 1 }` (unique, sparse — one review per job per reviewer)

**Side effect**: Every create/update/delete of a review calls `refreshWorkerRating(workerUserId)` which re-aggregates the average and updates `WorkerProfile.rating`.

---

## Data Flow: Rating Refresh

```
createReview / updateReview / deleteReview
        │
        ▼
Review.aggregate([
  { $match: { revieweeId: workerOid } },
  { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
])
        │
        ▼
WorkerProfile.updateOne(
  { userId },
  { 'rating.avg': rounded, 'rating.count': count }
)
```

---

## Environment Variables (Database)

| Variable | Example | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb+srv://...` | MongoDB connection string |
| `NODE_ENV` | `development` | Affects email verification bypass |
