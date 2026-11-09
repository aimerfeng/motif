---
name: motif-date-week-strip
description: "A horizontal row of day pills with weekday and date, with arrows to page by week. The selected pill glides to the new day, today gets a dot and days with events get markers. For mobile agendas, fitness logs and picking a delivery day. Use when the user asks for Week Strip Date Picker, 周视图日期条, date, calendar, week, picker, agenda, mobile or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/date-week-strip"
  motif-item: "date-week-strip"
  params-hash: "b0d3cf4a"
---

# Week Strip Date Picker (周视图日期条)

A horizontal row of day pills with weekday and date, with arrows to page by week. The selected pill glides to the new day, today gets a dot and days with events get markers. For mobile agendas, fitness logs and picking a delivery day.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/date-week-strip.tsx` — the component (`DateWeekStrip`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-date-week-strip`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/date-week-strip/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DateWeekStrip } from '@/components/motif/date-week-strip/date-week-strip'

<DateWeekStrip />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `days` | 7 | 7 | 3–7 (best 5–7) | The arrows page by this many days |
| `weekStart` | monday | monday | monday / sunday / today | Start on |
| `pillStyle` | solid | solid | solid / soft / outline | Selected pill |
| `showMarkers` | true | true | boolean | Event markers |
| `radius` | 10 | 10 | 2–20 px (best 6–16) | Corner radius |
| `spring` | visualDuration 0.35, bounce 0.2 | visualDuration 0.35, bounce 0.2 | visualDuration 0.05–4 s, bounce 0–0.9 | Glide spring |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
