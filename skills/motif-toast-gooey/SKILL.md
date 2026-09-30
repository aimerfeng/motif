---
name: motif-toast-gooey
description: "A pill drops in from the top, then stretches like a drop of water into a body with a description and an action, and folds back before leaving. The outline is a morphing SVG path on an overshooting spring. For success, failure and update notices that need one line and one action. Use when the user asks for Gooey Toast, 水滴通知, toast, notification, gooey, morph, svg, spring, feedback, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/toast-gooey"
  motif-item: "toast-gooey"
  params-hash: "24ed708f"
---

# Gooey Toast (水滴通知)

A pill drops in from the top, then stretches like a drop of water into a body with a description and an action, and folds back before leaving. The outline is a morphing SVG path on an overshooting spring. For success, failure and update notices that need one line and one action.

## When to use

- Use for occasional, friendly notices with one action. Use toast-stack when many notices can arrive at once.

## Files

- `assets/toast-gooey.tsx` — the component (`ToastGooey`); the tuned values are baked into its `defaults` object
- `assets/toast-gooey.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/toast-gooey/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ToastGooey } from '@/components/motif/toast-gooey/toast-gooey'

<ToastGooey />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `align` | center | center | center / left / right | Align |
| `width` | 320 | 320 | 260–440 px (best 280–380) | Expanded width |
| `fill` | #18181b | #18181b | color | Text color switches automatically with brightness |
| `bounce` | 0.4 | 0.4 | 0.05–0.8 (best 0.2–0.6) | 0.05 is nearly flat, 0.8 is very bouncy |
| `expandDelay` | 0.5 | 0.5 | 0.1–1.5 s (best 0.3–0.9) | Expand delay |
| `hold` | 2.8 | 2.8 | 1.5–8 s (best 2–5) | The timer pauses on hover and focus |
| `richColors` | false | false | boolean | Rich colors |
| `border` | true | true | boolean | Border |

## Rules

- Controlled: pass one toast at a time via the toast prop and clear it in onDismiss; change the toast id to replay the drop and morph.
- Keep the title to a few words (it lives in the pill) and the description to one or two lines.
- The visible text is aria-hidden and mirrored in an sr-only live region (assertive for errors); keep it.
- Put the component at the top of a position: relative container; it does not position itself.
- Keep messages short and use the same verb as the action.
- Toasts that contain actions must stay until dismissed and be reachable by keyboard.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from anl331/goey-toast).
