---
name: motif-audio-playlist-player
description: "A track list beside the player: row numbers turn into play icons on hover and a tiny equaliser marks the playing track, with a seekable progress bar, times and a playback-speed menu. For podcast sites, sound libraries and product audio samples. Use when the user asks for Playlist Player, 播放列表播放器, audio, player, playlist, podcast, music, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/audio-playlist-player"
  motif-item: "audio-playlist-player"
  params-hash: "d8c3f2aa"
---

# Playlist Player (播放列表播放器)

A track list beside the player: row numbers turn into play icons on hover and a tiny equaliser marks the playing track, with a seekable progress bar, times and a playback-speed menu. For podcast sites, sound libraries and product audio samples.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/audio-playlist-player.tsx` — the component (`AudioPlaylistPlayer`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-audio-playlist-player`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/audio-playlist-player/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AudioPlaylistPlayer } from '@/components/motif/audio-playlist-player/audio-playlist-player'

<AudioPlaylistPlayer />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `layout` | playlist | playlist | playlist / single | Layout |
| `accent` | #fafafa | #fafafa | color | Progress color |
| `radius` | 14 | 14 | 0–24 px (best 8–20) | Corner radius |
| `speedControl` | menu | menu | menu / buttons / none | Speed control |
| `listWidth` | 256 | 256 | 200–320 px (best 220–300) | Track list width on wide containers |

## Rules

- Tracks without a src play on a silent simulated clock (for previews); pass src on each track for real audio.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from elevenlabs/ui).
