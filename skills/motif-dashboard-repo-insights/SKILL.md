---
name: motif-dashboard-repo-insights
description: "A weekly repository summary: a range select, segmented bars for pull requests and issues, four counters, a commit and diff summary and a top-contributors chart. For developer platforms and internal engineering dashboards. Use when the user asks for Repository Insights, 代码仓库洞察, dashboard, github, repository, pull requests, contributors or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dashboard-repo-insights"
  motif-item: "dashboard-repo-insights"
  params-hash: "9f43fc99"
---

# Repository Insights (代码仓库洞察)

A weekly repository summary: a range select, segmented bars for pull requests and issues, four counters, a commit and diff summary and a top-contributors chart. For developer platforms and internal engineering dashboards.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/dashboard-repo-insights.tsx` — the component (`DashboardRepoInsights`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dashboard-repo-insights`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dashboard-repo-insights/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { DashboardRepoInsights } from '@/components/motif/dashboard-repo-insights/dashboard-repo-insights'

<DashboardRepoInsights />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `repoName` | northwind/ledger | northwind/ledger | ≤ 28 chars | Repository name |
| `accent` | #6366f1 | #6366f1 | color | Open color |
| `tone` | #10b981 | #10b981 | color | Done color |
| `range` | week | week | week / month / year | Range |
| `contributors` | 5 | 5 | 3–5 | Contributors |
| `barStyle` | bars | bars | bars / share | Contributor chart |
| `showSummary` | true | true | boolean | Show summary |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
