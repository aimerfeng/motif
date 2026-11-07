---
name: motif-card-flip
description: "The front shows a softly pulsing light and a title; hover or click and the card turns over in 3D to reveal a description, a list that slides in item by item, and an action at the bottom. For courses, plans and feature cards that tease first and explain on demand. Use when the user asks for Card Flip, 翻转卡片, card, flip, 3d, hover, reveal, perspective or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/card-flip"
  motif-item: "card-flip"
  params-hash: "24ecac3f"
---

# Card Flip (翻转卡片)

The front shows a softly pulsing light and a title; hover or click and the card turns over in 3D to reveal a description, a list that slides in item by item, and an action at the bottom. For courses, plans and feature cards that tease first and explain on demand.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/card-flip.tsx` — the component (`CardFlip`); the tuned values are baked into its `defaults` object
- `assets/card-flip.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-card-flip`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/card-flip/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { CardFlip } from '@/components/motif/card-flip/card-flip'

<CardFlip />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `title` | Motion Fundamentals | Motion Fundamentals | ≤ 32 chars | Title |
| `subtitle` | A six-part course for product teams | A six-part course for product teams | ≤ 48 chars | Subtitle |
| `accent` | #ff9f1c | #ff9f1c | color | The light on the front, the icons and the list arrows |
| `radius` | 16 | 16 | 6–28 px (best 10–22) | Corner radius |
| `trigger` | hover | hover | hover / click | The flip buttons on both faces always work (keyboard, touch) |
| `axis` | y | y | y / x | Axis |
| `duration` | 0.6 | 0.6 | 0.3–1.2 s (best 0.45–0.9) | Flip duration |
| `easing` | 0.77, 0, 0.175, 1 | 0.77, 0, 0.175, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |

## Rules

- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).
