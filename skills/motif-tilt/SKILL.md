---
name: motif-tilt
description: "A card leans toward the pointer in 3D with a soft glare that follows it, and inner elements can float above the surface. Suits album covers, tickets, product and feature cards. Use when the user asks for Tilt, 3D 倾斜, tilt, 3d, perspective, card, glare, hover, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/tilt"
  motif-item: "tilt"
  params-hash: "805f653d"
---

# Tilt (3D 倾斜)

A card leans toward the pointer in 3D with a soft glare that follows it, and inner elements can float above the surface. Suits album covers, tickets, product and feature cards.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/tilt.tsx` — the component (`Tilt`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-tilt`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/tilt/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Tilt } from '@/components/motif/tilt/tilt'

<Tilt />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `rotationFactor` | 14 | 14 | 2–30 deg (best 6–20) | Tilt when the pointer reaches the edge |
| `perspective` | 1000 | 1000 | 400–2400 px (best 700–1600) | Smaller values exaggerate the depth |
| `reverse` | false | false | boolean | Tilt away from the pointer instead of toward it |
| `glare` | 0.22 | 0.22 | 0–0.6 (best 0.1–0.35) | Glare |
| `spring` | visualDuration 0.5, bounce 0.2 | visualDuration 0.5, bounce 0.2 | visualDuration 0.05–4 s, bounce 0–0.9 | Shorter feels more responsive |

## Rules

- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
