---
name: motif-blur-fade
description: "Content drifts in out of a soft blur and snaps into focus, like a lens finding its subject. Ideal for staggered entrances of headlines, cards and whole sections. Use when the user asks for Blur Fade, 模糊淡入, blur, fade, entrance, reveal, stagger or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/blur-fade"
  motif-item: "blur-fade"
  params-hash: "3d936539"
---

# Blur Fade (模糊淡入)

Content drifts in out of a soft blur and snaps into focus, like a lens finding its subject. Ideal for staggered entrances of headlines, cards and whole sections.

## When to use

- Moments that swap one image, slide or view for another.

## Files

- `assets/blur-fade.tsx` — the component (`BlurFade`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-blur-fade`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/blur-fade/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { BlurFade } from '@/components/motif/blur-fade/blur-fade'

<BlurFade />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Craft the moments between screens | Craft the moments between screens | ≤ 60 chars | Demo only |
| `duration` | 0.9 | 0.9 | 0.2–2.5 s (best 0.5–1.4) | Duration |
| `delay` | 0 | 0 | 0–3 s | Stagger several elements with it |
| `ease` | 0.22, 1, 0.36, 1 | 0.22, 1, 0.36, 1 | cubic-bezier, x 0–1, y -0.6–1.6 | Easing |
| `direction` | up | up | up / down / left / right | Direction |
| `offset` | 16 | 16 | 0–80 px (best 6–36) | Travel distance |
| `blur` | 10 | 10 | 0–30 px (best 4–18) | Start blur |
| `inView` | false | false | boolean | Plays once, when scrolled into view |

## Rules

- Keep transitions under ~800 ms for UI; longer only for showcase sequences.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
