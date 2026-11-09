---
name: motif-icon-toggle-morph
description: "Icon buttons that rotate and scale between two glyphs: sun to moon, menu to close, speaker to muted, outline heart to filled with a count tick. For theme switches, menus, media controls and reactions. Use when the user asks for Morphing Icon Toggles, 形变图标开关, toggle, icon-button, theme-switch, menu, like, aria-pressed or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/icon-toggle-morph"
  motif-item: "icon-toggle-morph"
  params-hash: "26135797"
---

# Morphing Icon Toggles (形变图标开关)

Icon buttons that rotate and scale between two glyphs: sun to moon, menu to close, speaker to muted, outline heart to filled with a count tick. For theme switches, menus, media controls and reactions.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/icon-toggle-morph.tsx` — the component (`IconToggleMorph`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-icon-toggle-morph`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/icon-toggle-morph/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { IconToggleMorph } from '@/components/motif/icon-toggle-morph/icon-toggle-morph'

<IconToggleMorph />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `icon` | theme | theme | theme / menu / sound / like | Icon |
| `variant` | outline | outline | outline / ghost / solid | Button style |
| `accent` | #f43f5e | #f43f5e | color | Accent |
| `size` | 36 | 36 | 28–56 px (best 32–48) | Button size |
| `strokeWidth` | 2 | 2 | 1.25–2.75 (best 1.5–2.5) | Stroke width |
| `spring` | visualDuration 0.3, bounce 0.25 | visualDuration 0.3, bounce 0.25 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `showCount` | true | true | boolean | Only for the like icon |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
