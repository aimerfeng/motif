---
name: motif-emoji-picker-grid
description: "An emoji button beside the message input opens a searchable, grouped emoji grid you move through with all four arrow keys; picking inserts at the caret and hands focus back. Optional category tabs and a frequently-used row. For chat composers, comments and reactions. Use when the user asks for Emoji Picker, 表情选择器, emoji, picker, popover, grid, autocomplete, chat, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/emoji-picker-grid"
  motif-item: "emoji-picker-grid"
  params-hash: "ee56e219"
---

# Emoji Picker (表情选择器)

An emoji button beside the message input opens a searchable, grouped emoji grid you move through with all four arrow keys; picking inserts at the caret and hands focus back. Optional category tabs and a frequently-used row. For chat composers, comments and reactions.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/emoji-picker-grid.tsx` — the component (`EmojiPickerGrid`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-emoji-picker-grid`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/emoji-picker-grid/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { EmojiPickerGrid } from '@/components/motif/emoji-picker-grid/emoji-picker-grid'

<EmojiPickerGrid />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `columns` | 5 | 5 | 4–8 (best 5–7) | Columns |
| `cellSize` | 48 | 48 | 36–52 px (best 40–48) | Popup width is columns × cell width, narrowed to fit its container |
| `accent` | #262626 | #262626 | color | Background of the highlighted cell and the current category |
| `radius` | 0 | 0 | 0–14 px (best 0–10) | Radius |
| `showCategories` | false | false | boolean | Category tabs |
| `recentRow` | false | false | boolean | Frequently used row |
| `spring` | visualDuration 0.15, bounce 0 | visualDuration 0.15, bounce 0 | visualDuration 0.05–4 s, bounce 0–0.9 | Open spring |

## Rules

- Focus stays in the search field (role="combobox" with aria-activedescendant); arrow keys move the highlight in two dimensions across the grid, Enter inserts, Escape closes and returns focus to the trigger.
- The popup is absolutely positioned below the input, aligned to its right edge: leave room under the composer or move the popup with className if the composer sits at the bottom of the screen.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from mui/base-ui).
