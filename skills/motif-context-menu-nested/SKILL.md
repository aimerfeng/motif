---
name: motif-context-menu-nested
description: "A right-click menu that opens at the pointer, flips near the edges and opens submenus on hover after a short delay. Arrow keys, Enter, Esc, Shift+F10 and touch long-press all work. For file lists, canvases and editors. Use when the user asks for Context Menu with Submenus, 右键菜单, context-menu, right-click, submenu, keyboard, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/context-menu-nested"
  motif-item: "context-menu-nested"
  params-hash: "2de0395a"
---

# Context Menu with Submenus (右键菜单)

A right-click menu that opens at the pointer, flips near the edges and opens submenus on hover after a short delay. Arrow keys, Enter, Esc, Shift+F10 and touch long-press all work. For file lists, canvases and editors.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/context-menu-nested.tsx` — the component (`ContextMenuNested`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-context-menu-nested`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/context-menu-nested/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ContextMenuNested } from '@/components/motif/context-menu-nested/context-menu-nested'

<ContextMenuNested />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #ffffff | #ffffff | color | Border, separators and highlight; text ink flips by luminance |
| `radius` | 0 | 0 | 0–10 px (best 0–8) | Corner radius |
| `submenuDelay` | 100 | 100 | 0–400 ms (best 50–250) | Submenu delay |
| `label` | Right click here | Right click here | ≤ 28 chars | Trigger label |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from mui/base-ui).
