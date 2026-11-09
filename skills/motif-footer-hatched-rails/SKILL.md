---
name: motif-footer-hatched-rails
description: "A footer framed by dashed vertical rails and a diagonal-hatch band, with a wordmark, social glyphs and copyright on the left and four link columns on the right. Quiet and technical, like the margin of a blueprint. Use when the user asks for Hatched Rail Footer, 斜纹边栏页脚, footer, links, hatch, columns, technical or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/footer-hatched-rails"
  motif-item: "footer-hatched-rails"
  params-hash: "31b056c8"
---

# Hatched Rail Footer (斜纹边栏页脚)

A footer framed by dashed vertical rails and a diagonal-hatch band, with a wordmark, social glyphs and copyright on the left and four link columns on the right. Quiet and technical, like the margin of a blueprint.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/footer-hatched-rails.tsx` — the component (`FooterHatchedRails`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-footer-hatched-rails`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/footer-hatched-rails/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { FooterHatchedRails } from '@/components/motif/footer-hatched-rails/footer-hatched-rails'

<FooterHatchedRails />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brand` | Meridian | Meridian | ≤ 16 chars | Brand name |
| `accent` | #3b82f6 | #3b82f6 | color | Mark color |
| `tone` | light | light | light / dark | Tone |
| `hatchAngle` | 45 | 45 | 15–75 | Hatch angle |
| `hatchDensity` | 6 | 6 | 4–16 | Hatch spacing |
| `columns` | 4 | 4 | 1–4 | Link columns |
| `showSocial` | true | true | boolean | Show social icons |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
