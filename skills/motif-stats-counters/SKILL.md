---
name: motif-stats-counters
description: "Four headline numbers that roll up from zero, as a divided row, cards with mini bars, or a text-plus-rings split. Pair with an editorial serif for a calmer feel. Use when the user asks for Stats Counters, 数据统计条, stats, metrics, counter, numbers, social proof or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/stats-counters"
  motif-item: "stats-counters"
  params-hash: "538d33cf"
---

# Stats Counters (数据统计条)

Four headline numbers that roll up from zero, as a divided row, cards with mini bars, or a text-plus-rings split. Pair with an editorial serif for a calmer feel.

## When to use

- Use under a hero or above pricing as social proof. Replace the STATS array with real, verifiable numbers.

## Files

- `assets/stats-counters.tsx` — the component (`StatsCounters`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-stats-counters`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/stats-counters/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { StatsCounters } from '@/components/motif/stats-counters/stats-counters'

<StatsCounters />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `font` | serif | serif | serif / sans / grotesk | Number & heading font |
| `variant` | row | row | row / tiles / split | Layout |
| `density` | comfortable | comfortable | compact / comfortable / spacious | Vertical spacing |
| `heading` | Numbers we’re quietly proud of | Numbers we’re quietly proud of | ≤ 48 chars | Heading |
| `subheading` | Measured across every workspace on Halcyon, refreshed each morning. | Measured across every workspace on Halcyon, refreshed each morning. | ≤ 100 chars | Subheading |
| `duration` | 1.8 | 1.8 | 0.6–4 s (best 1–3) | Count duration |
| `showTrend` | true | true | boolean | Show trends |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Keep it to four figures with short labels. Numbers use tabular figures so they never jitter while counting.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
