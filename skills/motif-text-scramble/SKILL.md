---
name: motif-text-scramble
description: "Text starts as a churn of random glyphs and resolves into the real copy one character at a time, the unresolved ones tinted. Suits terminal-style headings, status lines and hover easter eggs. Use when the user asks for Text Scramble, 乱码解码, text, scramble, decode, terminal, hover, glitch or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-scramble"
  motif-item: "text-scramble"
  params-hash: "ea6f0f2b"
---

# Text Scramble (乱码解码)

Text starts as a churn of random glyphs and resolves into the real copy one character at a time, the unresolved ones tinted. Suits terminal-style headings, status lines and hover easter eggs.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-scramble.tsx` — the component (`TextScramble`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-scramble/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TextScramble } from '@/components/motif/text-scramble/text-scramble'

<TextScramble />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Decrypting the signal | Decrypting the signal | ≤ 60 chars | Text |
| `duration` | 1.4 | 1.4 | 0.3–4 s (best 0.6–2.5) | Duration |
| `rate` | 24 | 24 | 6–60 (best 12–40) | How many times per second the random glyphs change |
| `order` | random | random | random / sequential | Resolve order |
| `characterSet` | symbols | symbols | symbols / letters / binary / hex | Glyphs |
| `glyphColor` | #7dd3fc | #7dd3fc | color | Glyph color |
| `replayOnHover` | true | true | boolean | Replay on hover |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
