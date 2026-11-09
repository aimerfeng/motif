---
name: motif-input-exploding
description: "Every keystroke throws a small burst of particles — shapes, sparks or the glyph you just typed — out of the caret with gravity and spin before they fade. For playful sign-ups, search boxes and chat composers. Use when the user asks for Exploding Input, 爆字输入框, input, particles, typing, playful, form or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-exploding"
  motif-item: "input-exploding"
  params-hash: "a7f7e969"
---

# Exploding Input (爆字输入框)

Every keystroke throws a small burst of particles — shapes, sparks or the glyph you just typed — out of the caret with gravity and spin before they fade. For playful sign-ups, search boxes and chat composers.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/input-exploding.tsx` — the component (`ExplodingInput`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-exploding`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-exploding/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ExplodingInput } from '@/components/motif/input-exploding/input-exploding'

<ExplodingInput />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `particleSet` | shapes | shapes | shapes / sparks / glyphs | Particles |
| `color` | #6366f1 | #6366f1 | color | Color |
| `count` | 3 | 3 | 1–5 (best 2–4) | Per keystroke |
| `gravity` | 0.5 | 0.5 | -1–1 (best 0.2–0.8) | Negative floats upward |
| `horizontal` | left | left | left / center / right | Horizontal |
| `vertical` | top | top | top / center / bottom | Vertical |
| `duration` | 3 | 3 | 0.6–5 s (best 1.5–3.5) | Duration |
| `scale` | 1 | 1 | 0.5–2.5 (best 0.8–1.6) | Scale |
| `scaleVariation` | 30 | 30 | 0–80 % | Scale variation |
| `rotate` | true | true | boolean | Spin |

## Rules

- Place <ExplodingInput /> inside the same <label> as the input (after it); it finds the input and spawns from the caret on each input event.
- Purely decorative: particles are aria-hidden and nothing spawns when reduced motion is on.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from xxtomm/spell-ui).
