---
name: motif-switchboard-card
description: "A card with an LED matrix on top: text lights up cell by cell in a 3×5 dot font, holds, then switches off in sequence while stray lamps twinkle around it. Made for live status, system-online notices or a feature card with some character. Use when the user asks for Switchboard Card, 点阵灯牌卡片, led, dot-matrix, canvas, card, status, lights, glow or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/switchboard-card"
  motif-item: "switchboard-card"
  params-hash: "4e6e338a"
---

# Switchboard Card (点阵灯牌卡片)

A card with an LED matrix on top: text lights up cell by cell in a 3×5 dot font, holds, then switches off in sequence while stray lamps twinkle around it. Made for live status, system-online notices or a feature card with some character.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/switchboard-card.tsx` — the component (`SwitchboardCard`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-switchboard-card`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/switchboard-card/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SwitchboardCard } from '@/components/motif/switchboard-card/switchboard-card'

<SwitchboardCard />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | LIVE | LIVE | ≤ 10 chars | Letters, digits and - ! . space |
| `color` | #ffb224 | #ffb224 | color | Lamp color |
| `shape` | round | round | round / square | Lamp shape |
| `cell` | 9 | 9 | 7–20 px (best 8–16) | Lamp pitch |
| `glow` | 1 | 1 | 0.3–1.6 (best 0.6–1.4) | Glow |
| `ambient` | 0.12 | 0.12 | 0–0.3 (best 0.04–0.22) | Share of the other lamps that twinkle |
| `speed` | 1 | 1 | 0.5–2 x (best 0.7–1.6) | Speed |

## Rules

- The panel is decorative (a canvas with role="img"); put the real status in the title and subtitle so it is readable without the animation.
- Keep the text to a few short, uppercase words; the dot font scales up in whole lamp steps until it fills the panel, long text stays at 1 lamp per dot.
- The card uses its own dark surface on purpose; place it on a dark or neutral page rather than restyling its colors.
- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
