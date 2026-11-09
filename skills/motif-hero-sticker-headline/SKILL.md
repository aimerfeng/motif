---
name: motif-hero-sticker-headline
description: "Hover a highlighted phrase in the headline and little stickers pop out around it, each flying to its own spot with an overshoot spin, then tuck back. For travel, food and lifestyle landing pages. Use when the user asks for Sticker Headline, 贴纸标题, hero, headline, stickers, hover, travel, playful or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/hero-sticker-headline"
  motif-item: "hero-sticker-headline"
  params-hash: "3705c606"
---

# Sticker Headline (贴纸标题)

Hover a highlighted phrase in the headline and little stickers pop out around it, each flying to its own spot with an overshoot spin, then tuck back. For travel, food and lifestyle landing pages.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/hero-sticker-headline.tsx` — the component (`HeroStickerHeadline`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-hero-sticker-headline`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/hero-sticker-headline/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { HeroStickerHeadline } from '@/components/motif/hero-sticker-headline/hero-sticker-headline'

<HeroStickerHeadline />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `phraseOne` | Uncharted Adventures | Uncharted Adventures | ≤ 24 chars | First phrase |
| `phraseTwo` | Feel Alive | Feel Alive | ≤ 16 chars | Second phrase |
| `ctaLabel` | Begin your journey | Begin your journey | ≤ 24 chars | Button label |
| `accent` | #38bdf8 | #38bdf8 | color | First highlight |
| `accentTwo` | #f97316 | #f97316 | color | Second highlight |
| `stickerCount` | 4 | 4 | 2–4 | Stickers per phrase |
| `spread` | 1 | 1 | 0.5–1.6 (best 0.8–1.3) | Spread |
| `spin` | 1 | 1 | 0–1.8 (best 0.6–1.4) | Spin |
| `overshoot` | 1.8 | 1.8 | 1–2.6 (best 1.4–2.2) | Second control point of the easing curve; higher overshoots more |
| `autoplay` | true | true | boolean | Demo only: pops each phrase in turn until the pointer enters |

## Rules

- Keep each highlighted phrase short (one to three words) so the stickers sit around it, and swap the SVG stickers for ones that match your topic.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from codse/animata).
