---
name: motif-hold-button
description: "Press and hold: color sweeps across the button and the action only confirms once it is full. A calm guard for destructive, irreversible actions. Use when the user asks for Hold Button, 长按确认按钮, button, hold, confirm, progress, destructive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/hold-button"
  motif-item: "hold-button"
  params-hash: "159fd2ca"
---

# Hold Button (长按确认按钮)

Press and hold: color sweeps across the button and the action only confirms once it is full. A calm guard for destructive, irreversible actions.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/hold-button.tsx` — the component (`HoldButton`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-hold-button`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/hold-button/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { HoldButton } from '@/components/motif/hold-button/hold-button'

<HoldButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `holdDuration` | 1.6 | 1.6 | 0.6–4 s (best 1–2.5) | Hold time |
| `color` | #f43f5e | #f43f5e | color | Color |
| `radius` | 14 | 14 | 4–28 px | Corner radius |
| `width` | 232 | 232 | 160–320 px | Width |
| `icon` | trash | trash | trash / power / lock | Icon |
| `label` | Hold to delete | Hold to delete | ≤ 24 chars | Label |
| `holdLabel` | Keep holding | Keep holding | ≤ 24 chars | Holding label |
| `doneLabel` | Deleted | Deleted | ≤ 24 chars | Done label |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).
