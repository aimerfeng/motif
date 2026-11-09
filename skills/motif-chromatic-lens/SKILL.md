---
name: motif-chromatic-lens
description: "Splits a picture into spectral ghost layers (chromatic aberration) and bends it like a fisheye or pincushion lens, with optional swirl and noise scatter; a poster drawn at runtime pans slowly behind the lens. Suited to music, fashion and campaign hero visuals. Use when the user asks for Chromatic Lens, 色散镜头, chromatic aberration, lens, fisheye, dispersion, image filter, webgl, shader, paper or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/chromatic-lens"
  motif-item: "chromatic-lens"
  params-hash: "26ea35bc"
---

# Chromatic Lens (色散镜头)

Splits a picture into spectral ghost layers (chromatic aberration) and bends it like a fisheye or pincushion lens, with optional swirl and noise scatter; a poster drawn at runtime pans slowly behind the lens. Suited to music, fashion and campaign hero visuals.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/chromatic-lens.tsx` — the component (`ChromaticLens`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-chromatic-lens`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/chromatic-lens/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ChromaticLens } from '@/components/motif/chromatic-lens/chromatic-lens'

<ChromaticLens />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `artwork` | poster | poster | poster / sunrise | Artwork |
| `spread` | 0.6 | 0.6 | 0–1 | Spread |
| `angle` | 0 | 0 | 0–360 deg | Angle |
| `perspective` | 0.1 | 0.1 | 0–1 | 0 spreads along a line, 1 radiates from the centre |
| `count` | 35 | 35 | 2–50 | Layers |
| `dispersion` | 1 | 1 | 0–1 | Dispersion |
| `swirl` | 0.35 | 0.35 | -1–1 | Swirl |
| `lensBulge` | 0 | 0 | -1–1 | Positive is fisheye, negative is pincushion |
| `lensCircle` | 0 | 0 | 0–1 | Circle |
| `noise` | 0 | 0 | 0–1 | Noise |
| `pan` | 0.12 | 0.12 | 0–0.3 | How far the poster pans behind the lens; 0 keeps it still |

## Rules

- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
