---
name: motif-spotlight
description: "A soft pool of light trails the pointer across a card and fades when it leaves. Made for feature cards, pricing tiles and dark content panels. Use when the user asks for Spotlight, 聚光, spotlight, glow, pointer, hover, card, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/spotlight"
  motif-item: "spotlight"
  params-hash: "d65972bd"
---

# Spotlight (聚光)

A soft pool of light trails the pointer across a card and fades when it leaves. Made for feature cards, pricing tiles and dark content panels.

## When to use

- Playful or editorial pages where the pointer is part of the experience.

## Files

- `assets/spotlight.tsx` — the component (`Spotlight`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/spotlight/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Spotlight } from '@/components/motif/spotlight/spotlight'

<Spotlight />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `size` | 320 | 320 | 80–700 px (best 180–480) | Size |
| `color` | #a5b4fc | #a5b4fc | color | Color |
| `intensity` | 0.42 | 0.42 | 0.05–0.8 (best 0.2–0.6) | Intensity |
| `blur` | 24 | 24 | 0–60 px (best 12–40) | Blur radius on the edge of the light |
| `spring` | visualDuration 0.3, bounce 0 | visualDuration 0.3, bounce 0 | visualDuration s, bounce 0–1 | Longer durations make the light trail behind |

## Rules

- Never hide the system cursor on touch devices or in forms.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
