---
name: motif-pixel-hover-card
description: "On hover or focus the card image breaks into square, hexagonal or mosaic cells and resolves into an alternate view, then reverses on leave. Made for product grids, game or collectible catalogs and portfolio tiles. Use when the user asks for Pixel Swap Card, 像素切换卡片, hover, card, pixelate, mosaic, hexagon, webgl, gl-transitions or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pixel-hover-card"
  motif-item: "pixel-hover-card"
  params-hash: "776bd789"
---

# Pixel Swap Card (像素切换卡片)

On hover or focus the card image breaks into square, hexagonal or mosaic cells and resolves into an alternate view, then reverses on leave. Made for product grids, game or collectible catalogs and portfolio tiles.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/pixel-hover-card.tsx` — the component (`PixelHoverCard`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/artwork.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-pixel-hover-card`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pixel-hover-card/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PixelHoverCard } from '@/components/motif/pixel-hover-card/pixel-hover-card'

<PixelHoverCard />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `cellShape` | square | square | square / hexagon / mosaic | Cell shape |
| `cells` | 20 | 20 | 6–48 (best 12–32) | How many cells across at the coarsest point |
| `steps` | 50 | 50 | 0–60 | How many discrete cell sizes; 0 is continuous. Not used by Mosaic |
| `duration` | 0.7 | 0.7 | 0.2–2 s (best 0.4–1.2) | Duration |
| `easing` | 0.65, 0, 0.35, 1 | 0.65, 0, 0.35, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |
| `radius` | 16 | 16 | 0–40 px | Radius |
| `trigger` | hover | hover | hover / click | Trigger |
| `artwork` | can | can | can / peaks / poster | Artwork |

## Rules

- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from gl-transitions/gl-transitions).
