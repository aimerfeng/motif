---
name: motif-loader-comet-sweep
description: "Three spinners with soft tails: a gradient disc that trails a comet, a head that flings a tail of shrinking echoes and snaps back, and a ring wiped on and off by two half-moons. Suits media players, uploads and dark dashboards. Use when the user asks for Comet Sweep Loaders, 彗尾扫光加载器, loader, spinner, comet, tail, glow, loading or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-comet-sweep"
  motif-item: "loader-comet-sweep"
  params-hash: "d3b3c8fc"
---

# Comet Sweep Loaders (彗尾扫光加载器)

Three spinners with soft tails: a gradient disc that trails a comet, a head that flings a tail of shrinking echoes and snaps back, and a ring wiped on and off by two half-moons. Suits media players, uploads and dark dashboards.

## When to use

- Indeterminate waits longer than ~300 ms: fetching, processing, generating.

## Files

- `assets/loader-comet-sweep.tsx` — the component (`LoaderCometSweep`); the tuned values are baked into its `defaults` object
- `assets/loader-comet-sweep.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-comet-sweep`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-comet-sweep/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderCometSweep } from '@/components/motif/loader-comet-sweep/loader-comet-sweep'

<LoaderCometSweep />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | disc | disc | disc / echo / wipe | Variant |
| `size` | 56 | 56 | 20–110 px (best 28–88) | Size |
| `thickness` | 6 | 6 | 2–12 px (best 3–9) | Applies to the disc and wipe variants |
| `color` | #0dc5c1 | #0dc5c1 | color | Color |
| `tailLength` | 0.42 | 0.42 | 0.2–0.9 (best 0.3–0.7) | Where the disc gradient fades out |
| `glow` | 0.3 | 0.3 | 0–1 | Glow |
| `speed` | 1 | 1 | 0.4–2.5 x (best 0.7–1.6) | Speed |
| `label` | Loading | Loading | ≤ 32 chars | Screen reader label |

## Rules

- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from lukehaas/css-loaders).
