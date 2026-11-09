---
name: motif-dialog-modal
description: "A native dialog modal that springs in with a choice of entrances (scale, rise, blur, tilt) over a blurred backdrop. Esc or a backdrop click closes it and focus returns to the trigger. For confirmations, short forms and announcements. Use when the user asks for Spring Dialog, 弹簧对话框, dialog, modal, spring, backdrop, a11y, motion-primitives or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dialog-modal"
  motif-item: "dialog-modal"
  params-hash: "a3c83000"
---

# Spring Dialog (弹簧对话框)

A native dialog modal that springs in with a choice of entrances (scale, rise, blur, tilt) over a blurred backdrop. Esc or a backdrop click closes it and focus returns to the trigger. For confirmations, short forms and announcements.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/dialog-modal.tsx` — the component (`DialogModal`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dialog-modal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dialog-modal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DialogModal } from '@/components/motif/dialog-modal/dialog-modal'

<DialogModal />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `entrance` | rise | rise | scale / rise / blur / tilt | Entrance |
| `spring` | visualDuration 0.4, bounce 0 | visualDuration 0.4, bounce 0 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `backdropBlur` | 4 | 4 | 0–16 px (best 2–10) | Backdrop blur |
| `backdropOpacity` | 0.5 | 0.5 | 0.1–0.85 (best 0.3–0.7) | Backdrop dim |
| `width` | 448 | 448 | 320–640 px (best 380–520) | Width |
| `radius` | 8 | 8 | 0–28 px (best 6–20) | Radius |
| `closeButton` | true | true | boolean | Close button |
| `dismissOnBackdrop` | true | true | boolean | Close on backdrop |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
