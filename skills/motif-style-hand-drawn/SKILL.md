---
name: motif-style-hand-drawn
description: "Wobbly pencil outlines, hatched shadows, sticky notes and tape: everything looks sketched in a notebook margin and still works. For creative tools, education, studio sites and friendly brands. Use when the user asks for Hand-Drawn Sketch, 手绘草图, hand-drawn, sketch, paper, doodle, playful, tokens, design system or a similar effect. Includes the parameters tuned on Motif."
license: ISC
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/fraunces, @fontsource-variable/inter-tight, @fontsource-variable/manrope, @fontsource-variable/outfit, @fontsource-variable/plus-jakarta-sans, @fontsource-variable/syne, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-hand-drawn"
  motif-item: "style-hand-drawn"
  params-hash: "b8133159"
---

# Hand-Drawn Sketch (手绘草图)

Wobbly pencil outlines, hatched shadows, sticky notes and tape: everything looks sketched in a notebook margin and still works. For creative tools, education, studio sites and friendly brands.

## When to use

- Use for creative tools, note and whiteboard apps, kids and education products, studio and freelancer sites, and any brand that wants to feel warm, approachable and unpolished on purpose.
- Avoid for enterprise, finance or security products where the wobble would read as sloppy.

## Files

- `assets/style-hand-drawn.tsx` — the component (`HandDrawn`); the tuned values are baked into its `defaults` object
- `assets/style-hand-drawn.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-hand-drawn`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/fraunces @fontsource-variable/inter-tight @fontsource-variable/manrope @fontsource-variable/outfit @fontsource-variable/plus-jakarta-sans @fontsource-variable/syne @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-hand-drawn/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource-variable/outfit';` to the global stylesheet.
4. Use it:

```tsx
import { HandDrawn } from '@/components/motif/style-hand-drawn/style-hand-drawn'

<HandDrawn />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #ff6b57 | #ff6b57 | color | Buttons, selected tabs and accents; the paper picks up a hint of it |
| `wobble` | 15 | 15 | 0–24 (best 6–20) | 0 gives clean rectangles, higher is looser |
| `lineWidth` | 2.5 | 2.5 | 1.5–4 px (best 2–3.5) | Line weight |
| `hatchOffset` | 4 | 4 | 0–8 px (best 2–6) | Hatch shadow offset |
| `fontPairing` | bricolage | bricolage | bricolage / fraunces / instrument / syne | Font pairing |
| `density` | 1 | 1 | 0.85–1.2 x (best 0.9–1.15) | Density |
| `tilt` | true | true | boolean | Crooked cards |
| `grid` | true | true | boolean | Dot-grid paper |

## Rules

- Palette ratio: about 60% warm paper ground (a cream tinted by the accent, with an optional dot grid), 25% near-white paper surfaces, 8% the accent color pencil, 7% highlighter pops (yellow, mint, pink, sky). Ink is one warm near-black pencil (#2b2623), used at 88% opacity for outlines; never pure black or gray.
- Shapes: every container has an irregular outline made with four elliptical corner radii (PaperCSS-style sets, 15px base at wobble 15) and a 2-3px pencil line. Use a different radius set per element type (buttons, cards, inputs, badges) and never repeat the same set on neighbors. Circles are also irregular (55/45% ellipses).
- Shadows are hatched, not blurred: a 135-degree line pattern in the pencil color, offset 3-6px behind the shape. No blur, no glow, no gradients except the highlighter marks and the notebook rules.
- Typography: a friendly quirky grotesque or a soft serif for headings at weight 700-800 with slight negative tracking, a clean humanist sans for body. Use italic for meta and placeholders. Highlight one key word per screen with a highlighter mark, and underline titles with a hand-drawn squiggle.
- Decoration is doodled SVG with round line caps: stars, arrows, squiggles, a pencil, tape strips and sticky notes rotated 2-5 degrees. Cards may tilt by up to 0.6 degrees; never tilt forms or body text.
- Motion has a playful spring: 180ms cubic-bezier(0.34, 1.56, 0.64, 1), hover lifts and tilts buttons by about 1 degree and grows the hatch, press drops them onto the page. Reduced motion removes the transitions.
- Do not use perfect geometry, thin 1px lines, drop shadows with blur, glass, neon colors, more than four highlighter colors on one screen, or a handwriting font for long text.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: ISC. Keep the header comments in each file (originally from papercss/papercss).
