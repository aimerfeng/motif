---
name: motif-kpi-category-bar
description: "A headline total over a segmented category bar, with an optional target marker and a color-keyed legend: tickets resolved / in progress / escalated, query latency fast / medium / slow, sales by channel. Shows composition at a glance in a dashboard header. Use when the user asks for Distribution KPI Bars, 构成分布指标卡, dashboard, kpi, category bar, distribution, legend, metrics or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/kpi-category-bar"
  motif-item: "kpi-category-bar"
  params-hash: "6cc7c96d"
---

# Distribution KPI Bars (构成分布指标卡)

A headline total over a segmented category bar, with an optional target marker and a color-keyed legend: tickets resolved / in progress / escalated, query latency fast / medium / slow, sales by channel. Shows composition at a glance in a dashboard header.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/kpi-category-bar.tsx` — the component (`KpiCategoryBar`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-kpi-category-bar`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/kpi-category-bar/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { KpiCategoryBar } from '@/components/motif/kpi-category-bar/kpi-category-bar'

<KpiCategoryBar />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `layout` | cards | cards | cards / summary | Layout |
| `palette` | #3b82f6, #6b7280, #ef4444, #f59e0b | #3b82f6, #6b7280, #ef4444, #f59e0b | 2–5 colors | Segment colors |
| `segmentGap` | 2 | 2 | 0–6 | Segment gap |
| `radius` | 4 | 4 | 0–4 | Radius |
| `legendStyle` | stacked | stacked | stacked / inline | Legend style |
| `showMarker` | true | true | boolean | Target marker |
| `markerValue` | 80 | 80 | 0–100 | Target (%) |
| `animateIn` | true | true | boolean | Animate in |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
