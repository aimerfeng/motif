---
name: motif-fluid-ink-reveal
description: "Two stacked artworks where dragging stirs a real GPU fluid whose dye density acts as the mask: the hidden picture shows through swirling ink that slowly heals back. Made for portfolio heroes and before/after storytelling. Use when the user asks for Fluid Ink Reveal, 流体墨迹揭示, fluid, reveal, ink, mask, before-after, webgl, interactive, hero or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/fluid-ink-reveal"
  motif-item: "fluid-ink-reveal"
  params-hash: "49380a3c"
---

# Fluid Ink Reveal (流体墨迹揭示)

Two stacked artworks where dragging stirs a real GPU fluid whose dye density acts as the mask: the hidden picture shows through swirling ink that slowly heals back. Made for portfolio heroes and before/after storytelling.

## When to use

- A visual effect for moments that deserve attention.

## Files

- `assets/fluid-ink-reveal.tsx` — the component (`FluidInkReveal`); the tuned values are baked into its `defaults` object
- `assets/fluid-engine.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-fluid-ink-reveal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/fluid-ink-reveal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { FluidInkReveal } from '@/components/motif/fluid-ink-reveal/fluid-ink-reveal'

<FluidInkReveal />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `artwork` | nightfall | nightfall | nightfall / sketch | The two layers: day and night, or sketch and painting |
| `brushRadius` | 0.25 | 0.25 | 0.1–0.8 (best 0.15–0.5) | Brush radius |
| `heal` | 0.5 | 0.5 | 0.1–2 (best 0.25–1.2) | How fast the ink fades and the cover heals (the upstream dye dissipation) |
| `curl` | 30 | 30 | 0–50 | Higher values roll the ink into more curls |
| `edgeSoftness` | 0.3 | 0.3 | 0–1 | 0 is a crisp ink edge, 1 a misty blend |
| `edgeTint` | #ffc58a | #ffc58a | color | Edge tint |
| `autopilot` | true | true | boolean | Stirs slowly on its own and steps aside while someone drags |

## Rules

- Both layers must share the same framing and aspect ratio: the ink only swaps pixels in place, so misaligned pictures read as a glitch, not a reveal.
- The reveal is a pointer drag (or the autopilot); never hide essential content behind it, and keep children overlays pointer-events-none where they cover the stage so the drag still reaches it.
- Use it sparingly: one such effect per viewport.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from PavelDoGreat/WebGL-Fluid-Simulation).
