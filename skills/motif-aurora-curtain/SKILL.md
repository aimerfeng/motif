---
name: motif-aurora-curtain
description: "Northern-light ribbons fold, ripple and drift behind your content, with banded colour, adjustable softness and film grain, falling back to a CSS gradient without WebGL2. For calm hero backdrops and music or wellness products. Use when the user asks for Aurora Curtain, 极光帷幕, aurora, northern-lights, ribbons, grain, webgl2, background, hero or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/aurora-curtain"
  motif-item: "aurora-curtain"
  params-hash: "f648957f"
---

# Aurora Curtain (极光帷幕)

Northern-light ribbons fold, ripple and drift behind your content, with banded colour, adjustable softness and film grain, falling back to a CSS gradient without WebGL2. For calm hero backdrops and music or wellness products.

## When to use

- A single focal visual: hero art, section dividers, product moments.

## Files

- `assets/aurora-curtain.tsx` — the component (`AuroraCurtain`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-aurora-curtain`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/aurora-curtain/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AuroraCurtain } from '@/components/motif/aurora-curtain/aurora-curtain'

<AuroraCurtain />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #66d37a, #52d0d2, #c978e2 | #66d37a, #52d0d2, #c978e2 | 1–6 colors | Assigned to the ribbons in order, cycling when there are more ribbons than colours |
| `bands` | 4 | 4 | 1–8 (best 3–6) | Bands |
| `blur` | 0.5 | 0.5 | 0–1 | 0 is crisp, 1 is very diffuse |
| `intensity` | 1 | 1 | 0.3–1 | Intensity |
| `noise` | 0 | 0 | 0–1 | Re-seeded every frame and laid over the whole surface |
| `speed` | 1 | 1 | 0–2 x (best 0.2–1.5) | Speed |
| `direction` | up | up | up / down | Direction |

## Rules

- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
