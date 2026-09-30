---
name: motif-progress-ring
description: "A gradient-stroked ring whose arc and center number ride one spring. Full ring, 270-degree gauge or tick dial, with optional glow. For goals, storage usage and scores. Use when the user asks for Progress Ring, 环形进度, progress, ring, gauge, radial, dial, svg, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/progress-ring"
  motif-item: "progress-ring"
  params-hash: "5d205392"
---

# Progress Ring (环形进度)

A gradient-stroked ring whose arc and center number ride one spring. Full ring, 270-degree gauge or tick dial, with optional glow. For goals, storage usage and scores.

## When to use

- Use for a single known percentage: goals, quotas, scores. For a linear flow such as uploads use progress-bar.

## Files

- `assets/progress-ring.tsx` — the component (`ProgressRing`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/progress-ring/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ProgressRing } from '@/components/motif/progress-ring/progress-ring'

<ProgressRing />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | ring | ring | ring / gauge / dial | Shape |
| `size` | 168 | 168 | 80–260 px (best 110–220) | Size |
| `thickness` | 12 | 12 | 4–28 px (best 8–18) | Thickness |
| `color` | #8b5cf6 | #8b5cf6 | color | Start color |
| `colorEnd` | #ec4899 | #ec4899 | color | End color |
| `cap` | round | round | round / butt | Line cap |
| `glow` | true | true | boolean | Glow |
| `spring` | visualDuration 0.9, bounce 0 | visualDuration 0.9, bounce 0 | visualDuration s, bounce 0–1 | Fill spring |
| `label` | Daily goal | Daily goal | ≤ 24 chars | Label |
| `showValue` | true | true | boolean | Show center value |

## Rules

- Pass value as 0-100; the arc and the number animate together from one spring, so do not animate the value yourself.
- The graphic is aria-hidden; the wrapper carries role="progressbar" with the label as its accessible name.
- Keep the gradient endpoints close in lightness so the arc does not look striped.
- Never move backwards; ease the bar but keep it honest.
- Expose value with role="progressbar" and aria-valuenow.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
