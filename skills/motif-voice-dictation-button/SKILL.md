---
name: motif-voice-dictation-button
description: "A mic button that opens into a recording pill: a live waveform and timer, a transcript preview typing in beside it, cancel and stop controls, then a processing state that resolves into a tick or a cross. For voice input in search bars, notes and chat composers. Use when the user asks for Dictation Button, 语音输入按钮, voice, dictation, speech, microphone, waveform, transcript, input or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/voice-dictation-button"
  motif-item: "voice-dictation-button"
  params-hash: "5c6fd197"
---

# Dictation Button (语音输入按钮)

A mic button that opens into a recording pill: a live waveform and timer, a transcript preview typing in beside it, cancel and stop controls, then a processing state that resolves into a tick or a cross. For voice input in search bars, notes and chat composers.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/voice-dictation-button.tsx` — the component (`VoiceDictationButton`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-voice-dictation-button`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/voice-dictation-button/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { VoiceDictationButton } from '@/components/motif/voice-dictation-button/voice-dictation-button'

<VoiceDictationButton />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #f4f4f5 | #f4f4f5 | color | Waveform color |
| `size` | default | default | sm / default / lg | Size |
| `showTranscript` | true | true | boolean | Transcript preview |
| `showTimer` | true | true | boolean | Timer |
| `shortcut` | true | true | boolean | Shows the hint and listens for Alt + Space |
| `feedbackDuration` | 1500 | 1500 | 600–4000 ms (best 1000–2500) | Feedback duration |
| `barDensity` | fine | fine | fine / regular / bold | Bar density |
| `radius` | 6 | 6 | 0–22 px (best 4–22) | Corner radius |

## Rules

- UI only: there is no speech service inside. Drive state (idle / recording / processing / success / error) and transcript from your recognizer; the buttons call onStart, onStop and onCancel.
- The waveform is synthesized; pass levels (0..1 per bar, read each frame) to show real microphone data.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from elevenlabs/ui).
