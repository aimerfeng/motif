---
name: motif-kanban-board
description: "A task board with one column per status. Cards reorder within a column or move to another; the picked card lifts with a shadow and a slight tilt, the rest make room on a spring and the column counts follow. Space and the arrow keys move cards too. For task trackers and roadmaps. Use when the user asks for Kanban Board, 看板, kanban, board, drag and drop, tasks, roadmap, sortable or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/kanban-board"
  motif-item: "kanban-board"
  params-hash: "a99946b3"
---

# Kanban Board (看板)

A task board with one column per status. Cards reorder within a column or move to another; the picked card lifts with a shadow and a slight tilt, the rest make room on a spring and the column counts follow. Space and the arrow keys move cards too. For task trackers and roadmaps.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/kanban-board.tsx` — the component (`Kanban`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-kanban-board`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/kanban-board/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { Kanban } from '@/components/motif/kanban-board/kanban-board'

<Kanban />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Ring on the dragged card, the target column and focus |
| `density` | comfortable | comfortable | comfortable / compact | Density |
| `radius` | 8 | 8 | 0–16 px (best 4–12) | Corner radius |
| `showAvatars` | true | true | boolean | Owner avatars |
| `spring` | visualDuration 0.3, bounce 0.2 | visualDuration 0.3, bounce 0.2 | visualDuration 0.05–4 s, bounce 0–0.9 | Used when cards make room, lift and land |
| `tilt` | 2 | 2 | 0–6 deg (best 0–4) | Lift tilt |

## Rules

- The board is controlled: keep data in state and pass onDataChange; cards are reordered live while dragging, so onDragEnd only needs to persist. Give the board a fixed height (columns scroll on their own).
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
