---
name: motif-condensation
description: "A clear pane fogged with condensation: beads grow, merge, run down the glass and burst into small splash rings at the bottom edge. Layer it over product shots or use it as a calm backdrop for beverage, weather and wellness brands. Use when the user asks for Condensation, 玻璃凝露, condensation, drops, water, glass, rain, bubbles, canvas, background, transparent or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/condensation"
  motif-item: "condensation"
  params-hash: "3af377bd"
---

# Condensation (玻璃凝露)

A clear pane fogged with condensation: beads grow, merge, run down the glass and burst into small splash rings at the bottom edge. Layer it over product shots or use it as a calm backdrop for beverage, weather and wellness brands.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/condensation.tsx` — the component (`Condensation`); the tuned values are baked into its `defaults` object
- `assets/condensation-renderer.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-condensation`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/condensation/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Condensation } from '@/components/motif/condensation/condensation'

<Condensation />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `speed` | 1 | 1 | 0.2–2.5 x (best 0.5–1.8) | Speed |
| `gravity` | 0.075 | 0.075 | 0.02–0.2 | How fast running drops accelerate |
| `dropAmount` | 1 | 1 | 0.3–2 x | Drop amount |
| `maxRadius` | 4.4 | 4.4 | 3–8 px | How large a bead grows before it runs |
| `bubbleTint` | #608bc4 | #608bc4 | color | Bubble tint |
| `opacity` | 1 | 1 | 0.3–1 | Opacity |
| `splashRings` | true | true | boolean | Splash rings |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).
