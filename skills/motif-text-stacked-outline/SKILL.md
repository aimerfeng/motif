---
name: motif-text-stacked-outline
description: "Heavy outlined letters you can drag: the faster they move, the longer the stack of filled echoes behind them, springing back into the word when you stop. For poster-like heroes, music and fashion sites. Use when the user asks for Stacked Outline Type, 叠影描边字, typography, outline, drag, velocity, stack, svg or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource/archivo-black, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-stacked-outline"
  motif-item: "text-stacked-outline"
  params-hash: "5dc9dcc1"
---

# Stacked Outline Type (叠影描边字)

Heavy outlined letters you can drag: the faster they move, the longer the stack of filled echoes behind them, springing back into the word when you stop. For poster-like heroes, music and fashion sites.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/stacked-outline-text.tsx` — the component (`StackedOutlineText`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-stacked-outline`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource/archivo-black clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-stacked-outline/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';` to the global stylesheet.
4. Use it:

```tsx
import { StackedOutlineText } from '@/components/motif/text-stacked-outline/stacked-outline-text'

<StackedOutlineText />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | LMNO | LMNO | ≤ 8 chars | Text |
| `fontSize` | 250 | 250 | 120–320 px (best 180–280) | Font size |
| `stacks` | 10 | 10 | 3–14 (best 6–12) | Stack layers |
| `trailDistance` | 132 | 132 | 40–220 px (best 80–180) | How far the stack spreads at top speed |
| `strokeWidth` | 7 | 7 | 3–12 px | Stroke width |
| `fill` | #000000 | #000000 | color | Fill |
| `stroke` | #ffffff | #ffffff | color | Stroke |
| `spring` | visualDuration 0.3, bounce 0 | visualDuration 0.3, bounce 0 | visualDuration 0.05–4 s, bounce 0–0.9 | Return spring |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
