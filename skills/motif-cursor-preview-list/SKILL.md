---
name: motif-cursor-preview-list
description: "Hovering the rows of a project or article list summons a preview card that trails the pointer on a spring, swaps its content between rows and tilts slightly with movement. For agency work indexes, blog archives and case-study lists. Use when the user asks for Hover Preview List, 悬停预览列表, cursor, preview, hover, list, spring, portfolio or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/cursor-preview-list"
  motif-item: "cursor-preview-list"
  params-hash: "2de9401a"
---

# Hover Preview List (悬停预览列表)

Hovering the rows of a project or article list summons a preview card that trails the pointer on a spring, swaps its content between rows and tilts slightly with movement. For agency work indexes, blog archives and case-study lists.

## When to use

- Playful or editorial pages where the pointer is part of the experience.

## Files

- `assets/cursor-preview-list.tsx` — the component (`Cursor`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-cursor-preview-list`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/cursor-preview-list/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Cursor } from '@/components/motif/cursor-preview-list/cursor-preview-list'

<Cursor />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `previewWidth` | 160 | 160 | 110–240 px (best 140–210) | Preview width |
| `aspect` | 1 | 1 | 0.7–1.6 (best 0.8–1.4) | Width ÷ height; 1 is square |
| `follow` | visualDuration 0.5, bounce 0.01 | visualDuration 0.5, bounce 0.01 | visualDuration 0.05–4 s, bounce 0–0.9 | Longer trails further behind |
| `pop` | visualDuration 0.3, bounce 0.1 | visualDuration 0.3, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | How it opens and closes at the list edges |
| `enterScale` | 0.3 | 0.3 | 0–0.9 (best 0.2–0.7) | Enter scale |
| `tilt` | 6 | 6 | 0–14 deg (best 0–10) | Max lean while moving sideways; 0 turns it off |
| `offsetX` | 0 | 0 | -120–120 px | Offset X |
| `offsetY` | 0 | 0 | -120–120 px | Offset Y |

## Rules

- Never hide the system cursor on touch devices or in forms.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
