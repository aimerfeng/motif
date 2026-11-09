---
name: motif-hero-fanned-cards
description: "A shop hero where three product cards spring in from the sides and fan out below the headline; hovering a card lifts it to the front with a springy scale. For DTC brands, collections and creator stores. Use when the user asks for Fanned Card Hero, 扇形卡片首屏, hero, shop, product, cards, fan, spring or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/hero-fanned-cards"
  motif-item: "hero-fanned-cards"
  params-hash: "9cd2c5ad"
---

# Fanned Card Hero (扇形卡片首屏)

A shop hero where three product cards spring in from the sides and fan out below the headline; hovering a card lifts it to the front with a springy scale. For DTC brands, collections and creator stores.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/hero-fanned-cards.tsx` — the component (`HeroFannedCards`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-hero-fanned-cards`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/hero-fanned-cards/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { HeroFannedCards } from '@/components/motif/hero-fanned-cards/hero-fanned-cards'

<HeroFannedCards />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `angle` | 6 | 6 | 0–14 deg (best 3–10) | Fan angle |
| `offset` | 30 | 30 | 0–60 px (best 16–44) | Side offset |
| `cardWidth` | 192 | 192 | 160–240 px | Card width |
| `spring` | visualDuration 0.5, bounce 0.25 | visualDuration 0.5, bounce 0.25 | visualDuration 0.05–4 s, bounce 0–0.9 | Entrance spring |
| `palette` | #7dd3fc, #d6a77a, #f472b6 | #7dd3fc, #d6a77a, #f472b6 | 3–3 colors | Product colors |
| `headline` | Pots of Joy: Ceramic Chic! | Pots of Joy: Ceramic Chic! | ≤ 48 chars | Headline |
| `ctaLabel` | Ready to clay | Ready to clay | ≤ 24 chars | Button label |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).
