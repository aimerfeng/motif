---
name: motif-loader-orbits
description: "Five circular waiting animations: stretching arc, chasing dots, fading ticks, orbiting pair and pulsing ripples. One set of size, color, thickness and speed controls, an optional show delay, a screen-reader label, and a slow breathing fallback for reduced motion. Use when the user asks for Orbit Loaders, 轨道加载器, loader, spinner, ring, orbit, loading, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-orbits"
  motif-item: "loader-orbits"
  params-hash: "1cf6c14c"
---

# Orbit Loaders (轨道加载器)

Five circular waiting animations: stretching arc, chasing dots, fading ticks, orbiting pair and pulsing ripples. One set of size, color, thickness and speed controls, an optional show delay, a screen-reader label, and a slow breathing fallback for reduced motion.

## When to use

- Use for short, indeterminate waits (roughly 1-10 s). For known progress use progress-bar or progress-ring; for content-shaped waits prefer skeleton-shimmer.

## Files

- `assets/loader-orbits.tsx` — the component (`LoaderOrbits`); the tuned values are baked into its `defaults` object
- `assets/loader-orbits.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-orbits/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderOrbits } from '@/components/motif/loader-orbits/loader-orbits'

<LoaderOrbits />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | ring | ring | ring / chase / fade / orbit / pulsar | Variant |
| `size` | 44 | 44 | 16–96 px (best 20–72) | Size |
| `color` | #8b5cf6 | #8b5cf6 | color | Color |
| `thickness` | 4 | 4 | 2–7 px (best 3–5.5) | Scales the arc stroke, dot diameter and tick width |
| `speed` | 1 | 1 | 0.4–2.5 x (best 0.7–1.6) | Speed |
| `delay` | 0 | 0 | 0–1 s | Skips the loader for quick requests so it never flashes |
| `label` | Loading | Loading | ≤ 32 chars | Screen reader label |

## Rules

- Keep role="status" and the sr-only label; change the label text to say what is loading.
- Set delay to about 0.2 s for requests that are usually fast so the loader never flashes.
- Do not remove the prefers-reduced-motion block in the CSS: it freezes the shape and breathes the opacity instead.
- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from GriffinJohnston/ldrs).
