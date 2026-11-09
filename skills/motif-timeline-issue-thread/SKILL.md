---
name: motif-timeline-issue-thread
description: "An issue-style thread: avatar nodes on a rail, 'Hannah opened a new issue' headers and comment bubbles with timestamps, plus a compact log mode with action icons and relative times. Made for issue trackers, support tickets and audit trails. Use when the user asks for Discussion Thread Timeline, 讨论串时间线, timeline, thread, issue, comments, activity, log, audit or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/timeline-issue-thread"
  motif-item: "timeline-issue-thread"
  params-hash: "b7af6c6f"
---

# Discussion Thread Timeline (讨论串时间线)

An issue-style thread: avatar nodes on a rail, 'Hannah opened a new issue' headers and comment bubbles with timestamps, plus a compact log mode with action icons and relative times. Made for issue trackers, support tickets and audit trails.

## When to use

- Numbers, stats and small data displays that change over time.

## Files

- `assets/timeline-issue-thread.tsx` — the component (`IssueThread`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-timeline-issue-thread`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/timeline-issue-thread/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { IssueThread } from '@/components/motif/timeline-issue-thread/timeline-issue-thread'

<IssueThread />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `mode` | thread | thread | thread / log | Mode |
| `bubbleStyle` | outline | outline | outline / filled / plain | Bubble style |
| `avatarSize` | 24 | 24 | 20–36 px (best 22–32) | Avatar size |
| `railStyle` | solid | solid | solid / dashed | Rail style |
| `accent` | #a1a1aa | #a1a1aa | color | Rail and avatar ring of completed steps |
| `showTimestamps` | true | true | boolean | Show timestamps |
| `relativeTime` | true | true | boolean | Off shows the clock time |

## Rules

- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
