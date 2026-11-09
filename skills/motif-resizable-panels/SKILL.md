---
name: motif-resizable-panels
description: "A split layout whose dividers carry a pill handle that grows on hover and stretches in the accent color while dragging. Panels keep a min size, collapse on double-click, nest horizontally and vertically and follow arrow keys. For editors, mail clients and IDE-like layouts. Use when the user asks for Resizable Panels, 可调整分栏, resizable, split pane, panels, layout, separator, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/resizable-panels"
  motif-item: "resizable-panels"
  params-hash: "8e244108"
---

# Resizable Panels (可调整分栏)

A split layout whose dividers carry a pill handle that grows on hover and stretches in the accent color while dragging. Panels keep a min size, collapse on double-click, nest horizontally and vertically and follow arrow keys. For editors, mail clients and IDE-like layouts.

## When to use

- Lists, grids and panels whose items enter, reorder or expand.

## Files

- `assets/resizable-panels.tsx` — the component (`ResizablePanelGroup`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-resizable-panels`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/resizable-panels/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ResizablePanelGroup } from '@/components/motif/resizable-panels/resizable-panels'

<ResizablePanelGroup />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `handleStyle` | pill | pill | pill / grow / stretch | Handle style |
| `layout` | nested | nested | nested / three / two | Demo layout |
| `accent` | #fafafa | #fafafa | color | Drag accent |
| `minSize` | 15 | 15 | 5–30 % (best 10–25) | Min size |
| `collapsible` | true | true | boolean | Double-click to collapse |
| `radius` | 16 | 16 | 0–28 px | Corner radius |
| `spring` | visualDuration 0.35, bounce 0.15 | visualDuration 0.35, bounce 0.15 | visualDuration 0.05–4 s, bounce 0–0.9 | Collapse spring |

## Rules

- Compose ResizablePanelGroup > ResizablePanel / ResizableHandle as direct children; nest a group inside a panel for the other axis (nested groups inherit the look).
- Give the group an explicit height; handles are role="separator" and resize with arrow keys (Home / End jump to min / max, Enter collapses when collapsible).
- Stagger at most ~50 ms per item and cap the total stagger around 400 ms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
