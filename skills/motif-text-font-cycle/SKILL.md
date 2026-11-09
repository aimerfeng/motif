---
name: motif-text-font-cycle
description: "Each letter of a heading flicks through pixel, mono, serif and display typefaces in a staggered cascade, a left-to-right wave or a random scramble, on its own or on hover. For design-tool brands, type foundries and playful heroes. Use when the user asks for Typeface Shuffle, 字体轮转, text, typography, font, pixel, heading, hover, cycle, type foundry or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/jetbrains-mono, @fontsource-variable/newsreader, @fontsource-variable/playfair-display, @fontsource-variable/syne, @fontsource/dm-serif-display, @fontsource/ibm-plex-mono, @fontsource/instrument-serif, @fontsource/press-start-2p, @fontsource/vt323, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-font-cycle"
  motif-item: "text-font-cycle"
  params-hash: "df1bbf77"
---

# Typeface Shuffle (字体轮转)

Each letter of a heading flicks through pixel, mono, serif and display typefaces in a staggered cascade, a left-to-right wave or a random scramble, on its own or on hover. For design-tool brands, type foundries and playful heroes.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-font-cycle.tsx` — the component (`PixelHeading`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-font-cycle`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/jetbrains-mono @fontsource-variable/newsreader @fontsource-variable/playfair-display @fontsource-variable/syne @fontsource/dm-serif-display @fontsource/ibm-plex-mono @fontsource/instrument-serif @fontsource/press-start-2p @fontsource/vt323 clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-font-cycle/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/vt323/400.css';`, `@import '@fontsource/press-start-2p/400.css';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';`, `@import '@fontsource-variable/playfair-display';`, `@import '@fontsource-variable/playfair-display/wght-italic.css';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { PixelHeading } from '@/components/motif/text-font-cycle/text-font-cycle'

<PixelHeading />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Pixel Fonts | Pixel Fonts | ≤ 24 chars | Text |
| `fontSet` | mixed | mixed | mixed / terminal / editorial | Font set |
| `mode` | multi | multi | uniform / multi / wave / random | Mode |
| `cycleInterval` | 150 | 150 | 60–600 ms (best 100–400) | Cycle interval |
| `staggerDelay` | 50 | 50 | 0–300 ms (best 20–200) | Stagger |
| `autoPlay` | true | true | boolean | When off, letters only cycle on hover or focus |
| `showLabel` | true | true | boolean | Show label |
| `size` | 96 | 96 | 40–160 px (best 56–128) | Size |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).
