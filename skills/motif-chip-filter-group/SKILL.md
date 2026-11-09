---
name: motif-chip-filter-group
description: "Badges that act: selectable chips slide a check in when chosen, removable chips collapse away on ×, plus status-dot and count chips, laid out as a wrapping filter bar with clear-all. Made for list filters, search refinements and tag displays. Use when the user asks for Filter Chips, 筛选标签组, badge, chip, filter, tag, checkbox, removable, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/chip-filter-group"
  motif-item: "chip-filter-group"
  params-hash: "e8f35317"
---

# Filter Chips (筛选标签组)

Badges that act: selectable chips slide a check in when chosen, removable chips collapse away on ×, plus status-dot and count chips, laid out as a wrapping filter bar with clear-all. Made for list filters, search refinements and tag displays.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/chip-filter-group.tsx` — the component (`ChipFilterGroup`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-chip-filter-group`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/chip-filter-group/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ChipFilterGroup } from '@/components/motif/chip-filter-group/chip-filter-group'

<ChipFilterGroup />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `chipType` | selectable | selectable | selectable / removable / status / count | Chip type |
| `variant` | default | default | default / outline / secondary | Variant |
| `shape` | pill | pill | pill / rounded | Shape |
| `size` | sm | sm | sm / md | Size |
| `accent` | #10b981 | #10b981 | color | Fill of solid chips, check color of outline chips |
| `showCheck` | true | true | boolean | Show check |
| `showClearAll` | true | true | boolean | Clear all |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
