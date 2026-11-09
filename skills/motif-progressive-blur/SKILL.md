---
name: motif-progressive-blur
description: "Stacked backdrop-filter layers blur harder toward an edge, so content melts into the frame instead of hitting a hard fade. For scroll lists, image cards and sticky headers, or rising on hover to seat a caption. Use when the user asks for Progressive Blur, 渐进模糊, blur, backdrop-filter, mask, image, caption or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/progressive-blur"
  motif-item: "progressive-blur"
  params-hash: "951984c6"
---

# Progressive Blur (渐进模糊)

Stacked backdrop-filter layers blur harder toward an edge, so content melts into the frame instead of hitting a hard fade. For scroll lists, image cards and sticky headers, or rising on hover to seat a caption.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/progressive-blur.tsx` — the component (`ProgressiveBlur`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-progressive-blur`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/progressive-blur/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ProgressiveBlur } from '@/components/motif/progressive-blur/progressive-blur'

<ProgressiveBlur />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `direction` | bottom | bottom | bottom / top / left / right | Direction |
| `blurIntensity` | 0.5 | 0.5 | 0.1–2 px (best 0.25–1) | Blur radius added per layer |
| `blurLayers` | 8 | 8 | 2–12 | Layers |
| `extent` | 75 | 75 | 20–100 % | Extent |

## Rules

- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
