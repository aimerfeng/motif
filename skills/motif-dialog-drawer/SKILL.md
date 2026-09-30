---
name: motif-dialog-drawer
description: "A sheet that rises from the bottom while the page behind it scales back. Drag the handle to rest at half or full height, or fling it away to close. Focus is trapped and Esc closes. Made for add, filter and confirm flows. Use when the user asks for Bottom Drawer, 底部抽屉, drawer, bottom-sheet, modal, drag, snap-points, vaul, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dialog-drawer"
  motif-item: "dialog-drawer"
  params-hash: "c9ec6ca5"
---

# Bottom Drawer (底部抽屉)

A sheet that rises from the bottom while the page behind it scales back. Drag the handle to rest at half or full height, or fling it away to close. Focus is trapped and Esc closes. Made for add, filter and confirm flows.

## When to use

- Use for secondary tasks that should keep page context visible: adding an item, choosing filters, confirming an action, mobile navigation. Use a centered dialog on desktop for blocking decisions.

## Files

- `assets/dialog-drawer.tsx` — the component (`DialogDrawer`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dialog-drawer/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DialogDrawer } from '@/components/motif/dialog-drawer/dialog-drawer'

<DialogDrawer />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | #8b5cf6 | #8b5cf6 | color | Accent |
| `radius` | 26 | 26 | 8–40 px (best 16–32) | Top radius |
| `snapMode` | two | two | two / single | Snap points |
| `spring` | visualDuration 0.5, bounce 0.12 | visualDuration 0.5, bounce 0.12 | visualDuration s, bounce 0–1 | Spring |
| `dim` | 0.55 | 0.55 | 0–0.85 (best 0.35–0.7) | Backdrop dim |
| `scaleBackground` | true | true | boolean | Scale page back |
| `maxWidth` | 460 | 460 | 320–720 px (best 380–560) | Max width |

## Rules

- Control it with open + onOpenChange (and snap + onSnapChange if you care about the stop). Give it a title (required, it names the dialog) and optionally a description.
- Pass the page as the page prop to get the scale-back effect and automatic inert on the page; use contained inside previews or embedded frames, leave it off for a viewport-wide sheet.
- Only the handle and title bar start a drag, so the content can scroll and hold forms. Keep the first snap tall enough to show the primary action.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from emilkowalski/vaul).
