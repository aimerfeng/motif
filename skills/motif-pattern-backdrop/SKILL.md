---
name: motif-pattern-backdrop
description: "An SVG grid, dot, honeycomb or diagonal-stripe texture that fades out at the edges while a few cells light up and dim at random. The quiet backdrop behind hero copy, pricing tables and empty states. Use when the user asks for Pattern Backdrop, 纹样底纹, grid, dots, hexagon, stripes, svg, pattern, ambient or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pattern-backdrop"
  motif-item: "pattern-backdrop"
  params-hash: "4b94896a"
---

# Pattern Backdrop (纹样底纹)

An SVG grid, dot, honeycomb or diagonal-stripe texture that fades out at the edges while a few cells light up and dim at random. The quiet backdrop behind hero copy, pricing tables and empty states.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/pattern-backdrop.tsx` — the component (`PatternBackdrop`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-pattern-backdrop`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pattern-backdrop/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PatternBackdrop } from '@/components/motif/pattern-backdrop/pattern-backdrop'

<PatternBackdrop />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `pattern` | grid | grid | grid / dots / hexagon / stripes | Pattern |
| `cellSize` | 40 | 40 | 16–96 px (best 24–64) | Honeycomb radius is 0.6× this; stripe spacing is 1/4 of it |
| `strokeWidth` | 1 | 1 | 0.5–3 px (best 0.5–2) | Dot radius in dot mode |
| `dashed` | false | false | boolean | Dashed |
| `color` | #9ca3af | #9ca3af | color | Color |
| `mask` | radial | radial | radial / linear / none | Fade mask |
| `glow` | false | false | boolean | Lit cells use a glowing radial fill |
| `highlightCount` | 30 | 30 | 0–60 (best 10–45) | Stripes have no cells and stay still |
| `highlightDuration` | 4 | 4 | 1–8 s (best 2–6) | Fade duration |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
