# KaamSetu — काम सेतु

**India's local job marketplace** — connecting daily-wage workers with the people who need them: locally, quickly, and reliably.

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwindcss&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white">
  <img alt="Socket.io" src="https://img.shields.io/badge/Socket.io-4-010101?logo=socket.io&logoColor=white">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue">
</p>

---

## Table of Contents

- [What is KaamSetu?](#what-is-kaamsetu)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Creating an Admin](#creating-an-admin)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Real-Time Events](#real-time-events-socketio)
- [Data Models](#data-models)
- [Security](#security)
- [Deployment](#deployment)
- [Google OAuth Setup](#google-oauth-setup)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## What is KaamSetu?

**KaamSetu** (काम सेतु — "Bridge of Work" in Hindi) is a full-stack web platform that bridges the gap between skilled daily-wage workers — electricians, plumbers, carpenters, masons, domestic help, and more — and the people who need to hire them.

A single account can operate in two modes:

- **Worker mode** — build a profile, list your skills and daily/hourly wage, set your availability, showcase a photo portfolio, and apply to nearby jobs.
- **Hirer mode** — post jobs, browse and search for workers near you, review applicants, and reach out directly.

Both sides connect and chat in **real time**, complete work, and leave reviews. The whole flow — discovery, hiring, messaging, and ratings — lives in one place.

---

## Features

- 🔁 **Dual-role accounts** — one login, switch between **Worker** and **Hirer** mode on the fly.
- 👷 **Worker profiles** — skills/categories, experience, wage (hourly/daily/per-job), availability, location, and a **Cloudinary-backed photo portfolio**.
- 📋 **Job board** — hirers post jobs; workers browse, filter, and apply.
- ✅ **Application workflow** — workers apply, hirers accept/reject, and hirers can also reach out to workers directly.
- 💬 **Real-time messaging** — Socket.io chat with typing indicators, read receipts, and online/offline presence. Every socket is JWT-authenticated — no anonymous connections.
- ⭐ **Reviews & ratings** — hirers rate workers after a job.
- 🔐 **Google Sign-In** — OAuth 2.0 via Google, alongside email/password auth.
- 📧 **Email verification & password reset** — token-based flows powered by Nodemailer.
- 📍 **Location-based search** — geolocation + distance filters to find workers/jobs nearby.
- 🗂️ **Job categories** — Construction, Agriculture, Household, Technical, and more.
- 🛡️ **Admin panel** — a separate, Bearer-token admin console to manage users, workers, jobs, and view platform stats.
- 🌗 **Dark / Light theme** — persisted per device.
- 📱 **Responsive, app-like UI** — desktop layout with a mobile bottom tab bar, page transitions via Framer Motion.

> **Note on languages:** the codebase includes scaffolding for multiple languages (a `LanguageContext` and translation files for English, Hindi, Bengali, Punjabi, and Tamil), but this is **not yet wired into the UI**. See [Roadmap](#roadmap).

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **React Router v6** | Client-side routing (with lazy-loaded pages) |
| **Framer Motion** | Page & UI animations |
| **Socket.io Client** | Real-time messaging |
| **Axios** | HTTP client |
| **React Hook Form + Zod** | Forms & schema validation |
| **@react-oauth/google** | Google Sign-In |
| **Headless UI + Heroicons + React Icons** | Accessible UI primitives & icons |
| **react-select** | Rich multi-select inputs (skills, categories) |
| **react-hot-toast** | Toast notifications |
| **date-fns** | Date formatting |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express 4** | REST API server |
| **MongoDB + Mongoose 7** | Database & ODM |
| **Socket.io 4** | Real-time events |
| **JSON Web Tokens** | Authentication (httpOnly cookie + Bearer support) |
| **bcryptjs** | Password hashing |
| **google-auth-library** | Google ID-token verification |
| **Cloudinary + Multer** | Image upload & storage |
| **Nodemailer** | Verification & password-reset emails |
| **Helmet + CORS** | Security headers & origin allow-listing |
| **express-rate-limit** | Rate limiting (global + stricter auth limits) |
| **express-validator** | Request validation |
| **compression / cookie-parser** | Gzip responses & cookie parsing |

### Infrastructure

| Service | What runs there |
|---|---|
| **Vercel** | Frontend (React/Vite SPA) |
| **Render** | Backend (Node/Express + Socket.io) |
| **MongoDB Atlas** | Database |
| **Cloudinary** | Image CDN |

---

## Project Structure

```
KaamSetu/
├── frontend/                     # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── auth/             # Login / Register forms
│   │   │   ├── chat/             # Message bubbles, input
│   │   │   ├── common/           # Header, Footer, MobileTabBar, Loader…
│   │   │   ├── hirer/            # Job cards, application cards
│   │   │   ├── reviews/          # Rating & review UI
│   │   │   └── worker/           # Worker cards
│   │   ├── config.js             # App config (API URL, app name)
│   │   ├── constants/            # Shared frontend constants
│   │   ├── context/              # AuthContext, SocketContext, ThemeContext,
│   │   │                         #   LanguageContext, AdminAuthContext
│   │   ├── hooks/                # useAuth, useSocket, useTheme,
│   │   │                         #   useGeolocation, useLocalStorage…
│   │   ├── pages/                # Route-level pages
│   │   │   ├── admin/            # AdminLogin, AdminDashboard, ManageUsers, ManageJobs
│   │   │   └── …                 # Home, Search, Dashboard, Messenger, PostJob…
│   │   ├── routes/               # ProtectedRoute, AdminProtectedRoute
│   │   ├── services/             # Axios API service modules
│   │   ├── styles/               # Global CSS
│   │   ├── translations/         # en/hi/bn/pa/ta strings (scaffolding — see Roadmap)
│   │   ├── utils/                # Helpers, constants, conversationId
│   │   ├── App.jsx               # Providers + route table
│   │   └── main.jsx              # Entry point
│   ├── vite.config.js            # Dev server on :3000, /api proxy → :5000
│   ├── vercel.json               # SPA rewrite rule
│   └── package.json
│
├── backend/                      # Node.js + Express API
│   ├── config/                   # database.js, socket.js, cloudinary.js
│   ├── constants/                # categories.js (job taxonomy, wage units…)
│   ├── controllers/              # Route handler logic
│   ├── middleware/               # auth guard, validation, upload, error handler
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # Express routers
│   ├── scripts/                  # makeAdmin.js (admin bootstrap)
│   ├── utils/                    # generateToken, sanitizeUser, helpers…
│   ├── server.js                 # App entry point
│   └── package.json
│
├── docs/                         # In-depth architecture & design docs
└── README.md                     # ← you are here
```

---

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- A **MongoDB** database (MongoDB Atlas or a local instance)
- A **Google Cloud** project with OAuth 2.0 credentials (for Google Sign-In)
- A **Cloudinary** account (for image uploads)
- SMTP credentials (e.g. a Gmail App Password) for verification/reset emails

> The frontend and backend are installed and run **separately** — use two terminals.

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/kaamsetu.git
cd kaamsetu
```

### 2. Backend

```bash
cd backend
npm install
# create backend/.env — see "Environment Variables" below
npm run dev        # start with nodemon (development)
```

The API starts on **http://localhost:5000** (health check at `/health`).

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
# create frontend/.env — see "Environment Variables" below
npm run dev        # start Vite dev server
```

The app opens on **http://localhost:3000**. In development, requests to `/api` are proxied to the backend on port `5000` (configured in `vite.config.js`).

---

## Environment Variables

Both apps read a local `.env` file (already git-ignored). Use the keys below with **your own** values — never commit real secrets.

### Backend — `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/kaamsetu` |
| `JWT_SECRET` | JWT signing secret | `a_long_random_string` |
| `JWT_EXPIRE` | Token lifetime | `30d` |
| `FRONTEND_URL` | Allowed CORS origin(s) — comma-separate for multiple | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxxxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-xxxxxxxx` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_cloudinary_secret` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP sender email | `you@gmail.com` |
| `EMAIL_PASS` | SMTP password / app password | `xxxx xxxx xxxx xxxx` |

> **Multiple origins:** in production, set `FRONTEND_URL` to a comma-separated list so both your deployed site and localhost are allowed:
> ```
> FRONTEND_URL=https://your-app.vercel.app,http://localhost:3000
> ```

### Frontend — `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_APP_NAME` | App display name | `KaamSetu` |
| `VITE_API_URL` | Backend base URL | `http://localhost:5000` |
| `VITE_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxxxx.apps.googleusercontent.com` |

---

## Creating an Admin

The admin console (`/admin`) uses a **separate authentication system** from the marketplace. To grant admin access, promote an account with the bundled script (run from the `backend/` folder so `.env` is loaded):

```bash
cd backend

# Promote an existing user to admin:
node scripts/makeAdmin.js user@example.com

# Or create a brand-new admin account (password required):
node scripts/makeAdmin.js admin@example.com "StrongPassword123" "Administrator"
```

Then sign in at **`/admin/login`** with those credentials.

---

## Available Scripts

### Backend (`backend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the API with **nodemon** (auto-reload) |
| `npm start` | Start the API with `node server.js` (production) |

### Frontend (`frontend/`)

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server (port 3000) |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

---

## API Reference

All routes are prefixed with `/api`. Utility endpoints: `GET /` and `GET /health` (health checks), `GET /api/test`.

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Email/password login |
| POST | `/google` | Google OAuth sign-in |
| GET | `/verify-email` | Verify email via token |
| POST | `/forgot-password` | Request a password-reset email |
| POST | `/reset-password` | Reset password via token |
| POST | `/logout` | Log out |
| GET | `/me` | Get the current user (protected) |
| PUT | `/profile` | Update profile (protected) |
| PATCH | `/mode` | Switch Worker / Hirer mode (protected) |
| PUT | `/change-password` | Change password (protected) |

### Users — `/api/users`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/:id` | Get a public user profile |
| GET | `/` | List users (**admin**) |
| GET | `/stats` | User statistics (**admin**) |
| PUT | `/:id` | Update a user (**admin**) |
| DELETE | `/:id` | Delete a user (**admin**) |

### Workers — `/api/workers`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Search / list workers (by category, location…) |
| GET | `/:id` | Get a worker profile |
| GET | `/profile/me` | Get my worker profile |
| POST/PUT | `/profile` | Create / update my worker profile |
| PATCH/PUT | `/availability` | Update availability |
| POST | `/portfolio` | Upload portfolio images |
| DELETE | `/portfolio` | Remove a portfolio image |

### Jobs — `/api/jobs`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Browse / search jobs |
| GET | `/:id` | Get a job |
| GET | `/mine` (`/my-jobs`) | Jobs I posted (**hirer**) |
| POST | `/` | Create a job (**hirer**) |
| PUT | `/:id` | Update a job (**hirer**) |
| PATCH | `/:id/status` | Update job status (**hirer**) |
| DELETE | `/:id` | Delete a job (**hirer**) |

### Applications — `/api/applications`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Apply to a job (**worker**) |
| GET | `/mine` | My applications (**worker**) |
| GET | `/check` | Check interaction status |
| POST | `/contact` | Contact a worker (**hirer**) |
| GET | `/job/:jobId` | Applicants for a job (**hirer**) |
| PUT | `/:id` (`/:id/status`) | Accept / reject an application (**hirer**) |

### Messages — `/api/messages`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/conversations` | List my conversations |
| GET | `/unread/count` | Unread message count |
| GET | `/:conversationId` | Message history |
| POST | `/` | Send a message |
| DELETE | `/:messageId` | Delete a message |

### Reviews — `/api/reviews`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/worker/:workerId` | Reviews for a worker |
| POST | `/` | Create a review (**hirer**) |
| PUT | `/:id` | Update a review |
| DELETE | `/:id` | Delete a review |

### Admin — `/api/admin` *(separate Bearer-token auth)*
| Method | Endpoint | Description |
|---|---|---|
| POST | `/login` | Admin login |
| GET | `/stats` | Platform statistics |
| GET | `/users` · `/workers` · `/jobs` · `/conversations` | List resources |
| PATCH | `/users/:id/status` | Activate / deactivate a user |
| DELETE | `/users/:id` | Delete a user |
| PATCH | `/jobs/:id/status` | Moderate a job |

---

## Real-Time Events (Socket.io)

Sockets are authenticated on the handshake — the JWT is read from the socket `auth` payload, the `Authorization` header, or the httpOnly cookie. Each user auto-joins a personal room keyed by their user ID.

| Event | Direction | Description |
|---|---|---|
| `joinConversation` | Client → Server | Join a chat room |
| `leaveConversation` | Client → Server | Leave a chat room |
| `typing` | Client → Server | Emit a typing indicator |
| `markRead` | Client → Server | Mark a message as read |
| `receiveMessage` | Server → Client | New message in the active conversation |
| `newMessage` | Server → Client | New message → refresh conversation list / badge |
| `userTyping` | Server → Client | A peer is typing |
| `messageRead` | Server → Client | Read receipt |
| `userOnline` | Server → Client | Presence update (online/offline) |
| `newApplication` | Server → Client | A worker applied to your job (**hirer**) |
| `hirerContact` | Server → Client | A hirer reached out to you (**worker**) |
| `applicationStatusUpdate` | Server → Client | Your application was accepted/rejected (**worker**) |
| `jobCancelled` | Server → Client | A job you're involved with was cancelled |

---

## Data Models

Mongoose schemas live in `backend/models/`:

| Model | Purpose |
|---|---|
| **User** | Account, credentials, role (`user`/`admin`), active mode (`worker`/`hirer`), contact & location, verification/active flags, Google linkage |
| **WorkerProfile** | Worker's skills/category, wage & unit, availability, portfolio images, and rating aggregates |
| **Job** | A hirer's posting — title, description, category, wage, location, and status |
| **Application** | A worker's application to a job, with status (pending/accepted/rejected) |
| **Message** | A chat message tied to a conversation (sender, receiver, content, read state) |
| **Review** | A hirer's rating and comment for a worker |

---

## Security

- **Password hashing** with bcrypt; passwords are never stored in plaintext.
- **JWT auth** delivered via an **httpOnly cookie** (Bearer tokens also accepted).
- **Authenticated WebSockets** — no anonymous socket connections; identity is derived from the verified token, never from client-supplied fields.
- **CORS allow-listing** — only origins in `FRONTEND_URL` may call the API.
- **Helmet** security headers and **gzip compression**.
- **Rate limiting** — a global limiter plus stricter, environment-aware limits on login/register/Google/admin-login endpoints.
- **Request validation** with express-validator.
- **Separate admin auth** — the admin console is isolated from the marketplace auth flow.

---

## Deployment

### Backend on Render

1. Push your code to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com) and set **Root Directory** to `backend`.
3. **Build Command:** `npm install`
4. **Start Command:** `node server.js`
5. Add every backend environment variable from the table above, including:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-app.vercel.app` (comma-separate to also allow localhost)
6. Render can use `/health` as the health-check path.

### Frontend on Vercel

1. Import the repository on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend` and **Framework Preset** to **Vite**.
3. Add the frontend environment variables, pointing them at your Render backend:
   - `VITE_API_URL=https://your-backend.onrender.com`
   - `VITE_SOCKET_URL=https://your-backend.onrender.com`
   - `VITE_APP_NAME=KaamSetu`
   - `VITE_GOOGLE_CLIENT_ID=your_google_client_id`
4. SPA routing is handled by `frontend/vercel.json` (all paths rewrite to `index.html`).

---

## Google OAuth Setup

To enable **Sign in with Google**:

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**.
2. Create an **OAuth 2.0 Client ID** of type **Web application**.
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (local dev)
   - `https://your-app.vercel.app` (production)
4. Copy the **Client ID** into both env files (`VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID`).
5. Copy the **Client Secret** into the backend `.env` (`GOOGLE_CLIENT_SECRET`).

---

## Roadmap

- 🌐 **Multi-language UI** — translation scaffolding (English, Hindi, Bengali, Punjabi, Tamil) and a `LanguageContext` already exist, but strings are **not yet consumed by the UI**. Wiring components to the translation layer is the next step.
- 🔔 In-app notification center.
- 🧾 Additional analytics for the admin dashboard.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch and open a Pull Request.

---

## License

Released under the **MIT License**.

---

<p align="center">Built with ❤️ for India's workforce — <strong>KaamSetu, काम सेतु</strong>.</p>
