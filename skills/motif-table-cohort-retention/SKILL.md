---
name: motif-table-cohort-retention
description: "Weekly cohorts down the side and weeks across the top, each cell shaded on a single-hue scale by retention with the count beneath; future weeks are dashed placeholders and the cohort column stays put while the grid scrolls sideways. For growth and product analytics. Use when the user asks for Cohort Retention Grid, 留存同期群表, table, cohort, retention, heatmap, analytics, sticky-column or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/table-cohort-retention"
  motif-item: "table-cohort-retention"
  params-hash: "3f941213"
---

# Cohort Retention Grid (留存同期群表)

Weekly cohorts down the side and weeks across the top, each cell shaded on a single-hue scale by retention with the count beneath; future weeks are dashed placeholders and the cohort column stays put while the grid scrolls sideways. For growth and product analytics.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/table-cohort-retention.tsx` — the component (`TableCohortRetention`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-table-cohort-retention`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/table-cohort-retention/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TableCohortRetention } from '@/components/motif/table-cohort-retention/table-cohort-retention'

<TableCohortRetention />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `hue` | #3b82f6 | #3b82f6 | color | Higher retention, stronger color |
| `weeks` | 10 | 10 | 4–10 (best 6–10) | Weeks |
| `cellRadius` | 4 | 4 | 0–12 px (best 2–8) | Cell radius |
| `cellGap` | 2 | 2 | 0–6 px (best 1–4) | Cell gap |
| `showCounts` | true | true | boolean | Show counts |
| `stickyColumn` | true | true | boolean | Sticky cohort column |

## Rules

- Pass data as Record<cohortLabel, { size, dates, weeks: ({ percentage, count } | null)[] }>; null weeks render as dashed placeholders for weeks that have not happened yet.
- Cell ink is derived from each cell color with CSS relative color syntax (oklch(from …)), so it needs a current Chromium, Safari or Firefox.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
