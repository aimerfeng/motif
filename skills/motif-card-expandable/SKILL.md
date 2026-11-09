---
name: motif-card-expandable
description: "A compact card springs to a larger size in place, taller, wider or both, and its hidden sections stagger in as the frame settles. For meeting cards, product tiles and dashboard widgets that keep the detail tucked away until asked. Use when the user asks for Expandable Card, 展开卡片, card, expand, spring, stagger, blur, disclosure or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/card-expandable"
  motif-item: "card-expandable"
  params-hash: "5fc53f59"
---

# Expandable Card (展开卡片)

A compact card springs to a larger size in place, taller, wider or both, and its hidden sections stagger in as the frame settles. For meeting cards, product tiles and dashboard widgets that keep the detail tucked away until asked.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/card-expandable.tsx` — the component (`Expandable`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-card-expandable`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/card-expandable/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Expandable } from '@/components/motif/card-expandable/card-expandable'

<Expandable />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `collapsedWidth` | 320 | 320 | 280–380 px (best 300–360) | Collapsed width |
| `expandedWidth` | 420 | 420 | 360–540 px (best 400–500) | Never wider than its container on narrow screens |
| `direction` | both | both | both / vertical / horizontal | Direction |
| `trigger` | click | click | click / hover | Click and keyboard still work in hover mode |
| `expandDelay` | 200 | 200 | 0–1000 ms (best 100–400) | Hover trigger only |
| `collapseDelay` | 500 | 500 | 0–1500 ms (best 200–800) | Hover trigger only |
| `stagger` | 0.2 | 0.2 | 0–0.4 s (best 0.06–0.25) | Gap between sections fading in after the card opens |
| `spring` | visualDuration 0.37, bounce 0.29 | visualDuration 0.37, bounce 0.29 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Compose Expandable > ExpandableTrigger > ExpandableCard > ExpandableCardHeader / ExpandableCardContent / ExpandableCardFooter, and wrap whatever should appear only when open in ExpandableContent (preset, stagger, keepMounted).
- The card height follows its measured content; buttons inside the trigger should stop click propagation so they do not toggle the card.
- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).
