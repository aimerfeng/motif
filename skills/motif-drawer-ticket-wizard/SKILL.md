---
name: motif-drawer-ticket-wizard
description: "A side drawer that walks through creating a support ticket in three steps: type and category as radio cards, then priority and description, then a review summary before submitting. Step indicator, back / continue buttons, trapped focus and Esc to close. For help desks and internal tools. Use when the user asks for Ticket Wizard Drawer, 工单向导抽屉, drawer, sheet, wizard, stepper, form, radio-cards, ticket, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/drawer-ticket-wizard"
  motif-item: "drawer-ticket-wizard"
  params-hash: "4b27727f"
---

# Ticket Wizard Drawer (工单向导抽屉)

A side drawer that walks through creating a support ticket in three steps: type and category as radio cards, then priority and description, then a review summary before submitting. Step indicator, back / continue buttons, trapped focus and Esc to close. For help desks and internal tools.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/drawer-ticket-wizard.tsx` — the component (`TicketWizardDrawer`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-drawer-ticket-wizard`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/drawer-ticket-wizard/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TicketWizardDrawer } from '@/components/motif/drawer-ticket-wizard/drawer-ticket-wizard'

<TicketWizardDrawer />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #3b82f6 | #3b82f6 | color | Accent |
| `side` | right | right | right / left | Side |
| `width` | 512 | 512 | 380–640 px (best 440–560) | On narrow screens the drawer fills the width |
| `stepStyle` | bars | bars | bars / numbers / none | Step indicator |
| `radius` | 6 | 6 | 0–16 px (best 4–10) | Corner radius |
| `tone` | solid | solid | solid / tinted | Selected card |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
