---
name: motif-live-transcription-aura
description: "A full-panel dictation screen: each recognised character blurs into focus, the unconfirmed tail stays dimmed until it is committed, the view keeps the newest line in sight, and a multi-color aurora pools and pulses along the bottom edge while listening. For meeting notes, live captions and voice journaling apps. Use when the user asks for Live Transcription, 实时转写, audio, speech-to-text, transcription, captions, dictation, aurora or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/live-transcription-aura"
  motif-item: "live-transcription-aura"
  params-hash: "ec15725b"
---

# Live Transcription (实时转写)

A full-panel dictation screen: each recognised character blurs into focus, the unconfirmed tail stays dimmed until it is committed, the view keeps the newest line in sight, and a multi-color aurora pools and pulses along the bottom edge while listening. For meeting notes, live captions and voice journaling apps.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/live-transcription-aura.tsx` — the component (`LiveTranscriptionAura`); the tuned values are baked into its `defaults` object
- `assets/live-transcription-aura.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-live-transcription-aura`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/live-transcription-aura/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LiveTranscriptionAura } from '@/components/motif/live-transcription-aura/live-transcription-aura'

<LiveTranscriptionAura />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `auraColors` | #22d3ee, #a855f7, #fb923c, #86efac, #c084fc | #22d3ee, #a855f7, #fb923c, #86efac, #c084fc | 2–5 colors | Used for the center pool, the two corners and the shimmer band; fewer colors wrap around |
| `auraIntensity` | 1 | 1 | 0.4–1.4 x (best 0.7–1.2) | Aura intensity |
| `blurAmount` | 3.5 | 3.5 | 0–10 px (best 2–6) | Character blur |
| `charDelay` | 0.012 | 0.012 | 0.004–0.04 s (best 0.008–0.024) | Character stagger |
| `fontSize` | 20 | 20 | 16–32 px (best 18–28) | Font size |
| `partialOpacity` | 0.6 | 0.6 | 0.35–0.8 (best 0.45–0.7) | The tail that is still being recognised |
| `align` | start | start | start / center | Alignment |
| `showControls` | true | true | boolean | The Stop button and shortcut hint shown while listening |

## Rules

- The component is controlled: feed it `status` (idle / connecting / connected), the committed segments and the current partial from any speech-to-text source; `onStart` / `onStop` are called from the buttons and Cmd/Ctrl+K.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from elevenlabs/ui).
