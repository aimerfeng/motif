---
name: motif-text-weight-wave
description: "A light variable-weight headline: the letter under the pointer swells to the heaviest weight plus a same-color hairline outline, and its neighbours step up with distance, so a wave of weight follows the cursor. Made for portfolio name headers and type-forward landing pages. Use when the user asks for Weight Wave Text, 字重涟漪, text, variable font, font weight, hover, pointer, headline, portfolio, typography or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/outfit, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/text-weight-wave"
  motif-item: "text-weight-wave"
  params-hash: "ad8e5d69"
---

# Weight Wave Text (字重涟漪)

A light variable-weight headline: the letter under the pointer swells to the heaviest weight plus a same-color hairline outline, and its neighbours step up with distance, so a wave of weight follows the cursor. Made for portfolio name headers and type-forward landing pages.

## When to use

- A short display line people will point at: a name on a portfolio, a studio or product wordmark, a one- to three-word hero headline. Use it once per view.

## Files

- `assets/text-weight-wave.tsx` — the component (`WeightWaveText`); the tuned values are baked into its `defaults` object
- `assets/text-weight-wave.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-text-weight-wave`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/outfit clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/text-weight-wave/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/outfit';`, `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { WeightWaveText } from '@/components/motif/text-weight-wave/text-weight-wave'

<WeightWaveText />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Oona Marsh | Oona Marsh | ≤ 32 chars | Text |
| `font` | geist | geist | geist / fraunces / outfit / mono | All are variable fonts with a 100–900 weight axis |
| `size` | 136 | 136 | 56–200 px (best 80–176) | Size |
| `baseWeight` | 200 | 200 | 100–500 (best 120–360) | The weight of the whole line when the pointer is away |
| `peakWeight` | 900 | 900 | 600–900 (best 700–900) | The weight of the letter right under the pointer |
| `spread` | 1.8 | 1.8 | 0.6–4 x (best 1.1–3) | How far the swell reaches from the pointer, in multiples of the font size (1× is about two letters) |
| `strokeBoost` | 1.6 | 1.6 | 0–3 % (best 0.6–2.4) | A same-color outline on the crest that pushes it past the font’s heaviest weight, as a percentage of the font size; 0 turns it off |
| `letterPadding` | 6 | 6 | 0–14 % (best 2–10) | Extra room each side of the letters near the crest, as a percentage of the font size |
| `duration` | 0.5 | 0.5 | 0.15–1.2 s (best 0.3–0.8) | How long the weight takes to catch up with the pointer and to settle once it leaves |

## Rules

- Keep it to short display text (under about 24 characters) at 56px or larger; the effect is built for headlines, not paragraphs or buttons.
- Swelling letters widen the line by roughly half an em, so leave that much room at the end of the line; otherwise the last word can jump to the next line mid-hover.
- The full text is exposed to screen readers once; the per-letter spans are aria-hidden. Pass as="h1" (or another heading) when it is the page title.
- Only fonts with a real weight axis work; the built-in options all run 100–900. Under reduced motion the line stays at its resting weight.
- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
