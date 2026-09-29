---
name: motif-image-transitions
description: "Ten hand-picked WebGL transitions (warps, zooms, cube, ripple, polka dots and more) that loop between a few slides on their own. Made for portfolio reels, slideshows and hero carousels. Use when the user asks for Image Transitions, 图像转场, transition, slideshow, carousel, webgl, shader, gl-transitions or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/image-transitions"
  motif-item: "image-transitions"
  params-hash: "40b5c89c"
---

# Image Transitions (图像转场)

Ten hand-picked WebGL transitions (warps, zooms, cube, ripple, polka dots and more) that loop between a few slides on their own. Made for portfolio reels, slideshows and hero carousels.

## When to use

- Moments that swap one image, slide or view for another.

## Files

- `assets/image-transitions.tsx` — the component (`ImageTransitions`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/artwork.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/image-transitions/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ImageTransitions } from '@/components/motif/image-transitions/image-transitions'

<ImageTransitions />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `transition` | crosswarp | crosswarp | crosswarp / crosszoom / directional-warp / ripple / swirl / cube / glitch-memories / polka-dots / circle-open / dreamy-zoom | Transition |
| `duration` | 1.6 | 1.6 | 0.4–3.5 s (best 0.8–2.4) | Duration |
| `pause` | 1.2 | 1.2 | 0.2–5 s | How long each slide holds before the next transition |
| `easing` | 0.65, 0, 0.35, 1 | 0.65, 0, 0.35, 1 | cubic-bezier | Easing |
| `scheme` | dusk | dusk | dusk / mono / lagoon / candy | Palette |
| `slides` | 2 | 2 | 2 / 3 | Two slides ping-pong, three run in sequence |

## Rules

- Keep transitions under ~800 ms for UI; longer only for showcase sequences.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from gl-transitions/gl-transitions).
