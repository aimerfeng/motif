---
name: motif-globe
description: "A slowly turning dot-matrix globe with glowing city markers and arcs flying between continents. Drag to spin it. Made for hero sections about reach and networks. Use when the user asks for Globe, 发光地球, globe, earth, webgl, map, hero, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, cobe, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/globe"
  motif-item: "globe"
  params-hash: "6e3b1bca"
---

# Globe (发光地球)

A slowly turning dot-matrix globe with glowing city markers and arcs flying between continents. Drag to spin it. Made for hero sections about reach and networks.

## When to use

- Showpiece visuals: globes, objects, spatial scenes.

## Files

- `assets/globe.tsx` — the component (`Globe`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-globe`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx cobe tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/globe/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Globe } from '@/components/motif/globe/globe'

<Globe />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `baseColor` | #3a4a8f | #3a4a8f | color | Base color |
| `glowColor` | #5b6cff | #5b6cff | color | Glow color |
| `markerColor` | #ffb86b | #ffb86b | color | Marker and arc color |
| `dark` | 1 | 1 | 0–1 | 0 is a lit sphere, 1 is a dark sphere with glowing land |
| `diffuse` | 1.4 | 1.4 | 0.4–3 (best 0.8–2.2) | Higher values make the land brighter and more contrasty |
| `mapBrightness` | 7 | 7 | 2–14 (best 4–10) | Land brightness |
| `rotationSpeed` | 0.12 | 0.12 | 0–0.6 | Radians per second; no auto-rotation under reduced motion |
| `tilt` | 0.3 | 0.3 | -0.6–0.9 | Tilt |
| `markerCount` | 8 | 8 | 0–24 (best 3–16) | Markers |
| `arcCount` | 4 | 4 | 0–8 | Arcs |

## Rules

- Provide a static fallback for low-power devices and reduced motion.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from shuding/cobe).
