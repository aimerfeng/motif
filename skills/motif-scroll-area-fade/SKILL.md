---
name: motif-scroll-area-fade
description: "Native scrolling with a slim custom scrollbar that appears on hover or scroll, and edges that fade only on the side where more content is hidden. Vertical, horizontal or both. For sidebars, chat lists, code panels and overflowing cards. Use when the user asks for Scroll Area with Fades, 渐隐滚动区域, scroll-area, scrollbar, fade, mask, overflow, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/scroll-area-fade"
  motif-item: "scroll-area-fade"
  params-hash: "2bf93b2a"
---

# Scroll Area with Fades (渐隐滚动区域)

Native scrolling with a slim custom scrollbar that appears on hover or scroll, and edges that fade only on the side where more content is hidden. Vertical, horizontal or both. For sidebars, chat lists, code panels and overflowing cards.

## When to use

- Lists, grids and panels whose items enter, reorder or expand.

## Files

- `assets/scroll-area-fade.tsx` — the component (`ScrollAreaFade`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-scroll-area-fade`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/scroll-area-fade/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ScrollAreaFade } from '@/components/motif/scroll-area-fade/scroll-area-fade'

<ScrollAreaFade />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `axis` | vertical | vertical | vertical / horizontal / both | Axis |
| `fadeSize` | 40 | 40 | 0–80 px (best 24–56) | Fade size |
| `thumbWidth` | 16 | 16 | 4–16 px (best 6–16) | Scrollbar width |
| `thumbColor` | #ffffff | #ffffff | color | Thumb color |
| `radius` | 0 | 0 | 0–16 px (best 0–12) | Corner radius |
| `autoHide` | true | true | boolean | Show only on hover or while scrolling |
| `trackVisible` | true | true | boolean | Show track |

## Rules

- Stagger at most ~50 ms per item and cap the total stagger around 400 ms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from mui/base-ui).
