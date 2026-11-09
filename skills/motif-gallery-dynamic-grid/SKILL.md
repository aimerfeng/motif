---
name: motif-gallery-dynamic-grid
description: "A 3x2 picture grid where hovering a tile grows its whole row and column, so one still takes the stage while the rest compress around it. For portfolios, project overviews and photo stories. Use when the user asks for Dynamic Grid Gallery, 伸缩网格画廊, gallery, grid, hover, expand, portfolio, photos or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/gallery-dynamic-grid"
  motif-item: "gallery-dynamic-grid"
  params-hash: "3d4fce87"
---

# Dynamic Grid Gallery (伸缩网格画廊)

A 3x2 picture grid where hovering a tile grows its whole row and column, so one still takes the stage while the rest compress around it. For portfolios, project overviews and photo stories.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/gallery-dynamic-grid.tsx` — the component (`DynamicGridGallery`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-gallery-dynamic-grid`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/gallery-dynamic-grid/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DynamicGridGallery } from '@/components/motif/gallery-dynamic-grid/gallery-dynamic-grid'

<DynamicGridGallery />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `columns` | 3 | 3 | 2–4 | Columns |
| `rows` | 2 | 2 | 1–3 | Rows |
| `expandFactor` | 1.95 | 1.95 | 1.2–3 (best 1.6–2.4) | Active row and column size relative to the others |
| `gap` | 10 | 10 | 0–24 px | Gap |
| `radius` | 0 | 0 | 0–28 px | Radius |
| `duration` | 500 | 500 | 200–1200 ms (best 350–800) | Duration |
| `ease` | 0.25, 1, 0.5, 1 | 0.25, 1, 0.5, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
