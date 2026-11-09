---
name: motif-ai-feedback-bar
description: "An inline \"Was this helpful?\" bar under an answer: thumbs up pops and says thanks, thumbs down unfolds reason chips and an optional comment, and either path settles into a quiet confirmation. For AI answers, help-center articles and docs pages. Use when the user asks for Answer Feedback Bar, 回答反馈条, feedback, ai, chat, thumbs, rating, helpful, docs or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ai-feedback-bar"
  motif-item: "ai-feedback-bar"
  params-hash: "3915763a"
---

# Answer Feedback Bar (回答反馈条)

An inline "Was this helpful?" bar under an answer: thumbs up pops and says thanks, thumbs down unfolds reason chips and an optional comment, and either path settles into a quiet confirmation. For AI answers, help-center articles and docs pages.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/ai-feedback-bar.tsx` — the component (`AiFeedbackBar`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-ai-feedback-bar`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ai-feedback-bar/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AiFeedbackBar } from '@/components/motif/ai-feedback-bar/ai-feedback-bar'

<AiFeedbackBar />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `title` | Was this response helpful? | Was this response helpful? | ≤ 40 chars | Title |
| `reasons` | Inaccurate, Not what I asked, Too long, Outdated | Inaccurate, Not what I asked, Too long, Outdated | ≤ 120 chars | Comma-separated, up to 6 |
| `accent` | #a78bfa | #a78bfa | color | Accent |
| `radius` | 12 | 12 | 4–20 px (best 8–16) | Corner radius |
| `allowComment` | true | true | boolean | Comment field |
| `dismissible` | true | true | boolean | Close button |
| `celebrate` | true | true | boolean | Thumbs-up pop |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/prompt-kit).
