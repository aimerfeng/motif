---
name: motif-ai-prompt
description: "The composer for a chat-style AI app: a textarea that grows with its content, attachment chips, a keyboard-friendly model picker, Enter to send, and a send button that turns into stop while a reply is generating. An optional banner sits on top. For assistants, writing tools and support bots. Use when the user asks for AI Prompt Input, AI 对话输入框, ai, chat, prompt, composer, textarea, model picker, attachments or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ai-prompt"
  motif-item: "ai-prompt"
  params-hash: "3af71081"
---

# AI Prompt Input (AI 对话输入框)

The composer for a chat-style AI app: a textarea that grows with its content, attachment chips, a keyboard-friendly model picker, Enter to send, and a send button that turns into stop while a reply is generating. An optional banner sits on top. For assistants, writing tools and support bots.

## When to use

- Use as the main input of a chat-style assistant: a new-chat page or the bottom of a conversation. For one-line search use a search field or command palette instead.

## Files

- `assets/ai-prompt.tsx` — the component (`AiPrompt`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-ai-prompt`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ai-prompt/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AiPrompt } from '@/components/motif/ai-prompt/ai-prompt'

<AiPrompt />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #ece8e1 | #ece8e1 | color | Send button, focus glow and selection marks |
| `surface` | soft | soft | soft / solid / outline | Surface |
| `radius` | 22 | 22 | 10–28 px (best 14–24) | Corner radius |
| `minHeight` | 64 | 64 | 44–120 px (best 52–96) | Min height |
| `maxHeight` | 220 | 220 | 140–360 px (best 180–300) | Past this the textarea scrolls |
| `placeholder` | Ask anything, or drop a file… | Ask anything, or drop a file… | ≤ 48 chars | Placeholder |
| `showBanner` | true | true | boolean | Banner |
| `banner` | Sable Deep is free on every plan this week | Sable Deep is free on every plan this week | ≤ 60 chars | Banner text |
| `sendOnEnter` | true | true | boolean | Shift + Enter adds a line; when off, Ctrl / ⌘ + Enter sends |

## Rules

- Handle onSubmit({ text, model, attachments }); while the reply streams set status="streaming" and handle onStop, which the send button turns into.
- Pass your own models as [{ id, name, description?, icon? }]; never use real vendors’ logos or marks unless you have the rights to them.
- Attachments come from the attach button (a real file input) or your own drop handler via attachments / onAttachmentsChange; each chip has a labelled remove button.
- Keyboard: Enter sends and Shift + Enter adds a line (or Ctrl / ⌘ + Enter when sendOnEnter is off); IME composition is respected. The model picker is a listbox: arrows, Home / End, Enter, Esc. Set menuSide="top" when the composer sits at the bottom of the screen.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).
