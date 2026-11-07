---
name: motif-text-loop
description: "One word in a headline cycles in place, sliding, dropping, flipping or blurring to the next every few seconds and pausing on hover. Made for “built for …” hero lines and example prompts in search fields. Use when the user asks for Text Loop, 轮换词, text, rotating words, loop, headline, hero, motion or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/plus-jakarta-sans, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-loop"
  motif-item: "text-loop"
  params-hash: "f7ab0365"
---

# Text Loop (轮换词)

One word in a headline cycles in place, sliding, dropping, flipping or blurring to the next every few seconds and pausing on hover. Made for “built for …” hero lines and example prompts in search fields.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-loop.tsx` — the component (`TextLoop`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-loop`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/plus-jakarta-sans clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-loop/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/plus-jakarta-sans';` to the global stylesheet.
4. Use it:

```tsx
import { TextLoop } from '@/components/motif/text-loop/text-loop'

<TextLoop />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `items` | barbers, physios, piano teachers, dog groomers | barbers, physios, piano teachers, dog groomers | ≤ 160 chars | Comma-separated, shown in order and looped |
| `interval` | 2.4 | 2.4 | 1–6 s (best 1.6–4) | How long each item stays |
| `variant` | slide-up | slide-up | slide-up / slide-down / flip / blur | Transition |
| `spring` | visualDuration 0.45, bounce 0.15 | visualDuration 0.45, bounce 0.15 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `distance` | 50 | 50 | 10–100 % (best 25–70) | How far items travel in and out, as a percentage of the line height; Blur does not move |
| `blur` | 4 | 4 | 0–12 px (best 0–8) | Blur radius while entering and leaving |
| `clip` | true | true | boolean | Items fade out at the top and bottom of the line instead of drifting over nearby text |
| `pauseOnHover` | true | true | boolean | Pause on hover |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
