---
name: motif-podcast-show-site
description: "A site for a fictional science podcast: the latest episode in a hero player with an SVG waveform you can scrub and hover for time and chapter, then a chapter list and a transcript that lights up word by word, an episode list with chapter bars, hosts, a guest wall and subscribe options. A mini player docks at the bottom once you scroll past. For podcasts, radio shows and audio newsletters. Use when the user asks for Podcast Show Site, 播客节目站, podcast, audio, waveform, player, transcript, chapters, science, dark or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource-variable/manrope, @fontsource-variable/space-grotesk, @fontsource/ibm-plex-mono, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/podcast-show-site"
  motif-item: "podcast-show-site"
  params-hash: "ef163355"
---

# Podcast Show Site (播客节目站)

A site for a fictional science podcast: the latest episode in a hero player with an SVG waveform you can scrub and hover for time and chapter, then a chapter list and a transcript that lights up word by word, an episode list with chapter bars, hosts, a guest wall and subscribe options. A mini player docks at the bottom once you scroll past. For podcasts, radio shows and audio newsletters.

## When to use

- A home page for a podcast, radio show or audio newsletter built around listening: the latest episode in a hero player with a scrubbable waveform and chapter markers, then chapters with a synced transcript, an episode list, hosts, guests and subscribe options.
- Adapt it by editing data.ts (episodes with chapters in seconds, transcript lines with start times, hosts, guests). Playback is a simulated clock in the player store; to play real audio, call store.seek(audio.currentTime) from an <audio> timeupdate handler and map play/pause/rate to the element.

## Files

- `assets/podcast-show-site.tsx` — the component (`PodcastShowSite`); the tuned values are baked into its `defaults` object
- `assets/player.tsx`
- `assets/sections.tsx`
- `assets/listing.tsx`
- `assets/art.tsx`
- `assets/data.ts`
- `assets/theme.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-podcast-show-site`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource-variable/manrope @fontsource-variable/space-grotesk @fontsource/ibm-plex-mono @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/podcast-show-site/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/manrope';` to the global stylesheet.
4. Use it:

```tsx
import { PodcastShowSite } from '@/components/motif/podcast-show-site/podcast-show-site'

<PodcastShowSite />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `showName` | Control Group | Control Group | ≤ 24 chars | Used in the header, the hero title, the cover art and the footer; the monogram takes the first letters of the first two words |
| `tagline` | A weekly science show about experiments that went sideways, told by the people who ran them. | A weekly science show about experiments that went sideways, told by the people who ran them. | ≤ 140 chars | The line under the hero title; best kept to two lines |
| `accent` | #ff6a3d | #ff6a3d | color | The played part of the waveform, play buttons, cover art and the current chapter. Its lightness is adjusted (hue kept) wherever it is used as text, thin lines or a button fill, so it always stays legible |
| `coverStyle` | orbits | orbits | orbits / contours / halftone / monogram | Shared by the hero cover, the episode thumbnails and the mini player |
| `fontPairing` | broadcast | broadcast | broadcast / journal / lab / editorial | Font pairing |
| `dark` | true | true | boolean | Dark mode |
| `waveformDensity` | 18 | 18 | 10–30 (best 14–24) | Bars per 100px: fewer reads chunky, more reads fine-grained |
| `autoplayPreview` | true | true | boolean | Starts silent playback from the resume point on load (a simulated clock, no audio); never autoplays with reduced motion on |

## Rules

- The waveform is the hero. Keep it full width in the player card, symmetrical bars with rounded caps, and three layers from the same bars: unplayed (ink at ~20%), buffered (ink at ~33%) and played (accent). Chapter boundaries are a one-bar gap plus a labelled tick below.
- The accent is the only saturated color: played waveform, play buttons, the active chapter, the current transcript word underline and the follow button. Text in the accent uses --pc-accent-text and thin graphics use --pc-accent-ui, both derived for contrast; never put raw accent text on the background.
- Ink on any accent or cover fill is picked by luminance (inkOn); do not hard-code white text on the accent.
- Numbers that change while playing (elapsed, remaining, chapter times) use the mono face with tabular figures so they do not jitter.
- Everything that seeks is keyboard operable: the waveform is a role="slider" (arrows 5 s, PageUp/PageDown 30 s, Home/End, Space toggles), chapters and transcript timestamps are buttons, topic filters use aria-pressed.
- Performance: playback updates every frame, so components subscribe to coarse values (whole seconds, chapter index, word index) and paint the waveform clip, playhead and progress bars directly on the DOM. Do not lift the time into React state at the page level.
- Reduced motion: no autoplay, no entrance or layout animation, instant scrolling; pressing play still advances the clock because progress is information, not decoration.
- Copy is specific: episode numbers, dates, durations, real-sounding guests and affiliations, chapter titles that describe what happens. Cover art, avatars and the show mark are generated SVG and gradients; never use photos or real platform logos for subscribe buttons.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
