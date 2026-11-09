---
name: motif-style-papercraft
description: "Stacked sheets of coloured cardstock with soft shadows between the layers, die-cut wavy, zig-zag or scalloped edges, torn-paper dividers that show the white core, and a faint fibre grain. For education, crafts, kids products and seasonal campaigns. Use when the user asks for Papercraft, 剪纸叠层, papercraft, paper cut, cardstock, layers, die-cut, torn paper, kids, education, seasonal, design system or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/fraunces, @fontsource-variable/manrope, @fontsource-variable/outfit, @fontsource-variable/plus-jakarta-sans, @fontsource/dm-serif-display, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-papercraft"
  motif-item: "style-papercraft"
  params-hash: "531bff2e"
---

# Papercraft (剪纸叠层)

Stacked sheets of coloured cardstock with soft shadows between the layers, die-cut wavy, zig-zag or scalloped edges, torn-paper dividers that show the white core, and a faint fibre grain. For education, crafts, kids products and seasonal campaigns.

## When to use

- Use for education and edtech, craft kits and maker brands, children's products, libraries and museums, and seasonal or holiday campaigns that want warmth and tactile depth.
- Avoid for dense dashboards, finance and enterprise tools, or long reading pages; the layered shadows and bright stock need breathing room.

## Files

- `assets/style-papercraft.tsx` — the component (`Papercraft`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-papercraft`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/fraunces @fontsource-variable/manrope @fontsource-variable/outfit @fontsource-variable/plus-jakarta-sans @fontsource/dm-serif-display clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-papercraft/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/outfit';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { Papercraft } from '@/components/motif/style-papercraft/style-papercraft'

<Papercraft />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `palette` | #ef7b45, #2a7c71, #f4c04e, #be3f58, #86b9dc | #ef7b45, #2a7c71, #f4c04e, #be3f58, #86b9dc | 3–6 colors | The first sheet is the primary (buttons, key marks); the rest colour hills, bands and stickers. Text on each sheet picks light or dark ink by contrast |
| `layerDepth` | 1 | 1 | 0.4–1.8 x (best 0.6–1.4) | Scales the offset and blur of the shadow between every pair of sheets |
| `edge` | wave | wave | wave / zigzag / scallop / torn | One cutter for hill ridges, band edges, the sun and round stickers |
| `texture` | 0.5 | 0.5 | 0–1 (best 0.2–0.8) | 0 is smooth stock; higher shows more grain and fibres |
| `radius` | 14 | 14 | 0–28 px (best 4–22) | Corner radius |
| `fontPairing` | fraunces | fraunces | fraunces / bricolage / outfit / dmserif | Font pairing |
| `dark` | false | false | boolean | Dark cardstock ground |

## Rules

- Depth comes only from stacking opaque sheets. Order is ground (0), card (1), raised (2), floating (3). Every sheet casts a soft warm shadow (brown in light mode, near-black in dark mode, never grey) whose offset and blur scale with one depth number. No borders, outlines or hairlines around surfaces; a sheet is separated from what is under it by its shadow and its colour.
- Palette: a cream cardstock ground (#f3ebdc light, #1b1f2c dark), off-white paper (#fffaf1) for cards and inputs, one warm near-black ink, and 3 to 6 saturated cardstock colours. The first colour is the primary (main buttons, the brand mark); the others colour hills, bands, stickers and folder tabs. Ratio: about 55% ground, 25% off-white sheets, 20% coloured stock. Text on any coloured sheet uses dark or light ink chosen by WCAG contrast, never a fixed white; when neither ink reaches 4.5:1 on a mid-tone stock, shift the OKLab lightness of that sheet (keep hue and chroma) until one does, and never fade text on stock with opacity. Secondary text on a stock is the ink mixed at most 30% toward the stock, still at 4.5:1. Keep the third stock light and warm: it is the sun, notes and text selection.
- Edges are die-cut: one cutter per page (wave, zig-zag pinking shears, scallop or torn) shapes hill ridges, the top and bottom edges of full-width bands, the sun and round seal stickers. Cards and buttons keep straight cut edges with one corner radius (controls use 70% of it, inputs 60%). Section breaks use a torn edge that shows a thin white paper core above the coloured face.
- Build edges with CSS masks (a repeating SVG tile, fill below the edge line) on strips attached to the band, and put the shadow on the band with filter: drop-shadow so it follows the cut. Hills are SVG paths generated at the real pixel width so the cutter keeps its scale on every screen; only the front-most layer runs to the bottom edge (and 3px past it), the layers behind close above it, so no seam shows on fractional pixel boundaries.
- Atmospheric layering: background hills are the stock colour mixed 45% toward the sky, middle hills 20%, foreground hills pure stock, and the front-most layer is the page ground so the scene flows into the content.
- Type: a soft display serif or a friendly grotesque at 700 to 800 (DM Serif Display at 400), tight -0.03em tracking and balanced wrapping for headings; a rounded humanist sans for body at 16 to 18px; labels in bold caps with +0.12em tracking. No handwriting fonts.
- Components: buttons are cardstock with a 3px darker base sheet under them; hover lifts by 1px and grows the shadow, press sinks onto the base. Inputs, switch tracks and progress tracks are windows cut through the sheet: a slightly darker well with an inset shadow at the top. Tabs are folder tabs in stock colours tucked behind the panel, the selected one is the panel colour and sits in front. Badges are kiss-cut stickers with a 2.5px paper-white rim. Notes are tinted paper with a round brad (in dark mode a near-full-strength stock note with ink re-picked by contrast, not a 20% tint, which turns muddy on slate). In dark mode the secondary button is the surface lifted about 12% toward the ink so it still reads as a separate sheet. Navigation uses the same paper button styles rendered as links (href), never buttons.
- Texture is one faint fibre-and-fleck grain over the whole page (an SVG turbulence tile, 300px, no blend modes); keep it subtle enough that body text stays crisp.
- Motion is paper-light: lifts and presses in 180ms with a slight overshoot (cubic-bezier(.3,1.4,.5,1)), folder tabs slide up, clouds drift and the sun turns slowly. Respect prefers-reduced-motion by removing transitions and freezing ambient motion.
- Forbidden: gradients across sheets, glass and blur effects, glowing or coloured shadows, 1px borders as structure, neon colours, more than one die-cut cutter on a page, photographs inside the paper scenes.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
