---
name: motif-scroll-split-panels
description: "One wide picture splits into three panels as you scroll; the panels drift apart, flip to show copy on their backs and settle as three cards. For feature trios, service overviews and campaign pages. Use when the user asks for Split Panels, 一图裂三, scroll, flip, cards, 3d, split, sticky or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/scroll-split-panels"
  motif-item: "scroll-split-panels"
  params-hash: "9d3ee279"
---

# Split Panels (一图裂三)

One wide picture splits into three panels as you scroll; the panels drift apart, flip to show copy on their backs and settle as three cards. For feature trios, service overviews and campaign pages.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/scroll-split-panels.tsx` — the component (`ScrollSplitCards`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-scroll-split-panels`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/scroll-split-panels/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ScrollSplitCards } from '@/components/motif/scroll-split-panels/scroll-split-panels'

<ScrollSplitCards />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `panelGap` | 48 | 48 | 0–96 px (best 24–72) | Peak outward shift of the side panels |
| `flipStagger` | 0 | 0 | 0–0.15 | 0 flips all three together |
| `radius` | 16 | 16 | 0–32 px | Corner radius |
| `artwork` | strait | strait | strait / dunes / tide | Artwork |
| `backColors` | #ead9c4, #c4452d, #2c3033 | #ead9c4, #c4452d, #2c3033 | 3–3 colors | Text ink follows each color’s luminance |
| `titles` | Fort Point / The Span / Marin Head | Fort Point / The Span / Marin Head | ≤ 80 chars | Three titles separated by / |

## Rules

- The component is a 400vh scroll track with a sticky stage; pass the scrolling ancestor as `containerRef` when it lives inside an overflow-y-auto element.
- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
