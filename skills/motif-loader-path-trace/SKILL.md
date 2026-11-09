---
name: motif-loader-path-trace
description: "A short dash runs endlessly along a faint closed track: an infinity sign, a squircle, a trefoil knot, a Reuleaux triangle and a square, plus a heartbeat line that draws itself and fades. Made for inline waits in buttons, cards and status rows where a plain ring feels generic. Use when the user asks for Path Trace Loaders, 描线加载器, loader, spinner, svg, path, infinity, heartbeat, loading, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-path-trace"
  motif-item: "loader-path-trace"
  params-hash: "5fbc4bde"
---

# Path Trace Loaders (描线加载器)

A short dash runs endlessly along a faint closed track: an infinity sign, a squircle, a trefoil knot, a Reuleaux triangle and a square, plus a heartbeat line that draws itself and fades. Made for inline waits in buttons, cards and status rows where a plain ring feels generic.

## When to use

- Use for short, indeterminate inline waits (roughly 1-10 s) in buttons, cards and status rows. For known progress use progress-bar or progress-ring; for a plain spinning ring use loader-orbits.

## Files

- `assets/loader-path-trace.tsx` — the component (`LoaderPathTrace`); the tuned values are baked into its `defaults` object
- `assets/loader-path-trace.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-path-trace`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-path-trace/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderPathTrace } from '@/components/motif/loader-path-trace/loader-path-trace'

<LoaderPathTrace />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `shape` | infinity | infinity | infinity / squircle / trefoil / reuleaux / square / cardio | Shape |
| `size` | 44 | 44 | 16–96 px (best 20–72) | Square shapes fill size × size; the infinity sign and heartbeat run wider so they carry the same weight |
| `color` | #38bdf8 | #38bdf8 | color | Color |
| `stroke` | 4 | 4 | 1.5–7 px (best 2.5–5.5) | Thinned automatically at small sizes so the outline never clogs |
| `dashLength` | 16 | 16 | 8–40 % (best 10–30) | Share of the whole outline; the heartbeat always draws in full |
| `trackOpacity` | 16 | 16 | 10–40 % (best 12–24) | The faint outline under the dash that keeps the shape readable |
| `speed` | 1 | 1 | 0.5–2 x (best 0.7–1.5) | Speed |
| `delay` | 0 | 0 | 0–1 s | Skips the loader for quick requests so it never flashes |
| `label` | Loading | Loading | ≤ 32 chars | Screen reader label |

## Rules

- Keep role="status" and the sr-only label; change the label text to say what is loading.
- Inside buttons and table rows use size 16-20 and stroke 2-2.5; the component thins the stroke at small sizes but a light stroke reads best.
- Use the heartbeat for health checks, monitoring and live connections; the closed shapes for generic work.
- Do not remove the prefers-reduced-motion block in the CSS: it parks the dash and breathes its opacity instead.
- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from GriffinJohnston/ldrs).
