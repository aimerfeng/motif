---
name: motif-success-check
description: "A checkmark that draws itself: the ring strokes in, the tick lands with a small pop, then a ripple and sparks burst out. Four forms: ring, burst, solid stamp and twelve-lobe seal. For completed payments, saved changes and finished tasks. Use when the user asks for Success Check, 成功对勾, success, check, checkmark, confirmation, svg, draw, feedback or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/success-check"
  motif-item: "success-check"
  params-hash: "fa186085"
---

# Success Check (成功对勾)

A checkmark that draws itself: the ring strokes in, the tick lands with a small pop, then a ripple and sparks burst out. Four forms: ring, burst, solid stamp and twelve-lobe seal. For completed payments, saved changes and finished tasks.

## When to use

- Use once, at the moment a task is confirmed complete: payment done, changes saved, upload finished. Turn loop off in production so it draws once and rests.

## Files

- `assets/success-check.tsx` — the component (`SuccessCheck`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/success-check/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SuccessCheck } from '@/components/motif/success-check/success-check'

<SuccessCheck />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | burst | burst | burst / circle / stamp / seal | Form |
| `size` | 96 | 96 | 48–200 px (best 64–140) | Size |
| `color` | #22c55e | #22c55e | color | Color |
| `thickness` | 5 | 5 | 3–9 (best 4–7) | Stroke |
| `duration` | 1.2 | 1.2 | 0.6–2.4 s (best 0.9–1.6) | Draw time |
| `loop` | true | true | boolean | When off, it draws once and stays complete |
| `hold` | 2.8 | 2.8 | 0.5–6 s (best 1.5–4) | How long it rests before drawing again |
| `label` | Success | Success | ≤ 32 chars | Screen reader label |

## Rules

- Set label to what succeeded (for example "Payment successful"); the graphic is otherwise decorative.
- Pair it with a visible sentence; never rely on the check alone to convey the result.
- With reduced motion enabled it renders the finished mark immediately.
- Keep messages short and use the same verb as the action.
- Toasts that contain actions must stay until dismissed and be reachable by keyboard.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
