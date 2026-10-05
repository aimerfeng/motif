---
name: motif-energy-orb
description: "A sphere of fractal smoke floating in the dark, its rim wrapped in a soft glow and a slow field of stars drifting behind. A hero background for AI, compute and network products. Use when the user asks for Energy Orb, 能量球, orb, sphere, globe, fbm, smoke, glow, stars, webgl, canvas2d, background or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/energy-orb"
  motif-item: "energy-orb"
  params-hash: "9019d313"
---

# Energy Orb (能量球)

A sphere of fractal smoke floating in the dark, its rim wrapped in a soft glow and a slow field of stars drifting behind. A hero background for AI, compute and network products.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/energy-orb.tsx` — the component (`EnergyOrb`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-energy-orb`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/energy-orb/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { EnergyOrb } from '@/components/motif/energy-orb/energy-orb'

<EnergyOrb />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `speed` | 1 | 1 | 0–2.5 x (best 0.3–1.6) | Speed |
| `scale` | 1.12 | 1.12 | 0.8–1.9 (best 1–1.7) | Orb scale |
| `smokeScale` | 1 | 1 | 0.5–2.2 (best 0.6–1.8) | Higher values make finer smoke |
| `smokeStrength` | 1 | 1 | 0.3–1.6 | Smoke strength |
| `glow` | 1.25 | 1.25 | 0.4–1.6 | Glow |
| `hue` | 0 | 0 | -180–180 deg | Hue |
| `saturation` | 1 | 1 | 0.2–1.6 | Saturation |
| `brightness` | 1 | 1 | 0.7–1.5 | Brightness |
| `starDensity` | 1 | 1 | 0–2 | Star density |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).
