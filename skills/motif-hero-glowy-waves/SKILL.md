---
name: motif-hero-glowy-waves
description: "Five luminous lines ripple across a dark field and swell near the pointer, with a centered headline, buttons and a three-up stat strip on top. Plain Canvas 2D, no shader needed and light on the GPU. Use when the user asks for Glowy Waves Hero, 发光波浪首屏, hero, waves, canvas, glow, pointer, dark or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/hero-glowy-waves"
  motif-item: "hero-glowy-waves"
  params-hash: "31319f2a"
---

# Glowy Waves Hero (发光波浪首屏)

Five luminous lines ripple across a dark field and swell near the pointer, with a centered headline, buttons and a three-up stat strip on top. Plain Canvas 2D, no shader needed and light on the GPU.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/hero-glowy-waves.tsx` — the component (`HeroGlowyWaves`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-hero-glowy-waves`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/hero-glowy-waves/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { HeroGlowyWaves } from '@/components/motif/hero-glowy-waves/hero-glowy-waves'

<HeroGlowyWaves />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `headline` | Live visuals that keep up with your data | Live visuals that keep up with your data | ≤ 64 chars | Headline |
| `subline` | Drive installations, lobby screens and launch pages from one timeline. Sub-10ms response, no render farm. | Drive installations, lobby screens and launch pages from one timeline. Sub-10ms response, no render farm. | ≤ 140 chars | Subline |
| `cta` | Book a demo | Book a demo | ≤ 24 chars | Button label |
| `palette` | #7c5cff, #22d3ee, #f472b6 | #7c5cff, #22d3ee, #f472b6 | 2–5 colors | Waves take the colors in turn; the button uses the first |
| `font` | geist | geist | geist / grotesk / serif | Heading font |
| `radius` | 999 | 999 | 0–999 px (best 8–999) | Button radius |
| `layout` | behind | behind | behind / below | Wave position |
| `amplitude` | 1 | 1 | 0.4–1.6 x (best 0.6–1.4) | Amplitude |
| `speed` | 1 | 1 | 0.2–2.5 x (best 0.5–1.6) | Speed |
| `pointer` | 1 | 1 | 0–2 x (best 0.5–1.5) | Pointer influence |

## Rules

- The section is always dark: the waves use additive blending, which washes out on a light background.
- Use two to five palette colors that sit close on the wheel or share a temperature; three is the sweet spot.
- Keep the text block in the upper half and let the waves have the lower half, or put a dark radial scrim behind the headline as the demo does.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
