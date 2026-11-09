---
name: motif-button-delete-undo
description: "A red delete button that morphs letter by letter into an undo pill with a ticking countdown, leaving a few seconds before anything is gone. For destructive actions in account settings, lists, inboxes and file managers. Use when the user asks for Delete with Undo, 可撤销删除, delete, undo, countdown, destructive, button, morph or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/button-delete-undo"
  motif-item: "button-delete-undo"
  params-hash: "1953a89f"
---

# Delete with Undo (可撤销删除)

A red delete button that morphs letter by letter into an undo pill with a ticking countdown, leaving a few seconds before anything is gone. For destructive actions in account settings, lists, inboxes and file managers.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/delete-button.tsx` — the component (`DeleteButton`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-button-delete-undo`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/button-delete-undo/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DeleteButton } from '@/components/motif/button-delete-undo/delete-button'

<DeleteButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `deleteText` | Delete Account | Delete Account | ≤ 20 chars | Delete label |
| `cancelText` | Cancel Deletion | Cancel Deletion | ≤ 20 chars | Undo label |
| `countdown` | 10 | 10 | 3–20 s (best 5–12) | Countdown |
| `deleteColor` | #FE322A | #FE322A | color | Delete color |
| `softColor` | #FFEDF1 | #FFEDF1 | color | Soft color |
| `duration` | 0.4 | 0.4 | 0.2–0.8 s (best 0.3–0.6) | Morph duration |
| `ease` | 0.77, 0, 0.175, 1 | 0.77, 0, 0.175, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Morph easing |

## Rules

- Do the real deletion in onDelete, which fires when the countdown reaches zero; until then the action must stay reversible.
- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
