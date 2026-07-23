# KaamSetu — काम सेतु

**India's local job marketplace** connecting daily-wage workers with hirers — locally, quickly, and reliably.

---

## What is KaamSetu?

KaamSetu (meaning "Bridge of Work" in Hindi) is a full-stack web platform that bridges the gap between skilled daily-wage workers (electricians, plumbers, carpenters, domestic help, etc.) and people who need to hire them. Workers post their availability and hirers post jobs — both can search, connect, and message each other in real time.

---

## Features

- **Dual-role accounts** — one account, switch between Worker and Hirer mode
- **Worker profiles** — skills, experience, wage, availability, location
- **Job board** — hirers post jobs, workers apply
- **Real-time messaging** — Socket.io powered chat between hirers and workers
- **Google Sign-In** — OAuth 2.0 via Google
- **Notifications** — real-time alerts for applications and messages
- **Admin panel** — manage users, jobs, and platform activity
- **Dark / Light theme** — persisted per device
- **Multi-language support** — i18n ready (Hindi / English)
- **Cloudinary image uploads** — profile photos
- **Location-based worker search** — find workers near you

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations |
| React Router v6 | Client-side routing |
| Socket.io Client | Real-time messaging |
| Axios | HTTP client |
| @react-oauth/google | Google Sign-In |
| react-hot-toast | Notifications |
| i18next | Internationalisation |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| Socket.io | Real-time events |
| JWT | Authentication |
| bcryptjs | Password hashing |
| google-auth-library | Google token verification |
| Cloudinary | Image storage |
| Nodemailer | Email verification |
| Helmet + CORS | Security headers |
| express-rate-limit | Rate limiting |

### Deployment
| Service | What runs there |
|---|---|
| Vercel | Frontend (React/Vite) |
| Render | Backend (Node/Express) |
| MongoDB Atlas | Database |
| Cloudinary | Image CDN |

---

## Project Structure

```
KaamSetu/
├── frontend/                  # React + Vite app
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── auth/          # Login / Register forms
│   │   │   ├── chat/          # Message bubbles, input
│   │   │   ├── common/        # Header, Footer, Loader, etc.
│   │   │   ├── hirer/         # Job cards, application cards
│   │   │   └── worker/        # Worker cards
│   │   ├── context/           # React contexts (Auth, Socket, Theme, Admin)
│   │   ├── hooks/             # Custom hooks (useGeolocation, etc.)
│   │   ├── pages/             # Route-level page components
│   │   │   ├── admin/         # Admin dashboard, manage users/jobs
│   │   │   └── ...            # Home, Search, Dashboard, Messenger, etc.
│   │   ├── routes/            # Protected / Admin route guards
│   │   ├── services/          # Axios API service functions
│   │   ├── styles/            # Global CSS
│   │   └── utils/             # Constants, helpers, conversationId
│   ├── .env                   # Frontend environment variables
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Node.js + Express API
│   ├── config/                # Database, Socket.io init
│   ├── controllers/           # Route handler logic
│   ├── middleware/            # Auth guard, error handler, validator
│   ├── models/                # Mongoose schemas (User, Job, Worker, etc.)
│   ├── routes/                # Express routers
│   ├── scripts/               # Seed / migration scripts
│   ├── utils/                 # Token generation, helpers, sanitizers
│   ├── .env                   # Backend environment variables
│   ├── package.json
│   └── server.js              # App entry point
│
└── README.md                  # ← you are here
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Console project with OAuth 2.0 credentials

### 1. Clone the repository

```bash
git clone https://github.com/your-username/kaamsetu.git
cd kaamsetu
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/kaamsetu?retryWrites=true&w=majority

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

FRONTEND_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start the backend:

```bash
npm run dev        # development (nodemon)
npm start          # production
```

The API will be available at `http://localhost:5000`.

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env`:

```env
VITE_APP_NAME=KaamSetu
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend:

```bash
npm run dev        # development server (http://localhost:3000 or 5173)
npm run build      # production build
npm run preview    # preview production build locally
```

---

## Environment Variables Reference

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_APP_NAME` | App display name | `KaamSetu` |
| `VITE_API_URL` | Backend base URL | `http://localhost:5000` |
| `VITE_SOCKET_URL` | Socket.io server URL | `http://localhost:5000` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `130082...apps.googleusercontent.com` |

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `a_long_random_string` |
| `JWT_EXPIRE` | Token expiry | `30d` |
| `FRONTEND_URL` | Allowed frontend origin(s) | `https://kaamsetu.vercel.app` or comma-separated for multiple |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `130082...` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dibcehppe` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `738227...` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `tTBSYw...` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP sender email | `you@gmail.com` |
| `EMAIL_PASS` | SMTP app password | `xxxx xxxx xxxx xxxx` |

> **Multiple frontend origins**: Set `FRONTEND_URL` as a comma-separated list to allow both localhost and production simultaneously:
> ```
> FRONTEND_URL=https://kaamsetu-alpha.vercel.app,http://localhost:3000
> ```

---

## Deployment Guide

### Backend on Render

1. Push your code to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com) pointing to the `backend/` folder (or set the root as the monorepo root and set `Root Directory` to `backend`).
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add all backend environment variables in the Render dashboard, including:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-app.vercel.app`
   - All other secrets from the table above

### Frontend on Vercel

1. Import the repository on [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Add environment variables in the Vercel dashboard:
   - `VITE_API_URL=https://your-backend.onrender.com`
   - `VITE_SOCKET_URL=https://your-backend.onrender.com`
   - `VITE_APP_NAME=KaamSetu`
   - `VITE_GOOGLE_CLIENT_ID=your_google_client_id`

---

## Google OAuth Setup

To enable **Sign in with Google**:

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**.
2. Create an **OAuth 2.0 Client ID** (Web application type).
3. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (for local dev)
   - `https://your-app.vercel.app` (for production)
4. Under **Authorized redirect URIs**, add the same two URLs (Sign In With Google uses the JS origin flow, not a redirect).
5. Copy the **Client ID** into both `.env` files (`VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID`).
6. Copy the **Client Secret** into the backend `.env` (`GOOGLE_CLIENT_SECRET`).

---

## API Routes Overview

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Email/password login |
| POST | `/google` | Google OAuth sign-in |
| GET | `/me` | Get current user profile |
| PUT | `/profile` | Update profile |
| PATCH | `/mode` | Switch Worker / Hirer mode |
| PUT | `/change-password` | Change password |
| POST | `/logout` | Logout |
| GET | `/verify-email` | Verify email via token |

### Workers — `/api/workers`
- CRUD worker profiles, search by location/category

### Jobs — `/api/jobs`
- Post, browse, and manage job listings

### Applications — `/api/applications`
- Apply to jobs, accept/reject applicants, contact workers

### Messages — `/api/messages`
- Conversation list, message history, send messages

### Reviews — `/api/reviews`
- Rate and review workers after a job

### Admin — `/api/admin`
- Manage users, jobs, and platform statistics (separate Bearer auth)

---

## Real-Time (Socket.io Events)

| Event | Direction | Description |
|---|---|---|
| `joinConversation` | Client → Server | Join a chat room |
| `leaveConversation` | Client → Server | Leave a chat room |
| `typing` | Client → Server | Emit typing indicator |
| `receiveMessage` | Server → Client | New incoming message |
| `userTyping` | Server → Client | Peer is typing |
| `newMessage` | Server → Client | Refresh conversation list |
| `notification` | Server → Client | New notification badge |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## License

MIT © 2025 KaamSetu
