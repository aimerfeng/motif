---
name: motif-retro-grid
description: "A perspective grid rolls in from the horizon under a soft glow, its distant lines merging cleanly without shimmer. A hero background or section divider with a synthwave streak. Use when the user asks for Retro Grid, 复古网格, grid, perspective, synthwave, retro, webgl, horizon or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/retro-grid"
  motif-item: "retro-grid"
  params-hash: "61982fcc"
---

# Retro Grid (复古网格)

A perspective grid rolls in from the horizon under a soft glow, its distant lines merging cleanly without shimmer. A hero background or section divider with a synthwave streak.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/retro-grid.tsx` — the component (`RetroGrid`); the tuned values are baked into its `defaults` object
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-retro-grid`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/retro-grid/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { RetroGrid } from '@/components/motif/retro-grid/retro-grid'

<RetroGrid />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `angle` | 68 | 68 | 40–80 deg (best 55–76) | Higher values lay the plane flatter |
| `cellSize` | 60 | 60 | 30–140 px (best 40–100) | Cell size |
| `lineWidth` | 1 | 1 | 0.5–2.5 px (best 0.7–1.6) | Line width |
| `lineColor` | #8b8bff | #8b8bff | color | Line color |
| `opacity` | 0.6 | 0.6 | 0.1–1 (best 0.35–0.9) | Line opacity |
| `glowColor` | #5b21b6 | #5b21b6 | color | Horizon glow |
| `glowAmount` | 0.6 | 0.6 | 0–1 | Glow strength |
| `fade` | 0.7 | 0.7 | 0–1 | Fades the bottom into the background for legibility |
| `speed` | 1 | 1 | 0–4 x (best 0.3–2) | Cells scrolled per second |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
