---
name: motif-slider-price-histogram
description: "A port of the Origin UI price slider: a two-thumb range sitting on a histogram of the data. Bars inside the range light up, min and max fields stay in sync both ways, and the button counts matching items. For price, size and date filters in shops and listings. Use when the user asks for Histogram Range Slider, 直方图价格区间滑块, slider, range, histogram, filter, price, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/slider-price-histogram"
  motif-item: "slider-price-histogram"
  params-hash: "11b8a1bb"
---

# Histogram Range Slider (直方图价格区间滑块)

A port of the Origin UI price slider: a two-thumb range sitting on a histogram of the data. Bars inside the range light up, min and max fields stay in sync both ways, and the button counts matching items. For price, size and date filters in shops and listings.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/slider-price-histogram.tsx` — the component (`SliderPriceHistogram`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-slider-price-histogram`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/slider-price-histogram/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SliderPriceHistogram } from '@/components/motif/slider-price-histogram/slider-price-histogram'

<SliderPriceHistogram />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `bins` | 40 | 40 | 12–60 (best 24–48) | Bins |
| `distribution` | listing | listing | listing / bell / skewed / even | Ignored when you pass items |
| `height` | 48 | 48 | 32–96 px (best 40–72) | Histogram height |
| `barGap` | 0 | 0 | 0–4 px (best 0–2) | Bar gap |
| `barRadius` | 0 | 0 | 0–4 px (best 0–2) | Bar radius |
| `inactiveOpacity` | 0.2 | 0.2 | 0.08–0.5 (best 0.12–0.35) | Outside-range opacity |
| `accent` | #fafafa | #fafafa | color | Accent |
| `showInputs` | true | true | boolean | Min / max fields |
| `currency` | $ | $ | ≤ 3 chars | Currency symbol |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
