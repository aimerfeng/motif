---
name: motif-dithered-image
description: "Turns an illustration into ordered (2×2, 4×4, 8×8 Bayer) or random dithering with two-tone, three-tone or original multi-colour palettes, like a 1-bit Mac screen or a risograph. Made for retro product pages, zines and developer-tool heroes. Use when the user asks for Dithered Image, 抖动像素画, dithering, bayer, 1-bit, pixel, retro, risograph, webgl, shader, paper or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dithered-image"
  motif-item: "dithered-image"
  params-hash: "e6223902"
---

# Dithered Image (抖动像素画)

Turns an illustration into ordered (2×2, 4×4, 8×8 Bayer) or random dithering with two-tone, three-tone or original multi-colour palettes, like a 1-bit Mac screen or a risograph. Made for retro product pages, zines and developer-tool heroes.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/dithered-image.tsx` — the component (`DitheredImage`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dithered-image`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dithered-image/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DitheredImage } from '@/components/motif/dithered-image/dithered-image'

<DitheredImage />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `artwork` | landscape | landscape | landscape / still / spectrum | Artwork |
| `type` | 8x8 | 8x8 | random / 2x2 / 4x4 / 8x8 | Dithering |
| `size` | 2 | 2 | 0.5–20 px (best 1–6) | In screen pixels |
| `colorSteps` | 2 | 2 | 1–7 | Color steps |
| `colorBack` | #000c38 | #000c38 | color | Background |
| `colorFront` | #94ffaf | #94ffaf | color | Foreground |
| `colorHighlight` | #eaff94 | #eaff94 | color | Same as the foreground for classic two-tone dithering |
| `originalColors` | false | false | boolean | Uses the image colours instead of the three above |
| `inverted` | false | false | boolean | Inverted |
| `drift` | 0.08 | 0.08 | 0–0.2 | How far the picture pans under the grid; 0 keeps it still |

## Rules

- For a real photo, pass it as the image prop of the underlying Paper ImageDithering component; pictures with big shapes and smooth tonal ramps dither best.
- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
