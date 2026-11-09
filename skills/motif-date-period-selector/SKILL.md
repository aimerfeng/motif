---
name: motif-date-period-selector
description: "A date filter popover: pick an operator (is, before, after, between) and a granularity (day, month, quarter, half-year, year), then choose from the matching calendar or month, quarter and year grid, and apply or cancel. Built for report, finance and analytics filters. Use when the user asks for Period Selector, 时间周期选择器, date, filter, period, quarter, range, popover, analytics or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/date-period-selector"
  motif-item: "date-period-selector"
  params-hash: "0d947a1f"
---

# Period Selector (时间周期选择器)

A date filter popover: pick an operator (is, before, after, between) and a granularity (day, month, quarter, half-year, year), then choose from the matching calendar or month, quarter and year grid, and apply or cancel. Built for report, finance and analytics filters.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/date-period-selector.tsx` — the component (`DatePeriodSelector`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-date-period-selector`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/date-period-selector/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DatePeriodSelector } from '@/components/motif/date-period-selector/date-period-selector'

<DatePeriodSelector />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `defaultPeriod` | day | day | day / month / quarter / half-year / year | Default period |
| `allowRange` | true | true | boolean | Adds the "between" operator |
| `showOperators` | true | true | boolean | Show operators |
| `radius` | 8 | 8 | 0–14 px (best 4–12) | Corner radius |
| `yearSpan` | 12 | 12 | 2–30 (best 5–15) | Years shown |
| `maxYear` | 2026 | 2026 | 2000–2040 | Latest year |
| `spring` | visualDuration 0.3, bounce 0.2 | visualDuration 0.3, bounce 0.2 | visualDuration 0.05–4 s, bounce 0–0.9 | Tab spring |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
