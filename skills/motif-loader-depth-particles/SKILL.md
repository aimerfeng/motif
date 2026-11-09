---
name: motif-loader-depth-particles
description: "Particle loaders that fake 3D with scale and opacity alone: a DNA double helix of paired dots, a cloud of thirteen particles orbiting inside a slowly turning sphere, an isometric dot grid rippling like a wave, and two electrons crossing orbits. For data, science and AI products that want depth without WebGL. Use when the user asks for Depth Particle Loaders, 纵深粒子加载器, loader, spinner, particles, helix, 3d, depth, loading, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-depth-particles"
  motif-item: "loader-depth-particles"
  params-hash: "d8c7f621"
---

# Depth Particle Loaders (纵深粒子加载器)

Particle loaders that fake 3D with scale and opacity alone: a DNA double helix of paired dots, a cloud of thirteen particles orbiting inside a slowly turning sphere, an isometric dot grid rippling like a wave, and two electrons crossing orbits. For data, science and AI products that want depth without WebGL.

## When to use

- Indeterminate waits longer than ~300 ms: fetching, processing, generating.

## Files

- `assets/loader-depth-particles.tsx` — the component (`LoaderDepthParticles`); the tuned values are baked into its `defaults` object
- `assets/loader-depth-particles.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-depth-particles`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-depth-particles/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderDepthParticles } from '@/components/motif/loader-depth-particles/loader-depth-particles'

<LoaderDepthParticles />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | helix | helix | helix / quantum / grid / superballs | Variant |
| `size` | 48 | 48 | 24–120 px (best 32–96) | Size |
| `color` | #e0e7ff | #e0e7ff | color | Near color |
| `farColor` | #818cf8 | #818cf8 | color | Particles shift toward this color as they recede |
| `particleSize` | 1 | 1 | 0.6–1.4 x (best 0.8–1.2) | Particle size |
| `depth` | 1 | 1 | 0.3–1.4 (best 0.6–1.2) | How much smaller and dimmer far particles get |
| `speed` | 1 | 1 | 0.4–2 x (best 0.7–1.5) | Speed |
| `label` | Loading | Loading | ≤ 32 chars | Screen reader label |

## Rules

- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from GriffinJohnston/ldrs).
