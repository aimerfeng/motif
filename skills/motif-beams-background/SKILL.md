---
name: motif-beams-background
description: "Soft, out-of-focus diagonal beams drift up from the bottom and pulse gently, their colors stepping from one beam to the next like an aurora seen through frosted glass. A backdrop for dark heroes and launch pages. Use when the user asks for Beams Background, 光束背景, beams, aurora, glow, blur, canvas, gradient or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/beams-background"
  motif-item: "beams-background"
  params-hash: "182c1af1"
---

# Beams Background (光束背景)

Soft, out-of-focus diagonal beams drift up from the bottom and pulse gently, their colors stepping from one beam to the next like an aurora seen through frosted glass. A backdrop for dark heroes and launch pages.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/beams-background.tsx` — the component (`BeamsBackground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-beams-background`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/beams-background/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { BeamsBackground } from '@/components/motif/beams-background/beams-background'

<BeamsBackground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `count` | 30 | 30 | 8–50 (best 16–40) | Beam count |
| `beamWidth` | 1 | 1 | 0.5–2 x (best 0.7–1.5) | Beam width |
| `angle` | -30 | -30 | -60–60 deg (best -45–45) | Negative leans down to the right, positive down to the left |
| `colors` | #22d3ee, #3b82f6, #8b5cf6 | #22d3ee, #3b82f6, #8b5cf6 | 1–5 colors | Beams step through these colors in order |
| `background` | #09090d | #09090d | color | Background |
| `intensity` | 1 | 1 | 0.3–1.6 x (best 0.6–1.3) | Intensity |
| `blur` | 34 | 34 | 12–64 px (best 22–48) | Blur radius on the beams |
| `speed` | 1 | 1 | 0.2–3 x (best 0.5–2) | Speed |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).
