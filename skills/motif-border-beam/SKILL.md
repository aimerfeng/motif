---
name: motif-border-beam
description: "A gradient beam travels around a card’s border at a steady pace, bringing pricing cards, sign-in boxes and feature tiles to life. Use when the user asks for Border Beam, 边框光束, border, glow, card, beam, css offset-path or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/border-beam"
  motif-item: "border-beam"
  params-hash: "b4136256"
---

# Border Beam (边框光束)

A gradient beam travels around a card’s border at a steady pace, bringing pricing cards, sign-in boxes and feature tiles to life.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/border-beam.tsx` — the component (`BorderBeam`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-border-beam`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/border-beam/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { BorderBeam } from '@/components/motif/border-beam/border-beam'

<BorderBeam />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `size` | 160 | 160 | 20–400 px (best 60–240) | Beam length |
| `duration` | 7 | 7 | 1.5–20 s (best 4–12) | Loop duration |
| `colorFrom` | #ffaa40 | #ffaa40 | color | Head color |
| `colorTo` | #9c40ff | #9c40ff | color | Tail color |
| `borderWidth` | 2 | 2 | 0.5–6 px | Border width |
| `reverse` | false | false | boolean | Counter-clockwise |
| `initialOffset` | 0 | 0 | 0–100 % | Use it to stagger several beams |

## Rules

- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
