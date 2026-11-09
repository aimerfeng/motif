---
name: motif-radio-color-swatches
description: "Round or square swatches where the chosen one gets an offset ring and a check that switches between light and dark for contrast; arrow keys move between swatches. Made for product variants, label colours and theme accents. Use when the user asks for Color Swatch Picker, 色板选择, color, swatch, radio, variant, picker, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/radio-color-swatches"
  motif-item: "radio-color-swatches"
  params-hash: "687ba2b8"
---

# Color Swatch Picker (色板选择)

Round or square swatches where the chosen one gets an offset ring and a check that switches between light and dark for contrast; arrow keys move between swatches. Made for product variants, label colours and theme accents.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/radio-color-swatches.tsx` — the component (`ColorSwatches`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-radio-color-swatches`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/radio-color-swatches/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ColorSwatches } from '@/components/motif/radio-color-swatches/radio-color-swatches'

<ColorSwatches />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `palette` | #3b82f6, #6366f1, #ec4899, #ef4444, #f97316, #f59e0b, #10b981 | #3b82f6, #6366f1, #ec4899, #ef4444, #f97316, #f59e0b, #10b981 | 2–10 colors | Palette |
| `shape` | circle | circle | circle / square | Shape |
| `showCheck` | true | true | boolean | Off shows the upstream dot instead |
| `size` | 24 | 24 | 18–44 px (best 20–36) | Size |
| `ringOffset` | 2 | 2 | 0–5 px | Ring offset |
| `gap` | 8 | 8 | 4–16 px | Gap |
| `layout` | row | row | row / grid | Layout |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
