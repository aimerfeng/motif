---
name: motif-choice-cards
description: "Whole cards act as checkboxes or radios: a mark, a label with sublabel, a description and an indicator in the corner, laid out as a list, a grid or compact tiles (2 CPU / 4 CPU style) with sold-out tiles disabled. Made for add-ons, server configuration, payment methods and onboarding preferences. Use when the user asks for Selectable Option Cards, 可选卡片组, checkbox, radio, card, options, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/choice-cards"
  motif-item: "choice-cards"
  params-hash: "0dacf929"
---

# Selectable Option Cards (可选卡片组)

Whole cards act as checkboxes or radios: a mark, a label with sublabel, a description and an indicator in the corner, laid out as a list, a grid or compact tiles (2 CPU / 4 CPU style) with sold-out tiles disabled. Made for add-ons, server configuration, payment methods and onboarding preferences.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/choice-cards.tsx` — the component (`ChoiceCards`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-choice-cards`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/choice-cards/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ChoiceCards } from '@/components/motif/choice-cards/choice-cards'

<ChoiceCards />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `mode` | checkbox | checkbox | checkbox / radio | Mode |
| `layout` | list | list | list / grid / tiles | Layout |
| `columns` | 3 | 3 | 2–4 (best 2–3) | Columns for the grid and tiles layouts |
| `indicator` | corner | corner | corner / hidden | Indicator |
| `showIcon` | true | true | boolean | Show icon |
| `showDescription` | true | true | boolean | Show description |
| `density` | comfortable | comfortable | comfortable / compact | Density |
| `radius` | 6 | 6 | 0–16 px (best 4–12) | Radius |
| `accent` | #e4e4e7 | #e4e4e7 | color | Selected border and indicator; the check uses white or near-black by luminance |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
