---
name: motif-typography-vortex
description: "Concentric rings of your own text rotate slowly; the pointer dissolves glyphs into drifting dust and a click sucks it into a point. Dark and light surfaces. An atmospheric backdrop for brand and portfolio pages. Use when the user asks for Typography Vortex, 文字漩涡, typography, vortex, rings, particles, canvas2d, interactive, pointer, click or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/typography-vortex"
  motif-item: "typography-vortex"
  params-hash: "52d78931"
---

# Typography Vortex (文字漩涡)

Concentric rings of your own text rotate slowly; the pointer dissolves glyphs into drifting dust and a click sucks it into a point. Dark and light surfaces. An atmospheric backdrop for brand and portfolio pages.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/typography-vortex.tsx` — the component (`TypographyVortex`); the tuned values are baked into its `defaults` object
- `assets/vortex-renderer.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/typography-vortex/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TypographyVortex } from '@/components/motif/typography-vortex/typography-vortex'

<TypographyVortex />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `phrase` | MOTIF / DESIGN IN MOTION /  | MOTIF / DESIGN IN MOTION /  | ≤ 48 chars | Repeated around each ring; capitals with separators work best |
| `mode` | dark | dark | dark / light | Surface |
| `speed` | 1 | 1 | 0.2–2.5 x (best 0.4–1.8) | Rotation speed |
| `ringGrowth` | 1.21 | 1.21 | 1.1–1.4 | Lower values pack the rings tighter |
| `opacity` | 1 | 1 | 0.4–1 | Ink strength |
| `dissolveRadius` | 1 | 1 | 0.6–1.5 | Dissolve radius |
| `particleAmount` | 1 | 1 | 0.3–1.6 | Particles |
| `suctionDuration` | 920 | 920 | 400–1500 ms | How long a click pulls dust in |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from MengTo/threeui).
