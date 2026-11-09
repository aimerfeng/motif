---
name: motif-dot-field-ripple
description: "A canvas field of dots over slowly shifting radial gradients; near the pointer the dots are pushed outward in rings and glow, settling back as it moves on, with optional film grain. For dark heroes, sign-in screens and AI product backdrops. Use when the user asks for Dot Field Ripple, 点阵涟漪, dots, grid, ripple, wave, pointer, gradient, canvas, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dot-field-ripple"
  motif-item: "dot-field-ripple"
  params-hash: "cfa26344"
---

# Dot Field Ripple (点阵涟漪)

A canvas field of dots over slowly shifting radial gradients; near the pointer the dots are pushed outward in rings and glow, settling back as it moves on, with optional film grain. For dark heroes, sign-in screens and AI product backdrops.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/dot-field-ripple.tsx` — the component (`DotFieldRipple`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dot-field-ripple`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dot-field-ripple/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DotFieldRipple } from '@/components/motif/dot-field-ripple/dot-field-ripple'

<DotFieldRipple />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `dotSize` | 4 | 4 | 1.5–8 px (best 2–6) | Dot size |
| `spacing` | 20 | 20 | 12–40 px (best 14–32) | Spacing |
| `dotOpacity` | 0.3 | 0.3 | 0.1–0.8 (best 0.2–0.6) | Dot opacity |
| `dotColor` | #6464ff | #6464ff | color | Dot color |
| `waveRadius` | 200 | 200 | 80–400 px (best 120–320) | Wave radius |
| `intensity` | 30 | 30 | 0–60 px (best 10–45) | Wave intensity |
| `glowColor` | #6464ff | #6464ff | color | Glow color |
| `gradientColors` | #ffd6a5, #ffadad, #ffc6ff, #a0c4ff, #bdb2ff, #9bf6ff | #ffd6a5, #ffadad, #ffc6ff, #a0c4ff, #bdb2ff, #9bf6ff | 3–6 colors | Gradient colors |
| `gradientOpacity` | 0.22 | 0.22 | 0–0.6 (best 0.1–0.4) | Gradient strength |
| `gradientSpeed` | 1 | 1 | 0.2–4 x (best 0.5–2.5) | Gradient speed |
| `noise` | 0.03 | 0.03 | 0–0.15 (best 0–0.08) | 0 turns it off |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).
