---
name: motif-fluid-simulation
description: "A real Navier-Stokes fluid solved on the GPU: colored dye constantly stirred into curls and glowing with bloom. It flows on its own, and dragging the pointer stirs it by hand. Made for hero and full-screen backgrounds. Use when the user asks for Fluid Simulation, 流体模拟, fluid, simulation, webgl, ink, interactive, hero or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/fluid-simulation"
  motif-item: "fluid-simulation"
  params-hash: "d55714bf"
---

# Fluid Simulation (流体模拟)

A real Navier-Stokes fluid solved on the GPU: colored dye constantly stirred into curls and glowing with bloom. It flows on its own, and dragging the pointer stirs it by hand. Made for hero and full-screen backgrounds.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/fluid-simulation.tsx` — the component (`FluidSimulation`); the tuned values are baked into its `defaults` object
- `assets/fluid-engine.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-fluid-simulation`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/fluid-simulation/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { FluidSimulation } from '@/components/motif/fluid-simulation/fluid-simulation'

<FluidSimulation />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `dyeResolution` | 1024 | 1024 | 256 / 512 / 1024 | Dye resolution: sharper but heavier on the GPU |
| `simResolution` | 128 | 128 | 64 / 128 / 256 | Velocity grid size: higher gives finer eddies |
| `densityDissipation` | 1.2 | 1.2 | 0–4 (best 0.4–2.5) | Higher values make the color fade faster |
| `velocityDissipation` | 0.2 | 0.2 | 0–4 (best 0–2) | Higher values make the flow settle faster |
| `pressure` | 0.8 | 0.8 | 0–1 (best 0.4–1) | Pressure |
| `curl` | 30 | 30 | 0–50 | Higher values roll the flow into more curls |
| `splatRadius` | 0.25 | 0.25 | 0.05–0.8 (best 0.1–0.5) | Splat radius |
| `splatForce` | 6000 | 6000 | 1000–12000 | Splat force |
| `bloom` | true | true | boolean | Bloom |
| `bloomIntensity` | 0.8 | 0.8 | 0.1–2 (best 0.3–1.4) | Bloom intensity |
| `colorful` | true | true | boolean | When off, a single hue chosen by the seed is used |
| `seed` | 7 | 7 | seed | Decides the autoplay paths, splats and the hue in single-color mode |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from PavelDoGreat/WebGL-Fluid-Simulation).
