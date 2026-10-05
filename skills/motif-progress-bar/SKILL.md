---
name: motif-progress-bar
description: "A determinate progress bar: the fill glides on a spring with the number in step, in gradient, striped, segmented or glowing styles. Leave value empty for an indeterminate sweep. Full progressbar semantics included. Use when the user asks for Progress Bar, 进度条, progress, bar, upload, determinate, indeterminate, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/progress-bar"
  motif-item: "progress-bar"
  params-hash: "8c2c8bd8"
---

# Progress Bar (进度条)

A determinate progress bar: the fill glides on a spring with the number in step, in gradient, striped, segmented or glowing styles. Leave value empty for an indeterminate sweep. Full progressbar semantics included.

## When to use

- Use only when real progress is known (uploads, installs, multi-step flows). Leave value undefined for an honest indeterminate sweep; for unknown waits without a bar use a loader-* item.

## Files

- `assets/progress-bar.tsx` — the component (`ProgressBar`); the tuned values are baked into its `defaults` object
- `assets/progress-bar.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-progress-bar`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/progress-bar/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ProgressBar } from '@/components/motif/progress-bar/progress-bar'

<ProgressBar />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | gradient | gradient | gradient / solid / striped / segmented / glow | Variant |
| `thickness` | 10 | 10 | 4–24 px (best 6–16) | Thickness |
| `color` | #8b5cf6 | #8b5cf6 | color | Color |
| `colorEnd` | #ec4899 | #ec4899 | color | Used by gradient, striped and glow |
| `radius` | 24 | 24 | 0–24 px | At or above half the thickness it becomes a pill |
| `spring` | visualDuration 0.6, bounce 0 | visualDuration 0.6, bounce 0 | visualDuration 0.05–4 s, bounce 0–0.9 | Progress should not overshoot; keep bounce small |
| `label` | Uploading | Uploading | ≤ 32 chars | Label |
| `showLabel` | true | true | boolean | Show label |
| `showValue` | true | true | boolean | Show percent |

## Rules

- Pass value as 0-100; the component clamps and animates it. Do not animate the value yourself.
- Keep the label meaningful: it is the accessible name and the screen-reader text on completion.
- Do not use bounce above 0.3 on a spring: a progress fill that overshoots looks like a bug.
- Never move backwards; ease the bar but keep it honest.
- Expose value with role="progressbar" and aria-valuenow.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
