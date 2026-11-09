---
name: motif-data-grid-columns
description: "Columns sort, resize from their edge, pin left or right with a shadow, reorder by dragging the header and hide from a columns menu; sticky header, optional striped rows and a totals footer. Made for admin lists and analytics tables. Use when the user asks for Configurable Data Grid, 可配置数据网格, table, data-grid, columns, resize, pin, reorder, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/data-grid-columns"
  motif-item: "data-grid-columns"
  params-hash: "6b8c0fd7"
---

# Configurable Data Grid (可配置数据网格)

Columns sort, resize from their edge, pin left or right with a shadow, reorder by dragging the header and hide from a columns menu; sticky header, optional striped rows and a totals footer. Made for admin lists and analytics tables.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/data-grid-columns.tsx` — the component (`DataGrid`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-data-grid-columns`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/data-grid-columns/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DataGrid } from '@/components/motif/data-grid-columns/data-grid-columns'

<DataGrid />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #3b82f6 | #3b82f6 | color | Resize line, checkboxes and focus rings |
| `density` | default | default | default / dense | Density |
| `striped` | false | false | boolean | Striped rows |
| `cellBorder` | false | false | boolean | Cell borders |
| `headerSticky` | true | true | boolean | Sticky header |
| `pinShadow` | true | true | boolean | Appears while content scrolls under a pinned column |
| `showFooter` | true | true | boolean | Totals footer |
| `radius` | 12 | 12 | 0–20 px (best 6–14) | Corner radius |

## Rules

- Build the table with useDataGridTable({ data, columns, initialState }) and compose DataGrid > DataGridScrollArea > DataGridTable; turn features on with tableLayout (columnsPinnable, columnsResizable, columnsMovable, columnsVisibility, columnsDraggable).
- Column defs follow the TanStack shape (id, header, cell, footer, accessorFn, size / minSize, enableSorting / enableHiding / enableResizing / enableColumnOrdering, meta.headerTitle). Give every column a meta.headerTitle so the columns menu reads well.
- Totals belong in each column def's footer, so they move, pin and hide with their column; avoid colSpan footers.
- Pinned cells are opaque (bg-background); put the grid on bg-background, not bg-card, or pinned columns will look patched.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
