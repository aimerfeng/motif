---
name: motif-text-morph-letters
description: "When the text changes, letters shared by both words glide to their new positions while the rest fade out and in, so Monthly to Yearly reads as one fluid motion. For button labels, toggles and price switches. Use when the user asks for Letter Morph, 字母重组, text, morph, layout animation, letters, button label, motion or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource-variable/space-grotesk, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-morph-letters"
  motif-item: "text-morph-letters"
  params-hash: "ff70a423"
---

# Letter Morph (字母重组)

When the text changes, letters shared by both words glide to their new positions while the rest fade out and in, so Monthly to Yearly reads as one fluid motion. For button labels, toggles and price switches.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/text-morph-letters.tsx` — the component (`TextMorph`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-morph-letters`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource-variable/space-grotesk clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-morph-letters/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/jetbrains-mono';` to the global stylesheet.
4. Use it:

```tsx
import { TextMorph } from '@/components/motif/text-morph-letters/text-morph-letters'

<TextMorph />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `words` | Monthly, Yearly, Lifetime | Monthly, Yearly, Lifetime | ≤ 80 chars | Comma-separated and looped in order; used when no children are passed |
| `interval` | 1.8 | 1.8 | 0.8–5 s (best 1.2–3) | Interval |
| `stiffness` | 280 | 280 | 100–600 (best 180–420) | Stiffness |
| `damping` | 18 | 18 | 8–40 (best 12–28) | Damping |
| `enter` | fade | fade | fade / blur / rise | Enter / exit |
| `font` | Geist Variable | Geist Variable | Geist Variable / Inter Tight Variable / Space Grotesk Variable / Fraunces Variable / JetBrains Mono Variable | Font |
| `size` | 56 | 56 | 16–72 px (best 24–64) | Size |
| `weight` | 500 | 500 | 300–800 (best 400–700) | Weight |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/motion-primitives).
