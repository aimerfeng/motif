---
name: motif-table-bulk-select
description: "Row checkboxes with an indeterminate select-all; picking rows lifts a floating bar with the count, Bulk edit and Delete all, or a command bar with E and ⌘D keycaps. Made for admin lists of workspaces, members or invoices. Use when the user asks for Bulk Action Table, 批量操作表格, table, selection, bulk-actions, checkbox, toolbar, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/table-bulk-select"
  motif-item: "table-bulk-select"
  params-hash: "0a9680c7"
---

# Bulk Action Table (批量操作表格)

Row checkboxes with an indeterminate select-all; picking rows lifts a floating bar with the count, Bulk edit and Delete all, or a command bar with E and ⌘D keycaps. Made for admin lists of workspaces, members or invoices.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/table-bulk-select.tsx` — the component (`TableBulkSelect`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-table-bulk-select`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/table-bulk-select/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TableBulkSelect } from '@/components/motif/table-bulk-select/table-bulk-select'

<TableBulkSelect />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #3b82f6 | #3b82f6 | color | Accent |
| `barStyle` | command | command | command / card / header | Action bar |
| `density` | default | default | default / dense | Density |
| `zebra` | false | false | boolean | Zebra rows |
| `radius` | 6 | 6 | 0–12 px (best 4–8) | The command bar is always a pill |

## Rules

- Selection is by row index: pass selected + onSelectedChange to control it; onBulkEdit / onDelete receive the selected indices.
- Shortcuts (E, Cmd/Ctrl+D, Escape to clear) fire only while focus is inside the table, so they never hijack the page.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
