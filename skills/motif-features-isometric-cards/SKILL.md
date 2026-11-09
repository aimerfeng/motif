---
name: motif-features-isometric-cards
description: "Three feature cards, each topped by a slowly moving isometric line drawing (breathing layers, floating node cubes, a rippling mesh) above a typewriter title and a word-by-word description. For infrastructure, API and developer-platform feature sections. Use when the user asks for Isometric Feature Cards, 等距线框特性卡, features, isometric, wireframe, canvas, infrastructure, developer, cards or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/features-isometric-cards"
  motif-item: "features-isometric-cards"
  params-hash: "9b6b915a"
---

# Isometric Feature Cards (等距线框特性卡)

Three feature cards, each topped by a slowly moving isometric line drawing (breathing layers, floating node cubes, a rippling mesh) above a typewriter title and a word-by-word description. For infrastructure, API and developer-platform feature sections.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/features-isometric-cards.tsx` — the component (`FeaturesIsometricCards`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-features-isometric-cards`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/features-isometric-cards/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/jetbrains-mono';` to the global stylesheet.
4. Use it:

```tsx
import { FeaturesIsometricCards } from '@/components/motif/features-isometric-cards/features-isometric-cards'

<FeaturesIsometricCards />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #34d399 | #34d399 | color | Accent |
| `speed` | 1 | 1 | 0.3–2 x (best 0.6–1.5) | Speed |
| `cardStyle` | gradient | gradient | gradient / plain | Card border |
| `background` | true | true | boolean | Background wave grid |
| `typewriter` | true | true | boolean | Typewriter titles |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).
