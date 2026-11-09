---
name: motif-ai-reasoning-trace
description: "While the model reasons, a shimmering \"Thinking\" label and a live timer sit above reasoning that streams in and auto-scrolls under a fade. When the answer starts it folds into \"Thought for 9s\"; \"Answer now\" cuts it short. For reasoning-model chats and research assistants. Use when the user asks for Reasoning Trace, 思考过程折叠块, ai, reasoning, thinking, chat, collapsible, streaming, shimmer or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ai-reasoning-trace"
  motif-item: "ai-reasoning-trace"
  params-hash: "e9096221"
---

# Reasoning Trace (思考过程折叠块)

While the model reasons, a shimmering "Thinking" label and a live timer sit above reasoning that streams in and auto-scrolls under a fade. When the answer starts it folds into "Thought for 9s"; "Answer now" cuts it short. For reasoning-model chats and research assistants.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/ai-reasoning-trace.tsx` — the component (`ReasoningTrace`); the tuned values are baked into its `defaults` object
- `assets/ai-reasoning-trace.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-ai-reasoning-trace`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ai-reasoning-trace/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ReasoningTrace } from '@/components/motif/ai-reasoning-trace/ai-reasoning-trace'

<ReasoningTrace />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `label` | Thinking | Thinking | ≤ 32 chars | Thinking label |
| `accent` | #334155 | #334155 | color | Rail color |
| `shimmerSpeed` | 4 | 4 | 1.5–8 s (best 2.5–6) | Shimmer cycle |
| `streamSpeed` | 33 | 33 | 15–120 (best 25–70) | Demo only: characters per second |
| `autoCollapse` | true | true | boolean | Auto-collapse |
| `showTimer` | true | true | boolean | Show timer |
| `maxHeight` | 160 | 160 | 96–320 px (best 120–240) | Max height |
| `fadeMask` | true | true | boolean | Top fade |

## Rules

- Pass the streamed text as reasoning and toggle isStreaming; the panel opens when streaming starts and folds when it ends (autoCollapse). Pass seconds if you track elapsed time yourself, otherwise it is measured while streaming.
- onStop renders the "Answer now" link; hide it once the answer has started.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/prompt-kit).
