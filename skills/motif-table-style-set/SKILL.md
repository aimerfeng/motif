---
name: motif-table-style-set
description: "One table in the common looks: plain, avatars, no dividers, striped, vertical rules, card, row selection, sticky header and a vertical key–value layout, with an optional totals footer. Made for anywhere a static table should look intentional. Use when the user asks for Table Styles, 表格样式合集, table, data, striped, sticky-header, selection, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/table-style-set"
  motif-item: "table-style-set"
  params-hash: "80e734b0"
---

# Table Styles (表格样式合集)

One table in the common looks: plain, avatars, no dividers, striped, vertical rules, card, row selection, sticky header and a vertical key–value layout, with an optional totals footer. Made for anywhere a static table should look intentional.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/table-style-set.tsx` — the component (`TableStyles`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-table-style-set`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/table-style-set/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TableStyles } from '@/components/motif/table-style-set/table-style-set'

<TableStyles />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | card | card | basic / avatars / borderless / striped / vertical-lines / card / selection / sticky / key-value | Variant |
| `density` | default | default | default / dense | Density |
| `showFooter` | true | true | boolean | Totals footer |
| `radius` | 6 | 6 | 0–16 px (best 4–12) | Corner radius |
| `zebraOpacity` | 50 | 50 | 20–100 % | Striped variant only |
| `maxHeight` | 240 | 240 | 160–480 px | Sticky header variant only |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
