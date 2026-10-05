---
name: motif-pulsing-border
description: "Luminous color spots travel and breathe along the edge into a glowing contour. Gives cards, inputs and AI panels an alive outline. Use when the user asks for Pulsing Border, 脉冲光边, border, glow, card, shader, webgl, ai or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pulsing-border"
  motif-item: "pulsing-border"
  params-hash: "dece64b0"
---

# Pulsing Border (脉冲光边)

Luminous color spots travel and breathe along the edge into a glowing contour. Gives cards, inputs and AI panels an alive outline.

## When to use

- Pricing, feature or sign-in cards that should draw the eye.

## Files

- `assets/pulsing-border.tsx` — the component (`PulsingBorderCard`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-pulsing-border`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pulsing-border/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PulsingBorderCard } from '@/components/motif/pulsing-border/pulsing-border'

<PulsingBorderCard />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #0dc1fd, #d915ef, #ff3f2ecc | #0dc1fd, #d915ef, #ff3f2ecc | 1–5 colors | Each color spawns a few spots that travel along the edge |
| `colorBack` | #00000000 | #00000000 | color | Translucent lets the surface behind show through |
| `roundness` | 0.25 | 0.25 | 0–1 | Roundness |
| `thickness` | 0.1 | 0.1 | 0.02–1 | Thickness |
| `softness` | 0.75 | 0.75 | 0–1 | Softness |
| `bloom` | 0.25 | 0.25 | 0–1 | Bloom |
| `spotSize` | 0.5 | 0.5 | 0.1–1 | Spot size |
| `pulse` | 0.25 | 0.25 | 0–1 | Pulse |
| `smoke` | 0.3 | 0.3 | 0–1 | Smoke |
| `speed` | 1 | 1 | 0–3 x (best 0.2–2) | Speed |

## Rules

- Highlight one card in a group, not all of them.
- The effect must not reduce the legibility of the card content.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
