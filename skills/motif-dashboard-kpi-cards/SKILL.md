---
name: motif-dashboard-kpi-cards
description: "Four metric cards with rolling numbers, sparklines that draw in from the left and semantic up/down deltas. Built for the top of a SaaS or analytics dashboard. Use when the user asks for KPI Cards with Sparklines, 指标卡（带迷你图）, dashboard, kpi, sparkline, metrics, svg chart or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dashboard-kpi-cards"
  motif-item: "dashboard-kpi-cards"
  params-hash: "787f5cee"
---

# KPI Cards with Sparklines (指标卡（带迷你图）)

Four metric cards with rolling numbers, sparklines that draw in from the left and semantic up/down deltas. Built for the top of a SaaS or analytics dashboard.

## When to use

- Use at the top of an analytics or admin page as the KPI strip, above charts and tables.

## Files

- `assets/dashboard-kpi-cards.tsx` — the component (`DashboardKpiCards`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dashboard-kpi-cards`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dashboard-kpi-cards/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { DashboardKpiCards } from '@/components/motif/dashboard-kpi-cards/dashboard-kpi-cards'

<DashboardKpiCards />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `chart` | area | area | area / line / bars | Chart type |
| `density` | comfortable | comfortable | compact / comfortable / spacious | Density |
| `seed` | 7 | 7 | 1–999 | The same seed always yields the same data |
| `heading` | Overview | Overview | ≤ 28 chars | Heading |
| `period` | Last 30 days | Last 30 days | ≤ 22 chars | Period label |
| `showDelta` | true | true | boolean | Show deltas |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Charts are hand-drawn SVG paths; do not add a chart library. Keep the accent to one hue and use emerald/rose only for deltas.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcn-ui/ui).
