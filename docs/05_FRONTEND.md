# Frontend

## Technology Stack

| Library | Version | Role |
|---------|---------|------|
| React | 18.3 | UI framework |
| Vite | 5.x | Build tool and dev server |
| React Router DOM | 6.x | Client-side routing |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 12.x | Page and component animations |
| Axios | 1.x | HTTP client |
| Socket.IO Client | 4.8 | Real-time messaging |
| React Hook Form | 7.x | Form state management |
| Zod | 3.x | Schema-based form validation |
| react-hot-toast | 2.x | Toast notifications |
| i18next / react-i18next | 25.x / 16.x | Internationalisation |
| date-fns | 4.x | Date formatting |
| lodash | 4.x | Debounce (search input) |
| @headlessui/react | 2.x | Accessible UI primitives |
| @heroicons/react | 2.x | Icon set |
| react-icons | 5.x | Supplementary icons |
| @react-oauth/google | 0.13 | Google Sign-In button |
| react-select | 5.x | Searchable dropdowns |

---

## Entry Point

`frontend/src/main.jsx` — renders `<App />` into `#root`.

`frontend/src/App.jsx` — wraps the application in all global providers and defines the route tree.

### Provider Stack (outer to inner)

```
<Router>
  <ThemeProvider>          ← dark/light mode
    <LanguageProvider>     ← i18n locale state
      <AuthProvider>       ← user auth state, token management
        <Header />
        <Suspense>
          <AnimatedRoutes />  ← page-level route transitions
        </Suspense>
        <ActionFAB />       ← floating action button
        <Footer />
        <Toaster />         ← toast notification portal
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
</Router>
```

---

## Routing

All pages are lazy-loaded via `React.lazy()` for code splitting. Route transitions use `AnimatePresence` + `motion.div` (fade + slight vertical slide).

### Public Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Landing page with hero, categories, stats |
| `/login` | `Login` | Email/password + Google OAuth login |
| `/register` | `Register` | Account creation form |
| `/search` | `Search` | Worker/job search with filters |
| `/jobs` | `Search` | Alias for `/search` |
| `/jobs/:id` | `JobDetails` | Single job detail + apply button |
| `/worker/:id` | `WorkerProfile` | Worker public profile + reviews |

### Protected Routes (require login)

| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | `Dashboard` | Mode-aware dashboard (routes to hirer or worker view) |
| `/worker-dashboard` | `WorkerSetup` | Worker profile setup / dashboard |
| `/worker/setup` | `WorkerSetup` | Alias |
| `/post-job` | `PostJob` | Job posting form |
| `/hirer/post-job` | `PostJob` | Alias |
| `/jobs/:id/edit` | `PostJob` | Edit existing job |
| `/my-jobs` | `MyJobs` | Hirer's posted jobs + applicant management |
| `/my-applications` | `MyApplications` | Worker's submitted applications |
| `/messages` | `Messages` | Conversation list |
| `/chat/:userId` | `Chat` | Chat with specific user |
| `/messages/:conversationId` | `Chat` | Chat via conversation ID |
| `/profile` | `Profile` | Edit own profile |
| `/admin` | `AdminDashboard` | Admin-only panel |

### Route Guards

`ProtectedRoute` reads auth state from `AuthContext`. If the user is not authenticated, they are redirected to `/login` with a `redirect` query param to return them after login. The `allowedRoles` prop restricts access by `user.role` (used for the admin route).

---

## Context and State Management

### AuthContext (`src/context/AuthContext.jsx`)

Central store for authentication. Exposes:

| Value / Method | Type | Description |
|----------------|------|-------------|
| `user` | Object \| null | Current user (normalized, no password fields) |
| `loading` | boolean | True while restoring session from localStorage |
| `isAuthenticated` | boolean | Derived: `!!user` |
| `login(email, password)` | async fn | Posts credentials, stores token |
| `register(userData)` | async fn | Registers, stores token |
| `googleLogin(credential)` | async fn | Exchanges Google token |
| `logout()` | async fn | Clears token and user state |
| `refreshUser()` | async fn | Re-fetches profile from API |
| `updateProfile(data)` | async fn | Updates and re-fetches profile |
| `switchActiveMode(mode)` | async fn | Optimistically switches mode, reverts on error |

**Session restoration**: On mount, if a token exists in `localStorage`, the Axios default header is set and `GET /api/auth/me` is called to hydrate the user state.

### ThemeContext (`src/context/ThemeContext.jsx`)

Manages `dark` / `light` theme. Persists to `localStorage`. Adds/removes the `dark` class on `<html>`.

### LanguageContext (`src/context/LanguageContext.jsx`)

Manages active locale. Wraps i18next configuration. Available locales: `en`, `hi`, `bn`, `pa`, `ta`.

---

## Services Layer (`src/services/`)

All API calls go through an Axios instance created in `api.js`.

```javascript
// api.js key config
baseURL = VITE_API_URL + '/api'
timeout = 10000ms
withCredentials = true
```

**Request interceptor**: Attaches `Authorization: Bearer <token>` from `localStorage`.

**Response interceptor**: On `401` (not on auth routes), clears localStorage and redirects to `/login`.

| Service | Key Methods |
|---------|-------------|
| `authService` | `login`, `register`, `googleLogin`, `getProfile`, `updateProfile`, `updateActiveMode`, `changePassword`, `logout` |
| `jobService` | `getJobs`, `getMyJobs`, `getJobById`, `createJob`, `updateJob`, `deleteJob`, `applyForJob` |
| `workerService` | `getWorkers`, `getWorkerById`, `createProfile`, `updateAvailability`, `uploadPortfolio` |
| `applicationService` | `applyToJob`, `getMyApplications`, `getJobApplications`, `updateApplication`, `checkInteraction` |
| `messageService` | `sendMessage`, `getConversations`, `getConversation`, `getUnreadCount` |
| `reviewService` | `createReview`, `getWorkerReviews`, `updateReview`, `deleteReview` |

---

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Consumes `AuthContext` |
| `useGeolocation` | Browser Geolocation API wrapper with state |
| `useSocket` | Connects to Socket.IO on mount, emits `join` with userId |
| `useTheme` | Reads and sets theme |
| `useTranslation` | Wraps i18next `t()` |
| `useLocalStorage` | Generic `useState` persisted to localStorage |

---

## Key Pages

### Search (`src/pages/Search.jsx`)

The primary discovery surface. Mode-aware: authenticated workers see jobs, hirers see workers. Unauthenticated visitors get a tab switcher.

Features:
- Keyword input with 350ms debounce via lodash
- Sidebar with Sort, Category chips, Distance chips, Max Wage slider
- Worker-specific: Skills multi-select, Minimum Rating star picker, Availability toggle
- Mobile: slide-in drawer for filters
- Browser geolocation for distance-based ranking
- Pagination via "Load More" button
- URL sync (keyword, category, sortBy reflected in query params)

### HirerDashboard (`src/pages/HirerDashboard.jsx`)

- Stats row: total posted / active / filled
- Expandable job rows that lazy-load applicant list
- Accept/Reject buttons per applicant (pending state only)
- Message button (accepted applicants only, links to chat)
- Suggested workers grid (geo-aware, 6 nearby workers)

### Chat (`src/pages/Chat.jsx`)

Real-time chat. Connects to Socket.IO room (`joinConversation`), renders `ChatWindow` + `ChatInput`. Handles typing indicators and read receipts.

### WorkerSetup (`src/pages/WorkerSetup.jsx`)

Multi-step worker profile configuration: category/subcategory, skills, bio, wage, availability days, location.

---

## Internationalisation

Translation keys are flat dot-notation strings (e.g., `'auth.login'`, `'home.hero.title'`).

Supported languages:

| Code | Language |
|------|----------|
| `en` | English |
| `hi` | Hindi |
| `bn` | Bengali |
| `pa` | Punjabi |
| `ta` | Tamil |

Language is persisted to `localStorage` and restored on page load via `i18next-browser-languagedetector`.

---

## Styling

- **Framework**: Tailwind CSS 3.4 with PostCSS
- **Design system**: Custom warm palette centred on `#c8933a` (golden amber) and `#faf7f2` (off-white). Dark mode uses `dark:` variants.
- **Animation**: Framer Motion for page transitions (opacity + 10px vertical slide), card stagger animations, and expandable sections.
- **Custom cursor**: `CustomCursor` component renders a custom pointer with hover state on desktop.
- **CSS variables**: `--toast-bg`, `--toast-text` for theme-aware toast colours defined in `src/styles/theme.css`.

---

## Build

```bash
# Development
cd frontend && npm run dev   # Vite dev server on port 3000

# Production build
npm run build                # Output to frontend/dist/

# Preview production build
npm run preview
```

**Environment variables** (`.env`):
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=<google-oauth-client-id>
```
