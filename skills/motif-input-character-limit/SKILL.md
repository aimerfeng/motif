---
name: motif-input-character-limit
description: "An input or auto-growing textarea that counts characters inline or below, switches to “n left” near the limit and tints the counter and focus ring amber then red, with an optional small progress ring. Made for bios, short posts and SMS fields. Use when the user asks for Character Limit Counter, 字数限制计数, input, textarea, character-count, limit, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-character-limit"
  motif-item: "input-character-limit"
  params-hash: "00fe1cec"
---

# Character Limit Counter (字数限制计数)

An input or auto-growing textarea that counts characters inline or below, switches to “n left” near the limit and tints the counter and focus ring amber then red, with an optional small progress ring. Made for bios, short posts and SMS fields.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/input-character-limit.tsx` — the component (`InputCharacterLimit`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-character-limit`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-character-limit/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputCharacterLimit } from '@/components/motif/input-character-limit/input-character-limit'

<InputCharacterLimit />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `field` | textarea | textarea | input / textarea | Field |
| `maxLength` | 50 | 50 | 8–280 | Max length |
| `counter` | auto | auto | auto / fraction / remaining / ring | Counter |
| `counterPosition` | below | below | inline / below | Counter position |
| `warnAt` | 0.8 | 0.8 | 0.5–0.95 | Fraction of the limit where the counter turns amber |
| `autogrow` | true | true | boolean | Textarea only |
| `radius` | 6 | 6 | 0–16 px | Corner radius |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
