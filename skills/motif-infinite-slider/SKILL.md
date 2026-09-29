---
name: motif-infinite-slider
description: "Content loops end to end at a steady pace with faded edges and eases down on hover. For logo walls, tech-stack strips and testimonial tickers. Use when the user asks for Infinite Slider, 无限滚动条, marquee, ticker, logos, loop, infinite, carousel or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/infinite-slider"
  motif-item: "infinite-slider"
  params-hash: "14fb08dd"
---

# Infinite Slider (无限滚动条)

Content loops end to end at a steady pace with faded edges and eases down on hover. For logo walls, tech-stack strips and testimonial tickers.

## When to use

- Lists, grids and panels whose items enter, reorder or expand.

## Files

- `assets/infinite-slider.tsx` — the component (`InfiniteSlider`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/infinite-slider/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InfiniteSlider } from '@/components/motif/infinite-slider/infinite-slider'

<InfiniteSlider />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `speed` | 80 | 80 | 10–300 px (best 40–160) | Pixels travelled per second |
| `hoverSpeed` | 0.25 | 0.25 | 0–1 x | A multiple of the normal speed; 0 pauses on hover |
| `gap` | 32 | 32 | 0–96 px (best 16–56) | Gap |
| `direction` | horizontal | horizontal | horizontal / vertical | Direction |
| `reverse` | false | false | boolean | Reverse |
| `fade` | 96 | 96 | 0–240 px (best 48–160) | Width of the faded edges; 0 turns it off |

## Rules

- Stagger at most ~50 ms per item and cap the total stagger around 400 ms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
