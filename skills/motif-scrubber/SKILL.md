---
name: motif-scrubber
description: "The whole bar is the handle: press anywhere and the value follows while a tinted fill spreads behind fine tick marks and tabular digits. Made for photo adjustments, parameter panels and playback progress. Use when the user asks for Scrubber, 拖拽滑块, slider, scrubber, range, value, a11y, inspector or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/scrubber"
  motif-item: "scrubber"
  params-hash: "c0db4a8d"
---

# Scrubber (拖拽滑块)

The whole bar is the handle: press anywhere and the value follows while a tinted fill spreads behind fine tick marks and tabular digits. Made for photo adjustments, parameter panels and playback progress.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/scrubber.tsx` — the component (`Scrubber`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-scrubber`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/scrubber/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Scrubber } from '@/components/motif/scrubber/scrubber'

<Scrubber />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | #f97316 | #f97316 | color | Accent |
| `height` | 44 | 44 | 32–64 px (best 36–56) | Height |
| `radius` | 12 | 12 | 4–32 px (best 6–20) | Corner radius |
| `ticks` | 11 | 11 | 0–24 (best 0–19) | 0 hides the ticks |
| `spring` | visualDuration 0.25, bounce 0.1 | visualDuration 0.25, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Handle spring |
| `label` | Exposure | Exposure | ≤ 24 chars | Label |

## Rules

- The bar renders role="slider" with arrow keys, Shift+arrow for 10 steps, Home and End. Always pass a meaningful label; it doubles as the accessible name.
- Controlled: value + onValueChange. Uncontrolled: defaultValue. min, max, step and decimals describe the scale; the visible digits are tabular.
- Stack several scrubbers with an 8–12px gap in one panel; keep a single accent color across the group.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
