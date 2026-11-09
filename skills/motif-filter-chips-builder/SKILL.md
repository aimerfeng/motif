---
name: motif-filter-chips-builder
description: "Each filter is a field | operator | value chip, like \"Status is any of Todo, Done\". Click any part for the right editor (options, text, number, date); chips spring in and out, long multi-selects fold into a stack of dots, and a Clear button resets the bar. For issue lists, CRMs and analytics. Use when the user asks for Filter Builder Chips, 筛选条件构建器, filter, chips, query-builder, combobox, datepicker, toolbar, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/filter-chips-builder"
  motif-item: "filter-chips-builder"
  params-hash: "ccd251ac"
---

# Filter Builder Chips (筛选条件构建器)

Each filter is a field | operator | value chip, like "Status is any of Todo, Done". Click any part for the right editor (options, text, number, date); chips spring in and out, long multi-selects fold into a stack of dots, and a Clear button resets the bar. For issue lists, CRMs and analytics.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/filter-chips-builder.tsx` — the component (`Filters`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-filter-chips-builder`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/filter-chips-builder/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Filters } from '@/components/motif/filter-chips-builder/filter-chips-builder'

<Filters />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #6366f1 | #6366f1 | color | Focus ring, highlighted row, Apply button and the picked date |
| `chipStyle` | outline | outline | outline / muted | Chip style |
| `size` | default | default | sm / default | Size |
| `radius` | 8 | 8 | 0–14 px (best 4–12) | Corner radius |
| `maxVisible` | 2 | 2 | 1–4 | Past this many picks, badges fold into a stack of dots and a count |
| `spring` | visualDuration 0.35, bounce 0.25 | visualDuration 0.35, bounce 0.25 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Pass fields (id, label, type, options, icon) and either rules + onRulesChange or defaultRules. A rule is { id, field, operator, value }; operator is null while a chip is being built.
- Give option fields dot and badge class strings (full Tailwind class names, not composed at runtime) so picks render as tinted badges and fold into a dot stack past maxVisible.
- The component only builds the query; filtering the data is up to you. Treat rules without an operator or value as no-ops.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
