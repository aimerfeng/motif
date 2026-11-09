---
name: motif-button-reaction-counter
description: "Upvote / downvote pairs and like or star buttons with an attached count: pressing toggles the state, the icon fills and the number rolls up or down. Horizontal, vertical and split (button | count) layouts. Made for forums, changelogs, repositories and feedback boards. Use when the user asks for Vote & Reaction Counter, 投票与点赞计数按钮, vote, upvote, like, star, counter, button, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/button-reaction-counter"
  motif-item: "button-reaction-counter"
  params-hash: "9a3520da"
---

# Vote & Reaction Counter (投票与点赞计数按钮)

Upvote / downvote pairs and like or star buttons with an attached count: pressing toggles the state, the icon fills and the number rolls up or down. Horizontal, vertical and split (button | count) layouts. Made for forums, changelogs, repositories and feedback boards.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/button-reaction-counter.tsx` — the component (`ReactionCounter`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-button-reaction-counter`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/button-reaction-counter/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ReactionCounter } from '@/components/motif/button-reaction-counter/button-reaction-counter'

<ReactionCounter />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `kind` | vote | vote | vote / like / star | Kind |
| `layout` | horizontal | horizontal | horizontal / vertical / split | Layout |
| `initialCount` | 235 | 235 | 0–99999 | Initial count |
| `activeColor` | #f97316 | #f97316 | color | Active color |
| `rollDuration` | 0.35 | 0.35 | 0.15–0.8 s (best 0.25–0.5) | Roll duration |
| `size` | md | md | sm / md / lg | Size |
| `radius` | 6 | 6 | 0–20 px (best 4–20) | Corner radius |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
