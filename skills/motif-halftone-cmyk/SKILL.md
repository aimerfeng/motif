---
name: motif-halftone-cmyk
description: "Splits the picture into cyan, magenta, yellow and black dots, like a printed poster seen up close; the picture slowly pushes in and out under the dots so they shimmer. The scene is a sunrise over the sea, colour blooms or a big word, drawn on a canvas at runtime; dots, inks and paper are all tunable, with newspaper and vintage presets. Use when the user asks for Halftone CMYK, CMYK 半调, halftone, cmyk, print, risograph, retro, webgl, shader, paper or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource/archivo-black, @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/halftone-cmyk"
  motif-item: "halftone-cmyk"
  params-hash: "e90a00be"
---

# Halftone CMYK (CMYK 半调)

Splits the picture into cyan, magenta, yellow and black dots, like a printed poster seen up close; the picture slowly pushes in and out under the dots so they shimmer. The scene is a sunrise over the sea, colour blooms or a big word, drawn on a canvas at runtime; dots, inks and paper are all tunable, with newspaper and vintage presets.

## When to use

- Editorial, music, event and retro-print pages: a hero image, a poster section or a full-bleed band.

## Files

- `assets/halftone-cmyk.tsx` — the component (`HalftoneCmykPrint`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-halftone-cmyk`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource/archivo-black @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/halftone-cmyk/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';` to the global stylesheet.
4. Use it:

```tsx
import { HalftoneCmykPrint } from '@/components/motif/halftone-cmyk/halftone-cmyk'

<HalftoneCmykPrint />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `scene` | sun | sun | sun / bloom / type | Scene |
| `text` | PRINT | PRINT | ≤ 8 chars | Used when the scene is Type |
| `type` | ink | ink | ink / dots / sharp | Dots |
| `size` | 0.6 | 0.6 | 0–1 (best 0.05–0.9) | Dot size |
| `contrast` | 1 | 1 | 0.4–2 (best 0.8–1.6) | Contrast |
| `softness` | 0.5 | 0.5 | 0–1 | Softness |
| `gridNoise` | 0.3 | 0.3 | 0–1 | Random offsets of the dots; higher looks more hand-printed |
| `colorBack` | #fbfaf5 | #fbfaf5 | color | Paper |
| `colorC` | #00b4ff | #00b4ff | color | Cyan |
| `colorM` | #fc519f | #fc519f | color | Magenta |
| `colorY` | #ffd800 | #ffd800 | color | Yellow |
| `colorK` | #231f20 | #231f20 | color | Black |
| `grain` | 0 | 0 | 0–0.5 | Paper grain |
| `drift` | 0.06 | 0.06 | 0–0.15 (best 0.02–0.1) | How far the picture pushes in and out; 0 keeps it still |

## Rules

- Choose pictures with big shapes and smooth tonal ramps; small detail dissolves into dots.
- Keep real text outside the halftone; the dots make small type unreadable.
- For a real photo, pass it as the image prop of the underlying Paper HalftoneCmyk component.
- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
