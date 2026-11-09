---
name: motif-popover-onboarding-tour
description: "A small popover with an arrow walks through anchors on the page: title, text, a 2/4 counter and prev/next, hopping to the next target and flipping sides as needed. For feature tours, first-run hints and changelog highlights. Use when the user asks for Product Tour Tips, 产品导览提示, popover, tour, onboarding, walkthrough, steps, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/popover-onboarding-tour"
  motif-item: "popover-onboarding-tour"
  params-hash: "cb7bb57f"
---

# Product Tour Tips (产品导览提示)

A small popover with an arrow walks through anchors on the page: title, text, a 2/4 counter and prev/next, hopping to the next target and flipping sides as needed. For feature tours, first-run hints and changelog highlights.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/popover-onboarding-tour.tsx` — the component (`PopoverOnboardingTour`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-popover-onboarding-tour`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/popover-onboarding-tour/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PopoverOnboardingTour } from '@/components/motif/popover-onboarding-tour/popover-onboarding-tour'

<PopoverOnboardingTour />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `steps` | 4 | 4 | 2–4 | Steps |
| `showArrow` | true | true | boolean | Arrow |
| `showCounter` | true | true | boolean | Step counter |
| `navStyle` | text | text | text / arrows | Navigation |
| `highlightTarget` | true | true | boolean | Highlight target |
| `width` | 280 | 280 | 220–320 px (best 248–300) | Popover width |
| `radius` | 6 | 6 | 0–16 px (best 4–10) | Radius |
| `accent` | #a1a1aa | #a1a1aa | color | Ring around the current target |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
