---
name: motif-carousel-3d-cylinder
description: "Cards wrap around a CSS 3D cylinder; drag to spin it with momentum and click any card to lift it into a focused overlay. For galleries, mood boards and collection pages. Use when the user asks for 3D Cylinder Carousel, 3D 环形轮播, carousel, 3d, cylinder, gallery, drag, momentum or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/carousel-3d-cylinder"
  motif-item: "carousel-3d-cylinder"
  params-hash: "b46cc425"
---

# 3D Cylinder Carousel (3D 环形轮播)

Cards wrap around a CSS 3D cylinder; drag to spin it with momentum and click any card to lift it into a focused overlay. For galleries, mood boards and collection pages.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/carousel-3d-cylinder.tsx` — the component (`ThreeDPhotoCarousel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-carousel-3d-cylinder`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/carousel-3d-cylinder/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ThreeDPhotoCarousel } from '@/components/motif/carousel-3d-cylinder/carousel-3d-cylinder'

<ThreeDPhotoCarousel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `faces` | 14 | 14 | 8–20 (best 10–16) | Faces |
| `cylinderWidth` | 1800 | 1800 | 1200–2400 px (best 1500–2100) | Scaled to about 0.6× on screens up to 640px |
| `perspective` | 1000 | 1000 | 600–1800 px (best 800–1400) | Perspective |
| `radius` | 12 | 12 | 0–24 px (best 8–16) | Card radius |
| `artwork` | night | night | night / dusk / frost | Artwork |
| `dragSensitivity` | 0.05 | 0.05 | 0.02–0.1 (best 0.03–0.07) | Drag sensitivity |
| `spring` | visualDuration 0.4, bounce 0 | visualDuration 0.4, bounce 0 | visualDuration 0.05–4 s, bounce 0–0.9 | Momentum spring |
| `autoSpin` | 8 | 8 | -30–30 deg (best -12–12) | Degrees per second; 0 stops it |

## Rules

- Pass your own cards ({ id, label, content }) to replace the generated artwork; content fills a square face.
- The focused overlay is position: fixed; render the carousel where a full-viewport overlay makes sense.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).
