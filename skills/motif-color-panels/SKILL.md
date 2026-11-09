---
name: motif-color-panels
description: "A fan of glowing translucent glass panels turns slowly around a central axis, edges lit and fading toward the axis. A hero or launch-page backdrop for AI, fintech and design-tool products. Use when the user asks for Color Panels, 旋转光板, panels, glass, 3d, glow, prism, shader, webgl, hero or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/color-panels"
  motif-item: "color-panels"
  params-hash: "d64c5407"
---

# Color Panels (旋转光板)

A fan of glowing translucent glass panels turns slowly around a central axis, edges lit and fading toward the axis. A hero or launch-page backdrop for AI, fintech and design-tool products.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/color-panels.tsx` — the component (`ColorPanelsBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-color-panels`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/color-panels/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ColorPanelsBackground } from '@/components/motif/color-panels/color-panels'

<ColorPanelsBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #ff9d00, #fd4f30, #809bff, #6d2eff, #333aff, #f15cff, #ffd557 | #ff9d00, #fd4f30, #809bff, #6d2eff, #333aff, #f15cff, #ffd557 | 1–7 colors | Panels take these colors in turn, up to 7 |
| `colorBack` | #04040c | #04040c | color | Background |
| `density` | 3 | 3 | 0.8–7 (best 1.2–5) | How tightly the panels pack around the axis; higher fits more panels into a narrower fan |
| `length` | 1.1 | 1.1 | 0.6–2.5 (best 0.8–2) | How far each panel runs along the axis |
| `skew` | 0 | 0 | -0.6–1 (best -0.3–0.8) | Positive narrows the panels outward into a crystal; negative flares them open |
| `blur` | 0 | 0 | 0–0.5 | 0 keeps crisp glass edges; higher turns them frosted |
| `fadeOut` | 0.3 | 0.3 | 0–0.8 | How much the panels fade toward the viewer |
| `rotation` | 100 | 100 | 0–360 deg | Direction of the axis; around 90° is vertical |
| `scale` | 0.78 | 0.78 | 0.4–1.4 x (best 0.5–1.3) | Scale |
| `speed` | 0.5 | 0.5 | 0–3 x (best 0.2–1.5) | Speed |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
