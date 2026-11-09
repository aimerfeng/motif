---
name: motif-loader-radial-bloom
description: "Four choreographies that breathe out from a centre: four dots spinning as they meet and part, eight dots flashing out around a ring, ten petals reaching out in turn, and two counter-rotating rings trading orbits. For AI, search and media apps. Use when the user asks for Radial Bloom Loaders, 放射绽放加载器, loader, spinner, radial, dots, loading, css or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-radial-bloom"
  motif-item: "loader-radial-bloom"
  params-hash: "f7a4e2f6"
---

# Radial Bloom Loaders (放射绽放加载器)

Four choreographies that breathe out from a centre: four dots spinning as they meet and part, eight dots flashing out around a ring, ten petals reaching out in turn, and two counter-rotating rings trading orbits. For AI, search and media apps.

## When to use

- Indeterminate waits longer than ~300 ms: fetching, processing, generating.

## Files

- `assets/loader-radial-bloom.tsx` — the component (`LoaderRadialBloom`); the tuned values are baked into its `defaults` object
- `assets/loader-radial-bloom.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-radial-bloom`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-radial-bloom/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderRadialBloom } from '@/components/motif/loader-radial-bloom/loader-radial-bloom'

<LoaderRadialBloom />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | meetup | meetup | meetup / pan-out / reach / in-and-out | Variant |
| `count` | 0 | 0 | 0–16 | Zero uses the variant count (4 / 8 / 10 / 5) |
| `radius` | 30 | 30 | 12–60 px | Radius |
| `dotSize` | 10 | 10 | 4–20 px | Dot size |
| `color` | #8b5cf6 | #8b5cf6 | color | Color |
| `speed` | 1 | 1 | 0.4–2.5 x | Speed |
| `spin` | true | true | boolean | Spin |
| `label` | Loading | Loading | ≤ 32 chars | Screen reader label |

## Rules

- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from jh3y/whirl).
