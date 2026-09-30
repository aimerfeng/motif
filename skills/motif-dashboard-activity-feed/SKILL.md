---
name: motif-dashboard-activity-feed
description: "Deploys, merges, comments and alerts on one timeline: icon nodes, a rail that draws downward and category filters. Switch to a compact avatar list when space is tight. Use when the user asks for Activity Feed, 活动流, dashboard, activity, timeline, feed, notifications or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dashboard-activity-feed"
  motif-item: "dashboard-activity-feed"
  params-hash: "c3f9f080"
---

# Activity Feed (活动流)

Deploys, merges, comments and alerts on one timeline: icon nodes, a rail that draws downward and category filters. Switch to a compact avatar list when space is tight.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/dashboard-activity-feed.tsx` — the component (`DashboardActivityFeed`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dashboard-activity-feed/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { DashboardActivityFeed } from '@/components/motif/dashboard-activity-feed/dashboard-activity-feed'

<DashboardActivityFeed />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `layout` | timeline | timeline | timeline / list | Layout |
| `density` | comfortable | comfortable | compact / comfortable / spacious | Density |
| `count` | 6 | 6 | 3–8 | Entries |
| `seed` | 3 | 3 | 1–999 | Data seed |
| `title` | Activity | Activity | ≤ 28 chars | Title |
| `live` | true | true | boolean | Show live badge |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
