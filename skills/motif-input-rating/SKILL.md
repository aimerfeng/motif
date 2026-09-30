---
name: motif-input-rating
description: "Icons light up to the pointer and swell on hover; on click the chosen icons pop one after another like a wave. Star, heart and bolt shapes with optional half steps. Made for review forms, feedback prompts and product pages. Use when the user asks for Rating, 评分, rating, stars, review, feedback, slider, a11y, spring or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-rating"
  motif-item: "input-rating"
  params-hash: "ff8f3458"
---

# Rating (评分)

Icons light up to the pointer and swell on hover; on click the chosen icons pop one after another like a wave. Star, heart and bolt shapes with optional half steps. Made for review forms, feedback prompts and product pages.

## When to use

- Use for collecting a 1 to N opinion (reviews, feedback, difficulty). For read-only display of an average pass readOnly.

## Files

- `assets/input-rating.tsx` — the component (`InputRating`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-rating/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputRating } from '@/components/motif/input-rating/input-rating'

<InputRating />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `icon` | star | star | star / heart / bolt | Icon |
| `color` | #fbbf24 | #fbbf24 | color | Color |
| `size` | 40 | 40 | 24–64 px (best 30–52) | Icon size |
| `count` | 5 | 5 | 3–10 (best 3–7) | Count |
| `allowHalf` | false | false | boolean | Allow half steps |
| `gap` | 6 | 6 | 0–20 px (best 2–12) | Gap |
| `spring` | visualDuration 0.3, bounce 0.5 | visualDuration 0.3, bounce 0.5 | visualDuration s, bounce 0–1 | Spring |

## Rules

- The component is one role="slider" (not N buttons): arrows step, Home clears, End maxes. Announce the meaning next to it (for example "Loved it") in visible text, not only color.
- Clicking the current value clears the rating. Keep count between 3 and 10.
- Controlled: value + onValueChange. Uncontrolled: defaultValue.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
