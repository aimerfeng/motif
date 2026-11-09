---
name: motif-chart-area-forecast
description: "Actuals as a solid area that hands off at a today divider to a dashed forecast over a hatched confidence band, with glowing hover markers. For revenue projections, capacity planning and sales targets. Use when the user asks for Forecast Area Chart, 预测面积图, chart, area chart, forecast, confidence band, svg chart or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/chart-area-forecast"
  motif-item: "chart-area-forecast"
  params-hash: "1133529f"
---

# Forecast Area Chart (预测面积图)

Actuals as a solid area that hands off at a today divider to a dashed forecast over a hatched confidence band, with glowing hover markers. For revenue projections, capacity planning and sales targets.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/chart-area-forecast.tsx` — the component (`ChartAreaForecast`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-chart-area-forecast`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/chart-area-forecast/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { ChartAreaForecast } from '@/components/motif/chart-area-forecast/chart-area-forecast'

<ChartAreaForecast />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | #60a5fa | #60a5fa | color | Actual color |
| `forecastColor` | #a78bfa | #a78bfa | color | Forecast color |
| `pattern` | stripes | stripes | stripes / dots / solid | Band pattern |
| `bandWidth` | 0.08 | 0.08 | 0–0.2 | Uncertainty added per forecast month |
| `curve` | natural | natural | natural / linear | Curve |
| `showMarkers` | true | true | boolean | Show markers |
| `todayIndex` | 5 | 5 | 2–7 | Today index |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
