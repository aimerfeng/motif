---
name: motif-toggle-spring
description: "The thumb stretches under your finger and springs across on release while the track color follows. Optional check glyphs or ON / OFF text. Made for notification, privacy and feature settings. Use when the user asks for Spring Switch, 弹簧开关, switch, toggle, spring, settings, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/toggle-spring"
  motif-item: "toggle-spring"
  params-hash: "0c1cfea1"
---

# Spring Switch (弹簧开关)

The thumb stretches under your finger and springs across on release while the track color follows. Optional check glyphs or ON / OFF text. Made for notification, privacy and feature settings.

## When to use

- Use for settings that take effect immediately (on/off). For choices that need a Save button, prefer a checkbox.

## Files

- `assets/toggle-spring.tsx` — the component (`ToggleSpring`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-toggle-spring`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/toggle-spring/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ToggleSpring } from '@/components/motif/toggle-spring/toggle-spring'

<ToggleSpring />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | icons | icons | icons / plain / labels | Variant |
| `color` | #8b5cf6 | #8b5cf6 | color | On color |
| `size` | 32 | 32 | 22–48 px (best 26–40) | Height |
| `radius` | 22 | 22 | 4–24 px (best 8–24) | Anything above half the height is a full pill |
| `spring` | visualDuration 0.32, bounce 0.3 | visualDuration 0.32, bounce 0.3 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `label` | Push notifications | Push notifications | ≤ 32 chars | Label |

## Rules

- Always give the switch a visible label (the label prop) or an aria-label; the component renders a native button with role="switch" and aria-checked.
- Controlled: pass checked + onCheckedChange. Uncontrolled: defaultChecked. The whole label row is clickable.
- Keep the on color a single accent; do not use red for the on state.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
