---
name: motif-dashboard-area-chart
description: "A two-series chart card with a time-range switch, area, bar or line drawing and a crosshair tooltip. Hand-drawn SVG, no chart library. Use when the user asks for Interactive Chart Card, 交互图表卡, dashboard, chart, area chart, bar chart, tooltip, svg chart or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dashboard-area-chart"
  motif-item: "dashboard-area-chart"
  params-hash: "590a6923"
---

# Interactive Chart Card (交互图表卡)

A two-series chart card with a time-range switch, area, bar or line drawing and a crosshair tooltip. Hand-drawn SVG, no chart library.

## When to use

- Use as the main chart of an analytics page, under a KPI strip. It measures its own width, so give it a container, not a fixed size.

## Files

- `assets/dashboard-area-chart.tsx` — the component (`DashboardAreaChart`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dashboard-area-chart`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dashboard-area-chart/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { DashboardAreaChart } from '@/components/motif/dashboard-area-chart/dashboard-area-chart'

<DashboardAreaChart />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Primary series |
| `secondary` | #38bdf8 | #38bdf8 | color | Secondary series |
| `chart` | area | area | area / lines / bars | Chart type |
| `range` | 30d | 30d | 7d / 30d / 90d | Default range |
| `density` | comfortable | comfortable | compact / comfortable / spacious | Chart height |
| `seed` | 11 | 11 | 1–999 | Data seed |
| `title` | Visitors | Visitors | ≤ 28 chars | Title |
| `subtitle` | Sessions by device, counted daily | Sessions by device, counted daily | ≤ 56 chars | Subtitle |
| `showGrid` | true | true | boolean | Show gridlines |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- The chart is plain SVG computed from data arrays; replace makeData with real series and keep the axes helpers.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcn-ui/ui).
