---
name: motif-menubar-app
description: "A desktop-style menubar (File, Edit, View, Help): open one menu and hovering switches to the others, arrow keys move across menus. Items carry shortcuts, checkmarks, a radio group and submenus. For web IDEs, editors and design tools. Use when the user asks for Application Menubar, 应用菜单栏, menubar, menu, submenu, shortcuts, keyboard, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/menubar-app"
  motif-item: "menubar-app"
  params-hash: "f51a27b8"
---

# Application Menubar (应用菜单栏)

A desktop-style menubar (File, Edit, View, Help): open one menu and hovering switches to the others, arrow keys move across menus. Items carry shortcuts, checkmarks, a radio group and submenus. For web IDEs, editors and design tools.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/menubar-app.tsx` — the component (`MenubarApp`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-menubar-app`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/menubar-app/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MenubarApp } from '@/components/motif/menubar-app/menubar-app'

<MenubarApp />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #ffffff | #ffffff | color | Border, separators and highlight; text ink flips by luminance |
| `radius` | 0 | 0 | 0–10 px (best 0–8) | Corner radius |
| `density` | comfortable | comfortable | comfortable / compact | Density |
| `showShortcuts` | true | true | boolean | Show shortcuts |
| `openOnHover` | false | false | boolean | When off, click one menu first; hovering then switches menus |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from mui/base-ui).
