---
name: motif-scroll-progress
description: "A thin bar on the top edge that grows with scroll position through a spring, solid or with a fading tail. For articles, docs and long landing pages. Use when the user asks for Scroll Progress, 阅读进度, scroll, progress, reading, spring, indicator or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/scroll-progress"
  motif-item: "scroll-progress"
  params-hash: "9c115482"
---

# Scroll Progress (阅读进度)

A thin bar on the top edge that grows with scroll position through a spring, solid or with a fading tail. For articles, docs and long landing pages.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/scroll-progress.tsx` — the component (`ScrollProgress`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-scroll-progress`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/scroll-progress/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ScrollProgress } from '@/components/motif/scroll-progress/scroll-progress'

<ScrollProgress />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | #0090ff | #0090ff | color | Bar color |
| `variant` | solid | solid | solid / fade | Style |
| `thickness` | 4 | 4 | 1–8 px (best 2–6) | Thickness |
| `stiffness` | 200 | 200 | 50–500 | Stiffness |
| `damping` | 50 | 50 | 10–100 | Damping |

## Rules

- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
