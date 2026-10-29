# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, weighted equally:

- **Metro Manila commuters**, mostly students and workers, who check a jeepney or UV Express
  fare on their phone before or during a ride. They are often outdoors, using one hand, on
  patchy mobile data. Discounted riders (student, senior, PWD) care whether the 20% discount
  was applied.
- **Fare administrators**, at a transport desk on a desktop, who draft and publish fare-matrix
  updates and watch page analytics.
- **Exam graders** (the hiring panel of a Full Stack Developer tech exam) judge the same app
  on a laptop for craft, structure and purpose. The app has to work as a real commuter tool on
  mobile and also impress on desktop.

## Product Purpose

ParaPo ("Para po!" is what Filipino passengers call out to stop a jeepney) tells a commuter
the exact fare before they ride: pick an origin and a destination, get the road distance and
the fare from the currently published fare matrix (with any discount applied), and keep a log
of trips and spending. Admins publish fare changes, and every user is notified in-app and by
Web Push. Success means a commuter knows what to pay in a few seconds, and an admin can
publish a fare change with confidence.

## Positioning

The fare comes from the published fare matrix (base fare for the first N km, then a rate for
each additional km, with the discount for the rider's category), applied to the actual road
distance. It is not a guess, and every quote can be traced to the matrix and effective date
behind it.

## Operating Context

- Commuter flow: Plan trip (search places, map, choose vehicle, see the fare quote), then save
  the trip, then My trips (history and monthly spend), Fares (published fare tables), and
  Notifications (bell, push opt-in).
- Admin flow: Fare matrices (by vehicle type; Draft, Published or Archived), then the draft
  editor, then publish (archives the previous matrix and notifies all users), plus Analytics
  (page views by path and day).
- Vehicle types: Traditional jeepney, Modern jeepney, UV Express.
- Fare categories: Regular, Student, Senior, PWD.
- Runs locally with `docker compose up` at http://localhost:3000.

## Capabilities and Constraints

- Next.js 15 App Router + Tailwind frontend, NestJS + PostgreSQL API behind a same-origin
  proxy.
- An enforced nonce-based Content Security Policy: no third-party script origins, inline
  styles allowed, and map tiles only from `*.tile.openstreetmap.org`.
- Maps use Leaflet with OpenStreetMap tiles. Geocoding uses Nominatim and routing uses OSRM;
  when OSRM is unavailable the route falls back to an "estimated" straight-line distance.
- All existing routes, API contracts and tests must keep working.

## Brand Commitments

- The name **ParaPo** and the "Para po!" hook stay.
- The login screen keeps its one-click demo-account helper (commuter `juan@parapo.local`,
  admin `admin@parapo.local`).
- The current palette is **not** binding. Jeepney colors are optional, not required.
- To avoid (confirmed): a generic SaaS-dashboard look (white rounded cards, stat tiles, soft
  shadows), and a dark neon "tech" look.
- **Mobile-first is binding.** Every screen is designed at phone width (390px) first, with
  bottom navigation and thumb-reachable primary actions, then expanded for laptop. A desktop
  layout squeezed down to a phone is a failure.
- Rejected after build (2026-10-29): the "Taripa" posted-fare-guide direction. It read as
  paperwork (notices, rubber stamps, government forms), buried the fare in a dense km-by-fare
  table instead of one clear number, and its condensed caps with flag red/blue and a yellow
  highlighter did not appeal. Do not return to bureaucratic-document metaphors or table-led
  fare answers.

## Evidence on Hand

- Seeded fare matrices are illustrative LTFRB-style values, not an official fare guide, and
  must not be presented as official.
- Demo trips, users and analytics are synthetic seed data.
- There are no real testimonials, ridership numbers or partner logos. None may be invented.

## Product Principles

1. **The fare is the answer.** Every commuter screen leads with the number they came for.
2. **Show the working.** Each fare can be traced to its matrix, its distance and any discount.
3. **Works in a moving vehicle.** Large targets, high contrast in sunlight, one-handed use,
   and graceful behavior on slow data.
4. **Changes are announced, never silent.** A fare update is an event that every rider hears
   about.

## Accessibility & Inclusion

WCAG 2.1 AA contrast, outdoors-legible type sizes, full keyboard operation, and
`prefers-reduced-motion` honored for all animation.
