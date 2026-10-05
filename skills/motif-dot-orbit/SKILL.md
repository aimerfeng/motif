---
name: motif-dot-orbit
description: "In a tidy grid, every dot orbits its own tiny path while colors step through the palette. A rhythmic backdrop with a technical feel. Use when the user asks for Dot Orbit, 点阵轨道, dots, grid, orbit, pattern, shader, webgl or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @paper-design/shaders-react, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dot-orbit"
  motif-item: "dot-orbit"
  params-hash: "d15db4fc"
---

# Dot Orbit (点阵轨道)

In a tidy grid, every dot orbits its own tiny path while colors step through the palette. A rhythmic backdrop with a technical feel.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/dot-orbit.tsx` — the component (`DotOrbitBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dot-orbit`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @paper-design/shaders-react clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dot-orbit/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DotOrbitBackground } from '@/components/motif/dot-orbit/dot-orbit'

<DotOrbitBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `colors` | #ffc96b, #ff6200, #ff2f00, #421100, #1a0000 | #ffc96b, #ff6200, #ff2f00, #421100, #1a0000 | 1–10 colors | Colors |
| `colorBack` | #000000 | #000000 | color | Background |
| `size` | 1 | 1 | 0.1–1 | Dot size |
| `sizeRange` | 0 | 0 | 0–1 | Size variation |
| `spreading` | 1 | 1 | 0.1–1 | Orbit spread |
| `stepsPerColor` | 4 | 4 | 1–4 | Steps per color |
| `speed` | 1.5 | 1.5 | 0–6 x (best 0.1–3) | Speed |
| `scale` | 1 | 1 | 0.3–3 x (best 0.3–2) | Scale |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: Apache-2.0. Keep the header comments in each file (originally from paper-design/shaders).
