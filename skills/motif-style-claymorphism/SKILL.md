---
name: motif-style-claymorphism
description: "Interfaces that look pressed from clay: four stacked shadows inflate cards and buttons, inputs and tab tracks sink in, and pressing a button flips it from raised to dented. Stone neutrals plus one bright colour, for friendly finance, kids, health and education products. Use when the user asks for Claymorphism, 黏土拟态, claymorphism, clay, 3d, soft ui, puffy, friendly or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist-mono, @fontsource-variable/manrope, @fontsource-variable/outfit, @fontsource-variable/plus-jakarta-sans, @fontsource-variable/syne, @fontsource/dm-serif-display, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-claymorphism"
  motif-item: "style-claymorphism"
  params-hash: "96ee84ae"
---

# Claymorphism (黏土拟态)

Interfaces that look pressed from clay: four stacked shadows inflate cards and buttons, inputs and tab tracks sink in, and pressing a button flips it from raised to dented. Stone neutrals plus one bright colour, for friendly finance, kids, health and education products.

## When to use

- Use for approachable consumer products: family finance, kids and education, health and habit apps, playful onboarding, indie tools that want a tactile, toy-like feel.
- Avoid for dense data tables, long forms and anything that needs high information density; inflated surfaces waste space.

## Files

- `assets/style-claymorphism.tsx` — the component (`StyleClaymorphism`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-claymorphism`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist-mono @fontsource-variable/manrope @fontsource-variable/outfit @fontsource-variable/plus-jakarta-sans @fontsource-variable/syne @fontsource/dm-serif-display clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-claymorphism/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/outfit';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';`, `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { StyleClaymorphism } from '@/components/motif/style-claymorphism/style-claymorphism'

<StyleClaymorphism />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `radius` | 22 | 22 | 12–36 px (best 16–30) | Radius |
| `borderWidth` | 1 | 1 | 0–3 px (best 0.5–2) | The translucent white line along a surface edge |
| `puff` | 0.85 | 0.85 | 0.3–1.4 (best 0.5–1.15) | Scales the offset and blur of every inner and outer shadow |
| `fontPairing` | jakarta | jakarta | jakarta / outfit / syne / dmserif | Font pairing |
| `dark` | false | false | boolean | Dark |

## Rules

- Base tokens come from the tweakcn claymorphism preset: warm stone neutrals (background #e7e5e4, card #f5f5f4, border #d6d3d1, foreground #1e293b; dark: #1e1b18, #2c2825, #3a3633, #e2e8f0), indigo primary, radius 1.25rem. Keep the neutrals; only the accent may change.
- A raised surface is always four shadows: inner top-left highlight (white), inner bottom-right shade (grey at 16%), a soft outer drop toward the bottom-right in the preset shadow colour (hsl(240 4% 60%) at 50%), and a faint white reflection toward the top-left. Never use just one drop shadow, and never a black shadow in light mode.
- A sunken surface (input, tab track, progress track, switch track) inverts the two inner shadows and has no outer shadow. Raised means clickable or important; sunken means editable or containing.
- Buttons rise on hover (translateY -2px) and dent on press (inner shadows inverted, 1px down, scale .985). The primary button is the accent colour with white 40% and black 22% inner shadows and a coloured drop shadow.
- Radius is large and consistent: cards 22px, controls 75% of that, chips and switches fully round. Corner radius must never drop below 12px.
- Colour ratio: 90% stone neutrals, 8% accent, 2% semantic. Decorative clay balls (radial gradient from a lighter highlight at 32% 26%, inner shadows) may use pink, yellow and mint at high saturation, but only as decoration.
- Type: a heavy rounded sans; headings 800 weight, -0.035em tracking, body 500 to 600 weight so it stays legible on raised surfaces. Numbers may use a mono.
- Puffiness is one number: it scales all offsets and blurs together. Keep it between 0.5 and 1.15; above that surfaces look melted.
- Motion is springy and tactile (180 to 340ms with overshoot), used for press, tab thumbs and switch beads. No parallax or long loops. Respect prefers-reduced-motion.
- Text on the accent uses white or the dark stone, chosen by contrast. Muted text is #6b7280 in light mode and never lighter.
- Forbidden: flat surfaces with a single border, hard-edged shadows, gradients across whole cards, neon colours, pure white or pure black surfaces.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: Apache-2.0. Keep the header comments in each file (originally from jnsahaj/tweakcn).
