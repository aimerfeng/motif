---
name: motif-infinite-canvas-grid
description: "A white canvas you can drag, scroll or flick in any direction while product cards tile forever. It coasts on release, leans slightly with speed and can float over slow liquid blobs. Card art is drawn from a palette. For moodboards, collection browsers and portfolio indexes. Use when the user asks for Infinite Canvas, 无限画布, infinite canvas, pan, drag, momentum, grid, gallery, catalog, moodboard or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/infinite-canvas-grid"
  motif-item: "infinite-canvas-grid"
  params-hash: "09f5088b"
---

# Infinite Canvas (无限画布)

A white canvas you can drag, scroll or flick in any direction while product cards tile forever. It coasts on release, leans slightly with speed and can float over slow liquid blobs. Card art is drawn from a palette. For moodboards, collection browsers and portfolio indexes.

## When to use

- Lists, grids and panels whose items enter, reorder or expand.

## Files

- `assets/infinite-canvas-grid.tsx` — the component (`InfiniteGrid`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-infinite-canvas-grid`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/infinite-canvas-grid/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { InfiniteGrid } from '@/components/motif/infinite-canvas-grid/infinite-canvas-grid'

<InfiniteGrid />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `columns` | 4 | 4 | 2–6 (best 3–5) | Columns in each repeating block |
| `gap` | 2.5 | 2.5 | 1–6 (best 1.5–4) | In viewport width units (vw) |
| `cardWidth` | 24 | 24 | 14–36 (best 18–30) | In vw, never narrower than 120px |
| `radius` | 0 | 0 | 0–32 px (best 0–20) | Art radius |
| `palette` | #c69c72, #7f9583, #c0583f, #55708f | #c69c72, #7f9583, #c0583f, #55708f | 1–6 colors | Cards cycle through these; each tile uses a pale tint of its color |
| `liquidBlobs` | true | true | boolean | Liquid blobs |
| `momentum` | 0.95 | 0.95 | 0.85–0.98 (best 0.9–0.97) | Velocity kept per frame; higher coasts further |

## Rules

- Give it a full-viewport (or at least very tall) container; it wheels and drags on its own, so do not put it inside a scrolling page section that also needs the wheel.
- Pass items with your own imageUrl (object-contain on white, like product shots) or keep the generated art; only the center block is exposed to assistive tech, the other eight copies are aria-hidden.
- Stagger at most ~50 ms per item and cap the total stagger around 400 ms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
