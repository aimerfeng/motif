---
name: motif-style-varsity
description: "The graphic vocabulary of a college team: block letters with a double outline like chenille patches, jersey numbers, pennants and shield crests, stitched dashed borders and two team colours on cream. For sports clubs, merch, campus events and youth brands. Use when the user asks for Varsity, 校园运动, varsity, collegiate, athletic, sports, chenille, jersey, pennant, letterman, campus, merch, design system or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/outfit, @fontsource-variable/playfair-display, @fontsource-variable/syne, @fontsource/archivo-black, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-varsity"
  motif-item: "style-varsity"
  params-hash: "44044f14"
---

# Varsity (校园运动)

The graphic vocabulary of a college team: block letters with a double outline like chenille patches, jersey numbers, pennants and shield crests, stitched dashed borders and two team colours on cream. For sports clubs, merch, campus events and youth brands.

## When to use

- Use for school and college athletics, sports clubs and leagues, team merch and kit shops, campus events (homecoming, orientation, alumni weekends), summer camps and youth brands that want team spirit and a hand-made, stitched warmth.
- Avoid for enterprise software, finance, healthcare or anything that must feel neutral; the lettering and two loud team colours dominate every screen.

## Files

- `assets/style-varsity.tsx` — the component (`Varsity`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-varsity`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/outfit @fontsource-variable/playfair-display @fontsource-variable/syne @fontsource/archivo-black clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-varsity/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/playfair-display';`, `@import '@fontsource-variable/playfair-display/wght-italic.css';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource-variable/outfit';` to the global stylesheet.
4. Use it:

```tsx
import { Varsity } from '@/components/motif/style-varsity/style-varsity'

<Varsity />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `primary` | #a3192e | #a3192e | color | Block letters, primary buttons and the home jersey; text on it picks light or dark ink |
| `secondary` | #f2b33d | #f2b33d | color | Outer outlines, sleeve stripes, pennant hoists and stitching |
| `ground` | cream | cream | cream / heather / chalk / night | Ground |
| `outlineStyle` | chenille | chenille | chenille / tackle / drop | Applies to block letters, numbers, patches and buttons together |
| `displayFont` | block | block | block / serif / heritage / wide | Display face |
| `stitching` | running | running | running / double / off | The dashed seam inside cards, buttons, badges and pennants |
| `radius` | 10 | 10 | 0–22 px (best 4–16) | Controls use 70% of it |

## Rules

- Palette is exactly two team colours plus neutrals: the home colour (letter fill, primary buttons, home jersey), the trim colour (outer outlines, sleeve stripes, pennant hoists, stitching on home-colour surfaces), a felt cream (#fbf5e6) for the inner outline ring, and one ground (cream, heather grey, chalk or a navy night). Ratio: about 60% ground and felt surfaces, 25% home colour, 10% trim, 5% ink. Never add a third hue; status colours reuse the two team colours.
- Lettering is the signature. Display type is set in caps in a heavy face (Archivo Black, Fraunces or Playfair at 900, Syne at 800) with tight tracking (0 to 0.01em for the sans faces, 0.02 to 0.03em for the serifs so outlined letters never touch) and line height near 0.95. Large letters always carry an outline built from stacked copies of the text with -webkit-text-stroke: chenille is fill, a felt ring of 0.05em, then a trim ring of 0.055em; tackle twill is fill plus one trim ring of 0.07em; drop shadow is fill, a thin felt ring and a trim-coloured copy offset 0.08em down and right. A felt-coloured letter drops the felt ring and shows fill then trim. Only the top copy is readable to assistive tech; the others are aria-hidden. Wide faces are scaled down to match the width of the others, but never below about 1.5rem.
- Body copy is Outfit at 400 to 500, 16 to 18px, sentence case. Labels, buttons, badges and table headers are Outfit 800 in caps with 0.12 to 0.16em tracking. Numbers (scores, dates, prices, jersey numbers) use the display face or tabular figures.
- Text on a team colour picks dark ink or felt cream by contrast. Team colours used as text on the ground are darkened (or lightened on night) until they reach 3.4:1; outlines fall back to ink when neither the fill nor the trim separates from the ground, and to felt or ink when the two team colours are too close to tell apart (two navies, maroon and red). Never set small text in the trim colour on a light ground.
- Surfaces are felt panels: one corner radius, a 2px ink border at 14% and a dashed running stitch inset 7px (a second row 5px further in for double stitching). On home-colour panels the stitch is the trim colour. In drop-shadow mode cards and buttons get a hard 4 to 6px offset shadow in the trim colour; otherwise shadows are a 2px ledge, never blurred. A home-colour panel that sits too close to the ground gets an ink keyline.
- Graphic devices: sleeve stripes (home, felt, trim, felt, home) as dividers and tab rails; pennants with a trim hoist and two ties; shield crests with a monogram; round or rounded-square letter patches; a skewed felt banner under the main word; jersey illustrations with the name arched over the number. Use one or two devices per section.
- Components: buttons are felt patches in caps with an inset stitch, ringed felt then trim (chenille), a trim ring (tackle) or a hard offset (drop). Inputs are sunken felt wells with a 2px border that turns home colour on focus with a soft trim halo. Choice chips and sizes are square patches; the selected one fills with the home colour. Switches have a felt knob that slides onto a home-colour track.
- Motion is brisk and physical: 140ms presses that lift 1px on hover and sink on press, switches and tabs that snap. No floating, parallax or fades on scroll. Respect prefers-reduced-motion by dropping transitions and ambient tickers.
- Forbidden: gradients other than hard-stop stripes, glass and blur, soft drop shadows, thin 1px hairlines as structure, more than two team colours, real team names, mascots or league marks; invent the school, crest and mascot.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
