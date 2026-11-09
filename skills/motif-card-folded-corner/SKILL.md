---
name: motif-card-folded-corner
description: "Feature cards with a dog-eared top-right corner and a short accent rail beside the title; on hover the fold lifts and its shadow deepens like paper. For feature lists and resource links. Use when the user asks for Folded Corner Cards, 折角卡片, card, fold, paper, hover, features, sticker or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/card-folded-corner"
  motif-item: "card-folded-corner"
  params-hash: "4b220dcb"
---

# Folded Corner Cards (折角卡片)

Feature cards with a dog-eared top-right corner and a short accent rail beside the title; on hover the fold lifts and its shadow deepens like paper. For feature lists and resource links.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/card-folded-corner.tsx` — the component (`FoldedCornerCards`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-card-folded-corner`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/card-folded-corner/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { FoldedCornerCards } from '@/components/motif/card-folded-corner/card-folded-corner'

<FoldedCornerCards />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `foldSize` | 30 | 30 | 20–44 px (best 24–38) | Fold size |
| `lift` | 1.67 | 1.67 | 1.2–2 (best 1.4–1.8) | How much the fold grows on hover |
| `shadow` | 0.05 | 0.05 | 0–0.3 (best 0.04–0.18) | Lift shadow |
| `accent` | #3b82f6 | #3b82f6 | color | Accent |
| `radius` | 8 | 8 | 0–20 px (best 4–14) | Corner radius |
| `tone` | light | light | light / dark | Tone |
| `columns` | 3 | 3 | 1–3 | Always one column in narrow containers |

## Rules

- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
