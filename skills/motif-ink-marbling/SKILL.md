---
name: motif-ink-marbling
description: "Marbled paper made live: ink drops spread into concentric rings on water, then get combed into chevrons, waves, stone or swirls, cycle after cycle. Drag to comb the ink yourself, click to drop more. For stationery, craft and editorial brands. Use when the user asks for Ink Marbling, 墨流纹, marbling, suminagashi, ink, paper, webgl, interactive, editorial or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ink-marbling"
  motif-item: "ink-marbling"
  params-hash: "72d1cdd2"
---

# Ink Marbling (墨流纹)

Marbled paper made live: ink drops spread into concentric rings on water, then get combed into chevrons, waves, stone or swirls, cycle after cycle. Drag to comb the ink yourself, click to drop more. For stationery, craft and editorial brands.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/ink-marbling.tsx` — the component (`InkMarbling`); the tuned values are baked into its `defaults` object
- `assets/marbling.ts`
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-ink-marbling`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ink-marbling/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InkMarbling } from '@/components/motif/ink-marbling/ink-marbling'

<InkMarbling />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `palette` | #1d3150, #b5452f, #d99b3c, #2f6a62, #23232b | #1d3150, #b5452f, #d99b3c, #2f6a62, #23232b | 2–5 colors | Drops take these colors in turn |
| `paper` | #f1e9d8 | #f1e9d8 | color | Also the color of the clear-water rings |
| `inkOpacity` | 0.94 | 0.94 | 0.55–1 | Ink density |
| `combPattern` | wave | wave | wave / chevron / stone / swirl | Pattern |
| `combSpacing` | 8 | 8 | 5–14 % | Smaller makes finer lines; sets the vortex size for swirls and the vein width for stone |
| `combStrength` | 1 | 1 | 0.6–1.6 x (best 0.7–1.3) | Comb strength |
| `dropSize` | 10 | 10 | 8–18 % | Relative to the canvas |
| `dropRate` | 4 | 4 | 1.5–6 | Ink clusters per second |

## Rules

- Layer content on top as children; the marbling is a full-bleed background, so give text its own solid or paper-colored panel rather than setting it straight onto busy ink.
- Keep the palette to 3–5 inks with one dark anchor; the paper color shows through clear-water rings and veins, so choose it as part of the palette.
- Pointer drags add comb strokes and clicks drop ink, except on links, buttons and form fields; under prefers-reduced-motion it renders one settled combed sheet and drops land fully spread.
- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file.
