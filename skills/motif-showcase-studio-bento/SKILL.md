---
name: motif-showcase-studio-bento
description: "A bento for studios and agencies: a featured case study, three outcome metrics, process steps with progress bars, a gallery of generated frames, a reel tile with a play badge and a strip of initial avatars. Tells a studio story in one screen. Use when the user asks for Studio Case Study Bento, 工作室案例便当格, bento, case study, agency, studio, portfolio, metrics or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/showcase-studio-bento"
  motif-item: "showcase-studio-bento"
  params-hash: "c6475a1f"
---

# Studio Case Study Bento (工作室案例便当格)

A bento for studios and agencies: a featured case study, three outcome metrics, process steps with progress bars, a gallery of generated frames, a reel tile with a play badge and a strip of initial avatars. Tells a studio story in one screen.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/showcase-studio-bento.tsx` — the component (`ShowcaseStudioBento`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-showcase-studio-bento`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/showcase-studio-bento/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { ShowcaseStudioBento } from '@/components/motif/showcase-studio-bento/showcase-studio-bento'

<ShowcaseStudioBento />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #8b7cf6 | #8b7cf6 | color | Accent |
| `tone` | dark | dark | dark / light | Tone |
| `galleryStyle` | gradient | gradient | gradient / shapes / lines | Frame style |
| `radius` | 16 | 16 | 4–28 px (best 10–24) | Radius |
| `density` | comfortable | comfortable | comfortable / compact | Density |
| `showReel` | true | true | boolean | Show reel tile |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
