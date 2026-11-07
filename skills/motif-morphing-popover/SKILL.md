---
name: motif-morphing-popover
description: "The button itself springs open into a small panel, its label riding along while the content rises in, and folds back into the button on close. It opens in place without covering the page; Esc, clicking outside or tabbing away closes it, and focus goes in and comes back. For feedback, quick notes, sharing and filters. Use when the user asks for Morphing Popover, 形变弹出层, popover, morph, shared layout, spring, feedback, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/morphing-popover"
  motif-item: "morphing-popover"
  params-hash: "49a7074f"
---

# Morphing Popover (形变弹出层)

The button itself springs open into a small panel, its label riding along while the content rises in, and folds back into the button on close. It opens in place without covering the page; Esc, clicking outside or tabbing away closes it, and focus goes in and comes back. For feedback, quick notes, sharing and filters.

## When to use

- Use for a small, self-contained task that starts from one button and should not take the user away from the page: leave feedback, add a note, share a link, pick a filter. Anything longer or blocking belongs in a dialog.

## Files

- `assets/morphing-popover.tsx` — the component (`MorphingPopover`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-morphing-popover`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/morphing-popover/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MorphingPopover } from '@/components/motif/morphing-popover/morphing-popover'

<MorphingPopover />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `spring` | visualDuration 0.42, bounce 0.12 | visualDuration 0.42, bounce 0.12 | visualDuration 0.05–4 s, bounce 0–0.9 | Shorter is crisper, more bounce overshoots |
| `contentEffect` | rise | rise | rise / fade / blur | Content entrance |
| `align` | end | end | start / center / end | Which edge the panel shares with the button, and so which way it grows |
| `radius` | 16 | 16 | 6–28 px (best 10–22) | Panel radius |
| `triggerRadius` | 18 | 18 | 4–22 px (best 8–20) | Button radius |
| `elevation` | lifted | lifted | flat / soft / lifted | Elevation |
| `closeOnOutsideClick` | true | true | boolean | Close on outside click |

## Rules

- Compose MorphingPopover > MorphingPopoverTrigger + MorphingPopoverContent. Put a MorphingPopoverLabel with the same text in both so the label morphs; the one inside the content also names the dialog.
- Style the trigger and the content as the same surface (same background and border) so the morph reads as one object growing.
- It is a non-modal dialog: focus moves into the panel when the user opens it (mark the field to focus with data-autofocus) and back to the button on Esc or MorphingPopoverClose; clicking outside or tabbing away closes it.
- Keep the panel under about 360 x 320 px; it is anchored to the button and grows away from the aligned edge.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
