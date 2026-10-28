# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-29

First release.

### Added
- Authentication: register, login, logout with server-side token revocation (`tokenVersion`), 24h JWT sessions.
- Trip planner: geocoding via Nominatim, routing via OSRM, and fare calculation (with student/discount handling).
- Trip history per user.
- Admin fare-matrix publish workflow (draft, publish, conflict handling with 409).
- Notifications: in-app and Web Push (service worker, VAPID).
- Self-hosted, privacy-preserving page analytics with an admin dashboard.
- Docker Compose setup (`docker compose up --build`) with optional demo data seeding (`SEED_DEMO_DATA`).
- GitHub Actions CI (lint, typecheck, tests, build, advisory `npm audit`).

### Changed
- Web port is bound to 127.0.0.1 by default.
- Nonce-based Content Security Policy enforced.

### Security
- Proxy ignores client `X-Forwarded-For` unless `TRUST_PROXY_HEADERS=true`; global and per-account auth throttling.
- Hardened post-login redirect validation (control characters, backslashes, origin check, dot-segment open redirect).
- Origin check on the session-clear route.
- Push endpoint host allow-list, per-user subscription cap, no cross-user rebinding.
- Demo accounts seeded only when `SEED_DEMO_DATA=true`.
- Patched transitive dependency advisories; CI runs with least privilege.
- Known residual risks: shared local auth rate limit without a trusted proxy; unreachable web dependency advisories.

[1.0.0]: https://github.com/13urning/parapo/releases/tag/v1.0.0
