---
name: motif-isometric-layer-explode
description: "A live one-time-code field tilts into an isometric view and separates into container, slot and real-input planes, with a separation slider and labels that isolate one layer. For how-it-works sections, architecture explainers and docs. Use when the user asks for Isometric Layer Explode, 等轴分层爆炸图, isometric, exploded view, layers, anatomy, docs, css 3d or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/isometric-layer-explode"
  motif-item: "isometric-layer-explode"
  params-hash: "dc6ae8fd"
---

# Isometric Layer Explode (等轴分层爆炸图)

A live one-time-code field tilts into an isometric view and separates into container, slot and real-input planes, with a separation slider and labels that isolate one layer. For how-it-works sections, architecture explainers and docs.

## When to use

- Showpiece visuals: globes, objects, spatial scenes.

## Files

- `assets/isometric-layer-explode.tsx` — the component (`IsometricLayerExplode`); the tuned values are baked into its `defaults` object
- `assets/isometric-layer-explode.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-isometric-layer-explode`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/isometric-layer-explode/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { IsometricLayerExplode } from '@/components/motif/isometric-layer-explode/isometric-layer-explode'

<IsometricLayerExplode />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `separation` | 72 | 72 | 0–140 px (best 40–110) | Separation |
| `tilt` | true | true | boolean | Isometric view |
| `reveal` | true | true | boolean | Reveal the input |
| `accent` | #f39c4a | #f39c4a | color | Input layer color |
| `plate` | #3dd2f5 | #3dd2f5 | color | Container color |
| `showLabels` | true | true | boolean | Show layer labels |

## Rules

- Provide a static fallback for low-power devices and reduced motion.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from guilhermerodz/input-otp).
