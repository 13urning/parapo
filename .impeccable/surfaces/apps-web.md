# Surface brief: ParaPo web app (apps/web)

Scope: every route of the web app (login and register, plan, trips, fares, notifications,
admin fare matrices list and editor, admin analytics). Visitor mode: **Operate**. Login leans
Persuade (first impression for graders) but stays a working form.

Audience and job: commuters on phones want their fare in seconds; admins publish fare changes;
graders on laptops judge craft. **Designed at 390px first**, then expanded. Proof: seeded
matrices (illustrative, never "official"), real OSRM distances, synthetic demo trips.
Constraints: behavior, routes, API contracts and tests stay; enforced nonce CSP; Leaflet + OSM.

Memorable moment: the vehicle rows resolving. When a route resolves, the three vehicle rows
fill in their prices one after another and the cheapest takes the "Cheapest" tag; tapping a
row selects it with a spring and the pinned button reads "Log this trip · ₱15.00".

## Direction contract

THESIS: ParaPo quotes a cash fare the way a ride-hailing app quotes a ride: a pickup/drop-off
stack, then one row per vehicle with its price, compared at a glance. It refuses the SaaS
dashboard (stat tiles, card grids, soft-shadow panels) and the posted-document look.

OWN-WORLD: White ground (#FFFFFF), ink #15181C, one brand green (#0B8A5A) for the selected row,
primary button and route line, surface gray #F2F4F3 for inputs and grouped areas, amber #FFB020
only for the Cheapest tag and live state. Full-width rows separated by hairlines, not cards.
Vehicle glyphs as simple line icons. Prices right-aligned in tabular figures. One workhorse sans
with tabular numerals. A pinned full-width primary button above a four-tab bottom bar.

STORY: The commuter types pickup and drop-off, sees all three vehicles priced with their
discount applied, taps one, and logs it. My trips is a ride history grouped by day with a
monthly total. Fares shows each vehicle's matrix as a calculator, not a table wall. Admins
publish a new matrix and every rider is notified.

FIRST VIEWPORT (Plan, 390x844; approved comp .impeccable/mocks/plan-comp-b.png): no map up
front. Small ParaPo wordmark, a large "Where to?" title, the From/To stack joined by a dotted
connector, a slim route strip (sketch of the route line, "6.8 km · View route") that expands
to the full Leaflet map, then "Choose a ride" with the discount note, and three tall vehicle
rows with the price at ~26px right-aligned and the regular fare struck under it. Pinned "Log this
trip · ₱15.00" above bottom tabs Plan, Trips, Fares, Alerts. Laptop (1440x900): the same column
docks left at ~440px and the map fills the right permanently; no new layout family.

FORM: Ride-hailing quote, safer-register round 3 (user-chosen from the familiar end), seed key
fe5f0c25. Kept disciplines: amounts right-aligned tight; the fare is the largest thing on every
commuter screen; whole-unit reflow, never a desktop layout squeezed down.

MOTION GRAMMAR: sheet rises on load (spring, ~350ms); vehicle-row prices resolve in a 40ms
stagger with digits rolling to value; selection springs (scale 0.98 to 1, green fill grows from
the left); route line draws along its path on the map; screen-to-screen slide of 12px plus fade
(~220ms, ease-out); list rows stagger 30ms on mount; pressed buttons scale to 0.97; toasts and
sheets enter from the bottom. Under prefers-reduced-motion: opacity only. Motion never delays
input.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Deliberate departures from comp B

- **No "~22 min" on the vehicle rows.** The comp showed a travel time per row. ParaPo has no
  transit-time source: OSRM's duration is a car's driving time, which says nothing about a
  jeepney's stops or a UV Express's wait. Showing it would be a made-up number, which the
  "Show the working" principle forbids. The row shows the fare only.
- **Initials button in the header.** It is not in the comp. Account details and sign-out sit
  behind it, because the four bottom tabs are reserved for Plan, Trips, Fares and Alerts.
- **Build phases after comps.** The comp is hand-coded HTML with no raster imagery, so the
  spec/plates phases (region grid, plate extraction, font matching by metrics) do not apply;
  its CSS is the spec, and Manrope was chosen directly. Fidelity is checked with
  `comp-diff` of plan-comp-b.png against the shipped Plan capture instead.

## Unresolved

- Typeface: one workhorse sans with tabular numerals, self-hosted via next/font, outside the
  banned-defaults list.
