---
name: motif-flip-grid
description: "A work grid you can filter, sort and switch between grid and list. On every change the cards fly from their old spots to the new ones, thumbnails morph between the two views, and filtered-out cards fade in place while the rest close the gap, with an adjustable spring and stagger. Thumbnails are pure CSS gradients. Use when the user asks for Flip Grid, 翻转布局, flip, layout animation, filter, sort, grid, list, gallery, portfolio or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/inter-tight, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/flip-grid"
  motif-item: "flip-grid"
  params-hash: "16ac9a56"
---

# Flip Grid (翻转布局)

A work grid you can filter, sort and switch between grid and list. On every change the cards fly from their old spots to the new ones, thumbnails morph between the two views, and filtered-out cards fade in place while the rest close the gap, with an adjustable spring and stagger. Thumbnails are pure CSS gradients.

## When to use

- A portfolio, case-study index, template gallery or any set of 6 to 20 cards that people filter or re-order. The motion is there to show where each card went, not as decoration.

## Files

- `assets/flip-grid.tsx` — the component (`FlipGrid`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-flip-grid`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/inter-tight @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/flip-grid/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { FlipGrid } from '@/components/motif/flip-grid/flip-grid'

<FlipGrid />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Selected work | Selected work | ≤ 32 chars | Heading |
| `view` | grid | grid | grid / list | Default view |
| `columns` | 4 | 4 | 2–5 (best 3–4) | Grid columns on wide screens; narrow screens use two |
| `radius` | 18 | 18 | 0–32 px (best 8–24) | Radius |
| `accent` | #2b59ff | #2b59ff | color | Accent |
| `tone` | light | light | light / dark | Tone |
| `spring` | visualDuration 0.5, bounce 0.18 | visualDuration 0.5, bounce 0.18 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `stagger` | 0.025 | 0.025 | 0–0.08 s (best 0–0.05) | Delay between neighbouring cards |

## Rules

- Keep a stable key per card (project id), never the array index, or the layout animation cannot tell which card moved where.
- Filters, sort and view are real buttons with aria-pressed; the component is uncontrolled by default and can be controlled with state and onStateChange.
- Removed cards leave with AnimatePresence in popLayout mode, so the remaining cards start moving immediately instead of waiting for the exit.
- Elements that change size use layout and set border-radius inline (motion corrects it during the scale); text uses layout="position" so it never stretches.
- Under reduced motion every change is instant.
- Stagger at most ~50 ms per item and cap the total stagger around 400 ms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
