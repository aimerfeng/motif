---
name: motif-heatmap
description: "A shape seen through a thermal camera: bands of colour flow from the centre to the edges with a soft glow around them. Heart, bolt and spark shapes are built in, or type a word; everything is drawn on a canvas at runtime, so no image assets are needed. Use when the user asks for Heatmap, 热力图形, heatmap, thermal, glow, logo, gradient, webgl, shader, paper or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource/archivo-black, @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/heatmap"
  motif-item: "heatmap"
  params-hash: "5ef248f4"
---

# Heatmap (热力图形)

A shape seen through a thermal camera: bands of colour flow from the centre to the edges with a soft glow around them. Heart, bolt and spark shapes are built in, or type a word; everything is drawn on a canvas at runtime, so no image assets are needed.

## When to use

- A hero symbol, a status or "trending" moment, an event badge. Works best as a single bold silhouette on a dark field.

## Files

- `assets/heatmap.tsx` — the component (`HeatmapMark`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-heatmap`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource/archivo-black @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/heatmap/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';` to the global stylesheet.
4. Use it:

```tsx
import { HeatmapMark } from '@/components/motif/heatmap/heatmap'

<HeatmapMark />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `mark` | heart | heart | heart / bolt / spark / text | Mark |
| `text` | HOT | HOT | ≤ 6 chars | Used when the mark is Text |
| `colors` | #11206a, #1f3ba2, #2f63e7, #6bd7ff, #ffe679, #ff991e, #ff4c00 | #11206a, #1f3ba2, #2f63e7, #6bd7ff, #ffe679, #ff991e, #ff4c00 | 2–10 colors | From cold to hot |
| `colorBack` | #000000 | #000000 | color | Background |
| `contour` | 0.5 | 0.5 | 0–1 | How closely the bands follow the outline |
| `innerGlow` | 0.5 | 0.5 | 0–1 | Inner glow |
| `outerGlow` | 0.5 | 0.5 | 0–1 | Outer glow |
| `noise` | 0 | 0 | 0–1 (best 0–0.8) | Noise |
| `angle` | 0 | 0 | 0–360 deg | Flow angle |
| `scale` | 0.68 | 0.68 | 0.3–1.2 (best 0.5–0.95) | Size |
| `speed` | 1 | 1 | 0–3 x (best 0.3–2) | Speed |

## Rules

- Use a solid, heavy silhouette; thin lines and small counters disappear in the glow.
- Order the palette from cold to hot; 4 to 7 colours read best.
- The mark is decorative: put the real label in accessible text nearby.
- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
