---
name: motif-showroom-carousel
description: "A product carousel staged on a glossy floor: slides swap in perspective or open like doors, reflected on the floor below, with captions and prev/next controls. For product launches, car or device showcases and premium e-commerce. Use when the user asks for Showroom Carousel, 镜面展台轮播, carousel, showcase, product, reflection, webgl, gl-transitions or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/showroom-carousel"
  motif-item: "showroom-carousel"
  params-hash: "5cb22240"
---

# Showroom Carousel (镜面展台轮播)

A product carousel staged on a glossy floor: slides swap in perspective or open like doors, reflected on the floor below, with captions and prev/next controls. For product launches, car or device showcases and premium e-commerce.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/showroom-carousel.tsx` — the component (`ShowroomCarousel`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/artwork.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-showroom-carousel`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/showroom-carousel/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ShowroomCarousel } from '@/components/motif/showroom-carousel/showroom-carousel'

<ShowroomCarousel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | swap | swap | swap / doorway | Transition |
| `reflection` | 0.4 | 0.4 | 0–0.8 (best 0.25–0.6) | Reflection |
| `perspective` | 0.2 | 0.2 | 0–0.6 (best 0.1–0.45) | Perspective |
| `depth` | 3 | 3 | 1.5–5 (best 2–4) | Depth |
| `floorColor` | #000000 | #000000 | color | Floor color |
| `duration` | 1.2 | 1.2 | 0.5–2.5 s (best 0.8–1.8) | Duration |
| `autoplayInterval` | 3.5 | 3.5 | 1.5–8 s | Pauses on hover or focus |
| `easing` | 0.65, 0, 0.35, 1 | 0.65, 0, 0.35, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from gl-transitions/gl-transitions).
