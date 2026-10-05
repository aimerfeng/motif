---
name: motif-input-search-command
description: "Fuzzy filtering as you type with matched letters highlighted, a selection bar that glides between rows on arrow keys, and Enter to run. Groups, shortcut hints and an empty state included. Made for a global ⌘K search and quick jump. Use when the user asks for Command Palette, 命令面板, command-palette, cmdk, search, combobox, fuzzy, keyboard, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-search-command"
  motif-item: "input-search-command"
  params-hash: "6bba4e49"
---

# Command Palette (命令面板)

Fuzzy filtering as you type with matched letters highlighted, a selection bar that glides between rows on arrow keys, and Enter to run. Groups, shortcut hints and an empty state included. Made for a global ⌘K search and quick jump.

## When to use

- Use as the body of a global ⌘K palette or an inline search-and-run list. It is a panel, not a modal: wrap it in your own dialog and open it on the shortcut.

## Files

- `assets/input-search-command.tsx` — the component (`InputSearchCommand`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-search-command`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-search-command/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputSearchCommand } from '@/components/motif/input-search-command/input-search-command'

<InputSearchCommand />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | #8b5cf6 | #8b5cf6 | color | Accent |
| `radius` | 16 | 16 | 6–28 px (best 10–22) | Corner radius |
| `size` | md | md | sm / md / lg | Density |
| `spring` | visualDuration 0.26, bounce 0.1 | visualDuration 0.26, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Highlight spring |
| `maxRows` | 10 | 10 | 3–12 (best 5–10) | Visible rows |
| `placeholder` | Search or jump to… | Search or jump to… | ≤ 36 chars | Placeholder |
| `showFooter` | true | true | boolean | Footer hints |

## Rules

- Pass groups as [{ heading, items: [{ id, label, icon?, shortcut?, keywords? }] }] and handle onSelect. Keep labels short verbs or nouns; use keywords for synonyms.
- It follows the ARIA combobox + listbox pattern: focus stays in the input and the active row is announced with aria-activedescendant. Do not move DOM focus into the list.
- The query can be controlled with query / onQueryChange, for example to load async results by setting groups yourself.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from pacocoursey/cmdk).
