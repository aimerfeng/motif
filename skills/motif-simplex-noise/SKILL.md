---
name: motif-simplex-noise
description: "Contour-like color bands morph slowly through noise, hard-edged or soft. For topographic, candy-colored or print-style backdrops. Use when the user asks for Simplex Noise, 单纯形噪声, noise, contour, gradient, shader, webgl, pattern or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/simplex-noise"
  motif-item: "simplex-noise"
  params-hash: "d9a892bf"
---

# Simplex Noise (单纯形噪声)

Contour-like color bands morph slowly through noise, hard-edged or soft. For topographic, candy-colored or print-style backdrops.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/simplex-noise.tsx` — the component (`SimplexNoiseBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-simplex-noise`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/simplex-noise/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SimplexNoiseBackground } from '@/components/motif/simplex-noise/simplex-noise'

<SimplexNoiseBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #4449cf, #ffd1e0, #f94446, #ffd36b, #ffffff | #4449cf, #ffd1e0, #f94446, #ffd36b, #ffffff | 2–10 colors | Colors |
| `stepsPerColor` | 2 | 2 | 1–6 | Bands between two neighboring colors |
| `softness` | 0 | 0 | 0–1 | Softness |
| `speed` | 0.5 | 0.5 | 0–3 x (best 0.1–2) | Speed |
| `scale` | 0.6 | 0.6 | 0.2–3 x (best 0.2–2) | Scale |
| `rotation` | 0 | 0 | 0–360 deg | Rotation |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
