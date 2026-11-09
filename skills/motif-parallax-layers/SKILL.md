---
name: motif-parallax-layers
description: "Sky, ridges, haze and foreground stacked as layers that move at different rates as you scroll, with an optional pointer-driven shift on hover. For hero scenes and section headers that need depth. Use when the user asks for Parallax Layers, 多层视差, parallax, scroll, depth, landscape, layers, svg or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/parallax-layers"
  motif-item: "parallax-layers"
  params-hash: "293e8924"
---

# Parallax Layers (多层视差)

Sky, ridges, haze and foreground stacked as layers that move at different rates as you scroll, with an optional pointer-driven shift on hover. For hero scenes and section headers that need depth.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/parallax-layers.tsx` — the component (`ParallaxLayers`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-parallax-layers`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/parallax-layers/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ParallaxLayers } from '@/components/motif/parallax-layers/parallax-layers'

<ParallaxLayers />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `range` | 80 | 80 | 0–160 px (best 40–120) | How far a depth-1 layer travels over the scroll |
| `direction` | vertical | vertical | vertical / horizontal / both | Direction |
| `pointerParallax` | true | true | boolean | Pointer parallax |
| `pointerStrength` | 20 | 20 | 0–48 px | Pointer travel |
| `palette` | #141a3d, #f4a37c, #8a5f8f, #4b3768, #1a1230 | #141a3d, #f4a37c, #8a5f8f, #4b3768, #1a1230 | 3–6 colors | Sky top, horizon, then ridges from far to near |
| `layerCount` | 4 | 4 | 2–5 | Ridge layers |
| `haze` | 0.5 | 0.5 | 0–1 | Haze |

## Rules

- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
