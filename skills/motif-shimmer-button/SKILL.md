---
name: motif-shimmer-button
description: "A soft sliver of light travels the button’s edge, gliding along the long sides and turning at the ends, over a faint inner glow. Made for the one primary action on a page, like a waitlist or a demo booking. Use when the user asks for Shimmer Button, 微光按钮, button, shimmer, glow, border, cta, conic-gradient or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/shimmer-button"
  motif-item: "shimmer-button"
  params-hash: "d4063de1"
---

# Shimmer Button (微光按钮)

A soft sliver of light travels the button’s edge, gliding along the long sides and turning at the ends, over a faint inner glow. Made for the one primary action on a page, like a waitlist or a demo booking.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/shimmer-button.tsx` — the component (`ShimmerButton`); the tuned values are baked into its `defaults` object
- `assets/shimmer-button.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-shimmer-button`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/shimmer-button/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ShimmerButton } from '@/components/motif/shimmer-button/shimmer-button'

<ShimmerButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Get early access | Get early access | ≤ 28 chars | Label |
| `shimmerColor` | #ffffff | #ffffff | color | Shimmer color |
| `background` | #0e0e14 | #0e0e14 | color | The label switches between light and dark ink to stay readable |
| `radius` | 100 | 100 | 4–100 px (best 10–100) | Corner radius |
| `shimmerSize` | 1.8 | 1.8 | 0.5–3 px (best 0.8–2.4) | How wide the band along the edge that lets the light through is |
| `spread` | 110 | 110 | 30–160 deg (best 60–130) | Angle of the wedge of light |
| `duration` | 3 | 3 | 1.5–8 s (best 2–5) | Time to cross one long side; a full lap takes twice as long |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
