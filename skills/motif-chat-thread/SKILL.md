---
name: motif-chat-thread
description: "A full message thread: consecutive messages group into runs with a tail only on the last bubble, reactions pin to bubble corners, plus day and system markers, file chips and a typing indicator. Scroll up and a \"Jump to latest\" pill appears. For messaging, support chat and comment threads. Use when the user asks for Chat Thread, 聊天会话, chat, message, bubble, thread, messaging, reactions, typing or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/chat-thread"
  motif-item: "chat-thread"
  params-hash: "bee7d99e"
---

# Chat Thread (聊天会话)

A full message thread: consecutive messages group into runs with a tail only on the last bubble, reactions pin to bubble corners, plus day and system markers, file chips and a typing indicator. Scroll up and a "Jump to latest" pill appears. For messaging, support chat and comment threads.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/chat-thread.tsx` — the component (`ChatThread`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-chat-thread`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/chat-thread/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ChatThread } from '@/components/motif/chat-thread/chat-thread'

<ChatThread />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `bubbleStyle` | default | default | default / tinted / secondary / outline | My bubbles |
| `accent` | #8b7cf6 | #8b7cf6 | color | Accent |
| `radius` | 16 | 16 | 6–22 px (best 10–20) | Bubble radius |
| `density` | comfortable | comfortable | comfortable / compact | Density |
| `showReactions` | true | true | boolean | Reactions |
| `showAvatars` | true | true | boolean | Avatars |
| `spring` | visualDuration 0.35, bounce 0.2 | visualDuration 0.35, bounce 0.2 | visualDuration 0.05–4 s, bounce 0–0.9 | Entrance spring |
| `autoplay` | true | true | boolean | Messages arrive one by one in the demo |

## Rules

- Pass messages as items (message / day / system); consecutive messages from the same author are grouped automatically, so keep author names stable.
- The viewport sticks to the bottom only while the reader is at the bottom; do not force-scroll when they have scrolled up.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcn-ui/ui).
