---
name: motif-showcase-now-playing
description: "A music-app hero: headline and buttons beside a frosted now-playing card with generated cover art, a moving progress bar, transport controls and a live equalizer, plus a playlist that swaps the card. For audio, podcast and streaming products. Use when the user asks for Now Playing Showcase, 正在播放展示区, music, player, now playing, glassmorphism, audio, streaming or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/showcase-now-playing"
  motif-item: "showcase-now-playing"
  params-hash: "5d3d7eeb"
---

# Now Playing Showcase (正在播放展示区)

A music-app hero: headline and buttons beside a frosted now-playing card with generated cover art, a moving progress bar, transport controls and a live equalizer, plus a playlist that swaps the card. For audio, podcast and streaming products.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/showcase-now-playing.tsx` — the component (`ShowcaseNowPlaying`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-showcase-now-playing`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/showcase-now-playing/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { ShowcaseNowPlaying } from '@/components/motif/showcase-now-playing/showcase-now-playing'

<ShowcaseNowPlaying />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #a78bfa | #a78bfa | color | Accent |
| `coverStyle` | aurora | aurora | aurora / sunset / glass | Cover style |
| `glassBlur` | 40 | 40 | 8–64 px (best 16–48) | Glass blur |
| `tone` | dark | dark | dark / light | Tone |
| `playing` | true | true | boolean | Start playing |
| `showEqualizer` | true | true | boolean | Show equalizer |

## Rules

- The player is a visual mock with no audio: wire the transport buttons and the playlist array to your real player state. Cover art is generated from the accent; never use real album art or streaming-service logos.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
