---
name: motif-loader-kinetic-toys
description: "Six desk-toy waits: a Newton's cradle, a metronome with fading echoes, leapfrogging dots, a block that squashes and stretches along an arc, a cube tumbling on a treadmill and two balls trading momentum. For friendly waits in consumer apps and onboarding. Use when the user asks for Kinetic Toy Loaders, 物理摆件加载器, loader, physics, pendulum, newtons-cradle, squash-stretch, loading, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-kinetic-toys"
  motif-item: "loader-kinetic-toys"
  params-hash: "126ab002"
---

# Kinetic Toy Loaders (物理摆件加载器)

Six desk-toy waits: a Newton's cradle, a metronome with fading echoes, leapfrogging dots, a block that squashes and stretches along an arc, a cube tumbling on a treadmill and two balls trading momentum. For friendly waits in consumer apps and onboarding.

## When to use

- Indeterminate waits longer than ~300 ms: fetching, processing, generating.

## Files

- `assets/loader-kinetic-toys.tsx` — the component (`LoaderKineticToys`); the tuned values are baked into its `defaults` object
- `assets/loader-kinetic-toys.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-kinetic-toys`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-kinetic-toys/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderKineticToys } from '@/components/motif/loader-kinetic-toys/loader-kinetic-toys'

<LoaderKineticToys />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | newtons-cradle | newtons-cradle | newtons-cradle / metronome / leapfrog / bouncy-arc / treadmill / momentum | Variant |
| `size` | 40 | 40 | 20–72 px (best 28–56) | 40 matches the upstream default size |
| `color` | #e4e4e7 | #e4e4e7 | color | Color |
| `speed` | 1 | 1 | 0.5–2 x (best 0.7–1.4) | Speed |
| `amplitude` | 1 | 1 | 0.5–1.15 x | Swing angle multiplier for the cradle and bouncy arc |
| `echoes` | 3 | 3 | 0–3 | Fading trail dots behind the metronome ball |
| `squash` | 1 | 1 | 0–1.4 x | Squash-and-stretch amount for the arc and treadmill blocks |
| `label` | Loading | Loading | ≤ 32 chars | Screen reader label |

## Rules

- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from GriffinJohnston/ldrs).
