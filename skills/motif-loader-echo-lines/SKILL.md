---
name: motif-loader-echo-lines
description: "Thin bars turning with staggered delays so each leaves a fading echo: a pinwheel that sweeps round, a miyagi sweep that swings back and forth, and a hatch stroke that stretches along the edges of a square. For technical and editorial interfaces that want a crisp monoline loader. Use when the user asks for Echo Line Loaders, 残影线条加载器, loader, spinner, lines, echo, monoline, loading, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-echo-lines"
  motif-item: "loader-echo-lines"
  params-hash: "e32d81b6"
---

# Echo Line Loaders (残影线条加载器)

Thin bars turning with staggered delays so each leaves a fading echo: a pinwheel that sweeps round, a miyagi sweep that swings back and forth, and a hatch stroke that stretches along the edges of a square. For technical and editorial interfaces that want a crisp monoline loader.

## When to use

- Indeterminate waits longer than ~300 ms: fetching, processing, generating.

## Files

- `assets/loader-echo-lines.tsx` — the component (`LoaderEchoLines`); the tuned values are baked into its `defaults` object
- `assets/loader-echo-lines.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-echo-lines`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-echo-lines/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderEchoLines } from '@/components/motif/loader-echo-lines/loader-echo-lines'

<LoaderEchoLines />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | pinwheel | pinwheel | pinwheel / miyagi / hatch | Variant |
| `size` | 35 | 35 | 16–80 px (best 24–56) | Size |
| `color` | #f4f4f5 | #f4f4f5 | color | Color |
| `stroke` | 3.5 | 3.5 | 1–8 px (best 2–5) | Stroke |
| `echoes` | 5 | 5 | 1–8 (best 3–6) | Not used by Hatch |
| `falloff` | 0.2 | 0.2 | 0.08–0.4 (best 0.12–0.3) | How much dimmer each echo is than the one before |
| `speed` | 0.9 | 0.9 | 0.4–3 s (best 0.6–1.8) | Duration |
| `label` | Loading | Loading | ≤ 32 chars | Screen reader label |

## Rules

- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from GriffinJohnston/ldrs).
