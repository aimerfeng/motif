---
name: motif-sliding-number
description: "When the value changes, each digit rolls to its new value like an odometer, in the direction the number moved. For revenue, user counts and timers that update live. Use when the user asks for Sliding Number, 滚动数字, number, counter, odometer, digits, metric, spring or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/sliding-number"
  motif-item: "sliding-number"
  params-hash: "78adde64"
---

# Sliding Number (滚动数字)

When the value changes, each digit rolls to its new value like an odometer, in the direction the number moved. For revenue, user counts and timers that update live.

## When to use

- Numbers, stats and small data displays that change over time.

## Files

- `assets/sliding-number.tsx` — the component (`SlidingNumber`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/sliding-number/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SlidingNumber } from '@/components/motif/sliding-number/sliding-number'

<SlidingNumber />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `value` | 12480 | 12480 | 0–999999 | Change it to watch the digits roll |
| `prefix` | $ | $ | ≤ 4 chars | Prefix |
| `suffix` |  |  | ≤ 4 chars | Suffix |
| `minDigits` | 1 | 1 | 1–8 | Pads with leading zeros, handy for timers |
| `grouping` | true | true | boolean | Thousands separator |
| `spring` | visualDuration 0.7, bounce 0.2 | visualDuration 0.7, bounce 0.2 | visualDuration s, bounce 0–1 | More bounce makes digits settle with a wobble |

## Rules

- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
