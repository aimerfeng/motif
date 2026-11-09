---
name: motif-dashboard-portfolio-holdings
description: "Total portfolio value with its 24-hour change, a three-fund line chart with a hover crosshair and a holdings table whose color rails match the lines, with gains colored by sign. For investing and wealth dashboards. Use when the user asks for Portfolio Performance, 投资组合表现, dashboard, portfolio, line chart, holdings, finance or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dashboard-portfolio-holdings"
  motif-item: "dashboard-portfolio-holdings"
  params-hash: "599ef58a"
---

# Portfolio Performance (投资组合表现)

Total portfolio value with its 24-hour change, a three-fund line chart with a hover crosshair and a holdings table whose color rails match the lines, with gains colored by sign. For investing and wealth dashboards.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/dashboard-portfolio-holdings.tsx` — the component (`DashboardPortfolioHoldings`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dashboard-portfolio-holdings`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dashboard-portfolio-holdings/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { DashboardPortfolioHoldings } from '@/components/motif/dashboard-portfolio-holdings/dashboard-portfolio-holdings'

<DashboardPortfolioHoldings />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `currency` | USD | USD | USD / EUR / GBP / JPY | Currency |
| `seriesColors` | #3b82f6, #8b5cf6, #d946ef | #3b82f6, #8b5cf6, #d946ef | 3–3 colors | Fund colors |
| `curve` | linear | linear | linear / monotone | Curve |
| `range` | all | all | all / 30d | Range |
| `linkHover` | true | true | boolean | Hovering a row highlights its line |
| `showTable` | true | true | boolean | Show holdings table |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
