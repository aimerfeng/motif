---
name: motif-select-aligned-listbox
description: "A macOS-style select whose popup opens with the chosen item lined up exactly over the trigger, with grouped options, a check indicator, scroll arrows for long lists and type-ahead. For forms, settings and toolbars. Use when the user asks for Aligned Select, 对齐式下拉选择, select, listbox, dropdown, form, a11y, type-ahead or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/select-aligned-listbox"
  motif-item: "select-aligned-listbox"
  params-hash: "6363475d"
---

# Aligned Select (对齐式下拉选择)

A macOS-style select whose popup opens with the chosen item lined up exactly over the trigger, with grouped options, a check indicator, scroll arrows for long lists and type-ahead. For forms, settings and toolbars.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/select-aligned-listbox.tsx` — the component (`SelectAlignedListbox`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-select-aligned-listbox`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/select-aligned-listbox/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SelectAlignedListbox } from '@/components/motif/select-aligned-listbox/select-aligned-listbox'

<SelectAlignedListbox />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #ffffff | #ffffff | color | Background of the highlighted item; its text picks light or dark ink |
| `radius` | 0 | 0 | 0–12 px (best 0–8) | Corner radius |
| `alignToItem` | true | true | boolean | When off, the popup opens below the trigger |
| `width` | 160 | 160 | 140–260 px (best 160–220) | Min width |
| `maxHeight` | 288 | 288 | 160–420 px (best 224–360) | Max height |
| `grouped` | true | true | boolean | Grouped options |
| `spring` | visualDuration 0.12, bounce 0 | visualDuration 0.12, bounce 0 | visualDuration 0.05–4 s, bounce 0–0.9 | Popup spring |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from mui/base-ui).
