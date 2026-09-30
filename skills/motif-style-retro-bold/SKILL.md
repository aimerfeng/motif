---
name: motif-style-retro-bold
description: "Warm paper ground, black outlines, keys that press down, sunset stripes and halftone dots: old-record charm with modern manners. For music, coffee, indie brands and communities. Use when the user asks for Retro Bold, 复古大胆, retro, bold, vintage, halftone, sunset, tokens, design system or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/manrope, @fontsource-variable/plus-jakarta-sans, @fontsource-variable/syne, @fontsource/archivo-black, @fontsource/dm-serif-display, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-retro-bold"
  motif-item: "style-retro-bold"
  params-hash: "d96208b4"
---

# Retro Bold (复古大胆)

Warm paper ground, black outlines, keys that press down, sunset stripes and halftone dots: old-record charm with modern manners. For music, coffee, indie brands and communities.

## When to use

- Use for music, coffee, food, indie and community brands, event pages and newsletters that want warmth, nostalgia and a hand-made confidence.
- Avoid for dense enterprise dashboards or anything that must read as neutral and clinical.

## Files

- `assets/style-retro-bold.tsx` — the component (`RetroBold`); the tuned values are baked into its `defaults` object
- `assets/style-retro-bold.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/manrope @fontsource-variable/plus-jakarta-sans @fontsource-variable/syne @fontsource/archivo-black @fontsource/dm-serif-display clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-retro-bold/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource-variable/manrope';` to the global stylesheet.
4. Use it:

```tsx
import { RetroBold } from '@/components/motif/style-retro-bold/style-retro-bold'

<RetroBold />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #ffdb33 | #ffdb33 | color | The paper ground and button text follow it |
| `radius` | 4 | 4 | 0–14 px (best 0–10) | Corner radius |
| `borderWidth` | 2 | 2 | 2–4 px (best 2–3) | Border width |
| `shadowOffset` | 4 | 4 | 2–8 px (best 3–6) | Shadow depth |
| `fontPairing` | archivo-plex | archivo-plex | archivo-plex / dm-serif / fraunces / syne | Font pairing |
| `density` | 1 | 1 | 0.85–1.2 x (best 0.9–1.15) | Density |
| `halftone` | true | true | boolean | Halftone ground |

## Rules

- Palette ratio: about 55% warm paper ground (a cream tinted by the accent), 20% lighter paper surfaces, 10% accent, 10% retro pops (orange, teal, plum, pink), 5% warm black ink. Never pure white or pure black; ink is #161210 and paper is #fffaf0.
- Outlines are 2-3px warm black on every surface. Buttons have a downward key edge (0 offset-y hard shadow); cards have a diagonal hard shadow; featured cards add a second colored shadow. No blur anywhere.
- Typography: a heavy display face (Archivo Black, DM Serif Display, Fraunces or Syne) for headings and buttons, a friendly grotesque for body at weight 450-500. Buttons, badges and labels are uppercase with 0.04-0.14em tracking; headings stay sentence case, optionally with a layered offset text-shadow (paper, then orange) on the hero only.
- Decoration comes from CSS: sunset arcs or stripes (orange, yellow, teal, plum), halftone dots at low opacity, hazard-stripe alert edges, folder tabs, ticket-shaped badges. One decorative device per section, never all at once.
- Motion: 120ms ease-out presses. Buttons translate down by half the shadow on hover and the full shadow on press; switches slide. No bounces, no fades, no looping animations.
- Text on the accent is chosen by contrast. Focus rings are a 3px plum outline with offset; inputs get a double accent + ink ring.
- Do not use gradients other than the hard-stop sunset arcs and stripes, blurred shadows, glass, gray borders or thin hairlines, or more than four hues on one screen.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from Logging-Studio/RetroUI).
