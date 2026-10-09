---
name: motif-shape-morph
description: "Shapes take turns becoming each other: circle, petals, star, squircle… Each layer follows a beat later, stacking into a trailing bloom of colour. Easing and hold time are tunable. For hero visuals, brand motion or a waiting state. Use when the user asks for Shape Morph, 形状变幻, morph, shape, svg, stagger, brand, loader, hero or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/shape-morph"
  motif-item: "shape-morph"
  params-hash: "f53d902e"
---

# Shape Morph (形状变幻)

Shapes take turns becoming each other: circle, petals, star, squircle… Each layer follows a beat later, stacking into a trailing bloom of colour. Easing and hold time are tunable. For hero visuals, brand motion or a waiting state.

## When to use

- A hero visual or brand mark that changes shape on a calm rhythm, or a waiting state that feels considered. One per screen.

## Files

- `assets/shape-morph.tsx` — the component (`ShapeMorph`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-shape-morph`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/shape-morph/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ShapeMorph } from '@/components/motif/shape-morph/shape-morph'

<ShapeMorph />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `set` | organic | organic | organic / geometric / playful | Shape set |
| `colors` | #ff5a36, #ffb23e | #ff5a36, #ffb23e | 2–4 colors | Blended from the front layer to the back |
| `background` | #f6efe4 | #f6efe4 | color | Background |
| `layers` | 4 | 4 | 1–6 (best 2–5) | Layers |
| `size` | 56 | 56 | 30–80 % (best 42–70) | Size |
| `morph` | 1.3 | 1.3 | 0.5–3 s (best 0.9–2) | Morph time |
| `hold` | 0.9 | 0.9 | 0–3 s (best 0.4–1.6) | How long each shape rests before the next morph |
| `ease` | 0.7, 0, 0.2, 1 | 0.7, 0, 0.2, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |
| `spin` | 8 | 8 | -40–40 deg (best -20–20) | Degrees per second; negative turns the other way |

## Rules

- Keep the hold long enough to read each shape; constant morphing without rests feels restless.
- Back layers should stay lighter than the front layer so the stack reads as one form with a trail.
- All shapes are sampled at the same angles, so add new ones as radius functions of the angle to keep morphs smooth.
- Keep transitions under ~800 ms for UI; longer only for showcase sequences.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
