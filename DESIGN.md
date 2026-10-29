---
name: ParaPo
description: Know your jeepney fare before you ride, quoted the way a ride-hailing app quotes a ride.
colors:
  ground: "#FFFFFF"
  ink: "#15181C"
  ink-soft: "#545B66"
  ink-faint: "#5F6670"
  connector: "#8A9099"
  line: "#E6E8E7"
  surface: "#F2F4F3"
  surface-deep: "#E8ECEA"
  mapbg: "#E9EEE9"
  brand: "#08744C"
  brand-dark: "#065C3C"
  brand-50: "#E7F4EE"
  signal: "#FFB020"
  signal-ink: "#3A2A00"
  danger: "#B42318"
  danger-50: "#FDECEA"
typography:
  display:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "'tnum' 1"
  figure-xl:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "56px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "'tnum' 1"
  figure-lg:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "'tnum' 1"
  headline:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  figure-row:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "'tnum' 1"
  figure-sm:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "-0.01em"
    fontFeature: "'tnum' 1"
  title:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: 1.5
  section:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 800
    lineHeight: 1.5
  body-strong:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.375
  label:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.43
  meta:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.375
  tag:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: "20px"
  tab:
    fontFamily: "Manrope, system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: 1
rounded:
  tag: "6px"
  inner: "11px"
  tile: "12px"
  control: "14px"
  rail-item: "16px"
  sheet: "24px"
  auth-sheet: "28px"
  full: "9999px"
spacing:
  hairline: "1px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  row-y: "18px"
  gutter-phone: "20px"
  gutter-column: "24px"
  gutter-laptop: "40px"
  tap-min: "44px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.ground}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.brand-dark}"
    textColor: "{colors.ground}"
  button-primary-disabled:
    backgroundColor: "{colors.surface-deep}"
    textColor: "{colors.ink-faint}"
  button-primary-lg:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.ground}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "56px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.surface}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.ground}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "48px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
    height: "48px"
  field-focus:
    backgroundColor: "{colors.ground}"
  field-error:
    backgroundColor: "{colors.danger-50}"
  vehicle-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "18px 16px"
  vehicle-row-selected:
    backgroundColor: "{colors.brand-50}"
  vehicle-glyph:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    size: "44px"
  tag-cheapest:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    typography: "{typography.tag}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  tag-neutral:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  tag-green:
    backgroundColor: "{colors.brand-50}"
    textColor: "{colors.brand-dark}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  tag-red:
    backgroundColor: "{colors.danger-50}"
    textColor: "{colors.danger}"
    rounded: "{rounded.tag}"
    padding: "2px 8px"
  route-strip:
    backgroundColor: "{colors.mapbg}"
    textColor: "{colors.brand-dark}"
    rounded: "{rounded.control}"
    height: "64px"
  segmented:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "4px"
  segmented-active:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    height: "44px"
  nav-tab:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.tab}"
    height: "56px"
  nav-tab-active:
    textColor: "{colors.brand}"
  nav-tab-indicator:
    backgroundColor: "{colors.brand-50}"
    rounded: "{rounded.full}"
    width: "48px"
    height: "28px"
---

# Design System: ParaPo

## Overview

**Creative North Star: "The Ride-Hailing Quote"**

ParaPo quotes a cash jeepney fare the way a ride-hailing app quotes a ride: a pickup and drop-off stack, a slim sketch of the route, then one tall row per vehicle with its price right-aligned, compared at a glance. The ground is plain white, the type is one workhorse sans set heavy, and a single green carries everything that means "this one" or "go": the selected ride, the primary button, the route line, the active tab. Nothing is boxed for decoration. Rows sit on the white ground separated by space or hairlines, and only grouped inputs and the route strip sit on a pale gray tone.

The system is built at 390px first and reflows whole to the laptop: the same column docks at the left (440px on Plan) while the map fills the rest, and the bottom tab bar becomes a left rail. Density is generous and thumb-led: every target is at least 44px, primary actions pin above the tab bar, and type never drops below 11px (tab labels) with body copy at 15px.

Motion is quiet and physical: screens slide 12px up while fading in, prices count up to value one row after another, the selected row fills with green from the left, and the route draws itself along its path. Under reduced motion everything only fades. The system confirms two visual rejections: the generic SaaS dashboard (white cards, stat tiles, soft-shadow panels) and the dark neon "tech" look; and it must not return to bureaucratic-document metaphors or table-led fare answers.

**Key Characteristics:**
- White ground, near-black ink, one brand green, amber reserved for the Cheapest tag.
- One typeface (Manrope via next/font) with tabular figures everywhere.
- Fares are extrabold tabular numerals, right-aligned, and lead their row.
- Rows and hairlines, not cards; pale gray tone groups inputs.
- One 14px corner on every control, row, strip and toast.
- Phone tab bar becomes a laptop rail; the phone column docks left beside a permanent map.
- Motion settles on long expo-out curves and never delays input; reduced motion fades only.

## Colors

A cool near-monochrome of white, ink and pale green-gray, with one saturated green for intent and one amber spark for the best deal.

### Primary
- **Jeepney Green** (brand): the selected vehicle row's ring and tint, the primary button, the route line on the map and in the route strip, the "Po" of the wordmark, the active tab, focus outlines, text caret, unread dots, link text and discount figures ("−20%"). It clears 4.5:1 on white and on its own tint, so it may carry text.
- **Deep Jeepney** (brand-dark): primary button hover; text on green tints (green tag, route-strip distance label).
- **Mint Wash** (brand-50): the selected-row fill, the active tab's indicator pill, unread notification rows, the green tag ground.

### Secondary
- **Cheapest Amber** (signal) with **Amber Ink** (signal-ink): the "Cheapest" tag on the vehicle row, nowhere else in the shipped build.

### Neutral
- **Ground White** (ground): every page background, the bottom bar, sheets and dropdowns.
- **Commuter Ink** (ink): headlines, fares, row names, input text, the drop-off square marker.
- **Slate** (ink-soft): secondary text, descriptions, meta lines, inactive tab labels, the "Para" of the wordmark.
- **Placeholder Slate** (ink-faint): placeholders (5.3:1 on surface gray) and disabled button text.
- **Connector Gray** (connector): non-text strokes only: the dotted From/To connector and the switch track when off. At 3.2:1 on white it must never carry text. It is hard-coded in two components, not yet a Tailwind token.
- **Hairline** (line): row dividers, the tab bar's top border, the rail's right border, the laptop column divider, the sheet grabber.
- **Surface Gray** (surface): input fields, the From/To stack, segmented controls, secondary buttons, vehicle glyph tiles, skeletons, the account initials button.
- **Pressed Gray** (surface-deep): secondary hover and the disabled primary button.
- **Map Ground** (mapbg): the route strip and the Leaflet container behind tiles.
- **Signal Red** (danger) and **Red Wash** (danger-50): errors, invalid fields, the destructive Sign out button, the unread count badge.

### Named Rules
**The One Green Rule.** Green means intent: selected, primary, route, active, link. It is never a decorative fill or a section background inside the app; the only full-green field is the login brand panel.

**The Earned Amber Rule.** Amber marks the single cheapest ride and nothing else. Draft matrices, warnings and estimates stay neutral gray; a second amber element on a screen breaks the rule.

## Typography

**Display Font:** Manrope (self-hosted via next/font, with system-ui, -apple-system, Segoe UI, Roboto fallback)
**Body Font:** Manrope
**Label/Mono Font:** none; labels and figures are Manrope with tabular numerals

**Character:** One geometric-humanist workhorse used heavy: extrabold (800) for headlines and every amount, bold (700) for labels and actions, semibold (600) for values and input text, regular for running copy. Tabular figures are switched on at the body so money and kilometres align and do not jitter while they roll.

### Hierarchy
- **Figure XL** (800, 56px, line-height 1, −0.03em): the Fares calculator result.
- **Display / Figure L** (800, 44px, line-height 1, −0.03em): "Spent this month" total on Trips; the "Para po!" line on the login brand panel, which grows to 72px on laptop.
- **Headline** (800, 30px, line-height 1.25, −0.02em): screen titles ("Where to?", page headers). Login and register use 28px.
- **Figure Row** (800, 26px, line-height 1, −0.02em): the fare in each vehicle row, with the struck regular fare beneath at 12px medium.
- **Figure S** (800, 20px, −0.01em): fares in trip-history rows.
- **Title** (800, 18 to 20px): empty-state titles (18px), sheet and dialog titles (20px).
- **Section** (800, 15px): in-screen section heads ("Choose a ride"); day group heads in Trips run 13px extrabold in Slate.
- **Body Strong** (700, 16px, line-height 1.25): vehicle names, button labels; inputs run 16px semibold so iOS never zooms.
- **Body** (400, 15px, line-height 1.375): descriptions, notification bodies, helper copy.
- **Label** (700, 14px): field labels, segmented options.
- **Meta** (500 to 600, 13px): vehicle descriptors, dates, discount notes, fine print.
- **Tag** (800, 12px, 20px line): status and Cheapest tags.
- **Tab** (700, 11px, line-height 1): bottom-bar and rail labels.

### Named Rules
**The Tabular Everywhere Rule.** `tnum` is on at the body. Never turn it off for an amount, a distance or a count.

**The Number Leads Rule.** An amount is always extrabold, ink, right-aligned in its row, and the heaviest element in its row or section. On Trips and Fares it is the largest type on the screen; on Plan the 30px "Where to?" title is larger than the 26px row fare, as the approved comp specifies.

**The Sentence Case Rule.** Labels, tags, headings and tabs are sentence case. The shipped system has no uppercase or letter-spaced labels and no small label set above a title.

## Layout

**Phone (designed first, 390px).** A 52px top bar (`--head-h`) holds the wordmark and the 44px initials button. A 64px bottom tab bar plus the home-indicator inset (`--nav-h`) holds Plan, Trips, Fares, Alerts, and Admin for administrators. Screens use 20px side gutters. A primary action that belongs to the screen pins in a StickyAction directly above the tab bar, on a white gradient that fades content beneath it; it measures itself into `--sticky-action-h`, which becomes `--toast-lift` so toasts rise clear of it.

**Laptop (1024px and up).** The same navigation becomes a 96px left rail (wordmark at top, account button at bottom); `--nav-h`, `--head-h` and `--toast-lift` all zero out. Plan becomes a two-column grid: the phone column docks left at 440px (24px gutters, its own scroll, a hairline on its right edge) and the Leaflet map fills the rest, sticky at full viewport height. Other screens center a reading column of 680px (880px for wide admin screens) with 40px gutters. No new layout family appears at laptop width.

**Rhythm.** A 4px base. Vehicle rows pad 18px by 16px with 2px between rows; list rows pad 12 to 16px and divide with hairlines; section gaps run 20 to 24px. Every interactive element keeps a 44px minimum (buttons 44, 48 or 56px; tabs 56px; rail items 72px).

**Breakpoints.** `sm` 640px (segmented controls switch from short to full labels); `lg` 1024px (rail, docked column, permanent map). Hover styles apply only on devices that can hover.

### Named Rules
**The Same Column Rule.** The laptop layout is the phone column docked beside a map, never a different arrangement of the same content.

**The Thumb Zone Rule.** The one primary action of a commuter screen is full-width and pinned above the tab bar, reachable by thumb.

## Elevation & Depth

The system is flat. Depth comes from tone (pale gray groups on white), hairlines, and a 2px inset green ring on selection, not from shadow. Shadows appear only on things that float over the page: dropdowns, toasts, the switch knob, the slider thumb, map markers, and the white thumb inside a segmented control.

### Shadow Vocabulary
- **Pop** (`box-shadow: 0 8px 24px -6px rgba(21,24,28,0.18), 0 2px 6px rgba(21,24,28,0.06)`): place-search suggestion list, skip link.
- **Thumb** (`box-shadow: 0 1px 3px rgba(21,24,28,0.14)`): the active option of a segmented control and the admin section switch.
- **Marker** (`box-shadow: 0 1px 4px rgba(21,24,28,0.35)`): pickup and drop-off markers on the map.
- **Slider knob** (`box-shadow: 0 2px 6px rgba(21,24,28,0.2)`): the distance slider thumb.
- **Selection ring** (`box-shadow: inset 0 0 0 2px #08744C`): the selected vehicle row and the focused place field. It is a stroke, not elevation.

### Named Rules
**The Float-Only Shadow Rule.** A shadow means "this is above the page." Rows, sections and panels at rest never carry one.

## Shapes

One soft corner rules the system: 14px on buttons, fields, the From/To stack, vehicle rows, the route strip, dropdowns, error blocks and toasts. Nested shapes step down so the curve stays concentric: 11px for a segmented thumb inside a 14px track, 12px for the place-field focus box and vehicle glyph tiles, 6px for tags. Larger surfaces step up: 16px rail items and empty-state icon tiles, 24px top corners on bottom sheets (fully rounded when centered on laptop), 28px top corners on the login form sheet. Fully round is reserved for the initials button, the tab indicator pill, unread dots, count badges and switches.

Icons are one family: 24px line drawings with a 1.75 stroke, round caps and joins, in currentColor. Vehicles are side-on line drawings on a 32px grid, nose to the right, wheels filled. The route has its own marks, used identically in the From/To stack, the route strip and the map: a green-ringed white dot for pickup, an ink rounded square for drop-off, joined by a round-capped green line.

### Named Rules
**The 14px Rule.** A new control, row or container uses 14px corners unless it nests inside one (step down) or is a sheet (step up).

## Components

### Buttons
Firm and tactile: heavy labels, flat fills, a slight give under the finger.
- **Shape:** gently rounded (14px); bold label; sizes 44px (15px label), 48px (16px), 56px (17px), all with a 44px minimum.
- **Primary:** Jeepney Green fill, white label; Deep Jeepney on hover. Disabled turns Pressed Gray with Placeholder Slate text.
- **Secondary:** Surface Gray fill, ink label; Pressed Gray on hover. Also the "done" state of a pinned action ("Trip logged").
- **Ghost:** no fill until hovered (Surface Gray); used for quiet actions such as "Mark all as read", often with green text.
- **Danger:** Signal Red fill, white label; only for destructive confirmation (Sign out, delete).
- **Press / Focus:** everything pressable scales to 0.97 over 140ms on press; focus is a 2px green outline offset 2px. A loading button shows a spinner and stays its size.

### Tags
- **Style:** small plain rectangles (6px corners, 12px extrabold, 2px by 8px padding), no ring, no gloss.
- **Tones:** Cheapest (amber with amber ink), green (published status, discounted fare category), neutral (draft, archived, estimated), red (errors).

### Cards / Containers
There are no cards. Grouping uses the Surface Gray tone at 14px corners (From/To stack, segmented track, fare-working disclosure sits on white under a hairline). Lists are full-width rows divided by hairlines. Bottom sheets (account, trip detail, confirm dialogs) rise from the bottom on phones with a grabber and 24px top corners, and center on laptop.

### Inputs / Fields
- **Style:** Surface Gray fill, 2px transparent border, 14px corners, 48px minimum, 16px semibold ink text; placeholders in Placeholder Slate at medium weight. Labels sit above at 14px bold.
- **Focus:** the field turns white and its border turns green; the caret is green.
- **Error:** red border on Red Wash, with a 14px semibold red message below announced as an alert.
- **Place search (From/To):** two borderless fields share one gray stack, divided by a hairline and joined on the left by the pickup dot, dotted connector and drop-off square. The focused field turns white inside a 2px inset green ring. Suggestions drop in a white Pop-shadowed list spanning the whole stack.

### Navigation
- **Phone:** a white bottom bar with a hairline top edge; four or five equal tabs, each a 24px line icon over an 11px bold label. Inactive in Slate; active in green with a 48 by 28px Mint Wash pill behind the icon. The Alerts tab carries a red count badge with a white ring.
- **Laptop:** the same items stacked in a 96px left rail with a hairline right edge; items are 72px tall with 16px corners.
- **In-section switches** (admin Matrices / Analytics, Fares vehicle switch) are segmented controls, not secondary tab bars.

### Segmented Control
A Surface Gray track (14px, 4px padding) holding equal options; the chosen option is a white 11px thumb with the Thumb shadow and ink text, others are Slate. Built on native radios, so arrows and screen readers work.

### Vehicle Row (signature)
The heart of the quote. A tall full-width row: a 44px Surface Gray glyph tile with the vehicle line drawing, the vehicle name (16px bold) with an optional Cheapest tag and a 13px descriptor, and the fare right-aligned at 26px extrabold with the struck regular fare beneath when a discount applies. Rows are radios in one group. Selecting a row grows a Mint Wash fill with a 2px inset green ring from the left (320ms), turns the glyph tile white, and springs the row (0.98 to 1.012 to 1). Loading shows a pulsing gray bar where the fare will be; a missing matrix shows "No published fare" in Slate, unselectable; an error offers a red underlined retry. Rows enter 40ms apart and each fare counts up from zero on the same stagger. Travel times are deliberately not shown.

### Route Strip (signature)
A 64px Map Ground strip with 14px corners that sketches the real route geometry at the left (green 4px line drawing itself along its path, pickup dot, drop-off square) and reads "12.4 km · View route" in Deep Jeepney at the right. On phones it is a button that expands the Leaflet map below it; on laptop it is a status summary ("by road" or "estimated") because the map is already beside it.

### Pinned Action
The StickyAction: a full-width 56px primary button on a white fade, pinned above the tab bar on phones and to the bottom of the docked column on laptop. Its label carries the selected fare ("Log this trip · ₱21.00").

### Toasts
Sonner, bottom-center, inheriting Manrope at 600 with 14px corners and rich success/error colours. They sit above the tab bar and any pinned action (`--nav-h + --toast-lift + 12px`), rise 12px while fading in over 220ms on the settle curve, and leave with a 140ms fade.

### Motion
- **Curves:** `--ease-out` cubic-bezier(0.23, 1, 0.32, 1) for most transitions; `--ease-settle` cubic-bezier(0.16, 1, 0.3, 1), a long expo-out, for content rising into place and toasts.
- **Screen change:** every route remounts through the app template and slides up 12px while fading in (220ms).
- **Results:** the ride list rises 28px into place (350ms, settle); vehicle rows enter 8px up, 40ms apart; their fares count to value over 420ms (ease-out quint) on the same stagger.
- **Lists:** trip, notification and analytics rows enter 30ms apart, capped at 12 to 14 rows; analytics bars grow from the left (500ms).
- **Route:** the strip sketch draws in 800ms and the map polyline in 900ms along its real path.
- **Sheets:** rise from the bottom (320ms) on phones; pop in (scale 0.98 to 1) on laptop.
- **Reduced motion:** keyframes collapse to opacity-only fades of 180ms; press scale, row fill growth, route drawing and counting are all removed (counters show the final value at once). Motion only changes what is painted, never what is clickable.

## Do's and Don'ts

### Do:
- **Do** lead every commuter screen with the amount: extrabold, tabular, right-aligned, the heaviest element in its row.
- **Do** keep green for intent (selected, primary, route, active, link) and amber for the single Cheapest tag.
- **Do** group with the Surface Gray tone or a hairline; leave rows on the white ground.
- **Do** use 14px corners for controls, rows, strips and toasts, stepping down inside them and up for sheets.
- **Do** keep every target at least 44px and pin the screen's one primary action above the tab bar.
- **Do** reflow the phone column whole for laptop: dock it, add the rail, give the map the rest.
- **Do** draw icons from the one line family (1.75 stroke, round caps, currentColor) and reuse the pickup dot and drop-off square wherever a route appears.
- **Do** stagger lists (40ms for vehicle rows, 30ms for other rows) and fall back to opacity-only fades under reduced motion.
- **Do** show the working: matrix, effective date, distance, discount, and the "illustrative, not official" note beside seeded fares.
- **Do** signal unread or selected state with more than colour (dot plus weight plus spoken text; ring plus fill).

### Don't:
- **Don't** build a SaaS dashboard: no white rounded cards, stat tiles or soft-shadow panels.
- **Don't** use a dark neon "tech" look.
- **Don't** return to bureaucratic-document metaphors (notices, stamps, forms) or answer a fare with a km-by-fare table.
- **Don't** put amber on drafts, warnings or estimates; those stay neutral.
- **Don't** set Connector Gray as text; it is for strokes only.
- **Don't** shadow anything that does not float over the page.
- **Don't** show a per-vehicle travel time or any figure ParaPo has no source for.
- **Don't** present seeded fares as an official LTFRB fare guide.
- **Don't** let motion delay input or exceed the opacity-only fallback under reduced motion.
