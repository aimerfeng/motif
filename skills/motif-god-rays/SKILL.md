---
name: motif-god-rays
description: "Beams of light fall in from off-screen with a soft bloom along the edges. Stage lighting for launch and event pages. Use when the user asks for God Rays, 丁达尔光束, light, rays, beams, shader, webgl, hero or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/god-rays"
  motif-item: "god-rays"
  params-hash: "0f8f49cc"
---

# God Rays (丁达尔光束)

Beams of light fall in from off-screen with a soft bloom along the edges. Stage lighting for launch and event pages.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/god-rays.tsx` — the component (`GodRaysBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/god-rays/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { GodRaysBackground } from '@/components/motif/god-rays/god-rays'

<GodRaysBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #a600ff6e, #6200fff0, #ffffff, #33fff5 | #a600ff6e, #6200fff0, #ffffff, #33fff5 | 1–5 colors | Translucent colors work well |
| `colorBack` | #000000 | #000000 | color | Background |
| `colorBloom` | #0000ff | #0000ff | color | Bloom color |
| `density` | 0.3 | 0.3 | 0–1 | Density |
| `spotty` | 0.3 | 0.3 | 0–1 | Spottiness |
| `intensity` | 0.8 | 0.8 | 0.2–1 | Intensity |
| `bloom` | 0.4 | 0.4 | 0–1 | Bloom |
| `speed` | 0.75 | 0.75 | 0–3 x (best 0.1–2) | Speed |
| `offsetX` | 0 | 0 | -1–1 | Source X |
| `offsetY` | -0.55 | -0.55 | -1–1 | Source Y |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
