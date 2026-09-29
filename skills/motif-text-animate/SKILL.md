---
name: motif-text-animate
description: "Text that enters word by word, letter by letter or all at once, with ten animations from blur-rise to slide and scale. Made for hero headlines, section titles and pull quotes. Use when the user asks for Text Animate, 文字入场, text, stagger, reveal, headline, blur, typography or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-animate"
  motif-item: "text-animate"
  params-hash: "99220dd2"
---

# Text Animate (文字入场)

Text that enters word by word, letter by letter or all at once, with ten animations from blur-rise to slide and scale. Made for hero headlines, section titles and pull quotes.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-animate.tsx` — the component (`TextAnimate`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-animate/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TextAnimate } from '@/components/motif/text-animate/text-animate'

<TextAnimate />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Type that arrives with intent | Type that arrives with intent | ≤ 80 chars | Text |
| `animation` | blurInUp | blurInUp | blurInUp / blurInDown / blurIn / fadeIn / slideUp / slideDown / slideLeft / slideRight / scaleUp / scaleDown | Animation |
| `by` | word | word | word / character / text | Split by |
| `duration` | 0.6 | 0.6 | 0.1–2 s (best 0.3–1) | Segment duration |
| `spread` | 0.6 | 0.6 | 0–3 s (best 0.2–1.4) | Time between the first and last segment starting |
| `delay` | 0 | 0 | 0–3 s | Delay |
| `startOnView` | false | false | boolean | Start in viewport |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
