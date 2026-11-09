---
name: motif-ai-orb-face
description: "A glossy orb character with a slowly marbling interior whose eyes carry the assistant’s state: they follow the cursor, blink naturally, dart around while thinking, curve into happy arcs when done and spiral when something breaks. For AI assistant avatars, onboarding mascots and empty states. Use when the user asks for Orb Face, 表情球助手, ai, assistant, orb, character, mascot, eyes, webgl2, svg or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ai-orb-face"
  motif-item: "ai-orb-face"
  params-hash: "0156a7a8"
---

# Orb Face (表情球助手)

A glossy orb character with a slowly marbling interior whose eyes carry the assistant’s state: they follow the cursor, blink naturally, dart around while thinking, curve into happy arcs when done and spiral when something breaks. For AI assistant avatars, onboarding mascots and empty states.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/ai-orb-face.tsx` — the component (`AIOrbFace`); the tuned values are baked into its `defaults` object
- `assets/orb.tsx`
- `assets/shaders.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-ai-orb-face`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ai-orb-face/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AIOrbFace } from '@/components/motif/ai-orb-face/ai-orb-face'

<AIOrbFace />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `state` | idle | idle | idle / listening / thinking / streaming / done / error | State |
| `expression` | auto | auto | auto / neutral / alert / focused / content / doubtful / surprised / deadpan / cross / wink | Overrides the expression the state would pick |
| `bodyColor` | #df6ff1 | #df6ff1 | color | Body color |
| `edgeColor` | #fcf1fd | #fcf1fd | color | Keep it far lighter than the body so the marbling shows |
| `featureColor` | #1c1e2d | #1c1e2d | color | Eye color |
| `size` | 128 | 128 | 56–240 px (best 72–200) | Size |
| `gaze` | true | true | boolean | Turn off where many of them share a screen |
| `amplitude` | 0 | 0 | 0–1 | Voice level 0–1: stirs the interior, and the body breathes with it while listening. The demo adds it to a simulated voice |

## Rules

- The expression carries the state; do not stack a status badge or spinner on top of the face.
- Pass a MotionValue<number> as amplitude for live audio so a 60fps level never re-renders the component.
- Turn gaze off where several faces share a screen; each one is its own WebGL2 context.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 2; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
