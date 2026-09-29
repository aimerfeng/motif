---
name: motif-metaballs
description: "Colorful blobs melt together when close and pull apart into strands, like a lava lamp. Made for hero backgrounds. Use when the user asks for Metaballs, 融球, metaballs, blobs, lava, shader, webgl, background or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/metaballs"
  motif-item: "metaballs"
  params-hash: "baba8d20"
---

# Metaballs (融球)

Colorful blobs melt together when close and pull apart into strands, like a lava lamp. Made for hero backgrounds.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/metaballs.tsx` — the component (`MetaballsBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/metaballs/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MetaballsBackground } from '@/components/motif/metaballs/metaballs'

<MetaballsBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #6e33cc, #ff5500, #ffc105, #ffc800, #f585ff | #6e33cc, #ff5500, #ffc105, #ffc800, #f585ff | 1–8 colors | Each blob takes one of these, up to 8 |
| `colorBack` | #000000 | #000000 | color | Background |
| `count` | 12 | 12 | 2–20 | Count |
| `size` | 0.6 | 0.6 | 0.1–1 | Size |
| `speed` | 1 | 1 | 0–3 x (best 0.2–2) | Speed |
| `scale` | 1 | 1 | 0.4–4 x (best 0.6–3) | Scale |
| `rotation` | 0 | 0 | 0–360 deg | Rotation |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
