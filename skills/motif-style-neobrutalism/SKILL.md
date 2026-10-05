---
name: motif-style-neobrutalism
description: "Thick black outlines, blur-free hard shadows and flat saturated color: every element is a sticker that visibly presses into the page. For tools, creator sites and brands with an attitude. Use when the user asks for Neobrutalism, 新粗野主义, neobrutalism, brutalist, hard shadow, bold, tokens, design system or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/inter-tight, @fontsource-variable/manrope, @fontsource-variable/space-grotesk, @fontsource/archivo-black, @fontsource/ibm-plex-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-neobrutalism"
  motif-item: "style-neobrutalism"
  params-hash: "da3ede67"
---

# Neobrutalism (新粗野主义)

Thick black outlines, blur-free hard shadows and flat saturated color: every element is a sticker that visibly presses into the page. For tools, creator sites and brands with an attitude.

## When to use

- Use for tools, creator and indie-product sites, dashboards for playful audiences, and anything that should feel loud, honest and handmade rather than polished-corporate.
- Avoid for finance, healthcare or other contexts where the audience expects calm, restrained visuals.

## Files

- `assets/style-neobrutalism.tsx` — the component (`NeoBrutalism`); the tuned values are baked into its `defaults` object
- `assets/style-neobrutalism.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-neobrutalism`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/inter-tight @fontsource-variable/manrope @fontsource-variable/space-grotesk @fontsource/archivo-black @fontsource/ibm-plex-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-neobrutalism/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { NeoBrutalism } from '@/components/motif/style-neobrutalism/style-neobrutalism'

<NeoBrutalism />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #4d7cff | #4d7cff | color | Page ground, tints and button text color follow it |
| `radius` | 8 | 8 | 0–20 px (best 0–16) | Corner radius |
| `borderWidth` | 3 | 3 | 2–5 px (best 2–4) | Border width |
| `shadowOffset` | 5 | 5 | 2–10 px (best 3–8) | Shadow offset |
| `fontPairing` | bricolage | bricolage | bricolage / archivo / grotesk / plex | Font pairing |
| `density` | 1 | 1 | 0.85–1.2 x (best 0.9–1.15) | Density |
| `dots` | true | true | boolean | Dot grid ground |

## Rules

- Palette ratio: about 60% flat ground (a pale tint of the accent or warm cream), 25% white surfaces, 10% accent, 5% pop colors (yellow, pink, mint). Text and outlines are one near-black ink; never use gray borders.
- Every interactive or containing surface has an opaque outline (2-4px, same ink) and a hard offset shadow with zero blur in the same ink. Shadow offset is one token; hover shrinks the shadow to ~60% while translating the box by the removed amount, active shrinks it to zero.
- Fills are flat. No gradients, no glow, no blur, no translucency, no inner shadows. Depth comes only from the offset shadow and from overlap.
- Typography: a heavy display face (weight 800) with tight negative tracking for headings, a friendly humanist or mono face at weight 500 for body. Headings are sentence case; small labels are uppercase with wide tracking. Use one highlighter-style mark per screen, not more.
- Shape: one radius token for everything (0-16px); pills only for badges and switches. Cards may be rotated 1-3 degrees for a sticker feel, but never text blocks or form fields.
- Motion: fast and mechanical, 80-120ms, ease-out, only transform / box-shadow / background-color. No springs, no fades, no bounce. Reduced motion removes the transitions.
- Text on the accent color is chosen by contrast (ink or white), never a fixed color. Keep focus rings as a 3px solid ink outline with offset.
- Do not add gradients, drop shadows with blur, glassmorphism, thin 1px borders, or rounded-2xl soft cards; do not mix in a second shadow style.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ekmas/neobrutalism-components).
