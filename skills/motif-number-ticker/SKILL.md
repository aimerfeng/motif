---
name: motif-number-ticker
description: "A number that springs from a start value to its target with tabular digits, so nothing jitters. Made for dashboards, stat rows and landing-page metrics. Use when the user asks for Number Ticker, 数字滚动, number, counter, stats, spring, metrics or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/number-ticker"
  motif-item: "number-ticker"
  params-hash: "171e14cb"
---

# Number Ticker (数字滚动)

A number that springs from a start value to its target with tabular digits, so nothing jitters. Made for dashboards, stat rows and landing-page metrics.

## When to use

- Numbers, stats and small data displays that change over time.

## Files

- `assets/number-ticker.tsx` — the component (`NumberTicker`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/number-ticker/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { NumberTicker } from '@/components/motif/number-ticker/number-ticker'

<NumberTicker />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `value` | 12480 | 12480 | 0–1000000 | Target value |
| `startValue` | 0 | 0 | 0–1000000 | Start value |
| `decimalPlaces` | 0 | 0 | 0–4 (best 0–2) | Decimals |
| `prefix` |  |  | ≤ 4 chars | Prefix |
| `suffix` |  |  | ≤ 4 chars | Suffix |
| `grouping` | true | true | boolean | Thousands separator |
| `spring` | visualDuration 1.8, bounce 0 | visualDuration 1.8, bounce 0 | visualDuration s, bounce 0–1 | Spring |
| `delay` | 0 | 0 | 0–3 s | Delay |
| `direction` | up | up | up / down | Down rolls from the target back to the start value |
| `startOnView` | false | false | boolean | Start in viewport |

## Rules

- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
