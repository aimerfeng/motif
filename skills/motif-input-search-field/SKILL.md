---
name: motif-input-search-field
description: "A search box with a ⌘K hint that focuses it from anywhere, a magnifier that turns into a spinner while results load, a clear button once there is text, and an optional mic or submit button at the end. Made for app headers, docs sidebars and list filters. Use when the user asks for Search Field with Shortcut, 带快捷键的搜索框, search, input, shortcut, kbd, loader, clear-button, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-search-field"
  motif-item: "input-search-field"
  params-hash: "ae746702"
---

# Search Field with Shortcut (带快捷键的搜索框)

A search box with a ⌘K hint that focuses it from anywhere, a magnifier that turns into a spinner while results load, a clear button once there is text, and an optional mic or submit button at the end. Made for app headers, docs sidebars and list filters.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/input-search-field.tsx` — the component (`InputSearchField`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-search-field`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-search-field/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputSearchField } from '@/components/motif/input-search-field/input-search-field'

<InputSearchField />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `shortcutKey` | K | K | ≤ 1 chars | Combined with ⌘ / Ctrl |
| `showShortcut` | true | true | boolean | Shortcut hint |
| `showClear` | true | true | boolean | Clear button |
| `loadingDelay` | 500 | 500 | 0–2000 ms | How long the spinner shows after typing; 0 turns it off |
| `endAction` | mic | mic | none / submit / mic | End button |
| `size` | md | md | sm / md / lg | Size |
| `width` | 280 | 280 | 200–560 px (best 240–420) | Width |
| `radius` | 6 | 6 | 0–20 px (best 4–12) | Corner radius |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
