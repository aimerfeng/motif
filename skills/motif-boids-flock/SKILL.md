---
name: motif-boids-flock
description: "A canvas flock of small triangles that align, cohere and keep their distance like starlings, leaving soft trails; the pointer scatters them and attractor points pull the flock into loose shapes. A living backdrop for heroes about agents, networks or swarms. Use when the user asks for Boids Flock, 椋鸟群飞, boids, flock, swarm, simulation, canvas, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/boids-flock"
  motif-item: "boids-flock"
  params-hash: "724ee25c"
---

# Boids Flock (椋鸟群飞)

A canvas flock of small triangles that align, cohere and keep their distance like starlings, leaving soft trails; the pointer scatters them and attractor points pull the flock into loose shapes. A living backdrop for heroes about agents, networks or swarms.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/boids-flock.tsx` — the component (`BoidsFlock`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-boids-flock`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/boids-flock/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { BoidsFlock } from '@/components/motif/boids-flock/boids-flock'

<BoidsFlock />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `count` | 120 | 120 | 20–300 (best 60–220) | Count |
| `perception` | 36 | 36 | 18–72 px (best 24–56) | How far each boid sees its neighbors; larger values make bigger, tighter flocks |
| `maxSpeed` | 1.8 | 1.8 | 0.8–3.5 (best 1.2–2.6) | Max speed |
| `palette` | #f5f5f4, #fde68a, #93c5fd, #fca5a5 | #f5f5f4, #fde68a, #93c5fd, #fca5a5 | 1–6 colors | Palette |
| `background` | #0b0b12 | #0b0b12 | color | Background |
| `agentShape` | triangle | triangle | triangle / dot | Shape |
| `trailFade` | 0.87 | 0.87 | 0.3–1 (best 0.5–0.95) | Opacity of the background painted over each step; lower values leave longer trails |
| `cursorRadius` | 90 | 90 | 20–260 px | Cursor radius |
| `attractorStrength` | 0.05 | 0.05 | 0–0.15 | Default pull of attractor points that do not set their own strength |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).
