---
name: motif-gantt-timeline
description: "A project Gantt chart: grouped tasks with durations on the left, a day, month or quarter grid on the right with a today line and milestone markers. Bars drag to move and resize from either edge. For project planning and release roadmaps. Use when the user asks for Gantt Timeline, 甘特时间线, gantt, timeline, roadmap, schedule, project, drag or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/gantt-timeline"
  motif-item: "gantt-timeline"
  params-hash: "10f6cb79"
---

# Gantt Timeline (甘特时间线)

A project Gantt chart: grouped tasks with durations on the left, a day, month or quarter grid on the right with a today line and milestone markers. Bars drag to move and resize from either edge. For project planning and release roadmaps.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/gantt-timeline.tsx` — the component (`GanttChart`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-gantt-timeline`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/gantt-timeline/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { GanttChart } from '@/components/motif/gantt-timeline/gantt-timeline'

<GanttChart />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `range` | monthly | monthly | daily / monthly / quarterly | Range |
| `zoom` | 100 | 100 | 50–200 % (best 70–150) | Column width as a percentage |
| `accent` | #7c8cff | #7c8cff | color | Also used for focus rings |
| `statusColors` | #6b7280, #f59e0b, #10b981 | #6b7280, #f59e0b, #10b981 | 3–3 colors | Planned, in progress and done, in order |
| `radius` | 8 | 8 | 0–14 px (best 4–10) | Bar radius |
| `rowHeight` | 36 | 36 | 32–52 px (best 34–44) | Row height |
| `sidebarWidth` | 300 | 300 | 200–360 px | Shrinks on narrow screens |
| `showToday` | true | true | boolean | Today marker |
| `showMarkers` | true | true | boolean | Milestones |

## Rules

- Dates are plain Date objects; the timeline spans last year to next year and grows when scrolled to either end. Keep onMove and onAddItem stable (useCallback) so the grid does not re-render on every parent render.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
