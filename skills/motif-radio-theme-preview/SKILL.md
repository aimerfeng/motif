---
name: motif-radio-theme-preview
description: "Light, dark and system options drawn as miniature app windows (sidebar, header and cards) with a check under the chosen one; System is split diagonally between both. Made for appearance settings and onboarding. Use when the user asks for Theme Preview Picker, 主题预览选择, theme, appearance, radio, dark mode, settings, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/radio-theme-preview"
  motif-item: "radio-theme-preview"
  params-hash: "7724c5ae"
---

# Theme Preview Picker (主题预览选择)

Light, dark and system options drawn as miniature app windows (sidebar, header and cards) with a check under the chosen one; System is split diagonally between both. Made for appearance settings and onboarding.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/radio-theme-preview.tsx` — the component (`ThemePreviewPicker`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-radio-theme-preview`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/radio-theme-preview/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ThemePreviewPicker } from '@/components/motif/radio-theme-preview/radio-theme-preview'

<ThemePreviewPicker />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `options` | all | all | all / pair | Options |
| `previewStyle` | app | app | app / page | Preview style |
| `accent` | #6366f1 | #6366f1 | color | Highlights inside the mini windows |
| `size` | 88 | 88 | 72–108 px | Width |
| `radius` | 6 | 6 | 0–14 px | Radius |
| `labelPosition` | start | start | start / center | Label position |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
