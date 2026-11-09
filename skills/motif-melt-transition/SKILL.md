---
name: motif-melt-transition
description: "The current screen melts away in columns that drip down at uneven speeds, the classic game screen-melt, or drips by luminance to reveal the next scene. Made for game sites, 404 pages and retro launch reveals. Use when the user asks for Melt Transition, 熔落转场, transition, melt, retro, webgl, shader, gl-transitions or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/melt-transition"
  motif-item: "melt-transition"
  params-hash: "41429c4c"
---

# Melt Transition (熔落转场)

The current screen melts away in columns that drip down at uneven speeds, the classic game screen-melt, or drips by luminance to reveal the next scene. Made for game sites, 404 pages and retro launch reveals.

## When to use

- Moments that swap one image, slide or view for another.

## Files

- `assets/melt-transition.tsx` — the component (`MeltTransition`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/artwork.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-melt-transition`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/melt-transition/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MeltTransition } from '@/components/motif/melt-transition/melt-transition'

<MeltTransition />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | doom | doom | doom / luminance | Variant |
| `bars` | 30 | 30 | 6–120 | Column melt only |
| `amplitude` | 2 | 2 | 0–5 | How much the column speeds differ |
| `noise` | 0.1 | 0.1 | 0–1 | Noise |
| `dripScale` | 0.5 | 0.5 | 0–1 | Middle columns run first while the sides stick |
| `lumaThreshold` | 0.8 | 0.8 | 0.2–1 | Luminance melt only: parts darker than this drip first |
| `duration` | 1.6 | 1.6 | 0.4–3.5 s | Duration |
| `pause` | 1.2 | 1.2 | 0.2–5 s | Pause |
| `palette` | dusk | dusk | dusk / mono / lagoon / candy | Palette |

## Rules

- Keep transitions under ~800 ms for UI; longer only for showcase sequences.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from gl-transitions/gl-transitions).
