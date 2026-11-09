---
name: motif-button-ripple
description: "Each press sends a ring of ink out from the exact point of contact, with an optional idle pulse that invites the first click. For primary actions in forms, dialogs and mobile-style interfaces. Use when the user asks for Ripple Button, 涟漪按钮, button, ripple, pulse, click, feedback, material or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/button-ripple"
  motif-item: "button-ripple"
  params-hash: "b2baa607"
---

# Ripple Button (涟漪按钮)

Each press sends a ring of ink out from the exact point of contact, with an optional idle pulse that invites the first click. For primary actions in forms, dialogs and mobile-style interfaces.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/ripple-button.tsx` — the component (`RippleButton`); the tuned values are baked into its `defaults` object
- `assets/ripple-button.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-button-ripple`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/button-ripple/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { RippleButton } from '@/components/motif/button-ripple/ripple-button'

<RippleButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Confirm transfer | Confirm transfer | ≤ 28 chars | Label |
| `rippleColor` | #add8e6 | #add8e6 | color | Ripple color |
| `rippleDuration` | 600 | 600 | 250–1500 ms (best 400–900) | Ripple duration |
| `rippleOpacity` | 0.35 | 0.35 | 0.1–0.6 | Opacity of the ink when it first appears |
| `idlePulse` | true | true | boolean | Idle pulse |
| `variant` | pulse | pulse | pulse / ripple | Pulse style |
| `pulseColor` | #add8e680 | #add8e680 | color | Pulse color |
| `pulseDistance` | 8 | 8 | 2–20 px | Pulse distance |
| `pulseDuration` | 1.5 | 1.5 | 0.8–4 s | Pulse duration |
| `radius` | 8 | 8 | 0–32 px | Corner radius |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
