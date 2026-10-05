---
name: motif-menu-dropdown
description: "The menu springs open from its trigger with a touch of blur, items settle in one by one and a highlight bar glides between rows. Checkbox items, destructive actions and shortcut hints; arrows, type-ahead and Esc all work. Made for toolbars, project menus and row actions. Use when the user asks for Spring Dropdown Menu, 弹簧下拉菜单, dropdown, menu, context, keyboard, typeahead, spring, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/menu-dropdown"
  motif-item: "menu-dropdown"
  params-hash: "8955f06f"
---

# Spring Dropdown Menu (弹簧下拉菜单)

The menu springs open from its trigger with a touch of blur, items settle in one by one and a highlight bar glides between rows. Checkbox items, destructive actions and shortcut hints; arrows, type-ahead and Esc all work. Made for toolbars, project menus and row actions.

## When to use

- Use for a short list (3 to 10) of commands on an object: rename, duplicate, share, delete. For choosing a value use a select; for navigation use links.

## Files

- `assets/menu-dropdown.tsx` — the component (`MenuDropdown`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-menu-dropdown`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/menu-dropdown/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { MenuDropdown } from '@/components/motif/menu-dropdown/menu-dropdown'

<MenuDropdown />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | #8b5cf6 | #8b5cf6 | color | Accent |
| `radius` | 14 | 14 | 6–24 px (best 8–20) | Corner radius |
| `width` | 248 | 248 | 200–340 px (best 220–300) | Menu width |
| `align` | start | start | start / end | Align |
| `spring` | visualDuration 0.34, bounce 0.16 | visualDuration 0.34, bounce 0.16 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `showShortcuts` | true | true | boolean | Show shortcuts |
| `label` | Project | Project | ≤ 20 chars | Trigger label |

## Rules

- Pass items as MenuEntry[]: { id, label, icon?, shortcut?, danger? }, { type: "checkbox", id, label, checked? }, { type: "separator" }, { type: "label", label }. Handle onSelect(id, checked?).
- Follows the WAI-ARIA menu button pattern (role="menu", menuitem, menuitemcheckbox). Focus moves into the menu on open and returns to the trigger on Esc or after a choice. Do not put inputs or links inside items.
- Put destructive actions last, behind a separator, with danger: true. Checkbox items keep the menu open.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
