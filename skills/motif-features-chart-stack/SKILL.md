---
name: motif-features-chart-stack
description: "A headline over three stacked dashboard cards with screw-dot corners — a combo chart, a segmented bar with a marker and an area chart. Hovering fans them apart with a springy rotate. A playful way to show an analytics product on a landing page. Use when the user asks for Fanning Chart Cards, 散开的图表卡片堆, features, analytics, charts, cards, hover, tremor or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/features-chart-stack"
  motif-item: "features-chart-stack"
  params-hash: "e17b8ac3"
---

# Fanning Chart Cards (散开的图表卡片堆)

A headline over three stacked dashboard cards with screw-dot corners — a combo chart, a segmented bar with a marker and an area chart. Hovering fans them apart with a springy rotate. A playful way to show an analytics product on a landing page.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/features-chart-stack.tsx` — the component (`FeaturesChartStack`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-features-chart-stack`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/features-chart-stack/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { FeaturesChartStack } from '@/components/motif/features-chart-stack/features-chart-stack'

<FeaturesChartStack />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `eyebrow` | Analytics | Analytics | ≤ 24 chars | Eyebrow |
| `headline` | Insights made for everyone | Insights made for everyone | ≤ 48 chars | Headline |
| `accent` | #3b82f6 | #3b82f6 | color | Primary series |
| `secondary` | #f59e0b | #f59e0b | color | Secondary series |
| `tone` | dark | dark | dark / light | Tone |
| `fanAngle` | 6 | 6 | 0–12 deg (best 4–9) | Rotation of the back card; the other two turn half as far |
| `spread` | 1 | 1 | 0.5–1.5 x | Spread |
| `spring` | visualDuration 0.35, bounce 0.35 | visualDuration 0.35, bounce 0.35 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
