---
name: motif-swirl
description: "Bands of color unfurl outward from the center like a kaleidoscope or spinning candy wrapper. A lively backdrop or transition base. Use when the user asks for Swirl, 螺旋色带, swirl, spiral, bands, shader, webgl, background or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/swirl"
  motif-item: "swirl"
  params-hash: "dc9c6cd6"
---

# Swirl (螺旋色带)

Bands of color unfurl outward from the center like a kaleidoscope or spinning candy wrapper. A lively backdrop or transition base.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/swirl.tsx` — the component (`SwirlBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-swirl`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/swirl/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SwirlBackground } from '@/components/motif/swirl/swirl'

<SwirlBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #ffd1d1, #ff8a8a, #660000 | #ffd1d1, #ff8a8a, #660000 | 1–10 colors | Band colors, cycled in order |
| `colorBack` | #330000 | #330000 | color | Background |
| `bandCount` | 4 | 4 | 1–12 | Bands |
| `twist` | 0.1 | 0.1 | 0–1 | Twist |
| `center` | 0.2 | 0.2 | 0–1 | Width of the center area |
| `proportion` | 0.5 | 0.5 | 0–1 | Proportion |
| `softness` | 0 | 0 | 0–1 | Softness |
| `noise` | 0.2 | 0.2 | 0–1 | Noise |
| `speed` | 0.32 | 0.32 | 0–2 x (best 0.05–1.2) | Speed |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
