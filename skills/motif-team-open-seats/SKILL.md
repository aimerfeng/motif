---
name: motif-team-open-seats
description: "A team mosaic where open roles sit among the people as dashed empty seats labelled with the role and location. Hover, tap or focus one and it pulses softly and reveals a one-line pitch with an Apply link; a department filter dims everyone outside it. For startup about pages and hiring sections. Use when the user asks for Team with Open Seats, 留有空位的团队, team, hiring, careers, open roles, about, avatars, filter or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/team-open-seats"
  motif-item: "team-open-seats"
  params-hash: "81a86360"
---

# Team with Open Seats (留有空位的团队)

A team mosaic where open roles sit among the people as dashed empty seats labelled with the role and location. Hover, tap or focus one and it pulses softly and reveals a one-line pitch with an Apply link; a department filter dims everyone outside it. For startup about pages and hiring sections.

## When to use

- Use on an About, Team or Careers page when you are hiring: open roles sit inside the team instead of on a separate list. Replace TEAM with your people and open roles; avatars are generated from initials and departments drive the filter.

## Files

- `assets/team-open-seats.tsx` — the component (`TeamOpenSeats`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-team-open-seats`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/team-open-seats/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { TeamOpenSeats } from '@/components/motif/team-open-seats/team-open-seats'

<TeamOpenSeats />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Fifteen people so far. Five seats still open. | Fifteen people so far. Five seats still open. | ≤ 64 chars | Heading |
| `accent` | #ff8a5b | #ff8a5b | color | Colors the pulse, the Open tag and the Apply button; shifted toward the text color when too close to the background, and ink adapts automatically |
| `tone` | dark | dark | dark / light | Tone |
| `seatStyle` | dashed | dashed | dashed / hatched / ghost | Seat style |
| `avatarShape` | circle | circle | circle / squircle / square | Avatar shape |
| `radius` | 18 | 18 | 0–28 px (best 8–24) | Tile radius |
| `columns` | 5 | 5 | 4–5 | Columns on wide screens; narrow screens use fewer. 4 and 5 both fill every row of the 20 tiles |
| `showDepartments` | true | true | boolean | Department filter |

## Rules

- Each open seat needs a role, a location ("Remote · EU", "Lisbon") and a one-sentence pitch with a concrete fact about the work. No "rockstar", "ninja" or "fast-paced environment".
- Keep open seats to roughly one in four tiles; more and the mosaic reads as an empty office. Do not place them all in one row.
- Point each Apply link at that role's real posting. The tile is a disclosure button (aria-expanded) and the department filter is a radio group with arrow-key navigation; keep both if you restyle.
- Do not add photos or real company logos. Initial avatars keep the wall consistent and avoid image consent issues.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
