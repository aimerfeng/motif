---
name: motif-stats-metric-tiles
description: "Four big numbers counting up from zero, each with a sparkline that draws itself underneath. Bordered tiles or a single row split by hairlines, replaying on a timer. Use when the user asks for Metric Tiles, 数据指标磁贴, stats, metrics, numbers, counter, sparkline, social proof or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/stats-metric-tiles"
  motif-item: "stats-metric-tiles"
  params-hash: "ad8e43f0"
---

# Metric Tiles (数据指标磁贴)

Four big numbers counting up from zero, each with a sparkline that draws itself underneath. Bordered tiles or a single row split by hairlines, replaying on a timer.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/stats-metric-tiles.tsx` — the component (`StatsMetricTiles`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-stats-metric-tiles`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/stats-metric-tiles/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { StatsMetricTiles } from '@/components/motif/stats-metric-tiles/stats-metric-tiles'

<StatsMetricTiles />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `eyebrow` | By the numbers | By the numbers | ≤ 28 chars | Eyebrow |
| `heading` | Boring infrastructure, measured in public | Boring infrastructure, measured in public | ≤ 64 chars | Heading |
| `subline` | The four numbers we watch every morning, and the ones we would like you to hold us to. | The four numbers we watch every morning, and the ones we would like you to hold us to. | ≤ 130 chars | Subline |
| `accent` | #2dd4bf | #2dd4bf | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `font` | geist | geist | geist / grotesk / serif | Number font |
| `radius` | 20 | 20 | 0–32 px (best 6–28) | Tile radius |
| `layout` | tiles | tiles | tiles / lines | Layout |
| `duration` | 2 | 2 | 0.8–4 s (best 1.2–3) | Count-up time |
| `replay` | 8 | 8 | 0–20 s | 0 plays once |

## Rules

- Show four numbers, each with a label and one sentence of context. Numbers must be real or clearly illustrative; never inflate them.
- Only the unit suffix and the sparkline take the accent color; digits stay in the foreground color and use tabular figures so they do not jitter.
- Count-up runs once per visit; replaying on a timer is for previews only, set replay to 0 in production.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
