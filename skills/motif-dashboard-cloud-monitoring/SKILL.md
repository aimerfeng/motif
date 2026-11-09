---
name: motif-dashboard-cloud-monitoring
description: "Six headline metrics (overall cost, active workspaces, active users, uptime, response time, MTTR), each with a spark chart and edit-alarm / view-details actions on hover, above a per-period summary table. For cloud consoles and ops dashboards. Use when the user asks for Cloud Monitoring Overview, 云资源监控总览, dashboard, monitoring, cloud, sparkline, metrics, table or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dashboard-cloud-monitoring"
  motif-item: "dashboard-cloud-monitoring"
  params-hash: "5da0ff28"
---

# Cloud Monitoring Overview (云资源监控总览)

Six headline metrics (overall cost, active workspaces, active users, uptime, response time, MTTR), each with a spark chart and edit-alarm / view-details actions on hover, above a per-period summary table. For cloud consoles and ops dashboards.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/dashboard-cloud-monitoring.tsx` — the component (`DashboardCloudMonitoring`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dashboard-cloud-monitoring`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dashboard-cloud-monitoring/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { DashboardCloudMonitoring } from '@/components/motif/dashboard-cloud-monitoring/dashboard-cloud-monitoring'

<DashboardCloudMonitoring />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #3b82f6 | #3b82f6 | color | Accent |
| `alertColor` | #ef4444 | #ef4444 | color | Alert color |
| `sparkType` | area | area | area / line / bar | Spark chart |
| `timePeriod` | today | today | today / 7d / 30d / 365d / all | Time period |
| `columns` | 3 | 3 | 2 / 3 | Columns (wide) |
| `heading` | Cloud monitoring | Cloud monitoring | ≤ 32 chars | Heading |
| `showTable` | true | true | boolean | Show table |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
