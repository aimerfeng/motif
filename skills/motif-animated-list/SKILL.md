---
name: motif-animated-list
description: "New entries spring in at the top while older ones slide down and the oldest fades out; hovering or focusing pauses the feed so it can be read. Replay a scripted set on a cadence or feed it live data. For order streams, notification centers and the \"happening now\" strip on a landing page. Use when the user asks for Animated List, 实时动态列表, list, feed, notifications, live, activity, stream, layout animation or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/animated-list"
  motif-item: "animated-list"
  params-hash: "1120805d"
---

# Animated List (实时动态列表)

New entries spring in at the top while older ones slide down and the oldest fades out; hovering or focusing pauses the feed so it can be read. Replay a scripted set on a cadence or feed it live data. For order streams, notification centers and the "happening now" strip on a landing page.

## When to use

- Use for a stream of small, self-contained events: orders, sign-ups, alerts, a "happening now" strip on a landing page. Long or interactive content belongs in a regular list or table.

## Files

- `assets/animated-list.tsx` — the component (`AnimatedList`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-animated-list`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/animated-list/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AnimatedList } from '@/components/motif/animated-list/animated-list'

<AnimatedList />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `interval` | 1.5 | 1.5 | 0.8–4 s (best 1.2–2.6) | Time between entries when replaying |
| `entrance` | pop | pop | pop / slide / blur | Entrance |
| `spring` | visualDuration 0.45, bounce 0.18 | visualDuration 0.45, bounce 0.18 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `maxItems` | 5 | 5 | 3–6 | Visible rows |
| `gap` | 10 | 10 | 4–20 px (best 6–14) | Gap |
| `radius` | 16 | 16 | 6–24 px (best 10–20) | Card radius |
| `fade` | true | true | boolean | Dim the oldest row |
| `pauseOnHover` | true | true | boolean | Pause on hover |
| `loop` | true | true | boolean | Start over from the first entry when the set runs out |

## Rules

- Replay mode (default): pass the entries in chronological order as keyed children; they are revealed one every interval seconds, newest on top. Use initialCount to start with a full list.
- Live mode: set live and pass the current feed newest first; every key that appears later springs in at the top and entries beyond maxItems leave at the bottom.
- Keep every row the same height (one-line title and detail, truncated) so the list does not jump; AnimatedListCard is a ready-made row.
- Do not remove pause-on-hover/focus: moving content must be pausable. A looping replay is silent to screen readers; live mode and one-shot replays announce new rows politely.
- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
