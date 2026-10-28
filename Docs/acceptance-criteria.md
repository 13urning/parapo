# ParaPo — Acceptance Criteria

ParaPo ("Para po!") is a jeepney fare calculator and trip log for Filipino commuters,
with an admin workflow for publishing fare-matrix updates.

## Plan summary

- **Objective / audience:** Full Stack Developer tech exam submission. Graders must be able
  to clone and run it with one command.
- **Stack:** Next.js (App Router, TypeScript) frontend · NestJS API · PostgreSQL via Prisma ·
  Docker Compose.
- **In scope:** auth (login/register), commuter trip-planning workflow, admin fare-matrix
  workflow, Web Push notifications, self-hosted page analytics, unit tests, README.
- **Out of scope:** real payments, native mobile/Flutter app, production cloud deployment,
  official LTFRB data sync (fares are seeded from published LTFRB values and editable by admins).
- **Constraints:** 3-day exam window; must run out of the box (`docker compose up`); no
  secrets committed; public GitHub repo under a personal account.
- **Greenfield.**

## Functional requirements

### AC-1 Authentication (login page — required)
- AC-1.1 A user can register (name, email, password ≥ 8 chars, fare category).
- AC-1.2 A user can log in with email/password; invalid credentials show a generic error.
- AC-1.3 Sessions use a signed JWT in an `httpOnly`, `SameSite=Lax` cookie; logout clears it.
- AC-1.4 Unauthenticated users are redirected to `/login` from protected routes.
- AC-1.5 Two roles exist: `COMMUTER` and `ADMIN`. Admin routes return 403 for commuters (API)
  and are hidden/redirected in the UI.
- AC-1.6 Seeded demo accounts (one commuter, one admin) are documented in the README.

### AC-2 Workflow 1 — Commuter: plan a trip and log it
- AC-2.1 **Plan Trip screen:** user searches an origin and destination (geocoded by the public
  OpenStreetMap Nominatim API, proxied through our API) and sees both on a map.
- AC-2.2 Road distance is fetched from the public OSRM routing API; if unavailable, the API
  falls back to a straight-line × 1.3 estimate and the UI labels it "estimated".
- AC-2.3 The fare is computed from the currently published fare matrix for the selected vehicle
  type: base fare covers the first N km, plus the per-km rate for each succeeding km
  (rounded up), rounded to the nearest ₱0.25. Discounted categories (student, senior, PWD) get
  the matrix's discount (default 20%).
- AC-2.4 The user can save the trip to their log.
- AC-2.5 **Trip History screen:** lists the user's own trips (paginated, newest first) with
  totals for this month, and lets the user delete their own trips. A user can never read or
  delete another user's trips.

### AC-3 Workflow 2 — Admin: manage and publish fare matrices
- AC-3.1 **Fare Matrices screen:** admin sees matrices per vehicle type with status
  (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
- AC-3.2 **Fare Matrix editor:** admin creates or edits a draft (base fare, base km, per-km
  rate, discount %, effective date, notes) with validation.
- AC-3.3 Publishing a draft archives the previously published matrix for that vehicle type;
  exactly one matrix per vehicle type is published at a time.
- AC-3.4 Publishing notifies all users: an in-app notification is created and a Web Push is
  sent to every subscribed browser.

### AC-4 Notifications
- AC-4.1 Users can opt in to browser push notifications (service worker + VAPID).
- AC-4.2 VAPID keys are read from the environment; if absent, the API generates and persists
  a key pair on first start, so the app works out of the box.
- AC-4.3 A notifications screen/bell lists in-app notifications with unread count and mark-as-read.

### AC-5 Page analytics
- AC-5.1 Each client-side route change records a page view (path, timestamp, user if logged in)
  through the API; no third-party trackers.
- AC-5.2 **Analytics screen (admin):** page views per path and per day for the last 14 days.

## Non-functional requirements

- NFR-1 **Runs out of the box:** `docker compose up --build` starts db, api and web, applies
  migrations and seeds data with no manual steps or secrets to create.
- NFR-2 **Routing:** Next.js App Router with route groups for public/authenticated/admin
  areas; middleware guards protected routes; REST API under `/api/v1`.
- NFR-3 **Code structure:** monorepo `apps/api` and `apps/web`; NestJS feature modules;
  reusable UI components; state through React Query (server state) and context (session).
- NFR-4 **Tests:** unit tests for fare calculation, auth, trips, fare matrices (API, Jest) and
  key components/hooks (web, Vitest + Testing Library); `npm test` passes in both apps.
- NFR-5 **Quality:** ESLint, TypeScript strict and production builds are clean.
- NFR-6 **Security:** passwords hashed with bcrypt; input validated server-side (class-validator,
  whitelist); rate limiting on auth endpoints; Helmet security headers; CORS limited to the web
  origin; no secrets in git; ownership checks on every user-scoped resource (no IDOR).
- NFR-7 **Privacy (RA 10173):** only the minimum personal data is collected (name, email, trips
  the user chooses to save); users can delete their trips; analytics do not store IPs.
- NFR-8 **Performance:** fare computation responds in < 300 ms excluding external API latency;
  external calls time out after 5 s.
- NFR-9 **Docs:** README covers prerequisites, one-command run, demo accounts, architecture,
  tests, and a feature walkthrough.
