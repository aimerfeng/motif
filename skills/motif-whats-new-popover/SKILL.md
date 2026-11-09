---
name: motif-whats-new-popover
description: "A dashed “What's new?” trigger with a pulsing dot opens a release card: version, tag, date and a short note, paging left and right from the latest, with page dots below. For app headers and help menus. Use when the user asks for What's New Popover, 更新日志浮层, popover, hover card, changelog, release notes, pagination, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/whats-new-popover"
  motif-item: "whats-new-popover"
  params-hash: "f74ce42a"
---

# What's New Popover (更新日志浮层)

A dashed “What's new?” trigger with a pulsing dot opens a release card: version, tag, date and a short note, paging left and right from the latest, with page dots below. For app headers and help menus.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/whats-new-popover.tsx` — the component (`WhatsNewPopover`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-whats-new-popover`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/whats-new-popover/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { WhatsNewPopover } from '@/components/motif/whats-new-popover/whats-new-popover'

<WhatsNewPopover />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #60a5fa | #60a5fa | color | Accent |
| `width` | 288 | 288 | 248–336 px (best 264–320) | Card width |
| `radius` | 10 | 10 | 0–20 px (best 6–14) | Radius |
| `openOn` | hover | hover | hover / click | Open on |
| `pageTransition` | slide | slide | slide / fade / none | Page transition |
| `showDot` | true | true | boolean | Pulsing dot |
| `spring` | visualDuration 0.25, bounce 0.1 | visualDuration 0.25, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Open spring |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
