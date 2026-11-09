---
name: motif-input-number-scrub
description: "Press the label and drag sideways to scrub; the pointer locks so the drag never runs out, and Shift moves ten steps at a time. − / + buttons, the wheel, arrow keys and typed math like \"24*2\" work too, and the field nudges when it hits a limit. Made for design-tool inspectors, quantity pickers and settings. Use when the user asks for Scrubbable Number Field, 可拖拽数字输入框, number, input, scrub, spinbutton, stepper, inspector, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-number-scrub"
  motif-item: "input-number-scrub"
  params-hash: "1b493912"
---

# Scrubbable Number Field (可拖拽数字输入框)

Press the label and drag sideways to scrub; the pointer locks so the drag never runs out, and Shift moves ten steps at a time. − / + buttons, the wheel, arrow keys and typed math like "24*2" work too, and the field nudges when it hits a limit. Made for design-tool inspectors, quantity pickers and settings.

## When to use

- Use for numeric properties people tune by feel: design-tool inspectors (size, radius, rotation, opacity), quantity pickers, durations and other settings. For a value chosen from a visible range, prefer a slider.

## Files

- `assets/input-number-scrub.tsx` — the component (`InputNumberScrub`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-number-scrub`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-number-scrub/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { InputNumberScrub } from '@/components/motif/input-number-scrub/input-number-scrub'

<InputNumberScrub />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #4c9aff | #4c9aff | color | Accent |
| `size` | 32 | 32 | 28–44 px (best 30–40) | Height |
| `radius` | 8 | 8 | 0–22 px (best 3–22) | Anything above half the height is a pill |
| `buttonLayout` | split | split | split / end / stacked / none | Buttons |
| `labelPlacement` | inside | inside | inside / above | Label |
| `scrubSensitivity` | 3 | 3 | 1–12 px (best 2–6) | Pixels of drag per step; higher is finer |
| `meter` | true | true | boolean | While scrubbing or focused, a hairline along the bottom shows where the value sits between min and max |

## Rules

- The label is the scrub handle and the accessible name, so always pass label. With labelPlacement "inside" you can pass an icon (letter or SVG); the label text stays available to screen readers.
- The input is role="spinbutton" with aria-valuenow / min / max / valuetext. ArrowUp/Down step, Shift multiplies by largeStep (default step x 10), PageUp/PageDown step large, Home/End jump to min/max, Enter commits typed text, Escape reverts it. The -/+ buttons are tabIndex -1 because the keyboard already covers them.
- Give each field its own min, max, step and unit. Finite min and max are needed for the range meter. decimals defaults to the decimals of step.
- Use onValueChange for live preview and onValueCommit for undo history or saving (it fires on release, key press, button release and typed commits).
- Mouse scrubs request pointer lock (endless drag with a virtual cursor that wraps at the viewport edge). It falls back to a normal captured drag in Safari, on touch and inside iframes without allow-pointer-lock; pass pointerLock={false} to always use the fallback.
- Keep one accent per panel. Use short labels inside the field (W, H, X or an icon) and full words when the label sits above.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from mui/base-ui).
