---
name: motif-design-conference-site
description: "A site for a two-day design-engineering conference: a dated hero with a live countdown, a schedule with day tabs and track filters, a speaker grid with generated pattern avatars, an SVG venue map, ticket tiers with seats left and invented sponsor wordmarks. Use when the user asks for Design Conference, 设计大会官网, conference, event, countdown, schedule, speakers, tickets, venue-map or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/design-conference-site"
  motif-item: "design-conference-site"
  params-hash: "9cbc64d5"
---

# Design Conference (设计大会官网)

A site for a two-day design-engineering conference: a dated hero with a live countdown, a schedule with day tabs and track filters, a speaker grid with generated pattern avatars, an SVG venue map, ticket tiers with seats left and invented sponsor wordmarks.

## When to use

- A one-page site for a conference, meetup or festival with a fixed date: hero with countdown, schedule, speakers, venue, tickets and sponsors.
- Replace DAYS, SPEAKERS, ROOMS and TICKETS in sections.tsx with your programme; they are plain data and the markup does not need to change.

## Files

- `assets/design-conference-site.tsx` — the component (`DesignConferenceSite`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/parts.tsx`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-design-conference-site`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/design-conference-site/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/jetbrains-mono';` to the global stylesheet.
4. Use it:

```tsx
import { DesignConferenceSite } from '@/components/motif/design-conference-site/design-conference-site'

<DesignConferenceSite />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `eventName` | Joinery Conf | Joinery Conf | ≤ 24 chars | Event name |
| `city` | Lisbon | Lisbon | ≤ 24 chars | City |
| `dates` | June 17–18, 2027 | June 17–18, 2027 | ≤ 32 chars | Display text only; set the countdown target with the startsAt prop |
| `accent` | #0161ef | #0161ef | color | Buttons, the main stage and the design track |
| `secondaryAccent` | #6d28d9 | #6d28d9 | color | Engineering track, the ticket ribbon and avatar patterns |
| `scheduleView` | vertical | vertical | vertical / alternate | Schedule layout |
| `fontPairing` | inter | inter | inter / grotesk / serif / mono | Font pairing |
| `dark` | false | false | boolean | Dark mode |

## Rules

- Pass the real start time as startsAt (ISO 8601 with a timezone). The dates param is display text only, so keep the two in sync. With prefers-reduced-motion the countdown renders once and does not tick.
- Keep the AstroWind rhythm: centred headline blocks with an uppercase tagline, rounded-full buttons, white or near-black pages with a faint accent tint on alternating sections.
- The accent marks the main stage and the design track, the secondary accent the engineering track; workshops and breaks stay neutral. Keynotes and breaks stay visible under every track filter.
- Day tabs are a real tablist (arrow keys, Home, End); track filters and the ticket switch are toggle buttons with aria-pressed. Keep them keyboard operable.
- Show seats left only when the number is real, and never fake urgency with a countdown to an arbitrary date.
- No photos or real logos: speakers get generated pattern avatars and sponsors are invented SVG wordmarks.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from arthelokyo/astrowind).
