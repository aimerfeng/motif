---
name: motif-swipe-deck
description: "A stack of cards where the top one follows your drag, tilts with distance, shows a like / nope stamp and flies off past a threshold to reveal the next. Buttons and arrow keys do the same, and an empty state appears at the end. For matching, triage and quick review flows. Use when the user asks for Swipe Card Deck, 滑动卡片堆, deck, swipe, cards, drag, tinder, stack, triage or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/swipe-deck"
  motif-item: "swipe-deck"
  params-hash: "01748919"
---

# Swipe Card Deck (滑动卡片堆)

A stack of cards where the top one follows your drag, tilts with distance, shows a like / nope stamp and flies off past a threshold to reveal the next. Buttons and arrow keys do the same, and an empty state appears at the end. For matching, triage and quick review flows.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/swipe-deck.tsx` — the component (`SwipeDeck`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-swipe-deck`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/swipe-deck/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SwipeDeck } from '@/components/motif/swipe-deck/swipe-deck'

<SwipeDeck />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `threshold` | 150 | 150 | 60–180 px (best 100–170) | Release past this distance to send the card away |
| `maxRotate` | 25 | 25 | 0–35 deg (best 10–30) | Max tilt |
| `stackDepth` | 3 | 3 | 1–5 (best 2–4) | Stack depth |
| `radius` | 16 | 16 | 0–32 px (best 8–24) | Corner radius |
| `showStamps` | true | true | boolean | Show stamps |
| `spring` | visualDuration 0.3, bounce 0 | visualDuration 0.3, bounce 0 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `cardAspect` | 3 / 4 | 3 / 4 | 3 / 4 / 4 / 5 / 2 / 3 / 1 / 1 | Card aspect |

## Rules

- Always pair the drag gesture with the built-in Like / Nope buttons or arrow keys; never make swiping the only way to decide.
- Give each card a stable key; pass index + onIndexChange to control the deck (e.g. to undo or start over).
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
