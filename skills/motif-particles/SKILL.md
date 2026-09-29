---
name: motif-particles
description: "Tiny specks of light drift and twinkle in the background, shifting slightly with the pointer for a sense of depth. An ambient layer for heroes, cards and sections. Use when the user asks for Particles, 漂浮粒子, particles, canvas, ambient, stars, parallax, dust or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/particles"
  motif-item: "particles"
  params-hash: "1c08a8ac"
---

# Particles (漂浮粒子)

Tiny specks of light drift and twinkle in the background, shifting slightly with the pointer for a sense of depth. An ambient layer for heroes, cards and sections.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/particles.tsx` — the component (`Particles`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/particles/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Particles } from '@/components/motif/particles/particles'

<Particles />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `quantity` | 240 | 240 | 10–500 (best 60–300) | Quantity |
| `size` | 2 | 2 | 0.5–4 px (best 0.8–2.4) | Size |
| `colors` | #ffffff, #a5b4fc, #f0abfc | #ffffff, #a5b4fc, #f0abfc | 1–5 colors | Each particle picks one at random |
| `vx` | 0 | 0 | -40–40 px (best -20–20) | Pixels per second, negative drifts left |
| `vy` | -8 | -8 | -40–40 px (best -24–24) | Pixels per second, negative drifts up |
| `pointerPull` | 1 | 1 | 0–3 (best 0.4–2) | How far particles shift with the pointer; 0 turns it off |
| `ease` | 50 | 50 | 10–150 (best 25–100) | Higher values follow more slowly |
| `seed` | 7 | 7 | seed | Seed |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
