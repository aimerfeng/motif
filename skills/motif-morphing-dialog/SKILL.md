---
name: motif-morphing-dialog
description: "Tap a card and it springs open into a dialog, title and cover riding along while the backdrop blurs; close it and it folds back in place. For case-study lists, product details and previews. Use when the user asks for Morphing Dialog, 形变对话框, dialog, modal, shared layout, morph, spring, expand, card or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/morphing-dialog"
  motif-item: "morphing-dialog"
  params-hash: "fa0aa9d1"
---

# Morphing Dialog (形变对话框)

Tap a card and it springs open into a dialog, title and cover riding along while the backdrop blurs; close it and it folds back in place. For case-study lists, product details and previews.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/morphing-dialog.tsx` — the component (`MorphingDialog`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-morphing-dialog`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/morphing-dialog/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MorphingDialog } from '@/components/motif/morphing-dialog/morphing-dialog'

<MorphingDialog />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `spring` | visualDuration 0.5, bounce 0.15 | visualDuration 0.5, bounce 0.15 | visualDuration 0.05–4 s, bounce 0–0.9 | Shorter is crisper, more bounce overshoots |
| `radius` | 24 | 24 | 4–40 px (best 12–32) | Dialog radius |
| `triggerRadius` | 18 | 18 | 4–40 px (best 8–28) | Trigger radius |
| `backdropOpacity` | 0.5 | 0.5 | 0.1–0.85 (best 0.3–0.7) | Backdrop dimming |
| `backdropBlur` | 6 | 6 | 0–20 px (best 2–12) | Backdrop blur |
| `closeOnOutsideClick` | true | true | boolean | Close on backdrop click |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
