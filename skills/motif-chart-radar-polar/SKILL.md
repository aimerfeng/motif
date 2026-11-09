---
name: motif-chart-radar-polar
description: "Hand-drawn SVG radar and polar-area charts: two teams scored across five axes, or traffic sources as polar wedges; the legend toggles series and values appear on hover. For performance reviews and channel mix. Use when the user asks for Radar & Polar Charts, 雷达图与极坐标图, chart, radar chart, polar area, svg chart, spider chart or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/chart-radar-polar"
  motif-item: "chart-radar-polar"
  params-hash: "d85444de"
---

# Radar & Polar Charts (雷达图与极坐标图)

Hand-drawn SVG radar and polar-area charts: two teams scored across five axes, or traffic sources as polar wedges; the legend toggles series and values appear on hover. For performance reviews and channel mix.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/chart-radar-polar.tsx` — the component (`ChartRadarPolar`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-chart-radar-polar`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/chart-radar-polar/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { ChartRadarPolar } from '@/components/motif/chart-radar-polar/chart-radar-polar'

<ChartRadarPolar />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `chartType` | radar | radar | radar / polar | Chart type |
| `palette` | #4f46e5, #10b981, #f59e0b, #f43f5e | #4f46e5, #10b981, #f59e0b, #f43f5e | 4–4 colors | Radar uses the first two; the polar chart uses one per wedge |
| `rings` | 5 | 5 | 3–8 | Grid rings |
| `fillOpacity` | 0.2 | 0.2 | 0.05–0.4 | Radar area fill; polar wedges add 0.5 to it |
| `tone` | light | light | light / dark | Card tone |
| `showLegend` | true | true | boolean | Show legend |
| `animateIn` | true | true | boolean | Entrance animation |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from markmead/hyperui).
