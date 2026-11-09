---
name: motif-issue-property-picker
description: "Linear-style property menus for a task: status circles, priority bars and initials avatars. Each opens a searchable list with number-key shortcuts, and the trigger icon morphs to the new value. For issue trackers and CRMs. Use when the user asks for Issue Property Picker, 任务属性选择器, combobox, select, status, priority, assignee, issue, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/issue-property-picker"
  motif-item: "issue-property-picker"
  params-hash: "76c86333"
---

# Issue Property Picker (任务属性选择器)

Linear-style property menus for a task: status circles, priority bars and initials avatars. Each opens a searchable list with number-key shortcuts, and the trigger icon morphs to the new value. For issue trackers and CRMs.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/issue-property-picker.tsx` — the component (`IssuePropertyPicker`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-issue-property-picker`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/issue-property-picker/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { IssuePropertyPicker } from '@/components/motif/issue-property-picker/issue-property-picker'

<IssuePropertyPicker />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `property` | status | status | status / priority / assignee | Property |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `radius` | 8 | 8 | 2–16 px (best 4–12) | Corner radius |
| `triggerStyle` | outline | outline | outline / ghost | Trigger style |
| `showShortcuts` | true | true | boolean | Show number shortcuts |
| `spring` | visualDuration 0.3, bounce 0.35 | visualDuration 0.3, bounce 0.35 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `width` | 240 | 240 | 180–320 px (best 200–280) | Width |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
