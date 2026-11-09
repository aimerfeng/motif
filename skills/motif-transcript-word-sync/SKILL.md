---
name: motif-transcript-word-sync
description: "A transcript that follows the audio word by word: spoken words brighten, the current word sits in a highlight pill and upcoming words stay muted; click any word to seek, with a scrub bar and elapsed / remaining time underneath. For podcast pages, meeting recaps and language-learning players. Use when the user asks for Synced Transcript, 逐词同步文字稿, audio, transcript, captions, podcast, karaoke, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/transcript-word-sync"
  motif-item: "transcript-word-sync"
  params-hash: "bb59dda1"
---

# Synced Transcript (逐词同步文字稿)

A transcript that follows the audio word by word: spoken words brighten, the current word sits in a highlight pill and upcoming words stay muted; click any word to seek, with a scrub bar and elapsed / remaining time underneath. For podcast pages, meeting recaps and language-learning players.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/transcript-word-sync.tsx` — the component (`TranscriptWordSync`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-transcript-word-sync`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/transcript-word-sync/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TranscriptWordSync } from '@/components/motif/transcript-word-sync/transcript-word-sync'

<TranscriptWordSync />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `highlight` | #fafafa | #fafafa | color | Current word |
| `accent` | #fafafa | #fafafa | color | Progress color |
| `fontSize` | 20 | 20 | 14–28 px (best 16–24) | Font size |
| `unspokenOpacity` | 0.5 | 0.5 | 0.35–0.75 (best 0.4–0.6) | Upcoming opacity |
| `rate` | 1 | 1 | 0.5–2 x (best 0.75–1.5) | Playback rate |
| `clickToSeek` | true | true | boolean | Click word to seek |
| `autoScroll` | true | true | boolean | Cap the height and keep the current word in view |
| `showScrubBar` | true | true | boolean | Show scrub bar |

## Rules

- Pass word timings as `words` ({ text, startTime, endTime } in seconds) or an ElevenLabs-style character `alignment`; with `audioSrc` the clock follows the <audio> element, without it a silent simulated clock runs (for previews).
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from elevenlabs/ui).
