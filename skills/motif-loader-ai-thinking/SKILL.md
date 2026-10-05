---
name: motif-loader-ai-thinking
description: "A small mark plus a shimmering status line that rotates through messages and shows elapsed seconds once the wait passes two. Four marks: spark, orb, dots and sweep bar. For AI chats and any long-running generation. Use when the user asks for AI Thinking, AI 思考中, ai, thinking, loader, status, elapsed, chat, accessible or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/loader-ai-thinking"
  motif-item: "loader-ai-thinking"
  params-hash: "68eb458c"
---

# AI Thinking (AI 思考中)

A small mark plus a shimmering status line that rotates through messages and shows elapsed seconds once the wait passes two. Four marks: spark, orb, dots and sweep bar. For AI chats and any long-running generation.

## When to use

- Use in chat and generation UIs while a model works. Use loader-text-shimmer alone when only the sentence is needed; use progress-bar when real progress is known.

## Files

- `assets/loader-ai-thinking.tsx` — the component (`LoaderAiThinking`); the tuned values are baked into its `defaults` object
- `assets/loader-ai-thinking.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-loader-ai-thinking`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/loader-ai-thinking/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LoaderAiThinking } from '@/components/motif/loader-ai-thinking/loader-ai-thinking'

<LoaderAiThinking />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | spark | spark | spark / orb / dots / bar | Mark |
| `messages` | Thinking\|Reading your sources\|Drafting a reply | Thinking\|Reading your sources\|Drafting a reply | ≤ 120 chars | Separate with /; they rotate in order |
| `color` | #a78bfa | #a78bfa | color | Mark color |
| `textColor` | #a1a1aa | #a1a1aa | color | Text color |
| `size` | 18 | 18 | 12–40 px (best 14–28) | Mark size |
| `speed` | 1 | 1 | 0.5–2 x (best 0.7–1.5) | Speed |
| `interval` | 2.6 | 2.6 | 1.5–8 s (best 2–5) | Message interval |
| `showElapsed` | true | true | boolean | Appears after two seconds |
| `delay` | 0 | 0 | 0–1 s | Show delay |

## Rules

- Write specific messages for what the system is doing; rotate them slowly (2-5 s).
- Never fake progress: the sweep bar is intentionally indeterminate.
- The elapsed counter is aria-hidden so screen readers only hear the message change, not every second.
- Show it only after a short delay (~300 ms) so fast responses never flash a spinner.
- Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
