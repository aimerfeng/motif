---
name: motif-paper-texture
description: "A procedural sheet of paper with fine grain, fibers, fold lines, crumples, wrinkles and water drops, lit from one direction. A tactile backdrop for editorial, stationery and portfolio sites. Use when the user asks for Paper Texture, 纸张肌理, paper, texture, grain, shader, webgl, editorial or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/paper-texture"
  motif-item: "paper-texture"
  params-hash: "0cd2e5f9"
---

# Paper Texture (纸张肌理)

A procedural sheet of paper with fine grain, fibers, fold lines, crumples, wrinkles and water drops, lit from one direction. A tactile backdrop for editorial, stationery and portfolio sites.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/paper-texture.tsx` — the component (`PaperTextureBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-paper-texture`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/paper-texture/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PaperTextureBackground } from '@/components/motif/paper-texture/paper-texture'

<PaperTextureBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colorPaper` | #ffffff | #ffffff | color | Paper |
| `colorShadow` | #cccccc | #cccccc | color | Color of the grain, fiber, folds and wrinkles |
| `roughness` | 0.4 | 0.4 | 0–1 | Roughness |
| `fiber` | 0.4 | 0.4 | 0–1 | Fiber |
| `folds` | 0.5 | 0.5 | 0–1 | Folds |
| `crumples` | 0 | 0 | 0–1 | Crumples |
| `wrinkles` | 1 | 1 | 0–1 | Wrinkles |
| `drops` | 0.4 | 0.4 | 0–1 | Drops |
| `angle` | 300 | 300 | 0–360 deg | Light angle |
| `seed` | 4 | 4 | 0–1000 | Seed |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
