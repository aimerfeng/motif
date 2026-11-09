---
name: motif-halftone-dots
description: "Reprints a picture as single-ink halftone dots: classic, gooey, punched holes or soft glows on a square or hex grid, with grain on the dot edges. Suits editorial covers, poster-style heroes and LED-screen looks. Use when the user asks for Halftone Dots, 网点印刷, halftone, dots, print, led, poster, webgl, shader, paper or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource/archivo-black, @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/halftone-dots"
  motif-item: "halftone-dots"
  params-hash: "ef7debf7"
---

# Halftone Dots (网点印刷)

Reprints a picture as single-ink halftone dots: classic, gooey, punched holes or soft glows on a square or hex grid, with grain on the dot edges. Suits editorial covers, poster-style heroes and LED-screen looks.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/halftone-dots.tsx` — the component (`HalftoneDotsImage`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-halftone-dots`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource/archivo-black @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/halftone-dots/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';` to the global stylesheet.
4. Use it:

```tsx
import { HalftoneDotsImage } from '@/components/motif/halftone-dots/halftone-dots'

<HalftoneDotsImage />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `artwork` | orb | orb | orb / dunes / type | Artwork |
| `type` | gooey | gooey | classic / gooey / holes / soft | Dot style |
| `grid` | hex | hex | hex / square | Grid |
| `size` | 0.5 | 0.5 | 0.1–1 (best 0.3–0.8) | Grid size |
| `radius` | 1.25 | 1.25 | 0.5–2 | Largest dot relative to the grid cell |
| `contrast` | 0.4 | 0.4 | 0.1–1 (best 0.2–0.8) | Contrast |
| `grainMixer` | 0.2 | 0.2 | 0–1 (best 0–0.5) | Edge grain |
| `colorFront` | #2b2b2b | #2b2b2b | color | Ink |
| `colorBack` | #f2f1e8 | #f2f1e8 | color | Paper |
| `originalColors` | false | false | boolean | Dots take the picture colours instead of the ink |

## Rules

- Pick pictures with big shapes and smooth tonal ramps; fine detail dissolves into dots.
- For a real photo, pass it as the image prop of the underlying Paper HalftoneDots component.
- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
