# Coding Guidelines

These guidelines document the conventions already in use across the codebase and the standards new code should follow.

---

## General Principles

- **Clarity over cleverness.** Code is read far more often than it is written. Prefer explicit, readable code over compact but opaque expressions.
- **No speculative features.** Only build what the current requirement needs. Do not add parameters, fields, or branches for hypothetical future use.
- **Fail loudly at the boundary, trust internally.** Validate user input and external API responses. Do not re-validate data that has already been validated and is flowing through trusted internal code paths.
- **Errors are first-class.** Every async function must handle errors. Never leave a Promise unhandled.

---

## Backend Conventions

### Project Structure

- One controller file per resource (`authController.js`, `jobController.js`, etc.)
- One route file per resource, mounted in `server.js`
- Shared logic lives in `utils/` or `config/`; never duplicated between controllers
- Constants (categories, wage units, sort options) live in `constants/categories.js` and are imported wherever needed — never re-declared inline

### Controller Pattern

Every controller function follows this template:

```javascript
const doSomething = async (req, res) => {
  try {
    // 1. Extract and validate inputs
    // 2. Query/mutate database
    // 3. Side effects (socket emit, email) in try/catch — never crash the response if they fail
    // 4. Return success response
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('[doSomething]', error.message);
    // Handle known error types (11000 duplicate, ValidationError) explicitly
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
```

Rules:
- Always `return` before `res.json()` to prevent "headers already sent" errors.
- Log with a `[functionName]` prefix for traceability.
- Never expose raw error objects or stack traces to the client.
- Handle MongoDB error code `11000` (duplicate key) and `ValidationError` explicitly before the generic 500.

### Response Shape

All API responses use a consistent envelope:

```json
{
  "success": true | false,
  "message": "optional human-readable string",
  "data": "the payload (object, array, or primitive)",
  "token": "only on auth endpoints"
}
```

- `success: false` always accompanies a non-2xx status code.
- `data` is omitted when the response has no payload (e.g., a delete confirmation).

### Input Normalisation

- Strings: always `.trim()`. Apply `.slice(0, maxLength)` for fields with limits.
- Numbers: use `Number(value)` and check `Number.isFinite()` before using. Never trust `parseInt` alone without range checks.
- Dates: construct `new Date(value)` and check `!Number.isNaN(d.getTime())`.
- Locations: use the `normalizeJobLocation` / `normalizeWorkerLocation` helpers rather than reading `req.body.location` directly in controllers.
- Booleans from query strings: compare `=== 'true'` (query params are always strings).

### Authentication and Authorization

- Use `protect` middleware for all routes that require login.
- Use `requireMode('worker')` or `requireMode('hirer')` for routes that require a specific active mode.
- Always check resource ownership (`job.hirerId.toString() !== req.user._id.toString()`) before updating or deleting. Never assume the authenticated user owns the resource.
- Admin bypass: `req.user.role !== 'admin'` can be appended to ownership checks where admins should have override access.

### Side Effects (Socket Emits)

Socket emits are non-critical. Always wrap them in their own try/catch:

```javascript
try {
  const io = getIo();
  io.to(userId.toString()).emit('eventName', payload);
} catch (socketErr) {
  console.warn('[functionName] Socket emit skipped:', socketErr.message);
}
```

Never let a failed socket emit prevent the HTTP response from being sent.

### Database Queries

- Use `.lean()` on read queries that do not need Mongoose document methods. It returns plain JS objects and is significantly faster.
- Use `.select('-passwordHash')` or `.select('+passwordHash')` explicitly — never rely on the default `select: false` being applied without specifying it.
- Avoid `await Model.find()` without a filter on large collections. Always apply at minimum a status or indexed field filter.
- For aggregations, always `$match` before `$group` or `$sort` to use indexes.

### Environment Variables

- Never hardcode values that differ between environments. Read from `process.env`.
- Always provide sensible defaults (e.g., `process.env.PORT || 5000`).
- For secrets (`JWT_SECRET`, Cloudinary keys), throw an error if they are missing rather than silently operating without them.

---

## Frontend Conventions

### Component Structure

```
ComponentName/
├── ComponentName.jsx   (the component)
```

For simple components, a single file is sufficient. Do not create a directory unless there are related subcomponents or styles.

Component anatomy:
1. Imports (external libraries, then internal)
2. Local helper components (skeleton, sub-components defined inline if small)
3. Constants local to the component
4. Main component function
5. `export default ComponentName`

### State Management

- Use React Context (`AuthContext`, `ThemeContext`, `LanguageContext`) for global state.
- Use `useState` for local UI state.
- Use `useCallback` to memoize event handlers that are passed as props or used as `useEffect` dependencies.
- Debounce search inputs with lodash `debounce` (350ms is the current standard). Always cancel the debounce in the `useEffect` cleanup.

### API Calls

- All API calls go through the service layer (`src/services/`), not raw Axios calls in components.
- Exception: some pages (HirerDashboard, Search) make direct `axios.get()` calls to the worker endpoint. This is a known inconsistency; new code should use the service layer.
- Always handle loading, error, and empty states in the UI.
- Show toast notifications for user-facing errors (`toast.error(message)`).

### Forms

- Use `react-hook-form` for form state.
- Use `zod` for validation schemas (integrated via `@hookform/resolvers`).
- Validation error messages should be human-readable, not technical.

### Styling

- Use Tailwind CSS utility classes exclusively. Do not write custom CSS unless there is no Tailwind equivalent.
- Dark mode: use `dark:` prefix variants consistently. Do not hardcode colours that do not have dark-mode counterparts.
- The brand amber colour is `#c8933a`. Use the gradient `from-[#d4963e] to-[#b86e2a]` for primary action buttons.
- Background colours: light mode `#faf7f2`, dark mode `#0e0d0b`.
- Border colour: light `#e8dfd0`, dark `white/8`.
- Muted text: `#9c8a78`.

### Animations

- Page-level transitions: `opacity 0→1` + `y 10→0` enter, `y 0→-8` exit via `AnimatePresence`.
- Stagger lists: delay each item by `Math.min(index * 0.05, 0.3)` seconds.
- Interactive elements: `whileHover={{ scale: 1.03 }}`, `whileTap={{ scale: 0.97 }}` on primary buttons.
- Do not animate on every render. Wrap animations in `AnimatePresence` when mounting/unmounting.

### Routing

- Use `useNavigate` for programmatic navigation, not `window.location.href` (except on session expiry in `api.js`).
- Protect routes with `<ProtectedRoute>` in `App.jsx`. Never put auth guards inside the page component itself.
- Route paths are centralised in `src/routes/index.jsx` as `ROUTES` constants. Use these constants rather than hardcoding strings.

---

## Naming Conventions

| Scope | Convention | Example |
|-------|-----------|---------|
| Files — React components | PascalCase | `WorkerCard.jsx` |
| Files — utilities, services | camelCase | `jobService.js`, `helpers.js` |
| Files — routes, controllers, middleware | camelCase | `jobController.js`, `authMiddleware.js` |
| React component names | PascalCase | `const WorkerCard = () => ...` |
| Functions (JS) | camelCase | `getWorkerById`, `haversineDistance` |
| Constants (shared, exported) | SCREAMING_SNAKE_CASE | `CATEGORY_SLUGS`, `SORT_OPTIONS` |
| Constants (local to file/component) | camelCase | `const WAGE_MAX = 5000` |
| Mongoose model names | PascalCase singular | `'WorkerProfile'`, `'Job'` |
| MongoDB collection names | Mongoose auto-pluralises | `workerprofiles`, `jobs` |
| Environment variables | SCREAMING_SNAKE_CASE | `JWT_SECRET`, `FRONTEND_URL` |

---

## Comments

- Write comments only when the **why** is not obvious from the code.
- Do not write comments that restate what the code does (the code already says that).
- Use the format `// NOTE:` for important caveats or gotchas.
- Temporarily commented-out code blocks should be removed before committing.

---

## Git Practices

- Commit messages: use the imperative mood. `Add worker availability form`, not `Added` or `Adding`.
- Commit atomically: one logical change per commit.
- Never commit `.env` files, `node_modules/`, or build output (`frontend/dist/`).
- The `main` branch is the single long-lived branch; feature work happens in short-lived branches that are merged via pull request.
- Tag releases with semantic versioning (`v1.0.0`, `v1.1.0`, etc.) once the codebase stabilises.

---

## Security Checklist for New Endpoints

Before shipping a new endpoint, verify:

- [ ] Input is validated and sanitised (trim, length limits, type checks)
- [ ] Authentication is required where appropriate (`protect` middleware)
- [ ] Mode check is enforced where applicable (`requireMode`)
- [ ] Resource ownership is verified before mutation
- [ ] MongoDB queries use parameterised conditions (Mongoose handles this; never use `eval` or `$where`)
- [ ] No sensitive data is returned (passwords, tokens, internal IDs that aren't needed)
- [ ] Rate limiting is applied if the endpoint is publicly accessible or auth-sensitive
- [ ] Socket emits are in their own try/catch and do not block the HTTP response
