---
name: motif-flickering-grid
description: "A field of tiny squares flickers at random like a quiet wall of status lights, with the odd cell lit in an accent color and the edges fading into the page. A backdrop for heroes, feature sections and data products. Use when the user asks for Flickering Grid, 闪烁网格, grid, pixels, flicker, canvas, ambient, technical or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/flickering-grid"
  motif-item: "flickering-grid"
  params-hash: "ee5f628c"
---

# Flickering Grid (闪烁网格)

A field of tiny squares flickers at random like a quiet wall of status lights, with the odd cell lit in an accent color and the edges fading into the page. A backdrop for heroes, feature sections and data products.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/flickering-grid.tsx` — the component (`FlickeringGrid`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-flickering-grid`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/flickering-grid/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { FlickeringGrid } from '@/components/motif/flickering-grid/flickering-grid'

<FlickeringGrid />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `squareSize` | 4 | 4 | 2–8 px (best 3–6) | Square size |
| `gap` | 6 | 6 | 2–14 px (best 3–10) | Gap |
| `shape` | square | square | square / round | Shape |
| `color` | #c3cde0 | #c3cde0 | color | Color |
| `accentColor` | #7dd3fc | #7dd3fc | color | Accent color |
| `accentShare` | 0.04 | 0.04 | 0–0.3 (best 0–0.12) | Share of squares drawn in the accent color; 0 turns it off |
| `maxOpacity` | 0.6 | 0.6 | 0.15–1 (best 0.35–0.85) | Max opacity |
| `fade` | 0.6 | 0.6 | 0–1 (best 0.3–0.85) | Higher values dim the edges and keep the center |
| `flickerRate` | 0.4 | 0.4 | 0.05–2 (best 0.15–1) | How often each square changes brightness, per second |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
