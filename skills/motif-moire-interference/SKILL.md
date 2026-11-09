---
name: motif-moire-interference
description: "Two or three fine line, ring or dot gratings overlap, turned a few degrees apart and slowly drifting, so broad op-art fringes shimmer across the frame; the pointer nudges the top layer. For art, fashion and audio brand visuals. Use when the user asks for Moire Interference, 摩尔纹干涉, moire, op-art, interference, lines, pattern, monochrome, webgl, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/moire-interference"
  motif-item: "moire-interference"
  params-hash: "8603c46f"
---

# Moire Interference (摩尔纹干涉)

Two or three fine line, ring or dot gratings overlap, turned a few degrees apart and slowly drifting, so broad op-art fringes shimmer across the frame; the pointer nudges the top layer. For art, fashion and audio brand visuals.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/moire-interference.tsx` — the component (`MoireInterference`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-moire-interference`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/moire-interference/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MoireInterference } from '@/components/motif/moire-interference/moire-interference'

<MoireInterference />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `pattern` | rings | rings | rings / lines / dots | Rings: offset centres grow radiating hyperbolic fringes; Lines: a small angle grows broad bands that ripple like watered silk; Dots: twisted hexagonal lattices grow a larger hexagonal superpattern |
| `layers` | 2 | 2 | 2–3 | Three layers weave the fringes into a denser figure; each layer gets thinner so the overall tone holds, and the offset is split between neighbouring layers |
| `frequency` | 11 | 11 | 6–18 (best 8–15) | Lines per 100 px; higher is finer, and the fringes shrink with it, so more of them fit |
| `rotation` | 3 | 3 | 0.5–7 (best 1–6) | How far the layers are set apart; smaller gives fewer, broader fringes. For lines and dots it is the angle between the outer layers in degrees; for rings, how far apart the centres sit |
| `lineWidth` | 0.36 | 0.36 | 0.2–0.5 | Share of each period that is ink; in dot mode, the dot area. Light ink on dark paper is drawn a little thinner automatically |
| `drift` | 0.6 | 0.6 | 0–1.5 x (best 0.15–1.2) | How fast the layers turn and slide against each other; 0 stops the drift, the pointer can still push the top layer |
| `pointerShift` | 0.5 | 0.5 | 0–1 | How far the pointer pushes the top layer; moire magnifies the shift, so a small move sweeps the fringes. The sweep speed is capped, so even a fast flick sweeps the fringes gently |
| `ink` | #16130f | #16130f | color | Pushed darker or lighter automatically when too close to the paper, so the fringes never vanish |
| `paper` | #ede6da | #ede6da | color | Paper |

## Rules

- The fringes are the content: keep headlines on a solid panel or a quiet margin rather than straight across the gratings, where fine lines fight with type.
- Do not run it full-viewport behind body copy, forms or anything people read for long: a full-contrast fine grating in motion is tiring to read over and can bother viewers sensitive to flicker. Give it a hero band, a section break or a framed panel, and keep reading content on solid ground.
- Keep the gratings fine (frequency 8 to 15) and the offset small (1 to 6): the fringe figure comes from the small mismatch, and the fringes scale down as frequency goes up.
- Use one ink on one paper; ink is pushed darker or lighter automatically when it sits too close to the paper, and light ink on dark paper is drawn thinner so it does not flood the frame. For a dark brand, put a light ink on a near-black paper.
- The pointer only pushes the top layer and moire magnifies that push; the sweep speed is capped so a fast pointer move still sweeps gently, but keep pointerShift moderate on pages people scroll with a mouse. Under prefers-reduced-motion it renders one still frame and ignores the pointer.
- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file.
