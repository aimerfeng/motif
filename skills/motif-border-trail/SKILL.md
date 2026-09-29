---
name: motif-border-trail
description: "One or several comet trails with bright heads chase each other around the border of an input or card, with adjustable count, length and color. Great for prompt boxes, focus states and highlighted cards. Use when the user asks for Border Trail, 边框流光, border, trail, comet, glow, input, focus, css offset-path or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/border-trail"
  motif-item: "border-trail"
  params-hash: "ccb35dcb"
---

# Border Trail (边框流光)

One or several comet trails with bright heads chase each other around the border of an input or card, with adjustable count, length and color. Great for prompt boxes, focus states and highlighted cards.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/border-trail.tsx` — the component (`BorderTrail`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/border-trail/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { BorderTrail } from '@/components/motif/border-trail/border-trail'

<BorderTrail />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | #6366f1 | #6366f1 | color | Trail color |
| `headColor` | #c7d2fe | #c7d2fe | color | Head color |
| `size` | 120 | 120 | 20–400 px (best 60–240) | Trail length |
| `borderWidth` | 2 | 2 | 0.5–5 px (best 1–3) | Border width |
| `glow` | 0.6 | 0.6 | 0–1 | Soft light spilling past the border |
| `count` | 1 | 1 | 1–4 | Several trails are spaced evenly |
| `duration` | 6 | 6 | 1.5–20 s (best 3–12) | Loop duration |
| `reverse` | false | false | boolean | Counter-clockwise |

## Rules

- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
