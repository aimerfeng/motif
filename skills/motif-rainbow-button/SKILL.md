---
name: motif-rainbow-button
description: "A slowly flowing rainbow shows through the button’s lower edge and spills into a soft glow beneath it. For upgrade, membership and AI actions that should be seen at a glance. Use when the user asks for Rainbow Button, 彩虹按钮, button, rainbow, gradient, glow, cta, upgrade or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/rainbow-button"
  motif-item: "rainbow-button"
  params-hash: "8727bc89"
---

# Rainbow Button (彩虹按钮)

A slowly flowing rainbow shows through the button’s lower edge and spills into a soft glow beneath it. For upgrade, membership and AI actions that should be seen at a glance.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/rainbow-button.tsx` — the component (`RainbowButton`); the tuned values are baked into its `defaults` object
- `assets/rainbow-button.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-rainbow-button`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/rainbow-button/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { RainbowButton } from '@/components/motif/rainbow-button/rainbow-button'

<RainbowButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Upgrade to Pro | Upgrade to Pro | ≤ 28 chars | Label |
| `colors` | #ff4242, #a0ff42, #40a1ff, #43d0ff, #a142fe | #ff4242, #a0ff42, #40a1ff, #43d0ff, #a142fe | 2–6 colors | Laid out in order as a gradient that wraps around seamlessly |
| `fill` | #ffffff | #ffffff | color | The label switches between light and dark ink to stay readable |
| `glow` | 1 | 1 | 0–1 (best 0.5–1) | Underglow |
| `borderWidth` | 2 | 2 | 1–4 px (best 1.5–3) | Edge width |
| `radius` | 12 | 12 | 4–32 px (best 6–24) | Corner radius |
| `size` | lg | lg | sm / md / lg | Size |
| `speed` | 2.4 | 2.4 | 1–8 s (best 1.6–5) | Cycle time |

## Rules

- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
