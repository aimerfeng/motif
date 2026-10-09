---
name: motif-time-machine-stack
description: "A pile of panels recedes into depth; scroll, drag or press an arrow key to fly the front one past the camera, and travel back to see it drop in again. Made for version history, backup snapshots and revision timelines. Use when the user asks for Time Machine Stack, 时光机卡堆, stack, history, timeline, depth, 3d, carousel, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/time-machine-stack"
  motif-item: "time-machine-stack"
  params-hash: "d4fcfe42"
---

# Time Machine Stack (时光机卡堆)

A pile of panels recedes into depth; scroll, drag or press an arrow key to fly the front one past the camera, and travel back to see it drop in again. Made for version history, backup snapshots and revision timelines.

## When to use

- Use to browse an ordered history (snapshots, revisions, past orders) where recency matters and each entry is a self-contained panel. For comparing many items at once prefer a grid.

## Files

- `assets/time-machine-stack.tsx` — the component (`TimeMachineStack`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-time-machine-stack`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/time-machine-stack/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TimeMachineStack } from '@/components/motif/time-machine-stack/time-machine-stack'

<TimeMachineStack />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `height` | 340 | 340 | 280–460 px (best 300–420) | Stack height |
| `radius` | 18 | 18 | 6–32 px (best 10–26) | Panel radius |
| `visibleCount` | 5 | 5 | 3–6 | Visible layers |
| `offsetY` | 34 | 34 | 24–48 px (best 28–42) | How much each receding layer peeks out above |
| `depth` | 56 | 56 | 30–90 px (best 40–80) | Depth |
| `scaleStep` | 0.05 | 0.05 | 0.03–0.08 (best 0.035–0.07) | Scale step |
| `perspective` | 1400 | 1400 | 900–2200 px (best 1000–2000) | Smaller means a more dramatic perspective |
| `spring` | visualDuration 0.3, bounce 0.1 | visualDuration 0.3, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Travel spring |

## Rules

- Pass items as { id, content }; every panel gets the same width and the stack height, so design the content to fill its box (header, list, footer) and keep it under ~200px tall at the default height.
- Keyboard: ArrowUp/Down (or Left/Right), Home, End. The wheel is only captured while there is a next or previous panel, so the page can still scroll at both ends.
- Controlled: index + onIndexChange. Panels carry role="option"; keep a live caption such as "Snapshot 3 of 8" in the content for screen readers.
- Stagger at most ~50 ms per item and cap the total stagger around 400 ms.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
