---
name: motif-contribution-heatmap
description: "A year of daily activity as a grid of squares by week and weekday, colored in levels, with month labels, a legend and a total; hover or use the arrow keys to read a day, and cells ripple in on mount. For developer profiles, habit trackers and usage pages. Use when the user asks for Contribution Heatmap, 贡献热力图, heatmap, calendar, contributions, activity, svg chart or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/contribution-heatmap"
  motif-item: "contribution-heatmap"
  params-hash: "f5194055"
---

# Contribution Heatmap (贡献热力图)

A year of daily activity as a grid of squares by week and weekday, colored in levels, with month labels, a legend and a total; hover or use the arrow keys to read a day, and cells ripple in on mount. For developer profiles, habit trackers and usage pages.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/contribution-heatmap.tsx` — the component (`ContributionHeatmap`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-contribution-heatmap`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/contribution-heatmap/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { ContributionHeatmap } from '@/components/motif/contribution-heatmap/contribution-heatmap'

<ContributionHeatmap />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `palette` | #0e4429, #39d353 | #0e4429, #39d353 | 2–2 colors | Lowest to highest level; the levels in between are mixed. Empty days use the muted theme color |
| `levels` | 4 | 4 | 2–6 | Levels |
| `blockSize` | 12 | 12 | 8–16 px | Block size |
| `blockGap` | 4 | 4 | 1–6 px | Block gap |
| `radius` | 2 | 2 | 0–8 px | Radius |
| `weekStart` | sunday | sunday | sunday / monday | Week starts on |
| `showLegend` | true | true | boolean | Show legend |
| `seed` | 7 | 7 | 1–999 | Generates a sample year when no data is passed |

## Rules

- Each Activity needs a level within 0..levels; compute it from your own thresholds. The calendar scrolls horizontally inside its container on narrow screens.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
