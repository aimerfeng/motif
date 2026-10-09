---
name: motif-swipe-button
description: "A forest-green button that, on hover, is pushed out by an amber second layer with new copy and an arrow sliding in from below. Keyboard focus triggers it too, and the width never jumps when the text changes. Made for sign-up, booking and download calls to action. Use when the user asks for Swipe Button, 推扫按钮, button, cta, hover, swipe, slide, text-swap or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/swipe-button"
  motif-item: "swipe-button"
  params-hash: "36be7ab2"
---

# Swipe Button (推扫按钮)

A forest-green button that, on hover, is pushed out by an amber second layer with new copy and an arrow sliding in from below. Keyboard focus triggers it too, and the width never jumps when the text changes. Made for sign-up, booking and download calls to action.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/swipe-button.tsx` — the component (`SwipeButton`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-swipe-button`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/swipe-button/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SwipeButton } from '@/components/motif/swipe-button/swipe-button'

<SwipeButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Get early access | Get early access | ≤ 32 chars | Label |
| `hoverLabel` | Join the waitlist | Join the waitlist | ≤ 32 chars | Hover label |
| `arrow` | true | true | boolean | Arrow on hover |
| `direction` | up | up | up / down / left / right | Which side the second layer enters from |
| `duration` | 380 | 380 | 180–800 ms (best 240–560) | Duration |
| `radius` | 14 | 14 | 0–32 px (best 0–32) | Corner radius |
| `firstColor` | #0f3d2e | #0f3d2e | color | Base color |
| `firstInk` | #f2efe6 | #f2efe6 | color | Base text |
| `secondColor` | #f4b942 | #f4b942 | color | Hover color |
| `secondInk` | #0f3d2e | #0f3d2e | color | Hover text |

## Rules

- The first layer carries the accessible name; the second layer is aria-hidden decoration, so keep both texts conveying the same action.
- Keep both labels short (under about 24 characters) and let the button size itself; it is as wide as the longer label.
- Keep contrast of both layers above 4.5:1 for their text.
- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).
