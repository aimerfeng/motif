---
name: motif-pinned-list
description: "Click a row and it launches into the pinned group on an overshooting spring: the pin snaps 45°, an accent rail grows on its edge and the rows below close the gap one after another. A max-pinned limit, a divider and full keyboard support. For chats, projects and saved searches. Use when the user asks for Pinned List, 置顶列表, list, pin, favorites, reorder, layout animation, keyboard, inbox or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pinned-list"
  motif-item: "pinned-list"
  params-hash: "f5be514b"
---

# Pinned List (置顶列表)

Click a row and it launches into the pinned group on an overshooting spring: the pin snaps 45°, an accent rail grows on its edge and the rows below close the gap one after another. A max-pinned limit, a divider and full keyboard support. For chats, projects and saved searches.

## When to use

- Numbers, stats and small data displays that change over time.

## Files

- `assets/pinned-list.tsx` — the component (`PinnedList`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-pinned-list`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pinned-list/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PinnedList } from '@/components/motif/pinned-list/pinned-list'

<PinnedList />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `maxPinned` | 5 | 5 | 1–8 (best 3–6) | At the limit the other rows dim and cannot be pinned |
| `showDivider` | true | true | boolean | Divider |
| `density` | comfortable | comfortable | comfortable / compact | Density |
| `accent` | #fe65b0 | #fe65b0 | color | The rail and pin of pinned rows |
| `spring` | visualDuration 0.3, bounce 0.3 | visualDuration 0.3, bounce 0.3 | visualDuration 0.05–4 s, bounce 0–0.9 | Launch spring |
| `label` | Inbox | Inbox | ≤ 32 chars | Names the list for assistive technology; the demo also shows it as the heading |

## Rules

- Controlled: pinnedIds + onPinnedChange. Uncontrolled: mark items with pinned: true. Pinned rows keep the order of the items array.
- Each row is a role="button" with aria-pressed and a roving tabindex: arrows, Home and End move between rows; P, Enter or Space toggles. Give every item a distinct title, it becomes the accessible name.
- Put the list in a scroller with a fixed height when there are many rows; the rows keep 4px of padding so the spring overshoot and focus ring are not clipped.
- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
