---
name: motif-team-grid
description: "Gradient initial avatars with name, role and a one-line bio in card, centered or roster layouts. No bitmap assets anywhere. Use when the user asks for Team Grid, 团队成员, team, about, people, avatars or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/team-grid"
  motif-item: "team-grid"
  params-hash: "33107bc3"
---

# Team Grid (团队成员)

Gradient initial avatars with name, role and a one-line bio in card, centered or roster layouts. No bitmap assets anywhere.

## When to use

- Use on an About or Company page. Replace the TEAM array with real names, roles and short bios; avatars are generated from initials.

## Files

- `assets/team-grid.tsx` — the component (`TeamGrid`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-team-grid`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/team-grid/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { TeamGrid } from '@/components/motif/team-grid/team-grid'

<TeamGrid />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `font` | serif | serif | serif / sans / grotesk | Heading font |
| `layout` | cards | cards | cards / centered / roster | Layout |
| `columns` | 4 | 4 | 2–4 | Ignored by the roster layout |
| `members` | 8 | 8 | 2–8 (best 4–8) | Members |
| `avatarShape` | squircle | squircle | squircle / circle | Avatar shape |
| `heading` | The people behind Halcyon | The people behind Halcyon | ≤ 40 chars | Heading |
| `subheading` | Forty-one people across nine time zones, shipping small and often. | Forty-one people across nine time zones, shipping small and often. | ≤ 90 chars | Subheading |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Do not add photos. Keep bios to one or two lines so cards stay the same height.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
