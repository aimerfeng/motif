---
name: motif-dialog-onboarding-carousel
description: "A welcome dialog with artwork on top that changes per step, a title and text that slide with it, dot indicators, Skip and Next / Okay. Made for first-run onboarding and what’s-new tours. Use when the user asks for Onboarding Dialog, 新手引导弹窗, onboarding, dialog, modal, walkthrough, steps, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/dialog-onboarding-carousel"
  motif-item: "dialog-onboarding-carousel"
  params-hash: "f31257b5"
---

# Onboarding Dialog (新手引导弹窗)

A welcome dialog with artwork on top that changes per step, a title and text that slide with it, dot indicators, Skip and Next / Okay. Made for first-run onboarding and what’s-new tours.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/dialog-onboarding-carousel.tsx` — the component (`DialogOnboardingCarousel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-dialog-onboarding-carousel`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/dialog-onboarding-carousel/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DialogOnboardingCarousel } from '@/components/motif/dialog-onboarding-carousel/dialog-onboarding-carousel'

<DialogOnboardingCarousel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `steps` | 4 | 4 | 2–4 | Steps |
| `artStyle` | glow | glow | glow / grid | Art style |
| `transition` | slide | slide | slide / fade | Text transition |
| `indicator` | dots | dots | dots / pill | Indicator |
| `showSkip` | true | true | boolean | Show Skip |
| `radius` | 12 | 12 | 6–28 px (best 10–20) | Radius |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `finishLabel` | Okay | Okay | ≤ 16 chars | Finish label |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
