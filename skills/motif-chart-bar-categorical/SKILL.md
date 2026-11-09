---
name: motif-chart-bar-categorical
description: "Bars for categories rather than time: grouped, stacked, horizontal with labels inside the bars, or diverging around zero; bars grow in and hovering dims the rest with a tooltip and total. For reports, comparisons and P&L cards. Use when the user asks for Categorical Bar Chart, 分类柱状图, chart, bar chart, stacked, grouped, svg chart or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/chart-bar-categorical"
  motif-item: "chart-bar-categorical"
  params-hash: "3ee776bf"
---

# Categorical Bar Chart (分类柱状图)

Bars for categories rather than time: grouped, stacked, horizontal with labels inside the bars, or diverging around zero; bars grow in and hovering dims the rest with a tooltip and total. For reports, comparisons and P&L cards.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/chart-bar-categorical.tsx` — the component (`ChartBarCategorical`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-chart-bar-categorical`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/chart-bar-categorical/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { ChartBarCategorical } from '@/components/motif/chart-bar-categorical/chart-bar-categorical'

<ChartBarCategorical />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `layout` | grouped | grouped | grouped / stacked / horizontal / negative | Layout |
| `palette` | #2563eb, #10b981 | #2563eb, #10b981 | 2–2 colors | Colors of the two series; positive and negative in the diverging layout |
| `radius` | 4 | 4 | 0–10 | Radius |
| `barGap` | 4 | 4 | 0–10 | Space between bars in the grouped layout |
| `showLabels` | false | false | boolean | Show labels |
| `showGrid` | true | true | boolean | Show grid |
| `animate` | true | true | boolean | Entrance animation |
| `tooltipIndicator` | dashed | dashed | dot / line / dashed | Tooltip indicator |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcn-ui/ui).
