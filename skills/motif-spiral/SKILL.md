---
name: motif-spiral
description: "A single turning spiral fills the frame, with strokes that taper and edges that can turn grainy. For hypnotic or minimal backdrops. Use when the user asks for Spiral, 螺线, spiral, lines, minimal, shader, webgl, pattern or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/spiral"
  motif-item: "spiral"
  params-hash: "7fe30bd6"
---

# Spiral (螺线)

A single turning spiral fills the frame, with strokes that taper and edges that can turn grainy. For hypnotic or minimal backdrops.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/spiral.tsx` — the component (`SpiralBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/spiral/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SpiralBackground } from '@/components/motif/spiral/spiral'

<SpiralBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colorBack` | #001429 | #001429 | color | Background |
| `colorFront` | #79d1ff | #79d1ff | color | Stroke color |
| `density` | 1 | 1 | 0.1–1 | Density |
| `strokeWidth` | 0.5 | 0.5 | 0.1–0.9 | Stroke width |
| `strokeTaper` | 0 | 0 | 0–1 | Taper |
| `softness` | 0 | 0 | 0–1 | Softness |
| `noise` | 0 | 0 | 0–1 | Noise |
| `noiseFrequency` | 0.3 | 0.3 | 0–1 | Noise frequency |
| `speed` | 1 | 1 | 0–4 x (best 0.1–2.5) | Speed |
| `scale` | 1 | 1 | 0.3–3 x (best 0.4–2) | Scale |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
