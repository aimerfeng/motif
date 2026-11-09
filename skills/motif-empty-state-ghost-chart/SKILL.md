---
name: motif-empty-state-ghost-chart
description: "Chart cards before any data arrives: faded placeholder bars, a dashed line or empty capacity rings behind a “No data to show” message, a note that data can take 24 hours and a connect-a-source action; a tabbed variant keeps the card’s real header. For first-run dashboards. Use when the user asks for Empty Chart Placeholders, 空数据图表占位, empty state, chart, dashboard, placeholder, no data, tremor or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/empty-state-ghost-chart"
  motif-item: "empty-state-ghost-chart"
  params-hash: "93239a2c"
---

# Empty Chart Placeholders (空数据图表占位)

Chart cards before any data arrives: faded placeholder bars, a dashed line or empty capacity rings behind a “No data to show” message, a note that data can take 24 hours and a connect-a-source action; a tabbed variant keeps the card’s real header. For first-run dashboards.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/empty-state-ghost-chart.tsx` — the component (`EmptyStateGhostChart`); the tuned values are baked into its `defaults` object
- `assets/empty-state-ghost-chart.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-empty-state-ghost-chart`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/empty-state-ghost-chart/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { EmptyStateGhostChart } from '@/components/motif/empty-state-ghost-chart/empty-state-ghost-chart'

<EmptyStateGhostChart />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `ghostType` | bars | bars | bars / line / ring / tabs | Placeholder |
| `accent` | #3b82f6 | #3b82f6 | color | Accent |
| `tone` | dashed | dashed | dashed / filled | Frame |
| `shimmer` | true | true | boolean | Pulse |
| `message` | No data to show | No data to show | ≤ 40 chars | Message |
| `actionLabel` | Connect database | Connect database | ≤ 24 chars | Leave empty to hide the action |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
