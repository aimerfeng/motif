---
name: motif-dashboard-usage-billing
description: "Usage meters that change color near the limit, an approaching-limit notice, the next invoice breakdown and a six-month spend chart. Made for a settings page billing tab. Use when the user asks for Usage & Billing Panel, 用量与账单, dashboard, billing, usage, progress, settings or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dashboard-usage-billing"
  motif-item: "dashboard-usage-billing"
  params-hash: "e992647a"
---

# Usage & Billing Panel (用量与账单)

Usage meters that change color near the limit, an approaching-limit notice, the next invoice breakdown and a six-month spend chart. Made for a settings page billing tab.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/dashboard-usage-billing.tsx` — the component (`DashboardUsageBilling`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dashboard-usage-billing/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { DashboardUsageBilling } from '@/components/motif/dashboard-usage-billing/dashboard-usage-billing'

<DashboardUsageBilling />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `layout` | split | split | split / stacked | Layout |
| `density` | comfortable | comfortable | compact / comfortable / spacious | Density |
| `planName` | Team | Team | ≤ 14 chars | Plan name |
| `seed` | 5 | 5 | 1–999 | Data seed |
| `warnAt` | 80 | 80 | 50–95 % | Bars turn amber above it |
| `showInvoice` | true | true | boolean | Show invoice |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
