---
name: motif-smoke-ring
description: "A slowly churning ring of smoke that can be tuned into a solar corona, a cloud halo or a thin glowing line. A centerpiece for launch pages. Use when the user asks for Smoke Ring, 烟环, ring, smoke, glow, shader, webgl, hero or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/smoke-ring"
  motif-item: "smoke-ring"
  params-hash: "9123a34e"
---

# Smoke Ring (烟环)

A slowly churning ring of smoke that can be tuned into a solar corona, a cloud halo or a thin glowing line. A centerpiece for launch pages.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/smoke-ring.tsx` — the component (`SmokeRingBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-smoke-ring`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/smoke-ring/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SmokeRingBackground } from '@/components/motif/smoke-ring/smoke-ring'

<SmokeRingBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #ffffff | #ffffff | 1–10 colors | Smoke moves through these colors |
| `colorBack` | #000000 | #000000 | color | Background |
| `radius` | 0.25 | 0.25 | 0.1–0.6 | Radius |
| `thickness` | 0.65 | 0.65 | 0.01–1 | Thickness |
| `innerShape` | 0.7 | 0.7 | 0–4 | Falloff on the inner edge |
| `noiseScale` | 3 | 3 | 0.5–5 (best 1–4) | Smoke scale |
| `noiseIterations` | 8 | 8 | 1–8 | Smoke detail |
| `speed` | 0.5 | 0.5 | 0–4 x (best 0.1–2) | Speed |
| `scale` | 0.8 | 0.8 | 0.4–3 x (best 0.5–2.5) | Scale |
| `offsetY` | 0 | 0 | -1–1 | Vertical offset |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
