---
name: motif-skeleton-shimmer
description: "A skeleton that matches the real content: one highlight sweeps across the whole card, then the skeleton fades out as content blurs in. Both layers share one grid cell so nothing jumps. For profile cards, lists and articles. Use when the user asks for Skeleton Shimmer, 骨架屏流光, skeleton, shimmer, loading, placeholder, card, cls, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/skeleton-shimmer"
  motif-item: "skeleton-shimmer"
  params-hash: "0931bbd6"
---

# Skeleton Shimmer (骨架屏流光)

A skeleton that matches the real content: one highlight sweeps across the whole card, then the skeleton fades out as content blurs in. Both layers share one grid cell so nothing jumps. For profile cards, lists and articles.

## When to use

- Use for content-shaped waits (cards, lists, articles) where the layout is known. For unknown or tiny waits use a loader-* item instead.

## Files

- `assets/skeleton-shimmer.tsx` — the component (`SkeletonShimmer`); the tuned values are baked into its `defaults` object
- `assets/skeleton-shimmer.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/skeleton-shimmer/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SkeletonShimmer } from '@/components/motif/skeleton-shimmer/skeleton-shimmer'

<SkeletonShimmer />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `animation` | shimmer | shimmer | shimmer / pulse / breathe | Animation |
| `duration` | 1.6 | 1.6 | 0.8–3.5 s (best 1.2–2.4) | Cycle time |
| `stagger` | 0.12 | 0.12 | 0–0.4 s (best 0.05–0.2) | Delay between neighboring blocks so the light sweeps across the card |
| `direction` | ltr | ltr | ltr / rtl | Direction |
| `baseColor` | #94949e2e | #94949e2e | color | A translucent grey that works on light and dark themes |
| `highlightColor` | #a1a1ab59 | #a1a1ab59 | color | Highlight |
| `radius` | 8 | 8 | 0–20 px (best 4–14) | Corner radius |
| `reveal` | blur | blur | blur / rise / fade | Reveal |

## Rules

- Build the skeleton with the same paddings and sizes as the real content; the stacked-grid layout hides small differences but not large ones.
- Leave loading true until the data is really there; do not flash the skeleton for requests under about 200 ms.
- Skeleton blocks are aria-hidden; keep the sr-only status label and aria-busy on the container.
- Keep base and highlight translucent greys so the skeleton works on both light and dark surfaces.
- Match the real layout so nothing jumps when content arrives.
- Keep the shimmer subtle and slow; replace it with a static tint under reduced motion.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from dvtng/react-loading-skeleton).
