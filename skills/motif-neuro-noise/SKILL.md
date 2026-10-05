---
name: motif-neuro-noise
description: "Glowing filaments weave into a neural-network texture, like lightning, veins or star trails. A backdrop with a technical edge. Use when the user asks for Neuro Noise, 神经噪声, neural, noise, lightning, shader, webgl, tech or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/neuro-noise"
  motif-item: "neuro-noise"
  params-hash: "c96ad3fc"
---

# Neuro Noise (神经噪声)

Glowing filaments weave into a neural-network texture, like lightning, veins or star trails. A backdrop with a technical edge.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/neuro-noise.tsx` — the component (`NeuroNoiseBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-neuro-noise`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/neuro-noise/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { NeuroNoiseBackground } from '@/components/motif/neuro-noise/neuro-noise'

<NeuroNoiseBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colorFront` | #ffffff | #ffffff | color | Front color |
| `colorMid` | #47a6ff | #47a6ff | color | Mid color |
| `colorBack` | #000000 | #000000 | color | Background |
| `brightness` | 0.05 | 0.05 | 0–0.5 | Brightness |
| `contrast` | 0.3 | 0.3 | 0.05–1 | Contrast |
| `speed` | 1 | 1 | 0–3 x (best 0.1–2) | Speed |
| `scale` | 1 | 1 | 0.3–4 x (best 0.4–3) | Scale |
| `rotation` | 0 | 0 | 0–360 deg | Rotation |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
