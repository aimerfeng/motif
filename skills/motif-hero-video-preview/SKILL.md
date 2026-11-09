---
name: motif-hero-video-preview
description: "A split hero with badge, headline, email signup, benefit checklist and an avatar proof line on one side, and a video card with a pulsing play button and two bobbing chips on the other, over slowly drifting blurred blobs. Use when the user asks for Video Preview Hero, 视频预览主视觉, hero, video, split, signup, cta, motion or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/hero-video-preview"
  motif-item: "hero-video-preview"
  params-hash: "35562585"
---

# Video Preview Hero (视频预览主视觉)

A split hero with badge, headline, email signup, benefit checklist and an avatar proof line on one side, and a video card with a pulsing play button and two bobbing chips on the other, over slowly drifting blurred blobs.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/hero-video-preview.tsx` — the component (`HeroVideoPreview`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-hero-video-preview`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/hero-video-preview/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { HeroVideoPreview } from '@/components/motif/hero-video-preview/hero-video-preview'

<HeroVideoPreview />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `headline` | Transform Your Business Today | Transform Your Business Today | ≤ 56 chars | The last word gets the accent gradient |
| `accent` | #7c5cff | #7c5cff | color | Accent |
| `secondary` | #a855f7 | #a855f7 | color | Secondary |
| `tone` | dark | dark | dark / light | Tone |
| `mediaSide` | right | right | right / left | Video side |
| `showChips` | true | true | boolean | Floating chips |
| `floatAmplitude` | 10 | 10 | 0–20 px (best 4–16) | Float amplitude |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
