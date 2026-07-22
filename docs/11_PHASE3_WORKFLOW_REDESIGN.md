# KaamSetu — Phase 3 Product Workflow Redesign

**Document type:** Product architecture & end-to-end workflow specification
**Audience:** Product, design, engineering
**Status:** Proposal for Phase 3
**Author's lens:** Product Architect (not implementation)

---

## 0. How to read this document

This is not a feature list and it is not code. It is a description of **how a real human moves through KaamSetu** — from the moment they first hear about it to the moment money changes hands and a reputation is built. Every workflow below is written from the user's point of view first, and only then translated into the system behaviour that supports it.

Where the current build (Phase 2) already does something well, this document says so and leaves it alone. Where the current flow fights against how the target user actually behaves, it proposes a redesign and explains **why**. The "why" matters more than the "what" — a workflow is only correct if it matches the reality of the person using it.

---

## 1. The product in one sentence

> **KaamSetu is the shortest trustworthy path between a person who needs work done today and a person nearby who can do it — with no middleman taking a cut and no phone number exchanged until both sides choose to.**

Everything in this document serves that sentence. Three words in it are load-bearing:

- **Trustworthy** — the informal labour market runs on trust that today lives in word-of-mouth. KaamSetu must manufacture that trust digitally (verification, reviews, escrow) or it has no reason to exist.
- **Nearby** — relevance is distance, not scale. A decent electrician 2 km away beats a great one 40 km away, every time.
- **Today** — this is a *now* marketplace, not a careers site. The unit of urgency is the day, sometimes the hour.

---

## 2. Who we are actually designing for

The single biggest design risk in this product is that it is built by people with high digital literacy, for people with low digital literacy. The workflows must be designed around the *harder* user, not the easier one.

| Persona | Reality on the ground | What this forces in the design |
|---|---|---|
| **Ravi — the worker** | Mason, 34, owns a ₹6,000 Android phone, one hand often dusty, reads Hindi slowly, types even more slowly, may share the phone with family. Data is prepaid and precious. Email is something he has but never checks. | Phone number is the identity, not email. OTP over passwords. Voice/visual over text where possible. Screens must survive being used one-handed in sunlight. Offline-tolerant. |
| **Sunita — the household hirer** | 41, needs a cook and occasionally a plumber. Comfortable on WhatsApp, nervous about "apps." Wants to see a face and a rating before she lets someone into her home. Safety is her #1 concern. | Verification and reviews must be *visible and legible*. "Contact" must not leak her personal number. Clear cancellation and reporting. |
| **Ramesh — the small contractor (dual-mode)** | Runs a 5-person crew. Some days he *is* labour for a bigger job; other days he *hires* labour for his own. | One account, two modes, must be frictionless to switch. His reputation as a worker and as a hirer are related but distinct. |
| **The platform operator (admin/trust team)** | Must keep bad actors out and resolve disputes without being present at the job site. | Every workflow needs an audit trail, a report path, and a state that a human can adjudicate. |

**Design principle that falls out of this:** *the platform's job is to remove friction for Ravi and remove fear for Sunita.* If a decision helps one at the expense of the other, it is the wrong decision.

---

## 3. The two core journeys, end to end

Before drilling into individual screens, here is the whole arc. These two journeys are the spine; everything in Section 5 onward is a vertebra.

### 3.1 The Worker Journey (Ravi)

```
Discover ──► Register (phone+OTP) ──► Build profile ──► Go "Available"
   │                                                          │
   │                                                          ▼
   │                                            Get discovered / browse jobs
   │                                                          │
   │                                    ┌─────────────────────┴───────────────┐
   │                                    ▼                                      ▼
   │                          Apply to a job                         Receive direct offer
   │                                    │                                      │
   │                                    └──────────────┬───────────────────────┘
   │                                                   ▼
   │                                          Hirer accepts  ──►  Chat opens
   │                                                   │
   │                                                   ▼
   │                                     Work is agreed (Engagement created)
   │                                                   │
   │                                                   ▼
   │                              Do the work ──► Mark "work done"
   │                                                   │
   │                                                   ▼
   │                              Get paid (cash logged / escrow released)
   │                                                   │
   │                                                   ▼
   │                              Receive rating ──► Leave rating for hirer
   │                                                   │
   ▼                                                   ▼
Reputation compounds ◄──────────────────── Reputation compounds
```

### 3.2 The Hirer Journey (Sunita)

```
Discover ──► Register (phone+OTP) ──► (light profile) ──► Switch to Hire mode
                                                                │
                                          ┌─────────────────────┴─────────────────┐
                                          ▼                                        ▼
                               Post a job (broadcast)                   Search & pick a worker
                                          │                                        │
                                          ▼                                        ▼
                             Applications arrive              Send direct offer to that worker
                                          │                                        │
                                          └──────────────┬─────────────────────────┘
                                                         ▼
                                     Review candidate (profile, rating, distance)
                                                         │
                                                         ▼
                                         Accept  ──►  Chat opens  ──►  Agree terms
                                                         │
                                                         ▼
                                         Engagement created (work order)
                                                         │
                                                         ▼
                              Work happens ──► Confirm completion ──► Pay
                                                         │
                                                         ▼
                                         Rate the worker ──► Reputation recorded
```

**The critical observation:** both journeys converge on a single object that the current system does not have — an **Engagement** (a confirmed work order). Today the product stops caring after `accepted`; it never models the work actually happening, completing, or being paid for. Phase 3's central architectural move is to introduce the Engagement as a first-class lifecycle. Sections 9–13 build on it.

---

## 4. Registration & Login — redesigned around the phone, not the inbox

### 4.1 Why the current flow is wrong for the user

Phase 2 registers with **name, email, password** and verifies by **email link**. For Sunita this is tolerable. For Ravi it is a wall:

- He rarely checks email; a verification link may never be clicked.
- Passwords are a memory tax he will offload to "123456" or forget entirely (and there is no reset flow today — see Known Issue #10).
- Google OAuth assumes a configured Google account he can navigate.

### 4.2 The redesign: phone number is the identity

```
Landing ──► "Enter your mobile number" ──► [ 10-digit field, big, numeric keypad ]
                        │
                        ▼
             OTP sent via SMS (fallback: WhatsApp, or IVR voice-read for feature-phone bridge)
                        │
                        ▼
             Enter 6-digit OTP  ──►  verified  ──►  account exists
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
      New number → onboarding   Known number → straight to home
```

- **Phone + OTP is the primary path.** No password required to exist on the platform. Email becomes optional (useful for Sunita and for receipts), not mandatory.
- **Password becomes an optional convenience,** not the gate. If set, it enables faster re-login on a shared device. A proper **forgot-password / re-OTP** recovery path exists (closes Known Issue #10).
- **Google OAuth stays** as an accelerator for the smartphone-comfortable segment, but it is now one of three doors, not the primary one.
- **Session:** rely on the httpOnly cookie as the source of truth; stop mirroring the token in `localStorage` (closes Known Issue #5 / XSS surface). Long-lived sessions because re-authing is expensive friction for this user.

### 4.3 First-run: intent before identity

The very first question after verification is **not** "fill your profile." It is **"What brings you here today?"**

```
      ┌───────────────────────────────┐
      │   I'm looking for work   🔨    │  ──► Worker onboarding (Section 6)
      ├───────────────────────────────┤
      │   I need to hire someone  🧰   │  ──► Hirer path (light, Section 7)
      └───────────────────────────────┘
      (You can switch anytime — shown as reassurance)
```

This replaces the current post-login `ModeSelectionModal` with an intent question that sets `activeMode` *and* routes to the right onboarding. Establishing intent first means we only ask each user for the data their journey actually needs.

**Rationale:** identity questions (who are you) have high abandonment; intent questions (what do you want) have low abandonment and immediately make the product feel relevant. Ask "what do you want" first, "who are you" second, and "prove who you are" only when trust is actually needed (Section 8).

---

## 5. Homepage — a "what can I do right now" surface, not a brochure

The homepage must answer, within two seconds and one glance, the only question the user has: **"Is there something here for me today?"** It is mode-aware and action-first.

### 5.1 Worker home (Ravi, in Work mode)

```
┌──────────────────────────────────────────────┐
│  Namaste, Ravi        [🟢 Available ▾]  🔔3   │   ← availability toggle is the hero control
├──────────────────────────────────────────────┤
│  Jobs near you (within 5 km)          See all │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐    │
│  │ Mason     │ │ Helper    │ │ Plumber   │    │
│  │ ₹800/day  │ │ ₹600/day  │ │ ₹1200/job │    │
│  │ 1.2 km    │ │ 2.0 km    │ │ 3.1 km    │    │
│  └───────────┘ └───────────┘ └───────────┘    │
├──────────────────────────────────────────────┤
│  ⚡ 2 hirers viewed your profile today         │
│  💬 1 new message from a hirer                 │
│  ⭐ Your rating: 4.6 (18 jobs)                 │
└──────────────────────────────────────────────┘
```

The availability toggle is the single most important control on the worker's home — flipping it to green is what makes him discoverable. It must be one thumb-tap from the home screen and its state must be unambiguous.

### 5.2 Hirer home (Sunita, in Hire mode)

```
┌──────────────────────────────────────────────┐
│  Hello, Sunita                        🔔1     │
├──────────────────────────────────────────────┤
│   [  + Post a job  ]   [  🔍 Find a worker ]  │   ← the two ways to start, front and centre
├──────────────────────────────────────────────┤
│  Your active jobs                             │
│  • Cook needed — 3 applicants  →              │
│  • Plumber — 1 hired, in progress →           │
├──────────────────────────────────────────────┤
│  Available near you                           │
│  ┌────────┐ ┌────────┐ ┌────────┐             │
│  │Sunita R│ │ Amit   │ │ Kavita │  (workers)  │
│  │⭐4.8   │ │⭐4.5   │ │⭐ new  │             │
│  └────────┘ └────────┘ └────────┘             │
└──────────────────────────────────────────────┘
```

**Rationale:** the current app lands users on a generic dashboard. A marketplace homepage should surface *live inventory* (nearby jobs/workers) and the *primary action* immediately, because a marketplace that looks empty on first open is a marketplace the user abandons.

---

## 6. Worker Profile — the worker's "shopfront"

The profile is Ravi's storefront and his negotiating position. Every field either helps a hirer trust him or helps him get matched. If a field does neither, it should not exist.

### 6.1 Onboarding as a progressive, celebratory ladder — not a wall

The current 8-step setup asks for everything up front. That is a wall. Redesign it as a **profile-strength ladder** where a worker becomes *discoverable* after the minimum, then is nudged to strengthen over time.

```
Level 1 — "Ready to be found" (required, ~60 seconds)
   • What work do you do?      (category → role, with icons)
   • Where are you based?      (GPS one-tap, or pick area)
   • What do you charge?       (amount + hourly/daily/per-job)
        ▼   profile goes LIVE, worker is discoverable
Level 2 — "Stand out"  (nudged, each adds a visible strength bar segment)
   • Add 3 photos of past work           +trust
   • Add your experience (years)         +ranking
   • Add skills / specialities           +matching
   • Set your available days             +relevance
   • Record a 15-sec voice intro 🎙       +trust (NEW — see below)
Level 3 — "Verified & trusted"  (Section 8)
   • Verify phone ✓ (already done at signup)
   • Verify ID (KYC-lite)                 +badge
   • First review earned                  +credibility
```

**New idea — voice intro:** for a low-literacy user, a 15-second spoken "Hi, I'm Ravi, I've done masonry for 10 years" is worth more than a typed bio and is far easier for *him* to produce. It also humanises him for a nervous hirer. Bio text stays optional.

### 6.2 What a hirer sees on a worker profile

```
┌───────────────────────────────────────────┐
│  [photo]  Ravi Kumar          🟢 Available │
│           Mason · 10 yrs · 1.2 km away     │
│           ⭐ 4.6  (18 jobs)   ✓ ID verified │
│  ▶ 0:15 voice intro                         │
├───────────────────────────────────────────┤
│  Charges: ₹800 / day                        │
│  Skills: Brickwork, Plastering, Tiling      │
│  Available: Mon–Sat                          │
├───────────────────────────────────────────┤
│  Past work  [img][img][img]                 │
├───────────────────────────────────────────┤
│  Reviews (18)                               │
│  ⭐⭐⭐⭐⭐ "On time, clean work" — Sunita   │
├───────────────────────────────────────────┤
│      [  Send job offer  ]  [  Message  ]    │
└───────────────────────────────────────────┘
```

Trust signals (rating, verified badge, review count, real photos of work) are placed **above** commercial details, because for Sunita trust is the gate and price is secondary.

---

## 7. Hirer Profile — trust flows both ways

Phase 2 treats the hirer as almost invisible — reviews only run hirer→worker. This is a mistake: **Ravi is taking a risk too.** He is giving a day of his labour to a stranger who might not pay. A hirer with no reputation is as scary to a worker as an unrated worker is to a hirer.

### 7.1 The hirer profile carries its own reputation

```
┌───────────────────────────────────────────┐
│  [photo]  Sunita Sharma      ✓ Phone verified│
│           Household hirer · Andheri, Mumbai │
│           ⭐ 4.8 as a hirer  (12 hires)     │
├───────────────────────────────────────────┤
│  • Pays on time: 12/12                      │
│  • Usually hires: Cooks, Cleaners           │
│  • Member since 2025                         │
└───────────────────────────────────────────┘
```

A worker can glance at this before accepting an offer and decide whether this hirer is worth his day. "Pays on time" is the single most important stat we can show a worker — it directly attacks the market's core fear.

### 7.2 Dual-mode reputation

Ramesh (dual-mode) has **two reputations under one account**: a worker rating and a hirer rating, shown contextually. They are stored separately so that a bad day as a hirer doesn't poison his standing as a worker. Mode-switching remains a one-tap header toggle (Phase 2 already does this well); the redesign only clarifies that *reputation is per-role, identity is shared.*

---

## 8. Trust & Verification layer — the thing that makes the marketplace real

This is the layer the current build under-invests in, and it is the one that determines whether anyone actually transacts. Trust is built in **tiers**, and the platform earns the right to ask for more as the stakes rise.

```
Tier 0  Anonymous          → can browse only
Tier 1  Phone verified     → can apply / post / message   (OTP at signup)
Tier 2  Profile complete   → discoverable, ranks higher
Tier 3  ID verified (KYC)  → "Verified" badge, unlocks escrow-backed jobs
Tier 4  Track record       → rating + completed-job count, the real trust
```

Design rules:
- **Never ask for KYC before it is needed.** A worker browsing jobs should not be asked for an ID. Ask when he's about to be paid through the platform, or when a hirer filters for "verified only."
- **Verification is a visible asset, not a chore.** Every tier crossed lights up a badge and improves ranking, so the user *wants* to climb.
- **Reporting & blocking exist at every interaction point** (profile, chat, engagement). A report creates an admin-adjudicable record. This is the pressure valve that keeps bad actors out and gives Sunita the confidence to let a stranger into her home.

---

## 9. Posting a Job — a broadcast that finds workers, not a form that files paperwork

### 9.1 The redesign: fast, guided, and it actively goes and finds people

```
"What do you need done?"      → category → role (icon grid, voice-search option)
"When?"                       → Today / Tomorrow / Pick date  (chips, not a calendar wall)
"Where?"                      → GPS one-tap (default) or saved address
"How much will you pay?"      → suggested range shown based on nearby workers' rates
"How many people?"            → stepper, default 1
        ▼
   Job goes live (status: OPEN)
        ▼
   ⚡ Push to the N nearest matching available workers immediately
      ("3 masons within 3 km notified")
        ▼
   Hirer sees a live counter: "Notified 5 · Viewed 3 · Applied 2"
```

Two product moves here:

1. **Wage guidance.** Show the hirer what nearby workers of this type actually charge *while* they set the price. This prevents lowball posts that get zero applicants and it protects the worker from exploitation — directly serving the "no middleman margin" mission.
2. **Active broadcast.** A posted job is not a passive listing waiting to be discovered. The moment it goes live, it **pushes a notification to the nearest matching available workers.** This is what makes KaamSetu a *today* marketplace instead of a job board.

### 9.2 Job lifecycle — expanded to model reality

Phase 2's lifecycle is `open → filled/cancelled` and then it stops caring. That is the core gap. The redesigned lifecycle follows the work all the way to money and reputation:

```
        ┌────────────────────────────────────────────────────────┐
        ▼                                                        │
     [OPEN] ──accept enough workers──► [FILLED] ──work starts──► [IN_PROGRESS]
        │                                  │                        │
        │ hirer cancels                    │ hirer cancels          │ both confirm done
        ▼                                  ▼                        ▼
   [CANCELLED] ◄──────────────────────────┘                   [COMPLETED]
        │  (all applicants notified — closes Known Issue #4)        │
        │                                                           ▼
        │                                                    [CLOSED / REVIEWED]
        └──── expires if no fill by startDate ──► [EXPIRED]
```

The new **IN_PROGRESS** and **COMPLETED** states are what unlock payments and honest reviews (you can only review work that actually finished, not merely a job that was "filled"). **Cancellation now notifies applicants** — a concrete fix to a current defect, promoted from a bug into a designed behaviour.

---

## 10. Applying & Direct Offers — one clean concept, not two overloaded ones

### 10.1 The current model is muddy

Today, both "worker applies to a job" and "hirer contacts a worker directly" are stuffed into the **Application** object — the latter with `jobId: null`. That overloads one object with two very different meanings and makes messaging permissions, notifications, and reviews awkward.

### 10.2 The redesign: separate "interest" from "the deal"

Introduce two clean, distinct concepts:

| Concept | Meaning | Who starts it | Direction |
|---|---|---|---|
| **Application** | "I'm interested in your job." | Worker | worker → job |
| **Offer** | "I want to hire *you* specifically." | Hirer | hirer → worker |

Both are **expressions of interest**. Both, once *mutually accepted*, graduate into the single object that actually matters:

| Concept | Meaning |
|---|---|
| **Engagement** | "We've agreed to work together." The confirmed work order. This is what carries the job through IN_PROGRESS → COMPLETED → paid → reviewed. |

```
Worker applies ─┐
                 ├─► Hirer accepts ─► ENGAGEMENT created ─► chat + work order live
Hirer offers  ──┘   Worker accepts ─┘
```

**Why this matters:** a clean Engagement object is what everything downstream hangs off — messaging permission, the "mark complete" handshake, payment release, and the review pair. Trying to bolt all of that onto a nullable-jobId Application is where the current architecture would buckle. The Engagement is the redesign's keystone.

### 10.3 Applying, from Ravi's side

```
Job card ──► tap ──► sees full detail + who's hiring (hirer rating!) ──► [ Apply ]
                                                                            │
                                    one tap, no cover letter, no form ──────┘
                                                                            ▼
                                              "Applied ✓ — hirer notified. We'll ping you."
```

Applying must be **one tap.** No cover letter, no essay — Ravi's profile *is* his application. The friction of applying should be near zero; the friction of *being accepted* is where quality is enforced.

---

## 11. Hiring — the mutual handshake

The moment of hiring is the highest-stakes moment in the product for both people. It deserves an explicit, mutual, unambiguous handshake — not a silent status flip.

```
Hirer reviews applicants (sorted by fit: distance · rating · availability)
        │
        ▼
Hirer taps [ Accept ]  on a worker
        │
        ▼
Worker gets a loud notification: "🎉 Sunita wants to hire you for Masonry, ₹800/day, tomorrow"
        │
        ├── Worker taps [ Confirm ]  ─► ENGAGEMENT active, both see agreed terms
        │
        └── Worker taps [ Decline ]  ─► slot reopens, hirer notified, job stays OPEN
```

**Key redesign:** hiring is a **two-sided confirmation.** In Phase 2, the hirer accepting is the end of the story and the worker has no say. But the worker might already be booked, or the terms changed in chat. Requiring the worker's confirmation turns "accepted" into a genuine agreement and prevents no-shows born of one-sided assumptions.

When enough workers confirm to meet `workersRequired`, the job moves to **FILLED**, remaining applicants are auto-notified with a polite decline, and the engagement(s) proceed toward the work.

---

## 12. Messaging — a channel that opens exactly when trust is established, and protects both numbers

Phase 2 already gets the big idea right: **messaging is gated behind a real interaction.** The redesign refines *when* the gate opens and *what it protects.*

### 12.1 When chat opens

```
Application accepted  ─┐
                        ├─► chat channel opens between the two parties, tied to the Engagement
Offer accepted        ─┘
```

Chat is scoped to the engagement/interaction, so both people always have context ("this is about the masonry job tomorrow") rather than a contextless DM.

### 12.2 What it protects — number masking

Neither party's real phone number is exposed. This is the promise that makes Sunita comfortable and keeps the middleman out. If a call is needed, it can be **proxied/masked** (a relay number) so the platform stays in the loop and personal numbers stay private. This is also a business moat: if people exchange numbers and leave, the platform dies — so the in-app channel must be *better* than swapping numbers (context, history, safety, payment, dispute record all live here).

### 12.3 Practical chat affordances for this user

- **Quick-reply chips** in the user's language ("What time?", "Confirmed", "Share location", "On my way") — because typing is expensive for Ravi.
- **Voice messages** — again, speaking beats typing.
- **Location share** — one tap to send the job site pin.
- **Structured "propose terms" card** inside chat — wage/time/date proposed and accepted in a tappable card, which then updates the Engagement's agreed terms. This turns loose chat into a binding agreement without a separate screen.
- Real-time delivery, read receipts, typing indicators — already present in Phase 2; keep them.

---

## 13. Completion & Payment — the loop the current product doesn't close

This is the most important *new* section, because a marketplace that never touches the transaction never earns trust and never earns revenue.

### 13.1 The completion handshake

```
Work happens in the real world
        │
        ▼
Either party taps [ Mark work done ]
        │
        ▼
The other party gets: "Did Ravi complete the masonry work?"  [ Yes, done ] [ Not yet / Problem ]
        │
        ├── Both confirm ─► ENGAGEMENT → COMPLETED ─► payment step unlocks, reviews unlock
        │
        └── Dispute raised ─► goes to [ DISPUTED ] ─► admin/trust team adjudicates
```

Mutual confirmation of completion is what makes a review *honest* (you rate work that actually happened) and what safely releases payment.

### 13.2 Payment flow — phased, trust-building, honest about cash reality

The Indian informal market runs on **cash**. Pretending otherwise loses the user. So payments roll out in stages, meeting the market where it is and moving it forward.

**Stage A — Cash, logged (launch reality).**
Payment happens in cash, off-platform, as it always has. The platform simply **records** it: the hirer taps "Paid ₹800 in cash," the worker confirms receipt. No money touches KaamSetu, but now there is a *record* — which feeds the hirer's "pays on time" stat and the worker's earnings history. This builds the trust data with zero payment-infrastructure risk.

```
COMPLETED ─► Hirer: [ I paid ₹800 (cash) ] ─► Worker: [ Received ✓ ] ─► payment logged
                                                          │
                                                          ▼
                                    feeds hirer "pays on time" + worker earnings ledger
```

**Stage B — In-app digital payment (UPI).**
Hirer pays the worker directly via UPI *through* KaamSetu. Instant, familiar (UPI is ubiquitous in India), and now the money leaves a first-party record. Still no float held by the platform.

**Stage C — Escrow (the trust endgame).**
For higher-value or first-time engagements, the hirer funds the job **into escrow at hiring time.** The worker can see "payment secured" before lifting a finger — killing his single biggest fear. On mutual completion, escrow releases to the worker. On dispute, the trust team adjudicates before release.

```
Hire ─► Hirer funds escrow ─► Worker sees "₹800 secured 🔒" ─► work happens
                                                                    │
                                              COMPLETED (both confirm) ─► escrow releases to worker
                                                                    │
                                                     DISPUTED ─► held ─► trust team decides
```

**Revenue model (surfaced honestly):** KaamSetu can sustain itself with a small platform/convenience fee on digital and escrow transactions — *not* a middleman's margin skimmed off the top of the worker's wage. The distinction is the whole point of the product: the fee is transparent, flat, and buys real value (secured payment, dispute resolution, records). Stage A/B can be free to drive adoption; escrow (Stage C) justifies a fee because it delivers genuine security.

---

## 14. Ratings & Reputation — two-sided, tied to real completed work

### 14.1 Both sides rate, and only after real completion

```
ENGAGEMENT → COMPLETED
        │
        ├─► Hirer rates worker  (skill, punctuality, behaviour)  1–5 ★ + optional comment/voice
        │
        └─► Worker rates hirer  (paid fairly, paid on time, respectful)  1–5 ★ + optional
```

- **Reviews require a COMPLETED engagement** — not merely a "filled" job. This closes the current loophole where a review could attach to work that never actually finished.
- **Two-sided.** Worker→hirer reviews are new and essential (Section 7). A worker's biggest risk — not getting paid — is finally reflected in the hirer's public reputation.
- **Ratings are role-scoped** for dual-mode users (Section 7.2).
- **Structured + unstructured.** Tap-able facets (On time? Paid fairly? Clean work?) give legible, aggregatable signals; optional free-text/voice adds colour. Facets matter more than prose for a low-literacy audience on both the writing and reading side.
- **Recompute average on every create/update/delete** (Phase 2 already does this for workers; extend symmetrically to hirers).

### 14.2 Reputation is the real product

Everything above — verification, escrow, completion handshakes — exists to feed one asset: a **portable, hard-to-fake reputation** that replaces the word-of-mouth network a worker loses when he moves to a new city. That reputation is the reason a worker can't afford to leave the platform and the reason a hirer trusts a stranger. Protect it fiercely: no fake reviews (reviews only from real completed engagements), no pay-to-remove, visible dispute outcomes.

---

## 15. Notifications — the nervous system, redesigned for reach

The current system emits real-time Socket.IO events but has **no persistent notification store and no reach when the app is closed** (Known gaps: NotificationBell unwired, no push). For a *today* marketplace, a notification the user doesn't see is a match that didn't happen.

### 15.1 Three delivery tiers, chosen by urgency and app state

```
Event occurs
     │
     ├─ App open        ─► in-app real-time (Socket.IO)  + 🔔 bell (persistent, from a stored feed)
     │
     ├─ App closed      ─► Push notification (FCM)
     │
     └─ Critical + no push reach ─► SMS / WhatsApp fallback
        (e.g. "You're hired!", "Payment received", OTP)
```

**Every notification is persisted** to a per-user feed backed by the bell icon, so nothing is lost if the socket wasn't connected — this is what finally wires up the orphaned `NotificationBell` component into a real data source.

### 15.2 What actually deserves a notification (and how loud)

| Event | Worker | Hirer | Channel weight |
|---|---|---|---|
| New matching job nearby | 🔔 push | — | high (this *is* the marketplace) |
| Application received | — | 🔔 | high |
| You're hired / offer accepted | 🔔🔊 push + SMS | 🔔 | critical |
| New message | 🔔 push | 🔔 push | medium |
| Work marked done — confirm? | 🔔 push | 🔔 push | high |
| Payment received / released | 🔔 + SMS | 🔔 | critical |
| New review received | 🔔 | 🔔 | low |
| Job cancelled (you'd applied) | 🔔 push | — | high (fixes Known Issue #4) |

**Discipline:** notifications are a budget, not a firehose. Over-notify and Ravi turns them off, and then the *today* marketplace goes dark for him. Batch the low-value ones (daily "5 new jobs near you" digest), interrupt only for the critical ones (hired, paid, message).

---

## 16. Search & Discovery — keep the good, fix the foundation

Phase 2's search is already sophisticated (mode-aware, distance + smart composite scoring, filters, i18n). The redesign is mostly *architectural hardening* plus a few product refinements.

### 16.1 Product refinements

- **Discovery is push *and* pull.** Pull (worker browses jobs, hirer searches workers) stays. Push (a new job actively pings nearby workers — Section 9) is added. The best marketplaces reduce the need to search by proactively matching.
- **Ranking that serves the mission:** distance first, then trust (rating + completed count), then wage fit, then recency and availability. A nearby, trusted, available worker should always float up. Availability (`isAvailable` green) should be a hard boost — an unavailable worker at the top of results is a broken promise.
- **Zero-result kindness.** If nothing is nearby, widen the radius automatically and say so ("Nothing within 5 km — showing within 15 km"), rather than showing an empty screen that reads as "this app is dead."
- **Voice & vernacular search** — Ravi should be able to *say* "mistri kaam" and get masonry jobs.

### 16.2 Architectural foundation (called out because it gates everything above)

The current implementation loads **all** matching documents into memory and filters/paginates in JavaScript (Known Issues #1, #6). This works at demo scale and collapses at city scale. The redesign requires:

- Store location as **GeoJSON + a `2dsphere` index**, query with `$geoNear` in an aggregation pipeline, and paginate at the **database** layer.
- This isn't a nice-to-have; every workflow in this document that says "nearby" depends on it being fast. It is the single most important non-user-facing prerequisite for Phase 3 scale.

---

## 17. Redesigned data concepts (product-level, not schema)

To make the workflows above coherent, the product's core objects evolve like this. This is the *conceptual* model — engineering will translate it.

| Object | Phase 2 today | Phase 3 redesign | Why |
|---|---|---|---|
| **User** | email/password identity, `activeMode` | phone-first identity, optional email, verification tier, per-role reputation | matches the real user; trust tiers |
| **WorkerProfile** | category, skills, wage, availability, portfolio, rating | + voice intro, verification badge, earnings ledger | richer shopfront, trust |
| **HirerProfile** | (implicit, thin) | first-class: hirer rating, "pays on time," hire history | trust flows both ways |
| **Job** | open → filled/cancelled | + in_progress, completed, expired states; wage guidance | models the work, not just the post |
| **Application** | worker→job *and* hirer→worker (overloaded, nullable jobId) | worker→job **only** | one clean meaning |
| **Offer** *(new)* | — | hirer→worker expression of interest | separates the two directions cleanly |
| **Engagement** *(new)* | — | the confirmed work order: terms, lifecycle, payment, review pair | the keystone the whole downstream hangs on |
| **Payment** *(new)* | — | cash-logged → UPI → escrow, tied to Engagement | closes the loop, enables trust + revenue |
| **Review** | hirer→worker only | two-sided, requires COMPLETED engagement, facet-based | honest, symmetric reputation |
| **Notification** *(new)* | ephemeral socket events | persisted per-user feed + multi-channel delivery | nothing lost; reach when app closed |

---

## 18. The complete redesigned lifecycle, on one page

```
 REGISTER (phone+OTP)                    ┌──────────── HIRER ────────────┐
        │                                │                               │
   "What brings you here?"          POST JOB (broadcast)          SEARCH WORKER
        │                                │                               │
  ┌─────┴─────┐                          │                          SEND OFFER
  ▼           ▼                          │                               │
WORKER      HIRER                        ▼                               ▼
onboard     (light)               applications arrive            worker receives offer
  │           │                          │                               │
  ▼           ▼                          └───────────┬───────────────────┘
Build       Switch                                   ▼
profile     to Hire                        ┌── MUTUAL HANDSHAKE ──┐
  │                                        │ hirer accepts +       │
Go 🟢                                       │ worker confirms       │
Available                                  └──────────┬────────────┘
  │                                                   ▼
  └────────── discovered / browses ──────►  ENGAGEMENT created
                                                      │
                                            CHAT opens (numbers masked)
                                            + agree terms (in-chat card)
                                                      │
                                    (escrow funded here, if Stage C)
                                                      │
                                              WORK IN PROGRESS
                                                      │
                                          COMPLETION HANDSHAKE
                                          (both confirm "done")
                                                      │
                                                  COMPLETED
                                                      │
                                    PAYMENT (cash-logged / UPI / escrow release)
                                                      │
                                        TWO-SIDED RATINGS exchanged
                                                      │
                                     REPUTATION compounds on both sides
                                                      │
                                        (feeds ranking, trust, next match)
```

---

## 19. What changes vs. Phase 2 — a decision summary

| # | Change | From → To | Primary beneficiary |
|---|---|---|---|
| 1 | Identity | email/password → **phone + OTP** | Worker (Ravi) |
| 2 | First run | mode modal → **intent-first onboarding** | Both |
| 3 | Worker onboarding | 8-step wall → **progressive strength ladder** | Worker |
| 4 | Worker profile | text bio → **+ voice intro, verification badge** | Both |
| 5 | Hirer | invisible → **first-class profile + reputation** | Worker |
| 6 | Reviews | one-sided → **two-sided, require COMPLETED** | Worker |
| 7 | Interest model | overloaded Application → **Application + Offer split** | Engineering/clarity |
| 8 | Core object | (none) → **Engagement work-order** | Everyone |
| 9 | Job lifecycle | open→filled → **+ in_progress, completed, expired** | Both |
| 10 | Hiring | one-sided accept → **mutual confirmation handshake** | Both |
| 11 | Completion | (unmodelled) → **mutual "work done" handshake** | Both |
| 12 | Payments | (none) → **cash-logged → UPI → escrow** | Both + business |
| 13 | Job posting | passive listing → **active broadcast to nearby workers + wage guidance** | Both |
| 14 | Notifications | ephemeral sockets → **persisted feed + push + SMS/WhatsApp** | Both |
| 15 | Messaging | open channel → **number-masked, in-chat terms card** | Both + business moat |
| 16 | Search foundation | in-memory filter → **geospatial index + DB pagination** | Scale/everyone |
| 17 | Cancellation | hirer-only notice → **applicants notified** | Worker |

---

## 20. Guiding principles to hold the line on (the "north star" checklist)

When any future feature decision is ambiguous, run it against these:

1. **Does it reduce friction for the worker or fear for the hirer?** If neither, cut it.
2. **Phone-first, voice-friendly, one-thumb, sunlight-readable.** The harder user wins design ties.
3. **Trust is earned in visible tiers** — never demand more proof than the moment requires.
4. **Every transaction leaves a record; every record feeds a reputation.** Reputation is the moat.
5. **No middleman margin — only a transparent fee for real value** (escrow, disputes, records).
6. **Notifications are a budget, not a firehose.** Interrupt only for hired / paid / message.
7. **Nearby beats great-but-far.** Locality is the whole premise; ranking must honour it.
8. **The Engagement is sacred** — it is the single object where agreement, work, money, and reputation meet. Model it well and the rest follows.

---

*End of Phase 3 Product Workflow Redesign.*
```

