---
name: motif-glitch-text
description: "Text with a hairline RGB split that breaks into a short burst every few seconds: color channels jump apart, horizontal slices shift and the letters skew. A constant-wobble mode is included. Suits 404 pages, off-air notices and game or cyber-styled titles. Use when the user asks for Glitch Text, 信号故障文字, text, glitch, rgb split, chromatic aberration, 404, css or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/jetbrains-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/glitch-text"
  motif-item: "glitch-text"
  params-hash: "a9e37d67"
---

# Glitch Text (信号故障文字)

Text with a hairline RGB split that breaks into a short burst every few seconds: color channels jump apart, horizontal slices shift and the letters skew. A constant-wobble mode is included. Suits 404 pages, off-air notices and game or cyber-styled titles.

## When to use

- Headlines and short labels that deserve a moment of attention.

## Files

- `assets/glitch-text.tsx` — the component (`GlitchText`); the tuned values are baked into its `defaults` object
- `assets/glitch-text.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-glitch-text`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/jetbrains-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/glitch-text/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/jetbrains-mono';` to the global stylesheet.
4. Use it:

```tsx
import { GlitchText } from '@/components/motif/glitch-text/glitch-text'

<GlitchText />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `text` | Signal lost | Signal lost | ≤ 40 chars | Text |
| `mode` | bursts | bursts | bursts / constant | Pattern |
| `interval` | 2.6 | 2.6 | 0.6–6 s (best 1.2–4) | Bursts: time between glitches. Constant: length of one wobble |
| `intensity` | 7 | 7 | 1–15 % (best 3–10) | Largest displacement, as a percentage of the font size |
| `split` | 2 | 2 | 0–5 % (best 0.5–3) | How far the color channels sit apart between glitches, as a percentage of the font size |
| `slices` | true | true | boolean | Cut the color channels into shifting horizontal bands during a burst |
| `color` | #f5f5f4 | #f5f5f4 | color | Text color |
| `colorA` | #00d9ff | #00d9ff | color | Left channel |
| `colorB` | #ff2e88 | #ff2e88 | color | Right channel |

## Rules

- Animate a headline once per view, not on every re-render.
- Keep the text readable and selectable; never animate body copy.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from kokonut-labs/kokonutui).
