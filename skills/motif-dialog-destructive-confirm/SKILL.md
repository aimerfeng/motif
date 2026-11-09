---
name: motif-dialog-destructive-confirm
description: "An alert dialog for irreversible actions: a warning icon, the consequences listed, and a delete button that stays disabled until you type the resource name, then fills red. Esc and Cancel are the safe defaults. For deleting projects, accounts and data. Use when the user asks for Destructive Confirm Dialog, 危险操作确认弹窗, alert-dialog, confirm, destructive, delete, modal, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dialog-destructive-confirm"
  motif-item: "dialog-destructive-confirm"
  params-hash: "b62dd554"
---

# Destructive Confirm Dialog (危险操作确认弹窗)

An alert dialog for irreversible actions: a warning icon, the consequences listed, and a delete button that stays disabled until you type the resource name, then fills red. Esc and Cancel are the safe defaults. For deleting projects, accounts and data.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/dialog-destructive-confirm.tsx` — the component (`DialogDestructiveConfirm`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dialog-destructive-confirm`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dialog-destructive-confirm/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DialogDestructiveConfirm } from '@/components/motif/dialog-destructive-confirm/dialog-destructive-confirm'

<DialogDestructiveConfirm />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `confirmMode` | type | type | type / simple | Confirm mode |
| `accent` | #ef4444 | #ef4444 | color | Destructive color |
| `radius` | 24 | 24 | 8–32 px (best 16–28) | Radius |
| `dim` | 0.4 | 0.4 | 0.1–0.8 (best 0.3–0.6) | Backdrop dim |
| `spring` | visualDuration 0.22, bounce 0.1 | visualDuration 0.22, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `resourceName` | atlas-web | atlas-web | ≤ 32 chars | Resource name |
| `showConsequences` | true | true | boolean | List consequences |

## Rules

- Use type-to-confirm only for truly irreversible deletes; keep Cancel focused by default and never make the destructive button the Enter default unless the name is typed.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
