---
name: motif-style-synthwave
description: "A deep indigo night, neon outlines and glow, uppercase display type, and a striped-sun horizon with a perspective grid. Switch to cyberpunk for yellow paper, ink-black type, square corners and hard shadows. For music, games, events and bold developer-tool landing pages. Use when the user asks for Synthwave, 合成波, synthwave, outrun, cyberpunk, neon, retro futurism, 80s, glow or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist-mono, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource-variable/manrope, @fontsource-variable/space-grotesk, @fontsource-variable/syne, @fontsource/archivo-black, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-synthwave"
  motif-item: "style-synthwave"
  params-hash: "be8c6e6b"
---

# Synthwave (合成波)

A deep indigo night, neon outlines and glow, uppercase display type, and a striped-sun horizon with a perspective grid. Switch to cyberpunk for yellow paper, ink-black type, square corners and hard shadows. For music, games, events and bold developer-tool landing pages.

## When to use

- Use for music, gaming, nightlife and event sites, creative tools, developer products with a strong personality, and hero-driven landing pages.
- Avoid for content-heavy reading, finance or health; the glow and all-caps type are tiring over long pages.

## Files

- `assets/style-synthwave.tsx` — the component (`StyleSynthwave`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-synthwave`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist-mono @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource-variable/manrope @fontsource-variable/space-grotesk @fontsource-variable/syne @fontsource/archivo-black clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-synthwave/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { StyleSynthwave } from '@/components/motif/style-synthwave/style-synthwave'

<StyleSynthwave />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `theme` | synthwave | synthwave | synthwave / cyberpunk | Synthwave is dark neon; cyberpunk is yellow with hard edges |
| `accent` | #f861b4 | #f861b4 | color | The neon primary; cyan and orange come from the theme |
| `radius` | 14 | 14 | 0–24 px (best 4–18) | Capped at 4px in cyberpunk |
| `borderWidth` | 2 | 2 | 1–4 px (best 1.5–3) | Border width |
| `glow` | 0.7 | 0.7 | 0–1.2 (best 0.4–1) | Scales the halo on cards, buttons, text and the sun |
| `fontPairing` | space | space | space / syne / archivo / mono | Font pairing |

## Rules

- Palette is daisyUI synthwave: base-100 oklch(15% .09 281) to base-300 oklch(25% .09 281) for surfaces, periwinkle content text oklch(78% .115 275), hot pink primary, cyan secondary oklch(82% .111 230), orange tertiary oklch(75% .183 56). Cyberpunk swaps to yellow paper oklch(94.5% .179 104), black content, pink primary, cyan secondary, violet tertiary and navy neutral. Do not mix the two.
- Colour ratio in synthwave: 80% indigo surfaces and periwinkle text, 12% pink, 6% cyan, 2% orange or yellow. Pink is for the one primary action, headings glow and the horizon; cyan is for labels, focus, inputs and HUD corner brackets.
- Glow is the shadow. Every neon element gets a coloured halo (box-shadow or text-shadow) of the same hue at 20 to 70% alpha, scaled by one glow number. Never use black or grey drop shadows on synthwave.
- Outline first: buttons are neon outlines with an inner glow; fill only the one primary action. Cards are a dark gradient with a 2px pink-tinted border and cyan L-shaped brackets on the top-left and bottom-right corners.
- Type: display in a geometric grotesk or heavy black face, UPPERCASE, tight tracking (-0.02em) and line height 0.98; labels in mono at 0.14 to 0.2em tracking. Hero headlines use the chrome gradient (white to cyan, then pink to orange) with a pink drop-shadow halo.
- Every hero gets the horizon: a striped sun (gap bands widen toward the bottom), a perspective grid floor scrolling slowly and a glowing horizon line. Use it once per page, behind the hero only.
- Cyberpunk mode drops all glow. Corners are square (radius at most 4px), borders are 2px navy, shadows are hard offsets (4 to 6px, no blur) in navy, and buttons translate up-left on hover and down-right on press.
- Motion: the only ambient motion is the floor scroll (2.4s linear). Interaction is snappy (160 to 320ms). No parallax. Respect prefers-reduced-motion.
- Text contrast: on synthwave keep body at content colour (78% lightness), never dimmer than 70% opacity; on the primary fill use dark indigo text.
- Forbidden: pastel colours, rounded pill buttons in cyberpunk, more than three neon hues per screen, gradients on body text, lowercase headings.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from saadeghi/daisyui).
