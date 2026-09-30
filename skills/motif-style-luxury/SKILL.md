---
name: motif-style-luxury
description: "Near-black pages, gold hairlines, high-contrast serif headlines, wide-tracked small caps, double rules and cards with an inset frame. Square buttons and single-line inputs, with an ivory-paper light mode. For watches, jewellery, hospitality, high-end brands and magazines. Use when the user asks for Luxury Editorial, 奢华杂志, luxury, editorial, gold, serif, magazine, premium, daisyui luxury or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/inter-tight, @fontsource-variable/manrope, @fontsource-variable/playfair-display, @fontsource/dm-serif-display, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-luxury"
  motif-item: "style-luxury"
  params-hash: "5b9499d0"
---

# Luxury Editorial (奢华杂志)

Near-black pages, gold hairlines, high-contrast serif headlines, wide-tracked small caps, double rules and cards with an inset frame. Square buttons and single-line inputs, with an ivory-paper light mode. For watches, jewellery, hospitality, high-end brands and magazines.

## When to use

- Use for premium and heritage brands: watches, jewellery, fashion, fragrance, hotels and restaurants, galleries, magazines, annual reports and long-form editorial features.
- Avoid for utilitarian software UI or playful consumer products; the ceremony gets in the way of speed.

## Files

- `assets/style-luxury.tsx` — the component (`StyleLuxury`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/inter-tight @fontsource-variable/manrope @fontsource-variable/playfair-display @fontsource/dm-serif-display @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-luxury/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/playfair-display';`, `@import '@fontsource-variable/playfair-display/wght-italic.css';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { StyleLuxury } from '@/components/motif/style-luxury/style-luxury'

<StyleLuxury />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #dca54d | #dca54d | color | Hairlines, accent words and the primary button; try rose gold or champagne silver |
| `radius` | 2 | 2 | 0–8 px (best 0–4) | Radius |
| `borderWidth` | 1 | 1 | 0.5–2 px (best 0.5–1.5) | Hairline weight |
| `depth` | 0.5 | 0.5 | 0–1 (best 0.2–0.8) | Card shadow |
| `fontPairing` | playfair | playfair | playfair / fraunces / dmserif / instrument | Font pairing |
| `dark` | true | true | boolean | Dark |

## Rules

- Palette is daisyUI luxury: near-black base-100 oklch(14% .004 286), base-200 oklch(20.2% .004 308), base-300 oklch(23.2% .004 308), champagne text derived from neutral-content oklch(93% .089 91), gold oklch(75.7% .123 77) as the only accent, midnight blue oklch(27.6% .064 261) and plum oklch(36.7% .051 339) as the two dark feature-panel colours. Light mode is warm ivory paper (#f6f1e7) with near-black ink and a darker gold for text.
- Colour ratio: 92% near-black or ivory and champagne text, 6% gold (hairlines, small caps labels, one italic word, one filled button), 2% semantic colours desaturated (sage, amber, brick). Never a bright or saturated colour; never a gradient across a button.
- Gold is a line colour. Use it for 1px hairlines, borders, ornaments and small-caps labels. Do not use it for large fills except the single primary button per page. Text on gold is near-black.
- Lines and frames: cards have a 1px gold hairline at 38% alpha and, when featured, an inset second frame 7px inside at 18% alpha. Section breaks use a double rule (two 1px lines 3px apart) under mastheads and a centred diamond ornament between sections.
- Type: a high-contrast serif for all headings at regular weight (never bold), -0.015em tracking and line-height 1.04, with exactly one italic gold word or phrase in the hero headline; a quiet sans for body at 15px / 1.65; labels are 10 to 11px sans, UPPERCASE, 0.22 to 0.3em tracking, gold. Numerals use lining tabular figures in the serif.
- Layout is symmetrical and airy: centred mastheads and section titles, 64px+ vertical rhythm, narrow measures (max 34rem), a drop cap on the first paragraph of long copy.
- Shape: radius is 0 to 4px. No pills, no soft shadows except a deep, tight, black shadow under floating cards (offset 34px, blur 70px, spread -26px). Arch-topped frames are allowed for hero imagery.
- Buttons are rectangles: uppercase 11px, 0.22em tracking, 1px gold outline that fills with gold on hover while the tracking widens slightly. Inputs are a single 1px underline with italic serif placeholder text; focus thickens the line to gold.
- Motion is slow and dignified: 250 to 450ms ease-out for colour and tracking changes, tabs glide on a diamond marker. No bounce, no glow, no parallax. Respect prefers-reduced-motion.
- Forbidden: bold serif headings, gradients on buttons, drop shadows with colour, neon or pastel colours, emoji, more than one gold-filled element per screen, sans-serif headings.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from saadeghi/daisyui).
