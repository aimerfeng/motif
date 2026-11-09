---
name: motif-button-ink-fill
description: "On hover an ink circle grows from the exact point where the pointer entered, follows it while inside, and shrinks back out through the exit point while the label inverts. For primary CTAs on bold, editorial sites. Use when the user asks for Ink Fill Button, 墨水填充按钮, button, hover, ripple, ink, fill, cta or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/button-ink-fill"
  motif-item: "button-ink-fill"
  params-hash: "2c174282"
---

# Ink Fill Button (墨水填充按钮)

On hover an ink circle grows from the exact point where the pointer entered, follows it while inside, and shrinks back out through the exit point while the label inverts. For primary CTAs on bold, editorial sites.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/button-ink-fill.tsx` — the component (`ButtonInkFill`); the tuned values are baked into its `defaults` object
- `assets/button-ink-fill.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-button-ink-fill`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/button-ink-fill/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ButtonInkFill } from '@/components/motif/button-ink-fill/button-ink-fill'

<ButtonInkFill />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Subscribe to the letter | Subscribe to the letter | ≤ 28 chars | Label |
| `fill` | #cbfe7e | #cbfe7e | color | The label picks light or dark ink from it |
| `inkColor` | #000000 | #000000 | color | The label inverts to light or dark ink over it |
| `size` | md | md | sm / md / lg | Size |
| `radius` | 999 | 999 | 0–999 px | Corner radius |
| `duration` | 0.25 | 0.25 | 0.15–0.8 s (best 0.2–0.5) | Duration |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).
