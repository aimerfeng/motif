---
name: motif-tile-flip-transition
description: "The frame splits into tiles behind thin dividers that flip over one by one (random, diagonal wave, scatter or a directional sweep) to reveal the next image. Made for portfolio grids, gallery heroes and launch sequences. Use when the user asks for Tile Flip Transition, 方块翻牌转场, transition, tiles, grid, flip, slideshow, webgl, shader, gl-transitions or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/tile-flip-transition"
  motif-item: "tile-flip-transition"
  params-hash: "51fb38da"
---

# Tile Flip Transition (方块翻牌转场)

The frame splits into tiles behind thin dividers that flip over one by one (random, diagonal wave, scatter or a directional sweep) to reveal the next image. Made for portfolio grids, gallery heroes and launch sequences.

## When to use

- Moments that swap one image, slide or view for another.

## Files

- `assets/tile-flip-transition.tsx` — the component (`TileFlipTransition`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/artwork.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-tile-flip-transition`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/tile-flip-transition/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TileFlipTransition } from '@/components/motif/tile-flip-transition/tile-flip-transition'

<TileFlipTransition />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | grid-flip | grid-flip | grid-flip / tiles-wave / random-squares / squares-wire | Variant |
| `columns` | 4 | 4 | 2–16 | Columns |
| `rows` | 4 | 4 | 2–16 | Rows |
| `gapWidth` | 0.05 | 0.05 | 0–0.2 | Grid flip only: divider width relative to a tile |
| `gapColor` | #000000 | #000000 | color | Grid flip only |
| `randomness` | 0.1 | 0.1 | 0–0.5 | Grid flip only: how staggered the tiles are |
| `direction` | diagonal | diagonal | diagonal / right / left / up / down | Sweep direction for squares wire; tiles wave flips horizontally or vertically |
| `duration` | 1.8 | 1.8 | 0.6–4 s (best 1.2–2.6) | Duration |
| `pause` | 1.2 | 1.2 | 0.2–5 s | Pause |
| `scheme` | dusk | dusk | dusk / mono / lagoon / candy | Palette |

## Rules

- Keep transitions under ~800 ms for UI; longer only for showcase sequences.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from gl-transitions/gl-transitions).
