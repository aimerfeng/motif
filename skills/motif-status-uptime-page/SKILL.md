---
name: motif-status-uptime-page
description: "A public status page: an all-services-online header, a 90-day uptime strip per service (cut to 60 or 30 days on narrow screens) with a hover card for each day’s incident, a legend and a collapsible downtime history. The pipeline variant tracks scheduled sync runs instead. Use when the user asks for Status Page, 服务状态页, status page, uptime, tracker, incidents, monitoring, pipeline or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/status-uptime-page"
  motif-item: "status-uptime-page"
  params-hash: "8a4b8548"
---

# Status Page (服务状态页)

A public status page: an all-services-online header, a 90-day uptime strip per service (cut to 60 or 30 days on narrow screens) with a hover card for each day’s incident, a legend and a collapsible downtime history. The pipeline variant tracks scheduled sync runs instead.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/status-uptime-page.tsx` — the component (`StatusUptimePage`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-status-uptime-page`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/status-uptime-page/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { StatusUptimePage } from '@/components/motif/status-uptime-page/status-uptime-page'

<StatusUptimePage />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | services | services | services / pipeline | Variant |
| `services` | 3 | 3 | 1–4 | How many services or pipelines |
| `days` | 90 | 90 | 30–90 | Days on wide screens; tablets show up to 60, phones up to 30 |
| `okColor` | #10b981 | #10b981 | color | Operational |
| `degradedColor` | #f59e0b | #f59e0b | color | Degraded |
| `downColor` | #ef4444 | #ef4444 | color | Downtime |
| `tone` | dark | dark | dark / light | Tone |
| `blockGap` | 2 | 2 | 0–4 px (best 1–3) | Block gap |
| `blockRadius` | 1 | 1 | 0–4 px | Block radius |

## Rules

- Keep the three status colors semantic (green ok, amber degraded, red down); swap the SERVICES / PIPELINES arrays for real data rather than recoloring them.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
