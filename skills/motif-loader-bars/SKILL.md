---
name: motif-loader-bars
description: "Five bar-based waiting animations: equalizer, wave, center-out voice, signal steps and a sweeping line. Count, thickness, color and speed are shared, for transcription, uploads, voice and any processing state. Use when the user asks for Bar Loaders, 条形加载器, loader, bars, equalizer, waveform, sweep, loading, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-bars"
  motif-item: "loader-bars"
  params-hash: "d4bd48d6"
---

# Bar Loaders (条形加载器)

Five bar-based waiting animations: equalizer, wave, center-out voice, signal steps and a sweeping line. Count, thickness, color and speed are shared, for transcription, uploads, voice and any processing state.

## When to use

- Use for processing states with an audio, data or stream feel. The sweep variant is the compact indeterminate line for card or button footers; use progress-bar once progress is known.

## Files

- `assets/loader-bars.tsx` — the component (`LoaderBars`); the tuned values are baked into its `defaults` object
- `assets/loader-bars.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-bars`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-bars/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderBars } from '@/components/motif/loader-bars/loader-bars'

<LoaderBars />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | equalizer | equalizer | equalizer / wave / voice / signal / sweep | Variant |
| `size` | 32 | 32 | 12–72 px (best 18–52) | The sweep line is four times as long |
| `color` | #8b5cf6 | #8b5cf6 | color | Color |
| `count` | 5 | 5 | 3–9 (best 4–7) | Bar count |
| `thickness` | 4 | 4 | 2–10 px (best 3–6) | Thickness |
| `speed` | 1 | 1 | 0.4–2.5 x (best 0.7–1.6) | Speed |
| `delay` | 0 | 0 | 0–1 s | Skips the loader for quick requests so it never flashes |
| `label` | Loading | Loading | ≤ 32 chars | Screen reader label |

## Rules

- Keep role="status" and the sr-only label; say what is being processed.
- Keep 4-7 bars; fewer looks sparse and more looks like a chart.
- Set delay to about 0.2 s for requests that are usually fast so the bars never flash.
- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tobiasahlin/SpinKit).
