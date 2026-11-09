---
name: motif-text-typewriter
description: "Types a phrase one character at a time, pauses, deletes it and moves on to the next, with a line, block or underscore caret. For hero taglines, search placeholders and chat demos. Use when the user asks for Typewriter, 打字机, text, typewriter, typing, caret, headline, motion or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-typewriter"
  motif-item: "text-typewriter"
  params-hash: "3719b34f"
---

# Typewriter (打字机)

Types a phrase one character at a time, pauses, deletes it and moves on to the next, with a line, block or underscore caret. For hero taglines, search placeholders and chat demos.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-typewriter.tsx` — the component (`TypingAnimation`); the tuned values are baked into its `defaults` object
- `assets/text-typewriter.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-typewriter`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-typewriter/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TypingAnimation } from '@/components/motif/text-typewriter/text-typewriter'

<TypingAnimation />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `words` | Design,Build,Ship | Design,Build,Ship | ≤ 120 chars | Comma-separated, typed in order |
| `typeSpeed` | 100 | 100 | 30–250 ms (best 50–160) | Type interval |
| `deleteSpeed` | 50 | 50 | 15–200 ms (best 25–100) | Delete interval |
| `pauseDelay` | 1000 | 1000 | 300–3000 ms (best 600–2000) | Pause |
| `loop` | true | true | boolean | Loop |
| `cursorStyle` | line | line | line / block / underscore | Cursor |
| `showCursor` | true | true | boolean | Show cursor |
| `blinkCursor` | true | true | boolean | Blink cursor |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
