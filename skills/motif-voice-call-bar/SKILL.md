---
name: motif-voice-call-bar
description: "A control bar for talking to a voice agent: a live waveform with the agent’s name, then mute, keyboard and call buttons. The keyboard slides open a text box for typed messages and the call button turns into end-call, with connecting, connected and error states. For support widgets, voice-first apps and in-product assistants. Use when the user asks for Voice Call Bar, 语音通话控制条, voice, call, agent, waveform, assistant, support, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/voice-call-bar"
  motif-item: "voice-call-bar"
  params-hash: "9a8d1a10"
---

# Voice Call Bar (语音通话控制条)

A control bar for talking to a voice agent: a live waveform with the agent’s name, then mute, keyboard and call buttons. The keyboard slides open a text box for typed messages and the call button turns into end-call, with connecting, connected and error states. For support widgets, voice-first apps and in-product assistants.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/voice-call-bar.tsx` — the component (`VoiceCallBar`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-voice-call-bar`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/voice-call-bar/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { VoiceCallBar } from '@/components/motif/voice-call-bar/voice-call-bar'

<VoiceCallBar />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `agentName` | Customer Support | Customer Support | ≤ 24 chars | Shown in the waveform slot while idle |
| `accent` | #fafafa | #fafafa | color | Send button and focus ring |
| `surface` | #0a0a0a | #0a0a0a | color | Surface |
| `waveColor` | #d4d4d8 | #d4d4d8 | color | Waveform color |
| `radius` | 14 | 14 | 4–24 px (best 8–20) | Corner radius |
| `width` | 448 | 448 | 280–560 px (best 320–512) | Max width |
| `allowTyping` | true | true | boolean | Allow typing |
| `position` | inline | inline | inline / floating | Floating pins it to the bottom of the nearest positioned parent |

## Rules

- Not wired to any voice SDK: pass onStartSession (return a promise to show "connecting"; reject for the error state), onEndSession and onSendMessage, or control status yourself.
- Pass an AnalyserNode as analyser to draw the real microphone or agent audio; without it the waveform is simulated.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from elevenlabs/ui).
