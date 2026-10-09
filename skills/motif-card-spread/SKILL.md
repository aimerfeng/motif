---
name: motif-card-spread
description: "Four paper-like cards sit in a loose stack, then fan out into a row with a springy throw and gather back on the next click. On narrow screens the row overlaps instead of overflowing. Made for notes, to-dos, agendas and mood boards. Use when the user asks for Card Spread, 卡片扇开, card, stack, deck, spread, fan, spring, notes or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/card-spread"
  motif-item: "card-spread"
  params-hash: "231135fa"
---

# Card Spread (卡片扇开)

Four paper-like cards sit in a loose stack, then fan out into a row with a springy throw and gather back on the next click. On narrow screens the row overlaps instead of overflowing. Made for notes, to-dos, agendas and mood boards.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/card-spread.tsx` — the component (`CardSpread`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-card-spread`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/card-spread/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { CardSpread } from '@/components/motif/card-spread/card-spread'

<CardSpread />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `tints` | #fff0b3, #cfeedb, #ffd8c4, #d6e6ff | #fff0b3, #cfeedb, #ffd8c4, #d6e6ff | 1–6 colors | Applied to the cards in order; keep them light for readable text |
| `cardWidth` | 200 | 200 | 150–260 px (best 170–230) | Card width |
| `gap` | 16 | 16 | 4–40 px (best 8–28) | Spread gap |
| `radius` | 18 | 18 | 4–32 px (best 8–26) | Corner radius |
| `tilt` | 3 | 3 | 0–8 deg (best 1–6) | Rotation of each card when spread; half of it when stacked |
| `lift` | 14 | 14 | 0–30 px (best 6–22) | Hover lift |
| `spring` | visualDuration 0.5, bounce 0.28 | visualDuration 0.5, bounce 0.28 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Pass each card as a child; the component draws the tinted paper, radius and shadow, so child content should be transparent and use dark text.
- The toggle button is part of the component for keyboard access. For external control pass open + onOpenChange, or set showToggle={false}.
- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).
