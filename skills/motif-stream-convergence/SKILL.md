---
name: motif-stream-convergence
description: "Three chromatically split wavefronts sweep diagonally through a dark field and blend into violet streams, fading into a vignette. A full-bleed background for launches and event pages. Use when the user asks for Stream Convergence, 汇流光束, waves, wavefront, chromatic, violet, vignette, webgl, hero or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/stream-convergence"
  motif-item: "stream-convergence"
  params-hash: "49a2e056"
---

# Stream Convergence (汇流光束)

Three chromatically split wavefronts sweep diagonally through a dark field and blend into violet streams, fading into a vignette. A full-bleed background for launches and event pages.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/stream-convergence.tsx` — the component (`StreamConvergence`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-stream-convergence`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/stream-convergence/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { StreamConvergence } from '@/components/motif/stream-convergence/stream-convergence'

<StreamConvergence />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `speed` | 1 | 1 | 0.1–2.5 x (best 0.3–1.8) | Speed |
| `fidelity` | 0.3 | 0.3 | 0–1 | How far apart the three wavefronts sit |
| `scale` | 1.1 | 1.1 | 1–1.5 | Zooms in and crops the edges |
| `hue` | 0 | 0 | -180–180 deg | Hue |
| `saturation` | 0.9 | 0.9 | 0–1.6 | Saturation |
| `brightness` | 1 | 1 | 0.6–1.6 | Brightness |
| `opacity` | 1 | 1 | 0.3–1 | Opacity |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).
