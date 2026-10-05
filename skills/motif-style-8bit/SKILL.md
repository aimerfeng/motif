---
name: motif-style-8bit
description: "Notched pixel outlines, Press Start 2P headings, stepped motion and a 16-color palette: every control is a block from an arcade menu. For games, indie dev sites and nostalgic event pages. Use when the user asks for 8-Bit Pixel, 8 位像素, 8-bit, pixel, arcade, retro game, press start 2p, tokens, design system or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/jetbrains-mono, @fontsource/ibm-plex-mono, @fontsource/press-start-2p, @fontsource/vt323, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-8bit"
  motif-item: "style-8bit"
  params-hash: "c013b002"
---

# 8-Bit Pixel (8 位像素)

Notched pixel outlines, Press Start 2P headings, stepped motion and a 16-color palette: every control is a block from an arcade menu. For games, indie dev sites and nostalgic event pages.

## When to use

- Use for games, indie-dev portfolios, hackathons, retro tech events and playful tools that can lean on arcade nostalgia.
- Avoid for long-form reading, dense data tables or serious financial and medical products.

## Files

- `assets/style-8bit.tsx` — the component (`EightBit`); the tuned values are baked into its `defaults` object
- `assets/style-8bit.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-8bit`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/jetbrains-mono @fontsource/ibm-plex-mono @fontsource/press-start-2p @fontsource/vt323 clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-8bit/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/press-start-2p/400.css';`, `@import '@fontsource/vt323/400.css';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource-variable/jetbrains-mono';` to the global stylesheet.
4. Use it:

```tsx
import { EightBit } from '@/components/motif/style-8bit/style-8bit'

<EightBit />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #ef7d57 | #ef7d57 | color | Buttons, selected tabs and highlights |
| `pixel` | 4 | 4 | 2–6 px (best 3–5) | Outline and notch thickness |
| `fontPairing` | press-vt | press-vt | press-vt / press-plex / vt-mono | Font pairing |
| `shadeDepth` | 4 | 4 | 0–8 px (best 2–6) | Bevel depth |
| `density` | 1 | 1 | 0.85–1.2 x (best 0.9–1.15) | Density |
| `mode` | night | night | night / day | Palette mode |

## Rules

- Palette: a 16-color sweetie-style palette. Night mode is about 60% deep navy ground (#1a1c2c) with 25% slightly lighter panels (#262b44), 10% one accent, 5% highlight colors (yellow, pink, lime, cyan). Day mode swaps to warm paper with navy ink. Outlines are always the ink color, never gray.
- Everything is built on a pixel unit (2-6px). Outlines are notched: four bars with the corner pixel left empty, never border-radius. Panels get a light top edge and a darker bottom edge one unit thick, and cards get a hard drop shadow two units offset. No blur, no gradients other than hard-stop patterns, no rounded corners.
- Typography: Press Start 2P (or VT323) uppercase for headings, buttons, labels and badges at small sizes (8-13px, line-height 1.5-1.6), never for paragraphs. Body copy uses VT323 (larger, ~22px) or a mono face. Disable font smoothing effects; keep letter-spacing default.
- Motion is stepped: transitions use steps(2-3) and last 80ms, presses move the box down by one pixel unit and remove the bottom shade. A block caret may blink with steps(1). Nothing eases, fades, springs or scales; reduced motion stops the blink.
- Icons and art are pixel sprites drawn on a grid (SVG rects with crispEdges), 5-8 cells wide, in palette colors. Do not use smooth vector icons, photos or emoji.
- Toggles read ON / OFF in the font, alerts use one-letter glyph blocks (i, !, OK). Focus is a dotted outline in yellow.
- Do not use drop shadows with blur, translucent glass, gradients, rounded corners, thin 1px lines, or more than five hues on one screen. Do not copy characters or sprites from real games.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from TheOrcDev/8bitcn-ui).
