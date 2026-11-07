---
name: motif-morphing-text
description: "A set of words takes turns on stage; at each change the letters soften and bleed into one another like ink, then set into the next word. Suits poster-sized display type: tour cities, product lines, a short list of keywords. Use when the user asks for Morphing Text, 融化变形文字, text, morph, gooey, rotating words, display, svg filter or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource/archivo-black, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/morphing-text"
  motif-item: "morphing-text"
  params-hash: "b1952893"
---

# Morphing Text (融化变形文字)

A set of words takes turns on stage; at each change the letters soften and bleed into one another like ink, then set into the next word. Suits poster-sized display type: tour cities, product lines, a short list of keywords.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/morphing-text.tsx` — the component (`MorphingText`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-morphing-text`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource/archivo-black clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/morphing-text/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';` to the global stylesheet.
4. Use it:

```tsx
import { MorphingText } from '@/components/motif/morphing-text/morphing-text'

<MorphingText />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `words` | Lisbon, Berlin, Oslo, Vienna, Prague | Lisbon, Berlin, Oslo, Vienna, Prague | ≤ 120 chars | Comma-separated, played in order and looped; short words work best |
| `morphTime` | 1.5 | 1.5 | 0.5–3 s (best 0.9–2.2) | Morph time |
| `holdTime` | 1.4 | 1.4 | 0.3–4 s (best 0.8–2.5) | How long each word stays fully legible |
| `melt` | 8 | 8 | 3–16 % (best 5–12) | How far the letters soften mid-morph, as a percentage of the font size |
| `color` | #f3eee4 | #f3eee4 | color | Text color |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
