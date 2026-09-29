---
name: motif-waves
description: "Rows of undulating lines, from calm ripples to tangled knots. For minimal, print-inspired backdrops and dividers. Use when the user asks for Waves, 波纹线, waves, lines, stripes, shader, webgl, print or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/waves"
  motif-item: "waves"
  params-hash: "8ed04e9e"
---

# Waves (波纹线)

Rows of undulating lines, from calm ripples to tangled knots. For minimal, print-inspired backdrops and dividers.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/waves.tsx` — the component (`WavesBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/waves/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { WavesBackground } from '@/components/motif/waves/waves'

<WavesBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colorFront` | #ffc21a | #ffc21a | color | Line color |
| `colorBack` | #0b0b0f | #0b0b0f | color | Background |
| `shape` | 2.25 | 2.25 | 0–3 | A continuous morph from calm to tangled |
| `frequency` | 0.2 | 0.2 | 0.1–1.2 | Frequency |
| `amplitude` | 1 | 1 | 0.05–1 | Amplitude |
| `spacing` | 1.25 | 1.25 | 0.8–2 | Spacing |
| `proportion` | 0.6 | 0.6 | 0.05–1 | Line proportion |
| `speed` | 0.6 | 0.6 | 0–2 x (best 0.1–1.2) | Speed |
| `scale` | 1.7 | 1.7 | 0.3–6 x (best 0.4–5) | Scale |
| `rotation` | 0 | 0 | 0–360 deg | Rotation |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
