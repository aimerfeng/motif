---
name: motif-comment-pin
description: "A small avatar pin on the canvas that springs open into a full bubble with name, time and message, and closes on outside click or Escape. For collaborative editors, review tools and annotated mockups. Use when the user asks for Comment Pin, 评论气泡钉, comment, annotation, pin, collaboration, design-review, spring or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/comment-pin"
  motif-item: "comment-pin"
  params-hash: "e0bffd85"
---

# Comment Pin (评论气泡钉)

A small avatar pin on the canvas that springs open into a full bubble with name, time and message, and closes on outside click or Escape. For collaborative editors, review tools and annotated mockups.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/comment-pin.tsx` — the component (`CommentPin`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-comment-pin`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/comment-pin/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { CommentPin } from '@/components/motif/comment-pin/comment-pin'

<CommentPin />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `author` | Mira Okafor | Mira Okafor | ≤ 28 chars | Author |
| `message` | What happens if we adjust this to handle a light and dark mode? I'm not sure if we're ready to handle... | What happens if we adjust this to handle a light and dark mode? I'm not sure if we're ready to handle... | ≤ 160 chars | Message |
| `timestamp` | Just now | Just now | ≤ 16 chars | Timestamp |
| `width` | 180 | 180 | 160–280 px (best 172–240) | Open width |
| `accent` | #8b5cf6 | #8b5cf6 | color | Avatar color |
| `spring` | visualDuration 0.3, bounce 0.15 | visualDuration 0.3, bounce 0.15 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `openOnHover` | false | false | boolean | Open on hover |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
