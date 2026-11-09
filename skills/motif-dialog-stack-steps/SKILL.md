---
name: motif-dialog-stack-steps
description: "A multi-step dialog where finished steps slide up and shrink behind the current card, peeking out as a stack you can click to go back. Made for create flows, imports and guided setup. Use when the user asks for Stacked Step Dialog, 层叠步骤弹窗, dialog, modal, stepper, wizard, stack, onboarding, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dialog-stack-steps"
  motif-item: "dialog-stack-steps"
  params-hash: "a936f6ca"
---

# Stacked Step Dialog (层叠步骤弹窗)

A multi-step dialog where finished steps slide up and shrink behind the current card, peeking out as a stack you can click to go back. Made for create flows, imports and guided setup.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/dialog-stack-steps.tsx` — the component (`DialogStack`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dialog-stack-steps`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dialog-stack-steps/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DialogStack } from '@/components/motif/dialog-stack-steps/dialog-stack-steps'

<DialogStack />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `offset` | 10 | 10 | 4–24 px (best 6–16) | How far each earlier card peeks out above |
| `scaleStep` | 0.02 | 0.02 | 0–0.08 (best 0.01–0.05) | Shrink per level |
| `maxVisible` | 3 | 3 | 1–6 (best 2–4) | Visible levels |
| `radius` | 8 | 8 | 0–24 px (best 4–18) | Corner radius |
| `dim` | 0.8 | 0.8 | 0.3–0.9 (best 0.5–0.85) | Overlay dim |
| `clickable` | true | true | boolean | Click to go back |
| `spring` | visualDuration 0.3, bounce 0.15 | visualDuration 0.3, bounce 0.15 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Compose DialogStack > DialogStackTrigger + DialogStackOverlay + DialogStackBody > DialogStackContent (one per step), with DialogStackNext / DialogStackPrevious in each footer. Put a DialogStackTitle in every step: the dialog is labelled by the active step title.
- Body traps Tab focus and closes on Escape; pass portal={false} to render in place inside a relative container.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
