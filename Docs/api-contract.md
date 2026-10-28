# ParaPo — API Contract (v1)

Shared contract between `apps/api` (NestJS, port 3001, internal only) and `apps/web`
(Next.js, port 3000, the only published port). The browser calls **same-origin**
`/api/v1/*` on the web app; a Next route handler (`app/api/v1/[...path]/route.ts`) proxies to
`${API_INTERNAL_URL}/api/v1/*` (default `http://api:3001`), forwarding method, body, query,
`Cookie` and `Content-Type`, and passing every `Set-Cookie` back unchanged.

## Conventions
- JSON everywhere. Errors: `{ "statusCode": number, "message": string | string[], "error": string }`
  (Nest default). No stack traces.
- Auth cookie: `parapo_session` — JWT (HS256, 24h, revocable via `tokenVersion` on logout), `httpOnly`, `SameSite=Lax`, `Path=/`,
  `Secure` when `COOKIE_SECURE=true` (default true when `NODE_ENV=production`; compose sets
  `false` because local runs over plain http). JWT payload: `{ sub, role, name }`.
- Web middleware reads only the cookie's presence and decodes (not verifies) `role` for UX
  redirects. The API is the sole authority.
- Money values are numbers in PHP, 2 decimals. Distances in km, 2 decimals.
- Pagination: `?page=1&pageSize=10` → `{ items, page, pageSize, total }`.
- Enums: `Role = COMMUTER | ADMIN`; `FareCategory = REGULAR | STUDENT | SENIOR | PWD`;
  `VehicleType = TRADITIONAL_JEEPNEY | MODERN_JEEPNEY | UV_EXPRESS`;
  `MatrixStatus = DRAFT | PUBLISHED | ARCHIVED`.

## Auth — `/api/v1/auth`
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/register` | public, throttled | `{ name, email, password (≥8), fareCategory }` | `201 User` + sets cookie |
| POST | `/login` | public, throttled 5/min/IP | `{ email, password }` | `200 User` + sets cookie; `401 "Invalid email or password"` |
| POST | `/logout` | any | – | `204`, clears cookie |
| GET | `/me` | user | – | `200 User` |

`User = { id, name, email, role, fareCategory, createdAt }`

## Places (proxy to public APIs) — `/api/v1/places`
| Method | Path | Auth | Query | Response |
|---|---|---|---|---|
| GET | `/search` | user | `q` (≥3 chars) | `Place[]` (max 5, Nominatim, `countrycodes=ph`) |
| GET | `/route` | user | `fromLat, fromLng, toLat, toLng` | `{ distanceKm, durationMin \| null, estimated: boolean, geometry: [lat,lng][] }` |

`Place = { label, lat, lng }`. OSRM failure/timeout (5 s) → haversine × 1.3, `estimated: true`,
`geometry` = straight line.

## Fares — `/api/v1/fares`
| Method | Path | Auth | Body/Query | Response |
|---|---|---|---|---|
| GET | `/quote` | user | `vehicleType, distanceKm, fareCategory?` (defaults to user's) | `FareQuote` |

`FareQuote = { vehicleType, distanceKm, fareCategory, regularFare, discountApplied, fare, matrixId, matrixEffectiveDate }`

**Fare formula** (pure function, unit-tested): `extraKm = max(0, ceil(distanceKm - baseKm))`;
`regular = baseFare + extraKm * perKmRate`; discounted categories pay
`regular * (1 - discountPercent/100)`; final fare rounded to nearest ₱0.25. Distance ≤ 0 → 400.
404 if no published matrix for the vehicle type.

## Trips — `/api/v1/trips` (owner-scoped; every query filters by `userId = req.user.sub`)
| Method | Path | Auth | Body/Query | Response |
|---|---|---|---|---|
| POST | `/` | user | `{ originLabel, originLat, originLng, destLabel, destLat, destLng, vehicleType, distanceKm, estimated }` | `201 Trip` — fare is **recomputed server-side**, never trusted from client |
| GET | `/` | user | `page, pageSize` | `Paginated<Trip>` |
| GET | `/summary` | user | – | `{ monthTotal, monthTrips, allTimeTrips }` |
| DELETE | `/:id` | user | – | `204`; `404` if not found **or not owned** |

`Trip = { id, originLabel, destLabel, originLat, originLng, destLat, destLng, vehicleType, distanceKm, estimated, fareCategory, fare, createdAt }`

## Fare matrices — `/api/v1/fare-matrices`
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/` | user | `?status=` optional | `FareMatrix[]` (commuters only see PUBLISHED) |
| GET | `/:id` | admin | – | `FareMatrix` |
| POST | `/` | admin | `{ vehicleType, baseFare, baseKm, perKmRate, discountPercent, effectiveDate, notes? }` | `201 FareMatrix` (DRAFT) |
| PATCH | `/:id` | admin | partial of above | `200` — only DRAFT editable (409 otherwise) |
| POST | `/:id/publish` | admin | – | `200 FareMatrix` — transaction: archive current PUBLISHED for that vehicle type, publish this, create Notification for every user, then fire Web Push (async, allSettled; delete 404/410 subs) |
| DELETE | `/:id` | admin | – | `204` — DRAFT only |

`FareMatrix = { id, vehicleType, baseFare, baseKm, perKmRate, discountPercent, effectiveDate, status, notes, publishedAt, createdAt }`
Validation: baseFare 1–200, baseKm 1–20, perKmRate 0–50, discountPercent 0–100.

## Notifications — `/api/v1/notifications`
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| GET | `/` | user | – | `{ items: Notification[], unread: number }` (latest 50) |
| POST | `/:id/read` | user | – | `204` (owner only) |
| POST | `/read-all` | user | – | `204` |
| GET | `/push/public-key` | user | – | `{ publicKey }` |
| POST | `/push/subscribe` | user | `{ endpoint, keys: { p256dh, auth } }` | `201` (upsert by endpoint, bound to user) |
| POST | `/push/unsubscribe` | user | `{ endpoint }` | `204` |

`Notification = { id, title, body, url, readAt, createdAt }`. Push payload JSON: `{ title, body, url }`.

## Analytics — `/api/v1/analytics`
| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/pageview` | public, throttled | `{ path }` (≤ 200 chars, must start with `/`) | `204`; stores path, userId if cookie valid, timestamp. No IP, no UA. |
| GET | `/summary` | admin | `?days=14` (1–90) | `{ byPath: {path, views}[], byDay: {date, views}[], total }` |

## Health
`GET /api/v1/health` → `{ status: "ok", db: "ok" }` (public; used by compose healthcheck).

## Seed data
- Admin: `admin@parapo.local` / `Admin#2026`
- Commuter: `juan@parapo.local` / `Commuter#2026` (STUDENT)
- Published matrices (LTFRB-style values): Traditional jeepney ₱13.00 first 4 km + ₱1.80/km;
  Modern jeepney ₱15.00 first 4 km + ₱2.20/km; UV Express ₱2.40/km with 1 km base at ₱2.40 —
  i.e. `baseFare 2.40, baseKm 1, perKmRate 2.40`. Discount 20% for all.
- A few sample trips for Juan.

## Secrets / config (`apps/api`)
`DATABASE_URL` (required, fail closed), `JWT_SECRET` (optional: if absent, generate 64 random
bytes and persist in `AppSecret` table, reuse thereafter), `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/
`VAPID_SUBJECT` (same generate-and-persist pattern), `WEB_ORIGIN` (CORS), `COOKIE_SECURE`,
`NOMINATIM_USER_AGENT`. No `|| 'dev'` literal fallbacks for secrets.
