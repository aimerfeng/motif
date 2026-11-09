---
name: motif-gallery-filter-lightbox
description: "A portfolio gallery with category pills, a grid of generated artworks that reflows when filtering, and a lightbox that grows out of the clicked tile with previous / next buttons, arrow keys and Escape. Use when the user asks for Filterable Gallery, 可筛选画廊, gallery, portfolio, filter, lightbox, grid or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/gallery-filter-lightbox"
  motif-item: "gallery-filter-lightbox"
  params-hash: "44bb2b5a"
---

# Filterable Gallery (可筛选画廊)

A portfolio gallery with category pills, a grid of generated artworks that reflows when filtering, and a lightbox that grows out of the clicked tile with previous / next buttons, arrow keys and Escape.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/gallery-filter-lightbox.tsx` — the component (`GalleryGridBlock`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-gallery-filter-lightbox`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/gallery-filter-lightbox/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { GalleryGridBlock } from '@/components/motif/gallery-filter-lightbox/gallery-filter-lightbox'

<GalleryGridBlock />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #a78bfa | #a78bfa | color | Accent |
| `tone` | dusk | dusk | dusk / ocean / mono | Artwork tone |
| `artStyle` | geometric | geometric | geometric / waves / orbits | Artwork style |
| `filterStyle` | pills | pills | pills / underline | Filter style |
| `columns` | 3 | 3 | 2–4 | Columns (wide) |
| `gap` | 16 | 16 | 4–32 px | Gap |
| `radius` | 12 | 12 | 0–28 px | Radius |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
