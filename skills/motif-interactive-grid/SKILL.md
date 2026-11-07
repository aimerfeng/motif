---
name: motif-interactive-grid
description: "A fine-lined grid sits in the background; cells light up under the pointer and dim slowly, leaving a faint trail behind it. A backdrop for heroes, sign-in pages and developer tools. Use when the user asks for Interactive Grid, 感应网格, grid, hover, pointer, trail, canvas, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/interactive-grid"
  motif-item: "interactive-grid"
  params-hash: "5cf41ce6"
---

# Interactive Grid (感应网格)

A fine-lined grid sits in the background; cells light up under the pointer and dim slowly, leaving a faint trail behind it. A backdrop for heroes, sign-in pages and developer tools.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/interactive-grid.tsx` — the component (`InteractiveGrid`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-interactive-grid`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/interactive-grid/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InteractiveGrid } from '@/components/motif/interactive-grid/interactive-grid'

<InteractiveGrid />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `cellSize` | 44 | 44 | 20–96 px (best 28–72) | Cell size |
| `skew` | -10 | -10 | -20–20 deg (best -14–14) | Shears the grid; 0 keeps it square |
| `lineColor` | #c7d2fe | #c7d2fe | color | Line color |
| `lineOpacity` | 0.14 | 0.14 | 0.03–0.4 (best 0.06–0.24) | Line opacity |
| `fade` | 0.7 | 0.7 | 0–1 (best 0.4–0.9) | Higher values dim the edges more |
| `highlightColor` | #818cf8 | #818cf8 | color | Highlight color |
| `highlightOpacity` | 0.45 | 0.45 | 0.1–0.9 (best 0.25–0.7) | Highlight strength |
| `brush` | 1 | 1 | 0–2.5 x (best 0–1.6) | How many neighboring cells light up; 0 lights one cell |
| `trail` | 1.5 | 1.5 | 0.2–3 s (best 0.6–2) | How long a cell takes to dim |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
