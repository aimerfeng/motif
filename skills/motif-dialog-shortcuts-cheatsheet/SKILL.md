---
name: motif-dialog-shortcuts-cheatsheet
description: "A \"?\" overlay listing shortcuts grouped by area with styled key caps, a filter box that narrows the list as you type, and modifiers shown as ⌘ or Ctrl per platform. For editors, dashboards and keyboard-heavy apps. Use when the user asks for Keyboard Shortcuts Sheet, 快捷键速查面板, dialog, keyboard, shortcuts, kbd, cheatsheet, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dialog-shortcuts-cheatsheet"
  motif-item: "dialog-shortcuts-cheatsheet"
  params-hash: "02f4cb34"
---

# Keyboard Shortcuts Sheet (快捷键速查面板)

A "?" overlay listing shortcuts grouped by area with styled key caps, a filter box that narrows the list as you type, and modifiers shown as ⌘ or Ctrl per platform. For editors, dashboards and keyboard-heavy apps.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/dialog-shortcuts-cheatsheet.tsx` — the component (`DialogShortcutsCheatsheet`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dialog-shortcuts-cheatsheet`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dialog-shortcuts-cheatsheet/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DialogShortcutsCheatsheet } from '@/components/motif/dialog-shortcuts-cheatsheet/dialog-shortcuts-cheatsheet'

<DialogShortcutsCheatsheet />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `layout` | columns | columns | columns / list | Layout |
| `keycapStyle` | flat | flat | flat / raised / outline | Key caps |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `radius` | 14 | 14 | 4–28 px (best 8–20) | Radius |
| `showSearch` | true | true | boolean | Filter box |
| `platform` | mac | mac | mac / windows | Platform |
| `spring` | visualDuration 0.22, bounce 0.1 | visualDuration 0.22, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Detect the platform yourself (e.g. navigator.platform) and pass platform; key tokens "mod", "shift", "alt" and "enter" are mapped to ⌘/Ctrl, ⇧/Shift, ⌥/Alt, ↵/Enter.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
