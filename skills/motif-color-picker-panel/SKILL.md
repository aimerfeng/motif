---
name: motif-color-picker-panel
description: "A full color picker: saturation/brightness area, hue and opacity sliders, an eyedropper where the browser supports it, HEX / RGB / CSS / HSL output with an editable hex field, and a row of swatches. For theme editors, design tools and brand settings. Use when the user asks for Color Picker, 取色器, color, picker, hue, alpha, eyedropper, swatches, theme, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/color-picker-panel"
  motif-item: "color-picker-panel"
  params-hash: "e7dee82b"
---

# Color Picker (取色器)

A full color picker: saturation/brightness area, hue and opacity sliders, an eyedropper where the browser supports it, HEX / RGB / CSS / HSL output with an editable hex field, and a row of swatches. For theme editors, design tools and brand settings.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/color-picker-panel.tsx` — the component (`ColorPickerPanel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-color-picker-panel`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/color-picker-panel/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ColorPickerPanel } from '@/components/motif/color-picker-panel/color-picker-panel'

<ColorPickerPanel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `defaultColor` | #2563eb | #2563eb | color | Initial color |
| `format` | hex | hex | hex / rgb / css / hsl | Output format |
| `showAlpha` | true | true | boolean | Opacity slider |
| `showEyedropper` | true | true | boolean | Eyedropper |
| `swatches` | #ef4444, #f97316, #eab308, #22c55e, #14b8a6, #2563eb, #8b5cf6, #ec4899 | #ef4444, #f97316, #eab308, #22c55e, #14b8a6, #2563eb, #8b5cf6, #ec4899 | 1–10 colors | Swatches |
| `radius` | 6 | 6 | 0–14 px (best 4–10) | Radius |
| `width` | 320 | 320 | 260–384 px (best 288–360) | Width |

## Rules

- The parts (ColorPicker, ColorPickerSelection, ColorPickerHue, ColorPickerAlpha, ColorPickerEyeDropper, ColorPickerOutput, ColorPickerFormat, ColorPickerSwatches) are exported for custom layouts; ColorPickerPanel is the assembled default.
- The eyedropper uses the EyeDropper API (Chromium only) and is disabled elsewhere.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
