---
name: motif-glare-hover
description: "Hover and a diagonal glare sweeps across the card, like a light catching a laminated pass. Angle, size, color and speed are adjustable. Suits membership cards, tickets and product shots that should feel glossy. Use when the user asks for Glare Hover, 掠光卡片, card, glare, shine, hover, gloss, sweep or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/glare-hover"
  motif-item: "glare-hover"
  params-hash: "3b51b9bc"
---

# Glare Hover (掠光卡片)

Hover and a diagonal glare sweeps across the card, like a light catching a laminated pass. Angle, size, color and speed are adjustable. Suits membership cards, tickets and product shots that should feel glossy.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/glare-hover.tsx` — the component (`GlareHover`); the tuned values are baked into its `defaults` object
- `assets/glare-hover.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-glare-hover`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/glare-hover/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { GlareHover } from '@/components/motif/glare-hover/glare-hover'

<GlareHover />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | #ffffff | #ffffff | color | Glare color |
| `opacity` | 0.45 | 0.45 | 0.1–0.8 (best 0.25–0.6) | Glare strength |
| `angle` | -45 | -45 | -90–90 deg (best -60–-30) | Angle |
| `size` | 250 | 250 | 150–400 % (best 200–320) | Larger tiles give a wider band that travels more slowly |
| `radius` | 18 | 18 | 0–32 px (best 8–24) | Corner radius |
| `duration` | 800 | 800 | 300–1500 ms (best 450–900) | Sweep time |
| `playOnce` | true | true | boolean | When off, the glare sweeps back as the pointer leaves |

## Rules

- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
