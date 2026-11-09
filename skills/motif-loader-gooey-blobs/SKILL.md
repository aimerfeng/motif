---
name: motif-loader-gooey-blobs
description: "Three SVG goo-filter loaders: two blobs that split and re-merge, a droplet flowing between the corners of a triangle, and a stream of beads fusing as they pass. For playful brands, creative tools and splash screens. Use when the user asks for Gooey Loaders, 黏液融合加载器, loader, gooey, blob, metaball, svg-filter, loading or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-gooey-blobs"
  motif-item: "loader-gooey-blobs"
  params-hash: "1675b8aa"
---

# Gooey Loaders (黏液融合加载器)

Three SVG goo-filter loaders: two blobs that split and re-merge, a droplet flowing between the corners of a triangle, and a stream of beads fusing as they pass. For playful brands, creative tools and splash screens.

## When to use

- Indeterminate waits longer than ~300 ms: fetching, processing, generating.

## Files

- `assets/loader-gooey-blobs.tsx` — the component (`LoaderGooeyBlobs`); the tuned values are baked into its `defaults` object
- `assets/loader-gooey-blobs.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-gooey-blobs`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-gooey-blobs/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderGooeyBlobs } from '@/components/motif/loader-gooey-blobs/loader-gooey-blobs'

<LoaderGooeyBlobs />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | jelly | jelly | jelly / jellyTriangle / mirage | Variant |
| `size` | 48 | 48 | 24–120 px (best 32–80) | Size |
| `color` | #a78bfa | #a78bfa | color | Color |
| `speed` | 1 | 1 | 0.4–2 x (best 0.7–1.4) | Speed |
| `label` | Loading | Loading | ≤ 32 chars | Screen reader label |

## Rules

- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from GriffinJohnston/ldrs).
