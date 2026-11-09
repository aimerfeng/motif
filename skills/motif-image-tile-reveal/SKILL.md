---
name: motif-image-tile-reveal
description: "An image assembles from a grid of tiles that fade in at random delays, starting in grayscale and blooming into full color once the grid is complete. For portfolio covers, gallery entrances and case-study headers. Use when the user asks for Tile Reveal Image, 拼块显影, image, reveal, tiles, grid, grayscale, entrance, pixel or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/image-tile-reveal"
  motif-item: "image-tile-reveal"
  params-hash: "e09a505d"
---

# Tile Reveal Image (拼块显影)

An image assembles from a grid of tiles that fade in at random delays, starting in grayscale and blooming into full color once the grid is complete. For portfolio covers, gallery entrances and case-study headers.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/image-tile-reveal.tsx` — the component (`PixelImage`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-image-tile-reveal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/image-tile-reveal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PixelImage } from '@/components/motif/image-tile-reveal/image-tile-reveal'

<PixelImage />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `rows` | 4 | 4 | 1–16 (best 3–8) | Rows |
| `cols` | 6 | 6 | 1–16 (best 3–8) | Columns |
| `tileDuration` | 1000 | 1000 | 200–2500 ms (best 600–1400) | Tile fade |
| `maxDelay` | 1200 | 1200 | 0–3000 ms (best 600–1800) | Each tile starts at a random time up to this |
| `grayscale` | true | true | boolean | Grayscale first |
| `colorDelay` | 1300 | 1300 | 0–4000 ms (best 900–2000) | Color delay |
| `radius` | 40 | 40 | 0–64 px (best 16–48) | Corner radius |
| `replayInterval` | 5 | 5 | 0–15 s | 0 plays it once |
| `artwork` | dunes | dunes | dunes / tide / bloom | Demo only |

## Rules

- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
