---
name: motif-about-journey-timeline
description: "Milestones by year alternating either side of a center rail that draws downward, lighting each node as it passes. A roadmap variant shows phases as done, in progress or up next. Made for about pages and company stories. Use when the user asks for Company Journey Timeline, 公司历程时间线, timeline, about, milestones, company story, roadmap or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/about-journey-timeline"
  motif-item: "about-journey-timeline"
  params-hash: "022a238c"
---

# Company Journey Timeline (公司历程时间线)

Milestones by year alternating either side of a center rail that draws downward, lighting each node as it passes. A roadmap variant shows phases as done, in progress or up next. Made for about pages and company stories.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/about-journey-timeline.tsx` — the component (`AboutJourneyTimeline`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-about-journey-timeline`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/about-journey-timeline/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AboutJourneyTimeline } from '@/components/motif/about-journey-timeline/about-journey-timeline'

<AboutJourneyTimeline />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #a78bfa | #a78bfa | color | Accent |
| `variant` | journey | journey | journey / roadmap | Variant |
| `layout` | alternate | alternate | alternate / left | Layout |
| `cardStyle` | solid | solid | solid / glass | Card style |
| `drawRail` | true | true | boolean | Draw rail |
| `badge` | Our Journey | Our Journey | ≤ 24 chars | Badge |
| `heading` | The Story of Our Growth | The Story of Our Growth | ≤ 56 chars | Heading |
| `subheading` | From a small startup to a global platform trusted by thousands | From a small startup to a global platform trusted by thousands | ≤ 100 chars | Subheading |

## Rules

- Edit the JOURNEY and ROADMAP arrays for your own milestones; in the roadmap exactly one phase should be "now", since the rail stops at it.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
