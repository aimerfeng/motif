---
name: motif-tooltip-spring
description: "Tooltips spring in with a touch of blur; inside a group, one bubble glides between the icons as the pointer moves instead of closing and reopening. Keyboard focus shows it too and Esc dismisses. Made for icon toolbars and compact actions. Use when the user asks for Spring Tooltip, 弹簧提示, tooltip, hint, toolbar, spring, shared-layout, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/tooltip-spring"
  motif-item: "tooltip-spring"
  params-hash: "e41fe31c"
---

# Spring Tooltip (弹簧提示)

Tooltips spring in with a touch of blur; inside a group, one bubble glides between the icons as the pointer moves instead of closing and reopening. Keyboard focus shows it too and Esc dismisses. Made for icon toolbars and compact actions.

## When to use

- Use for short labels on icon-only controls and for shortcut hints. Never for essential information or interactive content: tooltips are hidden on touch.

## Files

- `assets/tooltip-spring.tsx` — the component (`TooltipSpring`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-tooltip-spring`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/tooltip-spring/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TooltipSpring } from '@/components/motif/tooltip-spring/tooltip-spring'

<TooltipSpring />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | glass | glass | glass / dark / accent | Variant |
| `color` | #8b5cf6 | #8b5cf6 | color | Used by the accent variant |
| `side` | top | top | top / bottom | Side |
| `radius` | 10 | 10 | 2–18 px (best 6–14) | Corner radius |
| `spring` | visualDuration 0.3, bounce 0.22 | visualDuration 0.3, bounce 0.22 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `arrow` | true | true | boolean | Arrow |
| `delay` | 0.35 | 0.35 | 0–1.2 s (best 0.15–0.6) | Skipped when moving between tooltips |

## Rules

- Wrap a whole toolbar in <TooltipGroup> and each control in <TooltipSpring content="Bold"> (single focusable child). The group renders one shared bubble; the trigger must not sit inside another positioned element.
- A tooltip supplements an accessible name, it does not replace it: icon buttons still need aria-label. The bubble is role="tooltip" and is linked with aria-describedby while open.
- Keep content to a few words plus an optional keyboard shortcut. Use side="bottom" when the control is near the top edge.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
