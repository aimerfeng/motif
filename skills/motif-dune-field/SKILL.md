---
name: motif-dune-field
description: "A low sun rakes across wind-sculpted dunes: knife-edge crests cast long soft shadows, fine sand ripples creep downwind in the foreground and the far ridges fade into warm haze. For travel, outdoor and calm premium product heroes. Use when the user asks for Dune Field, 沙丘, dunes, desert, sand, landscape, terrain, raymarching, webgl, hero or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dune-field"
  motif-item: "dune-field"
  params-hash: "5a850260"
---

# Dune Field (沙丘)

A low sun rakes across wind-sculpted dunes: knife-edge crests cast long soft shadows, fine sand ripples creep downwind in the foreground and the far ridges fade into warm haze. For travel, outdoor and calm premium product heroes.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/dune-field.tsx` — the component (`DuneField`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dune-field`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dune-field/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DuneField } from '@/components/motif/dune-field/dune-field'

<DuneField />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `sunAngle` | 24 | 24 | -135–135 deg | 0 puts the sun straight ahead (backlight); positive swings it right, negative left; past about ±90 it moves behind the camera for flatter front light |
| `sunHeight` | 7 | 7 | 3–20 deg (best 5–15) | Lower suns cast longer shadows and stronger contrast |
| `duneHeight` | 1 | 1 | 0.4–1.6 x | Dune height |
| `rippleScale` | 1 | 1 | 0.5–1.5 x (best 0.7–1.3) | Larger values make coarser, wider-spaced ripples |
| `wind` | 0.6 | 0.6 | 0–2 x (best 0.2–1.4) | How fast the ripples creep downwind and slowly reshape; 0 holds still |
| `sandColor` | #e8a865 | #e8a865 | color | The sunlit color; the sky and haze are mixed from it too |
| `shadowColor` | #3f3a66 | #3f3a66 | color | The color of shaded slopes and cast shadows; cooler reads as skylight, and near-black turns the sky into a starry moonlit night |
| `grain` | 0.35 | 0.35 | 0–1 | Grain |

## Rules

- The upper quarter of the frame is open sky and haze: set headlines there, or on a solid panel, rather than straight across the busy foreground ripples.
- Pick shadowColor as the sky color that fills the shade (a cool violet or blue against warm sand reads as real light); the sky and haze are mixed from sandColor and shadowColor, so the scene stays coherent for any pair. A near-black shadowColor with a dim blue sand gives a starry night with a small cool moon.
- The dunes are ray-marched once into a cache when the size, sun or dune height changes; each frame only shades the drifting ripples, so it is cheap to leave running. Under prefers-reduced-motion it renders one still frame.
- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file.
