# Sprint 1 — UI/UX Stabilization & Frontend Consistency

Scope: frontend only. No backend APIs modified. Build verified green (`npm run build`).
Source of truth: `docs/*` (esp. `10_CODING_GUIDELINES.md` — brand amber `#c8933a`,
bg `#faf7f2`/`#0e0d0b`, gradient `from-[#d4963e] to-[#b86e2a]`).

---

## Issue 1 — Global palette drift (violet/blue vs. documented amber)

**Root cause:** The component layer had been rebuilt on the documented warm-amber
system (755 amber usages), but the *global* CSS tokens, Tailwind config, custom
cursor, spinner, and utility classes (`.btn-primary`, `.btn-gradient`,
`.input-primary`) still carried the original violet/blue starter theme. Anything
falling back to a token or utility class rendered off-brand.

**Files changed:**
- `src/styles/index.css` — `--accent`/`--accent-bg`/`--accent-border`, all
  `--bg-*`/`--text-*`/`--border-*` tokens (light + dark), `.btn-primary/-secondary/
  -gradient`, `.input-field/-primary`, `.custom-cursor-*`, `.spinner`.
- `src/styles/theme.css` — bg/text tokens → warm palette.
- `tailwind.config.js` — `primary` scale blue → amber.

**Solution:** Replaced every violet/blue value with the brand amber family and warm
neutrals. Cursor dot/ring now amber; spinner amber; token defaults warm.

**Before/After:** Before, focus rings, the custom cursor, the loading spinner, and
any `.btn-primary`/token-driven surface were purple/blue on an otherwise amber app.
After, the whole app resolves to one consistent warm-amber identity in light & dark.

---

## Issue 2 — Icon consistency

**Root cause / finding:** No `@heroicons` or `react-icons` are actually imported.
All functional icons are inline Heroicons-style **outline SVGs**; emoji are used
consistently for category/section decoration. The system is already one family.

**Decision:** Kept as-is per Task 2 guidance ("if consistent, keep it"). Stroke-width
values (2 / 1.75 / 2.5) vary by icon size, which is correct practice — heavier
strokes on smaller icons. A blanket rewrite would risk regressions for no visual gain.

---

## Issue 3 — Post card inconsistency (JobCard vs WorkerCard)

**Root cause:** `WorkerCard` used the warm amber system; `JobCard` was still on a
cool gray/indigo/violet palette (gray card body, indigo "Pay" chip, indigo→violet
"Apply" button), and had no explicit equal-height rule.

**Files changed:** `src/components/hirer/JobCard.jsx`.

**Solution:**
- Card body/border → `bg-white dark:bg-white/[0.04]` + `border-[#e8dfd0]
  dark:border-white/8`, added `h-full` for equal heights in grids.
- Pay chip → amber wage-highlight (`bg-amber-50 … text-[#c8933a]`) matching WorkerCard.
- Meta chips → warm `#faf7f2` surfaces; added `min-w-0` + `truncate` to Location/
  Posted/Category to kill overflow; description given `min-h` for row alignment.
- View button → warm hover; Apply button → brand amber gradient.

**Before/After:** Before, job and worker cards looked like two different products
with uneven heights and possible text overflow. After, they share one visual
language — consistent height, badges, amber wage highlight, safe truncation.

---

## Issue 4 — Form typing burden / Work Type (Task 4)

**Root cause:** `JobForm` used a plain `<select>` for category; the sprint wants
low-typing quick-pick chips with a custom escape hatch.

**Files changed:** new `src/components/common/SuggestionChips.jsx`;
`src/utils/constants.js` (`WORK_TYPES`); `src/components/hirer/JobForm.jsx`.

**Solution:** Built a reusable `SuggestionChips` (single-select, brand-styled,
accepts string or `{value,label}` options, optional "Other → free text"). Wired it
into JobForm as **Work Type**. `WORK_TYPES` labels are friendly (Construction Helper,
House Help, Agriculture Worker…) but each `value` is a **backend-valid category** —
verified against `backend/constants/categories.js`, because `createJob` returns 400
on invalid categories (so free custom values are intentionally disabled here).
Also expanded `JOB_CATEGORY_GROUPS` to full backend coverage (fixes audit M11 —
hirers previously couldn't pick most valid categories).

**Before/After:** Before, a dropdown limited to a tiny, partly-invalid subset. After,
tap-to-select chips covering the real category set, styled on-brand.

---

## Issue 5 — Location autocomplete (Task 5)

**Root cause:** All location fields were free-text — error-prone and slow to type.

**Files changed:** new `src/components/common/LocationAutocomplete.jsx`;
`src/utils/constants.js` (`INDIAN_CITIES`); wired into `JobForm.jsx`,
`WorkerSetup.jsx`, `Home.jsx` (hero search).

**Solution:** Reusable combobox that filters `INDIAN_CITIES` as the user types
(e.g. "Char" → Charkhi Dadri, Chandigarh), full keyboard support (↑/↓/Enter/Esc),
click-outside close, and free text still allowed. Styling adapts via `inputClassName`
so it fits the dark hero and the light forms.

**Before/After:** Before, users typed full city names blind. After, they type a few
letters and pick from an on-brand suggestion list.

---

## Issue 6 — Known bug: WorkerSetup crashes on skill tap

**Root cause:** `addSkill` called `setSkillInput('')`/`setSkillSuggestions([])`, but
those state hooks had been commented out — a `ReferenceError` fired on every skill
chip tap, breaking worker onboarding.

**Files changed:** `src/pages/WorkerSetup.jsx`.

**Solution:** Removed the dead references (and the stale commented `useEffect`).
`addSkill` now only toggles the skill array.

**Before/After:** Before, tapping any skill threw and stopped onboarding. After,
skills add/remove cleanly.

---

## Issue 7 — Known bug: "How KaamSetu Works" connector overlap

**Root cause:** The desktop connector line and the step tiles were absolute/relative
siblings with no explicit stacking order, so the line could render across the
numbered badges/text.

**Files changed:** `src/pages/Home.jsx`.

**Solution:** Line set to `z-0 pointer-events-none`; each step to `relative z-10`.
The line is now guaranteed to sit *behind* the icons as a connector and never cross
the numbers or copy. Also refreshed `CATEGORY_ICONS` to match the expanded category
labels (tiles no longer fall back to a generic 💼).

**Before/After:** Before, the guide line could visually collide with step content.
After, clean layered connector.

---

## Issue 8 — Micro-interactions / states (Task 7)

Existing pages already had strong Framer Motion transitions, skeletons, and
empty/error states (verified in Home, WorkerCard, JobForm). New components inherit
the same language: chips use `whileTap` scale; autocomplete dropdown animates in/out
via `AnimatePresence` with hover/active highlighting and keyboard focus states.

---

## Not changed (deliberate, out of sprint scope)

- Backend contract bugs in `audit/CRITICAL.md`/`HIGH.md` (messaging field mismatch,
  route verbs, socket auth) — backend, not this frontend sprint.
- `Search.jsx` ~874 lines of commented dead code (L1) — cosmetic, no runtime impact,
  high-risk to excise blind; left for a dedicated cleanup pass.
- Admin placeholder pages and dead `NotificationBell` — unrouted/unrendered.

## Verification
- `npm run build` passes cleanly after all changes.
- No regressions to data contracts: chip `value`s validated against backend category
  list; location remains free-text-compatible; no service/API signatures touched.
