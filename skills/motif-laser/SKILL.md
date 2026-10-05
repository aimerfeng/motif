---
name: motif-laser
description: "Four laser scenes on a dark field: a blade cutting through haze, a vanishing-point array, a prism aperture and a halftone relay beam, all nudged by the pointer. For tech and launch-event heroes. Use when the user asks for Laser, 激光场, laser, beam, glow, haze, prism, halftone, webgl, background, interactive, variants or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/laser"
  motif-item: "laser"
  params-hash: "d6f05ec5"
---

# Laser (激光场)

Four laser scenes on a dark field: a blade cutting through haze, a vanishing-point array, a prism aperture and a halftone relay beam, all nudged by the pointer. For tech and launch-event heroes.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/laser.tsx` — the component (`Laser`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-laser`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/laser/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Laser } from '@/components/motif/laser/laser'

<Laser />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | atmospheric-blade | atmospheric-blade | atmospheric-blade / vanishing-array / prism-aperture / halftone-relay | Scene |
| `speed` | 1 | 1 | 0.2–2.5 x (best 0.4–1.8) | Speed |
| `size` | 1 | 1 | 0.5–2 (best 0.6–1.6) | Also widens the glow |
| `length` | 1 | 1 | 0.5–2 (best 0.6–1.6) | Reach |
| `density` | 1 | 1 | 0.4–2 (best 0.5–1.6) | Haze thickness, ray count or dot size, depending on the scene |
| `hue` | 0 | 0 | -180–180 deg | Hue |
| `saturation` | 1 | 1 | 0.3–1.6 | Saturation |
| `brightness` | 1 | 1 | 0.6–1.6 | Brightness |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).
