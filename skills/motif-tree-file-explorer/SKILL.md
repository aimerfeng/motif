---
name: motif-tree-file-explorer
description: "A keyboard-navigable file tree with file-type icons, optional indent guides, a caret on either side, drag-and-drop reordering with a drop line, F2 inline rename, expand/collapse all, and a filter box that highlights matches and keeps their ancestors open. Made for code editors, docs CMSs and asset libraries. Use when the user asks for File Tree Explorer, 文件树浏览器, tree, file-tree, explorer, drag-and-drop, rename, filter, keyboard, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/tree-file-explorer"
  motif-item: "tree-file-explorer"
  params-hash: "f05a3b63"
---

# File Tree Explorer (文件树浏览器)

A keyboard-navigable file tree with file-type icons, optional indent guides, a caret on either side, drag-and-drop reordering with a drop line, F2 inline rename, expand/collapse all, and a filter box that highlights matches and keeps their ancestors open. Made for code editors, docs CMSs and asset libraries.

## When to use

- Numbers, stats and small data displays that change over time.

## Files

- `assets/tree-file-explorer.tsx` — the component (`FileTree`); the tuned values are baked into its `defaults` object
- `assets/tree.tsx`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-tree-file-explorer`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/tree-file-explorer/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { FileTree } from '@/components/motif/tree-file-explorer/tree-file-explorer'

<FileTree />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `indent` | 20 | 20 | 14–28 px (best 16–24) | Indent |
| `density` | compact | compact | compact / comfortable | Density |
| `caretSide` | start | start | start / end | Caret side |
| `guides` | true | true | boolean | Indent guides |
| `iconStyle` | filetype | filetype | filetype / folders / none | Icons |
| `accent` | #60a5fa | #60a5fa | color | Filter highlight and drop line |
| `dragReorder` | true | true | boolean | Keyboard: Alt + ↑ / ↓ |
| `rename` | true | true | boolean | F2 rename |
| `showFilter` | true | true | boolean | Filter box plus expand / collapse all |

## Rules

- Items are a flat map keyed by id; a folder is any item with a children array (even an empty one). Pass items + onItemsChange to keep the data in your own state after drags and renames.
- The tree lives on the page background: labels mask the indent guides with bg-background, so put it on bg-background (or override that class) rather than on a card color.
- Drag reordering uses pointer events and does not start on touch scrolling; Alt + Arrow Up / Down moves the focused item for keyboard users.
- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
