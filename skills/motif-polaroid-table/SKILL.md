---
name: motif-polaroid-table
description: "Instant prints scattered across a table that you can drag around: they tilt with the speed of the throw, jump to the top of the pile when picked up, and can wear a strip of tape or a pin. Made for about pages, travel journals and mood boards. Use when the user asks for Polaroid Table, 拍立得桌面, polaroid, photo, drag, gallery, moodboard, scrapbook, spring or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/space-grotesk, @fontsource/ibm-plex-mono, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/polaroid-table"
  motif-item: "polaroid-table"
  params-hash: "6d872b29"
---

# Polaroid Table (拍立得桌面)

Instant prints scattered across a table that you can drag around: they tilt with the speed of the throw, jump to the top of the pile when picked up, and can wear a strip of tape or a pin. Made for about pages, travel journals and mood boards.

## When to use

- Lists, grids and panels whose items enter, reorder or expand.

## Files

- `assets/polaroid-table.tsx` — the component (`PolaroidGallery`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-polaroid-table`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/space-grotesk @fontsource/ibm-plex-mono @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/polaroid-table/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { PolaroidGallery } from '@/components/motif/polaroid-table/polaroid-table'

<PolaroidGallery />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `tableColor` | #f6f4f6 | #f6f4f6 | color | Table color |
| `size` | md | md | sm / md / lg | Used by cards that do not set their own size |
| `fastener` | tape | tape | tape / pin / none | Cards can override it with showTape / showPin |
| `captionFont` | script | script | script / typewriter / grotesk | Caption font |
| `tiltFactor` | 18 | 18 | 0–30 deg (best 8–24) | Extra rotation at 2000 px/s of horizontal drag speed |
| `spring` | visualDuration 0.28, bounce 0.33 | visualDuration 0.28, bounce 0.33 | visualDuration 0.05–4 s, bounce 0–0.9 | Tilt spring |

## Rules

- Compose it as <PolaroidGallery> (the table, z-order and drag bounds) > <PolaroidArena> (the flex layout) > <PolaroidCard>. Cards are positioned by the arena layout plus their drag offset, so size the gallery to fit the arena at narrow widths (use size="sm" or overlap the cards on phones).
- Pass a photo as src (plus alt), or as children (any element that fills the frame). The card frame is always white, so keep caption textColor dark.
- Stagger at most ~50 ms per item and cap the total stagger around 400 ms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
