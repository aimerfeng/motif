---
name: motif-pool-water
description: "Looking down through water: caustics wander over the floor while small waves shimmer the pattern below. The floor is pool tiles or mosaic, drawn on a canvas at runtime in a colour you pick. Made for summer, travel and resort hero backgrounds. Use when the user asks for Pool Water, 泳池水面, water, caustics, pool, summer, background, webgl, shader, paper or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pool-water"
  motif-item: "pool-water"
  params-hash: "b8590560"
---

# Pool Water (泳池水面)

Looking down through water: caustics wander over the floor while small waves shimmer the pattern below. The floor is pool tiles or mosaic, drawn on a canvas at runtime in a colour you pick. Made for summer, travel and resort hero backgrounds.

## When to use

- A hero or section background for summer, travel, wellness and resort pages. Put text on a solid card or a dark scrim; the moving caustics make bare text hard to read.

## Files

- `assets/pool-water.tsx` — the component (`PoolWater`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-pool-water`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pool-water/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PoolWater } from '@/components/motif/pool-water/pool-water'

<PoolWater />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `floor` | tiles | tiles | tiles / mosaic | Floor |
| `tile` | #3fa9c4 | #3fa9c4 | color | Floor colour |
| `colorHighlight` | #ffffff | #ffffff | color | Highlight |
| `caustic` | 0.7 | 0.7 | 0–1 (best 0.3–1) | Strength of the light pattern on the floor |
| `waves` | 0.04 | 0.04 | 0–0.2 (best 0–0.12) | How much the waves bend the floor |
| `highlights` | 0.3 | 0.3 | 0–0.8 (best 0.1–0.6) | Surface glints |
| `layering` | 0 | 0 | 0–0.4 (best 0–0.2) | Layering |
| `edges` | 0 | 0 | 0–0.4 (best 0–0.2) | Edges |
| `size` | 3 | 3 | 1–5 (best 1.8–4) | Ripple scale |
| `speed` | 1 | 1 | 0–3 x (best 0.3–1.8) | Speed |

## Rules

- The floor is decorative and aria-hidden by nature (a canvas); nothing important lives in it.
- Keep the waves low (under about 0.12): stronger waves melt the drawn floor into blobs.
- To use a real photo instead, pass it as the image prop of the underlying Paper Water component.
- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
