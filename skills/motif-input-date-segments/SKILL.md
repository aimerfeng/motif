---
name: motif-input-date-segments
description: "Day, month and year (plus hour and minute) are separate focusable segments: arrow keys roll each one, typing fills a segment and jumps to the next, and placeholders follow the locale’s order. Made for birthdays, deadlines and booking forms where a calendar is overkill. Use when the user asks for Segmented Date Field, 分段日期时间输入, date, time, input, form, segments, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-date-segments"
  motif-item: "input-date-segments"
  params-hash: "447c3de4"
---

# Segmented Date Field (分段日期时间输入)

Day, month and year (plus hour and minute) are separate focusable segments: arrow keys roll each one, typing fills a segment and jumps to the next, and placeholders follow the locale’s order. Made for birthdays, deadlines and booking forms where a calendar is overkill.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/input-date-segments.tsx` — the component (`InputDateSegments`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-date-segments`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-date-segments/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputDateSegments } from '@/components/motif/input-date-segments/input-date-segments'

<InputDateSegments />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `granularity` | day | day | day / minute / time | Granularity |
| `hourCycle` | 12 | 12 | 12 / 24 | Hour cycle |
| `locale` | en-US | en-US | en-US / en-GB / de-DE / fr-FR / ja-JP / zh-CN | Sets the segment order and separators |
| `showIcon` | false | false | boolean | Show icon |
| `iconPosition` | start | start | start / end | Icon position |
| `size` | md | md | sm / md / lg | Size |
| `radius` | 6 | 6 | 0–16 px | Corner radius |
| `accent` | #34334a | #34334a | color | Focused segment |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
