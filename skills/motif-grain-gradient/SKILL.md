---
name: motif-grain-gradient
description: "Gradients with a printed, film-like grain, shaped as soft corner glows, waves, dots or ripples. A textured backdrop for hero sections. Use when the user asks for Grain Gradient, 颗粒渐变, gradient, grain, noise, shader, webgl, texture or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/grain-gradient"
  motif-item: "grain-gradient"
  params-hash: "bf3cd9bf"
---

# Grain Gradient (颗粒渐变)

Gradients with a printed, film-like grain, shaped as soft corner glows, waves, dots or ripples. A textured backdrop for hero sections.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/grain-gradient.tsx` — the component (`GrainGradientBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-grain-gradient`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/grain-gradient/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { GrainGradientBackground } from '@/components/motif/grain-gradient/grain-gradient'

<GrainGradientBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #7300ff, #eba8ff, #00bfff, #2a00ff | #7300ff, #eba8ff, #00bfff, #2a00ff | 1–7 colors | Gradient colors, up to 7 |
| `colorBack` | #000000 | #000000 | color | Background |
| `shape` | corners | corners | corners / wave / dots / truchet / ripple / blob / sphere | Shape |
| `softness` | 0.5 | 0.5 | 0–1 | Softness |
| `intensity` | 0.5 | 0.5 | 0–1 | Contrast between the shape bands |
| `noise` | 0.25 | 0.25 | 0–1 (best 0.05–0.8) | Grain |
| `speed` | 1 | 1 | 0–3 x (best 0.2–2) | Speed |
| `scale` | 1 | 1 | 0.3–3 x (best 0.4–2) | Scale |
| `rotation` | 0 | 0 | 0–360 deg | Rotation |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
