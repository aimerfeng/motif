---
name: motif-slider-range-marks
description: "A port of the Base UI slider demos: single value or two-thumb range with tick marks and labels, step snapping, a value bubble that follows the thumb, and a vertical orientation. Thumbs swell while dragged. For price filters, volume and settings. Use when the user asks for Range Slider with Marks, 带刻度范围滑块, slider, range, marks, filter, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/slider-range-marks"
  motif-item: "slider-range-marks"
  params-hash: "a769756b"
---

# Range Slider with Marks (带刻度范围滑块)

A port of the Base UI slider demos: single value or two-thumb range with tick marks and labels, step snapping, a value bubble that follows the thumb, and a vertical orientation. Thumbs swell while dragged. For price filters, volume and settings.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/slider-range-marks.tsx` — the component (`SliderRangeMarks`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-slider-range-marks`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/slider-range-marks/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SliderRangeMarks } from '@/components/motif/slider-range-marks/slider-range-marks'

<SliderRangeMarks />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `mode` | range | range | range / single | Mode |
| `orientation` | horizontal | horizontal | horizontal / vertical | Orientation |
| `accent` | #fafafa | #fafafa | color | Fill color |
| `step` | 1 | 1 | 1–25 (best 1–10) | Step |
| `showMarks` | true | true | boolean | Show marks |
| `showBubble` | true | true | boolean | Value bubble |
| `thumbSize` | 16 | 16 | 12–24 px (best 14–20) | Thumb size |
| `trackHeight` | 4 | 4 | 2–8 px (best 3–6) | Track thickness |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from mui/base-ui).
