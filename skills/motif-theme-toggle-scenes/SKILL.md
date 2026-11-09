---
name: motif-theme-toggle-scenes
description: "A light / dark / system theme control in four genuinely different treatments: a sun carved into a moon by a travelling mask, a segmented pill, a sky-to-night switch whose track fills with stars behind a lit knob, and a glowing orb that turns into a cratered moon. For site headers and appearance settings. Use when the user asks for Scenic Theme Toggle, 场景主题切换, theme, dark-mode, toggle, switch, radiogroup, morph, sun, moon or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/theme-toggle-scenes"
  motif-item: "theme-toggle-scenes"
  params-hash: "e1c2841a"
---

# Scenic Theme Toggle (场景主题切换)

A light / dark / system theme control in four genuinely different treatments: a sun carved into a moon by a travelling mask, a segmented pill, a sky-to-night switch whose track fills with stars behind a lit knob, and a glowing orb that turns into a cratered moon. For site headers and appearance settings.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/theme-toggle-scenes.tsx` — the component (`ThemeToggleScenes`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-theme-toggle-scenes`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/theme-toggle-scenes/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ThemeToggleScenes } from '@/components/motif/theme-toggle-scenes/theme-toggle-scenes'

<ThemeToggleScenes />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | sun-moon | sun-moon | sun-moon / pill / switch / orb | Variant |
| `size` | md | md | sm / md / lg | Size |
| `showSystem` | true | true | boolean | Off: a plain light / dark toggle |
| `dayColor` | #f59e0b | #f59e0b | color | Sun glyph, pill icon and switch knob icon |
| `nightColor` | #818cf8 | #818cf8 | color | Moon glyph and pill icon |
| `spring` | visualDuration 0.25, bounce 0.1 | visualDuration 0.25, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `label` |  |  | ≤ 24 chars | Empty hides it; screen readers then hear "Theme" |

## Rules

- Visual only: it does not touch document classes. Wire theme / onThemeChange (controlled) or defaultTheme to your theme store, and resolve "system" with prefers-color-scheme yourself.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
