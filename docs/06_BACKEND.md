# Backend

## Technology Stack

| Package | Version | Role |
|---------|---------|------|
| Node.js | 18+ | Runtime |
| Express | 4.18 | HTTP framework |
| Mongoose | 7.5 | MongoDB ODM |
| Socket.IO | 4.7 | WebSocket server |
| bcryptjs | 2.4 | Password hashing (salt rounds: 12) |
| jsonwebtoken | 9.0 | JWT generation and verification |
| express-rate-limit | 6.10 | Rate limiting |
| express-validator | 7.0 | Request validation decorators |
| helmet | 7.0 | HTTP security headers |
| compression | 1.7 | Gzip response compression |
| cors | 2.8 | Cross-origin resource sharing |
| cookie-parser | 1.4 | Cookie parsing middleware |
| multer | 1.4 | Multipart file upload (memory storage) |
| cloudinary | 1.41 | Image CDN upload |
| nodemailer | 8.0 | Transactional email (verification) |
| google-auth-library | 10.6 | Google OAuth token verification |
| dotenv | 16.3 | Environment variable loading |
| nodemon | 3.0 | Dev auto-restart |

---

## Entry Point: `server.js`

Bootstraps the entire application in this order:

1. Load `.env`
2. Import routes and middleware
3. Apply global middleware (CORS → Helmet → Compression → Rate Limiter → Body parsers → Cookie parser)
4. Mount API routes
5. Add 404 and global error handlers
6. Create HTTP server from Express app
7. Initialise Socket.IO on the HTTP server
8. Connect to MongoDB (`connectDB()`)
9. Start listening on `PORT` (default: 5000)
10. Register graceful shutdown handler (`SIGINT`)

---

## Middleware

### `authMiddleware.js`

Exports four functions:

**`protect(req, res, next)`**  
Extracts JWT from `kaamsetu_token` cookie or `Authorization: Bearer` header. Verifies signature, loads user from DB, rejects deactivated accounts. Attaches `req.user`.

**`optionalAuth(req, res, next)`**  
Same as `protect` but never sends a 401. Sets `req.user = null` if no valid token. Used for routes that behave differently for logged-in users but are also accessible publicly.

**`requireMode(mode)(req, res, next)`**  
Middleware factory. After `protect`, checks `req.user.activeMode === mode`. Returns `403` if mode doesn't match.

**`authorize(...roles)(req, res, next)`**  
Checks `req.user.role`. Used for admin routes.

### `errorMiddleware.js`

Global Express error handler (`(err, req, res, next)`). Formats error responses consistently.

### `uploadMiddleware.js`

Multer configured with `memoryStorage()`. Exports `uploadMultipleImages` (for portfolio, up to 5 files, 5MB each, image MIME types only).

---

## Controllers

### `authController.js`

| Function | Endpoint | Description |
|----------|----------|-------------|
| `registerUser` | POST `/api/auth/register` | Validates, hashes password, creates user, sends verification email in production |
| `loginUser` | POST `/api/auth/login` | Checks password, checks `isVerified` in production, sets cookie |
| `googleLogin` | POST `/api/auth/google` | Verifies Google ID token, upserts user |
| `getUserProfile` | GET `/api/auth/me` | Returns safe user object |
| `updateUserProfile` | PUT `/api/auth/profile` | Updates name, phone, location, photo |
| `updateActiveMode` | PATCH `/api/auth/mode` | Switches `activeMode` |
| `changePassword` | PUT `/api/auth/change-password` | Verifies current password, hashes new one |
| `logoutUser` | POST `/api/auth/logout` | Clears cookie |
| `verifyEmail` | GET `/api/auth/verify-email` | Validates token, marks `isVerified: true` |

**Password rules**:  
- Development: min 6 characters  
- Production: min 10 characters, must contain uppercase, lowercase, digit, special character

### `jobController.js`

| Function | Description |
|----------|-------------|
| `createJob` | Validates category, normalises location, creates job |
| `getJobs` | Filters by category/keyword/status, enriches with haversine distance + smartScore, applies wage filter, sorts, paginates |
| `getMyJobs` | Returns hirer's own jobs with application counts |
| `getJobById` | Returns single job + application count |
| `updateJob` | Validates ownership, updates only `open` jobs |
| `deleteJob` | Soft-delete (sets `cancelled`), emits `jobCancelled` socket event |
| `updateJobStatus` | Explicit status change to `open` or `cancelled` |

### `applicationController.js`

| Function | Description |
|----------|-------------|
| `applyToJob` | Validates job is open, worker isn't hirer, no duplicate; creates application; emits `newApplication` |
| `contactWorker` | Hirer creates `Application` with `jobId: null`; idempotent (returns existing); emits `hirerContact` |
| `getMyApplications` | Worker's own applications with job + hirer populated |
| `getJobApplicants` | Hirer's applicants for a job, enriched with worker profiles |
| `checkInteraction` | Checks if application record exists; returns `conversationId` |
| `updateApplicationStatus` | Accept/reject; on accept, checks quota vs `workersRequired`, auto-fills job; emits `applicationStatusUpdate` |

### `workerController.js`

| Function | Description |
|----------|-------------|
| `getWorkers` | Filters by category/skill/availability/wage/rating, enriches with distance + smartScore, paginates |
| `getWorkerById` | Single worker with reviews + rating breakdown via aggregate |
| `createWorkerProfile` | Upsert; requires category on first create |
| `getMyProfile` | Authenticated worker's own profile |
| `updateAvailability` | Toggle `isAvailable` |
| `uploadPortfolio` | Multer buffers → Cloudinary upload (falls back to placeholder URLs if Cloudinary not configured) |
| `deletePortfolioImage` | Removes URL from `portfolio` array |

### `messageController.js`

| Function | Description |
|----------|-------------|
| `sendMessage` | Checks interaction exists, creates message, emits `receiveMessage` to conversation room |
| `getConversation` | Paginates messages, marks received messages as read, reverses to chronological order |
| `getConversations` | MongoDB aggregate: groups by conversation partner, returns last message + unread count |
| `getUnreadCount` | Counts unread messages for current user |
| `deleteMessage` | Only sender or receiver can delete |

### `reviewController.js`

| Function | Description |
|----------|-------------|
| `createReview` | Validates interaction/job ownership; creates review; calls `refreshWorkerRating` |
| `getWorkerReviews` | Paginated reviews + stats aggregate |
| `updateReview` | Owner only; updates rating/comment; calls `refreshWorkerRating` |
| `deleteReview` | Owner or admin; calls `refreshWorkerRating` |

---

## Real-Time: Socket.IO (`config/socket.js`)

The server maintains an in-memory `onlineUsers` Map (`userId → socketId`).

### Server-side Events

| Event (received from client) | Handler |
|------------------------------|---------|
| `join` | User joins their personal room (`socket.join(userId)`) and broadcasts `userOnline` |
| `joinConversation` | Join a conversation room for real-time messages |
| `leaveConversation` | Leave a conversation room |
| `sendMessage` | Relay message to receiver's room (alternative to HTTP POST) |
| `markRead` | Notify sender that their message was read |
| `typing` | Relay `isTyping` indicator to receiver |
| `disconnect` | Remove from `onlineUsers`, broadcast `userOnline: false` |

### Server → Client Emissions

| Event | Trigger |
|-------|---------|
| `newApplication` | Worker applies to a job (to hirer's room) |
| `applicationStatusUpdate` | Hirer accepts/rejects (to worker's room) |
| `hirerContact` | Hirer contacts worker directly (to worker's room) |
| `jobCancelled` | Hirer cancels job (to hirer's own room) |
| `receiveMessage` | Message sent (to conversation room) |
| `messageSent` | Confirmation to sender (relay path only) |
| `messageRead` | Receiver read a message (to sender's room) |
| `userTyping` | Typing indicator (to receiver's room) |
| `userOnline` | Presence broadcast (to all connected clients) |

---

## Utilities

### `helpers.js`

- **`haversineDistance(lat1, lon1, lat2, lon2)`** — great-circle distance in km using the Haversine formula.
- **`smartScore({ distanceKm, wageAmount, ratingAvg, createdAt }, { perspective, wageMin, wageMax, maxDistanceKm })`** — composite 0–1 ranking score: 40% distance + 25% wage + 25% rating + 10% recency. Wage scoring is perspective-aware (higher pay benefits workers; lower wages benefit hirers).
- **`wageBoundsFromAmounts(amounts)`** — computes min/max for wage normalization.
- **`formatIndianCurrency(amount)`** — formats numbers as INR using `Intl.NumberFormat`.
- **`validateIndianPhone(phone)`** — validates 10-digit Indian mobile starting with 6–9.
- **`sanitizeInput(input)`** — strips `<` and `>` characters.

### `generateToken.js`

- **`signToken(id)`** — signs JWT with `id` payload, reads `JWT_SECRET` and expiry from env.
- **`setTokenCookie(res, userId)`** — signs token + sets `kaamsetu_token` httpOnly cookie (secure in production, lax in development).
- **`clearTokenCookie(res)`** — expires the cookie immediately.

### `conversationId.js`

- **`makeConversationId(userA, userB)`** — sorts both user IDs lexicographically and joins with `_`. Guarantees both parties compute the same ID independently.

### `sanitizeUser.js`

- **`sanitizeUserDoc(user)`** — converts Mongoose doc to plain object, strips `passwordHash`, `verificationToken`, `verificationExpiry`, and `__v`.

### `categories.js`

Master category/skill reference shared between validation and API responses. Exported constants:

| Export | Description |
|--------|-------------|
| `CATEGORY_TREE` | `{ Construction: [...], Agriculture: [...], Household: [...], Technical: [...], Other: [...] }` |
| `CATEGORY_SLUGS` | Top-level category names |
| `SUBCATEGORY_VALUES` | All role-level values flat |
| `SKILL_LIST` | Deduplicated union of all subcategory values |
| `SORT_OPTIONS` | `['distance', 'wage', 'rating', 'recent']` |
| `DISTANCE_OPTIONS_KM` | `[5, 10, 25, 50, 100]` |
| `isValidCategory(name)` | Case-insensitive lookup across all values |

---

## Environment Variables

All variables live in `backend/.env`. Required in production:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` \| `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing (must be long and random) |
| `JWT_EXPIRE` | Token expiry (e.g., `30d`) |
| `FRONTEND_URL` | Allowed CORS origin |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_USER` | SMTP sender address |
| `EMAIL_PASS` | SMTP app password |
| `EMAIL_HOST` | SMTP host (default: `smtp.gmail.com`) |
| `EMAIL_PORT` | SMTP port (default: `587`) |

---

## Starting the Server

```bash
# Development (auto-restart)
cd backend && npm run dev

# Production
cd backend && npm start
```
