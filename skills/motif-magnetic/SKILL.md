---
name: motif-magnetic
description: "Buttons and icons drift toward the pointer as it approaches, then spring back when it leaves. A tactile touch for toolbars and calls to action. Use when the user asks for Magnetic, 磁吸, magnetic, hover, pointer, button, spring, interactive or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/magnetic"
  motif-item: "magnetic"
  params-hash: "4999e3cd"
---

# Magnetic (磁吸)

Buttons and icons drift toward the pointer as it approaches, then spring back when it leaves. A tactile touch for toolbars and calls to action.

## When to use

- Playful or editorial pages where the pointer is part of the experience.

## Files

- `assets/magnetic.tsx` — the component (`Magnetic`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-magnetic`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/magnetic/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { Magnetic } from '@/components/motif/magnetic/magnetic'

<Magnetic />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `intensity` | 0.5 | 0.5 | 0.1–1 (best 0.25–0.75) | How much of the pointer offset the element follows |
| `range` | 120 | 120 | 40–300 px (best 80–200) | How close the pointer must be to start pulling |
| `actionArea` | parent | parent | self / parent / global | Active area |
| `spring` | visualDuration 0.45, bounce 0.3 | visualDuration 0.45, bounce 0.3 | visualDuration 0.05–4 s, bounce 0–0.9 | Shorter is snappier, more bounce wobbles longer |

## Rules

- Never hide the system cursor on touch devices or in forms.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
