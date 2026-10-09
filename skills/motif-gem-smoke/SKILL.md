---
name: motif-gem-smoke
description: "Coloured smoke churns inside a gem-shaped outline with light glowing through its edges, like fire sealed in crystal. The shape can be a diamond, circle, daisy or metaballs, and the colours range from flame to fluorescent to infrared. Use when the user asks for Gem Smoke, 宝石烟雾, smoke, gem, glow, fire, webgl, shader, paper or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/gem-smoke"
  motif-item: "gem-smoke"
  params-hash: "f16cdef6"
---

# Gem Smoke (宝石烟雾)

Coloured smoke churns inside a gem-shaped outline with light glowing through its edges, like fire sealed in crystal. The shape can be a diamond, circle, daisy or metaballs, and the colours range from flame to fluorescent to infrared.

## When to use

- A centrepiece for a launch, an AI or energy product, or a loading moment that should feel precious. One per view.

## Files

- `assets/gem-smoke.tsx` — the component (`GemSmokeShape`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-gem-smoke`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/gem-smoke/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { GemSmokeShape } from '@/components/motif/gem-smoke/gem-smoke'

<GemSmokeShape />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `shape` | diamond | diamond | diamond / circle / daisy / metaballs | Shape |
| `colors` | #fe5b16, #f7ff61, #ffffff | #fe5b16, #f7ff61, #ffffff | 2–6 colors | Smoke |
| `colorBack` | #000000 | #000000 | color | Background |
| `colorInner` | #000000 | #000000 | color | Inner colour |
| `innerGlow` | 0.65 | 0.65 | 0–1 | Inner glow |
| `outerGlow` | 1 | 1 | 0–1 | Outer glow |
| `innerDistortion` | 0.6 | 0.6 | 0–1 | Inner churn |
| `outerDistortion` | 0.8 | 0.8 | 0–1 | Edge churn |
| `offset` | 0 | 0 | -1–1 (best -0.5–0.5) | Colour offset |
| `angle` | 0 | 0 | 0–360 deg | Angle |
| `size` | 0.8 | 0.8 | 0.2–1 | Smoke size |
| `scale` | 0.6 | 0.6 | 0.3–1 (best 0.45–0.85) | Scale |
| `speed` | 1 | 1 | 0–3 x (best 0.3–2) | Speed |

## Rules

- Keep it as the only animated focal point; it competes with anything else that moves.
- Pair dark backgrounds with bright smoke (Fire, Fluorescent), light backgrounds with grey smoke (Pearl).
- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
