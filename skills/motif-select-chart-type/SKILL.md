---
name: motif-select-chart-type
description: "A select for picking a visualization: each option has a small icon, unavailable ones are dimmed, and hovering or arrowing through shows a side card with a chart thumbnail and a one-line description. For report builders and dashboard editors. Use when the user asks for Chart Type Picker, 图表类型选择器, select, listbox, chart, preview, dashboard, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/select-chart-type"
  motif-item: "select-chart-type"
  params-hash: "4c39e90f"
---

# Chart Type Picker (图表类型选择器)

A select for picking a visualization: each option has a small icon, unavailable ones are dimmed, and hovering or arrowing through shows a side card with a chart thumbnail and a one-line description. For report builders and dashboard editors.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/select-chart-type.tsx` — the component (`SelectChartType`); the tuned values are baked into its `defaults` object
- `assets/thumbnails.tsx`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-select-chart-type`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/select-chart-type/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SelectChartType } from '@/components/motif/select-chart-type/select-chart-type'

<SelectChartType />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #3b82f6 | #3b82f6 | color | Accent |
| `thumbStyle` | gradient | gradient | gradient / flat | Thumbnail fill |
| `previewSide` | left | left | left / right | On narrow screens the card sits below the list |
| `width` | 192 | 192 | 160–280 px (best 176–240) | Width |
| `radius` | 6 | 6 | 0–14 px (best 4–10) | Corner radius |
| `showDisabled` | true | true | boolean | Show unavailable |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
