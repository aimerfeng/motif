---
name: motif-text-split-flap
description: "Each character rolls vertically through a short ramp of glyphs before landing on its target, staggered across the string, like a departure board or an odometer. Plays on mount, on view or on hover; suits flight-board headings, prices, scores and live stats. Use when the user asks for Split-Flap Roll, 翻牌字, text, split-flap, odometer, roll, counter, stagger, motion or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource/archivo-black, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-split-flap"
  motif-item: "text-split-flap"
  params-hash: "f0613c50"
---

# Split-Flap Roll (翻牌字)

Each character rolls vertically through a short ramp of glyphs before landing on its target, staggered across the string, like a departure board or an odometer. Plays on mount, on view or on hover; suits flight-board headings, prices, scores and live stats.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-split-flap.tsx` — the component (`TextSplitFlap`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-split-flap`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource/archivo-black clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-split-flap/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource/archivo-black/400.css';` to the global stylesheet.
4. Use it:

```tsx
import { TextSplitFlap } from '@/components/motif/text-split-flap/text-split-flap'

<TextSplitFlap />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | 042,918 | 042,918 | ≤ 24 chars | Text |
| `glyphs` |  |  | ≤ 64 chars | Leave empty to use the characters of the text |
| `rampLength` | 4 | 4 | 1–12 (best 2–8) | Ramp length |
| `duration` | 500 | 500 | 150–2000 ms (best 300–1000) | Duration |
| `stagger` | 40 | 40 | 0–200 ms (best 10–100) | Stagger |
| `direction` | up | up | up / down | Direction |
| `trigger` | mount | mount | mount / inView / hover | Always plays once on mount; hover replays only on devices with a fine pointer |
| `font` | mono | mono | mono / sans / display | Font |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
