---
name: motif-light-rays
description: "A few soft shafts of light hang from above, swaying gently and brightening one after another like daylight through a high window. A calm backdrop for heroes, sign-in screens and launch pages. Use when the user asks for Light Rays, 天光, light, rays, glow, ambient, blur, atmosphere or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/light-rays"
  motif-item: "light-rays"
  params-hash: "2c73724f"
---

# Light Rays (天光)

A few soft shafts of light hang from above, swaying gently and brightening one after another like daylight through a high window. A calm backdrop for heroes, sign-in screens and launch pages.

## When to use

- Full-bleed hero or section backgrounds where slow ambient motion supports the headline.
- Behind short, large text — not behind dense body copy, tables or forms.

## Files

- `assets/light-rays.tsx` — the component (`LightRays`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-light-rays`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/light-rays/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LightRays } from '@/components/motif/light-rays/light-rays'

<LightRays />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `count` | 9 | 9 | 3–16 (best 5–12) | Ray count |
| `width` | 1 | 1 | 0.5–2 x (best 0.7–1.5) | Scales with the container width |
| `length` | 100 | 100 | 50–130 % (best 70–120) | Share of the container height |
| `angle` | 14 | 14 | -30–30 deg (best -22–22) | Overall lean; positive values light from the upper right |
| `spread` | 8 | 8 | 0–36 deg (best 2–28) | How far each ray may stray from the overall angle; 0 keeps them parallel |
| `color` | #9cc9ff | #9cc9ff | color | Color |
| `intensity` | 0.85 | 0.85 | 0.2–1.2 (best 0.5–1) | Intensity |
| `blur` | 22 | 22 | 6–48 px (best 12–36) | Blur radius on the edges of each ray |
| `glow` | 0.45 | 0.45 | 0–1 | Two faint pools of scattered light near the top |
| `speed` | 1 | 1 | 0.2–3 x (best 0.5–1.8) | How quickly rays sway and fade |

## Rules

- Use at most one animated background per viewport.
- Check text contrast against the lightest and darkest parts; add a scrim if needed.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
