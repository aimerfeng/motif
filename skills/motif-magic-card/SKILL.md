---
name: motif-magic-card
description: "A spotlight follows the pointer across the card while the border lights up beneath it; switch to a soft blurred orb if you prefer. Made for feature tiles, pricing cards and dashboard panels. Use when the user asks for Magic Card, 魔法卡片, card, spotlight, hover, glow, border, pointer or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/magic-card"
  motif-item: "magic-card"
  params-hash: "374ad8e2"
---

# Magic Card (魔法卡片)

A spotlight follows the pointer across the card while the border lights up beneath it; switch to a soft blurred orb if you prefer. Made for feature tiles, pricing cards and dashboard panels.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/magic-card.tsx` — the component (`MagicCard`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-magic-card`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/magic-card/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MagicCard } from '@/components/motif/magic-card/magic-card'

<MagicCard />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `mode` | gradient | gradient | gradient / orb | Light style |
| `gradientSize` | 260 | 260 | 100–600 px (best 160–400) | Also the spotlight radius in spotlight mode |
| `gradientColor` | #3b3577 | #3b3577 | color | Spotlight color |
| `gradientOpacity` | 0.9 | 0.9 | 0.1–1 (best 0.4–1) | Light intensity |
| `gradientFrom` | #9e7aff | #9e7aff | color | Border light center |
| `gradientTo` | #fe8bbb | #fe8bbb | color | Border light edge |
| `glowFrom` | #ee4f27 | #ee4f27 | color | Orb from |
| `glowTo` | #6b21ef | #6b21ef | color | Orb to |
| `glowSize` | 360 | 360 | 120–700 px (best 220–520) | Orb size |
| `glowBlur` | 60 | 60 | 10–140 px (best 30–100) | Orb blur |

## Rules

- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
