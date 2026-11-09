---
name: motif-carousel-autoplay-progress
description: "An autoplaying slide carousel: a progress line fills under the current slide, captions rise in once it lands, with optional arrows and indicators and a pause on hover. For loading-screen tips, product tours and feature highlights. Use when the user asks for Story Carousel, 进度轮播, carousel, slideshow, autoplay, progress, tips, onboarding or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/carousel-autoplay-progress"
  motif-item: "carousel-autoplay-progress"
  params-hash: "89d4e88f"
---

# Story Carousel (进度轮播)

An autoplaying slide carousel: a progress line fills under the current slide, captions rise in once it lands, with optional arrows and indicators and a pause on hover. For loading-screen tips, product tours and feature highlights.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/carousel-autoplay-progress.tsx` — the component (`LoadingCarousel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-carousel-autoplay-progress`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/carousel-autoplay-progress/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoadingCarousel } from '@/components/motif/carousel-autoplay-progress/carousel-autoplay-progress'

<LoadingCarousel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `autoplayInterval` | 4500 | 4500 | 2500–9000 ms (best 3500–6000) | Interval |
| `aspectRatio` | video | video | video / wide / square | Aspect ratio |
| `textPosition` | bottom | bottom | bottom / top | Applies when captions sit on the slide |
| `backgroundTips` | false | false | boolean | Captions on slide |
| `backgroundGradient` | false | false | boolean | Gradient overlay |
| `showProgress` | true | true | boolean | Progress fill |
| `showIndicators` | true | true | boolean | Indicators |
| `showNavigation` | false | false | boolean | Arrows |
| `radius` | 12 | 12 | 0–28 px (best 8–20) | Corner radius |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).
