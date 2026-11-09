---
name: motif-navbar-ai-chat
description: "A chat app top bar with a model picker listing invented models with a one-line strength each, a temporary-chat button and the account menu. Made for assistants and model playgrounds. Use when the user asks for AI Chat Header, AI 对话顶栏, navbar, header, ai, chat, model picker, select, user menu or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/navbar-ai-chat"
  motif-item: "navbar-ai-chat"
  params-hash: "a8a8af45"
---

# AI Chat Header (AI 对话顶栏)

A chat app top bar with a model picker listing invented models with a one-line strength each, a temporary-chat button and the account menu. Made for assistants and model playgrounds.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/navbar-ai-chat.tsx` — the component (`NavbarAiChat`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-navbar-ai-chat`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/navbar-ai-chat/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { NavbarAiChat } from '@/components/motif/navbar-ai-chat/navbar-ai-chat'

<NavbarAiChat />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `model` | orion-alpha-45 | orion-alpha-45 | orion-alpha-45 / orion-code-4 / nova-chat-4 / galaxy-max-4 | Default model |
| `showDescriptions` | true | true | boolean | Show descriptions |
| `showTemporaryChat` | true | true | boolean | Temporary chat button |
| `height` | 64 | 64 | 48–80 px (best 56–72) | Height |
| `radius` | 8 | 8 | 0–18 px (best 4–12) | Radius |
| `accent` | #6366f1 | #6366f1 | color | Accent |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
