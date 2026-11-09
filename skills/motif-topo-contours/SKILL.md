---
name: motif-topo-contours
description: "Hair-thin contour lines drift slowly over a 1px engineering grid like a living survey map, with every Nth line drawn as a heavier index contour. For outdoor, mapping, climate and technical brands. Use when the user asks for Topographic Contours, 等高线地形, topographic, contour, isoline, grid, map, shader, webgl or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/topo-contours"
  motif-item: "topo-contours"
  params-hash: "2f2e3701"
---

# Topographic Contours (等高线地形)

Hair-thin contour lines drift slowly over a 1px engineering grid like a living survey map, with every Nth line drawn as a heavier index contour. For outdoor, mapping, climate and technical brands.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/topo-contours.tsx` — the component (`TopoContours`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-topo-contours`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/topo-contours/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TopoContours } from '@/components/motif/topo-contours/topo-contours'

<TopoContours />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `bands` | 10 | 10 | 4–24 | How many levels the noise height is sliced into |
| `lineWidth` | 0.02 | 0.02 | 0.01–0.08 (best 0.015–0.05) | Line width |
| `indexEvery` | 5 | 5 | 0–8 | Every Nth line is drawn heavier; 0 turns it off |
| `noiseScale` | 1.4 | 1.4 | 0.5–3 | Higher values make busier terrain |
| `drift` | 1 | 1 | 0–4 x (best 0.3–2.5) | Drift |
| `gridSize` | 48 | 48 | 16–120 px | Grid size |
| `gridOpacity` | 0.12 | 0.12 | 0–0.4 | Grid opacity |
| `lineColor` | #ffffff | #ffffff | color | Line color |
| `background` | #000000 | #000000 | color | Background |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).
