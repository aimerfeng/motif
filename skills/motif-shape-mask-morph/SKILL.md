---
name: motif-shape-mask-morph
description: "Any content shows through an SVG shape mask (blob, arch, diamond or wave) that morphs on its own loop, steps with scroll or swaps on hover. For hero imagery, portfolio covers and organic product shots. Use when the user asks for Morphing Mask, 形变遮罩, mask, clip-path, morph, svg, blob, image, scroll or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/shape-mask-morph"
  motif-item: "shape-mask-morph"
  params-hash: "39294f5e"
---

# Morphing Mask (形变遮罩)

Any content shows through an SVG shape mask (blob, arch, diamond or wave) that morphs on its own loop, steps with scroll or swaps on hover. For hero imagery, portfolio covers and organic product shots.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/shape-mask-morph.tsx` — the component (`ShapeMaskMorph`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-shape-mask-morph`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/shape-mask-morph/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ShapeMaskMorph } from '@/components/motif/shape-mask-morph/shape-mask-morph'

<ShapeMaskMorph />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `shape` | blob | blob | blob / arch / diamond / wave | Shape |
| `animate` | morph | morph | morph / scroll / hover / none | Animation |
| `duration` | 4 | 4 | 1.5–12 s (best 3–8) | Seconds for one full morph loop |
| `ease` | 0.645, 0.045, 0.355, 1 | 0.645, 0.045, 0.355, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |

## Rules

- Give the wrapper (or its child) an explicit size; the mask uses objectBoundingBox units and fills whatever box it wraps.
- Custom morphPaths must share one command structure (same M/L/C/Z sequence and point count), otherwise the shape snaps instead of morphing.
- For animate="scroll" inside a scrolling panel, pass that panel as container and make it position: relative.
- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
