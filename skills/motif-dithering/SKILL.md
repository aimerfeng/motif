---
name: motif-dithering
description: "Two-tone dither dots sketch spheres, ripples or swirls with a retro bitmap feel. For characterful backdrops and pixel-art visuals. Use when the user asks for Dithering, 抖动像素, dither, pixel, retro, bitmap, shader, webgl or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dithering"
  motif-item: "dithering"
  params-hash: "509cbc22"
---

# Dithering (抖动像素)

Two-tone dither dots sketch spheres, ripples or swirls with a retro bitmap feel. For characterful backdrops and pixel-art visuals.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/dithering.tsx` — the component (`DitheringBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dithering`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dithering/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DitheringBackground } from '@/components/motif/dithering/dithering'

<DitheringBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colorBack` | #000000 | #000000 | color | Background |
| `colorFront` | #3db9ff | #3db9ff | color | Front color |
| `shape` | sphere | sphere | sphere / warp / wave / ripple / swirl / dots / simplex | Pattern |
| `type` | 4x4 | 4x4 | 4x4 / 2x2 / 8x8 / random | Dither type |
| `size` | 2 | 2 | 1–12 px (best 1.5–8) | Pixel size |
| `speed` | 1 | 1 | 0–3 x (best 0.1–2) | Speed |
| `scale` | 0.6 | 0.6 | 0.3–3 x (best 0.4–2) | Scale |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
