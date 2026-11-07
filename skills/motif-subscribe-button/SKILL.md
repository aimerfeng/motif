---
name: motif-subscribe-button
description: "One click slides “Subscribe” away and drops “Subscribed” in from above with a check drawn in one stroke, while the button settles into a quieter style; click again to undo. For newsletters, channels and creator pages. Use when the user asks for Subscribe Button, 订阅按钮, button, subscribe, follow, toggle, feedback, newsletter or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/subscribe-button"
  motif-item: "subscribe-button"
  params-hash: "0993bb10"
---

# Subscribe Button (订阅按钮)

One click slides “Subscribe” away and drops “Subscribed” in from above with a check drawn in one stroke, while the button settles into a quieter style; click again to undo. For newsletters, channels and creator pages.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/subscribe-button.tsx` — the component (`SubscribeButton`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-subscribe-button`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/subscribe-button/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SubscribeButton } from '@/components/motif/subscribe-button/subscribe-button'

<SubscribeButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Subscribe | Subscribe | ≤ 18 chars | Label |
| `doneLabel` | Subscribed | Subscribed | ≤ 18 chars | Subscribed label |
| `color` | #f2f0eb | #f2f0eb | color | Fill before subscribing; the label picks light or dark ink from it |
| `doneStyle` | tinted | tinted | tinted / outline / solid | Subscribed style |
| `icon` | bell | bell | bell / mail / plus / none | Icon |
| `radius` | 20 | 20 | 4–20 px (best 8–20) | Corner radius |
| `spring` | visualDuration 0.38, bounce 0.25 | visualDuration 0.38, bounce 0.25 | visualDuration 0.05–4 s, bounce 0–0.9 | Drop-in spring |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
