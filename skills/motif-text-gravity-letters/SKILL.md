---
name: motif-text-gravity-letters
description: "Letters detach one by one, tumble down with bounce and spin, pile up on the floor of their container, then spring back into the word on demand. For playful headers, empty states and 404 pages. Use when the user asks for Gravity Letters, 坠落字母, text, gravity, physics, bounce, letters, 404, hover or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-gravity-letters"
  motif-item: "text-gravity-letters"
  params-hash: "0eb49c2c"
---

# Gravity Letters (坠落字母)

Letters detach one by one, tumble down with bounce and spin, pile up on the floor of their container, then spring back into the word on demand. For playful headers, empty states and 404 pages.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-gravity-letters.tsx` — the component (`GravityLetters`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-gravity-letters`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-gravity-letters/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { GravityLetters } from '@/components/motif/text-gravity-letters/text-gravity-letters'

<GravityLetters />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Page not found | Page not found | ≤ 32 chars | Text |
| `fontSize` | 56 | 56 | 28–88 px (best 40–72) | Font size |
| `gravity` | 1200 | 1200 | 400–3000 (best 800–2000) | Gravity |
| `bounce` | 0.35 | 0.35 | 0–0.75 (best 0.2–0.5) | How much vertical speed survives each landing |
| `friction` | 0.4 | 0.4 | 0.05–0.9 (best 0.25–0.6) | Share of sideways speed and spin lost on each landing |
| `spread` | 140 | 140 | 0–400 (best 60–240) | Upper bound of the random sideways kick |
| `stagger` | 40 | 40 | 0–150 ms (best 20–80) | Stagger |
| `trigger` | hover | hover | hover / click / inView / manual | The demo autoplays; manual means the collapsed prop drives it |

## Rules

- Give the component a fixed height (for example className="h-48 w-full"): letters fall to the bottom edge of their own box, and the box clips them.
- The full text stays in an sr-only span, so screen readers always read it; hover and click triggers are keyboard focusable.
- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
