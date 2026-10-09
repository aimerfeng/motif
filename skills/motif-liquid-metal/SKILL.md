---
name: motif-liquid-metal
description: "Turns a letter, a word or a shape into flowing chrome: stripes run along the outline with a touch of colour dispersion at the edges. The text is drawn on a canvas and used as the mask, so no image assets are needed; circle, daisy, diamond and metaballs shapes are built in. Use when the user asks for Liquid Metal, 液态金属, liquid metal, chrome, logo, text, webgl, shader, paper or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/syne, @fontsource/archivo-black, @fontsource/dm-serif-display, @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/liquid-metal"
  motif-item: "liquid-metal"
  params-hash: "eeb3799d"
---

# Liquid Metal (液态金属)

Turns a letter, a word or a shape into flowing chrome: stripes run along the outline with a touch of colour dispersion at the edges. The text is drawn on a canvas and used as the mask, so no image assets are needed; circle, daisy, diamond and metaballs shapes are built in.

## When to use

- A hero mark, a launch or event title, or a product logo moment. One per view: it is a centrepiece, not a texture.

## Files

- `assets/liquid-metal.tsx` — the component (`LiquidMetalMark`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-liquid-metal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/syne @fontsource/archivo-black @fontsource/dm-serif-display @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/liquid-metal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { LiquidMetalMark } from '@/components/motif/liquid-metal/liquid-metal'

<LiquidMetalMark />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `mark` | text | text | text / circle / daisy / diamond / metaballs | Mark |
| `text` | M | M | ≤ 6 chars | A single letter or a short word works best |
| `font` | archivo | archivo | archivo / syne / serif | Font |
| `colorBack` | #0c0c0e | #0c0c0e | color | Background |
| `colorTint` | #ffffff | #ffffff | color | Laid over the metal with colour burn |
| `repetition` | 2 | 2 | 1–10 (best 1.5–6) | Stripes |
| `softness` | 0.1 | 0.1 | 0–1 (best 0–0.8) | 0 is a hard edge, 1 a smooth gradient |
| `shiftRed` | 0.3 | 0.3 | -1–1 | Red shift |
| `shiftBlue` | 0.3 | 0.3 | -1–1 | Blue shift |
| `distortion` | 0.07 | 0.07 | 0–1 (best 0–0.5) | Distortion |
| `contour` | 0.4 | 0.4 | 0–1 | How strongly the stripes bend along the edges |
| `angle` | 70 | 70 | 0–360 deg | Flow angle |
| `scale` | 0.6 | 0.6 | 0.2–1.2 (best 0.4–0.9) | Size |
| `speed` | 1 | 1 | 0–3 x (best 0.3–2) | Speed |

## Rules

- Keep the text to one letter or one short word in a heavy face; thin strokes lose the chrome stripes.
- The mark is decorative: put the real name in accessible text nearby (or aria-label on the container).
- A transparent-background PNG logo also works as the image prop if you swap the canvas mark for your own asset.
- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
