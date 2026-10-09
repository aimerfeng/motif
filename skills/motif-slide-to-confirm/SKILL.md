---
name: motif-slide-to-confirm
description: "A round handle in a pill track under a slowly sweeping text shimmer. Drag past eighty percent to confirm while a color fill follows, then the handle turns into a check. Made for shutdown, transfers and other actions that deserve a second thought. Use when the user asks for Slide to Confirm, 滑动确认, slide, confirm, drag, swipe, power, safety, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/slide-to-confirm"
  motif-item: "slide-to-confirm"
  params-hash: "74b65a2d"
---

# Slide to Confirm (滑动确认)

A round handle in a pill track under a slowly sweeping text shimmer. Drag past eighty percent to confirm while a color fill follows, then the handle turns into a check. Made for shutdown, transfers and other actions that deserve a second thought.

## When to use

- Use for a single high-stakes or irreversible action where an accidental tap would hurt. Not for routine buttons or reversible toggles.

## Files

- `assets/slide-to-confirm.tsx` — the component (`SlideToConfirm`); the tuned values are baked into its `defaults` object
- `assets/slide-to-confirm.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-slide-to-confirm`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/slide-to-confirm/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SlideToConfirm } from '@/components/motif/slide-to-confirm/slide-to-confirm'

<SlideToConfirm />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | #ff5a47 | #ff5a47 | color | Accent |
| `icon` | arrow | arrow | arrow / power / lock | Handle icon |
| `size` | 60 | 60 | 48–76 px (best 52–68) | Height |
| `width` | 320 | 320 | 240–332 px (best 260–332) | Width |
| `shimmer` | 2.4 | 2.4 | 1.2–5 s (best 1.6–3.6) | Shimmer period |
| `spring` | visualDuration 0.3, bounce 0.2 | visualDuration 0.3, bounce 0.2 | visualDuration 0.05–4 s, bounce 0–0.9 | Release spring |
| `label` | Slide to power off | Slide to power off | ≤ 28 chars | Prompt |
| `doneLabel` | Shutting down… | Shutting down… | ≤ 28 chars | Done text |

## Rules

- The handle is drag-only for pointers and also a focusable button: Enter, Space or ArrowRight confirms, so keyboard and assistive-tech users are never blocked.
- Uncontrolled it resets itself after resetAfter ms; controlled, pass done and reset it yourself. onConfirm is where the real action goes.
- State the action in the label ("Slide to send $2,400"), keep it under ~28 characters, and use one accent color.
- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
