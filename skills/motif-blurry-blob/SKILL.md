---
name: motif-blurry-blob
description: "Sea-glass teal, sky blue and mint blobs drift and breathe over a near-white mint ground, blending where they overlap. Pure CSS and nearly free to run. A soft backdrop for hero sections, cards and email headers. Use when the user asks for Blurry Blobs, 晕染光斑, blob, gradient, soft, pastel, css, light or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/blurry-blob"
  motif-item: "blurry-blob"
  params-hash: "a114f89e"
---

# Blurry Blobs (晕染光斑)

Sea-glass teal, sky blue and mint blobs drift and breathe over a near-white mint ground, blending where they overlap. Pure CSS and nearly free to run. A soft backdrop for hero sections, cards and email headers.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/blurry-blob.tsx` — the component (`BlurryBlob`); the tuned values are baked into its `defaults` object
- `assets/blurry-blob.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-blurry-blob`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/blurry-blob/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { BlurryBlob } from '@/components/motif/blurry-blob/blurry-blob'

<BlurryBlob />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `background` | #f1fbf8 | #f1fbf8 | color | Light grounds multiply, dark grounds switch to screen blending |
| `colors` | #5eead4, #7dd3fc, #a7f3d0, #bae6fd | #5eead4, #7dd3fc, #a7f3d0, #bae6fd | 2–5 colors | One blob per color, up to five |
| `opacity` | 0.75 | 0.75 | 0.3–1 (best 0.5–0.95) | Intensity |
| `blur` | 80 | 80 | 30–140 px (best 50–110) | Blur |
| `size` | 1 | 1 | 0.6–1.5 x (best 0.8–1.3) | Blob size |
| `drift` | 1 | 1 | 0–2 x (best 0.5–1.6) | Drift |
| `speed` | 1 | 1 | 0.3–2.5 x (best 0.5–1.8) | Speed |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).
