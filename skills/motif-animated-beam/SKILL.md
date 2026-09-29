---
name: motif-animated-beam
description: "A gradient pulse that travels along the line between two elements, showing data flowing from A to B. Perfect for integration maps, architecture diagrams and feature explainers. Use when the user asks for Animated Beam, 流光连线, beam, connection, svg, integration, diagram, gradient or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/animated-beam"
  motif-item: "animated-beam"
  params-hash: "2c6b20bf"
---

# Animated Beam (流光连线)

A gradient pulse that travels along the line between two elements, showing data flowing from A to B. Perfect for integration maps, architecture diagrams and feature explainers.

## When to use

- Numbers, stats and small data displays that change over time.

## Files

- `assets/animated-beam.tsx` — the component (`AnimatedBeam`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/animated-beam/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AnimatedBeam } from '@/components/motif/animated-beam/animated-beam'

<AnimatedBeam />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `curvature` | 0 | 0 | -160–160 px (best -90–90) | Positive bows upward, negative downward |
| `pathWidth` | 2 | 2 | 1–6 px | Line width |
| `length` | 16 | 16 | 6–40 % (best 10–26) | Percent of the container width |
| `pathOpacity` | 0.3 | 0.3 | 0–0.8 | Track opacity |
| `gradientStartColor` | #ffaa40 | #ffaa40 | color | Head color |
| `gradientStopColor` | #9c40ff | #9c40ff | color | Tail color |
| `duration` | 4 | 4 | 1.5–10 s (best 2.5–6) | Duration |
| `repeatDelay` | 0.4 | 0.4 | 0–3 s | Pause between runs |
| `ease` | 0.4, 0, 0.2, 1 | 0.4, 0, 0.2, 1 | cubic-bezier | Easing |
| `reverse` | false | false | boolean | Reverse |

## Rules

- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
