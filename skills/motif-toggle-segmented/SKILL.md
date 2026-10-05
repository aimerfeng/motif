---
name: motif-toggle-segmented
description: "One thumb springs between mutually exclusive options, with icons, text or both. Made for view switchers (list / grid / board), time ranges and theme pickers. Use when the user asks for Segmented Control, 分段控件, segmented, radio, switcher, view-toggle, spring, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/toggle-segmented"
  motif-item: "toggle-segmented"
  params-hash: "e7c104c1"
---

# Segmented Control (分段控件)

One thumb springs between mutually exclusive options, with icons, text or both. Made for view switchers (list / grid / board), time ranges and theme pickers.

## When to use

- Use to pick exactly one of 2 to 5 short options where the change applies immediately (view mode, range, theme). For navigating between content sections use tabs-animated.

## Files

- `assets/toggle-segmented.tsx` — the component (`ToggleSegmented`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-toggle-segmented`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/toggle-segmented/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ToggleSegmented } from '@/components/motif/toggle-segmented/toggle-segmented'

<ToggleSegmented />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `content` | both | both | both / text / icons | Content |
| `thumb` | raised | raised | raised / solid | Thumb |
| `color` | #8b5cf6 | #8b5cf6 | color | Accent |
| `size` | md | md | sm / md / lg | Size |
| `radius` | 12 | 12 | 4–24 px (best 6–20) | Corner radius |
| `spring` | visualDuration 0.32, bounce 0.18 | visualDuration 0.32, bounce 0.18 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Options are { value, label, icon? }. With content="icons" the label becomes the aria-label, so always set it.
- Do not exceed five options; labels stay one word.
- Arrow keys select immediately; Tab enters and leaves the group as a single stop.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
