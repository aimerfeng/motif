---
name: motif-speed-dial
description: "A vermilion floating button that springs open into a stack of white round actions with text labels while its plus turns into a cross. Keyboard friendly and closes on outside click. A quick-create entry for notes, mail and gallery apps. Use when the user asks for Speed Dial, 快捷拨号按钮, fab, speed-dial, floating, menu, actions, spring, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/speed-dial"
  motif-item: "speed-dial"
  params-hash: "6b11f54c"
---

# Speed Dial (快捷拨号按钮)

A vermilion floating button that springs open into a stack of white round actions with text labels while its plus turns into a cross. Keyboard friendly and closes on outside click. A quick-create entry for notes, mail and gallery apps.

## When to use

- Use for a primary create action that fans out into two to five related creations (new note, photo, link). A single action should be a plain button.

## Files

- `assets/speed-dial.tsx` — the component (`SpeedDial`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-speed-dial`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/speed-dial/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SpeedDial } from '@/components/motif/speed-dial/speed-dial'

<SpeedDial />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `direction` | up | up | up / down / left / right | Direction |
| `size` | 56 | 56 | 44–80 px (best 48–72) | Button size |
| `radius` | 28 | 28 | 8–40 px (best 14–40) | Anything above half the size is a full circle |
| `color` | #f2542d | #f2542d | color | Button color |
| `surface` | #ffffff | #ffffff | color | Action surface |
| `ink` | #1f2430 | #1f2430 | color | Icon and label ink |
| `showLabels` | true | true | boolean | Only shown when opening up or down |
| `spring` | visualDuration 0.38, bounce 0.3 | visualDuration 0.38, bounce 0.3 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Pass your own actions as { key, label, icon, onSelect }; every action needs a label because it is the accessible name. Keep it to five or fewer.
- Place the root with absolute or fixed positioning in a corner, and pick a direction that opens toward free space.
- Keyboard: the trigger opens the menu and moves focus to the first action; arrow keys step along the direction, Home / End jump, Escape closes and returns focus.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).
