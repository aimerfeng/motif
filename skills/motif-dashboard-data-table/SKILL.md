---
name: motif-dashboard-data-table
description: "A data table with status badges, filter tabs, search and sortable columns, gradient initial avatars and staggered row entrance. Fits invoices, orders and user lists. Use when the user asks for Status Data Table, 状态数据表, dashboard, table, badge, invoice, sortable or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dashboard-data-table"
  motif-item: "dashboard-data-table"
  params-hash: "66b608c6"
---

# Status Data Table (状态数据表)

A data table with status badges, filter tabs, search and sortable columns, gradient initial avatars and staggered row entrance. Fits invoices, orders and user lists.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/dashboard-data-table.tsx` — the component (`DashboardDataTable`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dashboard-data-table/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { DashboardDataTable } from '@/components/motif/dashboard-data-table/dashboard-data-table'

<DashboardDataTable />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `badge` | soft | soft | soft / dot / outline | Badge style |
| `density` | comfortable | comfortable | compact / comfortable / spacious | Row density |
| `rows` | 7 | 7 | 4–12 (best 5–9) | Rows |
| `seed` | 4 | 4 | 1–999 | Data seed |
| `title` | Recent invoices | Recent invoices | ≤ 30 chars | Title |
| `subtitle` | Payments across every workspace, newest first. | Payments across every workspace, newest first. | ≤ 64 chars | Subtitle |
| `showAvatars` | true | true | boolean | Show avatars |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
