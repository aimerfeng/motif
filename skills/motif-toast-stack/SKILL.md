---
name: motif-toast-stack
description: "Sonner-style stacking toasts: cards tuck behind the newest one, expand into a list on hover and pause their timers, and swipe away. Supports loading-to-success updates in place, action buttons, six positions and screen-reader announcements. Use when the user asks for Toast Stack, 堆叠通知, toast, notification, stack, swipe, sonner, feedback, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/toast-stack"
  motif-item: "toast-stack"
  params-hash: "4cd40bf1"
---

# Toast Stack (堆叠通知)

Sonner-style stacking toasts: cards tuck behind the newest one, expand into a list on hover and pause their timers, and swipe away. Supports loading-to-success updates in place, action buttons, six positions and screen-reader announcements.

## When to use

- Use for transient, non-blocking feedback: saves, background jobs, incoming events. Anything the user must act on to continue belongs in a dialog or inline message, not a toast.

## Files

- `assets/toast-stack.tsx` — the component (`ToastStack`); the tuned values are baked into its `defaults` object
- `assets/toast-stack.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-toast-stack`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/toast-stack/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ToastStack } from '@/components/motif/toast-stack/toast-stack'

<ToastStack />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `position` | bottom-right | bottom-right | bottom-right / bottom-center / bottom-left / top-right / top-center / top-left | Position |
| `width` | 356 | 356 | 260–460 px (best 300–400) | Width |
| `gap` | 14 | 14 | 8–24 px (best 10–18) | Also sets how much of the cards behind peek out when collapsed |
| `visibleToasts` | 3 | 3 | 1–5 | Visible toasts |
| `duration` | 4 | 4 | 2–10 s (best 3–6) | Errors last twice as long; loading toasts never expire on their own |
| `radius` | 14 | 14 | 4–24 px (best 8–20) | Corner radius |
| `richColors` | false | false | boolean | Rich colors |
| `expandOnHover` | true | true | boolean | Expand on hover |
| `spring` | visualDuration 0.45, bounce 0.12 | visualDuration 0.45, bounce 0.12 | visualDuration 0.05–4 s, bounce 0–0.9 | Motion spring |

## Rules

- The component is controlled: keep the toast list in state, append new toasts to the end, update a toast in place by reusing its id (loading to success), and remove it in onDismiss.
- Mount it inside a position: relative container; it pins itself to a corner of that container.
- Keep titles short and put detail in description; error toasts last twice as long and use role="alert".
- Do not remove pause-on-hover/focus or the close button; they are what makes timed toasts accessible.
- Keep messages short and use the same verb as the action.
- Toasts that contain actions must stay until dismissed and be reachable by keyboard.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from emilkowalski/sonner).
