---
name: motif-exposure-slider
description: "A camera-style exposure control: drag a ticker of notches that grow and brighten near the centre line, while a small ring above fills left or right with the value. For photo editors, camera apps and fine-grained settings. Use when the user asks for Exposure Dial, 曝光刻度尺, slider, ruler, exposure, camera, photo, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/exposure-slider"
  motif-item: "exposure-slider"
  params-hash: "ef0e5db0"
---

# Exposure Dial (曝光刻度尺)

A camera-style exposure control: drag a ticker of notches that grow and brighten near the centre line, while a small ring above fills left or right with the value. For photo editors, camera apps and fine-grained settings.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/exposure-slider.tsx` — the component (`ExposureSlider`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-exposure-slider`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/exposure-slider/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ExposureSlider } from '@/components/motif/exposure-slider/exposure-slider'

<ExposureSlider />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `min` | -20 | -20 | -50–-5 (best -30–-10) | Minimum |
| `max` | 20 | 20 | 5–50 (best 10–30) | Maximum |
| `step` | 1 | 1 | 1–5 (best 1–2) | Step |
| `accentColor` | #f43f5e | #f43f5e | color | Accent color |
| `showIndicator` | true | true | boolean | Value ring |
| `tickSpacing` | 13 | 13 | 9–21 px (best 11–17) | Notch spacing |
| `label` | Exposure | Exposure | ≤ 24 chars | Label |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
