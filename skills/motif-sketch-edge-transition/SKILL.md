---
name: motif-sketch-edge-transition
description: "The picture dissolves into its own glowing edge-detected line drawing, then the next picture is drawn in from its outlines and fills with color. Made for architecture, industrial design and agency portfolios. Use when the user asks for Sketch Edge Transition, 线稿过渡, transition, edge, sketch, outline, webgl, shader, gl-transitions or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/sketch-edge-transition"
  motif-item: "sketch-edge-transition"
  params-hash: "cd14b244"
---

# Sketch Edge Transition (线稿过渡)

The picture dissolves into its own glowing edge-detected line drawing, then the next picture is drawn in from its outlines and fills with color. Made for architecture, industrial design and agency portfolios.

## When to use

- Moments that swap one image, slide or view for another.

## Files

- `assets/sketch-edge-transition.tsx` — the component (`SketchEdgeTransition`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/artwork.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-sketch-edge-transition`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/sketch-edge-transition/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SketchEdgeTransition } from '@/components/motif/sketch-edge-transition/sketch-edge-transition'

<SketchEdgeTransition />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `edgeThickness` | 0.001 | 0.001 | 0.0005–0.004 | Edge-detection sample offset, as a fraction of the picture |
| `edgeBrightness` | 8 | 8 | 2–20 | Edge brightness |
| `duration` | 2 | 2 | 0.6–4 s | Duration |
| `pause` | 1.2 | 1.2 | 0.2–5 s | Pause |
| `palette` | dusk | dusk | dusk / mono / lagoon / candy | Palette |

## Rules

- Keep transitions under ~800 ms for UI; longer only for showcase sequences.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from gl-transitions/gl-transitions).
