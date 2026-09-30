---
name: motif-style-glass
description: "Frosted glass panels floating over a slowly drifting aurora: gradient fills, a specular top edge, gradient rims. Ships a style sheet, six primitives and a solid fallback when blur is unavailable. For product sites, media and weather apps, dashboards. Use when the user asks for Glass, 玻璃拟态, glassmorphism, frosted, liquid glass, backdrop-filter, aurora, translucent or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/manrope, @fontsource-variable/outfit, @fontsource-variable/plus-jakarta-sans, @fontsource-variable/space-grotesk, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-glass"
  motif-item: "style-glass"
  params-hash: "b6acca0c"
---

# Glass (玻璃拟态)

Frosted glass panels floating over a slowly drifting aurora: gradient fills, a specular top edge, gradient rims. Ships a style sheet, six primitives and a solid fallback when blur is unavailable. For product sites, media and weather apps, dashboards.

## When to use

- Use for interfaces that float over rich imagery or colour: product marketing sites, media and weather widgets, dashboards with a wallpaper, mobile-style overlays.
- Do not use where long-form reading, dense tables or strict accessibility contrast is the main job; glass lowers text contrast.

## Files

- `assets/style-glass.tsx` — the component (`StyleGlass`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/manrope @fontsource-variable/outfit @fontsource-variable/plus-jakarta-sans @fontsource-variable/space-grotesk clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-glass/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/outfit';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { StyleGlass } from '@/components/motif/style-glass/style-glass'

<StyleGlass />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Also sets the three aurora hues |
| `radius` | 22 | 22 | 8–40 px (best 14–32) | Radius |
| `borderWidth` | 1 | 1 | 0.5–2 px (best 1–1.5) | Rim width |
| `blur` | 26 | 26 | 10–48 px (best 18–36) | Blur |
| `depth` | 0.6 | 0.6 | 0–1 (best 0.3–0.9) | 0 sits flat on the backdrop, 1 floats clearly above it |
| `fontPairing` | geist | geist | geist / jakarta / outfit / grotesk | Font pairing |
| `dark` | true | true | boolean | Dark |

## Rules

- Glass needs something to refract. Always place panels over a colourful backdrop (the built-in aurora, an image, a gradient); on a flat colour it reads as a grey box.
- Anatomy of a glass panel: a diagonal white gradient fill (about 15% to 4% alpha in dark, 78% to 36% in light), backdrop-filter blur 18 to 36px with saturate(175%), a 1px rim in white at 15% alpha, an inset 1px top highlight (the specular edge) and a gradient rim that is bright at the top-left and bottom-right corners. Never a flat rgba fill with a plain border.
- One blur layer per stack. backdrop-filter does not see through another backdrop-filter, so children of a panel (buttons, inputs, tabs, badges) use translucent fills with inset highlights and no backdrop-filter of their own.
- Depth comes from the shadow, tuned by one number: large, soft, tinted shadows (offset 30px, blur 70px, negative spread) plus a tight contact shadow. Never a hard or black drop shadow; in light mode tint shadows blue-violet, not grey.
- Colour ratio: about 85% translucent neutrals and backdrop, 10% accent, 5% semantic colour. The accent is used for one filled primary action per view, focus rings, the active switch and small glows. Never fill a whole panel with the accent.
- Primary buttons are glossy: a vertical accent gradient (lighter top), a 1px lighter border, an inset top highlight and a coloured glow shadow. Secondary buttons are glass fills; tertiary are ghost.
- Text is white at 95% (dark) or deep indigo #12162f (light); secondary text 64% and captions 40% of that. Never put body text below 14px and keep it on the panel, not straight on the backdrop.
- Type: a geometric or neo-grotesk sans; headings 600 weight with -0.035em tracking and 1.02 line height; small uppercase mono eyebrows at 0.14em tracking for labels and numbers.
- Radius is generous and nested: cards use the base radius, controls 70% of it, small chips 45%. Pills for badges and the navigation bar.
- Motion is slow and ambient (backdrop drift 26 to 38s, ease-in-out) plus quick springy feedback (200 to 350ms; tab thumbs and switches overshoot slightly). Nothing bounces on scroll. Honour prefers-reduced-motion and prefers-reduced-transparency.
- Always ship the fallback: inside @supports not (backdrop-filter: blur(1px)) and under prefers-reduced-transparency, panels become solid tinted surfaces so content stays legible.
- Forbidden: pure black or pure white panels, more than three aurora hues, blur above 48px, borders thicker than 2px, neon text glows, glass on glass beyond two levels.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
