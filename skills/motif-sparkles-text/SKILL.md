---
name: motif-sparkles-text
description: "Four-pointed stars twinkle and turn around the text, each one moving on after a couple of flashes. Made for small celebrations: inbox zero, a milestone reached, a feature unlocked. Use when the user asks for Sparkles Text, 星光文字, text, sparkles, stars, celebration, twinkle, headline or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/sparkles-text"
  motif-item: "sparkles-text"
  params-hash: "380639bc"
---

# Sparkles Text (星光文字)

Four-pointed stars twinkle and turn around the text, each one moving on after a couple of flashes. Made for small celebrations: inbox zero, a milestone reached, a feature unlocked.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/sparkles-text.tsx` — the component (`SparklesText`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-sparkles-text`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/sparkles-text/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { SparklesText } from '@/components/motif/sparkles-text/sparkles-text'

<SparklesText />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Inbox zero | Inbox zero | ≤ 40 chars | Text |
| `colors` | #ffd479, #ff9fc5 | #ffd479, #ff9fc5 | 1–4 colors | Each sparkle picks one of these at random |
| `count` | 10 | 10 | 3–24 (best 6–16) | Count |
| `size` | 1 | 1 | 0.5–1.8 x (best 0.7–1.4) | Scales with the font size |
| `speed` | 1 | 1 | 0.4–2.5 x (best 0.6–1.6) | Twinkle speed |
| `spread` | 45 | 45 | 10–100 % (best 25–70) | How far from the text sparkles may appear, as a percentage of the text height |
| `seed` | 2 | 2 | seed | Change it to reshuffle positions and timing |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
