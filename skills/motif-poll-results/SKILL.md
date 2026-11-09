---
name: motif-poll-results
description: "A question with options; once you vote, bars fill behind each label to their share while the percentages count up and your choice stays marked. For community posts, feature research and in-app surveys. Use when the user asks for Poll, 投票结果, poll, vote, survey, results, percentage, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/poll-results"
  motif-item: "poll-results"
  params-hash: "b53ca7d8"
---

# Poll (投票结果)

A question with options; once you vote, bars fill behind each label to their share while the percentages count up and your choice stays marked. For community posts, feature research and in-app surveys.

## When to use

- Numbers, stats and small data displays that change over time.

## Files

- `assets/poll-results.tsx` — the component (`PollResults`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-poll-results`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/poll-results/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PollResults } from '@/components/motif/poll-results/poll-results'

<PollResults />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `barStyle` | fill | fill | fill / track | Result bar |
| `indicator` | radio | radio | radio / checkbox / none | Checkbox allows several choices |
| `radius` | 12 | 12 | 0–24 px (best 6–18) | Corner radius |
| `revealDuration` | 0.5 | 0.5 | 0.2–2 s (best 0.4–1.2) | Reveal duration |
| `showVotes` | true | true | boolean | Show vote count |

## Rules

- Results only appear once hasVoted is true: keep value + hasVoted in your state and flip hasVoted from a submit button (pass it as action).
- The compound ChoicePoll parts are exported too, for custom layouts.
- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from nolly-studio/cult-ui).
