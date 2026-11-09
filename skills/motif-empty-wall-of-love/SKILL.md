---
name: motif-empty-wall-of-love
description: "An empty testimonials state: click the folder and three blank notes spring out, ready for the first quote, with a call to action to collect it. For review widgets, community pages and first-run dashboards. Use when the user asks for Empty Wall of Love, 空白好评墙, empty state, testimonials, folder, spring, reviews or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/empty-wall-of-love"
  motif-item: "empty-wall-of-love"
  params-hash: "2f90b238"
---

# Empty Wall of Love (空白好评墙)

An empty testimonials state: click the folder and three blank notes spring out, ready for the first quote, with a call to action to collect it. For review widgets, community pages and first-run dashboards.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/empty-wall-of-love.tsx` — the component (`EmptyWallOfLove`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-empty-wall-of-love`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/empty-wall-of-love/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { EmptyWallOfLove } from '@/components/motif/empty-wall-of-love/empty-wall-of-love'

<EmptyWallOfLove />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `folderColor` | #EBEBEB | #EBEBEB | color | Folder color |
| `noteColors` | #FFFFFF, #FFFFFF, #FFFFFF | #FFFFFF, #FFFFFF, #FFFFFF | 3–3 colors | Note colors |
| `spring` | visualDuration 0.5, bounce 0.2 | visualDuration 0.5, bounce 0.2 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `title` | Wall of | Wall of | ≤ 24 chars | Title |
| `ctaLabel` | Add Testimonial | Add Testimonial | ≤ 24 chars | Button label |
| `autoplay` | true | true | boolean | Opens and closes the folder on a loop in the demo |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
