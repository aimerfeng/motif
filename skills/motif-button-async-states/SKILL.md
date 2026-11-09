---
name: motif-button-async-states
description: "One button for save and submit flows: the label morphs letter by letter into a loading word, a corner badge pops in with a spinner or bouncing dots, then a check in the success tone before it resets. For forms, settings pages and add-to-cart actions. Use when the user asks for Async Action Button, 异步状态按钮, button, async, loading, save, submit, feedback or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/button-async-states"
  motif-item: "button-async-states"
  params-hash: "ee987114"
---

# Async Action Button (异步状态按钮)

One button for save and submit flows: the label morphs letter by letter into a loading word, a corner badge pops in with a spinner or bouncing dots, then a check in the success tone before it resets. For forms, settings pages and add-to-cart actions.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/button-async-states.tsx` — the component (`SaveButton`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-button-async-states`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/button-async-states/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SaveButton } from '@/components/motif/button-async-states/button-async-states'

<SaveButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `idleLabel` | Save | Save | ≤ 14 chars | Idle label |
| `loadingLabel` | Saving | Saving | ≤ 14 chars | Loading label |
| `successLabel` | Saved | Saved | ≤ 14 chars | Success label |
| `loadingStyle` | spinner | spinner | spinner / dots | Loading style |
| `color` | #fafafa | #fafafa | color | Button color |
| `successColor` | #fafafa | #fafafa | color | Success color |
| `duration` | 2.5 | 2.5 | 0.5–5 s (best 1–3) | Simulated wait when no onAction is passed |
| `resetDelay` | 2 | 2 | 1–5 s (best 1.5–3) | Reset delay |

## Rules

- Pass onAction returning a promise to drive the real loading state; without it the button simulates a wait of duration seconds. A status prop forces a state (used by demos).
- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
