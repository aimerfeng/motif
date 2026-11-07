---
name: motif-flow-field
description: "Thousands of glowing particles drift along a slowly shifting noise field, trailing fine streaks whose color follows the direction of flow, fading into the dark at the edges. A backdrop for dark heroes, launches, and data or AI products. Use when the user asks for Flow Field, 流场, flow field, particles, noise, trails, canvas, generative or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/flow-field"
  motif-item: "flow-field"
  params-hash: "02b3d616"
---

# Flow Field (流场)

Thousands of glowing particles drift along a slowly shifting noise field, trailing fine streaks whose color follows the direction of flow, fading into the dark at the edges. A backdrop for dark heroes, launches, and data or AI products.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/flow-field.tsx` — the component (`FlowField`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-flow-field`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/flow-field/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { FlowField } from '@/components/motif/flow-field/flow-field'

<FlowField />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `count` | 1500 | 1500 | 300–2400 (best 600–1800) | Particles |
| `scale` | 1 | 1 | 0.4–2.5 x (best 0.6–1.8) | Higher values make tighter, busier eddies |
| `colors` | #4ade80, #22d3ee, #818cf8, #e879f9 | #4ade80, #22d3ee, #818cf8, #e879f9 | 1–5 colors | Each particle takes a color and shifts toward its neighbors with the flow direction |
| `background` | #050508 | #050508 | color | Background |
| `size` | 1.5 | 1.5 | 0.6–2.6 px (best 0.8–2) | Stroke width |
| `trail` | 0.6 | 0.6 | 0.1–1 (best 0.25–0.8) | Trail length |
| `vignette` | 0.75 | 0.75 | 0–1 | Fades the edges into the background to focus the center |
| `speed` | 1 | 1 | 0.2–2.5 x (best 0.5–1.6) | Speed |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).
