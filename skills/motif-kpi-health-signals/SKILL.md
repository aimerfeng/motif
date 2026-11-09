---
name: motif-kpi-health-signals
description: "A cluster of metrics, each led by a three-bar signal that fills red, orange or green by threshold, followed by a percentage and fraction; switch to cards tagged within range, observe or critical, or to goal cards. A quiet health strip for funnels, data quality or SLOs. Use when the user asks for Signal-Bar Health Metrics, 信号格健康指标, dashboard, kpi, health, signal bars, status, metrics or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/kpi-health-signals"
  motif-item: "kpi-health-signals"
  params-hash: "93e566ac"
---

# Signal-Bar Health Metrics (信号格健康指标)

A cluster of metrics, each led by a three-bar signal that fills red, orange or green by threshold, followed by a percentage and fraction; switch to cards tagged within range, observe or critical, or to goal cards. A quiet health strip for funnels, data quality or SLOs.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/kpi-health-signals.tsx` — the component (`KpiHealthSignals`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-kpi-health-signals`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/kpi-health-signals/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { KpiHealthSignals } from '@/components/motif/kpi-health-signals/kpi-health-signals'

<KpiHealthSignals />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `layout` | signals | signals | signals / badges / goals | Layout |
| `bars` | 3 | 3 | 3–5 | Bars |
| `redThreshold` | 0.3 | 0.3 | 0.1–0.45 | Values below this show red |
| `orangeThreshold` | 0.7 | 0.7 | 0.5–0.9 | Values below this show orange, otherwise green |
| `showFraction` | true | true | boolean | Show fraction |
| `heading` | Overview | Overview | ≤ 28 chars | Heading |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
