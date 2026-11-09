---
name: motif-checkbox-task-list
description: "Round checkboxes fill with a check while the task text gets a strike-through that sweeps across and fades; a header counts progress such as 3 of 5. Made for onboarding checklists, to-dos and release checklists. Use when the user asks for Task Checklist, 待办清单, checkbox, todo, checklist, strikethrough, progress, form or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/checkbox-task-list"
  motif-item: "checkbox-task-list"
  params-hash: "9727a2ea"
---

# Task Checklist (待办清单)

Round checkboxes fill with a check while the task text gets a strike-through that sweeps across and fades; a header counts progress such as 3 of 5. Made for onboarding checklists, to-dos and release checklists.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/checkbox-task-list.tsx` — the component (`TaskChecklist`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-checkbox-task-list`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/checkbox-task-list/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TaskChecklist } from '@/components/motif/checkbox-task-list/checkbox-task-list'

<TaskChecklist />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `checkShape` | round | round | round / square | Checkbox shape |
| `strikeStyle` | sweep | sweep | sweep / line | Strike-through |
| `showProgress` | true | true | boolean | Show progress |
| `duration` | 150 | 150 | 100–600 ms (best 120–400) | Duration |
| `accent` | #10b981 | #10b981 | color | The check uses white or near-black, whichever contrasts more |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
