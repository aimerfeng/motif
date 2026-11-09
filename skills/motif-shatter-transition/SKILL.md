---
name: motif-shatter-transition
description: "The current image breaks into Voronoi shards that drift apart in different directions, uncovering the next image underneath. Made for case-study openers, product reveals and portfolio reels. Use when the user asks for Shatter Transition, 碎裂转场, transition, shatter, voronoi, webgl, shader, gl-transitions or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/shatter-transition"
  motif-item: "shatter-transition"
  params-hash: "3ba8c7c1"
---

# Shatter Transition (碎裂转场)

The current image breaks into Voronoi shards that drift apart in different directions, uncovering the next image underneath. Made for case-study openers, product reveals and portfolio reels.

## When to use

- Moments that swap one image, slide or view for another.

## Files

- `assets/shatter-transition.tsx` — the component (`ShatterTransition`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/artwork.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-shatter-transition`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/shatter-transition/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ShatterTransition } from '@/components/motif/shatter-transition/shatter-transition'

<ShatterTransition />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `shards` | 10 | 10 | 4–24 | Shards |
| `drift` | 0.2 | 0.2 | 0.08–0.5 | How fast the shards drift outward |
| `palette` | dusk | dusk | dusk / mono / lagoon / candy | Palette |
| `duration` | 2 | 2 | 0.6–4 s | Duration |
| `pause` | 1.2 | 1.2 | 0.2–5 s | Pause |
| `easing` | 0.4, 0, 0.6, 1 | 0.4, 0, 0.6, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |

## Rules

- Keep transitions under ~800 ms for UI; longer only for showcase sequences.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from gl-transitions/gl-transitions).
