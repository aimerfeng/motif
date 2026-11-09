---
name: motif-ai-approval-card
description: "A human-in-the-loop card an agent shows before it acts: the option you pick expands to fill the card while the alternatives collapse away, and destructive choices carry their own tone. For coding agents, workflow automation and admin copilots. Use when the user asks for Approval Card, 审批确认卡, ai, agent, approval, human-in-the-loop, confirm, chat or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ai-approval-card"
  motif-item: "ai-approval-card"
  params-hash: "f69f846c"
---

# Approval Card (审批确认卡)

A human-in-the-loop card an agent shows before it acts: the option you pick expands to fill the card while the alternatives collapse away, and destructive choices carry their own tone. For coding agents, workflow automation and admin copilots.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/ai-approval-card.tsx` — the component (`AiApprovalCard`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-ai-approval-card`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ai-approval-card/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AiApprovalCard } from '@/components/motif/ai-approval-card/ai-approval-card'

<AiApprovalCard />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `question` | How many flavours should we launch? | How many flavours should we launch? | ≤ 80 chars | Question |
| `options` | Three flavours \| core line; Five flavours \| full case; Just one hero | Three flavours \| core line; Five flavours \| full case; Just one hero | ≤ 200 chars | Separated by ";", text after "/" is the detail, a leading "!" marks it destructive; up to 5 |
| `accent` | #fafafa | #fafafa | color | Chosen color |
| `destructiveTone` | #f0524f | #f0524f | color | Destructive tone |
| `spring` | visualDuration 0.25, bounce 0.1 | visualDuration 0.25, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Pass `value` to control the decision (null = undecided) or let the card keep its own state; `onDecide` fires once with the chosen option.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
