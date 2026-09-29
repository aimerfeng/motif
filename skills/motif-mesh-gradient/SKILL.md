---
name: motif-mesh-gradient
description: "Color spots drift along their own paths, blended by organic noise and a gentle swirl. Made for hero and section backgrounds. Use when the user asks for Mesh Gradient, 流动网格渐变, gradient, shader, webgl, hero, aurora or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/mesh-gradient"
  motif-item: "mesh-gradient"
  params-hash: "139637e4"
---

# Mesh Gradient (流动网格渐变)

Color spots drift along their own paths, blended by organic noise and a gentle swirl. Made for hero and section backgrounds.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/mesh-gradient.tsx` — the component (`MeshGradientBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/mesh-gradient/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MeshGradientBackground } from '@/components/motif/mesh-gradient/mesh-gradient'

<MeshGradientBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #e0eaff, #241d9a, #f75092, #9f50d3 | #e0eaff, #241d9a, #f75092, #9f50d3 | 2–10 colors | Each color is one moving spot, up to 10 |
| `distortion` | 0.8 | 0.8 | 0–1 | Strength of the organic noise distortion |
| `swirl` | 0.1 | 0.1 | 0–1 | Strength of the vortex distortion |
| `grainMixer` | 0 | 0 | 0–1 | Grain distortion on the edges of the shapes |
| `grainOverlay` | 0 | 0 | 0–1 (best 0–0.5) | Black-and-white film grain on top |
| `speed` | 0.6 | 0.6 | 0–2 x (best 0.1–1.2) | Speed |
| `scale` | 1 | 1 | 0.3–3 x | Scale |
| `rotation` | 0 | 0 | 0–360 deg | Rotation |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
