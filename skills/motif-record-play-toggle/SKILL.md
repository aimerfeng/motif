---
name: motif-record-play-toggle
description: "A play/pause control shaped like a spinning vinyl record, with a keyboard-seekable progress ring and a live bar waveform; the play and pause glyphs swap with a twist. For podcast, music and voice-note players. Use when the user asks for Record Toggle, 唱片播放键, audio, music, player, vinyl, toggle, waveform or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/record-play-toggle"
  motif-item: "record-play-toggle"
  params-hash: "8f8b4476"
---

# Record Toggle (唱片播放键)

A play/pause control shaped like a spinning vinyl record, with a keyboard-seekable progress ring and a live bar waveform; the play and pause glyphs swap with a twist. For podcast, music and voice-note players.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/record-play-toggle.tsx` — the component (`RecordPlayToggle`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-record-play-toggle`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/record-play-toggle/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { RecordPlayToggle } from '@/components/motif/record-play-toggle/record-play-toggle'

<RecordPlayToggle />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `playing` | true | true | boolean | Playing |
| `progress` | 0.35 | 0.35 | 0–1 | Progress |
| `size` | 96 | 96 | 64–140 px (best 72–120) | Record size |
| `bars` | 24 | 24 | 8–40 (best 12–32) | Waveform bars |
| `accent` | #ec4899 | #ec4899 | color | Progress color |
| `labelColor` | #ec4899 | #ec4899 | color | Label color |
| `spinSpeed` | 1 | 1 | 0.25–4 (best 0.5–2) | 1 = one turn every 15 s |

## Rules

- Visual only: there is no <audio> element. Drive playing / progress from your player and listen to onPlayingChange / onSeek; the progress ring is a role="slider" that becomes keyboard-focusable only when onSeek is passed.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
