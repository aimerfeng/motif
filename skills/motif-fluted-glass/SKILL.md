---
name: motif-fluted-glass
description: "A scene seen through reeded glass: it is sliced into strips of refraction with fine highlights and shadows, and drifts slowly from side to side behind the glass. The scene is a sunset, colour blooms or a big word, all drawn on a canvas at runtime; the reeds can be waves, zigzags or irregular lines. Use when the user asks for Fluted Glass, 凹槽玻璃, glass, fluted, reeded, refraction, background, webgl, shader, paper or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource/instrument-serif, @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/fluted-glass"
  motif-item: "fluted-glass"
  params-hash: "003c3076"
---

# Fluted Glass (凹槽玻璃)

A scene seen through reeded glass: it is sliced into strips of refraction with fine highlights and shadows, and drifts slowly from side to side behind the glass. The scene is a sunset, colour blooms or a big word, all drawn on a canvas at runtime; the reeds can be waves, zigzags or irregular lines.

## When to use

- A hero or section background with an architectural, editorial feel; also a frosted panel behind a short headline.

## Files

- `assets/fluted-glass.tsx` — the component (`FlutedGlassPanel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-fluted-glass`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource/instrument-serif @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/fluted-glass/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { FlutedGlassPanel } from '@/components/motif/fluted-glass/fluted-glass'

<FlutedGlassPanel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `scene` | sunset | sunset | sunset / bloom / type | Scene |
| `text` | Reeded | Reeded | ≤ 10 chars | Used when the scene is Type |
| `shape` | lines | lines | lines / linesIrregular / wave / zigzag / pattern | Reeds |
| `distortionShape` | prism | prism | prism / lens / contour / cascade / flat | The cross-section of each reed, which sets how it refracts |
| `size` | 0.5 | 0.5 | 0.1–1 (best 0.25–0.9) | Reed width |
| `distortion` | 0.5 | 0.5 | 0–1 (best 0.2–0.9) | Refraction |
| `angle` | 0 | 0 | 0–180 deg | Angle |
| `blur` | 0 | 0 | 0–1 (best 0–0.5) | Frost |
| `edges` | 0.25 | 0.25 | 0–1 | Edges |
| `shadows` | 0.25 | 0.25 | 0–1 (best 0–0.6) | Shadows |
| `highlights` | 0.1 | 0.1 | 0–1 (best 0–0.5) | Highlights |
| `drift` | 0.08 | 0.08 | 0–0.2 (best 0.03–0.14) | How far the scene drifts behind the glass; 0 keeps it still |

## Rules

- Use a scene with large, simple shapes and strong colour; fine detail turns to noise behind the reeds.
- Put readable text above the glass, never inside the scene image: the refraction slices it.
- Keep the drift small (under about 0.14) so the motion reads as parallax rather than a slideshow.
- Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.
- Keep the DPR cap; large canvases on 4K screens get expensive fast.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
