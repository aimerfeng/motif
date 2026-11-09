---
name: motif-lens-magnifier
description: "A round lens follows the pointer over an image or card and magnifies what is beneath it, scaling in and out at the edges; it can also be pinned in place. Made for product shots, maps and detailed illustrations. Use when the user asks for Lens Magnifier, 放大镜, lens, zoom, magnifier, image, hover or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/lens-magnifier"
  motif-item: "lens-magnifier"
  params-hash: "eb045a74"
---

# Lens Magnifier (放大镜)

A round lens follows the pointer over an image or card and magnifies what is beneath it, scaling in and out at the edges; it can also be pinned in place. Made for product shots, maps and detailed illustrations.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/lens-magnifier.tsx` — the component (`Lens`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-lens-magnifier`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/lens-magnifier/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Lens } from '@/components/motif/lens-magnifier/lens-magnifier'

<Lens />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `zoomFactor` | 1.3 | 1.3 | 1–4 x (best 1.3–2.5) | Zoom factor |
| `lensSize` | 170 | 170 | 60–300 px (best 120–220) | Lens size |
| `duration` | 0.1 | 0.1 | 0–1 s | Appear duration |
| `isStatic` | false | false | boolean | The lens stays at the given position |
| `lensColor` | #000000 | #000000 | color | Mask only; keep it opaque |
| `ariaLabel` | Zoom Area | Zoom Area | ≤ 40 chars | Aria label |

## Rules

- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
