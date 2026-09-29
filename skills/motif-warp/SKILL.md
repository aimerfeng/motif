---
name: motif-warp
description: "Checks, stripes or edges twisted through layered swirls, like drifting ink and silk. Made for large backdrops. Use when the user asks for Warp, 扭曲漩涡, swirl, warp, ink, shader, webgl, background or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/warp"
  motif-item: "warp"
  params-hash: "7f46f318"
---

# Warp (扭曲漩涡)

Checks, stripes or edges twisted through layered swirls, like drifting ink and silk. Made for large backdrops.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/warp.tsx` — the component (`WarpBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/warp/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { WarpBackground } from '@/components/motif/warp/warp'

<WarpBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #121212, #9470ff, #121212, #8838ff | #121212, #9470ff, #121212, #8838ff | 2–10 colors | Colors are laid out as bands in order |
| `shape` | checks | checks | checks / stripes / edge | Pattern |
| `shapeScale` | 0.1 | 0.1 | 0–1 | Pattern scale |
| `proportion` | 0.45 | 0.45 | 0–1 | Proportion |
| `softness` | 1 | 1 | 0–1.5 | Softness |
| `distortion` | 0.25 | 0.25 | 0–0.6 | Distortion |
| `swirl` | 0.8 | 0.8 | 0–1 | Swirl |
| `speed` | 1 | 1 | 0–12 x (best 0.2–6) | Speed |
| `scale` | 1 | 1 | 0.4–3 x (best 0.6–2.5) | Scale |
| `rotation` | 0 | 0 | 0–360 deg | Rotation |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
