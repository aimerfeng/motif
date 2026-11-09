---
name: motif-slider-parameter-panel
description: "Rows of label, slider and numeric field kept in sync: type a value and press Enter and it clamps into range, a reset appears only on rows that differ from their default, and Reset puts them all back. Made for transform panels, model temperature and inspector sidebars. Use when the user asks for Parameter Slider Panel, 参数调节面板, slider, input, inspector, reset, parameters, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/slider-parameter-panel"
  motif-item: "slider-parameter-panel"
  params-hash: "b0b3fbb4"
---

# Parameter Slider Panel (参数调节面板)

Rows of label, slider and numeric field kept in sync: type a value and press Enter and it clamps into range, a reset appears only on rows that differ from their default, and Reset puts them all back. Made for transform panels, model temperature and inspector sidebars.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/slider-parameter-panel.tsx` — the component (`SliderParameterPanel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-slider-parameter-panel`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/slider-parameter-panel/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SliderParameterPanel } from '@/components/motif/slider-parameter-panel/slider-parameter-panel'

<SliderParameterPanel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `rows` | transform | transform | transform / model | Rows |
| `precision` | 0 | 0 | 0–2 | Decimal places shown and rounded to |
| `showReset` | true | true | boolean | Per-row reset |
| `accent` | #f4f4f5 | #f4f4f5 | color | Accent |
| `trackHeight` | 6 | 6 | 4–8 px | Track height |
| `labelStyle` | muted | muted | muted / strong | Label style |
| `inputWidth` | 48 | 48 | 40–72 px | Field width |
| `density` | comfortable | comfortable | comfortable / compact | Density |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
