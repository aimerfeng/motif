---
name: motif-timeline-milestones
description: "Milestones with dates, titles and short descriptions, laid out vertically or horizontally; everything up to the current step is complete with a filled rail and check indicators while later steps stay muted. Made for project plans, order tracking and roadmaps. Use when the user asks for Milestone Timeline, 里程碑时间线, timeline, milestones, roadmap, progress, steps, tracking or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/timeline-milestones"
  motif-item: "timeline-milestones"
  params-hash: "35cce49c"
---

# Milestone Timeline (里程碑时间线)

Milestones with dates, titles and short descriptions, laid out vertically or horizontally; everything up to the current step is complete with a filled rail and check indicators while later steps stay muted. Made for project plans, order tracking and roadmaps.

## When to use

- Numbers, stats and small data displays that change over time.

## Files

- `assets/timeline-milestones.tsx` — the component (`MilestoneTimeline`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-timeline-milestones`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/timeline-milestones/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MilestoneTimeline } from '@/components/motif/timeline-milestones/timeline-milestones'

<MilestoneTimeline />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `orientation` | vertical | vertical | vertical / horizontal | Orientation |
| `currentStep` | 3 | 3 | 0–4 | The demo steps up to this value |
| `indicator` | check | check | check / dot | Indicator |
| `datePosition` | above | above | above / below / side | "Side" applies to the vertical layout on wider screens |
| `showDescriptions` | true | true | boolean | Show descriptions |
| `accent` | #e4e4e7 | #e4e4e7 | color | The check uses white or near-black, whichever contrasts more |

## Rules

- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
