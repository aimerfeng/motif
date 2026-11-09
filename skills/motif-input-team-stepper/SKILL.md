---
name: motif-input-team-stepper
description: "A plus / minus stepper: each added seat pops an avatar into the overlapping stack while the number rolls, and hitting a limit gives the control a small shake. For team plans, party size and seat-based pricing. Use when the user asks for Team Size Stepper, 人数步进器, stepper, counter, avatar, team, seats, form or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-team-stepper"
  motif-item: "input-team-stepper"
  params-hash: "56254250"
---

# Team Size Stepper (人数步进器)

A plus / minus stepper: each added seat pops an avatar into the overlapping stack while the number rolls, and hitting a limit gives the control a small shake. For team plans, party size and seat-based pricing.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/input-team-stepper.tsx` — the component (`TeamSelector`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-team-stepper`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-team-stepper/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TeamSelector } from '@/components/motif/input-team-stepper/input-team-stepper'

<TeamSelector />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `min` | 1 | 1 | 1–3 | Minimum |
| `max` | 4 | 4 | 3–6 | Maximum |
| `overlap` | 12 | 12 | 0–20 px (best 6–16) | Avatar overlap |
| `avatarStyle` | neutral | neutral | neutral / gradient | Avatar style |
| `accent` | #a1a1aa | #a1a1aa | color | Used by gradient avatars and the focus ring |
| `spring` | visualDuration 0.3, bounce 0.25 | visualDuration 0.3, bounce 0.25 | visualDuration 0.05–4 s, bounce 0–0.9 | Pop spring |
| `shake` | true | true | boolean | Shake at limits |
| `label` | Team Size | Team Size | ≤ 24 chars | Label |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).
