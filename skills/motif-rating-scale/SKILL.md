---
name: motif-rating-scale
description: "Feedback scales other than stars: a joined 0–10 NPS row with end labels, five faces that tint from red to green, or a slider whose face and label change with the value. Made for NPS surveys, post-task ratings and support feedback. Use when the user asks for Feedback Scale, 满意度评分刻度, nps, rating, feedback, survey, faces, slider, radio, form or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/rating-scale"
  motif-item: "rating-scale"
  params-hash: "57c077d4"
---

# Feedback Scale (满意度评分刻度)

Feedback scales other than stars: a joined 0–10 NPS row with end labels, five faces that tint from red to green, or a slider whose face and label change with the value. Made for NPS surveys, post-task ratings and support feedback.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/rating-scale.tsx` — the component (`RatingScale`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-rating-scale`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/rating-scale/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { RatingScale } from '@/components/motif/rating-scale/rating-scale'

<RatingScale />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `type` | nps | nps | nps / faces / slider | Type |
| `max` | 10 | 10 | 5–10 (best 5–10) | Number scale only; starts at 0 |
| `lowLabel` | Not likely | Not likely | ≤ 20 chars | Low label |
| `highLabel` | Very Likely | Very Likely | ≤ 20 chars | High label |
| `colorScale` | true | true | boolean | The picked option is tinted by its score; text on it uses white or near-black, whichever contrasts more |
| `showValueLabel` | true | true | boolean | Faces and slider show the word for the value |
| `size` | 36 | 36 | 30–48 px (best 32–44) | Size |
| `radius` | 6 | 6 | 0–18 px (best 4–12) | Outer corners of the number scale |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
