---
name: motif-goal-rings
description: "Several goals as concentric rings, each sweeping to its completion on a spring; a ring past 100% runs a second lap with a shadow at its tip. Hover or focus a legend row to light up one ring and show its percentage in the middle. For habit trackers, daily goals and team targets. Use when the user asks for Goal Rings, 目标同心环, progress, rings, goals, radial, chart, habits, dashboard or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/goal-rings"
  motif-item: "goal-rings"
  params-hash: "ad27388f"
---

# Goal Rings (目标同心环)

Several goals as concentric rings, each sweeping to its completion on a spring; a ring past 100% runs a second lap with a shadow at its tip. Hover or focus a legend row to light up one ring and show its percentage in the middle. For habit trackers, daily goals and team targets.

## When to use

- Use to compare progress on two to four goals that share a time frame (a day, a sprint). For a single goal use a single progress ring; for trends over time use a chart.

## Files

- `assets/goal-rings.tsx` — the component (`GoalRings`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-goal-rings`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/goal-rings/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { GoalRings } from '@/components/motif/goal-rings/goal-rings'

<GoalRings />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `size` | 200 | 200 | 140–280 px (best 168–240) | Size |
| `thickness` | 20 | 20 | 10–28 px (best 14–24) | Shrinks automatically when the rings would not fit |
| `gap` | 4 | 4 | 2–10 px (best 3–7) | Ring gap |
| `palette` | #8a7dff, #ff74b1, #ffb347 | #8a7dff, #ff74b1, #ffb347 | 1–5 colors | Applied from the outer ring inward |
| `trackOpacity` | 0.16 | 0.16 | 0.06–0.3 (best 0.1–0.22) | Track opacity |
| `spring` | visualDuration 1.1, bounce 0.05 | visualDuration 1.1, bounce 0.05 | visualDuration 0.05–4 s, bounce 0–0.9 | Fill spring |
| `stagger` | 0.12 | 0.12 | 0–0.3 s | Stagger |
| `showLegend` | true | true | boolean | Legend |
| `showCenter` | true | true | boolean | Center percentage |

## Rules

- Pass rings as [{ id, label, value, goal, display?, goalDisplay? }] from the outer ring inward; display / goalDisplay format the numbers in the legend (for example "3h 12m" of "4h").
- Values above the goal draw a second lap (up to 200%); keep that for genuinely exceeded goals, it is the most eye-catching state.
- The rings are one labelled image for screen readers and the legend repeats every number as text; legend rows are buttons that highlight and pin a ring.
- Controlled highlight: active + onActiveChange. Thickness shrinks automatically if the rings would not fit the size.
- Never move backwards; ease the bar but keep it honest.
- Expose value with role="progressbar" and aria-valuenow.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).
